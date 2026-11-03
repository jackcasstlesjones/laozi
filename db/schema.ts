import { sql } from "drizzle-orm"
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// ---------------------------------------------------------------------------
// Better Auth core tables. TS keys must match Better Auth's field names.
// ---------------------------------------------------------------------------

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...timestamps,
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
)

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
})

// ---------------------------------------------------------------------------
// App tables. Single user, so no user_id columns.
// ---------------------------------------------------------------------------

/** One weigh-in per calendar date; kg to one decimal place, 30–300. */
export const weighIn = pgTable(
  "weigh_in",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    date: date("date", { mode: "string" }).notNull().unique(),
    weightKg: numeric("weight_kg", {
      precision: 4,
      scale: 1,
      mode: "number",
    }).notNull(),
    ...timestamps,
  },
  (t) => [check("weigh_in_weight_range", sql`${t.weightKg} between 30 and 300`)]
)

/** User settings: exactly one row (id = 1). goal_kg null means no goal set. */
export const goalSettings = pgTable(
  "goal_settings",
  {
    id: integer("id").primaryKey().default(1),
    goalKg: numeric("goal_kg", { precision: 4, scale: 1, mode: "number" }),
    rateKgPerWeek: numeric("rate_kg_per_week", {
      precision: 3,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0.5),
    /** Daily calorie limit for the Food tab; null means no limit. */
    dailyKcalLimit: integer("daily_kcal_limit"),
    ...timestamps,
  },
  (t) => [
    check("goal_settings_singleton", sql`${t.id} = 1`),
    check(
      "goal_settings_kcal_limit_range",
      sql`${t.dailyKcalLimit} is null or ${t.dailyKcalLimit} between 500 and 10000`
    ),
    check(
      "goal_settings_goal_range",
      sql`${t.goalKg} is null or ${t.goalKg} between 30 and 300`
    ),
    check(
      "goal_settings_rate_range",
      sql`${t.rateKgPerWeek} > 0 and ${t.rateKgPerWeek} <= 2`
    ),
  ]
)

/**
 * Calories eaten, per local calendar date. Recipe rows (recipe_slug set) hold a
 * count per day; custom rows (recipe_slug null) are one-offs. name and kcal are
 * snapshots taken when the entry was added.
 */
export const foodLog = pgTable(
  "food_log",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    date: date("date", { mode: "string" }).notNull(),
    recipeSlug: text("recipe_slug"),
    name: text("name").notNull(),
    kcal: integer("kcal").notNull(),
    quantity: integer("quantity").notNull().default(1),
    ...timestamps,
  },
  (t) => [
    index("food_log_date_idx").on(t.date),
    uniqueIndex("food_log_date_recipe_unique")
      .on(t.date, t.recipeSlug)
      .where(sql`${t.recipeSlug} is not null`),
    check("food_log_kcal_range", sql`${t.kcal} between 0 and 10000`),
    check("food_log_quantity_positive", sql`${t.quantity} between 1 and 1000`),
    check("food_log_name_not_blank", sql`length(trim(${t.name})) > 0`),
  ]
)
