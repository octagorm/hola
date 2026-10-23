// The site in a browser, as it is used: the built pages from dist/ (run
// `npm run build` first) in Chromium. A new player goes through today's
// chapter; a learner some weeks in opens every page and plays every game.
// Any error a page throws fails the test.
//
//   node scripts/smoke.mjs [part of a test's name, to run only those]
import { chromium } from 'playwright'
import { ORIGIN, quietConvex, routeDist } from './serve.mjs'
import { learnerBank } from './learner.mjs'
import { WORDS, meaning } from '../src/app/data/words.ts'
import { FORMS, makeable } from '../src/app/lib/letras.ts'
import { letters, unaccent } from '../src/app/lib/spanish.ts'
import { SENTENCES } from '../src/app/data/orden.ts'
import { matchOf, tilesOf } from '../src/app/lib/orden.ts'

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
  await quietConvex(context)
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
  ['#tema/mancha', 'La Mancha'],
  ['#quijote', 'Don Quijote'],
  ['#quijote/venta', 'Don Quijote'],
  ['#leyendas', 'Leyendas'],
  ['#leyendas/leyendas-ojos', 'Leyendas'],
  ['#palabra', 'La palabra'],
  ['#crucigrama', 'Crucigrama'],
  ['#rosco', 'El rosco'],
  ['#cadaver', 'Cadáver exquisito'],
  ['#sopa', 'Sopa de letras'],
  ['#reloj', 'El reloj blando'],
  ['#porpara', 'Por o para'],
  ['#tiempos', 'Ayer, hoy, mañana'],
  ['#letras', 'Letras'],
  ['#cadena', 'Palabras encadenadas'],
  ['#elola', '¿El o la?'],
  ['#orden', 'Orden'],
  ['#ordbank', 'Tus palabras'],
  ['#ajustes', 'Ajustes'],
  ['#credencial', 'La credencial'],
  ['/om', 'Om Hola'],
  ['/personvern', 'Personvern i Hola'],
  ['/admin', 'Logg inn som administrator'],
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
          // (what the page that catches a break says, not the word ¡ay!)
          !(await page.getByText('Noe gikk galt').count()),
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

await test('signing in with Google is offered', async (page) => {
  await go(page, '')
  await page.getByRole('button', { name: 'Logg inn', exact: true }).click()
  await page.getByRole('button', { name: 'Logg inn med Google' }).waitFor()
  expect(
    await visible(page, '.q-account-pop a[href="/personvern"]'),
    'a link to the privacy page beside it',
  )
  await page.keyboard.press('Escape')
  expect(!(await visible(page, '.q-account-pop')), 'closed by Escape')
  await go(page, '#ajustes')
  await page.getByRole('button', { name: 'Logg inn med Google' }).waitFor()
})

await test('a theme chosen gives today’s chapter its new words', async (page) => {
  await go(page, '')
  await page.getByRole('tab', { name: /Historia/ }).click()
  await page.locator('.q-themes a[href="#tema/mancha"]').click()
  await page.getByRole('button', { name: /Velg som tema/ }).click()
  await page.getByText('Dagens tema').waitFor()
  await go(page, '')
  await page.getByText('fra «Don Quijotes ord»').waitFor()
  expect(
    (await page.locator('.q-themes a.chosen').count()) === 1,
    'the theme marked on the home page',
  )
  await go(page, '#tema/mancha')
  await page.getByRole('button', { name: 'Ikke lenger tema' }).click()
  await page.getByRole('button', { name: /Velg som tema/ }).waitFor()
})

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
  'a chapter is read aloud line by line, paused, carried on and stopped',
  async (page) => {
    await go(page, '#leyendas/leyendas-monte')
    const lines = page.locator('.q-text p')
    expect((await lines.count()) === 1, 'the chapter begins at its first line')
    await page.getByRole('button', { name: 'Les høyt', exact: true }).click()
    await page.waitForSelector('.q-text p.aloud')
    // (the narrator goes on to the next line by itself)
    await page.waitForFunction(
      () => document.querySelectorAll('.q-text p').length >= 2,
      undefined,
      { timeout: 20000 },
    )
    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    expect(!(await visible(page, '.q-text p.aloud')), 'no line read in a pause')
    const at = await lines.count()
    await page.waitForTimeout(2500)
    expect((await lines.count()) === at, 'paused, it stays at its line')
    await page.getByRole('button', { name: 'Fortsett', exact: true }).click()
    await page.waitForSelector('.q-text p.aloud')
    await page.getByRole('button', { name: 'Stopp', exact: true }).click()
    expect(!(await visible(page, '.q-text p.aloud')), 'stopped')
    await page.getByRole('button', { name: 'Les høyt', exact: true }).waitFor()
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

// The words met with a meaning, as a game asks for them
const byMeaning = (text) => WORDS.filter((w) => meaning(w) === text)

// Where the words still to find in Sopa de letras lie, from the meanings
// in its list: the first letter and the last
async function sopaPlaces(page) {
  const ls = await page.$$eval('.sl-tile .l', (els) =>
    els.map((e) => e.textContent),
  )
  const n = Math.round(Math.sqrt(ls.length))
  const at = (r, c) => (r < n && c < n ? ls[r * n + c] : '')
  const todo = await page.$$eval('.sl-list li button:not(.got)', (els) =>
    els.map((e) => e.querySelector('.txt')?.firstChild?.textContent ?? ''),
  )
  const out = []
  for (const w of todo.flatMap(byMeaning)) {
    const a = [...letters(w.bare)]
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
    ])
      for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
          if (a.every((ch, k) => at(r + dr * k, c + dc * k) === ch))
            out.push({
              from: r * n + c,
              to: (r + dr * (a.length - 1)) * n + c + dc * (a.length - 1),
            })
  }
  return out
}

async function middleOf(page, selector, i) {
  const box = await page.locator(selector).nth(i).boundingBox()
  return [box.x + box.width / 2, box.y + box.height / 2]
}

await test(
  'Sopa de letras is found by tapping and dragging, and shown when given up',
  async (page) => {
    await go(page, '#sopa')
    await page.waitForSelector('.sl-tile')
    expect(
      (await page.locator('.sl-tile').count()) === 81,
      'nine rows of nine letters',
    )
    const words = await page.locator('.sl-list li').count()
    expect(words >= 6 && words <= 8, `six to eight words, not ${words}`)
    await page.locator('.sl-list li button').first().click()
    expect(await visible(page, '.sl-tile.hint'), 'a first letter lit')
    // The first word by tapping its first letter and its last, the rest by
    // dragging over them
    const tried = new Set()
    for (let i = 0; i < 30 && !(await visible(page, '.sl-result')); i++) {
      const p = (await sopaPlaces(page)).find(
        (x) => !tried.has(`${x.from}-${x.to}`),
      )
      expect(!!p, 'a word to find')
      tried.add(`${p.from}-${p.to}`)
      const [x0, y0] = await middleOf(page, '.sl-tile', p.from)
      const [x1, y1] = await middleOf(page, '.sl-tile', p.to)
      if (i === 0) {
        await page.mouse.click(x0, y0)
        await page.mouse.click(x1, y1)
        expect(
          (await page.locator('.sl-list button.got').count()) === 1,
          'a word found by tapping',
        )
      } else {
        await page.mouse.move(x0, y0)
        await page.mouse.down()
        await page.mouse.move(x1, y1, { steps: 6 })
        await page.mouse.up()
      }
    }
    await page.getByText('¡Sopa completa!').waitFor()
    await page.getByRole('button', { name: 'En ny sopa' }).click()
    await page.getByRole('button', { name: 'Vis resten' }).click()
    await page.getByText('Las que faltaban').waitFor()
  },
  { learner: true },
)

// The words El reloj blando may be asking for, from the meaning, the
// article and the number of letters
async function relojAsked(page) {
  const text = await page.locator('.rb-mean').textContent()
  const n = await page.locator('.rb-word .slot').count()
  const art = page.locator('.rb-word .art')
  const a = (await art.count()) ? await art.textContent() : null
  return byMeaning(text).filter(
    (w) =>
      [...w.bare].length === n &&
      (a ? w.es.startsWith(`${a} `) : w.pos !== 'n'),
  )
}

const relojKey = (page, k) =>
  page.locator('.rb-keys button', { hasText: new RegExp(`^${k}$`) }).click()

await test(
  'El reloj blando saves words in time and loses one to the melting clock',
  async (page) => {
    await go(page, '#reloj')
    await page.waitForSelector('.rb-keys')
    for (let i = 0; i < 5; i++) {
      const ws = await relojAsked(page)
      expect(ws.length > 0, 'a word met, asked by its meaning')
      const keys = [...new Set(ws.flatMap((w) => [...letters(w.bare)]))]
      if (i === 1) {
        // Seven letters not in it, and the clock has melted
        const wrong = [...'QWXZJKYÑVBFHGPMC'].filter((k) => !keys.includes(k))
        for (const k of wrong.slice(0, 7)) await relojKey(page, k)
        await page.getByText('¡Se derritió!').waitFor()
        expect(
          await visible(page, '.rb-word .slot.gone'),
          'the letters not found shown',
        )
      } else {
        for (const [j, k] of keys.entries()) {
          if (await visible(page, '.rb-after')) break
          // (the first typed on the keyboard)
          if (j === 0 && k !== 'Ñ') await page.keyboard.press(k.toLowerCase())
          else await relojKey(page, k)
        }
        await page.getByText('¡A tiempo!').waitFor()
      }
      await page
        .getByRole('button', { name: i < 4 ? 'Neste ord' : 'Se resultatet' })
        .click()
    }
    await page.getByText('4 av 5 ord reddet').waitFor()
    await page.getByRole('button', { name: 'Fem ord til' }).click()
    await page.waitForSelector('.rb-keys')
  },
  { learner: true },
)

// The article of the noun on ¿El o la?'s card, where the word tells it
async function elolaArticle(page) {
  const bare = await page.locator('.eo-deal .front .word').textContent()
  const arts = new Set(
    WORDS.filter((w) => w.pos === 'n' && w.bare === bare).map((w) =>
      w.es.startsWith('la ') ? 'la' : 'el',
    ),
  )
  return arts.size === 1 ? [...arts][0] : null
}

await test(
  '¿El o la? takes el or la until the candle burns down',
  async (page) => {
    await page.clock.install()
    await go(page, '#elola')
    await page.getByRole('button', { name: 'Tenn lyset' }).click()
    // One answer wrong on purpose, which turns the card, and the rest right
    // by the arrow keys
    let turned = false
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.eo-deal:not(.turned)')
      const a = (await elolaArticle(page)) ?? 'el'
      if (!turned) {
        await page
          .locator('.eo-piles')
          .getByRole('button', { name: a === 'el' ? 'la' : 'el', exact: true })
          .click()
        await page.waitForSelector('.eo-deal.turned .back .rule')
        turned = true
      } else await page.keyboard.press(a === 'el' ? 'ArrowLeft' : 'ArrowRight')
      await page.waitForTimeout(250)
      const next = page.getByRole('button', { name: /Neste/ })
      if (await next.count()) await next.click()
    }
    const score = Number(await page.locator('.eo-score b').textContent())
    expect(score >= 5, `right answers counted, not ${score}`)
    await page.clock.fastForward(61_000)
    await page.getByText('Se apagó la vela').waitFor()
    await page.getByText('Ordene du bommet på').waitFor()
    await page.getByRole('button', { name: 'En runde til' }).click()
    await page.waitForSelector('.eo-deal')
  },
  { learner: true },
)

// The sentence Orden shows, found by its Norwegian
async function ordenNow(page) {
  const no = await page.locator('.or-no').textContent()
  const s = SENTENCES.find((x) => x.no === no)
  expect(!!s, `a sentence for «${no}»`)
  return s
}

// Taps the tiles in the heap in this order
async function ordenSet(page, words) {
  for (const w of words)
    await page
      .locator('.or-tray')
      .getByRole('button', { name: w, exact: true })
      .first()
      .click()
}

await test(
  'Orden sets eight sentences in order, shows one, and prints the sheet',
  async (page) => {
    await go(page, '#orden')
    for (let i = 0; i < 8; i++) {
      const s = await ordenNow(page)
      const right = tilesOf(s.line).map((t) => t.es)
      if (i === 1) {
        // Wrong twice, the second time from the start, and then shown
        const wrong = [
          [...right].reverse(),
          [...right.slice(1), right[0]],
          [right[1], right[0], ...right.slice(2)],
        ].find((w) => matchOf(s, w) < 0)
        await ordenSet(page, wrong)
        await page.getByRole('button', { name: 'Sjekk' }).click()
        await page.waitForSelector('.or-tile.shake')
        await page.waitForSelector('.or-tile.shake', { state: 'detached' })
        expect(await visible(page, '.or-point'), 'a hint after a mistake')
        while (await visible(page, '.or-slots .or-tile'))
          await page.locator('.or-slots .or-tile').first().click()
        await ordenSet(page, wrong)
        await page.getByRole('button', { name: 'Sjekk' }).click()
        await page.getByRole('button', { name: 'Vis meg' }).click()
      } else if (i === 2) {
        // By the keys: each tile by its number in the heap, Enter to check
        for (const w of right) {
          const heap = await page.$$eval('.or-tray .or-tile', (els) =>
            els.map((e) => e.lastChild?.textContent),
          )
          await page.keyboard.press(String(heap.indexOf(w) + 1))
        }
        await page.keyboard.press('Enter')
      } else {
        await ordenSet(page, right)
        await page.getByRole('button', { name: 'Sjekk' }).click()
      }
      await page.waitForSelector('.or-printed')
      if (i === 2) await page.keyboard.press('Enter')
      else
        await page
          .getByRole('button', { name: i < 7 ? /^Neste/ : /^Se arket/ })
          .click()
    }
    await page.getByText('¡Aleluya!').waitFor()
    await page.getByText('7 av 8 på første forsøk').waitFor()
    expect(
      (await page.locator('.or-sheet .star').count()) === 7,
      'a star for each sentence right at the first try',
    )
    await page.getByRole('button', { name: 'Et ark til' }).click()
    await page.waitForSelector('.or-tray .or-tile')
  },
  { learner: true },
)

await test(
  'Por o para opens a door for ten sentences, by touch and by key',
  async (page) => {
    await go(page, '#porpara')
    for (let i = 0; i < 40 && !(await visible(page, '.pp-card')); i++) {
      const next = page.locator('.pp-after .pp-btn')
      if (await next.count()) await next.click()
      else if (i % 4) await page.locator('.pp-door.para').click()
      else await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(60)
    }
    await page.getByText(/av 10 riktige/).waitFor()
  },
  { learner: true },
)

await test(
  'Ayer, hoy, mañana moves eight sentences in time',
  async (page) => {
    await go(page, '#tiempos')
    for (let i = 0; i < 40 && !(await visible(page, '.ah-card')); i++) {
      const next = page.locator('.ah-after .ah-btn')
      if (await next.count()) await next.click()
      else await page.locator('.ah-opts button').first().click()
      await page.waitForTimeout(60)
    }
    await page.getByText(/av 8 riktige/).waitFor()
  },
  { learner: true },
)

await test(
  'Letras takes words of the letters asked for, over three rounds',
  async (page) => {
    await go(page, '#letras')
    for (let round = 0; round < 3; round++) {
      await page.waitForSelector('.lt-asks')
      // (V and K ask for a vowel and a consonant from the keyboard)
      for (let i = 0; i < 9; i++) await page.keyboard.press(i % 2 ? 'k' : 'v')
      await page.waitForSelector('.lt-acts')
      const blocks = (await page.locator('.lt-block').allTextContents()).map(
        (t) => t.trim(),
      )
      const words = FORMS.filter((f) => makeable(f.key, blocks)).sort(
        (a, b) => b.key.length - a.key.length,
      )
      expect(words.length, `no word in ${blocks.join('')}`)
      if (round === 0) {
        const junk = blocks.slice(0, 3).join('')
        if (!FORMS.some((f) => f.key === junk)) {
          await page.keyboard.type(junk)
          await page.getByRole('button', { name: 'Sjekk ordet' }).click()
          await page.getByText('Det ordet kjenner ikke Hola ennå').waitFor()
          for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace')
        }
      }
      if (round < 2) {
        await page.keyboard.type(words[0].key)
        await page.keyboard.press('Enter')
        await page
          .locator('.lt-word', { hasText: words[0].key })
          .waitFor({ timeout: 3000 })
      } else
        await page
          .getByRole('button', { name: 'Vis de lengste ordene' })
          .click()
      await page
        .getByRole('button', {
          name: round < 2 ? 'Neste runde' : 'Se hvordan det gikk',
        })
        .click()
    }
    await page.getByText('Fin de la partida').waitFor()
    await page.getByRole('button', { name: 'Tre runder til' }).click()
    await page.waitForSelector('.lt-asks')
  },
  { learner: true },
)

await test(
  'Palabras encadenadas makes a chain of eight',
  async (page) => {
    await go(page, '#cadena')
    await page.waitForSelector('.en-panel')
    let typed = false
    for (let i = 0; i < 80 && !(await visible(page, '.en-list')); i++) {
      if (await visible(page, '.en-shown')) {
        await page.getByRole('button', { name: /^Neste/ }).click()
        continue
      }
      const opts = page.locator('.en-opts button:not([disabled])')
      if (await opts.count()) {
        await opts.first().click()
        await page.waitForTimeout(150)
        continue
      }
      if (typed) {
        await page.getByRole('button', { name: 'Vet ikke' }).click()
        continue
      }
      // Once, the word asked for typed from its meaning
      const syl = (await page.locator('.en-from .link').textContent()).replace(
        '…',
        '',
      )
      const clue = await page.locator('.en-clue').textContent()
      const means = clue.slice(clue.indexOf('«') + 1, clue.lastIndexOf('»'))
      const w = WORDS.find(
        (x) =>
          meaning(x) === means && unaccent(x.bare).startsWith(unaccent(syl)),
      )
      expect(w, `no word on ${syl}- for «${means}»`)
      const locked = await page.locator('.en-answer .lock').textContent()
      await page.keyboard.type(letters(w.bare).slice(locked.length))
      await page.keyboard.press('Enter')
      await page
        .locator('.en-note.ok, .en-list')
        .first()
        .waitFor({ timeout: 3000 })
      typed = true
    }
    await page.getByText(/av 8 uten hjelp/).waitFor()
    expect(
      (await page.locator('button.en-flag').count()) === 9,
      'nine flags hung',
    )
    await page.getByRole('button', { name: 'En kjede til' }).click()
    await page.waitForSelector('.en-step')
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
