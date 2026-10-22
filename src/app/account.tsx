import { useEffect, useRef, useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { Cloud, LogIn, LogOut, Users } from 'lucide-react'
import { useAccount } from './lib/account'
import type { Me } from './lib/account'

// Signing in with Google, at the top of the home page and in Settings: the
// word bank then follows the account (lib/account.tsx). Shown only where
// there are accounts (lib/cloud.tsx).

// A sign-in under way, and the page it began on. Safari lost the cookies
// Convex set as a sign-in began whenever Google showed a page in between
// (see convex/auth.ts), and the sign-in landed signed out; a second try,
// Google remembering, went through. Should a landing still fail in the
// installed app, the page marks it failed before the app starts
// (src/pages/index.astro), and the app tries once more by itself.
const PENDING = 'hola:signin'

interface Pending {
  at: number
  tries: number
  back?: string
  failed?: boolean
}

const pending = (): Pending | null => {
  try {
    const p = JSON.parse(
      localStorage.getItem(PENDING) ?? 'null',
    ) as Pending | null
    return p && Date.now() - p.at < 5 * 60_000 ? p : null
  } catch {
    return null
  }
}

const installed = () =>
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const initial = (me: Me) => (me.name ?? me.email).charAt(0).toUpperCase()

// Sign in and out, and what went wrong
function useSignIn() {
  const { me, loading } = useAccount()
  const { signIn, signOut } = useAuthActions()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const act = async (f: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await f()
    } catch {
      setError('Det gikk ikke. Prøv igjen.')
    } finally {
      setBusy(false)
    }
  }

  // Google comes back to the home page, and the page the sign-in began on
  // is opened again
  const google = (tries: number, back = location.hash) => {
    try {
      localStorage.setItem(
        PENDING,
        JSON.stringify({ at: Date.now(), tries, back }),
      )
    } catch {
      // without storage there is no second try
    }
    void act(() => signIn('google', { redirectTo: '/' }))
  }

  useEffect(() => {
    if (!me) return
    const p = pending()
    try {
      localStorage.removeItem(PENDING)
    } catch {
      // nothing to clear
    }
    if (p?.back && !location.hash) location.hash = p.back
  }, [me])

  // Sent back by the home page after a sign-in that failed: once more
  useEffect(() => {
    if (loading || me || !installed()) return
    const again = () => {
      const p = pending()
      if (document.hidden || !p?.failed || p.tries > 0) return
      if (new URLSearchParams(location.search).has('code')) return
      google(p.tries + 1, p.back)
    }
    again()
    document.addEventListener('visibilitychange', again)
    return () => document.removeEventListener('visibilitychange', again)
  }, [loading, me])

  return {
    busy,
    error,
    signIn: () => google(0),
    signOut: () => void act(() => signOut()),
  }
}

// What the account says, signed in or not: in the popover on the home
// page and in Settings
function AccountBody() {
  const { me, synced } = useAccount()
  const { busy, error, signIn, signOut } = useSignIn()
  if (!me)
    return (
      <>
        <p>
          Med en Google-konto ligger ordbanken din også på kontoen, og følger
          deg til alle enheter der du logger inn.
        </p>
        <div className="acts">
          <button
            type="button"
            className="q-btn small"
            disabled={busy}
            onClick={signIn}
          >
            <LogIn /> Logg inn med Google
          </button>
          <a className="q-link" href="/personvern">
            Personvern
          </a>
        </div>
        {error && <p className="q-note bad">{error}</p>}
      </>
    )
  return (
    <>
      <div className="who">
        <span className="q-initial" aria-hidden="true">
          {initial(me)}
        </span>
        <span>
          <b>{me.name ?? me.email}</b>
          {me.name && <small>{me.email}</small>}
        </span>
      </div>
      <p className="synced">
        <Cloud aria-hidden="true" />
        {synced
          ? 'Ordbanken din ligger på kontoen og følger deg til alle enheter der du logger inn.'
          : 'Henter ordbanken din …'}
      </p>
      {error && <p className="q-note bad">{error}</p>}
      <div className="acts">
        <button
          type="button"
          className="q-btn ghost small"
          disabled={busy}
          onClick={signOut}
        >
          <LogOut /> Logg ut
        </button>
        {me.admin && (
          <a className="q-link" href="/admin">
            <Users aria-hidden="true" /> Brukere
          </a>
        )}
      </div>
    </>
  )
}

// The round button at the top of the home page, and its popover
export function AccountButton() {
  const { on, me, loading } = useAccount()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  // Closed by a click elsewhere or Escape
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  if (!on) return null
  return (
    <div className="q-account" ref={box}>
      <button
        type="button"
        className={`q-round ${me ? 'dark' : ''}`}
        aria-label={me ? `Konto: ${me.name ?? me.email}` : 'Logg inn'}
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={loading}
        onClick={() => setOpen((o) => !o)}
      >
        {me ? <b className="q-display">{initial(me)}</b> : <LogIn />}
      </button>
      {open && (
        <div
          className="q-frame q-account-pop"
          role="dialog"
          aria-label={me ? 'Konto' : 'Logg inn'}
        >
          <h2>
            Cuenta<span>Konto</span>
          </h2>
          <AccountBody />
        </div>
      )}
    </div>
  )
}

// The account in Settings
export function AccountSettings() {
  const { on, loading } = useAccount()
  if (!on) return null
  return (
    <div className="q-account-body">
      {loading ? <p className="q-muted">…</p> : <AccountBody />}
    </div>
  )
}
