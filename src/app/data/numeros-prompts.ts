import { POSTER_REF } from './museo-prompts.ts'
import { LOTTERY_VOICE } from './voices.ts'
import {
  BUST,
  FACES,
  MADRID,
  PLACE,
  SORTEO,
  SPEAKERS,
  speakerSheet,
} from './numerosLayout.ts'

// The prompts for Números's paintings (games/numeros.tsx), read only by
// scripts/pictures.mjs: a place behind each who says a number, a Madrid
// street for Lola and Andrés and the hall of the Christmas lottery's draw
// for Ildefonso, and a sheet of four busts for each of them, cut apart
// into the faces they make while the player listens and answers. All in
// the travel-poster style of every painting in Hola. None is a real
// person, and Ildefonso is any schoolboy, not one of the school's pupils.

const STYLE =
  'A Spanish travel poster of the 1920s–30s, in the style of the reference image, for its style only and not its subject: a lithograph in a handful of flat colours with no outlines and no shading, large simple shapes, light shown only by flat bands of colour, a sophisticated muted palette (sea green, sand, terracotta, slate blue, cream), slight paper grain. Not photographic, not 3D, never glossy, no painterly brushwork.'
const NONE =
  'No lettering, numbers, signs, logos, labels or text anywhere in the picture, no speech balloons, no frame and no border.'
const CUT =
  'A cut-out for a game, on a fully transparent background: no ground, no floor, no table, no shadow, nothing behind it.'

// A place is painted 2:3 and cut from the middle to the vignette's shape,
// and the bust covers its middle: what matters is at the top and the sides
const PLACE_SHOT =
  'It will be cut to an oval a little taller than it is wide, and a person will stand in front of it, covering the middle and the lower part: keep what makes the place in the upper third of the picture and at its left and right edges, with a plain, calm middle, and nothing that matters at the very top or bottom edge. Nobody in the picture.'

const madrid = `A sunny street in the middle of Madrid at midday, seen at the height of a person standing on the pavement and looking along it: tall cream and terracotta buildings with wrought-iron balconies and geraniums in pots on both sides, a striped awning of a café at the left edge and a green newspaper kiosk at the right, a deep blue sky at the top with, far down the street, the white Metrópolis building and its dark slate dome with a small winged figure on top. ${PLACE_SHOT} ${STYLE} ${NONE}`

const sorteo = `The stage of an old Madrid theatre on the morning of the Christmas lottery draw, seen from the front at the height of a child standing on it: heavy red velvet curtains with gold fringes drawn back at both sides and across the top, a gilded proscenium arch, and on the stage two great lottery drums of polished brass bars, round cages on their stands, a large one at the left and a smaller one at the right, with a few small wooden balls lying on a brass tray in front of the large one. The middle of the picture is the plain dark red curtain at the back of the stage. ${PLACE_SHOT} ${STYLE} ${NONE}`

export interface Speaker {
  // Who they are, the same words for all four faces
  is: string
  // The four faces, left to right, as FACES names them
  faces: [string, string, string, string]
}

// The faces of Lola and Andrés, who say the sentences
const SAYING: Speaker['faces'] = [
  'listening, a friendly, patient look with the mouth closed',
  'speaking, mouth open in the middle of a word, eyebrows lifted a little',
  'glad, a broad warm smile with the eyes narrowed, the head tipped forward as in a nod',
  'kind and encouraging, a small gentle smile with the eyebrows drawn up a little, the head tilted to one side, as when saying «not quite, nearly»',
]

// Each who says a number, by their voice in data/voices.ts
export const SPEAKER_LOOKS: Record<string, Speaker> = {
  Lola: {
    is: 'Lola, a friendly, clear-spoken woman of about forty from Madrid with light olive skin, shoulder-length wavy dark-brown hair tucked behind one ear, small silver earrings, and a coral-red blouse with a round collar under a navy cardigan',
    faces: SAYING,
  },
  Andrés: {
    is: 'Andrés, a calm, good-humoured man of about fifty from Madrid with light-brown skin, short salt-and-pepper hair, a neat short grey-flecked beard and dark-rimmed spectacles, a sand-coloured jacket over a sea-green shirt open at the collar',
    faces: SAYING,
  },
  [LOTTERY_VOICE]: {
    is: 'Ildefonso, a schoolboy of about ten who sings out the numbers of the Christmas lottery: short dark-brown hair neatly combed with a parting, light olive skin, rosy cheeks, in a school uniform, a navy-blue jacket over a white shirt buttoned to the collar; a made-up boy, not any real child',
    faces: [
      'waiting for the next ball, standing up straight, a serious, proud look with the mouth closed',
      'singing out a number, mouth wide open in a long sung note, chin up and eyebrows raised',
      'beaming, a big delighted grin',
      'kind and encouraging, a shy little smile with the eyebrows drawn up, the head tilted to one side, as when saying «not quite, nearly»',
    ],
  },
}

export interface NumerosPrompt {
  shape: 'landscape' | 'portrait' | 'square'
  size: string
  ref: string
  prompt: string
  // A cut-out on a transparent background, trimmed and fitted into size
  cutout?: boolean
  // Cut into these parts, left to right, each saved as <name>-<part>
  parts?: ReadonlyArray<string>
}

const sheet = ({ is, faces }: Speaker) =>
  `A character sheet for a game: four pictures of the same person side by side in one row, evenly spaced with clear empty space between them, each the same size: ${is}. Each is a bust from the middle of the chest up, facing the viewer, cut off straight across the chest, hands out of sight, as the portrait on a banknote. From left to right: first ${faces[0]}; second ${faces[1]}; third ${faces[2]}; fourth ${faces[3]}. The same person, clothes, colours, size and pose in all four; only the face changes, with a slight tilt of the head. ${CUT} ${STYLE} ${NONE}`

// Every picture by its name, for scripts/pictures.mjs
export const NUMEROS_PICTURES: Record<string, NumerosPrompt> = {
  [MADRID]: {
    shape: 'portrait',
    size: `${PLACE.w}x${PLACE.h}`,
    ref: POSTER_REF,
    prompt: madrid,
  },
  [SORTEO]: {
    shape: 'portrait',
    size: `${PLACE.w}x${PLACE.h}`,
    ref: POSTER_REF,
    prompt: sorteo,
  },
  ...Object.fromEntries(
    SPEAKERS.map((who) => [
      speakerSheet(who),
      {
        shape: 'landscape',
        size: `${BUST.w}x${BUST.h}`,
        ref: POSTER_REF,
        cutout: true,
        parts: FACES,
        prompt: sheet(SPEAKER_LOOKS[who]),
      },
    ]),
  ),
}
