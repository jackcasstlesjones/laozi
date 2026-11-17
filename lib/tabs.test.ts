import { describe, expect, it } from "vitest"

import { moveTab, orderTabs } from "./tabs"

describe("orderTabs", () => {
  it("keeps the stored order", () => {
    expect(orderTabs(["weight", "food"])).toEqual(["weight", "food"])
  })
  it("drops unknown and duplicate ids and appends missing tabs", () => {
    expect(orderTabs(["weight", "old", "weight"])).toEqual(["weight", "food"])
    expect(orderTabs([])).toEqual(["food", "weight"])
  })
})

describe("moveTab", () => {
  it("swaps with the neighbour", () => {
    expect(moveTab(["food", "weight"], 1, -1)).toEqual(["weight", "food"])
    expect(moveTab(["food", "weight"], 0, 1)).toEqual(["weight", "food"])
  })
  it("does nothing at the ends", () => {
    expect(moveTab(["food", "weight"], 0, -1)).toEqual(["food", "weight"])
    expect(moveTab(["food", "weight"], 1, 1)).toEqual(["food", "weight"])
  })
})
