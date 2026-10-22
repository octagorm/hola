// The Worker in front of the built site. Google's sign-in goes through
// hola.ymse.land/api/auth/* on its way to Convex, so that Google's page
// names the site rather than the deployment's .convex.site address;
// Convex's CUSTOM_AUTH_SITE_URL sends it here. Cloudflare serves everything
// else from dist/ without running this (run_worker_first in wrangler.jsonc).

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  // Production's Convex site, https://<deployment>.convex.site (wrangler.jsonc)
  CONVEX_SITE?: string
}

const HOST = 'hola.ymse.land'

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    // Previews and workers.dev send no sign-ins to production
    const signIn =
      !!env.CONVEX_SITE &&
      url.hostname === HOST &&
      url.pathname.startsWith('/api/auth/')
    if (!signIn) return env.ASSETS.fetch(request)
    // Method, headers with the cookies, body and query go on as they came,
    // and Convex's redirects and cookies come back to the browser unchanged
    const passed = new Request(
      env.CONVEX_SITE + url.pathname + url.search,
      request,
    )
    return fetch(passed, { redirect: 'manual', cache: 'no-store' })
  },
}
