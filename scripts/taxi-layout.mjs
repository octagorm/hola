// The layout of Taxi's town as a picture, for painting taxi/map: the map
// the game draws itself (FlatMap in games/taxiMap.tsx), so that the
// painting's streets, square, park and buildings land where the game has
// them. scripts/pictures.mjs gives it to the image tool beside the poster.
//
//   node scripts/taxi-layout.mjs   # writes design/sketches/taxi-layout.png
import { mkdirSync } from 'node:fs'
import { build } from 'esbuild'
import { launch } from './browser.mjs'

const SIZE = 1024
const OUT = 'design/sketches/taxi-layout.png'
const TMP = 'node_modules/.cache/taxi-layout.mjs'

mkdirSync('node_modules/.cache', { recursive: true })
await build({
  stdin: {
    contents: `
      import { createElement } from 'react'
      import { renderToStaticMarkup } from 'react-dom/server'
      import { FlatMap } from './src/app/games/taxiMap.tsx'
      export const svg = renderToStaticMarkup(createElement(FlatMap))
    `,
    resolveDir: '.',
    loader: 'tsx',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  jsx: 'automatic',
  packages: 'external',
  outfile: TMP,
})
const { svg } = await import(`../${TMP}`)

const browser = await launch()
const page = await browser.newPage({
  viewport: { width: SIZE, height: SIZE },
})
await page.setContent(
  `<style>body{margin:0}svg{display:block;width:${SIZE}px;height:${SIZE}px}</style>${svg}`,
)
await page.screenshot({ path: OUT })
await browser.close()
console.log(OUT)
