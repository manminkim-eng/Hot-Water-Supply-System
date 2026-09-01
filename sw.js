/* ═══════════════════════════════════════════════════
   급탕설비 — 급탕량·보일러 출력 산정 시스템  MANMIN Ver-5.0
   Service Worker — 오프라인 캐시 + 버전 업데이트
   ENGINEER KIM MANMIN

   v5.0.0 (2026-09-01)
   ───────────────────────────────────────────────────
   [변경 ①] 문서(HTML)까지 Cache-first 로 처리하던 구조를 고쳤다.
            그 상태에서는 index.html 을 수정·배포해도 캐시명을 올리기 전에는
            사용자 화면에 영구히 반영되지 않는다(§11-2 ①②).
            2026-09-01 오업로드 복구가 화면에 안 먹힌 원인이 바로 이것이다.
   ⛔ navigate 분기를 제거하지 말 것.

   [변경 ②] 캐시 삭제 범위를 자기 접두어로 한정했다.
            caches.keys() 는 origin 전체를 반환한다.
            manminkim-eng.github.io 한 origin 에 39종이 배포돼 있어,
            종전 `k !== CACHE` 필터는 나머지 38종의 캐시를 전부 지웠다.
            → PREFIX 로 자기 것만 지운다. 단 2026-09-01 오업로드로
              이 주소에 박힌 pipe-v5.0.0 만 예외로 함께 제거한다(ORPHAN).

   ⛔ cache.addAll 은 원자적이다. 목록 중 하나라도 404 면 설치가 통째로 실패해
      SW 가 아예 안 붙는다 → allSettled + 개별 catch 로 감쌌다(§11-3).
═══════════════════════════════════════════════════ */
const PREFIX = 'geuptang-';
const CACHE  = 'geuptang-v5.1.2';

/* 2026-09-01 오업로드로 이 주소에 박힌 냉온배관 캐시 — 이번 배포에서 함께 지운다 */
const ORPHAN = ['pipe-v5.0.0'];

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32x32.png',
  './icons/favicon-16x16.png',
  './icons/brand-icon.jpg',
  /* v5.0 — 로컬 폴백 폰트. CDN 차단·오프라인 시 한글 깨짐 방지 (§3-7 · §14-4) */
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', function(e){
  console.log('[SW] Install:', CACHE);
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.allSettled(ASSETS.map(function(u){
        return c.add(u).catch(function(err){ console.warn('[SW] precache skip:', u, err); });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  console.log('[SW] Activate:', CACHE);
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){
          /* ⛔ 자기 접두어 + 이번 사고 잔재만 지운다.
             origin 을 39종이 공유하므로 무조건 지우면 남의 캐시를 날린다. */
          return k !== CACHE && (k.indexOf(PREFIX) === 0 || ORPHAN.indexOf(k) !== -1);
        }).map(function(k){
          console.log('[SW] 구버전 캐시 삭제:', k);
          return caches.delete(k);
        })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf('http') !== 0) return;

  /* ══ ⛔ 핵심 ══ HTML 문서는 Network-first.
     네트워크가 되면 항상 최신을 보여주고, 끊겼을 때만 캐시로 떨어진다. */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then(function(res){
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      }).catch(function(){
        return caches.match(e.request).then(function(c){
          return c || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* ══ 정적 자산: Cache-First + 백그라운드 갱신 ══ */
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if (cached) {
        fetch(e.request).then(function(res){
          if (res && res.status === 200) {
            caches.open(CACHE).then(function(c){ c.put(e.request, res.clone()); });
          }
        }).catch(function(){});
        return cached;
      }
      return fetch(e.request).then(function(res){
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});

self.addEventListener('message', function(e){
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'GET_VERSION' && e.ports[0]) {
    e.ports[0].postMessage({ version: CACHE });
  }
});

console.log('[SW] loaded:', CACHE);
