const CACHE_NAME = 'noosphere-v1';
const PRECACHE = [
 './',
 './index.html',
 './styles.css',
];
self.addEventListener('install', (event) => {
 event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
 self.skipWaiting();
});
self.addEventListener('activate', (event) => {
 event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
 event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});