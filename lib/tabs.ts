/** The app's top-level tabs; goal_settings.tab_order holds each exactly once. */
export const TAB_IDS = ["food", "weight"] as const

export type TabId = (typeof TAB_IDS)[number]

export const TAB_LABELS: Record<TabId, string> = {
  food: "Food",
  weight: "Weight",
}

export const tabHref = (id: TabId) => `/${id}`

/**
 * Known tabs in the stored order, each once, with any the stored order lacks
 * (a tab added after it was saved) appended in default order.
 */
export function orderTabs(stored: readonly string[]): TabId[] {
  const known = stored.filter((id): id is TabId =>
    (TAB_IDS as readonly string[]).includes(id)
  )
  return [...new Set([...known, ...TAB_IDS])]
}

/** Swaps the tab at `index` with its neighbour in `direction`; no-op at the ends. */
export function moveTab(
  order: readonly TabId[],
  index: number,
  direction: -1 | 1
) {
  const target = index + direction
  if (target < 0 || target >= order.length) return [...order]
  const next = [...order]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
