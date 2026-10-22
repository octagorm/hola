// The site in a browser, as it is used: the built pages from dist/ (run
// `npm run build` first) in Chromium. A new player goes through today's
// chapter; a learner some weeks in opens every page and plays every game.
// Any error a page throws fails the test.
//
//   node scripts/smoke.mjs [part of a test's name, to run only those]
import { chromium } from 'playwright'
import { ORIGIN, routeDist } from './serve.mjs'
import { learnerBank } from './learner.mjs'

const proxy = process.env.HTTPS_PROXY
const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {})
let failed = 0

const PHONE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
}
const DESK = { viewport: { width: 1280, height: 900 } }

function expect(ok, what) {
  if (!ok) throw new Error(what)
}

const only = process.argv[2]?.toLowerCase()

async function test(name, fn, { phone = false, learner = false } = {}) {
  if (only && !name.toLowerCase().includes(only)) return
  const context = await browser.newContext({
    ...(phone ? PHONE : DESK),
    acceptDownloads: true,
  })
  await routeDist(context)
  if (learner) {
    const bank = JSON.stringify(await learnerBank(Date.now()))
    await context.addInitScript((b) => {
      if (!localStorage.getItem('hola:bank:v1'))
        localStorage.setItem('hola:bank:v1', b)
    }, bank)
  }
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    // (fonts that do not load where the network is closed are no error of
    // the page's)
    if (
      m.type() === 'error' &&
      !/Failed to load resource|fonts\.g/.test(m.text())
    )
      errors.push(m.text())
  })
  try {
    await fn(page)
    expect(!errors.length, `errors on the page:\n${errors.join('\n')}`)
    console.log(`✓ ${name}`)
  } catch (e) {
    failed++
    console.log(
      `✗ ${name}\n  ${String(e.message ?? e)
        .split('\n')
        .join('\n  ')}`,
    )
  }
  await context.close()
}

async function go(page, target) {
  const url = target.startsWith('/')
    ? `${ORIGIN}${target}?mute`
    : `${ORIGIN}/?mute${target}`
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForTimeout(400)
}

const visible = async (page, selector) =>
  (await page.locator(selector).count()) > 0

// Answers whatever today's chapter or a round asks, until `done` is there
async function answerUntil(page, done, most = 300) {
  for (let i = 0; i < most; i++) {
    if (await visible(page, done)) return
    if (await visible(page, '.q-away')) {
      await page
        .locator('.q-away')
        .getByRole('button', { name: 'Hopp over' })
        .click()
      continue
    }
    const next = page.locator('.q-after').getByRole('button', { name: /Neste/ })
    if (await next.count()) {
      await next.click()
      continue
    }
    const card = page.locator('.q-new').getByRole('button', { name: /^Neste/ })
    if (await card.count()) {
      await card.click()
      continue
    }
    const choice = page.locator('.q-choice:not([disabled])').first()
    if (await choice.count()) {
      await choice.click()
      await page.waitForTimeout(1100)
      continue
    }
    const unsure = page.getByRole('button', { name: 'Vet ikke' })
    if (await unsure.count()) {
      await unsure.click()
      continue
    }
    await page.waitForTimeout(150)
  }
  expect(await visible(page, done), `never got to ${done}`)
}

await test('a new player goes through today’s chapter and gets a stamp', async (page) => {
  await go(page, '')
  await page.getByRole('heading', { name: 'Hola', level: 1 }).waitFor()
  await page.getByRole('link', { name: 'Begynn', exact: true }).click()
  await page.waitForSelector('.q-steps')
  await answerUntil(page, '.q-summary')
  expect(await visible(page, '.q-summary .stamp svg'), 'a stamp at the end')
  await page.getByRole('link', { name: 'Til forsiden' }).click()
  await page.getByRole('link', { name: 'Se dagen' }).waitFor()
  expect(
    (await page.locator('.q-cred .stamps svg').count()) >= 5,
    'the stamp on the home page',
  )
  const words = await page.locator('.q-box .counts b').nth(1).textContent()
  expect(Number(words) >= 5, `five words met, not ${words}`)
})

const PAGES = [
  ['', 'Hola'],
  ['#hoy', 'Capítulo'],
  ['#repaso', 'Repaso'],
  ['#nuevas', 'Palabras nuevas'],
  ['#nuevas/comida', 'Palabras nuevas'],
  ['#quijote', 'Don Quijote'],
  ['#quijote/venta', 'Don Quijote'],
  ['#palabra', 'La palabra'],
  ['#crucigrama', 'Crucigrama'],
  ['#rosco', 'El rosco'],
  ['#cadaver', 'Cadáver exquisito'],
  ['#ordbank', 'Tus palabras'],
  ['#ajustes', 'Ajustes'],
  ['#credencial', 'La credencial'],
  ['/om', 'Acerca de Hola'],
  ['/ingensteds', '¿Dónde?'],
]

for (const phone of [false, true])
  await test(
    `every page opens${phone ? ' on a phone, without scrolling sideways' : ''}`,
    async (page) => {
      for (const [target, heading] of PAGES) {
        await go(page, target)
        await page.getByText(heading).first().waitFor({ timeout: 5000 })
        expect(
          !(await page.getByText('¡Ay!').count()),
          `${target || 'home'} broke`,
        )
        if (phone) {
          const wide = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          )
          expect(wide <= 0, `${target || 'home'} is ${wide}px too wide`)
        }
      }
    },
    { phone, learner: true },
  )

await test(
  'a review round ends with its words',
  async (page) => {
    await go(page, '#repaso')
    await answerUntil(page, '.q-wordlist')
    await page.getByRole('button', { name: 'En runde til' }).waitFor()
  },
  { learner: true },
)

await test(
  'five new words are met',
  async (page) => {
    await go(page, '#nuevas')
    await answerUntil(page, '.q-wordlist')
    await page.getByRole('button', { name: 'Fem til' }).waitFor()
  },
  { learner: true },
)

await test(
  'a chapter of Don Quijote is read and asked about',
  async (page) => {
    await go(page, '#quijote/venta')
    for (let i = 0; i < 30 && !(await visible(page, '.q-ask')); i++) {
      await page.locator('.q-readnav .next').click()
      await page.waitForTimeout(80)
    }
    for (let q = 0; q < 3; q++) {
      await page.locator('.q-ask .q-choice').first().click()
      await page
        .getByRole('button', { name: q < 2 ? 'Neste spørsmål' : 'Ferdig' })
        .click()
    }
    await page.getByText('Fin del capítulo').waitFor()
  },
  { learner: true },
)

await test(
  'La palabra ends after six guesses',
  async (page) => {
    await go(page, '#palabra')
    // (keys typed before the game is there are lost)
    await page.waitForSelector('.g5-keys')
    for (let i = 0; i < 6; i++) {
      await page.keyboard.type('qqqqq')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(150)
    }
    await page.getByText('Ordet var').waitFor()
    await page.getByRole('button', { name: 'Øv med et ord til' }).click()
    expect(!(await visible(page, '.g5-result')), 'a new round to practise')
  },
  { learner: true },
)

await test(
  'the crossword is solved letter by letter with hints',
  async (page) => {
    await go(page, '#crucigrama')
    await page.waitForSelector('.d4-grid')
    await page.keyboard.press('q')
    expect(
      (await page.locator('.d4-grid button', { hasText: 'Q' }).count()) === 1,
      'a letter typed',
    )
    await page.keyboard.press('Backspace')
    for (let i = 0; i < 80 && !(await visible(page, '.d4-result')); i++)
      await page.getByRole('button', { name: 'En bokstav' }).click()
    await page.getByText('¡Resuelto!').waitFor()
  },
  { learner: true },
)

await test(
  'the crossword shows its answers when given up',
  async (page) => {
    await go(page, '#crucigrama')
    await page.getByRole('button', { name: 'Vis svarene' }).click()
    await page.getByText('Svarene').waitFor()
    await page.getByRole('button', { name: 'Et kryssord til' }).click()
    await page.waitForSelector('.d4-grid')
  },
  { learner: true },
)

await test(
  'El rosco takes answers, passes and stops',
  async (page) => {
    await go(page, '#rosco')
    expect(
      (await page.locator('.r6-egg').count()) >= 8,
      'eight letters or more',
    )
    await page.keyboard.type('qqq')
    await page.keyboard.press('Enter')
    expect(
      (await page.locator('.r6-egg.wrong').count()) === 1,
      'a wrong answer',
    )
    await page.getByRole('button', { name: 'Pasapalabra' }).click()
    expect(
      (await page.locator('.r6-egg.pass').count()) === 1,
      'a letter passed',
    )
    await page.getByRole('button', { name: 'Stopp her' }).click()
    await page.getByText('Ordene du ikke fikk').waitFor()
  },
  { learner: true },
)

await test(
  'Cadáver exquisito makes six sentences',
  async (page) => {
    await go(page, '#cadaver')
    for (let i = 0; i < 80 && !(await visible(page, '.c6-card')); i++) {
      const next = page.locator('.c6-next button')
      if (await next.count()) await next.click()
      else await page.locator('.c6-opts button:not([disabled])').first().click()
      await page.waitForTimeout(60)
    }
    await page.getByText(/av 6 uten feil/).waitFor()
  },
  { learner: true },
)

await test(
  'the word bank finds a word and opens it',
  async (page) => {
    await go(page, '#ordbank')
    await page.getByLabel('Søk').fill('gato')
    await page.locator('.q-lesson .row', { hasText: 'el gato' }).click()
    await page.locator('.q-lesson .more').waitFor()
  },
  { learner: true },
)

await test(
  'a backup is downloaded',
  async (page) => {
    await go(page, '#ajustes')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Last ned' }).click(),
    ])
    expect(
      /^hola-\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()),
      `named ${download.suggestedFilename()}`,
    )
  },
  { learner: true },
)

await browser.close()
if (failed) {
  console.log(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nAll passed')
