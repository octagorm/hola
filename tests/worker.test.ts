import { afterEach, describe, expect, test, vi } from 'vitest'
import worker from '../worker'

// The Worker passes Google's sign-in on hola.ymse.land to Convex as it
// came, and serves everything else, previews' sign-ins included, from the
// built files

const assets = { fetch: vi.fn(() => Promise.resolve(new Response('asset'))) }
const CONVEX_SITE = 'https://example-1.convex.site'
const env = { ASSETS: assets, CONVEX_SITE }

afterEach(() => {
  vi.unstubAllGlobals()
  assets.fetch.mockClear()
})

describe('worker', () => {
  test('passes a sign-in on to Convex as it came', async () => {
    const convex = vi.fn((_request: Request, _init?: RequestInit) =>
      Promise.resolve(
        new Response(null, {
          status: 302,
          headers: { location: 'https://hola.ymse.land/?code=c' },
        }),
      ),
    )
    vi.stubGlobal('fetch', convex)

    const response = await worker.fetch(
      new Request(
        'https://hola.ymse.land/api/auth/callback/google?code=c&state=s',
        {
          method: 'POST',
          headers: { cookie: '__Host-googleOAuthpkce=v' },
          body: 'code=c',
        },
      ),
      env,
    )

    const [sent, init] = convex.mock.calls[0]
    expect(sent.url).toBe(
      'https://example-1.convex.site/api/auth/callback/google?code=c&state=s',
    )
    expect(sent.method).toBe('POST')
    expect(sent.headers.get('cookie')).toBe('__Host-googleOAuthpkce=v')
    expect(await sent.text()).toBe('code=c')
    expect(init).toMatchObject({ redirect: 'manual', cache: 'no-store' })
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://hola.ymse.land/?code=c',
    )
    expect(assets.fetch).not.toHaveBeenCalled()
  })

  test('serves pages, and sign-ins on other addresses, from the built files', async () => {
    const convex = vi.fn()
    vi.stubGlobal('fetch', convex)

    for (const url of [
      'https://hola.ymse.land/om',
      'https://hola.ymse.land/api/authx',
      'https://main-hola.gorm.workers.dev/api/auth/signin/google',
    ]) {
      expect(await (await worker.fetch(new Request(url), env)).text()).toBe(
        'asset',
      )
    }
    expect(assets.fetch).toHaveBeenCalledTimes(3)
    expect(convex).not.toHaveBeenCalled()
  })

  test('passes nothing on before the Convex site is set', async () => {
    const convex = vi.fn()
    vi.stubGlobal('fetch', convex)
    const response = await worker.fetch(
      new Request('https://hola.ymse.land/api/auth/signin/google'),
      { ASSETS: assets, CONVEX_SITE: '' },
    )
    expect(await response.text()).toBe('asset')
    expect(convex).not.toHaveBeenCalled()
  })
})
