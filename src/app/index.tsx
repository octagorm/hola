import { Suspense, useEffect, useRef, useState } from 'react'
import { BankProvider, useStore } from './lib/store'
import { AccountProvider } from './lib/account'
import { WithAccounts } from './lib/cloud'
import { startMusic, stopMusic } from './lib/music'
import { InkDefs, PeekProvider } from './ui'
import { Mend } from './mend'
import Home from './home'
import { PAGES } from './registry'
import './hola.css'

// Hola: Spanish for Norwegians, around one word bank. The page is kept in
// the URL's hash (/#palabra, /#quijote/molinos); no hash is the home page
// (home.tsx). Every page reads and writes the same bank (lib/bank.ts,
// lib/store.tsx), so a word practised in one is known in all; signed in,
// the bank follows the account (lib/account.tsx). The pages are listed in
// registry.tsx.

interface Route {
  id: string | null
  arg?: string
}

const fromHash = (): Route => {
  const [id, arg] = decodeURIComponent(window.location.hash.slice(1)).split('/')
  const found = PAGES.find((p) => p.id === id)
  return found ? { id: found.id, arg: arg || undefined } : { id: null }
}

export default function Hola() {
  // Whatever breaks, the page says so rather than going blank (mend.tsx)
  return (
    <Mend>
      <WithAccounts>
        <BankProvider>
          <AccountProvider>
            <PeekProvider>
              <InkDefs />
              <Router />
              <MusicKeeper />
            </PeekProvider>
          </AccountProvider>
        </BankProvider>
      </WithAccounts>
    </Mend>
  )
}

function Router() {
  const [route, setRoute] = useState<Route>(fromHash)
  const shown = useRef(route)
  // Where the home page was scrolled to, to come back to it there
  const homeScroll = useRef(0)
  useEffect(() => {
    const change = () => {
      const next = fromHash()
      const prev = shown.current
      if (prev.id === next.id && prev.arg === next.arg) return
      if (!prev.id) homeScroll.current = window.scrollY
      shown.current = next
      setRoute(next)
      requestAnimationFrame(() =>
        window.scrollTo(0, next.id ? 0 : homeScroll.current),
      )
    }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  const found = PAGES.find((p) => p.id === route.id)
  return (
    <div className="q-page">
      {found ? (
        <Suspense fallback={<div className="q-loading">…</div>}>
          <Mend key={`${found.id}/${route.arg ?? ''}`}>
            <found.Page id={found.id} arg={route.arg} />
          </Mend>
        </Suspense>
      ) : (
        <Home />
      )}
    </div>
  )
}

// The music, if it was left on, starts again at the first touch, since a
// browser lets a page play nothing before that
function MusicKeeper() {
  const { settings } = useStore()
  useEffect(() => {
    if (!settings.music) {
      stopMusic()
      return
    }
    const start = () => startMusic()
    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [settings.music])
  return null
}
