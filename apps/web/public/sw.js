self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Thollabul Ilmi';
    const options = {
        body: data.body || '',
        icon: '/icon.png',
        badge: '/icon.png',
        data: { url: data.url || '/' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientsArr) => {
            const existing = clientsArr.find((c) => c.url.includes(url) && 'focus' in c);
            if (existing) return existing.focus();
            return clients.openWindow(url);
        }),
    );
});
