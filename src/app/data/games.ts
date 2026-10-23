// The word games, as the home page and today's chapter name them
export interface GameInfo {
  id: string
  es: string
  no: string
  blurb: string
  // What the reader does in it, for the line that heads today's chapter:
  // «Hvori leseren … gjetter dagens ord …»
  doing: string
  // Not made yet: shown on the home page, faded
  soon?: boolean
}

export const GAME_INFO: Array<GameInfo> = [
  {
    id: 'palabra',
    es: 'La palabra',
    no: 'Dagens ord',
    blurb: 'Dagens ord på seks forsøk',
    doing: 'gjetter dagens ord',
  },
  {
    id: 'palabras',
    es: 'Palabras',
    no: 'Ordbrett',
    blurb: 'Scrabble med Ñ, LL og RR',
    doing: 'legger ord på brettet',
    soon: true,
  },
  {
    id: 'crucigrama',
    es: 'Mini crucigrama',
    no: 'Kryssord',
    blurb: 'Et lite kryssord av ordene dine',
    doing: 'løser et lite kryssord',
  },
  {
    id: 'rosco',
    es: 'El rosco',
    no: 'Bokstavringen',
    blurb: 'En ring av bokstaver, ett hint for hver',
    doing: 'går bokstavringen rundt',
  },
  {
    id: 'cadaver',
    es: 'Cadáver exquisito',
    no: 'Setningsleken',
    blurb: 'Absurde setninger som må stemme',
    doing: 'får absurde setninger til å stemme',
  },
  {
    id: 'sopa',
    es: 'Sopa de letras',
    no: 'Ordleting',
    blurb: 'Ord gjemt blant blå og hvite fliser',
    doing: 'finner ord gjemt blant flisene',
  },
  {
    id: 'reloj',
    es: 'El reloj blando',
    no: 'Den myke klokken',
    blurb: 'Gjett ordet før klokken smelter',
    doing: 'redder ord før klokken smelter',
  },
  {
    id: 'porpara',
    es: 'Por o para',
    no: 'Por eller para',
    blurb: 'To dører: por eller para',
    doing: 'velger mellom por og para',
  },
  {
    id: 'tiempos',
    es: 'Ayer, hoy, mañana',
    no: 'I går, i dag, i morgen',
    blurb: 'Samme setning i går, i dag og i morgen',
    doing: 'flytter setninger mellom i går, i dag og i morgen',
  },
  {
    id: 'letras',
    es: 'Letras',
    no: 'Bokstavene',
    blurb: 'Det lengste ordet av ni bokstaver',
    doing: 'finner det lengste ordet av ni bokstaver',
  },
  {
    id: 'cadena',
    es: 'Palabras encadenadas',
    no: 'Ordkjeden',
    blurb: 'Hvert ord begynner med slutten av det forrige',
    doing: 'lager en kjede av ord',
  },
  {
    id: 'elola',
    es: '¿El o la?',
    no: 'Hankjønn eller hunkjønn',
    blurb: 'El eller la, før lyset brenner ned',
    doing: 'skiller el fra la før lyset brenner ned',
  },
  {
    id: 'orden',
    es: 'Orden',
    no: 'Ordstilling',
    blurb: 'Setninger lagt i spansk rekkefølge',
    doing: 'legger åtte setninger i spansk rekkefølge',
  },
  {
    id: 'tapas',
    es: 'Tapas',
    no: 'Baren',
    blurb: 'Én gjest om gangen bestiller ved disken',
    doing: 'tar imot bestillinger i baren',
  },
  {
    id: 'rastro',
    es: 'El Rastro',
    no: 'Loppemarkedet',
    blurb: 'Prut på loppemarkedet i Madrid',
    doing: 'pruter på loppemarkedet i Madrid',
  },
]

export const GAME: Record<string, GameInfo | undefined> = Object.fromEntries(
  GAME_INFO.map((g) => [g.id, g]),
)
