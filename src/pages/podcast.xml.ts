import { statSync } from 'node:fs'
import { join } from 'node:path'
import { feed } from '../app/lib/podcast.ts'

// The audiobooks' podcast feed (lib/podcast.ts)
export function GET() {
  return new Response(
    feed((file) => statSync(join(process.cwd(), 'public', file)).size),
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  )
}
