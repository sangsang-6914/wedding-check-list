# 💒 웨딩 체크리스트

결혼 준비에 필요한 항목들을 카테고리별로 정리하고 진행률을 추적할 수 있는 체크리스트 서비스입니다.

> **배포 URL:** [https://wedding-check-list.vercel.app](https://wedding-check-list.vercel.app)

## 왜 만들었는가

결혼 준비는 **기간이 길고**, **항목이 많으며**, **여러 업체·일정이 얽혀** 있어서 한 번에 머릿속에 담기 어렵습니다. 엑셀이나 메모 앱에 흩어져 두면 “지금 어디까지 됐는지”, “빠진 게 없는지”를 매번 다시 세어야 하고, 커플끼리도 같은 기준으로 진행 상황을 보기 어렵습니다.

이 프로젝트는 **한 화면에서 카테고리별로 정리된 체크리스트**와 **전체 진행률**을 제공해, 준비 과정을 **추적 가능한 작업 목록**으로 바꾸는 것을 목표로 했습니다. 로그인을 두어 **개인별로 상태가 저장**되도록 해, 브라우저만 쓰던 일시적인 체크와 달리 **기기를 바꿔도 이어서** 관리할 수 있게 했습니다.

## 어떤 문제를 해결하려고 했는가

| 문제 | 이 서비스에서의 방향 |
|------|----------------------|
| 항목이 많아 놓치기 쉬움 | 예식·드레스·스튜디오 등 **카테고리와 기본 항목**을 미리 구성 |
| 진행 상황이 감으로만 잡힘 | **진행률·완료 개수**로 한눈에 파악 |
| 체크할 때마다 서버 응답을 기다리면 답답함 | **Optimistic UI**로 먼저 반영 후 서버와 동기화 |
| 데이터가 기기에만 있으면 불안함 | **계정 + DB**에 저장해 지속성 확보 |
| 모바일에서도 쓰고 싶음 | **반응형** 레이아웃 |

즉, “결혼 준비를 **정리**하고 **진행을 숫자로** 보이게 하며, **신뢰할 수 있는 저장**까지”를 한 앱에 모으는 쪽으로 설계했습니다.

## 기술 스택과 선정 이유

아래는 **소규모 풀스택 웹앱**으로 빠르게 만들고, 유지보수와 타입 안전성을 같이 챙기기 위한 선택 기준입니다.

### [Next.js](https://nextjs.org/) (App Router)

- **한 저장소**에서 UI·라우팅·서버 로직을 묶을 수 있어, 체크리스트처럼 CRUD가 단순한 도메인에 **별도 백엔드 레포 없이**도 구조가 명확합니다.
- **Server Actions**로 폼·체크 업데이트를 서버에서 처리하면, REST API를 전부 수동으로 정의하지 않아도 **인증·DB 접근을 서버 쪽에 모을** 수 있습니다.
- 배포·SEO·라우팅 생태계가 성숙해 **개인·소규모 서비스**에도 운영 부담이 적습니다.

### [TypeScript](https://www.typescriptlang.org/)

- 체크리스트는 **항목 ID·카테고리·완료 여부** 등 구조가 반복됩니다. 타입을 두면 **서버 액션 ↔ 클라이언트 훅** 사이 계약이 분명해지고, 리팩터링 시 실수를 줄입니다.

### [Tailwind CSS](https://tailwindcss.com/) v4

- **유틸리티 우선**으로 화면을 빠르게 맞추고, 디자인 토큰(간격·색)을 코드에 남겨 **일관된 UI**를 유지하기 좋습니다.
- v4는 빌드 파이프라인이 단순해지는 방향이라, **새 프로젝트**에 맞춰 최신 라인을 택한 형태입니다.

### [shadcn/ui](https://ui.shadcn.com/) (+ Radix 계열 패턴)

- **접근성·키보드 조작**이 기본으로 고려된 컴포넌트를 베이스로 쓰면, 체크박스·다이얼로그 등에서 **직접 a11y를 전부 구현할 부담**을 줄일 수 있습니다.
- 소스가 프로젝트에 복사되는 방식이라 **의존성 블랙박스**가 덜하고, 테마(이 프로젝트의 로즈골드 톤 등)와도 맞추기 쉽습니다.

### [Supabase](https://supabase.com/) (Auth + PostgreSQL)

- **이메일 인증**과 **관리형 Postgres**를 한곳에서 쓰면, 초기에 **인프라 조각**을 줄일 수 있습니다.
- `@supabase/ssr`로 **미들웨어에서 세션 갱신·보호 라우트**를 처리하기도 익숙한 패턴입니다.

### [Prisma](https://www.prisma.io/)

- Supabase DB 위에서 **스키마를 코드로 관리**하고, **마이그레이션**으로 변경 이력을 남기기에 Prisma가 단순합니다.
- Server Actions에서 **타입 안전한 쿼리**를 쓰면, 체크 상태 업데이트 같은 반복 로직에서 실수를 줄입니다.

**한 줄 요약:** Next.js로 **앱의 뼈대와 서버 경계**를, TypeScript로 **데이터 모델의 안전성**을, Tailwind·shadcn으로 **UI 속도와 품질**을, Supabase·Prisma로 **인증·영속화를 최소 운영**으로 가져가는 조합입니다.

## 주요 기능

- **이메일 회원가입 / 로그인** — Supabase Auth 기반 인증
- **사용자별 데이터 저장** — Prisma + Supabase PostgreSQL로 유저별 체크리스트 관리
- **9개 카테고리, 42개 체크 항목** — 예식장, 드레스/예복, 스튜디오, 메이크업, 청첩장, 신혼여행, 예물/예단, 신혼집, 예식 당일
- **웨딩 D-Day 카운트다운** — 결혼식 날짜를 설정하면 D-Day 카운트다운이 메인 상단에 표시, 남은 기간과 준비 진행률에 따른 응원 메시지
- **실시간 진행률 추적** — 프로그레스바 + 퍼센트 + 완료 카운트 + 구간별 응원 메시지
- **Optimistic UI** — 체크·메모·마감일 변경 시 즉시 반영, 서버와 비동기 동기화
- **항목별 마감일 설정** — 날짜 선택으로 마감일 지정, D-day 배지(지남·오늘·D-N) 자동 표시
- **항목별 메모** — 업체명·가격·연락처 등 자유 메모를 DB에 저장·표시 (접기/펼치기 토글)
- **검색** — 항목명·메모 텍스트로 실시간 필터링
- **필터** — 전체 / 완료 / 미완료 / 마감일 있음
- **정렬** — 기본 순서 / 마감일 임박순 (카테고리 내)
- **카테고리 순서 변경** — 드래그 앤 드롭으로 카드 순서를 재배치, 사용자별 DB 저장
- **카테고리 접기/펼치기** — 카드 헤더 클릭으로 개별 토글, "모두 접기/펼치기" 일괄 제어
- **카테고리별 프로그레스 바** — 각 카테고리 카드 헤더에 완료율 프로그레스 바 표시
- **사용자 항목 추가/삭제** — 기본 체크리스트 외에 직접 항목을 입력해 카테고리에 추가, 사용자가 추가한 항목은 삭제 가능
- **마크다운 내보내기** — 전체 체크리스트를 마크다운으로 클립보드에 복사 (메모·마감일 포함)
- **다크 모드** — 시스템 설정 연동 + 수동 토글, 로즈골드 다크 팔레트
- **반응형 디자인** — 모바일 / 태블릿 / 데스크탑 대응 (1 / 2 / 3 컬럼 그리드)
- **초기화 기능** — 전체 체크리스트 리셋 (체크·마감일·메모 일괄 삭제)

## 기술 스택 (요약)

- [Next.js](https://nextjs.org/) (App Router + Server Actions)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) (Auth + PostgreSQL)
- [Prisma](https://www.prisma.io/) (ORM)
- [next-themes](https://github.com/pacocoursey/next-themes) (다크 모드)
- [@dnd-kit](https://dndkit.com/) (드래그 앤 드롭)

## 프로젝트 구조

```
src/
├── actions/
│   ├── auth.ts                        # 로그인/회원가입/로그아웃 Server Actions
│   ├── budget.ts                      # 예산 관리 Server Actions
│   ├── checklist.ts                   # 체크리스트 CRUD + 카테고리 순서 Server Actions
│   ├── notification.ts                # 마감일 알림 Server Actions
│   ├── share.ts                       # 파트너 공유 Server Actions
│   └── wedding-date.ts               # 웨딩 D-Day 날짜 Server Actions
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── globals.css                    # 로즈골드 라이트/다크 테마
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                            # shadcn/ui 컴포넌트
│   ├── AuthForm.tsx                   # 로그인/회원가입 공통 폼
│   ├── BudgetPanel.tsx                # 예산 관리 패널
│   ├── CategoryCard.tsx               # 카테고리 카드 (메모·마감일·D-day 배지)
│   ├── DdayCounter.tsx                # 웨딩 D-Day 카운트다운 위젯
│   ├── NotificationBanner.tsx         # 마감일 알림 배너
│   ├── ProgressHeader.tsx             # 진행률 헤더
│   ├── SharePanel.tsx                 # 파트너 공유 패널
│   ├── SortableCategoryGrid.tsx       # 드래그 앤 드롭 카테고리 그리드
│   ├── UserNav.tsx                    # 유저 정보 + 로그아웃
│   ├── WeddingChecklist.tsx           # 메인 체크리스트 (검색·필터·정렬·내보내기)
│   ├── theme-provider.tsx             # next-themes 프로바이더
│   └── theme-toggle.tsx               # 다크/라이트 모드 토글
├── hooks/
│   └── useChecklist.ts                # 체크리스트 상태 관리 (Optimistic UI)
└── lib/
    ├── supabase/
    │   ├── client.ts                  # 브라우저용 Supabase 클라이언트
    │   ├── server.ts                  # 서버용 Supabase 클라이언트
    │   └── middleware.ts              # 세션 갱신 + 인증 가드
    ├── checklist-dates.ts             # 마감일 유틸 (D-day 계산·비교·변환)
    ├── prisma.ts                      # Prisma 싱글턴 인스턴스
    ├── data.ts                        # 기본 체크리스트 데이터
    ├── types.ts                       # 타입 정의
    └── utils.ts                       # 유틸리티
```

## 시작하기

```bash
# 의존성 설치
npm install

# DB 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 빌드

```bash
npm run build
npm start
```
