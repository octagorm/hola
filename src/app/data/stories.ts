import { CHAPTERS as QUIJOTE } from './quijote.ts'
import { CHAPTERS as VIAJE } from './viaje.ts'

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
  questions: Array<Question>
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
