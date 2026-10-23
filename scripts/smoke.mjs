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
import { DICT, findMoves, keyOf } from '../src/app/lib/palabras.ts'
import { dictable } from '../src/app/lib/sonidos.ts'
import { kindOfWord, untilde, wordItem } from '../src/app/lib/acento.ts'
import { DECK, LOTTERY } from '../src/app/lib/numeros.ts'
import { ORDER } from '../src/app/data/ictineo.ts'
import { LESSONS } from '../src/app/data/words.ts'

const LESSON_COUNT = LESSONS.length

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
  await page.getByRole('button', { name: 'Ordene', exact: true }).click()
  const words = await page.locator('.q-words .counts b').nth(1).textContent()
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
  ['#viaje', 'El viaje'],
  ['#viaje/viaje-granada', 'El viaje'],
  ['#leyendas', 'Leyendas'],
  ['#leyendas/leyendas-ojos', 'Leyendas'],
  ['#caso', 'El caso del reloj perdido'],
  ['#caso/caso-iglesia', 'El caso del reloj perdido'],
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
  ['#tapas', 'Tapas'],
  ['#rastro', 'El Rastro'],
  ['#palabras', 'Palabras'],
  ['#sonidos', 'Sonidos'],
  ['#acento', 'Acento'],
  ['#numeros', 'Números'],
  ['#taxi', 'Taxi'],
  ['#ictineo', 'El Ictíneo'],
  ['#ordbank', 'Tus palabras'],
  ['#ajustes', 'Ajustes'],
  ['#credencial', 'La credencial'],
  ['#cajones', 'Los cajones'],
  ['#museo', 'Tu museo'],
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
  await page.getByRole('button', { name: 'Ordene', exact: true }).click()
  await page.getByRole('tab', { name: /Historia/ }).click()
  await page.locator('.q-themes a[href="#tema/mancha"]').click()
  await page.getByRole('button', { name: /Velg som tema/ }).click()
  await page.getByText('Dagens tema').waitFor()
  await go(page, '')
  // (the home page keeps the part it was left on)
  await page.getByRole('button', { name: 'I dag', exact: true }).click()
  await page.getByText('fra «Don Quijotes ord»').waitFor()
  await page.getByRole('button', { name: 'Ordene', exact: true }).click()
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
    await lines.first().waitFor()
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

// Through a story's lines to its questions, and answers them
async function toTheEnd(page) {
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
}

await test(
  'a chapter of the mystery is heard before it is read, and fills the notebook',
  async (page) => {
    await go(page, '#caso/caso-iglesia')
    // (each line is heard, its text hidden until asked for)
    await page.waitForSelector('.q-text .cs-heard')
    expect(!(await visible(page, '.q-text .cs-said')), 'no text at first')
    await page
      .locator('.q-text .cs-heard')
      .first()
      .getByRole('button', { name: 'Vis teksten' })
      .click()
    await page.waitForSelector('.q-text .cs-said')
    await page.getByRole('button', { name: 'Skjul teksten' }).first().click()
    expect(!(await visible(page, '.q-text .cs-said')), 'hidden again')
    await toTheEnd(page)
    expect(!(await visible(page, '.q-text .cs-heard')), 'every line written')
    expect(await visible(page, '.cs-newclue'), 'a clue for the notebook')
    await page
      .getByRole('link', { name: 'Notatboka og alle kapitlene' })
      .click()
    await page.waitForSelector('.cs-libreta')
    expect(
      (await page.locator('.cs-libreta li:not(.blank)').count()) === 1,
      'the clue in the notebook',
    )
  },
  { learner: true },
)

await test(
  'the mystery’s last chapter asks who took the watch, with a hint for a wrong guess',
  async (page) => {
    await go(page, '#caso/caso-playa')
    for (let i = 0; i < 30 && !(await visible(page, '.cs-accuse')); i++) {
      await page.locator('.q-readnav .next').click()
      await page.waitForTimeout(80)
    }
    const suspect = (name) =>
      page.locator('.cs-suspects .q-choice', { hasText: name })
    await suspect('Quim').click()
    await page.waitForSelector('.cs-hint')
    expect(await suspect('Quim').isDisabled(), 'a wrong guess struck out')
    expect(
      await visible(page, '.cs-libreta li.mark'),
      'the notebook marked where he is ruled out',
    )
    await suspect('Laia').click()
    await page.getByRole('button', { name: 'Hør forklaringen' }).click()
    await toTheEnd(page)
    await page.getByText('på 2. forsøk').waitFor()
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
    await page.locator('.r6-egg').first().waitFor()
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

// Palabras as it is kept in the browser, and its player's plays
const palabrasGame = async (page) =>
  JSON.parse(
    await page.evaluate(() => localStorage.getItem('hola:palabras:v1')),
  )

// Waits for her turn, while El relojero thinks and plays, or for the end
async function palabrasTurn(page) {
  await page.waitForFunction(
    () => {
      const g = JSON.parse(localStorage.getItem('hola:palabras:v1') ?? 'null')
      return g && (g.log.length % 2 === 0 || g.log.length >= 12)
    },
    null,
    { timeout: 30000 },
  )
  await page.waitForTimeout(200)
  return palabrasGame(page)
}

const palabrasMoves = (g, ok = () => true) =>
  findMoves(g.board, g.racks[0], [...DICT.values()], new Set(DICT.keys()))
    .filter(ok)
    .sort((a, b) => b.score - a.score)

// The rack's place of the tile for each square of a play, a blank's too
function palabrasSlots(g, m) {
  const free = [...g.racks[0]]
  return m.cells.map((c) => {
    const [t] = free.splice(
      free.findIndex((x) => (c.b ? x.b : !x.b && x.l === c.l)),
      1,
    )
    return g.racks[0].indexOf(t)
  })
}

async function palabrasBlank(page, c) {
  if (c.b)
    await page
      .locator('.pz-letters')
      .getByRole('button', { name: c.l, exact: true })
      .click()
}

await test(
  'Palabras plays its twelve turns against El relojero, by key, touch and drag',
  async (page) => {
    await go(page, '#palabras')
    await page.getByRole('button', { name: 'Begynn' }).click()
    // Her six turns, each its own way. A rack with no play for the way
    // swaps all its tiles instead, and the way waits for the next turn.
    const ways = ['type', 'tap', 'drag', 'hint', 'swap', 'pass']
    for (let turn = 0; turn < 6; turn++) {
      const g = await palabrasTurn(page)
      expect(g.log.length === turn * 2, `${g.log.length} turns at ${turn}`)
      const laid = async () =>
        page.waitForFunction(
          (n) =>
            JSON.parse(localStorage.getItem('hola:palabras:v1')).log.length > n,
          g.log.length,
        )
      const swapAll = async (n) => {
        await page.getByRole('button', { name: 'Bytt' }).click()
        for (let k = 0; k < n; k++)
          await page.locator('.pz-rtile').nth(k).click()
        await page.getByRole('button', { name: `Bytt ${n}` }).click()
        await laid()
      }
      if (turn === 0) {
        // A word Hola does not know, kindly turned down: the tiles go back
        const plain = g.racks[0].filter(
          (t) => !t.b && t.l.length === 1 && t.l !== 'Ñ',
        )
        const junk = plain
          .flatMap((a) => plain.map((b) => (a === b ? null : [a.l, b.l])))
          .find((p) => p && !DICT.has(keyOf(p)))
        if (junk) {
          for (const l of junk) await page.keyboard.press(l)
          await page.keyboard.press('Enter')
          await page.getByText('Det ordet kjenner ikke Hola ennå').waitFor()
          expect(
            !(await page.locator('.pz-slot').count()),
            'the tiles back on the rack',
          )
        }
      }
      const way = ways.shift()
      if (way === 'swap') {
        await swapAll(2)
        continue
      }
      if (way === 'pass') {
        await page.getByRole('button', { name: 'Stå over' }).click()
        await page.getByRole('button', { name: 'Sikker?' }).click()
        await laid()
        continue
      }
      if (way === 'hint') {
        await page.getByRole('button', { name: 'Tips' }).click()
        const show = page.getByRole('button', { name: 'Vis ordet' })
        if (await show.count()) {
          await show.click()
          await page.getByRole('button', { name: 'Legg ordet' }).click()
        } else {
          await page.getByRole('button', { name: 'Stå over' }).click()
          await page.getByRole('button', { name: 'Sikker?' }).click()
        }
        await laid()
        continue
      }
      // (Ñ is not on the keyboard a test types with)
      const m = palabrasMoves(g, (x) =>
        way === 'type' ? x.cells.every((c) => c.l !== 'Ñ') : true,
      ).at(0)
      if (!m) {
        ways.unshift(way)
        const i = ways.indexOf('swap')
        if (i >= 0) ways.splice(i, 1)
        await swapAll(g.racks[0].filter((t) => !t.b).length)
        continue
      }
      if (way === 'type') {
        // Typed from the word's first square, along the word
        const first = m.cells[0].i
        const dir =
          m.cells.length > 1 && m.cells[1].i - first >= 11 ? 'down' : 'across'
        for (let k = 0; k < 4; k++) {
          const cur = page.locator('.pz-sq.cur')
          const at = (await cur.count())
            ? await cur.getAttribute('data-sq')
            : -1
          if (Number(at) === first && (await visible(page, `.pz-arrow.${dir}`)))
            break
          await page.locator(`[data-sq="${first}"]`).click()
        }
        for (const c of m.cells)
          for (const ch of c.l) await page.keyboard.press(ch)
      } else if (way === 'tap') {
        // Tapped: a tile, then its square
        await page.keyboard.press('Escape')
        const slots = palabrasSlots(g, m)
        for (const [k, c] of m.cells.entries()) {
          await page.locator(`.pz-rtile[data-slot="${slots[k]}"]`).click()
          await page.locator(`[data-sq="${c.i}"]`).click()
          await palabrasBlank(page, c)
        }
      } else {
        // Dragged from the rack to the board
        const slots = palabrasSlots(g, m)
        for (const [k, c] of m.cells.entries()) {
          const from = await page
            .locator(`.pz-rtile[data-slot="${slots[k]}"]`)
            .boundingBox()
          const to = await page.locator(`[data-sq="${c.i}"]`).boundingBox()
          await page.mouse.move(
            from.x + from.width / 2,
            from.y + from.height / 2,
          )
          await page.mouse.down()
          await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
            steps: 8,
          })
          await page.mouse.up()
          await palabrasBlank(page, c)
        }
      }
      await page.getByRole('button', { name: 'Legg ordet' }).click()
      await laid()
      const after = await palabrasGame(page)
      // (typed, a blank may stand on another square than it would)
      expect(
        way === 'type'
          ? after.score[0] > g.score[0]
          : after.score[0] === g.score[0] + m.score,
        `scored ${after.score[0] - g.score[0]}, not ${m.score}`,
      )
    }
    await page.getByText('Fin de la partida').waitFor({ timeout: 30000 })
    const g = await palabrasGame(page)
    expect(g.log.length === 12, `${g.log.length} turns`)
    const bank = JSON.parse(
      await page.evaluate(() => localStorage.getItem('hola:bank:v1')),
    )
    expect(bank.best.palabras === g.score[0], 'her score is her best')
    // A word of the game, opened
    const chip = page.locator('.pz-end .pz-chip').last()
    if (await chip.count()) {
      await chip.click()
      await page.locator('.pz-card .pz-form').first().waitFor()
      await page.keyboard.press('Escape')
    }
    await page.getByRole('button', { name: 'Nytt parti' }).click()
    await page.getByRole('button', { name: 'Begynn' }).waitFor()
  },
  { learner: true },
)

await test(
  'Tapas serves a day of eight guests',
  async (page) => {
    await go(page, '#tapas')
    await page.getByRole('button', { name: 'Åpne baren' }).click()
    for (let g = 0; g < 8; g++) {
      await page.waitForSelector('.tp-carta button:not([disabled])')
      // Served wrong first, to be shown what was asked for, then right
      await page.locator('.tp-carta button').first().click()
      await page.getByRole('button', { name: 'Server' }).click()
      await page.waitForTimeout(150)
      if (await visible(page, '.tp-marks')) {
        const want = await page.$$eval('.tp-marks li[data-want]', (els) =>
          els.map((e) => [
            e.getAttribute('data-id'),
            Number(e.getAttribute('data-want')),
          ]),
        )
        await page.getByRole('button', { name: 'Tøm brettet' }).click()
        for (const [id, n] of want)
          for (let k = 0; k < n; k++)
            await page.locator(`.tp-carta button[data-id="${id}"]`).click()
        await page.getByRole('button', { name: 'Server' }).click()
      }
      await page.waitForFunction(
        (n) =>
          document.querySelector('.tp-end') ||
          document.querySelectorAll('.tp-jar .dots i.done').length > n,
        g,
      )
    }
    await page.getByText(/€ i tips/).waitFor()
    await page.getByRole('button', { name: 'En dag til' }).click()
    await page.waitForSelector('.tp-carta')
  },
  { learner: true },
)

await test(
  'El Rastro haggles through a Sunday of four stalls',
  async (page) => {
    await go(page, '#rastro')
    await page.getByRole('button', { name: 'Gå til markedet' }).click()
    // A move, and the seller's answer to it
    const say = async (selector) => {
      const lines = await page.locator('.ra-line').count()
      await page.locator(selector).click()
      await page.waitForFunction(
        (n) =>
          document.querySelector('.ra-note') ||
          (document.querySelectorAll('.ra-line').length >= n + 2 &&
            (document.querySelector('.ra-outcome') ||
              !document.querySelector('.ra-move[disabled]'))),
        lines,
      )
    }
    for (let s = 0; s < 4; s++) {
      await say('.ra-move.ask')
      if (s === 0) {
        // The price looked at, then haggled: too dear, and an offer
        const read = page.getByRole('button', { name: 'Les det selgeren sa' })
        if (await read.count()) await read.click()
        expect(
          !(await page.locator('.ra-tag b').textContent()).includes('?'),
          'the price on the tag once read',
        )
        await say('.ra-move.dear')
        if (!(await visible(page, '.ra-outcome'))) {
          await page.locator('.ra-move.offer').click()
          await say('.ra-offer .chips button:not([disabled]) >> nth=0')
        }
      }
      for (let k = 0; k < 8 && !(await visible(page, '.ra-outcome')); k++)
        await say(
          (await visible(page, '.ra-note')) ? '.ra-move.leave' : '.ra-move.buy',
        )
      await page.locator('.ra-outcome').getByRole('button').click()
    }
    await page.getByText(/av 12 stjerner/).waitFor()
    await page.getByRole('button', { name: 'En søndag til' }).click()
    await page.getByRole('button', { name: 'Gå til markedet' }).waitFor()
  },
  { learner: true },
)

// The word Sonidos' dictation says, by its meaning and its article, where
// only one word has them
async function dictadoWord(page) {
  const hint = await page.locator('.so-hint').textContent()
  const means = hint.slice(hint.indexOf('«') + 1, hint.lastIndexOf('»'))
  const art = (await visible(page, '.so-sheet .art'))
    ? await page.locator('.so-sheet .art').textContent()
    : null
  const ws = WORDS.filter(
    (w) =>
      dictable(w) &&
      w.no.split(', ')[0] === means &&
      (art ? w.es.startsWith(`${art} `) : w.pos !== 'n'),
  )
  return ws.length === 1 ? ws[0] : null
}

await test(
  'Sonidos plays a sound of the chart, a round for the ear and a dictation',
  async (page) => {
    await go(page, '#sonidos')
    // The chart: a sound, a word to hear it in, and the ear trained on it
    await page.getByRole('tab', { name: /Abecedario/ }).click()
    await page.getByRole('button', { name: 'r · rr' }).click()
    await page.locator('.so-card .so-word').first().click()
    await page.getByRole('button', { name: /Øv øret på/ }).click()
    await page.getByText('Øver på').waitFor()
    await page.getByRole('button', { name: 'Alle lydene' }).click()
    // The ear: ten words, picked by touch and by key
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('.so-opt:not([disabled])')
      if (i % 2) await page.keyboard.press('1')
      else await page.locator('.so-opt').last().click()
      await page.getByRole('button', { name: /^Neste/ }).click()
    }
    await page.getByText(/av 10 riktige/).waitFor()
    await page.getByRole('button', { name: /En runde til/ }).click()
    await page.waitForSelector('.so-opt:not([disabled])')
    // The dictation: a word written right, the rest written wrong by the
    // keys on the screen and the keyboard, or shown
    await page.getByRole('tab', { name: /Dictado/ }).click()
    let right = false
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('.so-typer')
      if (!right)
        await page.getByRole('button', { name: 'Hva betyr det?' }).click()
      const w = right ? null : await dictadoWord(page)
      if (w) {
        // (a ñ by the key on the screen: Playwright's keyboard sends it as
        // text, with no key pressed for the page to hear)
        for (const c of unaccent(w.bare))
          if (c === 'ñ')
            await page
              .locator('.so-typer')
              .getByRole('button', { name: 'Ñ', exact: true })
              .click()
          else await page.keyboard.press(c)
        await page.getByRole('button', { name: 'Sjekk' }).click()
        await page.getByText('¡Bien escrito!').waitFor()
        right = true
      } else if (i % 3 === 0) {
        await page.getByRole('button', { name: 'Vis ordet' }).click()
      } else if (i % 3 === 1) {
        await page
          .locator('.so-typer')
          .getByRole('button', { name: 'Q', exact: true })
          .click()
        await page.getByRole('button', { name: 'Sjekk' }).click()
      } else {
        await page.keyboard.type('qq')
        await page.keyboard.press('Enter')
      }
      await page.locator('.so-after').waitFor()
      await page.getByRole('button', { name: /^Neste/ }).click()
    }
    expect(right, 'a word written right')
    await page.getByText(/av 8 riktig skrevet/).waitFor()
    await page.getByRole('button', { name: 'En diktat til' }).click()
    await page.waitForSelector('.so-typer')
  },
  { learner: true },
)

// The syllables on Acento's lanterns, and the word they are, of the kinds
// asked
async function acentoWord(page, kinds) {
  const syl = await page.locator('.ac-lantern .body').allTextContents()
  const art = (await visible(page, '.ac-wire .art'))
    ? await page.locator('.ac-wire .art').textContent()
    : null
  const w = WORDS.find(
    (x) =>
      untilde(x.bare) === syl.join('') &&
      kinds.includes(kindOfWord(x.id)) &&
      (art ? x.es.startsWith(`${art} `) : x.es === x.bare),
  )
  expect(w, `no word in ${syl.join('-')}`)
  return wordItem(w)
}

await test(
  'Acento finds the stress of ten words, opens a rule, and sets a mark',
  async (page) => {
    await go(page, '#acento')
    await page.getByText('Llanas y agudas').waitFor()
    await page.getByRole('button', { name: /Empezar/ }).click()
    // Nine right, by touch and by key, and one wrong
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('.ac-lantern:not([disabled])')
      const { stress } = await acentoWord(page, ['llana', 'aguda'])
      const at = i === 3 ? (stress ? 0 : 1) : stress
      if (i % 2) await page.keyboard.press(String(at + 1))
      else await page.locator('.ac-lantern').nth(at).click()
      await page.locator('.ac-after').waitFor()
      await page.getByRole('button', { name: /^Neste/ }).click()
    }
    await page.getByText('9 av 10 riktige').waitFor()
    await page.getByText('Ny regel:').waitFor()
    await page.getByRole('button', { name: /Neste regel/ }).click()
    // The second rule: the stress, and then the mark where it goes
    await page.waitForSelector('.ac-lantern:not([disabled])')
    expect(
      (await page.locator('.ac-rule').textContent()) === '2',
      'on the second rule',
    )
    const item = await acentoWord(page, ['llana', 'aguda', 'tilde'])
    await page.locator('.ac-lantern').nth(item.stress).click()
    await page.waitForSelector('.ac-letters .v:not([disabled])')
    if (item.mark < 0)
      await page.getByRole('button', { name: /Uten aksent/ }).click()
    else {
      const before = [...item.plain.join('').slice(0, item.mark)]
      const v = before.filter((c) => /[aeiou]/.test(c)).length
      await page.locator('.ac-letters .v').nth(v).click()
    }
    await page.getByText('¡Olé!').waitFor()
  },
  { learner: true },
)

await test(
  'Acento’s lanterns hang inside a phone',
  async (page) => {
    await go(page, '#acento')
    await page.getByRole('button', { name: /Empezar/ }).click()
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('.ac-lantern:not([disabled])')
      const wide = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(wide <= 0, `${wide}px too wide`)
      for (const box of await page
        .locator('.ac-lantern')
        .evaluateAll((els) => els.map((e) => e.getBoundingClientRect())))
        expect(box.left >= 0 && box.right <= 390, 'a lantern off the screen')
      await page.locator('.ac-lantern').first().click()
      await page.getByRole('button', { name: /^Neste/ }).click()
    }
  },
  { phone: true, learner: true },
)

// The numbers Números has dealt for the round, in order, from the ids it
// keeps of the numbers heard (the round's kind one after another, then the
// lottery's)
async function numerosDealt(page) {
  const ids = await page.evaluate(
    () => JSON.parse(localStorage.getItem('hola:numeros:v1')).heard,
  )
  return ids.map((id) => [...DECK, ...LOTTERY].find((x) => x.id === id))
}

await test(
  'Números takes six prices by ear and three numbers from the lottery',
  async (page) => {
    await go(page, '#numeros')
    await page.getByRole('radio', { name: 'Priser' }).click()
    await page.getByRole('button', { name: 'Begynn' }).click()
    const items = await numerosDealt(page)
    expect(
      items.length === 9 &&
        items.slice(0, 6).every((x) => x.kind === 'price') &&
        items.slice(6).every((x) => x.kind === 'lottery'),
      `dealt ${items.map((x) => x?.id)}`,
    )
    const pad = page.locator('.nu-pad')
    for (const [n, item] of items.entries()) {
      if (n === 6)
        await page.getByRole('button', { name: 'Til trekningen' }).click()
      await page.waitForSelector('.nu-field')
      const keys = [...item.answer.replace(/ /g, '')]
      if (n === 0) {
        // By touch, a wrong digit taken back first
        await pad.getByRole('button', { name: '9', exact: true }).click()
        await pad.getByRole('button', { name: 'Visk ut' }).click()
        for (const k of keys)
          await pad.getByRole('button', { name: k, exact: true }).click()
        await page.getByRole('button', { name: /Sjekk/ }).click()
      } else {
        // One wrong in each part, the rest right, by the keyboard
        if (n === 2 || n === 8) keys[0] = String((Number(keys[0]) + 1) % 10)
        for (const k of keys) await page.keyboard.press(k)
        await page.keyboard.press('Enter')
      }
      await page
        .locator(`.nu-verdict.${n === 2 || n === 8 ? 'no' : 'yes'} .answer`, {
          hasText: item.answer,
        })
        .waitFor({ timeout: 3000 })
      await page.keyboard.press('Enter')
    }
    await page.getByText('5 av 6 riktige').waitFor()
    await page.getByText('Og 2 av 3 i trekningen.').waitFor()
    expect(
      (await page.locator('.nu-list li').count()) === 9,
      'the nine numbers listed',
    )
    await page.getByRole('button', { name: 'Seks til' }).click()
    await page.waitForSelector('.nu-field')
  },
  { phone: true, learner: true },
)

await test(
  'Taxi drives a shift of five passengers',
  async (page) => {
    await go(page, '#taxi')
    await page.getByRole('button', { name: 'Start vakten' }).click()
    const stage = page.locator('.tx-stage')
    let wrong = 0
    for (let ride = 0; ride < 5; ride++) {
      // The passenger's stars as it stands, under their portrait
      const live = () => page.locator('.tx-who .tx-stars svg.on').count()
      // The words of the first instruction shown, on the first ride, for a
      // star
      if (ride === 0) {
        await page.getByRole('button', { name: 'Vis teksten' }).click()
        await page.locator('.tx-line').waitFor()
        expect((await live()) === 4, 'a star less for the words shown')
      }
      // Each move tried in turn until the passenger takes it: a wrong one
      // jolts the town, gets a complaint and costs a star
      while (!(await visible(page, '.tx-paid'))) {
        await page.waitForSelector('.tx-paid, .tx-move:not([disabled])', {
          timeout: 20000,
        })
        if (await visible(page, '.tx-paid')) break
        for (const move of ['left', 'straight', 'right', 'stop']) {
          const before = await stage.getAttribute('class')
          const had = await live()
          await page.locator(`.tx-move.${move}`).click()
          await page.waitForTimeout(150)
          if ((await stage.getAttribute('class')) === before) break
          wrong++
          expect(await visible(page, '.tx-complaint'), 'a complaint')
          expect(
            (await live()) === Math.max(1, had - 1),
            'a star less for a wrong move',
          )
          // (the passenger's moment to say so)
          await page.waitForTimeout(700)
        }
      }
      const stars = await page.locator('.tx-paid .tx-stars svg.on').count()
      expect(stars >= 1 && stars <= 5, `${stars} stars`)
      await page.locator('.tx-paid .tx-btn').click()
    }
    expect(wrong > 0, 'some moves wrong')
    await page.getByText('Vakten er over').waitFor()
    expect(
      (await page.locator('.tx-rides li').count()) === 5,
      'the five rides listed',
    )
    const bank = JSON.parse(
      await page.evaluate(() => localStorage.getItem('hola:bank:v1')),
    )
    expect(bank.best.taxi >= 5, `best ${bank.best.taxi}`)
    await page.getByRole('button', { name: 'Ny vakt' }).click()
    await page.locator('.tx-bubble').waitFor()
  },
  { phone: true, learner: true },
)

for (const learner of [false, true])
  await test(
    `the drawers open, on ${learner ? 'a learner’s' : 'a new player’s'} bank`,
    async (page) => {
      await go(page, '#cajones')
      await page.locator('.cj-drawer').first().waitFor()
      const all = await page.locator('.cj-drawer').count()
      expect(all === LESSON_COUNT, `${all} drawers`)
      expect(
        (await page.locator('.cj-drawer.st1').count()) > 3,
        'some keepsakes wrapped',
      )
      // A shut drawer is empty
      await page.locator('.cj-drawer.st0').first().click()
      await page.locator('.cj-open').getByText('Tom ennå').waitFor()
      await page.keyboard.press('Escape')
      expect(!(await visible(page, '.cj-open')), 'closed by Escape')
      // A drawer begun has its keepsake wrapped, and says its word
      await page.locator('.cj-drawer.st1').first().click()
      await page.locator('.cj-open .thing').waitFor()
      await page.locator('.cj-open .cj-word b').waitFor()
      await page.getByRole('button', { name: 'Neste skuff' }).click()
      await page.getByRole('button', { name: 'Lukk skuffen' }).click()
      if (!learner) {
        // A new player knows the greetings: their keepsake is unwrapped
        await page.locator('.cj-drawer.st2').first().click()
        await page.locator('.cj-open.st2').getByText('el pañuelo').waitFor()
      }
    },
    { learner, phone: learner },
  )

await test(
  'the museum hangs a finished theme’s picture',
  async (page) => {
    await go(page, '#museo')
    await page.locator('.mu-frame').first().waitFor()
    expect(
      !(await visible(page, '.mu-frame.hung')),
      'nothing hung for a new learner',
    )
    // Every word of En el bar de tapas learnt
    await page.evaluate(
      (ids) => {
        const bank = JSON.parse(localStorage.getItem('hola:bank:v1'))
        const t = Date.now()
        for (const id of ids)
          bank.cards[id] = {
            leer: { s: 6, t },
            oir: { s: 4, t },
            decir: { s: 3, t },
            t,
            n: 3,
            x: 0,
            i: t,
          }
        localStorage.setItem('hola:bank:v1', JSON.stringify(bank))
      },
      WORDS.filter((w) => w.lesson === 'tapeo').map((w) => w.id),
    )
    await page.reload()
    await page.locator('.mu-frame').first().waitFor()
    await page.getByRole('tab', { name: /La vida diaria/ }).click()
    await page.locator('.mu-frame.hung').first().click()
    // its painting, or its drawing until it is painted
    await page.locator('.mu-open .gilt :is(img, svg)').first().waitFor()
    await page.locator('.mu-open').getByText('La barra').waitFor()
    await page.keyboard.press('ArrowRight')
    await page.locator('.mu-open.empty').waitFor()
    await page.getByRole('button', { name: 'Tilbake til salen' }).click()
    // On through the doorway to the next room
    await page.getByRole('button', { name: /Neste sal/ }).click()
    await page.locator('.mu-sign').getByText('A la mesa').waitFor()
    // And from the home page
    await go(page, '')
    await page.getByRole('button', { name: 'Ordene', exact: true }).click()
    await page.locator('.q-coll[href="#museo"]').getByText('1 av').waitFor()
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
  'El Ictíneo dives, steers and comes home from its first voyage',
  async (page) => {
    await page.clock.install()
    await go(page, '#ictineo')
    await page.getByRole('button', { name: /^Kadett/ }).click()
    // Each order followed as soon as it is given, by the keys and by the
    // helm's buttons in turn
    const keys = {
      babor: 'ArrowLeft',
      estribor: 'ArrowRight',
      arriba: 'ArrowUp',
      abajo: 'ArrowDown',
      rapido: 'f',
      despacio: 's',
      alto: 'x',
    }
    let last = ''
    let n = 0
    for (let i = 0; i < 3000 && !(await visible(page, '.ic-end')); i++) {
      const live = page.locator('.ic-say[data-live]')
      if (await live.count()) {
        const id = await live.getAttribute('data-order')
        const at = `${id}:${await live.getAttribute('data-n')}`
        if (at !== last) {
          last = at
          n++
          expect(!!ORDER[id], `an order «${id}»`)
          // In Spanish alone: the Norwegian is not over its words
          expect(
            !(await live.locator('rt').count()),
            `«${id}» without Norwegian over it`,
          )
          for (const a of ORDER[id].do)
            if (n % 2 && keys[a]) await page.keyboard.press(keys[a])
            else await page.locator(`.ic-helm .ic-key.${a}`).click()
        }
      }
      await page.clock.runFor(250)
    }
    await page.getByText('¡Hemos vuelto!').waitFor()
    const sub = await page.locator('.ic-end .sub').textContent()
    const [, right, given] = sub.match(/(\d+) av (\d+) ordrer/) ?? []
    expect(
      Number(given) >= 10 && right === given,
      `every order followed in time: ${sub}`,
    )
    await page.getByRole('button', { name: /Neste tokt/ }).click()
    await page.getByRole('button', { name: /^Kadett/ }).waitFor()
    expect(
      await visible(page, '.ic-log button.on:has-text("El coral")'),
      'the next voyage open and chosen',
    )
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
