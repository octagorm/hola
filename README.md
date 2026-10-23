# Hola

Spansk for nordmenn, ti minutter om dagen: et kapittel hver dag med ordene som holder på å blekne, noen nye, et ordspill eller et kapittel av Don Quijote, og litt lytting. Ligger på https://hola.ymse.land.

Fremgangen lagres i nettleseren, og på kontoen for den som logger inn med Google. Det er ingen sporing.

## Kom i gang

Du trenger [Node](https://nodejs.org) 22.12 eller nyere.

```bash
git clone git@github.com:octagorm/hola.git
cd hola
npm install
npm run dev
```

`npm run dev` starter Convex og Astro. Første gang ber Convex deg logge inn og velge prosjektet «hola», og skriver adressen i `.env.local`. Der må den hete `PUBLIC_CONVEX_URL` (står linjen `PUBLIC_CONVEX_URL=` der fra før, fyller Convex den inn). Uten den virker siden som før, bare uten innlogging. Google-innloggingen virker bare i produksjonen, som `npm run build` bruker (adressen står i `.env.production`).

Nettlesertestene trenger Chromium én gang: `npx playwright install chromium`.

## Stemmene

Spansken leses av to stemmer laget med Gemini TTS fra en beskrivelse i `src/app/data/voices.ts`, begge fra Madrid: Profesora leser ordene, Narrador setningene i Don Quijote og Cadáver exquisito. Der et opptak mangler, leser nettleserens egen spanske stemme.

Opptakene lages på Macen, der Gemini-nøkkelen (`GEMINI_API_KEY`) ligger i nøkkelringen, med [uv](https://docs.astral.sh/uv/) og ffmpeg (`brew install uv ffmpeg`):

```bash
mkdir -p .cache && node scripts/speech.ts > .cache/speech.json
uv run scripts/audio.py .cache/speech.json --dry-run --job   # hva som vil bli bestilt
uv run scripts/audio.py .cache/speech.json --job             # lag det som mangler
```

`--job` bruker Geminis batch-modus, til halv pris. Svaret kommer ofte i løpet av minutter, men kan ta opptil et døgn, og blir kjøringen avbrutt, henter neste kjøring jobbene som allerede er bestilt. Uten `--job` lages bare noen få, direkte, for å prøve en stemme, for eksempel med `--only "Hola, ¿qué tal? Poco a poco se va lejos."`. Til slutt nevner skriptet opptakene som er mye lengre eller kortere enn teksten sin, og ord som er lest med en pause inni (la … dama); dem er det verdt å lytte til eller lage på nytt. Commit så `public/audio/`, `src/app/data/audio.json` og `scripts/voices.json`. Kjør det samme igjen når ord eller setninger endres: bare det som mangler, lages, og filer som ikke brukes lenger, slettes.

## Sjekk før push

```bash
npm run lint && npm test && npm run format:check && npm run build && npm run test:e2e
```

En push til `main` legges ut av Cloudflare (Workeren «hola») et par minutter senere. Mer om koden står i [AGENTS.md](AGENTS.md).
