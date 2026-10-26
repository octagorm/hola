// Hola's service worker. It shows the daily reminder pushed by Convex
// (convex/reminders.ts, convex/push.ts) and opens Dagens økt when it is
// tapped. It caches nothing and handles no requests: the page loads as it
// would without it.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let m = {}
  try {
    m = e.data ? e.data.json() : {}
  } catch {
    // shown with the words below
  }
  // Every push must show a notification (Safari ends a subscription whose
  // pushes show none)
  e.waitUntil(
    self.registration.showNotification(m.title || 'Hoy · Dagens økt', {
      body: m.body || 'Dagens økt venter.',
      icon: '/app/icon-192.png',
      tag: 'hoy',
      data: { url: m.url || '/#hoy' },
    }),
  )
})

// To Hola's page if it is open (reminders.tsx follows the message), else a
// new one
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL(e.notification.data?.url || '/#hoy', self.location)
  e.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      const page = open.find((c) => {
        const at = new URL(c.url)
        return at.origin === url.origin && at.pathname === '/'
      })
      if (page) {
        page.postMessage({ open: url.hash })
        await page.focus()
        return
      }
      await self.clients.openWindow(url.href)
    })(),
  )
})
