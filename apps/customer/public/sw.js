self.addEventListener('push', function (event) {
  if (event.data) {
    const payload = event.data.json() || {}
    const title = payload.title || 'Anex Salon'
    const options = {
      body: payload.body || 'You have a new notification!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: (payload.data && payload.data.url) ? payload.data.url : '/'
      }
    }
    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
