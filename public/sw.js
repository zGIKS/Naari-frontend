// Service Worker for Naari App
// Optimized caching strategy for better performance

const CACHE_NAME = 'naari-v1';
const STATIC_CACHE = 'naari-static-v1';
const DYNAMIC_CACHE = 'naari-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/naari.png'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  cacheFirst: /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
  
  // Network first for API calls
  networkFirst: /\/api\//,
  
  // Stale while revalidate for HTML
  staleWhileRevalidate: /\.html$/
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Cache first strategy for static assets
    if (CACHE_STRATEGIES.cacheFirst.test(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // Network first for API calls
    if (CACHE_STRATEGIES.networkFirst.test(url.pathname)) {
      return await networkFirst(request);
    }
    
    // Stale while revalidate for HTML
    if (CACHE_STRATEGIES.staleWhileRevalidate.test(url.pathname)) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: network first
    return await networkFirst(request);
    
  } catch (error) {
    console.warn('SW: Request failed:', error);
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  // Return cached response immediately if available
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cachedResponse || await fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('SW: Background sync triggered');
}
