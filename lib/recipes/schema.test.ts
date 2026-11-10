import { describe, expect, it } from "vitest"

import {
  filterAndSort,
  isRecipePath,
  parseRecipeFiles,
  pickVariant,
  variantNames,
  variantsOf,
} from "./schema"

const tuna = {
  name: "Tuna Egg Hash",
  kcal: 575,
  serving: "1 portion",
  macros: { protein_g: 75, carbs_g: 8, fat_g: 25 },
  ingredients: [{ item: "Tuna in brine (2 tins)", kcal: 220 }],
}
const gyoza = {
  name: "Assorted Gyozas",
  kcal: 40,
  serving: "1 gyoza",
  macros: { protein_g: 2, carbs_g: 5, fat_g: 1.4 },
  notes: "Average of three products",
  tags: ["snack"],
}

describe("parseRecipeFiles", () => {
  it("parses valid files, slugs from the file name, ignores unknown fields", () => {
    const r = parseRecipeFiles([
      {
        name: "tuna-egg-hash.json",
        text: JSON.stringify({ ...tuna, extra: 1 }),
      },
    ])
    expect(r.skipped).toBe(0)
    expect(r.recipes[0].slug).toBe("tuna-egg-hash")
    expect(r.recipes[0]).not.toHaveProperty("extra")
  })
  it("skips invalid JSON and schema mismatches", () => {
    const r = parseRecipeFiles([
      { name: "a.json", text: "{nope" },
      {
        name: "b.json",
        text: JSON.stringify({ meal: "old format", total_kcal: 500 }),
      },
      { name: "c.json", text: JSON.stringify(gyoza) },
    ])
    expect(r.skipped).toBe(2)
    expect(r.recipes.map((x) => x.name)).toEqual(["Assorted Gyozas"])
  })
})

describe("filterAndSort", () => {
  const { recipes } = parseRecipeFiles([
    { name: "t.json", text: JSON.stringify(tuna) },
    { name: "g.json", text: JSON.stringify(gyoza) },
  ])
  it("sorts by name or kcal", () => {
    expect(filterAndSort(recipes, "", "name").map((r) => r.name)).toEqual([
      "Assorted Gyozas",
      "Tuna Egg Hash",
    ])
    expect(filterAndSort(recipes, "", "kcal").map((r) => r.kcal)).toEqual([
      40, 575,
    ])
  })
  it("searches name, tags and ingredients case-insensitively", () => {
    expect(filterAndSort(recipes, "TUNA", "name")).toHaveLength(1)
    expect(filterAndSort(recipes, "snack", "name")[0].name).toBe(
      "Assorted Gyozas"
    )
    expect(filterAndSort(recipes, "brine", "name")[0].name).toBe(
      "Tuna Egg Hash"
    )
    expect(filterAndSort(recipes, "pizza", "name")).toEqual([])
  })
})

describe("variants", () => {
  const { recipes } = parseRecipeFiles([
    { name: "tuna-egg-hash.json", text: JSON.stringify(tuna) },
    {
      name: "smashes/ham-egg/basic.json",
      text: JSON.stringify({ ...tuna, name: "Ham & Egg Smash" }),
    },
    {
      name: "smashes/ham-egg/full.json",
      text: JSON.stringify({ ...tuna, name: "Ham, Egg & Cress Smash" }),
    },
    {
      name: "smashes/green-goddess/full.json",
      text: JSON.stringify({ ...tuna, name: "Green Goddess Smash" }),
    },
  ])

  it("slugs and groups files in folders as variants", () => {
    expect(recipes.map((r) => [r.slug, r.group, r.variant])).toEqual([
      ["tuna-egg-hash", null, null],
      ["smashes-ham-egg-basic", "smashes/ham-egg", "basic"],
      ["smashes-ham-egg-full", "smashes/ham-egg", "full"],
      ["smashes-green-goddess-full", "smashes/green-goddess", "full"],
    ])
    expect(variantNames(recipes)).toEqual(["basic", "full"])
  })
  it("picks the preferred variant, falling back to what the group has", () => {
    expect(pickVariant(recipes, "basic").map((r) => r.slug)).toEqual([
      "tuna-egg-hash",
      "smashes-ham-egg-basic",
      "smashes-green-goddess-full",
    ])
    expect(pickVariant(recipes, "full").map((r) => r.slug)).toEqual([
      "tuna-egg-hash",
      "smashes-ham-egg-full",
      "smashes-green-goddess-full",
    ])
  })
  it("lists a recipe's variants", () => {
    expect(variantsOf(recipes, recipes[2]).map((r) => r.variant)).toEqual([
      "basic",
      "full",
    ])
    expect(variantsOf(recipes, recipes[0])).toEqual([recipes[0]])
  })
  it("ignores non-JSON files and folders starting with _ or .", () => {
    expect(isRecipePath("gyozas.json")).toBe(true)
    expect(isRecipePath("smashes/ham-egg/full.json")).toBe(true)
    expect(isRecipePath("_legacy/old.json")).toBe(false)
    expect(isRecipePath(".github/x.json")).toBe(false)
    expect(isRecipePath("mush.md")).toBe(false)
  })
})
