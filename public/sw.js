self.addEventListener('push', function(event) {
    if (event.data) {
        const payload = event.data.json();
        
        const options = {
            body: payload.body || 'New notification',
            icon: '/assets/non_background_logo-BVboLjc2.png',
            badge: '/assets/non_background_logo-BVboLjc2.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: {
                url: payload.url || '/'
            },
            requireInteraction: true // Keep it on screen until interacted with
        };

        event.waitUntil(
            self.registration.showNotification(payload.title || 'PosterSensei Admin', options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        // Open the URL in a new window/tab, or focus it if already open
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url.includes(event.notification.data.url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
        );
    }
});
