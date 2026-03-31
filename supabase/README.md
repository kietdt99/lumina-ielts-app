# Supabase Schema

This directory is the source of truth for the production data model.

## Tables

- `profiles`
- `user_goals`
- `writing_prompts`
- `practice_sessions`
- `writing_submissions`
- `writing_feedback`
- `activity_logs`

## Local workflow

1. Run the migration files in `supabase/migrations/`.
2. Run `supabase/seed.sql` to seed the prompt library.
3. Keep TypeScript row contracts in `lib/db/schema.ts` aligned with schema changes.

## Notes

- The schema enables RLS on user-owned tables.
- `writing_prompts` is readable for active prompts so the app can hydrate the prompt library.
- `writing_feedback` stores structured rubric JSON plus a provider label so heuristic and AI feedback can coexist.
