import { MUSEO, SHOWN } from './museo.ts'
import type { Shape } from './museo.ts'

// The prompts for Tu museo's pictures (data/museo.ts), read only by
// scripts/pictures.mjs, which paints them on the Mac as museo/<lesson>: kept
// out of data/museo.ts so that the page does not carry them. Each picture
// is a print or a poster in the medium its entry names; where one of the
// sketches in design/sketches/ is in that medium, it goes along as a
// reference for the style.

// What every prompt ends with
const RULES =
  'A flat graphic print: a limited palette, strong simple shapes and visible texture of the printing. No lettering, words or numbers anywhere in the picture, no signature, no frame or border. No photographic detail, no glossy 3D, no neon, no crowds, no oil-paint brushwork. An original picture, not a copy of any artist’s work.'

const FORMAT: Record<Shape, string> = {
  portrait: 'Portrait format, 2:3.',
  landscape: 'Landscape format, 3:2.',
  square: 'Square format.',
}

// The sketch in the same medium, by the start of the medium's name
const REFS: Array<[string, string]> = [
  ['Ligne claire', 'design/sketches/tapas.jpg'],
  ['Reiseplakat', 'design/sketches/viaje.jpg'],
  ['Aleluya', 'design/sketches/orden.jpg'],
  ['Håndkolorert tresnitt', 'design/sketches/rastro.jpg'],
  ['Tresnitt', 'design/sketches/leyendas.jpg'],
  ['Azulejo', 'design/sketches/sopa-de-letras.jpg'],
  ['Papirklipp', 'design/sketches/por-o-para.jpg'],
]

const refOf = (medium: string) =>
  REFS.find(([start]) => medium.startsWith(start))?.[1]

// What each picture shows, and how, by lesson
export const SCENES: Record<string, string> = {
  tapeo:
    'The counter of an old Spanish tapas bar in the late afternoon, drawn in ligne claire: even black outlines, flat colours, no shading. A zinc counter with two small glasses of beer (cañas), little plates of green olives, a slice of tortilla and croquetas, legs of ham hanging from a beam, a blank chalkboard, crumpled paper napkins on a floor of patterned tiles, low sunlight through the open door. No people. Palette of cream, ochre, terracotta red and bottle green.',
  compras:
    'A fruit and vegetable stall in a Spanish covered market, as a three-colour linocut with visible carving marks and slightly uneven ink. Wooden crates of oranges, tomatoes, lemons and green peppers, a hanging brass scale, paper bags, a striped awning above, iron columns of the market hall behind. No people. Palette of orange, tomato red, leaf green and black on warm cream paper.',
  transporte:
    'A small country railway station in Spain in the style of a 1930s Spanish travel poster: flat lithographic colour, simplified geometric forms, a strong diagonal. A red and cream train with a steam locomotive arrives along the platform, a round station clock on a bracket, plane trees, a whitewashed station house with a tiled roof, blue mountains and a pale sky. No people. Palette of cream, brick red, slate blue and dark olive.',
  parientes:
    'A long family table in a village courtyard under a pergola of grapevines, just after a long Sunday lunch, drawn in ligne claire: clean even outlines, flat colours, no shading. A white tablecloth with coffee cups, a cake with candles, a jug of water, bread, chairs pushed back at different angles, a child’s ball on the ground, dappled sunlight. Nobody at the table. Palette of vine green, terracotta, cream and sky blue.',
  clima:
    'A white Andalusian hill village as a summer thunderstorm passes over, as a woodcut printed in black and two colours, with the grain of the wood showing. Heavy clouds with a fork of lightning on the left, a rainbow on the right where the sun breaks through, slanting lines of rain, a red umbrella left open on a balcony. Palette of storm blue, ochre yellow and black on cream paper.',
  horarios:
    'A quiet Spanish street at three in the afternoon during the siesta, as a screenprint with four flat colours slightly out of register. Shutters and persianas closed on every window, deep blue shadows cut sharply across ochre walls, a church tower with a clock showing three, potted geraniums, a cat asleep on a doorstep. No people. Palette of hot ochre, deep blue, geranium red and dark brown.',
  tramites:
    'The service window of an old Spanish town hall office, drawn in ligne claire with even outlines and flat colours. A wooden counter with a glass partition and a round opening, a rubber stamp and an ink pad, a neat pile of blank forms, a paper queue ticket, a small pot plant, a wall clock, green filing cabinets behind. No people, and no writing on anything. Palette of institutional green, mustard, cream and grey.',
  indicaciones:
    'A crossroads in a Spanish city seen from straight above, as a flat screenprint like a map. Zebra crossings, a traffic light on a corner, a pharmacy with a glowing green cross sign, a newspaper kiosk, the round tops of plane trees, one white taxi with a red stripe turning the corner, long morning shadows. No people. Palette of asphalt grey, pharmacy green, taxi white and warm yellow.',
  tapas:
    'A still life of tapas as a linocut in three colours, with bold carved lines and white gouge marks. A small earthenware cazuela of prawns sizzling in garlic and oil, a plate of blistered Padrón peppers with coarse salt, toothpicks in a little glass, a basket of bread, a glass of sherry, on a wooden table seen slightly from above. Palette of terracotta, olive green, ochre and black on cream paper.',
  paella:
    'A seafood paella seen from straight above, as a hand-coloured woodcut: black woodcut lines with watercolour washes laid in by hand, a little outside the lines. The wide shallow pan with its two handles fills the middle: saffron-yellow rice with a dark crisp edge of socarrat, red prawns and langoustines laid in a ring, black mussels and clams opened, rings of cuttlefish, lemon wedges. Around it on a blue-and-white checked cloth: a sprig of rosemary, a small plain tin of saffron threads, a little dish of paprika and a wooden spoon. No people. Palette of saffron, prawn red, mussel black and cloth blue.',
  tortilla:
    'A still life of a Spanish potato omelette as a two-colour linocut, golden yellow and black, with bold carved shapes. A thick round tortilla de patatas on a plate with one wedge cut out, a frying pan with a plate as lid beside it, potatoes, an onion cut in half, brown eggs in a bowl, a glass cruet of olive oil, a wooden spoon. Palette of egg yolk yellow and black on cream paper, with a touch of olive green.',
  churros:
    'A marble café table at dawn with a cup of thick hot chocolate and a paper cone of churros dusted with sugar, made as layered cut paper: each shape cut from coloured paper and stacked, with soft shadows between the layers. A window behind with a street lamp still lit and the first pale light of morning, a sugar bowl, a folded newspaper without visible print. Palette of chocolate brown, golden churro, marble white and dawn blue.',
  embutidos:
    'A Spanish larder as a hand-coloured woodcut: strong black lines with flat washes of colour added by hand. A cured ham on a wooden jamonero with a long knife, chorizos and salchichón hanging from a pole, a whole wheel of manchego cheese with its zigzag rind, a branch of holm oak with acorns, a board with thin slices. Palette of deep red, cheese ochre, oak green and black.',
  bebidas:
    'Inside an old Spanish wine cellar as a linocut, with carved arches and rows of oak barrels receding into the dark, a beam of light falling from a high grated window across the floor, a clay jug and a glass of red wine on a barrel head, bunches of grapes in a basket. No people. Palette of wine red, oak brown, dusty gold and black on cream.',
  latino:
    'A still life of foods from Latin America as a reduction linocut in bright flat colours, in the tradition of Latin American popular printmaking. Ears of maize in yellow, red and blue, avocados, limes, red and green chiles, ribbed cacao pods, a clay pot, all laid on a striped woven cloth. Palette of chile red, lime green, maize yellow, deep blue and black on cream paper.',
  cataluna:
    'A wrought-iron balcony high above Barcelona on Sant Jordi’s day, 23 April, in the style of a 1930s Spanish travel poster with flat colours and simplified forms. On the balcony rail a single red rose tied with a red and yellow ribbon and a closed book, below the roofs of the old town, the harbour with a sailing ship and the hill of Montjuïc against the blue Mediterranean. No people. Palette of rose red, sea blue, warm stone and gold.',
  andalucia:
    'A patio in Córdoba in May, as a linocut in three colours with bold carved shapes and white gouge marks. Whitewashed walls hung from top to bottom with small blue flowerpots full of red geraniums, a low round fountain in the middle with a thin jet of water, a band of patterned tiles along the foot of the walls, an arch with a wrought-iron gate to the street, and in the shade a cane chair with a folded fan on it and a guitar leaning against it. No people. Palette of geranium red, cobalt blue and black on whitewash-white paper.',
  galicia:
    'A Galician granite hórreo, a granary raised on stone legs with a cross on its roof, on a green headland above the Atlantic, as a woodcut in black, sea green and grey with the wood grain visible. A white lighthouse on the far point, fine slanting drizzle, a scallop shell resting on a mossy stone in the foreground, gulls. Palette of moss green, granite grey, Atlantic blue and black.',
  euskadi:
    'The shell-shaped bay of La Concha in San Sebastián seen from a hill, in the style of a 1930s Spanish travel poster with flat colours and clean shapes. The small island in the mouth of the bay, red and green fishing boats at anchor, the curving promenade with its white railing, green hills with a white caserío farmhouse, a cloudy northern sky. No people. Palette of bay blue, hill green, sand and white.',
  valencia:
    'The huerta of Valencia as layered cut paper, each shape cut from coloured paper and stacked with soft shadows between the layers. Rows of orange trees heavy with fruit and white blossom, a whitewashed barraca with a steep thatched roof and a blue door, a straight irrigation channel reflecting the sky, flooded rice fields to the horizon, a heron. No people. Palette of orange, leaf green, whitewash and water blue.',
  murcia:
    'A panel of painted Spanish azulejo tiles, sixteen square tiles in a four by four grid with thin grout lines visible, showing a lemon grove in the huerta of Murcia with an old wooden waterwheel, a noria, lifting water into a channel. Painted in cobalt blue and lemon yellow on glossy white glaze, with the slightly uneven brushwork of hand-painted tiles and a simple ornamental border tile around the edge. No people.',
  alicante:
    'Almond trees in blossom on the terraced hills behind Alicante in February, as a colour woodblock print in the manner of Japanese ukiyo-e landscapes: flat areas of colour, fine black key lines and a soft gradient in the sky. Rows of almond trees in white and pale pink blossom on terraces held up by dry-stone walls, a whitewashed farmhouse with a blue door, a winding path, and far below a strip of blue Mediterranean with one white sail. No people. Palette of blossom white and pink, terrace ochre, sea blue and dark bark brown.',
  viaje:
    'The compartment of an old Spanish train running along the Mediterranean coast, drawn in ligne claire with even black outlines and flat colours. The window is let down and its curtain blows in; outside, orange groves, a white village and the blue sea go by. A leather suitcase and a straw hat in the luggage rack above, and on the little table under the window a paper bag of oranges, two cups of coffee and a closed guidebook with a plain cover. No people. Palette of sea blue, orange, cream and the green of the seats.',
  rastro:
    'A steep street of Madrid’s Sunday flea market, El Rastro, early in the morning before the crowds, drawn in ligne claire with even outlines and flat colours. Blankets and trestle tables laid with brass lamps, an open music box, old books, picture frames, a birdcage and blue and white plates, a striped canvas awning, tall old houses with iron balconies. At most one seller sitting on a folding chair. Palette of brick red, brass, faded blue and cream.',
  mancha:
    'A row of white windmills with black conical roofs on a bare ridge of La Mancha under a huge sky, as a hand-coloured woodcut in the manner of an old Spanish chapbook: bold black cut lines, watercolour laid in by hand a little outside them. Far off on the dusty road, very small, a thin knight with a lance on a bony horse and a short squire on a donkey. Golden wheat stubble, a few clouds. Palette of wheat gold, sky blue, whitewash and black.',
  suenos:
    'A dreamlike desert at dusk as layered cut paper with soft shadows between the layers: smooth dunes in rose and ochre, long violet shadows, a tall wooden ladder standing alone in the sand and rising into a cloud, a round stone floating above the ground with its shadow beneath it, a few blue and orange paper butterflies, a thin crescent moon. Original and calm; no melting clocks, no long-legged elephants, no ants, no crutches or anything else from Salvador Dalí’s paintings. Palette of rose, ochre, violet and night blue.',
  romanos:
    'The Roman aqueduct of Segovia as a woodcut in black and two colours with the wood grain showing: its two tiers of granite arches striding over the tiled roofs of the old town, seen from below so it towers, swifts in the sky, the snowy Guadarrama mountains far behind. No people. Palette of granite ochre, sky blue, terracotta and black on cream.',
  alandalus:
    'The hall of an old Arab bath of al-Andalus, as a woodcut printed in deep blue, warm ochre and black on cream paper, with the wood grain showing. A vaulted brick ceiling pierced by small star-shaped and octagonal skylights, each letting a slanting beam of light down through the drifting steam; horseshoe arches on slender columns around a still pool, the beams making bright stars on the water and the floor. No people. Calm, quiet and spacious.',
  museo:
    'A quiet room of an old art museum as a linocut in three colours: red walls, a long skylight with thin glazing bars throwing stripes of light, a bench with a red cushion in the middle, a doorway into the next room, and several gilded frames on the walls that are left empty, showing only the red wall inside them. No paintings inside the frames, no people. Palette of museum red, gold, cream and black.',
  gaudi:
    'The towers of Antoni Gaudí’s Sagrada Família in Barcelona as a linocut with bold carved lines, drawn anew from the building itself: tall perforated spires like honeycomb, pinnacles topped with clusters of coloured mosaic fruit, two construction cranes beside them against a clear blue sky, a few pigeons. No people. Palette of sandstone ochre, mosaic orange and teal, sky blue and black.',
  cine: 'A Spanish open-air summer cinema, a cine de verano, on a warm night, drawn in ligne claire with even outlines and flat colours. Rows of empty folding chairs on gravel, a large white screen glowing blank, the cone of light from the projection booth with moths in it, a whitewashed wall covered with jasmine, a few stars and a moon. No people and no image on the screen. Palette of night blue, screen white, jasmine green and warm yellow.',
  ictineo:
    'A wooden submarine of 1859 shaped like a fat fish, half submerged in the calm harbour of Barcelona, as a woodcut printed in sea green and black on cream paper with the wood grain showing: its hull of olive planks bound with copper bands, two round glass portholes on the hump, a small hatch on top, a four-bladed propeller at the tail stirring the water, rings of ripples around it. Behind, a stone quay with bollards and coiled rope, a few moored sailing ships with furled sails, the hill of Montjuïc faint in the haze. Below the waterline the hull goes on in paler green among small fish. No people. Palette of sea green, pale green, cream and black.',
  mexico:
    'A family altar, an ofrenda, for the Day of the Dead, as layered cut paper with crisp edges and soft shadows. Banners of papel picado across the top cut with flowers and birds, orange cempasúchil marigolds in jars and as a path of petals, lit candles, smiling sugar skulls decorated with icing flowers, pan de muerto, a clay cup of hot chocolate, an empty photo frame. No people. Palette of marigold orange, magenta, turquoise and dark plum.',
  cuba: 'The Malecón of Havana at sunset as a screenprinted poster with flat colours slightly out of register: a wave breaking high over the long sea wall in white spray, a row of pastel colonnaded facades in pink, turquoise and yellow, one rounded old American car of the 1950s, a lone palm, the sun low over the sea. No people. Palette of coral, turquoise, sunset orange and dark blue.',
  argentina:
    'The Argentine pampa as a colour woodblock print in the manner of Japanese ukiyo-e landscapes: flat areas of colour with soft gradations at the sky’s edge and fine black key lines. An endless flat grassland under a vast evening sky, a single broad ombú tree, a lone gaucho in a poncho on horseback riding slowly, small in the distance, a flock of birds. Palette of grass green, evening orange, pale sky blue and black.',
  colombia:
    'A quiet street of a village near the Caribbean coast of Colombia as layered cut paper with soft shadows between layers: low houses in bright colours with wooden shutters, a large almond tree, a clear river with smooth white stones at the end of the street, and a cloud of small yellow butterflies drifting through the air. No people. Palette of butterfly yellow, tropical green, house pink and river blue.',
  flamenco:
    'An empty flamenco stage, a tablao, as a linocut in red, ochre and black: a wooden plank floor, a rush-seated chair with a Spanish guitar leaning on it, a fringed embroidered shawl, a mantón, thrown over its back, a pair of castanets on the floor, a single round pool of light from above, a dark background with a tiled wall. No people. Palette of carmine red, ochre, black and cream.',
  ritmos:
    'An empty dance hall in the Caribbean before the band arrives, as a screenprint with flat bold colours: a pair of painted maracas, a conga drum and a trumpet resting on a chair, a checkered dance floor, potted palms, strings of round light bulbs, an open window to the warm night. No people. Palette of hibiscus red, turquoise, banana yellow and black.',
  semanasanta:
    'A panel of Sevillian painted azulejo tiles, six tiles wide and four high with the grout lines visible, showing the Feria de Abril: strings of round paper lanterns over striped casetas, an empty horse carriage with a tall wheel, and the Giralda tower in the distance. Painted in cobalt blue, yellow ochre and a little green on white glaze, with the soft uneven brushwork of hand-painted tiles and a border of ornamental tiles. No crowds.',
  sanfermin:
    'A narrow street of old Pamplona at noon on the sixth of July, in the style of a 1930s Spanish poster with flat colours and simple forms: tall stone houses with wrought-iron balconies and flower boxes, a red neckerchief tied to the railing of one balcony, white bunting, a puff of rocket smoke in the strip of blue sky. The street empty. No bulls and no crowds. Palette of festival red, white, stone grey and sky blue.',
  tenorio:
    'A moonlit churchyard in Seville as a black and white woodcut with a single colour of candle gold: a marble statue of a knight standing on a tomb, a tall cypress, the white wall of a family pantheon with an iron gate, a single candle burning on the steps, a full moon behind thin clouds. Mysterious but calm, not gruesome. No people.',
  becquer:
    'A cold autumn night above Soria as a colour woodblock print in the manner of ukiyo-e night scenes: flat colours with soft gradations in the sky, fine key lines. A dark mountain with bare oaks, a ruined chapel and a bell tower on its side, the river Duero curving below with a stone bridge, mist on the water, a full moon, dry leaves blowing. No people. Palette of night blue, moon silver, ochre leaves and black.',
  llorona:
    'A wide river at night in Mexico as a woodcut printed in deep blue and black on pale paper, with the wood grain showing in the water. Tall reeds in the foreground, the moon reflected in broken lines, a few low houses with one lit window on the far side, and far along the bank, very small, a figure in a long white veil. Melancholy, not frightening.',
  dorado:
    'The round mountain lake of Guatavita in the Colombian highlands at dawn, as layered cut paper with one layer of gold foil: steep green slopes around dark still water, wisps of mist, and on the water a small raft of reeds carrying a figure glittering with gold dust, with four small attendants, golden objects sinking as offerings and rings spreading on the water. Palette of deep green, lake black, mist white and gold.',
  caso: 'A still life of a detective’s things on a small round café table by the harbour of a white Mediterranean village, drawn in ligne claire with even outlines and flat colours, like a panel of a classic detective comic. A brown fedora, a magnifying glass, a small closed notebook with a pencil, a cup of coffee, and a gold watch chain lying in a curl with no watch on it. Behind, a blue door, white walls, pink bougainvillea and the blue bay with a moored fishing boat. No people, no writing anywhere. Palette of door blue, brass gold, whitewash and bougainvillea pink.',
  refranes:
    'A Spanish aleluya sheet of the nineteenth century: six small woodcut pictures in a grid of two columns and three rows, each in its own ruled box, hand-coloured with a few washes of red, blue and yellow. The pictures illustrate Spanish proverbs: a hand holding one bird while many birds fly off; a sleeping shrimp carried away by a stream; a farmer up at sunrise with the sun smiling; a loaf of bread missing and some flat little cakes on a table instead; a blacksmith’s forge where the knife on the table is made of wood; drops of water falling on a stone that has a hollow worn in it. Leave the space under each picture plain, with no verses or captions.',
  falsos:
    'A playful still life about look-alikes as a linocut in teal, orange and black: two almost identical carnival masks side by side on a table, one smiling and one surprised, a cardboard folder tied with a ribbon lying on a patterned rug, a drinking glass beside a flower vase of the same shape, a door left ajar. Witty and calm. No people.',
  trabalenguas:
    'Three gloomy tigers sitting in a golden wheat field, chewing stalks of wheat with mournful faces, as a colour woodblock print in the manner of ukiyo-e: flat colours, fine key lines, the wind drawn as rhythmic waves through the wheat, a pale sky with one cloud. Gentle and funny, not fierce. Palette of tiger orange, wheat gold, sky blue and black.',
  sonidos:
    'A small seaside kitchen as layered cut paper with soft shadows between the layers: a big pot steaming on an old stove, a tiled wall with blue and white tiles, and through the open window a great curling wave of the sea, its curve echoing the pot’s steam. A little wooden penguin stands on the windowsill. No people. Palette of sea blue, pot red, tile white and sand.',
}

export interface MuseoPrompt {
  shape: Shape
  // To cut it to, twice the largest it is shown
  size: string
  ref?: string
  prompt: string
}

// Every picture by its name, for scripts/pictures.mjs
export const MUSEO_PICTURES: Record<string, MuseoPrompt> = Object.fromEntries(
  MUSEO.map((x) => {
    const ref = refOf(x.medium)
    const [w, h] = SHOWN[x.shape]
    return [
      `museo/${x.lesson}`,
      {
        shape: x.shape,
        size: `${w * 2}x${h * 2}`,
        ...(ref ? { ref } : {}),
        prompt: [
          SCENES[x.lesson],
          ref
            ? 'Follow the reference image for its style and technique only, not its subject.'
            : '',
          RULES,
          FORMAT[x.shape],
        ]
          .filter(Boolean)
          .join(' '),
      },
    ]
  }),
)
