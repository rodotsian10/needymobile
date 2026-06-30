/* DOSE OS - Service Worker v1.0 */
/* Handles background notification scheduling and display */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

let awayTimeoutId = null;

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delayMs, title, body, tag } = event.data;

    if (tag === 'ame-away' && awayTimeoutId) {
      clearTimeout(awayTimeoutId);
    }

    const timer = setTimeout(async () => {
      try {
        await self.registration.showNotification(title, {
          body: body,
          icon: '/assets/images/icons/ame.png',
          badge: '/assets/images/icons/ame.png',
          tag: tag || 'ame-notification',
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: self.location.origin }
        });
      } catch (e) {
        console.error('[SW] 알림 표시 실패:', e);
      }
    }, delayMs);

    if (tag === 'ame-away') {
      awayTimeoutId = timer;
    }
  } else if (event.data && event.data.type === 'CANCEL_NOTIFICATION') {
    if (event.data.tag === 'ame-away' && awayTimeoutId) {
      clearTimeout(awayTimeoutId);
      awayTimeoutId = null;
    }
  }
});

// When user taps the notification, open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === self.location.origin + '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
