# Lumina IELTS Implementation Plan

## 1. Product Goal

Lumina IELTS is an IELTS preparation app focused on guided practice, measurable progress, and high-quality feedback that helps learners reach their target band faster.

MVP goals:

- Allow the admin to provision learner accounts, and allow learners to sign in and store their learner profile.
- Provide a dashboard with target band, recent practice activity, and next-step recommendations.
- Launch at least one complete practice module.
- Prioritize `Writing` as the first module because it fits AI feedback especially well, proves product value early, and is the fastest path to an MVP.

## 2. Current Repository State

What already exists:

- `Next 16.2.1` and `React 19`.
- `Supabase SSR` auth scaffolding.
- Initial Supabase schema assets and prompt seed files now live under `supabase/`.
- `proxy.ts` following the new Next 16 convention.
- `next build` currently passes.

Technical risks that should be addressed first:

- Both `app/` and `src/app/` exist. Based on the local Next 16 docs, `src/app` is ignored when root-level `app/` exists, so the team needs a single source of truth.
- The current UI is still a mix of scaffold code and inline styles, with no clear design system yet.
- Lint errors still exist in auth and layout files.
- Some UI strings show encoding issues.
- There is no schema, migration, seed data, test setup, or IELTS domain model yet.

## 3. Implementation Principles

- Build the smallest valuable MVP first instead of opening all four skills too early.
- Commit to `Writing first`, then expand into `Reading`, `Listening`, and `Speaking`.
- Separate `routing`, `ui`, `domain`, `data access`, and `AI orchestration`.
- Make every phase demoable, not just a roadmap full of technical debt work.
- Follow `Next 16` conventions instead of relying on older habits.

## 4. Proposed MVP Scope

What should be included:

- Admin-managed email/password auth.
- Learner profile: target band, priority skill, current level.
- Personal dashboard.
- Writing practice:
  - Select a prompt.
  - Write a response.
  - Submit the response.
  - Receive structured feedback.
  - View writing history.
- Basic progress tracking.

What should stay out of MVP:

- Full four-skill mock tests.
- Speaking recorder and speech scoring.
- Complete Reading/Listening auto-scoring.
- Payments, subscriptions, referrals.
- Full teacher/admin portal.

## 5. Proposed Architecture

### 5.1 App Structure

Choose one direction and keep it consistent:

- Option A, recommended for the current repo: keep root `app/`, remove or migrate `src/app/`.
- Option B: move fully to `src/app/`, then align aliases and the location of `proxy.ts`.

Current recommendation: take Option A to reduce early refactor cost.

Target folder shape:

```text
app/
  (marketing)/
  (app)/
    dashboard/
    writing/
    tracker/
    settings/
  auth/
  api/
components/
  ui/
  layout/
  writing/
lib/
  supabase/
  auth/
  db/
  ielts/
  ai/
```

### 5.2 MVP Domain Model

Proposed tables:

- `profiles`
- `user_goals`
- `practice_sessions`
- `writing_prompts`
- `writing_submissions`
- `writing_feedback`
- `activity_logs`

### 5.3 Writing AI Flow

MVP flow:

1. The user selects a prompt.
2. The user submits a writing response.
3. The system stores the raw submission.
4. AI returns rubric-based feedback.
5. The feedback is stored in a structured format.
6. The app shows a summary, major weaknesses, and revision guidance.

Minimum feedback output:

- Estimated band.
- Task response.
- Coherence and cohesion.
- Lexical resource.
- Grammatical range and accuracy.
- Priority action items.
- A short sample rewrite for one paragraph.

## 6. Phase-Based Roadmap

## Phase 0 - Foundation Stabilization

Goal: clean up the bootstrap state and create a stable base for fast delivery.

Tasks:

- Choose and unify either `app/` or `src/app/`.
- Remove default create-next-app scaffolding.
- Standardize layout, navigation, metadata, and global styles.
- Fix the current lint errors.
- Fix text encoding issues.
- Finalize the environment contract:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- Add local setup documentation.
- Finalize folder conventions for features, UI, and shared libs.

Definition of done:

- The team has one routing root only.
- `npm run lint` passes.
- `npm run build` passes.
- The app no longer shows default scaffold content.

## Phase 1 - Auth and Learner Profile

Goal: support real users, real sign-in, and basic learner data.

Tasks:

- Complete login and logout flows.
- Add complete auth callback and auth error states.
- Create `profiles` and `user_goals`.
- Add an admin-only account provisioning flow:
  - create learner account
  - auto-generate a temporary password
  - mark the learner as `must_change_password`
- Add a first-login password reset flow for learners.
- Add profile settings with password change support.
- Add a post-login onboarding flow:
  - target band
  - current level
  - focus skill
  - study frequency
- Protect routes for the authenticated app area.
- Restrict learner registration so accounts can only be created by the admin.

Definition of done:

- The admin can create a learner account and hand over credentials.
- A learner is redirected to the password-change screen after the first successful sign-in.
- A returning learner can sign in successfully.
- Learner profile data is stored in Supabase.

## Phase 2 - Dashboard MVP

Goal: provide a useful learner home base.

Tasks:

- Dashboard summary for goal and streak.
- Recent activity.
- Recommendation card for the next best study step.
- Empty states and loading states.
- Route groups for `(auth)` and `(app)` if layout separation is needed.

Definition of done:

- Users can immediately see what to study next.
- Dashboard data is real, not hard-coded.

## Phase 3 - Writing Practice MVP

Goal: release the first core value loop.

Tasks:

- Create a prompt library for `Task 1` and `Task 2`.
- Build the writing workspace.
- Add timer, word count, and draft autosave.
- Submit responses into `writing_submissions`.
- Trigger AI feedback generation.
- Show a results page with rubric scores and action items.

Definition of done:

- Users can complete the full writing practice loop.
- Submissions and feedback are stored for later review.

## Phase 4 - Progress Tracker

Goal: turn feedback into visible progress over time.

Tasks:

- Submission history.
- Band estimate chart over time.
- Repeated strength and weakness tags.
- Detailed submission pages.

Definition of done:

- Users can clearly see progress over time.
- The team has data to evaluate retention and the learning loop.

## Phase 5 - Quality, Analytics, and Growth

Goal: prepare the product for broader user testing.

Tasks:

- Error handling, toasts, not-found, and global-error states.
- Basic logging and analytics events.
- Tests for auth, core flows, and domain helpers.
- Seed data for the prompt library.
- Performance review and SEO for public pages.

Definition of done:

- Core flows have tests.
- Basic observability is in place.
- The product is ready for external test users.

## 7. Post-MVP Backlog

- Reading practice and auto-scoring.
- Listening practice.
- Speaking recorder, transcript, and feedback.
- Study plans based on target score and exam date.
- Subscription/paywall.
- Admin CMS for prompts and rubric control.

## 8. Recommended Next Sprint Order

If we start immediately, this is the recommended sprint order:

1. Foundation cleanup:
   - unify the `app` structure
   - fix lint issues
   - remove scaffold content
   - finalize the app shell and layout
2. Complete auth:
   - login, signup, logout
   - callback and error states
   - route protection
3. Create the MVP data layer:
   - schema for `profiles`, `user_goals`, `writing_submissions`, `writing_feedback`
4. Build a dashboard backed by real data.
5. Build the writing practice flow end to end.

## 9. How We Should Use This Plan

- Break each phase into smaller feature tasks or issues.
- Every task should include a clear definition of done.
- Prioritize work that can be merged, demoed, and tested.
- When scope changes, update this file instead of letting the plan live only in chat.

## 9.1 Release Workflow

- Feature branches must be tested locally and must not deploy directly to production.
- Production deployments are allowed from `master` only.
- Implement each feature on a new branch first.
- Start the app locally and run tests after implementation is complete on the feature branch.
- Once a feature branch is ready, merge it into `master`.
- Start the app locally and run tests again on `master` before deploying.
- Deploy to production only after the `master` verification pass succeeds.

## 10. Recommended Immediate Actions

The next tasks should be:

- Refactor the app structure so there is only one routing root.
- Move the layout toward a cleaner pattern for `(auth)` and the authenticated app area.
- Fix all current lint errors.
- Create the MVP Supabase schema.

If we follow that order, we can move toward a fast MVP without losing architectural clarity.
