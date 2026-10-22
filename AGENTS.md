# Hola

Hola is Spanish for Norwegians, ten minutes a day, at https://hola.ymse.land. It is Tian's sibling (tian.ymse.land, Mandarin) and one of the sites of Ymseland. The Spanish is Spain's (ordenador, zumo, vosotros), and everything else the page says is Norwegian bokmål: each page's title is in Spanish with the Norwegian under it.

## The repo

- Astro with one React island (`client:only`), Tailwind v4 and lucide-react, built to static files. The app is `src/app/`; paths below without a folder are in it. `src/pages/index.astro` holds it, `om.astro` says what Hola is and what it keeps, and `404.astro` is the page for a wrong address.
- No backend and no account: the word bank and the settings live in the browser's localStorage (`hola:bank:v1`, `lib/store.tsx`), and a backup file under Innstillinger moves them to another browser (banks are merged, each link keeping its latest answer).
- Hosting: the Cloudflare Worker `hola`, static assets only (`wrangler.jsonc`, no Worker code), built by Workers Builds on a push to `main` (build `npm run build`, deploy `npx wrangler deploy`), on the custom domain hola.ymse.land. Headers are in `public/_headers`. Pages build to `om.html`, so addresses have no trailing slash.

Commands:

- `npm run dev` – Astro's dev server (the user runs it; don't)
- `npm run build` – type check and build to `dist/`
- `npm run preview` – build and serve `dist/` with Wrangler, as Cloudflare will
- `npm test` – Vitest: the bank and today's chapter, the data, the games' rules
- `npm run test:e2e` – the built site in Chromium (`scripts/smoke.mjs`): a new player's first day, every page on a desktop and a phone, and each game played through. Build first. On a new machine, `npx playwright install chromium` once
- `npm run lint`, `npm run format`, `npm run format:check`

Before committing, run `npm run lint && npm test && npm run format:check && npm run build && npm run test:e2e`. Commit as you go. Once a change is tested and the user has approved it, push it to `main` without being asked; the site is live a minute or two later. Ask first only when unsure: something half done, or a choice the user has not made.

## The app

`index.tsx` is the shell: one page per hash (`/#palabra`, `/#quijote/molinos`), each loaded lazily from `games/` and listed in `registry.tsx`, and the home page (`home.tsx`) without one. `mend.tsx` catches what breaks, so the page never goes blank: a page's code gone after a deploy reloads the page once. `daily.tsx` lets a game opened from today's chapter lead back to it. The page installs as an app (`public/manifest.webmanifest`, icons in `public/app/`, drawn from `icon.svg` by `node scripts/icons.mjs`).

- **The word bank** (`lib/bank.ts`): a word is three links, learnt apart: `leer` (reading it), `oír` (hearing it) and `decir` (saying it from its meaning, with the article). Each has a memory in the manner of FSRS, and every game records its answers with a weight for how much they say: typing a word says more than picking it. Games ask about the link that has faded most.
- **Words** (`data/words.ts`): lesson by lesson, one line per word, in the order they are met. `isClue` says whether a word can be a clue in the crossword and the ring (not greetings, phrases or articles); those two games wait until enough clue words are met (`NEEDS` in `lib/today.ts`).
- **Today's chapter** (`lib/today.ts`, `games/hoy.tsx`): made once a day and kept in the bank, so it can be taken up where it was left: the words fading, a few new ones, a game or a chapter of Don Quijote, and a little listening. Each day finished is a stage of the Camino to Santiago and a stamp in the credential (`data/camino.ts`, `games/credencial.tsx`).
- **Don Quijote** (`data/quijote.ts`, `games/quijote.tsx`): the start of the novel retold simply, in mixed text (`lib/text.ts`): words not met are in Norwegian in Spanish order, words being practised in Spanish with the Norwegian over, words known in Spanish alone. The markup is described at the top of `data/quijote.ts`, and the tests check that every word is in the bank.
- **Speech** (`lib/speech.ts`) is the browser's own Spanish voices, Spain's first. `?mute` silences the page for tests: speech still takes its time but is not heard. Sounds (`lib/sound.ts`) and the guitar (`lib/music.ts`) are made with Web Audio, with no files.

The games:

| Game              | File                   | What it is, and its look                                                                  |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| La palabra        | `games/palabra.tsx`    | The day's word in six guesses, as in Wordle; pearls in a night sky after Galatea          |
| Mini crucigrama   | `games/crucigrama.tsx` | A small crossword of the words whose saying has faded most; the dusk of Destino           |
| El rosco          | `games/rosco.tsx`      | A ring of letters, a word for each from its meaning, as in Pasapalabra; the Teatro-Museo  |
| Cadáver exquisito | `games/cadaver.tsx`    | Absurd sentences from random parts, where the verb and the adjective must agree; 1969 pop |
| Repaso, Nuevas    | `games/repaso.tsx` …   | Ten faded words; five new ones. The questions are in `quiz.tsx`                           |
| Tus palabras      | `games/ordbank.tsx`    | Every word, lesson by lesson, and how well each link holds                                |

`data/games.ts` names the games for the home page and today's chapter; Palabras (Scrabble with Ñ, LL and RR) and Tapas (orders called across a bar) are there marked `soon`, shown faded until they are made.

## The look

The home page and the pages around the games are Don Quijote in ink on paper, with a wash of colour (`hola.css`, classes `q-`; the drawings are in `art.tsx`, roughened by the filters in `ui.tsx`). The user chose this look; keep it. Each game has a look of its own, with its own fonts (`useFont`) and a CSS file whose classes have a prefix of their own (`g5-`, `d4-`, `r6-`, `c6-`), drawn freely after moods from Salvador Dalí's world. His works are protected until the end of 2059, so draw anew and never copy a painting, and leave out the Chupa Chups logo. No emoji in the graphics; lucide icons for plain controls.

Astro puts the games' CSS before `hola.css`, so a rule in `hola.css` beats a game's rule of the same weight. Keep the shell's rules on elements weak (`:where(…)`), and never style bare elements there.

## Privacy

Nothing leaves the browser: no account, no cookies, no analytics, no tracking. The fonts come from Google Fonts. `/om` says so; keep it in step if that ever changes.

## Looking at a change

Build, then take screenshots with `node scripts/shot.mjs '' '#palabra' /om` (`--mobile` for a phone, `--learner` to start from a bank some weeks in, `--click "<text>"`, `--full`, `--wait <ms>`; they land in `shots/`). The screenshots and the browser tests answer from `dist/` as `http://hola.test` (`scripts/serve.mjs`), with no server, and go through `HTTPS_PROXY` when it is set, for the fonts.
