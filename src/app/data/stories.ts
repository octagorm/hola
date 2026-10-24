import { CHAPTERS as QUIJOTE } from './quijote.ts'
import { CHAPTERS as LEYENDAS } from './leyendas.ts'
import { CHAPTERS as VIAJE } from './viaje.ts'
import { CHAPTERS as CASO } from './caso.ts'
import type { Face } from './casoLayout.ts'

// The stories, each read a chapter at a time in mixed text
// (games/story.tsx), with three questions after each chapter. Their lines
// are written in the markup described in data/quijote.ts. A chapter's id is
// its own across all the stories, since the bank keeps the chapters read
// by id (bank.read), and today's chapter takes the next one unread, story
// by story in this order.

export interface Question {
  q: string
  // The right answer first; they are shuffled when shown
  a: [string, string, string]
}

export interface Chapter {
  id: string
  title: string
  no: string
  // Where in the original it is from: «kapittel 1» of the novel
  from?: string
  // A picture above the chapter, from public/: '/stories/viaje/madrid.webp'
  img?: string
  lines: Array<string>
  // Who says each line, by their voice in data/voices.ts; a line with
  // none is the narrator's
  who?: Array<string | undefined>
  // The face the speaker makes once a line is said, where it calls for
  // one: a mystery's painted cast (data/caso.ts, games/caso.tsx)
  face?: Array<Face | undefined>
  questions: Array<Question>
  // What the chapter gives away, for the inspector's notebook on the
  // story's page once it is read (a mystery: data/caso.ts)
  clue?: string
  // Who did it, asked partway through the chapter
  accuse?: Accusation
}

// One of those who could have done it, and for a wrong guess, what rules
// them out and the chapter whose clue in the notebook says so
export interface Suspect {
  name: string
  // Who they are, in Norwegian
  no: string
  hint?: string
  from?: number
}

export interface Accusation {
  // Asked after this line, counted from 1; the lines after it explain
  after: number
  q: string
  // The one who did it, by name
  culprit: string
  // In the order they were met
  suspects: Array<Suspect>
}

export interface Story {
  // Its page: /#quijote, and a chapter /#quijote/molinos
  id: string
  es: string
  no: string
  // On its page, above the chapters
  intro: string
  // What a chapter's `from` is of: «fra romanens kapittel 1»
  of?: string
  // Heard before it is read: each line is said, and its text shown when
  // asked for, or once the chapter's questions are answered
  listen?: boolean
  chapters: Array<Chapter>
}

export const STORIES: Array<Story> = [
  {
    id: 'quijote',
    es: 'Don Quijote',
    no: 'Romanen, fortalt enkelt',
    intro:
      'Miguel de Cervantes ga ut første del av Don Quijote i 1605, om en adelsmann som leser seg gal på ridderbøker og drar ut for å bli ridder selv. Her er begynnelsen fortalt enkelt på spansk.',
    of: 'romanens',
    chapters: QUIJOTE,
  },
  {
    id: 'viaje',
    es: 'El viaje',
    no: 'Reisen',
    intro:
      'Solveig fra Bergen og Carmen fra Madrid har skrevet brev til hverandre i femti år, men aldri reist sammen. Nå tar de tog og buss fra Puerta del Sol i Madrid, gjennom Andalucía og langs Middelhavet, helt til den hvite fiskerlandsbyen Cadaqués: ett sted i hvert kapittel, med stedets ord.',
    chapters: VIAJE,
  },
  {
    id: 'leyendas',
    es: 'Leyendas',
    no: 'Sagnene',
    intro:
      'Gustavo Adolfo Bécquer (1836–1870) fra Sevilla er en av Spanias mest elskede poeter. Ved siden av diktene, Rimas, skrev han Leyendas: sagn med spøkelser og ulykkelig kjærlighet, som kom i aviser i Madrid rundt 1860, flere av dem fra Soria. Han døde bare 34 år gammel, og vennene hans samlet dem i bok året etter. Her er fire av sagnene fortalt enkelt på spansk.',
    chapters: LEYENDAS,
  },
  {
    id: 'caso',
    es: 'El caso del reloj perdido',
    no: 'Klokken som forsvant',
    intro:
      'Inspektør Garrido fra Madrid er på ferie i Cadaqués, den hvite fiskerlandsbyen helt nord på Costa Brava, der Salvador Dalí bodde i bukta Portlligat like ved. En mandag med tramontana, den sterke nordavinden, forsvinner et lommeur av gull fra et låst hus ved havnen. I hvert kapittel avhører inspektøren et vitne, og du hører hva de sier før du leser det. Det de røper, skriver han i notatboka si, og i siste kapittel skal du si hvem som tok klokken.',
    listen: true,
    chapters: CASO,
  },
]

export const STORY: Record<string, Story | undefined> = Object.fromEntries(
  STORIES.map((s) => [s.id, s]),
)

// A chapter by its id, with its story and its number in it, from 1
export const CHAPTER: Record<
  string,
  { story: Story; chapter: Chapter; n: number } | undefined
> = Object.fromEntries(
  STORIES.flatMap((story) =>
    story.chapters.map((chapter, i) => [
      chapter.id,
      { story, chapter, n: i + 1 },
    ]),
  ),
)

export const ALL_CHAPTERS: Array<Chapter> = STORIES.flatMap((s) => s.chapters)

// The chapter's subtitle: its Norwegian title, and where it is from
export const subtitle = (story: Story, c: Chapter) =>
  c.from ? `${c.no} · fra ${story.of ? `${story.of} ` : ''}${c.from}` : c.no
