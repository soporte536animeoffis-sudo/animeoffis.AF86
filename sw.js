const CACHE_NAME = "animeoffis-GDLv3"; // 🔄 Cambia el número cuando hagas cambios importantes
const FILES_TO_CACHE = [
  "/",                // Página principal
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
];

// Instalar y guardar los archivos en caché (primera vez o si cambias el CACHE_NAME)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Activar y borrar cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

// Estrategia network first: busca primero en la red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ✅ Si hay internet, guarda la nueva versión en caché
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // ❌ Si no hay internet, usa la versión en caché
        return caches.match(event.request);
      })
  );
});
