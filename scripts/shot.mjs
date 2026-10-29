// Screenshots of Hola from the built site, to look at a change without a
// dev server:
//
//   npm run build
//   node scripts/shot.mjs '' '#palabra' --mobile
//
// Each target is a hash ('' is the home page) or a path (/om). Options:
// --mobile (390 × 844), --full for the whole page, --learner to start from a
// bank where the first lessons are met and some known (so mixed text shows
// all three forms), --click "<text>" to click the first button or link with
// that text before the shot (repeatable, in order), --wait <ms> after load
// (default 1200), --out <dir> (default shots/).
import { mkdirSync } from 'node:fs'
import { launch } from './browser.mjs'
import { ORIGIN, quietConvex, routeDist } from './serve.mjs'
import { learnerBank } from './learner.mjs'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const out = opt('--out', 'shots')
const wait = Number(opt('--wait', '1200'))
const mobile = args.includes('--mobile')
const full = args.includes('--full')
const learner = args.includes('--learner')
const clicks = args.flatMap((a, i) => (a === '--click' ? [args[i + 1]] : []))
const FLAGS = new Set(['--mobile', '--full', '--learner'])
const targets = args.filter(
  (a, i) =>
    !a.startsWith('--') &&
    !(i > 0 && args[i - 1].startsWith('--') && !FLAGS.has(args[i - 1])),
)

mkdirSync(out, { recursive: true })
const proxy = process.env.HTTPS_PROXY
const browser = await launch(
  proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {},
)
const context = await browser.newContext(
  mobile
    ? {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      }
    : { viewport: { width: 1280, height: 900 } },
)
await routeDist(context)
await quietConvex(context)
if (learner) {
  const bank = JSON.stringify(await learnerBank(Date.now()))
  await context.addInitScript((b) => {
    if (!localStorage.getItem('hola:bank:v1'))
      localStorage.setItem('hola:bank:v1', b)
  }, bank)
}
const page = await context.newPage()
page.on('pageerror', (e) => console.log('page error:', e.message))
page.on(
  'console',
  (m) => m.type() === 'error' && console.log('console error:', m.text()),
)

for (const t of targets.length ? targets : ['']) {
  const url = t.startsWith('/') ? `${ORIGIN}${t}?mute` : `${ORIGIN}/?mute${t}`
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(wait)
  for (const c of clicks) {
    await page
      .getByRole('button', { name: c })
      .or(page.getByRole('link', { name: c }))
      .or(page.getByRole('radio', { name: c }))
      .first()
      .click()
    await page.waitForTimeout(500)
  }
  const name = `${(t || 'home').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}${mobile ? '-mobile' : ''}.png`
  await page.screenshot({ path: `${out}/${name}`, fullPage: full })
  console.log(`${out}/${name}`)
}
await browser.close()
