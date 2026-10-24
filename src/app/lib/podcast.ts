import { AUDIOBOOKS } from '../data/lydbok.ts'
import { MADE } from './lydbok.ts'
import type { Audiobook } from '../data/lydbok.ts'
import type { Made } from './lydbok.ts'

// The audiobooks as a podcast, for an app to follow: the feed
// (/podcast.xml) and each book's chapters (/podcast/<file>.json), written
// at build time by src/pages/, so a book pushed is a new episode. Like
// Tian's, the feed asks not to be listed in the directories.

export const SITE = 'https://hola.ymse.land'
export const FEED = `${SITE}/podcast.xml`

const SHOW = 'Hola: lydbøker'
const ABOUT =
  'Marta, fra Madrid, og Ingrid, som lærer spansk, følger en fortelling på enkel spansk fra Spania. De gir de nye ordene før hver scene og plukker ut setningene du kan bruke selv. Fra Hola, spansk ti minutter om dagen, på hola.ymse.land.'

// The books read in, newest first
export const EPISODES: Array<{ book: Audiobook; made: Made }> =
  AUDIOBOOKS.flatMap((book) => {
    const made = MADE[book.id]
    return made ? [{ book, made }] : []
  }).sort((a, b) => b.book.date.localeCompare(a.book.date))

// A book's file without its folder and ending: 'altea-ab3a6294a8', new
// with each version, so an app takes a book read in again as new
export const stem = (made: Made) =>
  made.file.replace(/^.*\//, '').replace(/\.mp3$/, '')

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// A book's chapters, in the Podcasting 2.0 format apps such as Pocket Casts
// show
export function chapters(book: Audiobook, made: Made) {
  return {
    version: '1.2.0',
    chapters: made.marks
      .filter(([, part]) => part === -1)
      .map(([c, , t]) => ({ startTime: t, title: book.chapters[c].title })),
  }
}

// The feed, given each file's size in bytes
export function feed(bytes: (file: string) => number): string {
  const items = EPISODES.map(
    ({ book, made }, i) => `    <item>
      <title>${esc(book.es)}</title>
      <description>${esc(`${book.no}. ${book.about}`)}</description>
      <guid isPermaLink="false">${stem(made)}</guid>
      <pubDate>${new Date(`${book.date}T07:00:00Z`).toUTCString()}</pubDate>
      <link>${SITE}/#lydbok/${book.id}</link>
      <enclosure url="${SITE}/${made.file}" length="${bytes(made.file)}" type="audio/mpeg"/>
      <itunes:duration>${Math.round(made.seconds)}</itunes:duration>
      <itunes:episode>${EPISODES.length - i}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <podcast:chapters url="${SITE}/podcast/${stem(made)}.json" type="application/json+chapters"/>
    </item>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${esc(SHOW)}</title>
    <description>${esc(ABOUT)}</description>
    <language>no</language>
    <link>${SITE}/#lydbok</link>
    <itunes:author>Hola</itunes:author>
    <itunes:image href="${SITE}/podcast/cover.jpg"/>
    <itunes:category text="Education">
      <itunes:category text="Language Learning"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:block>Yes</itunes:block>
    <podcast:block>yes</podcast:block>
${items.join('\n')}
  </channel>
</rss>
`
}

// Links that open a podcast app ready to follow the feed
export const APPS = (() => {
  const bare = FEED.replace(/^https?:\/\//, '')
  return [
    { app: 'Pocket Casts', href: `pktc://subscribe/${bare}` },
    { app: 'Apple Podcasts', href: `podcast://${bare}` },
    {
      app: 'Overcast',
      href: `overcast://x-callback-url/add?url=${encodeURIComponent(FEED)}`,
    },
  ]
})()
