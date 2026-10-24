import { POSTER_REF } from './museo-prompts.ts'
import { BUST, FACES, castPicture } from './casoLayout.ts'

// The prompts for El caso del reloj perdido's cast (data/caso.ts, shown in
// games/caso.tsx), read only by scripts/pictures.mjs: a sheet of four busts
// for each who says a line, cut apart into the faces they make while the
// inspector questions them. All in the travel-poster style of every
// painting in Hola, and each the person the chapters' paintings show: the
// first words of each description are those of scripts/pictures.mjs's
// chapter prompts (tests/caso.test.ts holds them to it), the rest is what
// keeps the four faces one person.

const STYLE =
  'A Spanish travel poster of the 1920s–30s, in the style of the reference image, for its style only and not its subject: a lithograph in a handful of flat colours with no outlines and no shading, large simple shapes, light shown only by flat bands of colour, a sophisticated muted palette (sea green, sand, terracotta, slate blue, cream), slight paper grain. Not photographic, not 3D, never glossy, no painterly brushwork.'
const NONE =
  'No lettering, signs, logos or text anywhere in the picture, no speech balloons, no frame and no border.'
const CUT =
  'A cut-out for a game, on a fully transparent background: no ground, no floor, no table, no shadow, nothing behind it.'

export interface CastMember {
  // As the chapters' paintings describe them, word for word
  is: string
  // What keeps the four faces one person
  more: string
  // The third face and the fourth, where the person's own differ from
  // pleased and worried
  glad?: string
  worried?: string
}

// Everyone who says a line, by their name in data/caso.ts
export const CAST: Record<string, CastMember> = {
  Garrido: {
    is: 'Inspector Garrido, a man of about fifty in a tan trench coat and a brown fedora, with a magnifying glass or a small notebook',
    more: 'here holding neither, his hands out of sight; dark hair greying a little at the temples, clean-shaven, a white shirt and a dark red tie under the coat; kind, calm and sharp-eyed',
    glad: 'satisfied, a quiet knowing smile',
    worried: 'puzzled, thinking hard, one eyebrow raised and a slight frown',
  },
  Narcís: {
    is: 'old Narcís, a retired fisherman of eighty with white hair, a grey flat cap and a navy jersey',
    more: 'a short white beard, a weathered tanned face with deep lines, a thin gold chain at the open neck of the jersey; gentle and warm',
    glad: 'happy and moved, a soft warm smile, eyes crinkled',
    worried:
      'dismayed and sad, eyebrows raised and drawn together, the corners of his mouth turned down',
  },
  Montse: {
    is: 'Montse, a woman in her forties in an apron',
    more: 'she runs a beach bar: brown hair in a loose bun, a slate-blue shirt with rolled-up sleeves under a white apron, small gold earrings; lively and warm',
    glad: 'laughing, a broad warm smile',
    worried: 'astonished, eyebrows high and eyes wide, mouth a little open',
  },
  Remei: {
    is: 'Remei, a lively woman in her seventies with a grey bun and a cardigan',
    more: 'a slate-blue cardigan over a dark dress, bright eyes and round cheeks; a chatty neighbour who sees everything',
    glad: 'delighted, a big beaming smile',
    worried:
      'caught out and a little embarrassed, eyebrows up, lips pursed, eyes to one side',
  },
  Quim: {
    is: 'Quim, an old fisherman with a beret and a big grey moustache',
    more: 'about eighty, a navy beret, a ruddy tanned face, a cream shirt with rolled-up sleeves under a navy apron; gruff and proud, quick to laugh',
    glad: 'laughing out loud, eyes crinkled shut',
    worried: 'indignant, frowning hard, chin up',
  },
  Puig: {
    is: 'Puig, a refined man with silver hair in a linen suit',
    more: 'a collector from Barcelona of about sixty: the silver hair combed back, a cream linen suit, a white shirt and a navy tie, a neat face; smooth and a little vain',
    glad: 'a smooth, satisfied smile',
    worried:
      'flustered and offended, eyebrows drawn together, cheeks flushed pink',
  },
  Jordi: {
    is: 'Jordi, a shy young watchmaker with a loupe on his forehead and an apron',
    more: 'in his twenties, short curly dark hair, a white shirt with rolled-up sleeves under a brown leather apron, rosy cheeks; gentle',
    glad: 'a shy, happy smile',
    worried: 'embarrassed, blushing red, eyes looking aside',
  },
  Laia: {
    is: 'Laia, a young woman in her twenties in a blue headscarf and a striped top',
    more: 'dark brown hair tied back under the slate-blue headscarf, the top striped navy and cream, a friendly open face; a little shy',
    glad: 'laughing, blushing a little',
    worried: 'uneasy, looking aside, a small forced smile',
  },
}

export interface CasoPrompt {
  shape: 'landscape' | 'portrait' | 'square'
  size: string
  ref: string
  prompt: string
  // A cut-out on a transparent background, trimmed and fitted into size
  cutout: true
  // Cut into these parts, left to right, each saved as <name>-<part>
  parts: ReadonlyArray<string>
}

const sheet = (c: CastMember) =>
  `A character sheet for a game: four pictures of the same person side by side in one row, evenly spaced with clear empty space between them, each the same size: ${c.is}; ${c.more}. Each is a bust from the chest up, facing the viewer, cut off straight across the chest, hands out of sight, as someone seen across a café table. From left to right: first neutral, waiting, listening politely with the mouth closed; second speaking, mouth open in the middle of a word; third ${c.glad ?? 'pleased, a broad warm smile'}; fourth ${c.worried ?? 'worried, eyebrows drawn together, lips pressed together'}. The same person, clothes, colours, size and pose in all four; only the face changes, with a slight tilt of the head. ${CUT} ${STYLE} ${NONE}`

// Every picture by its name, for scripts/pictures.mjs
export const CASO_PICTURES: Record<string, CasoPrompt> = Object.fromEntries(
  Object.entries(CAST).map(([who, c]) => [
    castPicture(who),
    {
      shape: 'landscape',
      size: `${BUST.w}x${BUST.h}`,
      ref: POSTER_REF,
      cutout: true,
      parts: FACES,
      prompt: sheet(c),
    },
  ]),
)
