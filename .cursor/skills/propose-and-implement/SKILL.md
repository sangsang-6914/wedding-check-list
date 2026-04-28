---
name: propose-and-implement
description: >-
  wedding-check-list 프로젝트 구조를 분석해 현재 없는 신기능 3개를 제안하고,
  사용자가 선택한 기능을 구현한 뒤 빌드 검증·커밋·푸시까지 완료한다.
  "새 기능 제안", "기능 추가하고 싶어", "다음에 뭘 만들지" 등의 요청 시 사용.
---

# 신기능 제안 → 구현 → 커밋·푸시

## 워크플로

```
Task Progress:
- [ ] Step 1: 프로젝트 분석
- [ ] Step 2: 신기능 3개 제안
- [ ] Step 3: 선택된 기능 구현
- [ ] Step 4: 빌드 검증
- [ ] Step 5: 커밋 분리 및 푸시
- [ ] Step 6: Readme파일 업데이트
```

---

## Step 1 — 프로젝트 분석

아래 파일을 읽어 현재 구현된 기능 목록을 도출한다.

| 대상 | 경로 |
|------|------|
| DB 스키마 | `prisma/schema.prisma` |
| 기본 데이터 | `src/lib/data.ts` |
| 타입 | `src/lib/types.ts` |
| Server Actions | `src/actions/` 전체 |
| 훅 | `src/hooks/` 전체 |
| 컴포넌트 | `src/components/` (ui/ 제외) |
| 페이지 | `src/app/` |

현재 기능을 간결히 정리한다 (예: 이메일 인증, 체크/언체크, 마감일, 정렬, 초기화, 다크 모드 등).

## Step 2 — 3개 기능 제안

**기존에 없는** 기능 중 프로젝트에 자연스러운 것 3개를 골라 AskQuestion으로 제시한다.

- 각 선택지는 **기능명 + 한 줄 설명** 형태
- 복수 선택 불가 (`allow_multiple: false`)

```
AskQuestion 예시:
  prompt: "아래 중 구현할 기능을 하나 골라 주세요."
  options:
    - { id: "a", label: "기능A — 설명" }
    - { id: "b", label: "기능B — 설명" }
    - { id: "c", label: "기능C — 설명" }
```

## Step 3 — 선택된 기능 구현

1. 필요한 변경(스키마·서버·훅·UI)을 계획
2. 코드 작성 (최소 변경 원칙, DRY, Early Return)
3. 타입 일관성 유지 (`src/lib/types.ts` 기준)

## Step 4 — 빌드 검증

```bash
cd wedding-check-list && npm run build
```

실패 시 에러를 수정하고 다시 빌드한다.

## Step 5 — 커밋 분리 및 푸시

**반드시 `.cursor/rules/commit-convention.mdc` 파일을 먼저 읽고** 그 규칙을 따른다.

핵심 규칙 요약 (상세는 룰 파일 참조):

- 메시지: `(작업타입): (작업내용)`
- 작업타입이 다르면 커밋 분리
- 같은 타입이라도 독립 기능이면 분리
- 한 커밋 = 되돌릴 때 한 덩어리로 빠지는 단위

분리 예시:

| 순서 | 커밋 |
|------|------|
| 1 | `chore: Prisma 스키마 변경 및 마이그레이션` |
| 2 | `feat: 서버 액션·훅 구현` |
| 3 | `feat: UI 컴포넌트 구현` |

### 커밋 전 사용자 컨펌 (필수)

커밋을 실행하기 **전에**, 분리된 커밋 목록과 각 커밋 메시지를 사용자에게 보여 주고 AskQuestion으로 승인을 받는다.

```
AskQuestion 예시:
  prompt: |
    아래 커밋으로 진행할까요?
    1. chore: Prisma 스키마 변경 및 마이그레이션
    2. feat: 서버 액션·훅 구현
    3. feat: UI 컴포넌트 구현
  options:
    - { id: "yes", label: "네, 커밋하고 푸시해 주세요" }
    - { id: "edit", label: "커밋 메시지를 수정하고 싶어요" }
```

- **yes** → 커밋 후 `git push origin main`
- **edit** → 사용자에게 수정할 메시지를 입력받은 뒤 다시 컨펌

사용자 승인 없이 커밋하지 않는다.
