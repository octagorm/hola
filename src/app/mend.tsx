import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

// What the page shows when something in it breaks, instead of nothing.
//
// The usual cause is a new version: the page stays open for days, and a
// page's code is loaded when it is first opened (registry.tsx), from a
// file named by its hash. After a deploy that file is gone, and the import
// fails. Then the page reloads itself, once, to get the new version.

const KEY = 'hola:reloaded'

// A failed import, as each browser words it (Chrome, Safari, Firefox), or a
// file that came back as the 404 page
const STALE =
  /dynamically imported module|Importing a module script failed|module script|MIME type|ChunkLoadError|Loading chunk/i

export const isStale = (e: unknown) =>
  e instanceof Error && STALE.test(`${e.name} ${e.message}`)

// Reloads unless the page has just done so, so a file that is really
// missing cannot loop. True if it is reloading.
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    // no storage: no way to know it has tried, so it does not
    return false
  }
  window.location.reload()
  return true
}

// Vite's own warning that a file it preloads did not come
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (e) => {
    if (reloadOnce()) e.preventDefault()
  })
}

type Props = {
  children: ReactNode
}

export class Mend extends Component<Props, { error: unknown }> {
  state: { error: unknown } = { error: null }

  static getDerivedStateFromError(error: unknown) {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isStale(error) && reloadOnce()) return
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const reload = () => {
      try {
        sessionStorage.removeItem(KEY)
      } catch {
        // reloads all the same
      }
      window.location.reload()
    }
    return <Broken reload={reload} />
  }
}

export function Broken({ reload }: { reload: () => void }) {
  return (
    <div className="q-broken">
      <div className="q-display text-[64px] leading-none text-[var(--red)]">
        ¡Ay!
      </div>
      <p className="q-muted">
        Noe gikk galt. Å laste siden på nytt hjelper som regel.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="q-btn" onClick={reload}>
          Last inn på nytt
        </button>
        {window.location.hash && (
          <button
            type="button"
            className="q-btn ghost"
            onClick={() => {
              window.location.href = '/'
            }}
          >
            Til forsiden
          </button>
        )}
      </div>
    </div>
  )
}
