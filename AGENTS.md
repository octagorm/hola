# Hola

Hola is Spanish for Norwegians, ten minutes a day, at https://hola.ymse.land. It is Tian's sibling (tian.ymse.land, Mandarin) and one of the sites of Ymseland. The Spanish is Spain's (ordenador, zumo, vosotros), and everything else the page says is Norwegian bokmål: each page's title is in Spanish with the Norwegian under it.

## The repo

- Astro with one React island (`client:only`), Tailwind v4 and lucide-react, built to static files. The app is `src/app/`; paths below without a folder are in it. `src/pages/index.astro` holds it, `om.astro` says what Hola is and what it keeps, and `404.astro` is the page for a wrong address.
- The word bank and the settings live in the browser's localStorage (`hola:bank:v1`, `lib/store.tsx`), and a backup file under Innstillinger moves them to another browser (banks are merged, each link keeping its latest answer).
- An account is optional: anyone can sign in with Google, and Convex (project `hola`) then keeps the bank on the account too (`convex/bank.ts`, as the page's own JSON), merged with the browser's the same way on sign-in and saved two seconds after a change (`lib/account.tsx`). `convex/access.ts` keeps who has signed in, which `/admin` lists for the admin. Each new account is sent to the admin's inbox at admin.ymse.land, with the sender's token in `YMSELAND_NOTIFY_TOKEN` on production's Convex (without it, nothing is sent). A build takes production's address from `.env.production` (committed; public, like every Convex URL), and `npm run dev` the development deployment's from `.env.local`. Without `PUBLIC_CONVEX_URL` (`lib/cloud.tsx`) the page shows no sign-in and asks nothing of Convex.
- Hosting: the Cloudflare Worker `hola`, built by Workers Builds on a push to `main`, on the custom domain hola.ymse.land. The files are static assets; `worker/index.ts` runs only for `/api/auth/*`, passing Google's sign-in on to production's Convex site (`CONVEX_SITE` in `wrangler.jsonc`; empty, it would pass nothing on), so that Google's page names hola.ymse.land (Convex's `CUSTOM_AUTH_SITE_URL`). Headers are in `public/_headers`. Pages build to `om.html`, so addresses have no trailing slash.
- Changes in `convex/` go to production with the site: the deploy command is `npx convex deploy && npx wrangler deploy`, with a deploy key as the build secret `CONVEX_DEPLOY_KEY`. The backend goes first, so when removing a function, push the frontend that stops calling it in an earlier push.
- Google sign-in has a Cloud project, client and brand of its own: project «Hola» (`hola-512421`), client «Hola», with `https://hola.ymse.land/api/auth/callback/google` as its only redirect URI, so Google's page says «Hola». The brand is verified and the app published (External), with `/om` as its home page, `/personvern` as its privacy policy and `ymse.land` as its authorized domain; keep `/personvern` in step with `convex/schema.ts`. Changing the app's name, home page or privacy link means verifying the brand again, and a logo means a full app review. Production's Convex is `careful-perch-235` (eu-west-1), with `SITE_URL` and `CUSTOM_AUTH_SITE_URL` https://hola.ymse.land; development's has no Google sign-in.

Commands:

- `npm run dev` – Convex and Astro (the user runs it; don't)
- `npm run build` – type check and build to `dist/`
- `npm run preview` – build and serve `dist/` with Wrangler, as Cloudflare will
- `npm test` – Vitest: the bank and today's chapter, the data, the games' rules, the Convex functions (with `convex-test`) and the Worker
- `npm run test:e2e` – the built site in Chromium (`scripts/smoke.mjs`): a new player's first day, every page on a desktop and a phone, signing in offered, and each game played through. Build first. On a new machine, `npx playwright install chromium` once
- `npm run lint`, `npm run format`, `npm run format:check`

Before committing, run `npm run lint && npm test && npm run format:check && npm run build && npm run test:e2e`. Commit as you go. Once a change is tested and the user has approved it, push it to `main` without being asked; the site is live a minute or two later. Ask first only when unsure: something half done, or a choice the user has not made.

## The app

`index.tsx` is the shell: one page per hash (`/#palabra`, `/#quijote/molinos`), each loaded lazily from `games/` and listed in `registry.tsx`, and the home page (`home.tsx`) without one. `mend.tsx` catches what breaks, so the page never goes blank: a page's code gone after a deploy reloads the page once. `daily.tsx` lets a game opened from today's chapter lead back to it. The page installs as an app (`public/manifest.webmanifest`, icons in `public/app/`, drawn from `icon.svg` by `node scripts/icons.mjs`).

- **The word bank** (`lib/bank.ts`): a word is three links, learnt apart: `leer` (reading it), `oír` (hearing it) and `decir` (saying it from its meaning, with the article). Each has a memory in the manner of FSRS, and every game records its answers with a weight for how much they say: typing a word says more than picking it. Games ask about the link that has faded most.
- **Words** (`data/words.ts`): lesson by lesson, one line per word, in the order they are met. `isClue` says whether a word can be a clue in the crossword, the ring, the word search, the soft clock and the chain (not greetings, phrases or articles); in today's chapter those games wait until enough clue words are met (`NEEDS` in `lib/today.ts`).
- **The starting point** (`data/start.ts`): Hola is made for someone who knows elementary Spanish, so every bank starts with the simplest words known and many easy ones being practised (`withStart` in `lib/bank.ts`), as cards marked as never answered, which give way to real answers in a merge. Raise `START` when a list grows.
- **Themes** (`data/themes.ts`, `games/tema.tsx`): the lessons beyond the first ones, in groups on the home page, each with a few lines on what it is about. One can be chosen as the theme (`bank.theme`), and today's chapter then meets its words before the rest (`toMeet`), from today's new words on if none of them is begun (`retheme`).
- **Today's chapter** (`lib/today.ts`, `games/hoy.tsx`): made once a day and kept in the bank, so it can be taken up where it was left: the words fading, a few new ones, a game or a chapter of a story, and a little listening. Each day finished is a stage of the Camino to Santiago and a stamp in the credential (`data/camino.ts`, `games/credencial.tsx`).
- **The stories** (`data/stories.ts`, read in `games/story.tsx`): Don Quijote first (`data/quijote.ts`), the start of the novel retold simply, in mixed text (`lib/text.ts`): words not met are in Norwegian in Spanish order, words being practised in Spanish with the Norwegian over, words known in Spanish alone. The markup is described at the top of `data/quijote.ts`, and the tests check that every word is in the bank. Each story is a page of its own in `registry.tsx`, all with the same reader; a chapter's id is unique across the stories, since the bank keeps the chapters read by id, and today's chapter takes the next one unread, story by story. A chapter may have a painted picture (`img`) where Don Quijote has its ink drawings. The home page's index (`INDEX` in `home.tsx`) shows a story not written yet faded.
- **Speech** (`lib/speech.ts`): Spanish recorded ahead with Gemini TTS on the user's Mac (see The recordings, below), played in one audio element (Safari lets an element play by itself only once a touch has started it, so the first touch wakes it and a word a game says by itself is heard too), at Ajustes' speed and slower for the snail, between half and twice the normal speed. A text without a recording, or one that will not play, is said by the browser's own Spanish voice, Spain's first; Ajustes offers the browser's voices only while there are no recordings. One thing is said at a time, and `?mute` silences the page for tests: speech still takes its time but is not heard. The two voices are designed from a description in `data/voices.ts`, both from Madrid with distinción: Profesora says the words, their forms in the story (a tapped word's card), the plurals and adjective forms Letras takes (`SAID` in `lib/letras.ts`) and the sample in Ajustes; Narrador says the story's lines and Cadáver's sentences, which come from a fixed deck of 360 made with a seeded generator (`DECK` in `lib/cadaver.ts`), so that each can have a recording. `lib/spoken.ts` lists everything said aloud, so anything new the page says must be listed there. Sounds (`lib/sound.ts`) and the guitar (`lib/music.ts`) are made with Web Audio, with no files.

The games:

| Game                 | File                   | What it is, and its look                                                                  |
| -------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| La palabra           | `games/palabra.tsx`    | The day's word in six guesses, as in Wordle; pearls in a night sky after Galatea          |
| Mini crucigrama      | `games/crucigrama.tsx` | A small crossword of the words whose saying has faded most; the dusk of Destino           |
| El rosco             | `games/rosco.tsx`      | A ring of letters, a word for each from its meaning, as in Pasapalabra; the Teatro-Museo  |
| Cadáver exquisito    | `games/cadaver.tsx`    | Absurd sentences from random parts, where the verb and the adjective must agree; 1969 pop |
| Sopa de letras       | `games/sopa.tsx`       | A word search of words met, found from their meanings; azulejos with lemons               |
| El reloj blando      | `games/reloj.tsx`      | Hangman where each wrong letter melts the watch; a desert poster of the 1930s             |
| Letras               | `games/letras.tsx`     | The longest word of hers in nine letters, asked for one by one; a letterpress print shop  |
| Palabras encadenadas | `games/cadena.tsx`     | Eight words, each begun by the last syllable of the one before; paper flags at a verbena  |
| Repaso, Nuevas       | `games/repaso.tsx` …   | Ten faded words; five new ones. The questions are in `quiz.tsx`                           |
| Tus palabras         | `games/ordbank.tsx`    | Every word, lesson by lesson, and how well each link holds                                |

`data/games.ts` names the games for the home page and today's chapter; Palabras (Scrabble with Ñ, LL and RR) and Tapas (orders called across a bar) are there marked `soon`, shown faded until they are made.

## The recordings

They are made on the user's Mac, where the Gemini key is (`GEMINI_API_KEY` from the environment, `.env.local` or the Keychain, kept with `security add-generic-password -a "$USER" -s GEMINI_API_KEY -w`), with uv and ffmpeg. Nobody can call Gemini from elsewhere, so a change that needs new recordings is finished there:

```bash
mkdir -p .cache && node scripts/speech.ts > .cache/speech.json
uv run scripts/audio.py .cache/speech.json --dry-run --job   # what would be asked for
uv run scripts/audio.py .cache/speech.json --job             # make it
```

`scripts/audio.py` asks for each item on its own. With `--job` it uses Gemini's batch mode, at half the price, answered within a day and often within minutes; the jobs are noted in `.cache/jobs.json`, so a run cut short picks them up again. Without it, up to `--max` (10) are asked for directly, or those named with `--only "text"`, to try a voice; `--voice` keeps to one voice's items. Each answer is trimmed of its silence (the quiet edges, such as a final s, are kept) and becomes `public/audio/<id>.mp3`, named by a hash of the file itself, and `data/audio.json` maps `voice|text` to it; files no longer used are removed. `public/_headers` lets browsers keep `/audio/*` for a year as immutable, which is safe because a recording made again gets a new name. The designed voices' ids are kept in `scripts/voices.json`: delete one to design that voice again, then `--remake <name>` (or `--remake words`, `lines`) to read its items again. At the end it names the recordings far from the length of their text, and words said with a pause inside them (la ... dama), to listen to or make again. Commit `public/audio/`, `data/audio.json` and `scripts/voices.json`. Once `audio.json` has entries, `tests/speech.test.ts` fails while anything listed has no recording, or a file is left over or not named by its hash.

## The look

The home page and the pages around the games are Don Quijote in ink on paper, with a wash of colour (`hola.css`, classes `q-`; the drawings are in `art.tsx`, roughened by the filters in `ui.tsx`). The user chose this look; keep it. Each game has a look of its own, with its own fonts (`useFont`) and a CSS file whose classes have a prefix of their own (`g5-`, `d4-`, `r6-`, `c6-`, …). The first four are drawn freely after moods from Salvador Dalí's world. The later ones follow the user's taste in flat graphic printmaking and posters (woodcut, linocut, hand-coloured woodcut, paper-cut, ligne claire, 1930s travel posters) in Spanish forms such as azulejos, aleluyas, the baraja española and feria posters, after the sketches in `design/sketches/`, painted with ChatGPT, which the user allows freely. The user dislikes glossy 3D, photographs, neon, painterly oil, crowds and kitsch. Dalí's works are protected until the end of 2059, so draw anew and never copy a painting, and leave out the Chupa Chups logo. No emoji in the graphics; lucide icons for plain controls.

Astro puts the games' CSS before `hola.css`, so a rule in `hola.css` beats a game's rule of the same weight. Keep the shell's rules on elements weak (`:where(…)`), and never style bare elements there.

## Privacy

Without an account nothing leaves the browser. Signed in, the account keeps the name and address Google gives, and the word bank, in Convex in the EU (Ireland); the sign-in's own cookies last only while it is under way. No analytics and no tracking. The fonts come from Google Fonts. `/om` and `/personvern` say so; keep them in step with what is stored.

## Looking at a change

Build, then take screenshots with `node scripts/shot.mjs '' '#palabra' /om` (`--mobile` for a phone, `--learner` to start from a bank some weeks in, `--click "<text>"`, `--full`, `--wait <ms>`; they land in `shots/`). The screenshots and the browser tests answer from `dist/` as `http://hola.test` (`scripts/serve.mjs`), with no server, and go through `HTTPS_PROXY` when it is set, for the fonts. They answer Convex's socket themselves and leave it silent, so they never reach production and nobody is signed in.
