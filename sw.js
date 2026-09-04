/* ═══════════════════════════════════════════════════
   S6 회차 2026-09-05 — R24①② 표 선 separate·mono 한글 폴백 소급 동반 캐시명 v5.1.8
   S5 회차 2026-09-04 — R23② JPG 엔진 행 나눔 소급 동반 캐시명 v5.1.7
   S3-0 회차 2026-09-04 — R27 html2canvas 클론 정화 동반 캐시명 v5.1.6
   S2 회차 2026-09-04 — index 소급(R1·R21·R26 등) 동반 캐시명 v5.1.5
   R25 회차 2026-09-04 — 자기 접두어 캐시 조회 · cors 프리캐시 · opaque 가드 · 캐시명 v5.1.4 (S10)
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
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const CACHE  = 'geuptang-v5.1.8';   /* 2026-09-02 헤더 통일 */

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
        return c.add(mmReq(u)).catch(function(err){ console.warn('[SW] precache skip:', u, err); });
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
          return k !== CACHE && (mmOwn(k) || ORPHAN.indexOf(k) !== -1);
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
        return mmMatch(e.request).then(function(c){
          return c || mmMatch('./index.html');
        });
      })
    );
    return;
  }

  /* ══ 정적 자산: Cache-First + 백그라운드 갱신 ══ */
  e.respondWith(
    mmMatch(e.request).then(function(cached){
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
      }).catch(function(){ return mmMatch('./index.html'); });
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
