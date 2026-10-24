import { POSTER_REF } from './museo-prompts.ts'
import {
  BAR,
  COUNTER_AT,
  FACES,
  FRAME,
  SCENE_H,
  SCENE_W,
  guestSheet,
  itemPicture,
} from './tapasLayout.ts'

// The prompts for Tapas's paintings (games/tapas.tsx), read only by
// scripts/pictures.mjs: the bar seen from behind its counter, empty, a
// sheet of four busts for each guest, cut apart into the faces they make
// while ordering, and a cut-out of each drink and dish. All in the
// travel-poster style of every painting in Hola.

const STYLE =
  'A Spanish travel poster of the 1920s–30s, in the style of the reference image, for its style only and not its subject: a lithograph in a handful of flat colours with no outlines and no shading, large simple shapes, light shown only by flat bands of colour, a sophisticated muted palette (sea green, sand, terracotta, slate blue, cream), slight paper grain. Not photographic, not 3D, never glossy, no painterly brushwork.'
const NONE =
  'No lettering, signs, logos, labels, price tags or text anywhere in the picture, no frame and no border.'
const CUT =
  'A cut-out for a game, on a fully transparent background: no ground, no floor, no counter, no table, no shadow, nothing behind it.'

// The guests, each described the same in all four faces; none is a real
// person
const GUESTS: Record<string, string> = {
  Lucía:
    'Lucía, a cheerful woman of about thirty with warm light-brown skin, long dark-brown hair falling behind one shoulder with a small red clip in it, gold hoop earrings and a mustard-yellow top with a round neck',
  Manolo:
    'Manolo, a jovial regular of about seventy, bald on top with short grey hair at the sides, a thick grey moustache, warm tanned skin, a navy jacket over a white shirt open at the collar',
  Carmen:
    'Carmen, a kind, elegant woman of about seventy with fair skin, white hair in soft curls pinned up, round red spectacles, small pearl earrings, a green cardigan over a white blouse and a little red brooch',
  Javi: 'Javi, an easy-going man of about thirty with brown skin, short black curly hair and a short black beard, an orange T-shirt under an open slate-blue shirt',
}

// Each drink and dish as a bar in Madrid serves it, by its word in the bank
const ITEMS: Record<string, string> = {
  'el café':
    'a small white cup of black coffee, a café solo, on its saucer with a little spoon',
  'el café con leche':
    'a tall straight glass of milky coffee, café con leche, light brown with a pale top, a spoon standing in it, on a small saucer',
  'el té':
    'a white cup of amber tea on its saucer, the string and plain yellow tag of the tea bag hanging over the rim',
  'el agua':
    'a small bottle of still water with a blue cap and a plain blue band round it',
  'el zumo':
    'a glass of fresh orange juice, bright orange, with half an orange beside it',
  'la cerveza':
    'a brown glass bottle of beer, a botellín, with a plain cream label and a red stripe',
  'la caña':
    'a small straight glass of draught beer, golden, with a thick white head of foam',
  'el vino':
    'a dark green bottle of wine with a plain cream label, and beside it a stemmed glass of red wine',
  'el vino tinto': 'a stemmed glass half full of deep red wine',
  'el vino blanco': 'a stemmed glass half full of pale golden white wine',
  'el tinto de verano':
    'a tall glass of tinto de verano, red wine with lemonade, with ice cubes and a slice of lemon on the rim',
  'el vermut':
    'a short tumbler of red-brown vermouth with ice, a slice of orange and a green olive on a stick',
  'el refresco':
    'a tall glass of dark cola with bubbles, a slice of lemon on the rim and a red-and-white striped straw',
  'la tortilla':
    'a thick wedge of Spanish potato omelette, tortilla, golden outside and yellow inside, on a small white plate with a cocktail stick in it',
  'el jamón':
    'thin slices of dark red cured ham, jamón, with their white fat, laid out on a white plate',
  'el queso':
    'wedges of pale manchego cheese with its dark rind in a zigzag pattern, on a white plate',
  'la aceituna':
    'a small round clay dish, a cazuela, of plump green olives with a cocktail stick',
  'la ensalada':
    'a white bowl of Spanish salad: lettuce, tomato wedges, rings of white onion, green olives and a little tuna',
  'las patatas bravas':
    'a white plate of patatas bravas, chunks of fried potato under a stripe of red spicy sauce and a little white garlic sauce, with a cocktail stick',
  'los calamares':
    'a white plate of golden fried squid rings, calamares a la romana, with a wedge of lemon',
  'las croquetas':
    'a white plate of six small golden-brown breaded croquetas, oval and crisp',
  'las albóndigas':
    'a small round clay dish, a cazuela, of meatballs, albóndigas, in a brown sauce with a few green peas',
  'las gambas al ajillo':
    'a small round clay dish, a cazuela, of pink prawns in golden olive oil with slices of garlic and a red chilli',
  'los pimientos de Padrón':
    'a white plate of small blistered green Padrón peppers sprinkled with coarse salt',
  'el chorizo':
    'round slices of red chorizo sausage with white flecks of fat, on a white plate',
  'el pulpo':
    'pulpo a la gallega: slices of tender octopus with red paprika and olive oil on a round wooden plate',
}

// The counter's far edge, as a share of the painting's height: a
// landscape is painted 3:2 and cut from the middle to the scene's shape,
// so its lines lie a little nearer the middle in the painting than in the
// scene
const counterInPainting =
  0.5 + ((COUNTER_AT - 0.5) * (SCENE_H / SCENE_W)) / (2 / 3)

const bar = `Inside an old tapas bar in Madrid at midday, seen from behind its counter, as the barman sees it, at the height of a person standing there, looking straight across the counter to the room where the guests stand: whole legs of cured ham hanging from a dark wooden beam along the top, the far wall tiled with blue and yellow azulejos up to shoulder height and cream above, a green-shaded lamp, an open doorway at one side onto a sunny street, and a marble-topped table with two bentwood chairs at the other side. Across the whole width of the lower part of the picture runs the counter's bare zinc top, seen from just above; its far edge is one straight level line about ${Math.round(counterInPainting * 100)} per cent of the way down the picture, and below that line the counter top fills the picture to its bottom edge. Nobody in the picture: the bar has just opened, the middle third of the picture just beyond the counter is plain tiled wall with nothing in front of it, where a guest will stand, and the counter top is bare. ${STYLE} ${NONE}`

export interface TapasPrompt {
  shape: 'landscape' | 'portrait' | 'square'
  size: string
  ref: string
  prompt: string
  // A cut-out on a transparent background, trimmed and fitted into size
  cutout?: boolean
  // Cut into these parts, left to right, each saved as <name>-<part>
  parts?: ReadonlyArray<string>
}

// Every picture by its name, for scripts/pictures.mjs
export const TAPAS_PICTURES: Record<string, TapasPrompt> = {
  [BAR]: {
    shape: 'landscape',
    size: `${SCENE_W * 4}x${SCENE_H * 4}`,
    ref: POSTER_REF,
    prompt: bar,
  },
  ...Object.fromEntries(
    Object.entries(GUESTS).map(([who, looks]) => [
      guestSheet(who),
      {
        shape: 'landscape',
        size: `${FRAME.w}x${FRAME.h}`,
        ref: POSTER_REF,
        cutout: true,
        parts: FACES,
        prompt: `A character sheet for a game: four pictures of the same person side by side in one row, evenly spaced with clear empty space between them, each the same size: ${looks}. Each is a bust from the middle of the chest up, facing the viewer, cut off straight across the chest, hands out of sight, as a guest at a bar seen across the counter. From left to right: first waiting, a friendly, expectant look with the mouth closed; second ordering, mouth open in the middle of a word; third delighted, a broad warm smile with the eyes narrowed; fourth puzzled and a little put out, one eyebrow raised, the other lowered, the mouth crooked, as when served the wrong thing. The same person, clothes, colours, size and pose in all four; only the face changes, with a slight tilt of the head. ${CUT} ${STYLE} ${NONE}`,
      },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(ITEMS).map(([id, what]) => [
      itemPicture(id),
      {
        shape: 'square',
        size: '480x480',
        ref: POSTER_REF,
        cutout: true,
        prompt: `A single drink or dish served at a tapas bar, alone and whole in the middle of the picture, seen from the front and a little above: ${what}. Glass is shown in flat pale tones, not see-through. ${CUT} ${STYLE} ${NONE}`,
      },
    ]),
  ),
}
