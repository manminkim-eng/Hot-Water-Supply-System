/* ════════════════════════════════════════
   급탕설비 PWA Service Worker
   MANMIN-Ver2.0
   캐시 전략: Cache-First (오프라인 지원)
════════════════════════════════════════ */
const CACHE_NAME = 'geuptang-v2.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './brand-icon.jpg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-16.png',
];

/* ── 설치: 핵심 자산 캐시 ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      /* 일부 실패해도 설치 계속 */
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] 캐시 실패:', url, err);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ── 활성화: 이전 버전 캐시 제거 ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(k) { return k !== CACHE_NAME; })
          .map(function(k) {
            console.log('[SW] 구 캐시 삭제:', k);
            return caches.delete(k);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── fetch: Cache-First 전략 ── */
self.addEventListener('fetch', function(e) {
  /* GET 요청만 처리 */
  if(e.request.method !== 'GET') return;
  /* 외부 CDN 요청은 네트워크 우선 (폴백 없음) */
  if(!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if(cached) return cached;

      return fetch(e.request).then(function(response) {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        /* 성공 응답을 캐시에 저장 */
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        /* 오프라인 fallback → index.html */
        return caches.match('./index.html');
      });
    })
  );
});

/* ── 메시지 처리 (SKIP_WAITING) ── */
self.addEventListener('message', function(e) {
  if(e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
