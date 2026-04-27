# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start local dev server
npm run build     # prisma generate && next build
npm run start     # Production server
npm run lint      # ESLint
npx prisma migrate dev --name <name>   # Create and apply a new DB migration
npx prisma studio                      # Open Prisma Studio (DB GUI)
```

`npm run build` runs `prisma generate` first — never skip this when the schema changes.

## Architecture

Full-stack Next.js App Router app (no Pages Router). Frontend and backend coexist in a single monorepo. There is no REST API — all mutations use **Next.js Server Actions**.

### Data flow

1. `src/middleware.ts` validates Supabase session on every request; unauthenticated users are redirected to `/login`.
2. `app/page.tsx` (Server Component) fetches the user session from Supabase and calls the `getChecklist()` Server Action to hydrate initial state from PostgreSQL.
3. `WeddingChecklist` (Client Component) receives `initialCategories` and manages all subsequent state locally via `useChecklist()`.
4. User interactions (toggle, memo, due date) update React state **optimistically** and then call the relevant Server Action asynchronously. There is no rollback on failure.

### Key layers

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), next-themes |
| Server Actions | `src/actions/auth.ts`, `src/actions/checklist.ts` |
| ORM | Prisma on PostgreSQL (Supabase managed) |
| Auth | Supabase Auth — sessions via HTTP-only cookies, refreshed by middleware |

### Directory roles

- `src/app/` — App Router pages. `(auth)/` group holds login & signup routes.
- `src/actions/` — All Server Actions. `auth.ts` handles login/signup/logout; `checklist.ts` handles all checklist CRUD.
- `src/components/` — UI components. `WeddingChecklist` is the root client component; `CategoryCard` renders one category accordion; `src/components/ui/` contains shadcn/ui base components (copied into the project, not npm-installed).
- `src/hooks/useChecklist.ts` — Client state: merges optimistic updates, filtering (all/done/undone/hasDueDate), and sorting (default or by due date).
- `src/lib/` — Supabase clients (separate files for browser, server, middleware), Prisma singleton, type definitions, `data.ts` (hardcoded 9 categories / 42 items template), and date utilities.
- `prisma/` — Schema and migration history.

### Database model

Only one Prisma model: `ChecklistItem` (`id`, `userId`, `categoryId`, `itemId`, `checked`, `dueDate`, `memo`, `createdAt`, `updatedAt`). Users are managed entirely by Supabase Auth — there is no `User` model in Prisma. Categories are hardcoded in `src/lib/data.ts`; `getChecklist()` merges the template with a user's saved rows at read time.

### Supabase client pattern

Three separate Supabase client files exist for different execution contexts:
- `src/lib/supabase/client.ts` — browser (Client Components)
- `src/lib/supabase/server.ts` — Node.js (Server Components, Server Actions)
- `src/lib/supabase/middleware.ts` — session cookie refresh inside `NextResponse`

Use the correct client for the context; mixing them causes auth failures.

### Styling

Tailwind v4. The rose/pink theme is defined via CSS variables in `src/app/globals.css`. Dark mode is handled by `next-themes`. shadcn/ui components live in `src/components/ui/` and can be edited directly.

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL     # pooled connection (runtime)
DIRECT_URL       # direct connection (migrations only)
```
