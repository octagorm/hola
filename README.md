# Hola

Spansk for nordmenn, ti minutter om dagen: et kapittel hver dag med ordene som holder på å blekne, noen nye, et ordspill eller et kapittel av Don Quijote, og litt lytting. Ligger på https://hola.ymse.land.

Alt lagres i nettleseren. Det er ingen konto og ingen sporing.

## Kom i gang

Du trenger [Node](https://nodejs.org) 22.12 eller nyere.

```bash
git clone git@github.com:octagorm/hola.git
cd hola
npm install
npm run dev
```

Nettlesertestene trenger Chromium én gang: `npx playwright install chromium`.

## Sjekk før push

```bash
npm run lint && npm test && npm run format:check && npm run build && npm run test:e2e
```

En push til `main` legges ut av Cloudflare (Workeren «hola») et par minutter senere. Mer om koden står i [AGENTS.md](AGENTS.md).
