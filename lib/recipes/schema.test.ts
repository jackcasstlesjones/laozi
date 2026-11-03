import { describe, expect, it } from "vitest"

import { filterAndSort, parseRecipeFiles } from "./schema"

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
