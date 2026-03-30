# 급탕설비 — 급탕량·보일러 출력 산정 시스템

**MANMIN-Ver2.0** | 기계설비 기술기준 국토교통부 고시 제2021-851호 별표5 · KDS 31 30 20

## GitHub Pages 배포 방법

1. 이 저장소를 GitHub에 업로드합니다.
2. **Settings → Pages → Source: main branch / (root)** 설정
3. `https://<username>.github.io/<repo>/` 로 접속

## PWA 설치 방법

| 환경 | 방법 |
|------|------|
| **Android Chrome** | 주소창 오른쪽 메뉴 → "홈 화면에 추가" 또는 헤더 📲 버튼 |
| **iOS Safari** | 하단 공유(□↑) → "홈 화면에 추가" |
| **PC Chrome/Edge** | 주소창 오른쪽 설치 아이콘 또는 헤더 📲 버튼 |

홈화면 바로가기 이름: **급탕설비**

## 파일 구조

```
/
├── index.html          ← 메인 앱 (단독 실행 가능)
├── manifest.json       ← PWA 매니페스트
├── sw.js               ← Service Worker (오프라인 지원)
├── brand-icon.jpg      ← 헤더 로고 이미지
├── favicon-16.png      ← 파비콘 16px
├── favicon-32.png      ← 파비콘 32px
├── apple-touch-icon.png← iOS 홈화면 아이콘 (180px)
├── icon-144.png        ← Windows 타일 아이콘
├── icon-152.png        ← iPad 아이콘
├── icon-192.png        ← Android 홈화면 아이콘
├── icon-384.png        ← Android 스플래시
└── icon-512.png        ← Android 고해상도 아이콘
```

## 주요 기능

- 건물 용도 12종 · 1일 최대 급탕량 자동 산정
- 보일러 필요 출력 (kW / Mcal/h) 자동 계산
- ISO A4 산정서 PDF·JPG 저장
- Galaxy S24 Ultra 모바일 미리보기 JPG 저장
- 오프라인 동작 (PWA Service Worker)

## 적용 기준

- 기계설비 기술기준 (국토교통부 고시 제2021-851호) [별표 5]
- KDS 31 30 20 급탕설비 설계기준
