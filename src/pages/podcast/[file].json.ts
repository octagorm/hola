import { EPISODES, chapters, stem } from '../../app/lib/podcast.ts'
import type { Audiobook } from '../../app/data/lydbok.ts'
import type { Made } from '../../app/lib/lydbok.ts'

// An audiobook's chapters, for the podcast apps (lib/podcast.ts)
export function getStaticPaths() {
  return EPISODES.map(({ book, made }) => ({
    params: { file: stem(made) },
    props: { book, made },
  }))
}

export function GET({ props }: { props: { book: Audiobook; made: Made } }) {
  return new Response(JSON.stringify(chapters(props.book, props.made)), {
    headers: { 'Content-Type': 'application/json+chapters' },
  })
}
