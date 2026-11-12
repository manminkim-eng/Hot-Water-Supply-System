# 급탕설비 — 급탕량·보일러 출력 산정 시스템

## v6.1.3 (2026-11-12) — html2canvas SRI(정밀검토 B8)

- html2canvas 1.4.1 머리 태그 SRI(integrity sha384 · crossorigin) · 공통 인쇄 원본 MM-PRINT v1.0 → v1.1(지연 로더도 SRI)(정밀검토 B8 · html2canvas SRI) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-87.
- sw 캐시명 v6.1.3 · MM-PROJECT 구간 · 사용자 매뉴얼 변경 없음.

## v6.1.2 (2026-11-12) — CDN 판 통일 · SRI(정밀검토 C2)

- Pretendard CSS SRI(integrity · crossorigin)(정밀검토 C2) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-82.
- sw 캐시명 v6.1.2 · MM-PRINT · MM-PROJECT 구간 · 사용자 매뉴얼 변경 없음.

## v6.1.1 (2026-11-12) — 건물개요 창 표 모양 고정

- 건물개요 공통 원본 MM-PROJECT v1.2 → v1.3(불러오기 창 표 칸 모양 고정 — 도구 CSS 가 새지 않음 · 저장값 같음, 정밀검토 C10) · 작업지시서 §25-6-80.
- 판 6.1 · sw 캐시명 v6.1.1 · 계산 · 인쇄 · MM-PRINT 구간 · 사용자 매뉴얼 변경 없음.

## v6.1.0 (2026-11-12) — 건물개요 공통 원본 v1.2

- MM-PROJECT v1.1 → v1.2(원본 inject.py — 불러오기 창 표 칸 `white-space:normal` · 판 표기). 저장값 · 파일 형식 · 칸 설정 같음(정밀검토 B5 · 작업지시서 §25-6-76).
- 판 6.1 · sw `geuptang-v6.1.0` · 계산 · 인쇄 · MM-PRINT 구간 · 사용자 매뉴얼 변경 없음.

사용자 매뉴얼: https://manminkim-eng.github.io/Hot-Water-Supply-System/manual/

**MANMIN-Ver5.0** | 기계설비 기술기준 국토교통부 고시 제2021-851호(제2026-360호 타법개정, 2026.7.8. 시행) 별표 5 · KDS 31 30 20:2021 — 1인 1일 급탕량 · K<sub>h</sub> · 보일러 산정식은 MANMIN 참고값(기준에 수치 없음)

| 버전 | 날짜 | 내용 |
|---|---|---|
| v5.0.2 | 2026-10-13 | 사용자 매뉴얼(manual/ · PDF 28쪽) · 탭 막대 「📘 매뉴얼」 |
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
