/// <reference lib="webworker" />

const swSelf = self as unknown as ServiceWorkerGlobalScope;

swSelf.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Anex Salon';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.data || {},
  };

  event.waitUntil(swSelf.registration.showNotification(title, options));
});

swSelf.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    swSelf.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (swSelf.clients.openWindow) {
        return swSelf.clients.openWindow(urlToOpen);
      }
    })
  );
});
