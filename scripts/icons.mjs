// The app's icons as PNG, and the podcast's cover (public/podcast/,
// lib/podcast.ts) as JPEG, drawn from public/app/icon.svg in Chromium:
//
//   node scripts/icons.mjs
//
// The maskable icon and Apple's have square corners (the system rounds
// them); the windmill already sits inside the safe circle of a maskable
// icon.
import { readFile } from 'node:fs/promises'
import { launch } from './browser.mjs'

const DIR = new URL('../public/app/', import.meta.url).pathname
const svg = await readFile(`${DIR}icon.svg`, 'utf8')
const square = svg.replace('rx="112"', 'rx="0"')

const ICONS = [
  { file: 'icon-192.png', size: 192, svg },
  { file: 'icon-512.png', size: 512, svg },
  { file: 'maskable-512.png', size: 512, svg: square },
  { file: 'apple-touch-icon.png', size: 180, svg: square },
  // (podcast apps ask for a square of 1400 to 3000 pixels)
  { file: '../podcast/cover.jpg', size: 1400, svg: square },
]

const browser = await launch()
for (const icon of ICONS) {
  const page = await browser.newPage({
    viewport: { width: icon.size, height: icon.size },
  })
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${icon.size}px;height:${icon.size}px}</style>${icon.svg}`,
  )
  const jpeg = icon.file.endsWith('.jpg')
  await page.screenshot({
    path: `${DIR}${icon.file}`,
    ...(jpeg ? { type: 'jpeg', quality: 88 } : { omitBackground: true }),
  })
  await page.close()
  console.log(`public/app/${icon.file}`)
}
await browser.close()
