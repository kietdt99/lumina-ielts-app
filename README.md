# Lumina IELTS

Lumina IELTS is an AI-supported IELTS practice app built with Next.js 16 and Supabase.

## Current focus

The project is currently in the MVP foundation stage. The initial product direction is:

- authenticated learner workspace
- dashboard with progress context
- writing practice as the first complete study loop
- structured feedback and progress tracking

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
