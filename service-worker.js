const CACHE_NAME = 'dexi-offline-v3';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './Dexi.png',
  './favicon.ico'
];
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/tldraw/tldraw.css'
];
const CACHEABLE_DESTINATIONS = new Set(['script', 'style', 'worker', 'font', 'image']);

async function cacheCdnAsset(cache, url) {
  try {
    let response = await fetch(url, { cache: 'reload' });
    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`Falha ao carregar ${url}`);
    }
    await cache.put(url, response);
  } catch (error) {
    try {
      const response = await fetch(url, { mode: 'no-cors', cache: 'reload' });
      if (response.type === 'opaque') await cache.put(url, response);
    } catch (fallbackError) {
      console.warn('Biblioteca não foi armazenada para uso offline:', url);
    }
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await Promise.allSettled(CDN_ASSETS.map(url => cacheCdnAsset(cache, url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter(name => name.startsWith('dexi-offline-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put('./index.html', response.clone());
        return response;
      } catch (error) {
        return (await caches.match(request)) || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  if (requestUrl.origin === self.location.origin || CACHEABLE_DESTINATIONS.has(request.destination)) {
    event.respondWith((async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const response = await fetch(request);
        if (response.ok || response.type === 'opaque') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return Response.error();
      }
    })());
  }
});