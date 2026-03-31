# Lumina IELTS

Lumina IELTS is an AI-supported IELTS practice app built with Next.js 16 and Supabase.

## Current focus

The project is currently in the MVP foundation stage. The initial product direction is:

- authenticated learner workspace
- dashboard with progress context
- writing practice as the first complete study loop
- structured feedback and progress tracking

## Current feature set

- Email/password authentication with Supabase
- Auth-protected learner dashboard
- Writing practice workspace with:
  - prompt selection for Task 1 and Task 2
  - local draft autosave per prompt
  - timer controls
  - word, paragraph, and sentence tracking
  - local practice feedback with rubric-style signals
- Progress tracker with local history, band trend snapshots, and revision priorities

## Tech stack

- Next.js 16 App Router
- React 19
- Supabase SSR authentication
- TypeScript

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Add the required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Release workflow

1. Implement new code in a new branch.
2. Start the app locally and run tests after implementation is complete.
3. Merge the branch into `master`.
4. Start the app locally and run tests again on `master`.

Additional guardrails:

- Feature branches must be validated locally only.
- Production deployments are allowed from `master` only.
- Deploy to production only after the `master` verification pass succeeds.

## Project structure

```text
app/                  App Router entry points
app/auth/             Authentication UI and callback flow
lib/supabase/         Supabase server, client, and session helpers
docs/                 Working implementation documents
```

## Working notes

- The active App Router lives in `app/`.
- `proxy.ts` is used for auth-aware route protection.
- The implementation roadmap is documented in `docs/implementation-plan.md`.
