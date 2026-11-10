import { Suspense, useEffect, useRef, useState } from 'react'
import { BankProvider, SIZES, useStore } from './lib/store'
import { GAME } from './data/games'
import { AccountProvider } from './lib/account'
import { CLOUD, WithAccounts } from './lib/cloud'
import { Reminders } from './reminders'
import './lib/install'
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

// (a hash that cannot be read, as /#%, is the home page)
const decoded = (s: string) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return ''
  }
}

const fromHash = (): Route => {
  const [id, arg] = decoded(window.location.hash.slice(1)).split('/')
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
              {CLOUD && <Reminders />}
              <InkDefs />
              <Router />
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
  // The pages around the games are drawn larger when asked for
  // (Innstillinger, Størrelse); a game is laid out to fit its screen
  const { settings } = useStore()
  const zoom = route.id && GAME[route.id] ? 1 : (SIZES[settings.size] ?? 1)
  useEffect(() => {
    document.documentElement.style.setProperty('zoom', String(zoom))
    document.documentElement.style.setProperty('--zoom', String(zoom))
  }, [zoom])
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
