self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('anime-offis-cache').then(cache => {
      return cache.addAll([
  '/anime-offis/index.html',
  '/anime-offis/styles.css',
  '/anime-offis/script.js',
  '/anime-offis/icon-192.png',
  '/anime-offis/icon-512.png',
  '/anime-offis/offis.png',
  '/anime-offis/perfil.html',
  '/anime-offis/dashboard.html',
  '/anime-offis/mora.jpg',
  '/anime-offis/login.png'
]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});