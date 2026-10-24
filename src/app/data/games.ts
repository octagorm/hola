// The word games, as the home page and today's chapter name them
export interface GameInfo {
  id: string
  es: string
  no: string
  blurb: string
  // Not made yet: shown on the home page, faded
  soon?: boolean
}

export const GAME_INFO: Array<GameInfo> = [
  {
    id: 'palabra',
    es: 'La palabra',
    no: 'Dagens ord',
    blurb: 'Dagens ord på seks forsøk',
  },
  {
    id: 'palabras',
    es: 'Palabras',
    no: 'Ordbrett',
    blurb: 'Scrabble med Ñ, LL og RR mot urmakeren',
  },
  {
    id: 'crucigrama',
    es: 'Mini crucigrama',
    no: 'Kryssord',
    blurb: 'Et lite kryssord av ordene dine',
  },
  {
    id: 'rosco',
    es: 'El rosco',
    no: 'Bokstavringen',
    blurb: 'En ring av bokstaver, ett hint for hver',
  },
  {
    id: 'cadaver',
    es: 'Cadáver exquisito',
    no: 'Setningsleken',
    blurb: 'Absurde setninger som må stemme',
  },
  {
    id: 'sopa',
    es: 'Sopa de letras',
    no: 'Ordleting',
    blurb: 'Ord gjemt blant blå og hvite fliser',
  },
  {
    id: 'reloj',
    es: 'El reloj blando',
    no: 'Den myke klokken',
    blurb: 'Gjett ordet før klokken smelter',
  },
  {
    id: 'porpara',
    es: 'Por o para',
    no: 'Por eller para',
    blurb: 'To dører: por eller para',
  },
  {
    id: 'tiempos',
    es: 'Ayer, hoy, mañana',
    no: 'I går, i dag, i morgen',
    blurb: 'Samme setning i går, i dag og i morgen',
  },
  {
    id: 'letras',
    es: 'Letras',
    no: 'Bokstavene',
    blurb: 'Det lengste ordet av ni bokstaver',
  },
  {
    id: 'cadena',
    es: 'Palabras encadenadas',
    no: 'Ordkjeden',
    blurb: 'Hvert ord begynner med slutten av det forrige',
  },
  {
    id: 'elola',
    es: '¿El o la?',
    no: 'Hankjønn eller hunkjønn',
    blurb: 'El eller la, før lyset brenner ned',
  },
  {
    id: 'orden',
    es: 'Orden',
    no: 'Ordstilling',
    blurb: 'Setninger lagt i spansk rekkefølge',
  },
  {
    id: 'tapas',
    es: 'Tapas',
    no: 'Baren',
    blurb: 'Én gjest om gangen bestiller ved disken',
  },
  {
    id: 'rastro',
    es: 'El Rastro',
    no: 'Loppemarkedet',
    blurb: 'Prut på loppemarkedet i Madrid',
  },
  {
    id: 'sonidos',
    es: 'Sonidos',
    no: 'Lydene',
    blurb: 'Lydene, og ord som nesten låter likt',
  },
  {
    id: 'acento',
    es: 'Acento',
    no: 'Trykk og aksent',
    blurb: 'Hvor trykket ligger, og når det får aksent',
  },
  {
    id: 'numeros',
    es: 'Números',
    no: 'Tallene',
    blurb: 'Priser, klokkeslett og årstall, hørt og skrevet',
  },
  {
    id: 'taxi',
    es: 'Taxi',
    no: 'Taxi',
    blurb: 'Kjør dit passasjeren ber om, sving for sving',
  },
]

export const GAME: Record<string, GameInfo | undefined> = Object.fromEntries(
  GAME_INFO.map((g) => [g.id, g]),
)
