const CACHE_NAME = 'deen-daily-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/prayer.html',
  '/quran.html',
  '/quran-reader.html',
  '/tasbih.html',
  '/favorites.html',
  '/qibla.html',
  '/calendar.html',
  '/search.html',
  '/login.html',
  '/style.css',
  '/config.js',
  '/index.js',
  '/prayer.js',
  '/quran.js',
  '/quran-reader.js',
  '/tasbih.js',
  '/favorites.js',
  '/duas.json',
  '/manifest.json',
  '/icons/logo.svg'
];

const API_CACHE_NAME = 'deen-daily-api-v1';
const API_CACHE_DURATION = 24 * 60 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname === 'api.alquran.cloud' || 
      url.hostname === 'api.aladhan.com' ||
      url.hostname === 'hadith-api.herokuapp.com' ||
      url.hostname === 'api.openweathermap.org') {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('x-cached-time');
    if (cachedTime && Date.now() - parseInt(cachedTime) < API_CACHE_DURATION) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('x-cached-time', Date.now().toString());
      
      const body = await responseClone.blob();
      const cachedResponse = new Response(body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      });
      
      await cache.put(request, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
