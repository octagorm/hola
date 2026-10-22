// The app's icons as PNG, drawn from public/app/icon.svg in Chromium:
//
//   node scripts/icons.mjs
//
// The maskable icon and Apple's have square corners (the system rounds
// them); the windmill already sits inside the safe circle of a maskable
// icon.
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const DIR = new URL('../public/app/', import.meta.url).pathname
const svg = await readFile(`${DIR}icon.svg`, 'utf8')
const square = svg.replace('rx="112"', 'rx="0"')

const ICONS = [
  { file: 'icon-192.png', size: 192, svg },
  { file: 'icon-512.png', size: 512, svg },
  { file: 'maskable-512.png', size: 512, svg: square },
  { file: 'apple-touch-icon.png', size: 180, svg: square },
]

const browser = await chromium.launch()
for (const icon of ICONS) {
  const page = await browser.newPage({
    viewport: { width: icon.size, height: icon.size },
  })
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${icon.size}px;height:${icon.size}px}</style>${icon.svg}`,
  )
  await page.screenshot({ path: `${DIR}${icon.file}`, omitBackground: true })
  await page.close()
  console.log(`public/app/${icon.file}`)
}
await browser.close()
