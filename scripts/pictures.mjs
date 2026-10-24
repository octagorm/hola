// Hola's painted pictures: each made with the image tool of the Codex CLI
// (scripts/image.mjs, on the ChatGPT plan) from a plain description, with
// the travel poster in design/sketches/reiseplakat.jpg as a reference for
// the style (El Ictíneo's plates keep the game's engraving). The full-size
// paintings are kept in .cache/pictures/ (megabytes each; delete one there
// to paint it again), and --web cuts each to the
// shape it is shown in, saves it as public/<name>.webp and lists the names
// made in src/app/data/pictures.ts, so the page shows a picture only once
// it is there, and its drawing until then.
//
//   node scripts/pictures.mjs [names or prefixes…]   paint those missing
//                                                    (without any, all)
//   node scripts/pictures.mjs --list                 what is painted, and not
//   node scripts/pictures.mjs --web                  make the .webp files
//
// A name is the picture's path under public/ without its ending:
// stories/viaje/viaje-madrid is the first chapter of El viaje. Each painting
// takes a minute or two and counts against the ChatGPT plan's limits; three
// are made at once.
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  MUSEO_PICTURES,
  POSTER,
  POSTER_REF,
} from '../src/app/data/museo-prompts.ts'

const FULL = '.cache/pictures'
const WEB = 'public'
const LIST = 'src/app/data/pictures.ts'

// A chapter's picture is a strip above its text: up to 820 CSS pixels wide
// and about 300 high, so twice that for sharp screens, and a little taller
// so that a phone, which cuts it narrower, keeps the middle
const STRIP = '1640x720'
const WIDE =
  'A wide panoramic picture: it will be cut to a strip a little more than twice as wide as it is tall, so keep everything that matters in the middle band, with only sky above and ground below.'
const NONE =
  'No lettering, signs, logos or text anywhere in the picture, no frame and no border.'

// The look of each story: every painting is a travel poster (POSTER, after
// design/sketches/reiseplakat.jpg), with a few words of its own for each
const LOOK = {
  viaje: {
    ref: POSTER_REF,
    style: POSTER,
  },
  leyendas: {
    ref: POSTER_REF,
    style: `${POSTER} These are romantic, eerie legends, mostly at dusk or by moonlight: deep slate blue, dusky violet and sand, with one warm light where there is one. Never gory: no blood and no wounds shown.`,
  },
  caso: {
    ref: POSTER_REF,
    style: `${POSTER} Cadaqués in Catalonia: white houses with blue doors, terracotta roofs, pink bougainvillea and a deep blue sea. Friendly and calm. No speech balloons.`,
  },
}

// Who comes back in the mystery's pictures, the same each time
const GARRIDO =
  'Inspector Garrido, a man of about fifty in a tan trench coat and a brown fedora, with a magnifying glass or a small notebook'
const NARCIS =
  'old Narcís, a retired fisherman of eighty with white hair, a grey flat cap and a navy jersey'
const LAIA =
  'Laia, a young woman in her twenties in a blue headscarf and a striped top'
const CAT = 'a fat ginger-and-white cat with long white whiskers'

// What each chapter's picture shows
const CHAPTERS = {
  viaje: {
    'viaje-madrid':
      'The Puerta del Sol in Madrid on a sunny morning: the old Casa de Correos with its clock tower, the Kilómetro Cero plaque set in the paving stones, a tall grey-haired Norwegian woman in her sixties pulling a big suitcase and holding a long closed black umbrella, plainly seen, in her other hand, greeting a small dark-haired Spanish woman of the same age, and at the edge a café table with a cup of thick hot chocolate and churros.',
    'viaje-cordoba':
      'Inside the Mezquita of Córdoba: rows of red-and-white striped double arches on slender columns going back like a forest of stone, one shaft of sunlight across the floor, and through a far arch a glimpse of orange trees in the courtyard.',
    'viaje-sevilla':
      'Triana in Seville at night: the iron Triana bridge over the Guadalquivir, its lights reflected in the dark water, and in front the silhouettes of a guitarist on a chair and a flamenco dancer in a flounced dress with a red fan.',
    'viaje-granada':
      'The Alhambra glowing red at sunset, seen from the Mirador de San Nicolás, with the white houses of the Albaicín below it and the snowy Sierra Nevada behind; in the foreground, on a bar counter, two small glasses of beer and a little plate of tapa.',
    'viaje-murcia':
      'A fruit stall in the huerta of Murcia: crates of apricots, peaches and lemons, lemon trees and green fields behind and dry mountains far off, and in front a plate of paparajotes, lemon leaves fried in batter, one green leaf showing at the end of each.',
    'viaje-alicante':
      'Alicante on the night of San Juan: the Explanada promenade with its palm trees and its wavy mosaic paving in red, black and cream, the castle of Santa Bárbara on its rocky mountain above, a palm-shaped firework bursting over it, and far off a big colourful papier-mâché figure burning in a bonfire.',
    'viaje-valencia':
      'A wide paella pan cooking over an orange-wood fire in the Valencian huerta on a Sunday, a white farmhouse with a steep thatched roof and orange trees behind, wooden spoons ready on a table under a vine.',
    'viaje-barcelona':
      "Inside Gaudí's Sagrada Família in Barcelona: tall pale columns branching like trees up to the vaulted ceiling, and light through the stained glass falling in green and blue patches on one side and red and orange on the other.",
    'viaje-cadaques':
      'Cadaqués on the Costa Brava: white houses climbing to the church on the hill, blue-and-white fishing boats drawn up on a pebble beach, rocks in the clear sea, and a black umbrella blown away by the wind, flying out over the bay.',
    'viaje-creus':
      'Cap de Creus at dawn: wind-carved rocks, the white lighthouse on the headland, the sun rising red and gold out of the sea, and two small women seen from behind, holding hands on the rocks.',
  },
  leyendas: {
    'leyendas-monte':
      'Two riders, a young nobleman and a young noblewoman in medieval dress, riding home at dusk along the river Duero near Soria, below a ruined Templar church on a bare hill, a few hounds trotting after them.',
    'leyendas-banda':
      'A great hall of an old Castilian palace at night: a young man and a young woman in medieval dress by a large stone fireplace, he offering her a small jewel, and through a tall window the dark hill under the moon.',
    'leyendas-difuntos':
      'A medieval bedroom by moonlight on the night of All Souls: a young woman sitting up in a canopied bed, frightened, the door ajar onto darkness, and on the floor by the bed a torn blue silk band.',
    'leyendas-ciervo':
      'A medieval hunt in the hills of Soria: a deer fleeing into a wood of tall poplars towards a hidden spring, a young nobleman on horseback behind it, and an old huntsman raising his hand to warn him.',
    'leyendas-ojos':
      'A spring among the rocks in a poplar wood: a pale woman with long golden hair sitting on the stones at the edge of the water, her green eyes looking out, silver rings spreading on the dark water.',
    'leyendas-manrique':
      'A young nobleman, alone, in the ruined Romanesque cloister of an old monastery under a full moon, and far off among the trees beyond the arches something white, half seen.',
    'leyendas-rayo':
      'A single moonbeam falling through the branches of the poplars by a river at night, lighting a pale patch on the ground, and a young nobleman standing still before it.',
    'leyendas-nochebuena':
      "Christmas Eve outside the convent church of Santa Inés in Seville, at night, a few lanterns: two men carrying an old blind organist in a chair to the church's door.",
    'leyendas-misa':
      'The organ loft of a convent church by candlelight on Christmas Eve: an old blind organist at the keys of a great organ with tall pipes, his daughter standing in the shadows behind him.',
    'leyendas-organo':
      'A dark convent church at night: a young novice nun stepping back in awe from an old organ that plays by itself, and at its keys a faint pale figure.',
  },
  caso: {
    'caso-puerto': `The harbour of Cadaqués on a windy morning with whitecaps on the sea: ${NARCIS} at his blue door with his arms spread in dismay, ${GARRIDO} looking closely at an empty table by a closed window, and the white church of Santa Maria on the hill behind.`,
    'caso-chiringuito': `An empty beach bar on a pebble beach in the wind: Montse, a woman in her forties in an apron, behind the counter, pointing up towards the church on the hill, and ${GARRIDO} with a cup of coffee and his notebook.`,
    'caso-iglesia': `The steps of the white church above the town: Remei, a lively woman in her seventies with a grey bun and a cardigan, talking eagerly to ${GARRIDO}; beside her ${CAT}, asleep in the sun with one eye open; the bay far below.`,
    'caso-mercado': `A fish stall at a Monday market by the sea, under a striped awning: Quim, an old fisherman with a beret and a big grey moustache, laughing behind crates of fish on ice, ${GARRIDO} at the stall, and fishing boats tied up in the wind behind.`,
    'caso-hotel': `A hotel terrace high over the bay: Puig, a refined man with silver hair in a linen suit, at a table full of breakfast plates, a waiter in a white jacket, ${GARRIDO} standing with his notebook, and far below on the harbour road a tiny young woman in a blue headscarf hurrying up from the harbour.`,
    'caso-relojeria': `A small, dim watchmaker's shop whose walls are covered in ordinary round clocks: Jordi, a shy young watchmaker with a loupe on his forehead and an apron, blushing at his workbench, a small framed photograph on the wall, and ${GARRIDO} at the counter.`,
    'caso-portlligat': `The rocky path above the little bay of Portlligat, with fishing boats in the bay and a few whitewashed houses: ${LAIA} walking away with ${CAT} at her heels, and ${GARRIDO} behind her, looking out at the empty sea.`,
    'caso-playa': `Late afternoon at the beach bar after the wind has dropped, the sea calm and golden: ${NARCIS} holding a gold pocket watch to his ear and smiling, ${LAIA} beside him, ${GARRIDO} closing his notebook, and ${CAT} asleep on a chair.`,
  },
}

// Every picture by its name: the shape it is painted in (landscape,
// portrait or square), the size it is cut to, the sketch whose style it
// follows if any, and its description
const PICTURES = Object.fromEntries(
  Object.entries(CHAPTERS).flatMap(([story, chapters]) =>
    Object.entries(chapters).map(([id, subject]) => [
      `stories/${story}/${id}`,
      {
        shape: 'landscape',
        size: STRIP,
        ref: LOOK[story].ref,
        prompt: `${subject} ${LOOK[story].style} ${WIDE} ${NONE}`,
      },
    ]),
  ),
)

// Tu museo's pictures, a print for each theme (data/museo-prompts.ts)
Object.assign(PICTURES, MUSEO_PICTURES)
// El Ictíneo (games/ictineo.tsx): each voyage's harbour, for the plate
// before setting out and at the end (up to about 610 × 340 CSS pixels), and
// the boat in cutaway beside the captain's introduction (about 270 × 180),
// twice that or more for sharp screens. The boat is the one the game draws.
const ENGRAVED =
  'fine sepia-black engraved lines and cross-hatching on warm cream paper, washed by hand in muted sea green, pale sky blue, wood brown, copper and brass. Not photographic, not 3D, never glossy. No crowds: at most a few small figures.'
const BOAT =
  "The submarine is the Ictíneo, Narciso Monturiol's wooden submarine of 1859, facing right: a plump fish-shaped hull about seven metres long, of pale wooden staves bound with copper bands, with a small round brass turret with round portholes on top and a propeller at its tail on the left."
const SPLIT =
  'A view cut at the waterline: the top third above the water and the rest under it, down to the seabed. It will be cut a little less than twice as wide as it is tall, so keep the boat in the middle.'
// The voyages go without the sketch as a reference: it shows the boat cut
// open, with a monument on the quay from 1888, and plates given it copied
// both
const VOYAGE = (subject) => ({
  shape: 'landscape',
  size: '1440x800',
  prompt: `${subject} ${BOAT} The hull is seen whole from outside and closed: it is not cut open, and nobody inside it can be seen. A hand-coloured wood engraving from an illustrated magazine of the 1860s: ${ENGRAVED} ${SPLIT} ${NONE}`,
})
Object.assign(PICTURES, {
  'ictineo/barcelona': VOYAGE(
    `The port of Barcelona on a calm, bright morning in September 1859: the submarine floating at the surface in front, a sailor in a cap at its open hatch; behind it the stone breakwater with a small lighthouse, a few tall sailing ships at anchor, the old town's roofs and church towers, and the hill of Montjuïc with its castle. No monument column on the quay. Under the water a few fish over sand and weed.`,
  ),
  'ictineo/creus': VOYAGE(
    `Cap de Creus on the Costa Brava on a clear, windy morning: wind-carved grey rocks falling into a deep blue-green sea, the white lighthouse on the headland, a small fishing boat with a lateen sail, and the submarine at the surface near the rocks. Under the water the rocks are covered with branches of red coral, and small fish swim among them.`,
  ),
  'ictineo/alicante': VOYAGE(
    `The port of Alicante on a grey, blustery day in May 1861: rough grey-green waves with white crests, the castle of Santa Bárbara on the rocky top of Mount Benacantil above the town, the harbour mole and a few sailing ships rolling at anchor, and the submarine riding the waves at the surface with its hatch shut. Under the water the sea is cloudy with stirred-up sand.`,
  ),
  'ictineo/noche': VOYAGE(
    `Barcelona harbour on a calm night: a full moon over the hill of Montjuïc, the dark masts of sailing ships against the sky, a few lit windows on the quay, and under the water the submarine, a lamp shining from its bow, its beam of warm yellow light falling on a shoal of silver fish in the dark green water. No monument column on the quay.`,
  ),
  'ictineo/cutaway': {
    shape: 'landscape',
    size: '900x600',
    ref: 'design/sketches/ictineo.jpg',
    prompt: `The submarine under water, its side cut away to show the crew inside at their stations: two men in caps and dark jackets turning the great crank of the propeller, one at the steering wheel, and the captain, a bearded man in a dark coat, looking out through a round brass porthole; pipes, brass air bottles and a lamp inside. Green water around it, a few fish, and rocks and weed on the seabed below. ${BOAT} A hand-coloured wood engraving from an illustrated magazine of the 1860s, in the style of the reference image, for its style only and not its subject: ${ENGRAVED} Keep the whole boat in the middle of the picture. ${NONE}`,
  },
})

const full = (name) => `${FULL}/${name}.png`

function paint(name) {
  const p = PICTURES[name]
  mkdirSync(dirname(full(name)), { recursive: true })
  return new Promise((resolve) => {
    const child = spawn(
      'node',
      [
        'scripts/image.mjs',
        '--out',
        full(name),
        '--shape',
        p.shape,
        ...(p.ref ? ['--ref', p.ref] : []),
        p.prompt,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    )
    let err = ''
    child.stderr.on('data', (d) => (err += d))
    child.on('close', (code) => {
      console.log(
        code === 0 ? `painted ${name}` : `failed ${name}: ${err.trim()}`,
      )
      resolve()
    })
  })
}

// Cut from the middle to the shape it is shown in
function forWeb(name) {
  const out = `${WEB}/${name}.webp`
  mkdirSync(dirname(out), { recursive: true })
  execFileSync('magick', [
    full(name),
    '-resize',
    `${PICTURES[name].size}^`,
    '-gravity',
    'center',
    '-extent',
    PICTURES[name].size,
    '-quality',
    '80',
    '-strip',
    out,
  ])
  console.log(out)
}

const painted = () => Object.keys(PICTURES).filter((n) => existsSync(full(n)))

if (process.argv.includes('--list')) {
  for (const n of Object.keys(PICTURES))
    console.log(`${existsSync(full(n)) ? 'painted' : 'missing'}  ${n}`)
} else if (process.argv.includes('--web')) {
  const made = painted()
  for (const n of made) forWeb(n)
  writeFileSync(
    LIST,
    `// The pictures painted so far (scripts/pictures.mjs --web writes this
// file), each in public/ as <name>.webp; a page shows its drawing for one
// not yet made
export const PICTURES: ReadonlySet<string> = new Set(${JSON.stringify(made, null, 2)})
`,
  )
  execFileSync('npx', ['prettier', '--write', LIST], { stdio: 'ignore' })
  console.log(`${made.length} pictures listed in ${LIST}`)
} else {
  const asked = process.argv.slice(2)
  const names = Object.keys(PICTURES)
  for (const a of asked)
    if (!names.some((n) => n.startsWith(a)))
      throw new Error(`No such picture: ${a}`)
  const queue = names.filter(
    (n) =>
      (!asked.length || asked.some((a) => n.startsWith(a))) &&
      !existsSync(full(n)),
  )
  console.log(`${queue.length} to paint`)
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (queue.length) await paint(queue.shift())
    }),
  )
}
