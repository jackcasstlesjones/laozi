CREATE TABLE "food_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	"recipe_slug" text,
	"name" text NOT NULL,
	"kcal" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_log_kcal_range" CHECK ("kcal" between 0 and 10000),
	CONSTRAINT "food_log_quantity_positive" CHECK ("quantity" between 1 and 1000),
	CONSTRAINT "food_log_name_not_blank" CHECK (length(trim("name")) > 0)
);
--> statement-breakpoint
CREATE INDEX "food_log_date_idx" ON "food_log" ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "food_log_date_recipe_unique" ON "food_log" ("date","recipe_slug") WHERE "recipe_slug" is not null;