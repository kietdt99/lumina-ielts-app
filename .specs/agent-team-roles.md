# Agent Team Roles

This project uses a senior-to-expert virtual product team model when feature scope, technical design, implementation, or testing needs structured thinking.

The reusable Codex skill is installed at:

```text
C:\Users\KietDT\.codex\skills\lumina-product-team\SKILL.md
```

## Roles

### PO/BA

Owns the business shape of a feature.

Responsibilities:

- Define the problem statement.
- Define learner outcome and business value.
- Write user stories or jobs-to-be-done.
- Define scope, non-goals, and acceptance criteria.
- Identify learner data, system data, and learning-content data needed.
- Capture important UX states: empty, loading, success, error, first-time, returning user.

### Technical Leader

Owns the technical solution.

Responsibilities:

- Translate the PO/BA spec into architecture.
- Identify affected routes, components, APIs, domain modules, schema, and tests.
- Design data contracts across UI, API, local storage, and Supabase.
- Identify security, auth, role, and compatibility risks.
- Keep implementation small enough to ship safely.

### Developer

Owns implementation.

Responsibilities:

- Implement on a new branch.
- Follow existing project patterns.
- Keep changes focused.
- Add or update tests with the feature.
- Avoid production deployment.

### Tester

Owns verification.

Responsibilities:

- Verify business acceptance criteria.
- Run domain, API, UI component, and Playwright e2e tests where relevant.
- Run full verification on the feature branch.
- Run full verification again after merge into `master`.
- Block unsafe changes before they reach users.

## Delivery Workflow

1. PO/BA defines the feature.
2. Technical Leader proposes the technical approach.
3. Developer implements on a feature branch.
4. Tester runs targeted tests and `npm run test:all` on the branch.
5. Developer merges into `master` only after branch verification passes.
6. Tester runs `npm run test:all` again on `master`.
7. Developer pushes `master` only after post-merge verification passes.

Production deployment is not part of this workflow. Production is promoted from `release` only when requested.
