// Regenerates the PNG app icons from the brand mark. Run: node scripts/generate-icons.mjs
import { createRequire } from "node:module"

const require = createRequire(createRequire(import.meta.url).resolve("next"))
const sharp = require("sharp")

const BG = "#fc9417"
const FG = "#3b1d06"
const mark = (inset) =>
  `<path d="M7 21l6-6 4 4 8-8" fill="none" stroke="${FG}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(${16 * inset} ${16 * inset}) scale(${1 - inset})"/>`

// Rounded tile (matches app/icon.svg) and a full-bleed maskable tile with the mark in the safe zone.
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${BG}"/>${mark(0)}</svg>`
const square = (inset) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${BG}"/>${mark(inset)}</svg>`

const out = [
  ["public/icons/icon-192.png", rounded, 192],
  ["public/icons/icon-512.png", rounded, 512],
  ["public/icons/maskable-512.png", square(0.3), 512],
  ["app/apple-icon.png", square(0.15), 180],
]
for (const [file, svg, size] of out) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file)
  console.log(file)
}
