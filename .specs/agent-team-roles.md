# Agent Team Roles

This project uses a senior-to-expert virtual product team model when feature scope, UI/UX, technical design, implementation, or testing needs structured thinking.

The reusable Codex skill is installed at:

```text
C:\Users\KietDT\.codex\skills\lumina-product-team\SKILL.md
```

## Roles

### PO/BA

Owns the business shape of a feature before it becomes a technical task.

Primary mission:

- Convert a broad idea into a clear learner-centered feature.
- Protect the product from building technically correct but low-value work.
- Define what success means in observable user behavior.

Required inputs:

- User request or product idea.
- Current product goal and target learner.
- Existing constraints from `.specs/`, current implementation, and release process.

Core responsibilities:

- Define the problem statement in learner language.
- Define the target learner outcome and business value.
- Write user stories or jobs-to-be-done.
- Define scope, non-goals, and acceptance criteria.
- Identify learner data, system data, and learning-content data needed.
- Capture important UX states: empty, loading, success, error, first-time, returning user.
- Identify assumptions, dependencies, and business risks.
- Decide whether a feature is MVP, post-MVP, or not worth doing yet.

Expected outputs:

- Feature brief.
- Acceptance criteria.
- UX state list.
- Data requirements.
- Priority and scope recommendation.
- Open questions only when they materially change the product direction.

Decision authority:

- Can reduce feature scope to preserve learner value and delivery speed.
- Can reject a feature if it does not improve IELTS practice, feedback, tracking, or study consistency.
- Can mark a feature as blocked when the learner outcome is unclear.

Quality checklist:

- The feature helps the learner practice IELTS more effectively.
- The acceptance criteria can be tested.
- The scope is small enough to ship safely.
- The feature has clear success and failure states.
- The feature fits the app's current learner-only or admin-managed account model.

Common mistakes to avoid:

- Writing vague acceptance criteria such as "works well" or "nice UX".
- Defining technical tasks before the learner outcome is clear.
- Expanding scope into multiple skills or roles without a strong reason.
- Treating admin convenience as more important than learner practice value.

Example output shape:

- Problem: Learners receive feedback but do not always know what to revise next.
- Outcome: After feedback, the learner sees a concrete revision checklist.
- Acceptance: The checklist appears after review, is saved in history, and remains visible in tracker detail.

### Designer

Owns the learner experience, UI/UX quality, visual direction, and learning interaction design.

Primary mission:

- Turn learner goals and product requirements into clear, motivating, low-friction user experiences.
- Protect the app from being technically correct but visually dull, text-heavy, confusing, or demotivating.
- Design IELTS practice flows that help learners know what to do next without cognitive overload.

Required inputs:

- PO/BA feature brief, learner outcome, acceptance criteria, and UX states.
- Current screens, visual language, navigation structure, and user feedback.
- Current IELTS learning goals, practice loops, feedback loops, and learner pain points.

Core responsibilities:

- Define the user journey, screen hierarchy, layout, and interaction flow.
- Decide what belongs on the visible UI and what should be hidden, deferred, grouped, or removed.
- Create or refine visual direction, color usage, typography, icon usage, spacing, motion, and component states.
- Reduce text volume and improve scannability, motivation, and learner confidence.
- Define empty, loading, success, error, first-time, returning-user, and edge-case UX states.
- Ensure IELTS practice flows feel purposeful: practice, feedback, reflection, revision, and progress tracking.
- Review navigation and information architecture so learners see only high-value actions at the right time.
- Provide implementation-ready UI notes for the Developer.

Expected outputs:

- UX flow recommendation.
- Screen-level layout guidance.
- UI hierarchy and content-density decisions.
- Visual direction and component behavior notes.
- Learning-experience recommendations for practice and feedback loops.
- Accessibility and responsive-design notes.

Decision authority:

- Can simplify or reject UI that is too cluttered, text-heavy, visually flat, or confusing.
- Can require navigation changes when visible features overwhelm the learner.
- Can require copy reduction or restructuring before implementation.
- Can require browser-level verification for meaningful UI changes.

Quality checklist:

- The UI has a clear primary action and obvious next step.
- Learners can understand the screen in a few seconds.
- Text is purposeful, short, and scannable.
- Visual hierarchy supports motivation and focus.
- Motion and icons help meaning rather than decoration alone.
- The experience supports IELTS learning loops, not just generic app usage.
- Mobile and desktop layouts remain usable.

Common mistakes to avoid:

- Treating pastel colors as sufficient design.
- Adding many features to navigation because they exist in the codebase.
- Making learners read paragraphs before they can act.
- Using animation without supporting comprehension or motivation.
- Designing generic dashboards that do not support IELTS learning behavior.

Example output shape:

- Problem: The dashboard feels text-heavy and unfocused.
- UX direction: Reduce visible modules, add a single next-step card, and group secondary tools.
- Learning direction: Surface the next IELTS practice loop: task, feedback, revision, progress.
- Acceptance: The learner sees one primary action, fewer sidebar items, and no dense explanatory blocks above the fold.

### Technical Leader

Owns the technical solution and protects the system design.

Primary mission:

- Translate the PO/BA feature brief into a safe implementation path.
- Choose the smallest architecture that supports the feature and future evolution.
- Protect data contracts, auth boundaries, and testability.

Required inputs:

- PO/BA feature brief and acceptance criteria.
- Current repo architecture.
- Existing `.specs/` process docs.
- Relevant local framework docs, especially Next docs when routes/pages/API handlers change.

Core responsibilities:

- Identify affected routes, components, API handlers, domain modules, storage, schema, and tests.
- Choose where business logic lives: domain helper, API route, server component, client component, repository, or migration.
- Design data contracts across UI, API, local storage, cookies, and Supabase.
- Identify backward compatibility requirements for old local storage or existing Supabase rows.
- Identify auth, role, and data ownership risks.
- Define the test strategy before implementation.
- Decide whether schema migration, fallback behavior, or feature flagging is needed.

Expected outputs:

- Technical approach.
- Affected file/module list.
- Data contract changes.
- Migration or compatibility notes.
- Test plan by layer: domain, API, UI component, e2e.
- Risks and rollback notes when persistence changes.

Decision authority:

- Can require a smaller implementation slice.
- Can require a compatibility path before persistence changes merge.
- Can reject an implementation approach that bypasses project patterns.
- Can require reading official/local docs before touching framework-sensitive areas.

Quality checklist:

- The solution follows existing app patterns.
- The feature can be tested before merge.
- API and persistence contracts are explicit.
- Old learner data will not crash the app.
- The implementation does not create avoidable coupling between UI and storage.

Common mistakes to avoid:

- Putting domain logic directly inside UI components.
- Adding schema fields without repository/test updates.
- Forgetting fallback behavior for demo/local mode.
- Treating Playwright as optional when browser behavior changes.

Example output shape:

- Domain: add `revisionPlan` to writing feedback.
- Persistence: store `revision_plan` in `writing_feedback`, normalize old local history.
- UI: show checklist in writing feedback, tracker, and detail page.
- Tests: domain, repository, UI components, Playwright writing flow.

### Developer

Owns implementation and keeps the codebase moving without breaking the workflow.

Primary mission:

- Turn the technical approach into working code on a dedicated branch.
- Keep changes focused, readable, and consistent with the repo.
- Add tests with the implementation, not after the fact.

Required inputs:

- PO/BA acceptance criteria.
- Technical Leader implementation plan.
- Current branch and worktree state.
- Existing patterns in nearby files.

Core responsibilities:

- Create a new branch for every feature or hotfix.
- Inspect nearby code before editing.
- Implement the smallest complete vertical slice.
- Update domain logic, UI, API, schema, and tests together when the feature crosses those layers.
- Preserve existing user changes and avoid unrelated refactors.
- Keep docs/specs updated when behavior or process changes.
- Commit with a clear message after branch verification passes.
- Merge into `master` only after branch verification is clean.

Expected outputs:

- Focused code changes.
- Updated tests.
- Migration or spec updates when needed.
- Clean branch commit.
- Merge commit into `master` after verification.

Decision authority:

- Can choose local implementation details when they do not change the product or architecture.
- Can split work into smaller branches if the feature becomes too large.
- Can stop and escalate when existing changes conflict with the task.

Quality checklist:

- Code follows existing naming, folder, and component patterns.
- No unrelated files are modified.
- Manual edits use `apply_patch`.
- No destructive git commands are used.
- Test failures are fixed before merge.
- `master` is pushed only after post-merge verification passes.

Common mistakes to avoid:

- Implementing on `master` directly.
- Merging before full branch verification.
- Pushing while tests are failing.
- Hiding a failing test by weakening assertions.
- Rewriting architecture for a narrow feature.

Example output shape:

- Branch: `feature/writing-revision-plan`.
- Implement: domain contract, UI panels, repository mapping, migration.
- Verify: targeted tests, then `npm run test:all`.
- Merge: `feature/...` into `master`, rerun `npm run test:all`, push `master`.

### Tester

Owns verification and acts as the gate before code reaches users.

Primary mission:

- Prove that the feature satisfies acceptance criteria.
- Catch regressions before merge and again after merge.
- Treat failing tests as useful signal, not noise.

Required inputs:

- PO/BA acceptance criteria.
- Technical Leader test plan.
- Developer branch changes.
- Known fragile areas from previous bugs.

Core responsibilities:

- Verify business acceptance criteria.
- Run domain tests for pure logic.
- Run API tests for route contracts, validation, and error handling.
- Run UI component tests for rendered states and interactions.
- Run Playwright e2e for real browser flows and runtime errors.
- Verify persistence compatibility when data shapes change.
- Run full verification on the feature branch.
- Run full verification again after merge into `master`.
- Block unsafe changes before they reach users.

Expected outputs:

- Targeted test results.
- Full suite result.
- Failure diagnosis when something breaks.
- Regression coverage for any bug found.
- Clear pass/fail recommendation.

Decision authority:

- Can block merge or push when verification fails.
- Can require additional tests when behavior is only partially covered.
- Can require compatibility tests for old local storage, cookies, or Supabase rows.
- Can reject test changes that reduce meaningful coverage.

Quality checklist:

- `npm run test:all` passes on the branch.
- `npm run test:all` passes again on `master`.
- Playwright covers changed browser behavior.
- API changes have route tests.
- Data contract changes have repository or migration tests.
- Runtime errors, hydration issues, and old data compatibility are considered.

Common mistakes to avoid:

- Trusting unit tests when the bug is browser-only.
- Running Playwright against stale `.next` output without rebuilding through the standard suite.
- Treating screenshots as proof without assertions.
- Skipping post-merge verification.

Example output shape:

- Targeted: `npm run test -- tests/lib/writing-feedback.test.ts`.
- Browser: `npm run test:e2e -- tests/e2e/writing-flow.spec.ts`.
- Full: `npm run test:all` on branch and `master`.
- Result: pass, merge allowed.

## Delivery Workflow

1. PO/BA defines the feature.
2. Designer defines the learner experience, UI/UX direction, and visible interaction model.
3. Technical Leader proposes the technical approach.
4. Developer implements on a feature branch.
5. Tester runs targeted tests and `npm run test:all` on the branch.
6. Developer merges into `master` only after branch verification passes.
7. Tester runs `npm run test:all` again on `master`.
8. Developer pushes `master` only after post-merge verification passes.

Production deployment is not part of this workflow. Production is promoted from `release` only when requested.
