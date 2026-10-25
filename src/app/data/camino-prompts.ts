import { STAGES, stampPicture } from './camino.ts'
import { POSTER, POSTER_REF } from './museo-prompts.ts'

// The prompts for the credential's stamps (art.tsx, Stamp), read only by
// scripts/pictures.mjs: a stamp for each town of the Camino (data/camino.ts),
// in the travel-poster style of every painting in Hola but still looking
// stamped on the passport's paper, each with a subject of its own. They are
// shown at about 54 CSS pixels on the home page, 96 in the credential and
// 140 on the day done, so each is one bold subject. The first stamp is
// painted first, and the others take it as a second reference beside the
// poster's, so that the set matches: paint it and look at it before the
// rest.

export const FIRST_STAMP = '.cache/pictures/camino/roncesvalles.png'

// What every stamp is
const STAMP =
  'A pilgrim’s passport stamp (a sello of the Camino de Santiago), as a travel poster of the 1920s–30s made into a stamp: a bold border of the shape given, in one ink colour, and inside it a small flat poster vignette of the subject, in a handful of flat colours from the posters’ palette (sea green, sand, terracotta, slate blue, cream, mustard, with deep ink blue for the darkest parts), mostly in large unbroken areas. The vignette is printed too, so its colours share the ink’s uneven, faintly mottled look. It looks pressed onto paper with a rubber stamp: the ink a little uneven, faintly mottled and slightly lighter in places, the border with a few tiny gaps, the edges crisp but not perfect. Seen flat from the front, not tilted, not in perspective.'

const RULES =
  'No lettering of any kind: no letters, words, numbers, dates or town names, not even around the border, which stays plain. No people and no faces. An original picture, not a copy of any artist’s work. On a fully transparent background: no paper, no ground and no shadow behind the stamp. Square format, the stamp centred and filling most of the square.'

const SHOWN =
  'It will be shown small, about 50 to 140 pixels across, so the subject is large and clear in the middle, with a strong silhouette that still reads at 50 pixels, and around it whatever setting suits the place (sky, hills, a river, fields, a few roofs), drawn in a few broad shapes. No fine detail, no thin lines and no masses of tiny repeated shapes (single leaves in a forest, long rows of small windows, roof tiles).'

// The border of each stage in turn, and its ink, so that neighbours differ
const BORDERS = [
  'a round border of two rings, a thick one outside and a thin one inside',
  'a square border with rounded corners',
  'an oval border, wider than tall, of two rings',
  'a shield-shaped border, flat on top and pointed below',
  'a round border with a scalloped outer edge, like a seal',
  'an octagonal border',
]
const INKS = [
  'terracotta',
  'slate blue',
  'deep ink blue',
  'mustard',
  'sea green',
]

// What each town's stamp shows, from the Pyrenees to the sea
export const STAMP_SUBJECTS: Record<string, string> = {
  Roncesvalles:
    'the Gothic collegiate church of Roncesvalles with its steep grey roof and square bell tower, before one dark ridge of the Pyrenees',
  Zubiri:
    'the medieval stone bridge of Zubiri, two round arches reflected in the river Arga, a few trees on the banks',
  Pamplona:
    'a black fighting bull running, seen from the side, before a strip of old city wall with a gate, as at the San Fermín',
  'Puente la Reina':
    'the long humpbacked Romanesque pilgrims’ bridge of Puente la Reina, six round arches over the river Arga',
  Estella:
    'the wine fountain of Irache: a stone wall fountain with a small tap pouring red wine into a pilgrim’s scallop shell, a bunch of grapes carved above it',
  'Los Arcos':
    'the tall Renaissance bell tower of the church of Los Arcos rising high above low terracotta roofs',
  Logroño:
    'a big bunch of dark Rioja grapes with one broad vine leaf, and a small round earthenware wine jug beside it',
  Nájera:
    'the monastery of Santa María la Real at the foot of steep red sandstone cliffs with dark cave openings',
  'Santo Domingo de la Calzada':
    'a proud white rooster and a white hen side by side, as kept alive in the cathedral of Santo Domingo de la Calzada',
  Belorado:
    'one big sunflower in full bloom, its stalk and two leaves, over a strip of field',
  'San Juan de Ortega':
    'a small Romanesque monastery church with a round apse, alone in a wood of oaks and pines',
  Burgos:
    'the two tall openwork Gothic spires of the cathedral of Burgos, seen from the front',
  'Hornillos del Camino':
    'a lone stone church tower at the end of a village on the flat golden meseta, a pilgrims’ path running straight to it through the wheat',
  Castrojeriz:
    'the ruined castle of Castrojeriz on top of a round conical hill, the village at its foot',
  Frómista:
    'the Romanesque church of San Martín de Frómista: an octagonal tower over the crossing and two round turrets at the front',
  'Carrión de los Condes':
    'a golden sheaf of wheat bound in the middle with a red cord, standing upright',
  'Terradillos de los Templarios':
    'the red cross of the Knights Templar, with arms widening at the ends, on a white shield',
  'El Burgo Ranero':
    'a white stork standing on one leg in its big nest of sticks on top of a brick church belfry',
  'Mansilla de las Mulas':
    'the medieval town wall of Mansilla de las Mulas with two round towers, by the river Esla',
  León: 'a proud crowned lion standing on its hind legs, in profile, purple-red, as on the arms of León: clearly a lion, with a mane, a tail and claws, not a sun',
  'San Martín del Camino':
    'a straight pilgrims’ path running away between two rows of tall poplars across a flat plain',
  Astorga:
    'Gaudí’s episcopal palace of Astorga: a small white neo-Gothic castle with pointed turrets',
  'Rabanal del Camino':
    'the Cruz de Ferro: a small iron cross on top of a tall wooden pole rising from a mound of stones on a bare mountain pass',
  Ponferrada:
    'the Templar castle of Ponferrada: a long stone wall with battlements and round towers, and a gate',
  'Villafranca del Bierzo':
    'the round-arched Romanesque Door of Forgiveness of the church of Santiago in Villafranca del Bierzo, green hills behind',
  'O Cebreiro':
    'a round stone pallaza with a tall conical thatched roof on a mountain top, mist in the valleys below',
  Triacastela: 'three small stone castle towers side by side on a green hill',
  Sarria:
    'a Galician hórreo: a long narrow stone granary raised on stone legs, with a small cross on the end of its roof',
  Portomarín:
    'the fortress-like Romanesque church of Portomarín with its big round rose window, above the water of the reservoir',
  'Palas de Rei':
    'a Galician cruceiro: a tall stone wayside cross on a stepped base, under the branches of an oak',
  Arzúa:
    'a round pale-yellow Arzúa-Ulloa cheese with a wedge cut out of it, on a wooden board',
  'O Pedrouzo':
    'a pilgrim’s wooden staff with a gourd and a scallop shell tied to it, among tall eucalyptus trunks',
  'Santiago de Compostela':
    'the twin baroque towers of the cathedral of Santiago de Compostela, the Obradoiro façade, with a small eight-pointed star above them',
  Negreira:
    'the medieval bridge of Ponte Maceira over the river Tambre, its arches and an old stone mill beside it',
  Olveiroa:
    'one big scallop shell, the pilgrim’s sign, its ribs fanning out from the hinge',
  Fisterra:
    'the lighthouse on the cape of Fisterra on its rocks, the sun setting into the sea behind it',
}

export interface StampPrompt {
  shape: 'square'
  size: string
  ref: string | Array<string>
  cutout: true
  gravity: 'center'
  prompt: string
}

// Every stamp by its name, for scripts/pictures.mjs
export const CAMINO_PICTURES: Record<string, StampPrompt> = Object.fromEntries(
  STAGES.map((s, i) => {
    const name = stampPicture(s)
    const first = i === 0
    return [
      name,
      {
        shape: 'square',
        size: '320x320',
        ref: first ? POSTER_REF : [POSTER_REF, FIRST_STAMP],
        cutout: true,
        gravity: 'center',
        prompt: [
          `The stamp of ${s.town}, on the Camino de Santiago: ${STAMP_SUBJECTS[s.town]}.`,
          `The border is ${BORDERS[i % BORDERS.length]}, in ${INKS[i % INKS.length]} ink.`,
          STAMP,
          SHOWN,
          POSTER,
          first
            ? ''
            : 'The second reference image is the first stamp of this set: match its make, its border’s weight, its inked texture and its flat colours, with this stamp’s own subject, border and ink. The first reference image is for the poster’s style only.',
          RULES,
        ]
          .filter(Boolean)
          .join(' '),
      },
    ]
  }),
)
