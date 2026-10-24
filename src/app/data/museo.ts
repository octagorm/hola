import { PICTURES as PAINTED } from './pictures.ts'

// Tu museo (games/museo.tsx): a picture for each theme (data/themes.ts),
// hung in its group's room once the theme is finished
// (lib/colecciones.ts). Each has its title, a line on what it shows, its
// medium and its shape. The pictures are painted on the Mac with
// scripts/pictures.mjs as museo/<lesson>, from the prompts in
// data/museo-prompts.ts (kept apart, so that the page does not carry them).
//
// Every picture is a travel poster, the style Gorm chose for all of Hola's
// paintings. Nothing copies or redoes another artist's picture; buildings
// are drawn anew.
//
// Until a picture is painted, its frame shows a stand-in drawn in SVG from
// `motif` and `colors` (games/museoArt.tsx).

export type Shape = 'portrait' | 'landscape' | 'square'

// What the stand-in draws
export type Motif =
  | 'sun'
  | 'sea'
  | 'arch'
  | 'tile'
  | 'tower'
  | 'moon'
  | 'still'
  | 'lantern'
  | 'windmill'
  | 'grid'
  | 'flower'

export interface Picture {
  lesson: string
  es: string
  no: string
  // What it shows, in a line
  shows: string
  // The medium, in Norwegian, for the label
  medium: string
  shape: Shape
  // Large or medium on the wall
  size: 'l' | 'm'
  motif: Motif
  // The stand-in's paper, then two colours and its ink
  colors: [string, string, string, string]
}

export const MUSEO: Array<Picture> = [
  // --- Sala I: La vida diaria ---
  {
    lesson: 'tapeo',
    es: 'La barra',
    no: 'Bardisken',
    shows:
      'En spansk bardisk en sen ettermiddag, med to cañas, oliven og servietter på gulvet.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'l',
    motif: 'still',
    colors: ['#f2e3c2', '#c0472e', '#3e6b4f', '#2a1d15'],
  },
  {
    lesson: 'compras',
    es: 'El puesto de fruta',
    no: 'Fruktboden',
    shows:
      'En fruktbod på markedet: kasser med appelsiner og tomater, en hengende vekt og en stripet markise.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'still',
    colors: ['#f4e6c8', '#e0802c', '#c23a2b', '#26201a'],
  },
  {
    lesson: 'transporte',
    es: 'La estación',
    no: 'Stasjonen',
    shows:
      'En liten landsbystasjon der et rødt og kremhvitt tog kommer inn, med fjell i bakgrunnen.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'sun',
    colors: ['#f0d9a8', '#b8432f', '#5c7f9e', '#2b2620'],
  },
  {
    lesson: 'parientes',
    es: 'La sobremesa',
    no: 'Etter maten',
    shows:
      'Et langbord under vinranker etter et familiemåltid: tomme stoler, kaffekopper og en kake med lys.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'still',
    colors: ['#f1e6cc', '#7f9b4a', '#c75b3a', '#2a2219'],
  },
  {
    lesson: 'clima',
    es: 'Tormenta de verano',
    no: 'Sommertorden',
    shows:
      'En hvit landsby på en ås der tordenværet driver forbi, med lyn på den ene siden og regnbue på den andre.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sun',
    colors: ['#ece3cf', '#4e6e8e', '#d9a33a', '#1f1c1a'],
  },
  {
    lesson: 'horarios',
    es: 'La hora de la siesta',
    no: 'Siestatid',
    shows:
      'En stille gate klokka tre om ettermiddagen: lukkede skodder, lange skygger og en katt som sover på en trapp.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'tower',
    colors: ['#f3d9a4', '#c4562f', '#3d6f78', '#2b1f17'],
  },
  {
    lesson: 'tramites',
    es: 'La ventanilla',
    no: 'Luken',
    shows:
      'En luke på et offentlig kontor, med stempel, skjemaer, en kølapp og en klokke på veggen.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'grid',
    colors: ['#eee6d2', '#7a8f6e', '#c8a24a', '#2a2620'],
  },
  {
    lesson: 'indicaciones',
    es: 'El cruce',
    no: 'Krysset',
    shows:
      'Et gatekryss sett ovenfra: fotgjengerfelt, trafikklys, et apotekskilt med grønt kors og en taxi.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'grid',
    colors: ['#efe4cb', '#3f8a5a', '#e0b23a', '#24211d'],
  },

  // --- Sala II: A la mesa ---
  {
    lesson: 'tapas',
    es: 'Bodegón de tapas',
    no: 'Stilleben med tapas',
    shows:
      'En leirgryte med hvitløksreker, pimientos de Padrón, tannpirkere og brød.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'l',
    motif: 'still',
    colors: ['#f2e2c4', '#b5502f', '#5f7f3a', '#231c16'],
  },
  {
    lesson: 'paella',
    es: 'La paellera',
    no: 'Paellapannen',
    shows:
      'En paella med skalldyr sett ovenfra: reker, blåskjell, muslinger og sitronbåter, med safran og rosmarin ved siden av.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'l',
    motif: 'still',
    colors: ['#f3e3bd', '#e2a12c', '#3f6fa0', '#2a2017'],
  },
  {
    lesson: 'tortilla',
    es: 'La tortilla',
    no: 'Tortillaen',
    shows:
      'En tortilla på et fat, med poteter, løk, egg og en flaske olivenolje rundt.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'still',
    colors: ['#f4e8cc', '#e3b23c', '#7b4a2a', '#211a14'],
  },
  {
    lesson: 'churros',
    es: 'Chocolate con churros',
    no: 'Sjokolade og churros',
    shows:
      'Et marmorbord på en kafé tidlig om morgenen, med en kopp tykk sjokolade og churros i en papirkremmerhus.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'still',
    colors: ['#f2e1c6', '#6b3a24', '#c99a5a', '#2a1a12'],
  },
  {
    lesson: 'embutidos',
    es: 'La despensa',
    no: 'Spiskammeret',
    shows:
      'En spekeskinke i skinkestativ, pølser som henger, en manchegoost og eikenøtter på en grein.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'still',
    colors: ['#efe0c2', '#9a2f2a', '#c49a4e', '#23190f'],
  },
  {
    lesson: 'bebidas',
    es: 'La bodega',
    no: 'Vinkjelleren',
    shows:
      'Tønner under en hvelvet kjeller, en vinkrukke, druer og en lysstripe fra en høy glugge.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'arch',
    colors: ['#eadbc0', '#7b2d3a', '#a88a4a', '#1f1814'],
  },
  {
    lesson: 'latino',
    es: 'Mercado de colores',
    no: 'Fargene på markedet',
    shows:
      'Mais, avokado, lime, chili og kakaofrukter på et vevd teppe, med en leirkrukke.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'flower',
    colors: ['#f2e4c6', '#d2492f', '#4b8a3e', '#2a2218'],
  },

  // --- Sala III: Por España ---
  {
    lesson: 'cataluna',
    es: 'Sant Jordi',
    no: 'Sant Jordi',
    shows:
      'En balkong i Barcelona med en rød rose og en bok, og havnen og Montjuïc under.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'flower',
    colors: ['#f1dfb6', '#c3302b', '#2f6e9a', '#2a2220'],
  },
  {
    lesson: 'andalucia',
    es: 'El patio',
    no: 'Gården',
    shows:
      'En gård i Córdoba i mai, med geranier i blå potter på de hvite murene, en fontene, azulejos og en vifte og en gitar i skyggen.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'flower',
    colors: ['#f4efe4', '#c8352e', '#2f5d9e', '#1d1a17'],
  },
  {
    lesson: 'galicia',
    es: 'El hórreo',
    no: 'Stabburet',
    shows:
      'Et granittstabbur ved havet i Galicia, med et fyrtårn, et kamskjell på en stein og yr.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sea',
    colors: ['#e6e3d6', '#4f7a6a', '#8a9aa6', '#1e2222'],
  },
  {
    lesson: 'euskadi',
    es: 'La bahía',
    no: 'Bukta',
    shows:
      'Bukta La Concha i San Sebastián med øya i munningen, fiskebåter og grønne åser.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sea',
    colors: ['#eee0bf', '#e0a93a', '#2f6f8f', '#232323'],
  },
  {
    lesson: 'valencia',
    es: 'La huerta',
    no: 'Kjøkkenhagen',
    shows:
      'Appelsintrær, en hvit barraca med bratt stråtak, en vanningskanal og rismarker.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sun',
    colors: ['#f4e3bf', '#e47d2a', '#4e7d3a', '#2a2018'],
  },
  {
    lesson: 'murcia',
    es: 'Limoneros',
    no: 'Sitrontrærne',
    shows: 'Sitrontrær og et gammelt vannhjul, en noria, i huertaen i Murcia.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'tile',
    colors: ['#f3efe2', '#2f5d9a', '#e2b62f', '#1f2a44'],
  },
  {
    lesson: 'alicante',
    es: 'Los almendros',
    no: 'Mandeltrærne',
    shows:
      'Mandeltrær i blomst på terrassene i fjellene bak Alicante i februar, med havet langt der nede.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'flower',
    colors: ['#f6ece6', '#e8a7b4', '#3a7ca5', '#3a2a22'],
  },
  {
    lesson: 'viaje',
    es: 'El tren',
    no: 'Toget',
    shows:
      'En kupé i et gammelt tog langs Middelhavet, med vinduet nede, en koffert i hyllen og appelsiner på bordet.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sea',
    colors: ['#f2eadb', '#e08a2c', '#2d5e8c', '#1f2328'],
  },
  {
    lesson: 'rastro',
    es: 'Domingo en el Rastro',
    no: 'Søndag på El Rastro',
    shows:
      'En bratt gate med boder på tepper: messinglamper, en spilledåse og gamle bøker i morgensol.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'still',
    colors: ['#f0e3c5', '#b6522e', '#4d6f8a', '#262019'],
  },

  // --- Sala IV: Historia y arte ---
  {
    lesson: 'mancha',
    es: 'Los molinos',
    no: 'Vindmøllene',
    shows:
      'Vindmøller på en ås i La Mancha, og langt borte en mager ridder til hest og en væpner på et esel.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'l',
    motif: 'windmill',
    colors: ['#f2e5c4', '#c8942f', '#6f86a4', '#211a14'],
  },
  {
    lesson: 'suenos',
    es: 'El sueño',
    no: 'Drømmen',
    shows:
      'En ørken i skumringen med en stige opp til skyene, sommerfugler og en stein som svever.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'moon',
    colors: ['#e9d2b0', '#7f5aa0', '#e08a3c', '#2a1f2e'],
  },
  {
    lesson: 'romanos',
    es: 'El acueducto',
    no: 'Akvedukten',
    shows: 'Akvedukten i Segovia med de doble buene sine over hustakene.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'arch',
    colors: ['#efe3c6', '#b88a4a', '#7d9bb0', '#1c1712'],
  },
  {
    lesson: 'alandalus',
    es: 'Los baños',
    no: 'Badet',
    shows:
      'Et arabisk badehus med stjerneformede lysåpninger i hvelvet, lysstråler gjennom dampen og hesteskobuer rundt et basseng.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'l',
    motif: 'arch',
    colors: ['#f1e4c8', '#2c4f7c', '#d9b56a', '#1c1512'],
  },
  {
    lesson: 'museo',
    es: 'La sala',
    no: 'Salen',
    shows: 'En stille museumssal med en benk, tomme rammer og et takvindu.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'grid',
    colors: ['#efe2c8', '#a33a2e', '#d4b86a', '#231b16'],
  },
  {
    lesson: 'gaudi',
    es: 'Las torres',
    no: 'Tårnene',
    shows: 'Tårnene på Sagrada Familia med byggekraner og fargerike tinder.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'tower',
    colors: ['#f2e6cf', '#c7792f', '#3f7f8f', '#221c18'],
  },
  {
    lesson: 'cine',
    es: 'Cine de verano',
    no: 'Sommerkino',
    shows:
      'En utekino en sommernatt: klappstoler, et hvitt lerret som lyser og lyskjeglen fra projektoren.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'moon',
    colors: ['#e6dcc4', '#2c3e6a', '#e8c25a', '#161a24'],
  },
  {
    lesson: 'ictineo',
    es: 'La inmersión',
    no: 'Dykket',
    shows:
      'Ubåten av tre, formet som en fisk, halvveis under vann i Barcelonas havn, med kaien og seilskuter bak.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sea',
    colors: ['#e9e2c9', '#2f6b5e', '#a8c9b4', '#16211d'],
  },

  // --- Sala V: América ---
  {
    lesson: 'mexico',
    es: 'Día de Muertos',
    no: 'De dødes dag',
    shows:
      'Et alter til De dødes dag med fløyelsblomster, lys, sukkerhodeskaller og papirpynt.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'lantern',
    colors: ['#f4e3c4', '#e5862a', '#b7346e', '#24161c'],
  },
  {
    lesson: 'cuba',
    es: 'El Malecón',
    no: 'Strandpromenaden',
    shows:
      'Bølger som slår over muren på Malecón i Havanna, pastellfasader og en gammel bil i solnedgang.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sea',
    colors: ['#f2dcb8', '#e0703a', '#2f8a9a', '#22201e'],
  },
  {
    lesson: 'argentina',
    es: 'La pampa',
    no: 'Pampasen',
    shows:
      'En gaucho til hest under en enorm himmel over pampasen, med et ensomt ombútre.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sun',
    colors: ['#efe0bd', '#d27a3a', '#8aa04a', '#26221c'],
  },
  {
    lesson: 'colombia',
    es: 'Mariposas amarillas',
    no: 'Gule sommerfugler',
    shows:
      'En landsbygate ved Karibia der gule sommerfugler flyr rundt et mandeltre og en elv med glatte steiner.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'flower',
    colors: ['#f2e6c4', '#e9c23a', '#3d8a6a', '#24261e'],
  },

  // --- Sala VI: Música y fiestas ---
  {
    lesson: 'flamenco',
    es: 'El tablao',
    no: 'Scenen',
    shows:
      'En tom flamencoscene med en stol, en gitar, et sjal med frynser og kastanjetter i ett lys.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'still',
    colors: ['#efe0c4', '#b4282e', '#e3a83a', '#1a1414'],
  },
  {
    lesson: 'ritmos',
    es: 'La pista',
    no: 'Dansegulvet',
    shows:
      'Maracas, en conga og en trompet på en stol ved et dansegulv med palmer.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'lantern',
    colors: ['#f3e1bf', '#d5432f', '#2f9a8a', '#221a1a'],
  },
  {
    lesson: 'semanasanta',
    es: 'La feria',
    no: 'Feriaen',
    shows:
      'Papirlykter over stripete festtelt, en hestevogn og Giralda i det fjerne.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'tile',
    colors: ['#f4f0e4', '#2f5a9a', '#e4a52f', '#1d2a44'],
  },
  {
    lesson: 'sanfermin',
    es: 'El seis de julio',
    no: 'Sjette juli',
    shows:
      'Et rødt halstørkle på en jernbalkong over en tom gate i Pamplona, og røyken fra rakettskuddet.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'tower',
    colors: ['#f2e8d6', '#c42a2a', '#7a8fa8', '#221e1c'],
  },

  // --- Sala VII: Leyendas y misterios ---
  {
    lesson: 'tenorio',
    es: 'El panteón',
    no: 'Gravkapellet',
    shows:
      'En kirkegård i måneskinn med en steinstatue av en ridder, en sypress og et lys som brenner.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'moon',
    colors: ['#dedbd0', '#4a5a7a', '#c9a24a', '#121417'],
  },
  {
    lesson: 'becquer',
    es: 'El monte de las ánimas',
    no: 'Sjelenes fjell',
    shows:
      'Et fjell over Soria om natten, nakne trær, et klokketårn og elva Duero under månen.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'moon',
    colors: ['#dcd8c8', '#3b4f72', '#c9b46a', '#15161c'],
  },
  {
    lesson: 'llorona',
    es: 'La orilla',
    no: 'Elvebredden',
    shows:
      'En elv om natten under månen, med siv og langt borte en skikkelse i hvitt slør på bredden.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'moon',
    colors: ['#e2e4e0', '#2e4f7a', '#9fb4c8', '#111a24'],
  },
  {
    lesson: 'dorado',
    es: 'La laguna',
    no: 'Innsjøen',
    shows:
      'Den runde innsjøen Guatavita mellom grønne fjell, med en gyllen flåte på det mørke vannet.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'l',
    motif: 'sun',
    colors: ['#e9e2c8', '#d8a92e', '#2f5f4a', '#16201c'],
  },
  {
    lesson: 'caso',
    es: 'Las pistas',
    no: 'Sporene',
    shows:
      'Inspektørens ting på et kafébord ved havnen i Cadaqués: hatten, lupen, notatboka og en urkjede uten ur.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'm',
    motif: 'still',
    colors: ['#efe5cf', '#2f6a8a', '#c99a3a', '#1f1c1a'],
  },

  // --- Sala VIII: El idioma ---
  {
    lesson: 'refranes',
    es: 'Pájaro en mano',
    no: 'Fuglen i hånden',
    shows:
      'En bonde holder én fugl i hånden mens en hel flokk flyr av sted: más vale pájaro en mano que ciento volando.',
    medium: 'Reiseplakat',
    shape: 'portrait',
    size: 'l',
    motif: 'grid',
    colors: ['#f1e5c6', '#c4402e', '#5c86a8', '#1e1914'],
  },
  {
    lesson: 'falsos',
    es: 'Falsos amigos',
    no: 'Falske venner',
    shows:
      'To nesten like masker side om side, en mappe på et mønstret teppe og et glass ved en vase.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'still',
    colors: ['#f2e6cb', '#2f6f6a', '#d0663a', '#1e1a16'],
  },
  {
    lesson: 'trabalenguas',
    es: 'Tres tristes tigres',
    no: 'Tre triste tigre',
    shows:
      'Tre triste tigre som eter hvete i en hveteåker, med vinden i aksene.',
    medium: 'Reiseplakat',
    shape: 'landscape',
    size: 'm',
    motif: 'sun',
    colors: ['#f0e2bd', '#e0882e', '#c9a64a', '#221a12'],
  },
  {
    lesson: 'sonidos',
    es: 'La ola y la olla',
    no: 'Bølgen og kjelen',
    shows:
      'Et kjøkkenvindu mot havet: en kjele som damper på komfyren og en bølge som ruller utenfor.',
    medium: 'Reiseplakat',
    shape: 'square',
    size: 'm',
    motif: 'sea',
    colors: ['#f1e7d2', '#c8553a', '#3a7fa0', '#1f2226'],
  },
]

export const PICTURE: Record<string, Picture | undefined> = Object.fromEntries(
  MUSEO.map((x) => [x.lesson, x]),
)

// A picture's name among the painted ones, and where it is served
export const pictureName = (lesson: string) => `museo/${lesson}`
export const isPainted = (lesson: string) => PAINTED.has(pictureName(lesson))
export const paintedSrc = (lesson: string) => `/${pictureName(lesson)}.webp`

// The largest it is shown, in CSS pixels (the picture opened): a painting
// is cut to twice that
export const SHOWN: Record<Shape, [number, number]> = {
  portrait: [400, 600],
  landscape: [720, 480],
  square: [600, 600],
}
