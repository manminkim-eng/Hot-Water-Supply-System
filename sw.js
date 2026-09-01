/* ════════════════════════════════════════
   급탕설비 PWA Service Worker MANMIN-Ver2.0
   Cache-First 전략 + 오프라인 지원
════════════════════════════════════════ */
const CACHE = 'geuptang-v2.0';

const ASSETS = [
  './', './index.html', './manifest.json', './sw.js',
  './icons/icon-192x192.png', './icons/apple-touch-icon.png',
  './icons/favicon-32x32.png', './icons/favicon-16x16.png',
];

/* ── 설치 ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return Promise.allSettled(ASSETS.map(function(u) {
        return c.add(u).catch(function() {});
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

/* ── 활성화: 구버전 캐시 정리 ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

/* ── fetch: Cache-First ── */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      }).catch(function() { return caches.match('./index.html'); });
    })
  );
});

/* ── 메시지: SKIP_WAITING ── */
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
