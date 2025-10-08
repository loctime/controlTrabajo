const CACHE_NAME = "bolsatrabajo-v1.0.1"
const STATIC_CACHE = "bolsatrabajo-static-v1.0.1"
const DYNAMIC_CACHE = "bolsatrabajo-dynamic-v1.0.1"

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/icon-512.png"
]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...")
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Cacheando recursos estáticos")
        return cache.addAll(urlsToCache)
      })
      .catch((err) => {
        console.log("[SW] Error al cachear recursos:", err)
      })
      .then(() => self.skipWaiting())
  )
})

// Activar Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando Service Worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("[SW] Eliminando caché antiguo:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Interceptar requests (estrategia Network First, fallback a Cache)
self.addEventListener("fetch", (event) => {
  // Ignorar requests que no sean GET
  if (event.request.method !== 'GET') return

  // Ignorar requests a Firebase y otras APIs externas
  if (event.request.url.includes('firebaseapp.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebase.com')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar obtener del caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Si no hay en caché y es una navegación, devolver index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
      })
  )
})

