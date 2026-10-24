// Taxi: the town the taxi drives in, the places in it, and everything the
// passenger says. A fixed set of lines in mixed text (lib/text.ts has the
// markup), so that each can be recorded; lib/taxi.ts picks among them as it
// plans a ride, and games/taxi.tsx plays it. The passenger speaks as one
// speaks to a taxi driver in Spain: politely, with usted (gire, siga, pare).

// The town is a grid of crossings, NX × NY, with blocks between them. Each
// block is split into four lots, one at each corner; a lot touches one
// crossing, and two streets.
export const NX = 5
export const NY = 5

// A lot: block (bx, by), the one between crossings (bx, by) and
// (bx + 1, by + 1), and its corner: 0 north-west, 1 north-east,
// 2 south-west, 3 south-east
export interface Lot {
  bx: number
  by: number
  q: 0 | 1 | 2 | 3
}

// What a place looks like on the map (games/taxiMap.tsx)
export type Kind =
  | 'bank'
  | 'bar'
  | 'church'
  | 'cinema'
  | 'hospital'
  | 'hotel'
  | 'market'
  | 'museum'
  | 'pharmacy'
  | 'station'

export interface Place {
  // The word in the bank
  id: string
  kind: Kind
  lot: Lot
  // Its sign, as it is written over the door
  sign: string
}

// The places, each once in town. They stand together in three blocks, so
// that nearly every one has another on the same side of the street just
// before it, and the passenger can only be let off at the right door by ear:
// el banco after la iglesia, el bar after el banco (near in sound), el cine
// after el bar, la iglesia after el cine, round one block; el hotel after el
// hospital, el hospital after la farmacia, in another; el museo after el
// mercado, la estación after el museo, in the third.
export const PLACES: Array<Place> = [
  { id: 'el banco', kind: 'bank', lot: { bx: 1, by: 1, q: 0 }, sign: 'BANCO' },
  { id: 'el bar', kind: 'bar', lot: { bx: 1, by: 1, q: 1 }, sign: 'BAR' },
  {
    id: 'la iglesia',
    kind: 'church',
    lot: { bx: 1, by: 1, q: 2 },
    sign: 'IGLESIA',
  },
  { id: 'el cine', kind: 'cinema', lot: { bx: 1, by: 1, q: 3 }, sign: 'CINE' },
  {
    id: 'el hospital',
    kind: 'hospital',
    lot: { bx: 3, by: 1, q: 2 },
    sign: 'HOSPITAL',
  },
  { id: 'el hotel', kind: 'hotel', lot: { bx: 3, by: 1, q: 0 }, sign: 'HOTEL' },
  {
    id: 'la farmacia',
    kind: 'pharmacy',
    lot: { bx: 3, by: 1, q: 3 },
    sign: 'FARMACIA',
  },
  {
    id: 'el mercado',
    kind: 'market',
    lot: { bx: 1, by: 3, q: 0 },
    sign: 'MERCADO',
  },
  {
    id: 'el museo',
    kind: 'museum',
    lot: { bx: 1, by: 3, q: 1 },
    sign: 'MUSEO',
  },
  {
    id: 'la estación',
    kind: 'station',
    lot: { bx: 1, by: 3, q: 3 },
    sign: 'ESTACIÓN',
  },
]

// Two blocks with no houses and no place to stop at, for the map's sake:
// the town square, with its fountain, and a little park
export const SQUARE = { bx: 2, by: 2 }
export const PARK = { bx: 3, by: 3 }

// Where the first passenger of a shift gets in: off the train
export const FIRST_STOP = 'la estación'

// --- What the passenger says ---

export type Turn = 'left' | 'right'

// The side, as a word of the bank
export const SIDE: Record<Turn, string> = {
  left: 'a la izquierda',
  right: 'a la derecha',
}
const side = (t: Turn) => SIDE[t].replaceAll(' ', '_')

// The second and the third street, as said (la segunda calle) and as the
// bank has them
export const COUNTS = [
  { form: 'segunda', id: 'segundo' },
  { form: 'tercera', id: 'tercero' },
] as const
export type Count = (typeof COUNTS)[number]

// «al banco», «a la estación»: to a place, a and el made one
function to(id: string, cap = false) {
  const [art, ...rest] = id.split(' ')
  const noun = rest.join('_')
  const a = cap ? 'A' : 'a'
  return art === 'el'
    ? `${cap ? 'Al' : 'al'} ${noun}>${id.replaceAll(' ', '_')}`
    : `${a} ${id.replaceAll(' ', '_')}`
}

// «delante del banco», «delante de la estación»
function before(id: string) {
  const [art, ...rest] = id.split(' ')
  return art === 'el'
    ? `delante_del>delante_de ${rest.join('_')}>${id.replaceAll(' ', '_')}`
    : `delante_de ${id.replaceAll(' ', '_')}`
}

// Each kind of thing the passenger says, in mixed text, with the Norwegian
// for a word set where its first sense would mislead here (gire is «sving»,
// not «snurre»; al llegar is «når du kommer»)
export const SAY = {
  // Getting in: where to
  go: (place: string) => `Buenas_tardes . ${to(place, true)} , por_favor .`,
  // At the next crossing
  turn: (t: Turn) => `Gire>girar=sving ${side(t)} , por_favor .`,
  ahead: (t: Turn) => `En=ved la próxima>próximo , ${side(t)} .`,
  straight: 'Todo_recto .',
  forward: 'Siga>seguir=kjør todo_recto , por_favor .',
  // At the second or third crossing
  count: (n: Count, t: Turn) =>
    `En la ${n.form}>${n.id} calle>la_calle=gata , ${side(t)} .`,
  // At the crossing by a place
  at: (place: string, t: Turn) =>
    `Al=når llegar=du_kommer ${to(place)} , ${side(t)} .`,
  // Where to stop
  stop: (place: string) => `Pare>parar=stopp ${before(place)} , por_favor .`,
  // A wrong move
  wrong: [
    'No , no , por=denne aquí=veien no=ikke .',
    'Perdón , pero no=ikke es>ser=er por=denne aquí=veien .',
    'No=ikke es>ser=er por=denne aquí=veien , perdón .',
  ],
  // Turning at a crossing before the one meant
  early: 'Aquí no=ikke , un_poco_más=litt_lenger .',
  // Stopping in front of the wrong place
  notHere: 'No , no=ikke es>ser=er aquí .',
  // Getting out
  thanks: [
    'Muchas_gracias . ¡ Adiós !',
    'Aquí es>ser=er_det . ¡ Gracias !',
    'Muy bien , gracias . ¡ Hasta_luego !',
  ],
}

// Every line the passenger can say
export const TAXI_LINES: Array<string> = [
  ...PLACES.flatMap((p) => [
    SAY.go(p.id),
    SAY.at(p.id, 'left'),
    SAY.at(p.id, 'right'),
    SAY.stop(p.id),
  ]),
  ...(['left', 'right'] as const).flatMap((t) => [
    SAY.turn(t),
    SAY.ahead(t),
    ...COUNTS.map((n) => SAY.count(n, t)),
  ]),
  SAY.straight,
  SAY.forward,
  ...SAY.wrong,
  SAY.early,
  SAY.notHere,
  ...SAY.thanks,
]

// The words the controls and the signs show, met as the first shift
// starts: the sides, straight on, stopping, and the places
export const FIRST_WORDS = [
  'a la izquierda',
  'a la derecha',
  'todo recto',
  'parar',
  ...PLACES.map((p) => p.id),
]

// The meter, in euros: the flag drop, and a little for each block after
// the first two
export const FARE_START = 2.55
export const FARE_BLOCK = 0.7
export const FARE_FREE = 2
