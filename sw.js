const CACHE_NAME = "animeoffis-GDLv2"; // 🔄 Cambia el nombre para forzar actualización

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",                // Carga la raíz
        "/dashboard",
        "/styles",
        "/script.js",
        "/icon-192.png",
        "/icon-512.png",
        "/offis.png",
        "/perfil",
        "/perfil.js",
        "/perfil.css",
        
        "/mora.jpg",
        "/login.png"
      ]);
    })
  );
});

// 🔄 Borra versiones viejas de caché al activar
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
