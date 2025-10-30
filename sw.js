const CACHE_NAME = 'noosphere-v1';
const PRECACHE = [
 './',
 './index.html',
 './styles.css',
 './src/ui/app.js',
 './src/systems/audio_manager.js',
 './src/systems/meditations.js',
 './src/systems/gallery.js',
 './src/systems/proc_gen.js',
 './src/systems/leaderboard.js',
 './src/systems/particles.js',
 './src/modes/demo_games/flappy_demo.js',
 './src/modes/demo_games/doodle_demo.js',
 './src/modes/demo_games/snake_demo.js',
 './src/modes/demo_games/dino_demo.js',
 './src/modes/demo_games/breakout_demo.js',
 './src/modes/demo_games/2048_demo.js',
 './manifest.json',
 './favicon.svg',
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