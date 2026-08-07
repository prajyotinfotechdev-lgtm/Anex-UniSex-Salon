// ============================================================
// Anex Salon Push Notification Service Worker
// Works in background even when the PWA is closed or cleared
// from recent apps. The browser (Chrome) keeps this worker
// alive at the OS level to handle incoming push events.
// ============================================================

// Install: Cache nothing, just activate immediately
self.addEventListener('install', function (event) {
  // Skip waiting makes the new SW take control immediately
  // without waiting for the old one to become idle.
  self.skipWaiting();
});

// Activate: Claim all open clients so we control the page
// immediately after registration, not just on next load.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    self.clients.claim()
  );
});

// Push: This fires even when the app/PWA is fully closed or
// cleared from recents. The browser wakes this worker up
// automatically when a push event arrives from the server.
self.addEventListener('push', function (event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Anex Salon', body: event.data ? event.data.text() : 'You have a new notification!' };
  }

  const title = payload.title || 'Anex Salon';
  const options = {
    body: payload.body || 'You have a new notification!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'anex-notification', // Replaces previous notification instead of stacking
    renotify: true,           // Vibrate/ring even if replacing existing notification
    requireInteraction: false, // Auto-dismiss on Android
    data: {
      dateOfArrival: Date.now(),
      url: (payload.data && payload.data.url) ? payload.data.url : '/'
    }
  };

  // event.waitUntil prevents the browser from terminating
  // the service worker before the notification is shown.
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// NotificationClick: Opens or focuses the app when the user
// taps the notification in the system tray.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If the app is already open in any tab, focus it
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window to the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
