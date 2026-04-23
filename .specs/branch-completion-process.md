# Branch Completion Process

## Goal

Define the mandatory workflow that must happen every time a feature or fix is completed on a branch.

This process exists to prevent skipped checks, reduce regressions, and keep `master` stable.

## Mandatory Workflow

1. Implement the task on a new branch.
2. Run the app locally on that branch.
3. Run the full verification suite on that branch.
4. Fix every failing test, build issue, lint issue, or runtime issue before merging.
5. Merge the branch into `master`.
6. Run the app locally again on `master`.
7. Run the full verification suite again on `master`.
8. Only after the `master` verification pass is clean can the work be considered complete.

## Required Verification Commands

The minimum required verification pass is:

```bash
npm run test:all
```

This includes:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

## Local Run Requirement

Before merge and after merge, the app must also be started locally to confirm the branch is usable in a real browser session.

Recommended local run command:

```bash
npm run dev
```

At minimum, smoke-check the routes affected by the branch.

## Merge Rules

- Never implement directly on `master`.
- Never merge a branch with known failing tests.
- Never merge a branch with known runtime errors.
- Never treat "tests passed once earlier" as enough after more changes were made.
- If a test fails during the branch verification pass, fix it on that branch first.
- If a test fails after merge on `master`, fix it immediately before continuing new feature work.

## Deployment Rules

- Production deployment is allowed from `master` only.
- Feature branches are for local development and verification only.
- Deployment should happen only after the `master` verification pass is complete.

## Documentation Rules

- Permanent implementation specs belong in `.specs/`.
- Temporary notes, scans, and working summaries belong in `.specs/temp/`.
- `.specs/temp/` should stay out of GitHub to avoid repository noise.

## Operating Reminder

For every branch, follow this exact sequence:

1. build on branch
2. run locally on branch
3. run full verification on branch
4. merge to `master`
5. run locally on `master`
6. run full verification on `master`

Do not skip steps even for small fixes.
