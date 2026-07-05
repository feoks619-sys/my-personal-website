importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyB4mnp_22n7XYGCV3EDf4AuiEhN_AkSWb4",
    authDomain: "my-archive-project-062608.firebaseapp.com",
    databaseURL: "https://my-archive-project-062608-default-rtdb.firebaseio.com/",
    projectId: "my-archive-project-062608",
    storageBucket: "my-archive-project-062608.firebasestorage.app",
    messagingSenderId: "357884461516",
    appId: "1:357884461516:web:f7efa3063b5ec07bae1d69"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
const CACHE_NAME = 'archive-site-v20260705-2';
const APP_HTML = new URL('./index.html', self.registration.scope).toString();

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll([APP_HTML, './']))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    if (event.request.method !== 'GET') return;

    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(APP_HTML, copy));
                    return response;
                })
                .catch(() => caches.match(APP_HTML).then(cached => cached || caches.match('./')))
        );
        return;
    }

    if (requestUrl.origin === self.location.origin) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});

messaging.onBackgroundMessage(function(payload) {
    const notification = payload.notification || {};
    const title = notification.title || 'The Archive update';
    const options = {
        body: notification.body || 'The owner of The Archive has a new post. Check it out!',
        icon: notification.icon || '/favicon.ico'
    };
    self.registration.showNotification(title, options);
});
