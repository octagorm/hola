// Cadáver exquisito: the surrealists' game of a sentence written in folds,
// each player adding a part without seeing the others'. Here the parts are
// drawn at random and the player makes them agree: the verb with whoever
// does it, and the adjective with the thing.
//
// The Norwegian of every part, to say what the sentence ended up meaning.

export interface Subject {
  es: string
  no: string
  // yo, tú, él/ella, nosotros, vosotros, ellos
  person: 0 | 1 | 2 | 3 | 4 | 5
}

export interface Verb {
  inf: string
  no: string
  // yo, tú, él, nosotros, vosotros, ellos
  forms: [string, string, string, string, string, string]
}

export interface Thing {
  es: string
  g: 'm' | 'f'
  // Norwegian: the singular, the plural, and whether it is neuter (et egg)
  no: string
  noPl: string
  neuter?: boolean
}

export interface Adjective {
  // The masculine singular
  es: string
  // Norwegian: as with «en», as with «et», and in the plural
  no: [string, string, string]
}

export const SUBJECTS: Array<Subject> = [
  { es: 'Yo', no: 'Jeg', person: 0 },
  { es: 'Tú', no: 'Du', person: 1 },
  { es: 'Don Quijote', no: 'Don Quijote', person: 2 },
  { es: 'Sancho', no: 'Sancho', person: 2 },
  { es: 'El gato', no: 'Katten', person: 2 },
  { es: 'La hormiga', no: 'Mauren', person: 2 },
  { es: 'El elefante', no: 'Elefanten', person: 2 },
  { es: 'La luna', no: 'Månen', person: 2 },
  { es: 'Mi abuela', no: 'Bestemoren min', person: 2 },
  { es: 'Nosotros', no: 'Vi', person: 3 },
  { es: 'Vosotros', no: 'Dere', person: 4 },
  { es: 'Las hormigas', no: 'Maurene', person: 5 },
  { es: 'Los gigantes', no: 'Kjempene', person: 5 },
  { es: 'Las jirafas', no: 'Sjiraffene', person: 5 },
  { es: 'Los caballeros', no: 'Ridderne', person: 5 },
]

const regular = (inf: string): Verb['forms'] => {
  const stem = inf.slice(0, -2)
  const end = inf.slice(-2)
  if (end === 'ar')
    return [
      `${stem}o`,
      `${stem}as`,
      `${stem}a`,
      `${stem}amos`,
      `${stem}áis`,
      `${stem}an`,
    ]
  if (end === 'er')
    return [
      `${stem}o`,
      `${stem}es`,
      `${stem}e`,
      `${stem}emos`,
      `${stem}éis`,
      `${stem}en`,
    ]
  return [
    `${stem}o`,
    `${stem}es`,
    `${stem}e`,
    `${stem}imos`,
    `${stem}ís`,
    `${stem}en`,
  ]
}

export const VERBS: Array<Verb> = [
  { inf: 'comer', no: 'spiser', forms: regular('comer') },
  { inf: 'mirar', no: 'ser på', forms: regular('mirar') },
  { inf: 'buscar', no: 'leter etter', forms: regular('buscar') },
  { inf: 'pintar', no: 'maler', forms: regular('pintar') },
  { inf: 'llevar', no: 'bærer', forms: regular('llevar') },
  { inf: 'comprar', no: 'kjøper', forms: regular('comprar') },
  { inf: 'romper', no: 'knuser', forms: regular('romper') },
  { inf: 'abrir', no: 'åpner', forms: regular('abrir') },
  {
    inf: 'encontrar',
    no: 'finner',
    forms: [
      'encuentro',
      'encuentras',
      'encuentra',
      'encontramos',
      'encontráis',
      'encuentran',
    ],
  },
  {
    inf: 'querer',
    no: 'vil ha',
    forms: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
  },
  {
    inf: 'tener',
    no: 'har',
    forms: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
  },
  {
    inf: 'ver',
    no: 'ser',
    forms: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
  },
]

export const THINGS: Array<Thing> = [
  { es: 'reloj', g: 'm', no: 'klokke', noPl: 'klokker' },
  { es: 'langosta', g: 'f', no: 'hummer', noPl: 'hummere' },
  { es: 'huevo', g: 'm', no: 'egg', noPl: 'egg', neuter: true },
  { es: 'jirafa', g: 'f', no: 'sjiraff', noPl: 'sjiraffer' },
  { es: 'piano', g: 'm', no: 'piano', noPl: 'pianoer', neuter: true },
  { es: 'cuchara', g: 'f', no: 'skje', noPl: 'skjeer' },
  { es: 'nube', g: 'f', no: 'sky', noPl: 'skyer' },
  { es: 'cajón', g: 'm', no: 'skuff', noPl: 'skuffer' },
  { es: 'mariposa', g: 'f', no: 'sommerfugl', noPl: 'sommerfugler' },
  { es: 'caracol', g: 'm', no: 'snegle', noPl: 'snegler' },
  { es: 'flor', g: 'f', no: 'blomst', noPl: 'blomster' },
  { es: 'sombrero', g: 'm', no: 'hatt', noPl: 'hatter' },
  { es: 'bigote', g: 'm', no: 'bart', noPl: 'barter' },
  { es: 'teléfono', g: 'm', no: 'telefon', noPl: 'telefoner' },
  { es: 'tortilla', g: 'f', no: 'omelett', noPl: 'omeletter' },
  { es: 'espejo', g: 'm', no: 'speil', noPl: 'speil', neuter: true },
  { es: 'castillo', g: 'm', no: 'slott', noPl: 'slott', neuter: true },
  { es: 'llave', g: 'f', no: 'nøkkel', noPl: 'nøkler' },
  { es: 'estrella', g: 'f', no: 'stjerne', noPl: 'stjerner' },
  { es: 'molino', g: 'm', no: 'mølle', noPl: 'møller' },
]

export const ADJECTIVES: Array<Adjective> = [
  { es: 'blando', no: ['myk', 'mykt', 'myke'] },
  { es: 'enorme', no: ['enorm', 'enormt', 'enorme'] },
  { es: 'azul', no: ['blå', 'blått', 'blå'] },
  { es: 'rojo', no: ['rød', 'rødt', 'røde'] },
  { es: 'dorado', no: ['gyllen', 'gyllent', 'gylne'] },
  { es: 'pequeño', no: ['liten', 'lite', 'små'] },
  { es: 'triste', no: ['trist', 'trist', 'triste'] },
  { es: 'loco', no: ['gal', 'galt', 'gale'] },
  { es: 'dormido', no: ['sovende', 'sovende', 'sovende'] },
  { es: 'feliz', no: ['lykkelig', 'lykkelig', 'lykkelige'] },
  { es: 'verde', no: ['grønn', 'grønt', 'grønne'] },
  { es: 'viejo', no: ['gammel', 'gammelt', 'gamle'] },
  { es: 'elegante', no: ['elegant', 'elegant', 'elegante'] },
  { es: 'negro', no: ['svart', 'svart', 'svarte'] },
  { es: 'blanco', no: ['hvit', 'hvitt', 'hvite'] },
  { es: 'amarillo', no: ['gul', 'gult', 'gule'] },
  { es: 'raro', no: ['rar', 'rart', 'rare'] },
  { es: 'hermoso', no: ['vakker', 'vakkert', 'vakre'] },
]
