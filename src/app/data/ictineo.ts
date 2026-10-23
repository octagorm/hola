// El Ictíneo: Narciso Monturiol's wooden submarine of 1859, and what its
// captain says at the helm. Each order is a line of mixed text
// (lib/text.ts), what the helm must do for it, and the words that decide
// what that is; the captain's other lines are said on the way. The rules
// and the course of a dive are in lib/ictineo.ts.
//
// Every text is said in the captain's voice (data/voices.ts), recorded by
// its text, so no two are the same.

// The helm's controls: four ways to steer, three speeds, and the tools a
// voyage has
export type Action =
  | 'babor'
  | 'estribor'
  | 'arriba'
  | 'abajo'
  | 'rapido'
  | 'despacio'
  | 'alto'
  | 'escotilla'
  | 'coral'
  | 'ancla'
  | 'lampara'

export const STEER: Array<Action> = ['babor', 'arriba', 'abajo', 'estribor']
export const SPEED: Array<Action> = ['rapido', 'despacio', 'alto']
export type Tool = 'escotilla' | 'coral' | 'ancla' | 'lampara'

export interface Order {
  id: string
  line: string
  no: string
  // What the helm must do, step by step
  do: Array<Action>
  // For each step, the words that say what to do: an order followed is
  // right on these, and a wrong move wrong on them (the others are what
  // goes with it, as «¡Una roca!» with «¡A babor!»)
  keys: Array<Array<string>>
}

export interface Line {
  id: string
  line: string
  no: string
}

// An order: its id, its line, its Norwegian, and each step with its words
const o = (
  id: string,
  line: string,
  no: string,
  ...steps: Array<[Action, ...Array<string>]>
): Order => ({
  id,
  line,
  no,
  do: steps.map((s) => s[0]),
  keys: steps.map((s) => s.slice(1)),
})

const PORT = 'a_babor>a_babor=babord'
const STARBOARD = 'a_estribor>a_estribor=styrbord'
const DIVE = 'Inmersión>la_inmersión=dykk'
const SURFACE = 'A la_superficie>la_superficie=overflaten'
const HATCH = 'la_escotilla>la_escotilla=luken'
const LAMP = 'la_lámpara>la_lámpara=lampen'

export const ORDERS: Array<Order> = [
  // Steering, under water: babor is the ship's left, estribor its right
  o('babor', `¡ A_babor>a_babor=babord !`, 'Babord!', ['babor', 'a babor']),
  o('estribor', `¡ A_estribor>a_estribor=styrbord !`, 'Styrbord!', [
    'estribor',
    'a estribor',
  ]),
  o('todo-babor', `¡ Todo=hardt ${PORT} !`, 'Hardt babord!', [
    'babor',
    'a babor',
  ]),
  o('todo-estribor', `¡ Todo=hardt ${STARBOARD} !`, 'Hardt styrbord!', [
    'estribor',
    'a estribor',
  ]),
  o(
    'roca-babor',
    `¡ Una_roca>la_roca=en_klippe ! ¡ A_babor>a_babor=babord !`,
    'En klippe! Babord!',
    ['babor', 'a babor'],
  ),
  o(
    'roca-estribor',
    `¡ Una_roca>la_roca=en_klippe ! ¡ A_estribor>a_estribor=styrbord !`,
    'En klippe! Styrbord!',
    ['estribor', 'a estribor'],
  ),
  o(
    'cuidado-babor',
    `¡ Cuidado>¡cuidado! ! ¡ A_babor>a_babor=babord !`,
    'Pass på! Babord!',
    ['babor', 'a babor'],
  ),
  o(
    'cuidado-estribor',
    `¡ Cuidado>¡cuidado! ! ¡ A_estribor>a_estribor=styrbord !`,
    'Pass på! Styrbord!',
    ['estribor', 'a estribor'],
  ),
  o('arriba', '¡ Arriba !', 'Opp!', ['arriba', 'arriba']),
  o('abajo', '¡ Abajo !', 'Ned!', ['abajo', 'abajo']),
  o('mas-arriba', '¡ Más arriba !', 'Høyere opp!', ['arriba', 'arriba']),
  o('mas-abajo', '¡ Más abajo !', 'Lenger ned!', ['abajo', 'abajo']),
  o('rocas-arriba', '¡ Rocas>la_roca=klipper ! ¡ Arriba !', 'Klipper! Opp!', [
    'arriba',
    'arriba',
  ]),
  o('fondo-arriba', '¡ El_fondo>el_fondo=bunnen ! ¡ Arriba !', 'Bunnen! Opp!', [
    'arriba',
    'arriba',
  ]),
  o('barco-abajo', '¡ Un_barco>el_barco=en_båt ! ¡ Abajo !', 'En båt! Ned!', [
    'abajo',
    'abajo',
  ]),
  o('red-abajo', '¡ Una_red>la_red=et_garn ! ¡ Abajo !', 'Et garn! Ned!', [
    'abajo',
    'abajo',
  ]),

  // Diving and coming up
  o('inmersion', `¡ ${DIVE} !`, 'Dykk!', ['abajo', 'la inmersión']),
  o(
    'ola-inmersion',
    `¡ Una_ola>la_ola=en_bølge ! ¡ ${DIVE} !`,
    'En bølge! Dykk!',
    ['abajo', 'la inmersión'],
  ),
  o('sumergimos', '¡ Nos_sumergimos>sumergirse=vi_dykker !', 'Vi dykker!', [
    'abajo',
    'sumergirse',
  ]),
  o('superficie', `¡ ${SURFACE} !`, 'Opp til overflaten!', [
    'arriba',
    'la superficie',
  ]),
  o(
    'aire-superficie',
    `¡ Aire>el_aire=luft ! ¡ ${SURFACE} !`,
    'Luft! Opp til overflaten!',
    ['arriba', 'el aire', 'la superficie'],
  ),
  // (the first voyage keeps to arriba, which it has just met)
  o('aire-arriba', '¡ Aire>el_aire=luft ! ¡ Arriba !', 'Luft! Opp!', [
    'arriba',
    'arriba',
  ]),

  // Speed: four men turn the propeller by hand, faster or slower
  o('avante', '¡ Avante !', 'Forover!', ['rapido', 'avante']),
  o('avante-toda', '¡ Avante toda>todo=full_fart !', 'Full fart forover!', [
    'rapido',
    'avante',
  ]),
  o('rapido', '¡ Más rápido=fort !', 'Fortere!', ['rapido', 'rápido']),
  o('despacio', '¡ Despacio !', 'Sakte!', ['despacio', 'despacio']),
  o('mas-despacio', '¡ Más despacio !', 'Saktere!', ['despacio', 'despacio']),
  o(
    'muelle-despacio',
    '¡ El_muelle>el_muelle=kaia ! ¡ Despacio !',
    'Kaia! Sakte!',
    ['despacio', 'despacio'],
  ),
  o('alto', '¡ Alto>¡alto! !', 'Stopp!', ['alto', '¡alto!']),
  o(
    'llegado-alto',
    '¡ Hemos_llegado>llegar=vi_er_framme ! ¡ Alto>¡alto! !',
    'Vi er framme! Stopp!',
    ['alto', '¡alto!'],
  ),
  o(
    'alto-ancla',
    '¡ Alto>¡alto! ! ¡ Echa>echar=slipp el_ancla>el_ancla=ankeret !',
    'Stopp! Slipp ankeret!',
    ['alto', '¡alto!'],
    ['ancla', 'el ancla'],
  ),

  // The tools: the hatch on top, the claw for coral, the lamp
  o(
    'coge-coral',
    '¡ Coge>coger=ta el_coral>el_coral=korallen !',
    'Ta korallen!',
    ['coral', 'el coral'],
  ),
  o('mas-coral', '¡ Más coral>el_coral=korall !', 'Mer korall!', [
    'coral',
    'el coral',
  ]),
  o('cierra-escotilla', `¡ Cierra>cerrar=lukk ${HATCH} !`, 'Lukk luken!', [
    'escotilla',
    'la escotilla',
  ]),
  o('abre-escotilla', `¡ Abre>abrir=åpne ${HATCH} !`, 'Åpne luken!', [
    'escotilla',
    'la escotilla',
  ]),
  o(
    'cierra-inmersion',
    `¡ Cierra>cerrar=lukk ${HATCH} ! ¡ ${DIVE} !`,
    'Lukk luken! Dykk!',
    ['escotilla', 'la escotilla'],
    ['abajo', 'la inmersión'],
  ),
  o('enciende', `¡ Enciende>encender=tenn ${LAMP} !`, 'Tenn lampen!', [
    'lampara',
    'la lámpara',
  ]),
  o('apaga', `¡ Apaga>apagar=slokk ${LAMP} !`, 'Slokk lampen!', [
    'lampara',
    'la lámpara',
  ]),
  o('luz', '¡ Luz>la_luz=lys !', 'Lys!', ['lampara', 'la luz']),
]

export const ORDER: Record<string, Order | undefined> = Object.fromEntries(
  ORDERS.map((x) => [x.id, x]),
)

const COMRADES = 'compañeros>el_compañero=kamerater'
const LOOK = 'Mira>mirar=se'

// What the captain says between the orders
export const LINES: Array<Line> = [
  {
    id: 'hola',
    line: '¡ Buenos_días ! Soy>ser=jeg_er ^Narciso_Monturiol .',
    no: 'God morgen! Jeg er Narciso Monturiol.',
  },
  {
    id: 'este',
    line: 'Este=dette es>ser=er ^el_Ictíneo , mi submarino>el_submarino=ubåt .',
    no: 'Dette er Ictíneo, ubåten min.',
  },
  {
    id: 'gira',
    line: '¡ La_hélice>la_hélice=propellen gira>girar=går_rundt !',
    no: 'Propellen går rundt!',
  },
  {
    id: 'veinte',
    line: '¡ Veinte metros>el_metro=meter ! ¡ Muy bien !',
    no: 'Tjue meter! Veldig bra!',
  },
  {
    id: 'peces',
    line: `¡ ${LOOK} , peces>el_pez=fisker !`,
    no: 'Se, fisker!',
  },
  {
    id: 'vuelto',
    line: `¡ Hemos_vuelto>volver=vi_er_tilbake ! ¡ Gracias , ${COMRADES} !`,
    no: 'Vi er tilbake! Takk, kamerater!',
  },
  {
    id: 'mucho-coral',
    line: 'Aquí hay mucho coral>el_coral=korall .',
    no: 'Her er det mye korall.',
  },
  {
    id: 'faro',
    line: `¡ ${LOOK} , el_faro>el_faro=fyret !`,
    no: 'Se, fyret!',
  },
  {
    id: 'buzo',
    line: `¡ ${LOOK} ! Un_buzo>el_buzo=en_dykker .`,
    no: 'Se! En dykker.',
  },
  {
    id: 'bien',
    line: `¡ Muy bien , ${COMRADES} !`,
    no: 'Veldig bra, kamerater!',
  },
  {
    id: 'olas',
    line: '¡ Hoy hay olas>la_ola=bølger muy grandes>grande=store !',
    no: 'I dag er det veldig store bølger!',
  },
  {
    id: 'oscura',
    line: 'El_agua>el_agua=vannet está>estar=er muy oscura>oscuro=mørkt .',
    no: 'Vannet er veldig mørkt.',
  },
  {
    id: 'todos',
    line: '¡ Muy bien ! ¡ Gracias a todos>todo=alle !',
    no: 'Veldig bra! Takk, alle sammen!',
  },
  {
    id: 'noche',
    line: 'Es>ser=det_er de_noche>la_noche=natt .',
    no: 'Det er natt.',
  },
  {
    id: 'luna',
    line: `¡ ${LOOK} , la_luna !`,
    no: 'Se, månen!',
  },
  {
    id: 'vemos',
    line: '¡ Ahora vemos>ver=ser_vi !',
    no: 'Nå ser vi!',
  },
  {
    id: 'pulpo',
    line: `¡ ${LOOK} ! Un_pulpo>el_pulpo=en_blekksprut .`,
    no: 'Se! En blekksprut.',
  },
  {
    id: 'buenas-noches',
    line: `¡ Buenas_noches , ${COMRADES} !`,
    no: 'God natt, kamerater!',
  },
  // Fresh air at the surface
  {
    id: 'fresco',
    line: '¡ Aire>el_aire=luft fresco=frisk !',
    no: 'Frisk luft!',
  },
  // After a bump, in turn
  {
    id: 'ay',
    line: '¡ Ay>¡ay! , el_casco>el_casco=skroget !',
    no: 'Au, skroget!',
  },
  {
    id: 'casco',
    line: '¡ El_casco>el_casco=skroget ! ¡ Cuidado>¡cuidado! !',
    no: 'Skroget! Pass på!',
  },
  // A dive ended by the hull
  {
    id: 'a-casa',
    line: 'Volvemos>volver=vi_drar_tilbake a casa>la_casa=hjem . ¡ Mañana , otra_vez !',
    no: 'Vi drar hjem. I morgen prøver vi igjen!',
  },
]

export const LINE: Record<string, Line | undefined> = Object.fromEntries(
  LINES.map((x) => [x.id, x]),
)

// What the scene draws coming at the boat for an order: a rock that has
// the open water to port (rock-l, so a babor) or to starboard (rock-r),
// a reef or the bottom below, a net or a ship's keel above, a wave at the
// surface, the quay ahead; or nothing
export type Danger =
  | 'none'
  | 'rock-l'
  | 'rock-r'
  | 'reef'
  | 'bottom'
  | 'net'
  | 'keel'
  | 'wave'
  | 'quay'

// Something seen on the way, said by the captain
export type Sight = 'peces' | 'buzo' | 'pulpo' | 'faro' | 'luna'

export type VoyageId = 'barcelona' | 'creus' | 'alicante' | 'noche'

// A voyage, step by step
export type Step =
  // A line of the captain's, perhaps with something seen, or a change in
  // the scene: the water darker, the coral bed ahead
  | { k: 'say'; line: string; sight?: Sight; murk?: boolean }
  // An order, with what comes at the boat; `top` takes arriba all the way
  // up to the surface
  | { k: 'order'; order: string; danger?: Danger; top?: boolean; bed?: boolean }
  // Orders on the way, picked from the voyage's
  | { k: 'dodge'; n: number }

export interface Voyage {
  id: VoyageId
  es: string
  no: string
  // The plate's caption, in Spanish as an old print has it
  caption: string
  // What it is, for the logbook
  about: string
  // The tools on the helm, besides steering and speed
  tools: Array<Tool>
  // An order's time at first, in seconds, and the air spent a second
  // under water
  time: number
  drain: number
  // The way up for air, when it runs low: what the captain orders, and
  // where fresh air comes in
  air: Array<string>
  dive: Array<string>
  pool: Array<string>
  steps: Array<Step>
}

export const VOYAGES: Array<Voyage> = [
  {
    id: 'barcelona',
    es: 'La primera inmersión',
    no: 'Det første dykket',
    caption: 'El puerto de Barcelona, 1859',
    about:
      'Barcelona, 23. september 1859: det første dykket for åpent publikum, to timer og tjue minutter, ned til tjue meter.',
    tools: [],
    time: 8.5,
    drain: 2,
    air: ['aire-arriba'],
    dive: ['abajo'],
    pool: [
      'babor',
      'estribor',
      'roca-babor',
      'roca-estribor',
      'arriba',
      'abajo',
      'rocas-arriba',
      'red-abajo',
      'barco-abajo',
      'rapido',
      'despacio',
    ],
    steps: [
      { k: 'say', line: 'hola' },
      { k: 'say', line: 'este' },
      { k: 'order', order: 'avante' },
      { k: 'say', line: 'gira' },
      { k: 'order', order: 'abajo' },
      { k: 'dodge', n: 3 },
      { k: 'order', order: 'mas-abajo', danger: 'none' },
      { k: 'say', line: 'veinte' },
      { k: 'dodge', n: 4 },
      { k: 'say', line: 'peces', sight: 'peces' },
      { k: 'dodge', n: 3 },
      { k: 'order', order: 'arriba', top: true },
      { k: 'order', order: 'muelle-despacio', danger: 'quay' },
      { k: 'order', order: 'llegado-alto', danger: 'quay' },
      { k: 'say', line: 'vuelto' },
    ],
  },
  {
    id: 'creus',
    es: 'El coral',
    no: 'Korallen',
    caption: 'El cabo de Creus',
    about:
      'Ved Cap de Creus, der korallfiskerne dykket uten noe vern. Det var for dem Monturiol tegnet båten.',
    tools: ['escotilla', 'coral'],
    time: 8,
    drain: 1.7,
    air: ['aire-superficie', 'abre-escotilla'],
    dive: ['cierra-inmersion'],
    pool: [
      'babor',
      'estribor',
      'todo-babor',
      'todo-estribor',
      'roca-babor',
      'roca-estribor',
      'arriba',
      'abajo',
      'mas-arriba',
      'mas-abajo',
      'rocas-arriba',
      'fondo-arriba',
      'red-abajo',
      'rapido',
      'mas-despacio',
    ],
    steps: [
      { k: 'say', line: 'mucho-coral' },
      { k: 'say', line: 'faro', sight: 'faro' },
      { k: 'order', order: 'cierra-escotilla' },
      { k: 'order', order: 'avante' },
      { k: 'order', order: 'inmersion' },
      { k: 'dodge', n: 3 },
      { k: 'say', line: 'buzo', sight: 'buzo' },
      { k: 'dodge', n: 3 },
      { k: 'order', order: 'despacio', bed: true },
      { k: 'order', order: 'alto' },
      { k: 'order', order: 'coge-coral' },
      { k: 'order', order: 'mas-coral' },
      { k: 'order', order: 'coge-coral' },
      { k: 'order', order: 'avante' },
      { k: 'dodge', n: 3 },
      { k: 'order', order: 'superficie' },
      { k: 'order', order: 'llegado-alto', danger: 'quay' },
      { k: 'order', order: 'abre-escotilla' },
      { k: 'say', line: 'bien' },
    ],
  },
  {
    id: 'alicante',
    es: 'La prueba oficial',
    no: 'Den offisielle prøven',
    caption: 'El puerto de Alicante, 1861',
    about:
      'Alicante, mai 1861: den offisielle prøveturen i havna, i grov sjø og grumsete vann.',
    tools: ['escotilla', 'ancla'],
    time: 7.5,
    drain: 2.4,
    air: ['aire-superficie', 'abre-escotilla'],
    dive: ['cierra-inmersion'],
    pool: [
      'cuidado-babor',
      'cuidado-estribor',
      'todo-babor',
      'todo-estribor',
      'roca-babor',
      'roca-estribor',
      'arriba',
      'abajo',
      'mas-arriba',
      'mas-abajo',
      'fondo-arriba',
      'barco-abajo',
      'red-abajo',
      'avante-toda',
      'despacio',
    ],
    steps: [
      { k: 'say', line: 'olas' },
      { k: 'order', order: 'cierra-escotilla' },
      { k: 'order', order: 'avante' },
      { k: 'order', order: 'ola-inmersion', danger: 'wave' },
      { k: 'dodge', n: 3 },
      { k: 'say', line: 'oscura', murk: true },
      { k: 'dodge', n: 4 },
      { k: 'order', order: 'superficie' },
      { k: 'order', order: 'ola-inmersion', danger: 'wave' },
      { k: 'dodge', n: 3 },
      { k: 'order', order: 'superficie' },
      { k: 'order', order: 'muelle-despacio', danger: 'quay' },
      { k: 'order', order: 'alto-ancla', danger: 'quay' },
      { k: 'say', line: 'todos' },
    ],
  },
  {
    id: 'noche',
    es: 'De noche',
    no: 'Om natten',
    caption: 'De noche',
    about: 'Et tenkt nattetokt i Barcelonas havn, med lampen tent under vann.',
    tools: ['escotilla', 'lampara'],
    time: 7.5,
    drain: 1.7,
    air: ['aire-superficie', 'apaga', 'abre-escotilla'],
    dive: ['cierra-inmersion', 'luz'],
    pool: [
      'babor',
      'estribor',
      'cuidado-babor',
      'cuidado-estribor',
      'roca-babor',
      'roca-estribor',
      'arriba',
      'abajo',
      'rocas-arriba',
      'fondo-arriba',
      'red-abajo',
      'rapido',
      'mas-despacio',
    ],
    steps: [
      { k: 'say', line: 'noche' },
      { k: 'say', line: 'luna', sight: 'luna' },
      { k: 'order', order: 'cierra-escotilla' },
      { k: 'order', order: 'avante' },
      { k: 'order', order: 'sumergimos' },
      { k: 'order', order: 'enciende' },
      { k: 'say', line: 'vemos' },
      { k: 'dodge', n: 3 },
      { k: 'say', line: 'pulpo', sight: 'pulpo' },
      { k: 'dodge', n: 3 },
      { k: 'say', line: 'peces', sight: 'peces' },
      { k: 'dodge', n: 3 },
      { k: 'order', order: 'superficie' },
      { k: 'order', order: 'apaga' },
      { k: 'order', order: 'abre-escotilla' },
      { k: 'order', order: 'llegado-alto', danger: 'quay' },
      { k: 'say', line: 'buenas-noches' },
    ],
  },
]

export const VOYAGE: Record<string, Voyage | undefined> = Object.fromEntries(
  VOYAGES.map((v) => [v.id, v]),
)

// What each order picked on the way brings: the rocks and the reefs with
// their way out where the captain says, the speed orders nothing
export const DODGE: Record<string, Danger | undefined> = {
  babor: 'rock-l',
  'todo-babor': 'rock-l',
  'roca-babor': 'rock-l',
  'cuidado-babor': 'rock-l',
  estribor: 'rock-r',
  'todo-estribor': 'rock-r',
  'roca-estribor': 'rock-r',
  'cuidado-estribor': 'rock-r',
  arriba: 'reef',
  'mas-arriba': 'reef',
  'rocas-arriba': 'reef',
  'fondo-arriba': 'bottom',
  abajo: 'net',
  'mas-abajo': 'net',
  'red-abajo': 'net',
  'barco-abajo': 'keel',
  rapido: 'none',
  'avante-toda': 'none',
  despacio: 'none',
  'mas-despacio': 'none',
}
