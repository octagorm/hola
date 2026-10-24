// The built site from dist/, answered as Cloudflare answers it: /om is
// om.html, a missing page is 404.html. For the browser tests (smoke.mjs)
// and screenshots (shot.mjs), which have the browser ask for it at
// http://hola.test/ and answer from here, without a server: in a sandbox
// whose proxy will not pass the browser's requests to localhost, that
// still works.
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

export const ORIGIN = 'http://hola.test'

const ROOT = new URL('../dist/', import.meta.url).pathname

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.xml': 'application/rss+xml; charset=utf-8',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

// The file for a path, and whether it was found
export async function lookup(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.[/\\])+/,
    '',
  )
  const base = join(ROOT, clean)
  for (const p of [
    base,
    `${base.replace(/\/$/, '')}.html`,
    join(base, 'index.html'),
  ])
    if (await isFile(p)) return { path: p, found: true }
  return { path: join(ROOT, '404.html'), found: false }
}

// Convex, for a page built with accounts (.env.production): its socket is
// answered here and left silent, as if the backend had not replied yet, and
// its other requests are dropped, so the tests and screenshots never reach
// production and nobody is signed in
export async function quietConvex(context) {
  await context.routeWebSocket(/\.convex\.cloud\//, () => {})
  await context.route(/\.convex\.(cloud|site)\//, (route) => route.abort())
}

// Answers the browser's requests for the site from dist/, a part of a file
// when asked for one, as the audiobook's player does to jump
export async function routeDist(context) {
  await context.route(`${ORIGIN}/**`, async (route) => {
    const { path, found } = await lookup(
      new URL(route.request().url()).pathname,
    )
    const body = await readFile(path)
    const contentType = TYPES[extname(path)] ?? 'application/octet-stream'
    const range = /^bytes=(\d*)-(\d*)$/.exec(
      (await route.request().headerValue('range')) ?? '',
    )
    if (found && range) {
      const start = Number(range[1] || 0)
      const end = Math.min(Number(range[2] || body.length - 1), body.length - 1)
      await route.fulfill({
        status: 206,
        contentType,
        headers: {
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${body.length}`,
        },
        body: body.subarray(start, end + 1),
      })
      return
    }
    await route.fulfill({
      status: found ? 200 : 404,
      contentType,
      headers: found ? { 'Accept-Ranges': 'bytes' } : {},
      body,
    })
  })
}
