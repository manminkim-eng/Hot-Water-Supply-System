# 급탕설비 — 급탕량·보일러 출력 산정 시스템

**MANMIN-Ver5.0** | 기계설비 기술기준 국토교통부 고시 제2021-851호(제2026-360호 타법개정, 2026.7.8. 시행) 별표 5 · KDS 31 30 20:2021 — 1인 1일 급탕량 · K<sub>h</sub> · 보일러 산정식은 MANMIN 참고값(기준에 수치 없음)

| 버전 | 날짜 | 내용 |
|---|---|---|
| v5.0.1 | 2026-10-13 | 근거 표기 정정(원단위 출처 · 2.2.7 → KDS 1.6.9 · 15 m · 환탕 30 m · 고시 표기) · 동시사용률 계산 삭제 · 0 입력 처리 |

---

## 📁 파일 구조

```
/
├── index.html              ← 메인 앱 (단독 실행 가능)
├── manifest.json           ← PWA 매니페스트
├── sw.js                   ← Service Worker (오프라인 지원)
├── README.md               ← 이 파일
└── icons/
    ├── brand-icon.jpg      ← 헤더 로고 (60px)
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── apple-touch-icon.png← iOS 홈화면 (180px)
    ├── icon-192x192.png    ← Android 홈화면
    ├── icon-384x384.png
    └── icon-512x512.png    ← 고해상도 maskable
```

---

## 🚀 GitHub Pages 배포 순서

1. 이 저장소 파일 전체를 GitHub에 올립니다.
2. **Settings → Pages → Source: main / (root)** 선택
3. `https://<username>.github.io/<repo>/` 접속

---

## 📲 PWA 설치 방법

| 환경 | 방법 |
|---|---|
| **Android Chrome** | 헤더 📲 버튼 또는 주소창 설치 아이콘 |
| **iOS Safari** | 헤더 📲 버튼 → 공유(□↑) → 홈 화면에 추가 |
| **PC Chrome/Edge** | 헤더 📲 버튼 또는 주소창 우측 설치 아이콘 |

> 홈화면 바로가기 이름: **급탕설비**
