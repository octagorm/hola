import { useEffect, useState } from 'react'

// Installing Hola as an app, for Innstillinger's Instalar (#ajustes/instalar,
// a link that can be sent): which device this is, and Chrome's own install
// dialog. Chrome offers it once, early, in `beforeinstallprompt`, so the
// event is caught as the page loads (index.tsx imports this) and kept.

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let offer: InstallEvent | null = null
let done = false
const listeners = new Set<() => void>()
const tell = () => listeners.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    offer = e as InstallEvent
    tell()
  })
  window.addEventListener('appinstalled', () => {
    offer = null
    done = true
    tell()
  })
}

// Where the page is: already an app, an iPhone or iPad in Safari or in
// another browser (which cannot add to the home screen on older iOS), an
// Android phone, or a computer
export type Device =
  'installed' | 'ios-safari' | 'ios-other' | 'android' | 'desktop'

export function device(): Device {
  const nav = navigator as Navigator & { standalone?: boolean }
  if (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
    return 'installed'
  const ua = nav.userAgent
  const ios =
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && nav.maxTouchPoints > 1)
  if (ios)
    return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? 'ios-other' : 'ios-safari'
  return /Android/.test(ua) ? 'android' : 'desktop'
}

// Chrome's dialog, when it is offered here, and whether Hola was just installed
export function useInstall() {
  const [, rerender] = useState(0)
  useEffect(() => {
    const f = () => rerender((n) => n + 1)
    listeners.add(f)
    return () => {
      listeners.delete(f)
    }
  }, [])
  const install = offer
    ? async () => {
        const e = offer
        if (!e) return
        await e.prompt()
        const { outcome } = await e.userChoice
        offer = null
        if (outcome === 'accepted') done = true
        tell()
      }
    : null
  return { install, done }
}
