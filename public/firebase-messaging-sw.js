/* public/firebase-messaging-sw.js */

// Tangani push dari FCM tanpa SDK di SW.
// Menampilkan notifikasi + broadcast pesan ke semua tab agar badge naik instan.

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const notif = data.notification || {};
    const title = notif.title || data.title || 'New notification';
    const options = {
        body: notif.body || data.body || '',
        icon: notif.icon || '/icons/icon-192x192.png',
        data: data.data || {}, // payload ikut terbawa ke click
    };

    // Tampilkan notifikasi
    event.waitUntil(self.registration.showNotification(title, options));

    // Beritahu semua tab/window: ada push baru → biar UI update (badge +1)
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            clients.forEach((client) => {
                client.postMessage({ type: 'fcm:received', payload: data });
            });
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return self.clients.openWindow('/');
        })
    );
});
