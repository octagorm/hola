// Sonidos: the letters of Spanish and their sounds, as they are said in
// Spain, each with a note in plain Norwegian and words of Hola's to hear
// it in; and words that sound alike but for one sound, for the ear.

export type SoundId =
  | 'a'
  | 'e'
  | 'i'
  | 'o'
  | 'u'
  | 'bv'
  | 'k'
  | 'z'
  | 'g'
  | 'j'
  | 'gu'
  | 'h'
  | 'll'
  | 'ptk'
  | 'd'
  | 's'
  | 'ñ'
  | 'r'

export interface Sound {
  id: SoundId
  // The letters, as the chart shows them
  letters: string
  // How they are written before which vowels, where that matters
  spelt?: string
  note: string
  // Words to hear it in, by id
  words: Array<string>
}

export interface SoundGroup {
  id: string
  es: string
  no: string
  about: string
  sounds: Array<Sound>
}

export const CHART: Array<SoundGroup> = [
  {
    id: 'vocales',
    es: 'Las vocales',
    no: 'Vokalene',
    about:
      'Fem vokaler med hver sin klare lyd. De er korte, og de holder lyden sin også uten trykk.',
    sounds: [
      {
        id: 'a',
        letters: 'a',
        note: 'Som a i «katt».',
        words: ['la casa', 'nada', 'la mañana'],
      },
      {
        id: 'e',
        letters: 'e',
        note: 'Som e i «fest», aldri som æ.',
        words: ['verde', 'la leche', 'el mes'],
      },
      {
        id: 'i',
        letters: 'i',
        note: 'Som i i «vin».',
        words: ['sí', 'el vino', 'aquí'],
      },
      {
        id: 'o',
        letters: 'o',
        note: 'Som norsk å, ikke som o i «bok».',
        words: ['todo', 'poco', 'el toro'],
      },
      {
        id: 'u',
        letters: 'u',
        note: 'Som norsk o i «bok», ikke som u i «hus».',
        words: ['uno', 'la luna', 'el zumo'],
      },
    ],
  },
  {
    id: 'escritura',
    es: 'Un sonido, dos letras',
    no: 'Samme lyd, ulik skrift',
    about:
      'Noen lyder skrives på to måter, etter faste regler eller etter ordet. Da må skriften læres med ordet.',
    sounds: [
      {
        id: 'bv',
        letters: 'b · v',
        note: 'B og v sies likt: bueno og vino begynner med samme lyd. Mellom vokaler blir den myk, og leppene møtes nesten ikke.',
        words: ['bueno', 'el vino', 'nuevo'],
      },
      {
        id: 'k',
        letters: 'c · qu',
        spelt: 'ca co cu · que qui',
        note: 'K-lyden skrives c foran a, o og u, og qu foran e og i. U-en i que og qui sies ikke.',
        words: ['la casa', 'el queso', 'pequeño'],
      },
      {
        id: 'z',
        letters: 'z · c',
        spelt: 'za zo zu · ce ci',
        note: 'Z, og c foran e og i, sies med tungespissen mellom tennene, som th i engelsk «think». Slik snakker man i det meste av Spania.',
        words: ['el zumo', 'la cena', 'el cine'],
      },
      {
        id: 'g',
        letters: 'g · gu',
        spelt: 'ga go gu · gue gui',
        note: 'G er en g, myk mellom vokaler. Foran e og i skrives den gu, og u-en sies ikke.',
        words: ['el gato', 'la guitarra', 'el lago'],
      },
      {
        id: 'j',
        letters: 'j · g',
        spelt: 'ja jo ju · ge gi',
        note: 'J, og g foran e og i, er en hes lyd langt bak i munnen, som ch i tysk «Bach».',
        words: ['el jamón', 'la gente', 'el hijo'],
      },
      {
        id: 'gu',
        letters: 'gü',
        spelt: 'güe güi',
        note: 'Med to prikker over sies u-en likevel. Uten prikker er den stum, som i guitarra.',
        words: ['el pingüino', 'la vergüenza', 'bilingüe'],
      },
      {
        id: 'h',
        letters: 'h',
        note: 'H sies aldri: hola og ola (bølge) høres helt like ut.',
        words: ['hola', 'ahora', 'la hora'],
      },
      {
        id: 'll',
        letters: 'll · y',
        note: 'Ll og y sies likt i nesten hele Spania, omtrent som en kraftig j.',
        words: ['la llave', 'yo', 'la playa'],
      },
    ],
  },
  {
    id: 'oido',
    es: 'Para el oído',
    no: 'Lyder å lytte etter',
    about:
      'Lyder som skiller ord fra hverandre, og som et norsk øre lett overhører.',
    sounds: [
      {
        id: 'ptk',
        letters: 'p · t · k',
        note: 'P, t og k sies uten pust etter, så for et norsk øre kan de låte som b, d og g.',
        words: ['pero', 'el tomate', 'poco'],
      },
      {
        id: 'd',
        letters: 'd',
        note: 'Mellom vokaler og til slutt i ordet er d myk, som th i engelsk «this».',
        words: ['nada', 'cansado', 'la verdad'],
      },
      {
        id: 's',
        letters: 's',
        note: 'S sies med tungespissen, nesten litt mot sj. Den er en annen lyd enn z og c: casa er et hus, caza en jakt.',
        words: ['el sol', 'la casa', 'la caza'],
      },
      {
        id: 'ñ',
        letters: 'ñ',
        note: 'En bokstav for seg: n og j i én lyd, som gn i «lasagne».',
        words: ['el niño', 'el año', 'la montaña'],
      },
      {
        id: 'r',
        letters: 'r · rr',
        note: 'Én r mellom vokaler er ett raskt slag med tungen. Rr, og r først i ordet, ruller: pero er men, perro er hund.',
        words: ['pero', 'el perro', 'rojo'],
      },
    ],
  },
]

export const SOUND: Record<string, Sound | undefined> = Object.fromEntries(
  CHART.flatMap((g) => g.sounds).map((s) => [s.id, s]),
)

// Words that sound alike but for one sound or two, by id: one of them is
// said, and the ear picks which
export interface Contrast {
  words: Array<string>
  // The sounds that tell them apart, as in the chart
  sounds: Array<SoundId>
  // Said and shown without their articles, which would tell them apart
  bare?: boolean
  // What to listen for, after the answer
  note: string
}

const R = 'Én r er ett slag med tungen, rr ruller.'
const Z =
  'S sies med tungespissen, z og c foran e og i med tungen mellom tennene.'
const Ñ = 'Ñ er n og j i én lyd.'
const LL = 'Ll sies omtrent som j.'
const PB =
  'P sies uten stemme og uten pust etter. B og v har stemme, og mellom vokaler møtes leppene nesten ikke.'
const TD =
  'T sies uten stemme og uten pust etter. D har stemme, og mellom vokaler er den myk.'
const AEI = 'Spanske vokaler er korte og klare, hver med sin lyd.'

export const CONTRASTS: Array<Contrast> = [
  { words: ['pero', 'el perro'], sounds: ['r'], bare: true, note: R },
  { words: ['caro', 'el carro'], sounds: ['r'], bare: true, note: R },
  { words: ['la casa', 'la caza'], sounds: ['s', 'z'], note: Z },
  { words: ['la tasa', 'la taza'], sounds: ['s', 'z'], note: Z },
  { words: ['coser', 'cocer'], sounds: ['s', 'z'], note: Z },
  { words: ['vos', 'la voz'], sounds: ['s', 'z'], bare: true, note: Z },
  { words: ['la pena', 'la peña'], sounds: ['ñ'], note: Ñ },
  { words: ['la cana', 'la caña'], sounds: ['ñ'], note: Ñ },
  { words: ['una', 'la uña'], sounds: ['ñ'], bare: true, note: Ñ },
  { words: ['la ola', 'la olla'], sounds: ['ll'], note: LL },
  { words: ['el polo', 'el pollo'], sounds: ['ll'], note: LL },
  {
    words: ['el hijo', 'el higo'],
    sounds: ['j', 'g'],
    note: 'J er en hes lyd langt bak i munnen. G mellom vokaler er myk.',
  },
  { words: ['el vaso', 'el paso'], sounds: ['ptk', 'bv'], note: PB },
  { words: ['pesar', 'besar'], sounds: ['ptk', 'bv'], note: PB },
  { words: ['la viña', 'la piña'], sounds: ['ptk', 'bv'], note: PB },
  { words: ['pagar', 'vagar'], sounds: ['ptk', 'bv'], note: PB },
  {
    words: ['el beso', 'el peso', 'el piso'],
    sounds: ['ptk', 'bv', 'e', 'i'],
    note: `Hør etter både første lyd og vokalen. ${PB}`,
  },
  {
    words: ['el palo', 'el pelo', 'el velo'],
    sounds: ['ptk', 'bv', 'a', 'e'],
    note: `Hør etter både første lyd og vokalen. ${PB}`,
  },
  {
    words: ['la tía', 'el día'],
    sounds: ['ptk', 'd'],
    bare: true,
    note: TD,
  },
  {
    words: ['cuatro', 'el cuadro'],
    sounds: ['ptk', 'd'],
    bare: true,
    note: TD,
  },
  { words: ['cuándo', 'cuánto'], sounds: ['ptk', 'd'], note: TD },
  {
    words: ['la masa', 'la mesa', 'la misa'],
    sounds: ['a', 'e', 'i'],
    note: AEI,
  },
  { words: ['la cara', 'la cera'], sounds: ['a', 'e'], note: AEI },
  { words: ['el pez', 'la paz'], sounds: ['a', 'e'], bare: true, note: AEI },
  { words: ['más', 'el mes'], sounds: ['a', 'e'], bare: true, note: AEI },
  {
    words: ['la pintura', 'la pintora'],
    sounds: ['o', 'u'],
    note: 'U er som norsk o i «bok», o som norsk å.',
  },
]
