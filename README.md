# 💒 웨딩 체크리스트

결혼 준비에 필요한 항목들을 카테고리별로 정리하고 진행률을 추적할 수 있는 체크리스트 서비스입니다.

> **배포 URL:** [https://wedding-check-list.vercel.app](https://wedding-check-list.vercel.app)

## 주요 기능

- **9개 카테고리, 42개 체크 항목** — 예식장, 드레스/예복, 스튜디오, 메이크업, 청첩장, 신혼여행, 예물/예단, 신혼집, 예식 당일
- **실시간 진행률 추적** — 프로그레스바 + 퍼센트 + 완료 카운트
- **자동 저장** — localStorage 기반으로 브라우저를 닫아도 체크 상태 유지
- **반응형 디자인** — 모바일 / 태블릿 / 데스크탑 대응
- **초기화 기능** — 전체 체크리스트 리셋

## 기술 스택

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/)

## 프로젝트 구조

```
src/
├── app/
│   ├── globals.css             # 로즈골드 테마
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   ├── WeddingChecklist.tsx    # 메인 클라이언트 컴포넌트
│   ├── ProgressHeader.tsx      # 진행률 헤더
│   └── CategoryCard.tsx        # 카테고리 카드
├── hooks/
│   └── useChecklist.ts         # 체크리스트 상태 관리 훅
└── lib/
    ├── data.ts                 # 기본 체크리스트 데이터
    ├── types.ts                # 타입 정의
    └── utils.ts                # 유틸리티
```

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 빌드

```bash
npm run build
npm start
```
