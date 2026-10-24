import { MUSEO, SHOWN } from './museo.ts'
import type { Shape } from './museo.ts'

// The prompts for Tu museo's pictures (data/museo.ts), read only by
// scripts/pictures.mjs, which paints them on the Mac as museo/<lesson>: kept
// out of data/museo.ts so that the page does not carry them. Every painted
// picture in Hola is a travel poster, as Gorm chose from the round
// Hola-stiler in moodboard, with design/sketches/reiseplakat.jpg as the
// reference for the style.

// The sketch every painting follows for its style
export const POSTER_REF = 'design/sketches/reiseplakat.jpg'

// The style of every painting
export const POSTER =
  'A Spanish travel poster of the 1920s–30s, in the style of the reference image, for its style only and not its subject: a lithograph in a handful of flat colours with no outlines and no shading, large simple shapes and bold silhouettes, a generous flat sky wherever there is sky, light shown only by flat bands of colour, a sophisticated muted palette (sea green, sand, terracotta, slate blue, cream), a calm mood, slight paper grain. Not photographic, not 3D, never glossy, no painterly brushwork. No crowds: at most two or three small figures.'

// What every prompt ends with
const RULES =
  'No lettering, words or numbers anywhere in the picture, no signature, no frame or border. An original picture, not a copy of any artist’s work.'

const FORMAT: Record<Shape, string> = {
  portrait: 'Portrait format, 2:3.',
  landscape: 'Landscape format, 3:2.',
  square: 'Square format.',
}

// What each picture shows, by lesson
export const SCENES: Record<string, string> = {
  tapeo:
    'The counter of an old Spanish tapas bar in the late afternoon: a zinc counter with two small glasses of beer (cañas), little plates of green olives, a slice of tortilla and croquetas, legs of ham hanging from a beam, a blank chalkboard, crumpled paper napkins on a floor of patterned tiles, low sunlight through the open door. No people.',
  compras:
    'A fruit and vegetable stall in a Spanish covered market: wooden crates of oranges, tomatoes, lemons and green peppers, a hanging brass scale, paper bags, a striped awning above, iron columns of the market hall behind. No people.',
  transporte:
    'A small country railway station in Spain, with a strong diagonal: a red and cream train with a steam locomotive arrives along the platform, a round station clock on a bracket, plane trees, a whitewashed station house with a tiled roof, blue mountains and a pale sky. No people.',
  parientes:
    'A long family table in a village courtyard under a pergola of grapevines, just after a long Sunday lunch: a white tablecloth with coffee cups, a cake with candles, a jug of water, bread, chairs pushed back at different angles, a child’s ball on the ground, dappled sunlight. Nobody at the table.',
  clima:
    'A white Andalusian hill village as a summer thunderstorm passes over: heavy clouds with a fork of lightning on the left, a rainbow on the right where the sun breaks through, slanting lines of rain, a red umbrella left open on a balcony.',
  horarios:
    'A quiet Spanish street at three in the afternoon during the siesta: shutters and persianas closed on every window, deep blue shadows cut sharply across ochre walls, a church tower with a clock showing three, potted geraniums, a cat asleep on a doorstep. No people.',
  tramites:
    'The service window of an old Spanish town hall office: a wooden counter with a glass partition and a round opening, a rubber stamp and an ink pad, a neat pile of blank forms, a paper queue ticket, a small pot plant, a wall clock, green filing cabinets behind. No people, and no writing on anything.',
  indicaciones:
    'A crossroads in a Spanish city seen from straight above, like a map: zebra crossings, a traffic light on a corner, a pharmacy with a glowing green cross sign, a newspaper kiosk, the round tops of plane trees, one white taxi with a red stripe turning the corner, long morning shadows. No people.',
  tapas:
    'A still life of tapas on a wooden table seen slightly from above: a small earthenware cazuela of prawns sizzling in garlic and oil, a plate of blistered Padrón peppers with coarse salt, toothpicks in a little glass, a basket of bread, a glass of sherry, and through a window behind, a white village in the sun.',
  paella:
    'A seafood paella seen from straight above. The wide shallow pan with its two handles fills the middle: saffron-yellow rice with a dark crisp edge of socarrat, red prawns and langoustines laid in a ring, black mussels and clams opened, rings of cuttlefish, lemon wedges. Around it on a blue-and-white checked cloth: a sprig of rosemary, a small plain tin of saffron threads, a little dish of paprika and a wooden spoon. No people.',
  tortilla:
    'A still life of a Spanish potato omelette on a kitchen table by an open window: a thick round tortilla de patatas on a plate with one wedge cut out, a frying pan with a plate as lid beside it, potatoes, an onion cut in half, brown eggs in a bowl, a glass cruet of olive oil, a wooden spoon, and olive trees outside.',
  churros:
    'A marble café table at dawn with a cup of thick hot chocolate and a paper cone of churros dusted with sugar. A window behind with a street lamp still lit and the first pale light of morning, a sugar bowl, a folded newspaper without visible print.',
  embutidos:
    'A Spanish larder: a cured ham on a wooden jamonero with a long knife, chorizos and salchichón hanging from a pole, a whole wheel of manchego cheese with its zigzag rind, a branch of holm oak with acorns, a board with thin slices, and through a small window the dehesa with its holm oaks.',
  bebidas:
    'Inside an old Spanish wine cellar: arches and rows of oak barrels receding into the dark, a beam of light falling from a high grated window across the floor, a clay jug and a glass of red wine on a barrel head, bunches of grapes in a basket. No people.',
  latino:
    'A still life of foods from Latin America in bright colours: ears of maize in yellow, red and blue, avocados, limes, red and green chiles, ribbed cacao pods, a clay pot, all laid on a striped woven cloth.',
  cataluna:
    'A wrought-iron balcony high above Barcelona on Sant Jordi’s day, 23 April. On the balcony rail a single red rose tied with a red and yellow ribbon and a closed book, below the roofs of the old town, the harbour with a sailing ship and the hill of Montjuïc against the blue Mediterranean. No people.',
  andalucia:
    'A patio in Córdoba in May: whitewashed walls hung from top to bottom with small blue flowerpots full of red geraniums, a low round fountain in the middle with a thin jet of water, a band of patterned tiles along the foot of the walls, an arch with a wrought-iron gate to the street, and in the shade a cane chair with a folded fan on it and a guitar leaning against it. No people.',
  galicia:
    'A Galician granite hórreo, a granary raised on stone legs with a cross on its roof, on a green headland above the Atlantic. A white lighthouse on the far point, fine slanting drizzle, a scallop shell resting on a mossy stone in the foreground, gulls.',
  euskadi:
    'The shell-shaped bay of La Concha in San Sebastián seen from a hill: the small island in the mouth of the bay, red and green fishing boats at anchor, the curving promenade with its white railing, green hills with a white caserío farmhouse, a cloudy northern sky. No people.',
  valencia:
    'The huerta of Valencia: rows of orange trees heavy with fruit and white blossom, a whitewashed barraca with a steep thatched roof and a blue door, a straight irrigation channel reflecting the sky, flooded rice fields to the horizon, a heron. No people.',
  murcia:
    'A lemon grove in the huerta of Murcia with an old wooden waterwheel, a noria, lifting water into a channel, dry mountains far behind under a big sky. No people.',
  alicante:
    'Almond trees in blossom on the terraced hills behind Alicante in February: rows of almond trees in white and pale pink blossom on terraces held up by dry-stone walls, a whitewashed farmhouse with a blue door, a winding path, and far below a strip of blue Mediterranean with one white sail. No people.',
  viaje:
    'The compartment of an old Spanish train running along the Mediterranean coast. The window is let down and its curtain blows in; outside, orange groves, a white village and the blue sea go by. A leather suitcase and a straw hat in the luggage rack above, and on the little table under the window a paper bag of oranges, two cups of coffee and a closed guidebook with a plain cover. No people.',
  rastro:
    'A steep street of Madrid’s Sunday flea market, El Rastro, early in the morning before the crowds: blankets and trestle tables laid with brass lamps, an open music box, old books, picture frames, a birdcage and blue and white plates, a striped canvas awning, tall old houses with iron balconies. At most one seller sitting on a folding chair.',
  mancha:
    'A row of white windmills with black conical roofs on a bare ridge of La Mancha under a huge sky. Far off on the dusty road, very small, a thin knight with a lance on a bony horse and a short squire on a donkey. Golden wheat stubble, a few clouds.',
  suenos:
    'A dreamlike desert at dusk: smooth dunes in rose and ochre, long violet shadows, a tall wooden ladder standing alone in the sand and rising into a cloud, a round stone floating above the ground with its shadow beneath it, a few blue and orange butterflies, a thin crescent moon. Original and calm; no melting clocks, no long-legged elephants, no ants, no crutches or anything else from Salvador Dalí’s paintings.',
  romanos:
    'The Roman aqueduct of Segovia: its two tiers of granite arches striding over the tiled roofs of the old town, seen from below so it towers, swifts in the sky, the snowy Guadarrama mountains far behind. No people.',
  alandalus:
    'The hall of an old Arab bath of al-Andalus: a vaulted brick ceiling pierced by small star-shaped and octagonal skylights, each letting a slanting beam of light down through the drifting steam; horseshoe arches on slender columns around a still pool, the beams making bright stars on the water and the floor. No people. Calm, quiet and spacious.',
  museo:
    'A quiet room of an old art museum: red walls, a long skylight with thin glazing bars throwing stripes of light, a bench with a red cushion in the middle, a doorway into the next room, and several gilded frames on the walls that are left empty, showing only the red wall inside them. No paintings inside the frames, no people.',
  gaudi:
    'The towers of Antoni Gaudí’s Sagrada Família in Barcelona, drawn anew from the building itself: tall perforated spires like honeycomb, pinnacles topped with clusters of coloured mosaic fruit, two construction cranes beside them against a clear blue sky, a few pigeons. No people.',
  cine: 'A Spanish open-air summer cinema, a cine de verano, on a warm night: rows of empty folding chairs on gravel, a large white screen glowing blank, the cone of light from the projection booth with moths in it, a whitewashed wall covered with jasmine, a few stars and a moon. No people and no image on the screen.',
  ictineo:
    'A wooden submarine of 1859 shaped like a fat fish, half submerged in the calm harbour of Barcelona: its hull of olive planks bound with copper bands, two round glass portholes on the hump, a small hatch on top, a four-bladed propeller at the tail stirring the water, rings of ripples around it. Behind, a stone quay with bollards and coiled rope, a few moored sailing ships with furled sails, the hill of Montjuïc faint in the haze. Below the waterline the hull goes on in paler green among small fish. No people.',
  mexico:
    'A family altar, an ofrenda, for the Day of the Dead: banners of papel picado across the top cut with flowers and birds, orange cempasúchil marigolds in jars and as a path of petals, lit candles, smiling sugar skulls decorated with icing flowers, pan de muerto, a clay cup of hot chocolate, an empty photo frame. No people.',
  cuba: 'The Malecón of Havana at sunset: a wave breaking high over the long sea wall in white spray, a row of pastel colonnaded facades in pink, turquoise and yellow, one rounded old American car of the 1950s, a lone palm, the sun low over the sea. No people.',
  argentina:
    'The Argentine pampa: an endless flat grassland under a vast evening sky, a single broad ombú tree, a lone gaucho in a poncho on horseback riding slowly, small in the distance, a flock of birds.',
  colombia:
    'A quiet street of a village near the Caribbean coast of Colombia: low houses in bright colours with wooden shutters, a large almond tree, a clear river with smooth white stones at the end of the street, and a cloud of small yellow butterflies drifting through the air. No people.',
  flamenco:
    'An empty flamenco stage, a tablao: a wooden plank floor, a rush-seated chair with a Spanish guitar leaning on it, a fringed embroidered shawl, a mantón, thrown over its back, a pair of castanets on the floor, a single round pool of light from above, a dark background with a tiled wall. No people.',
  ritmos:
    'An empty dance hall in the Caribbean before the band arrives: a pair of painted maracas, a conga drum and a trumpet resting on a chair, a checkered dance floor, potted palms, strings of round light bulbs, an open window to the warm night. No people.',
  semanasanta:
    'The Feria de Abril in Seville on a sunny afternoon: strings of round paper lanterns over striped casetas, an empty horse carriage with a tall wheel, and the Giralda tower in the distance. No crowds.',
  sanfermin:
    'A narrow street of old Pamplona at noon on the sixth of July: tall stone houses with wrought-iron balconies and flower boxes, a red neckerchief tied to the railing of one balcony, white bunting, a puff of rocket smoke in the strip of blue sky. The street empty. No bulls and no crowds.',
  tenorio:
    'A moonlit churchyard in Seville: a marble statue of a knight standing on a tomb, a tall cypress, the white wall of a family pantheon with an iron gate, a single candle burning on the steps, a full moon behind thin clouds. Mysterious but calm, not gruesome. No people.',
  becquer:
    'A cold autumn night above Soria: a dark mountain with bare oaks, a ruined chapel and a bell tower on its side, the river Duero curving below with a stone bridge, mist on the water, a full moon, dry leaves blowing. No people.',
  llorona:
    'A wide river at night in Mexico: tall reeds in the foreground, the moon reflected in broken lines, a few low houses with one lit window on the far side, and far along the bank, very small, a figure in a long white veil. Melancholy, not frightening.',
  dorado:
    'The round mountain lake of Guatavita in the Colombian highlands at dawn: steep green slopes around dark still water, wisps of mist, and on the water a small raft of reeds carrying a figure glittering with gold dust, with four small attendants, golden objects sinking as offerings and rings spreading on the water.',
  caso: 'A still life of a detective’s things on a small round café table by the harbour of a white Mediterranean village: a brown fedora, a magnifying glass, a small closed notebook with a pencil, a cup of coffee, and a gold watch chain lying in a curl with no watch on it. Behind, a blue door, white walls, pink bougainvillea and the blue bay with a moored fishing boat. No people, no writing anywhere.',
  refranes:
    'The Spanish proverb «más vale pájaro en mano que ciento volando»: an old farmer in a straw hat standing on a hill of wheat stubble, holding one small bird gently in his hand while a great flock of birds flies off across the wide sky.',
  falsos:
    'A playful still life about look-alikes: two almost identical carnival masks side by side on a table, one smiling and one surprised, a cardboard folder tied with a ribbon lying on a patterned rug, a drinking glass beside a flower vase of the same shape, a door left ajar. Witty and calm. No people.',
  trabalenguas:
    'Three gloomy tigers sitting in a golden wheat field, chewing stalks of wheat with mournful faces, the wind drawn as rhythmic waves through the wheat, a pale sky with one cloud. Gentle and funny, not fierce.',
  sonidos:
    'A small seaside kitchen: a big pot steaming on an old stove, a tiled wall with blue and white tiles, and through the open window a great curling wave of the sea, its curve echoing the pot’s steam. A little wooden penguin stands on the windowsill. No people.',
}

export interface MuseoPrompt {
  shape: Shape
  // To cut it to, twice the largest it is shown
  size: string
  ref: string
  prompt: string
}

// Every picture by its name, for scripts/pictures.mjs
export const MUSEO_PICTURES: Record<string, MuseoPrompt> = Object.fromEntries(
  MUSEO.map((x) => {
    const [w, h] = SHOWN[x.shape]
    return [
      `museo/${x.lesson}`,
      {
        shape: x.shape,
        size: `${w * 2}x${h * 2}`,
        ref: POSTER_REF,
        prompt: [SCENES[x.lesson], POSTER, RULES, FORMAT[x.shape]].join(' '),
      },
    ]
  }),
)
