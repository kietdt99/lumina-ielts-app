# Deployment Process

## Goal

Define the safe production deployment workflow for Lumina IELTS.

## Branch Roles

- `master`: integration branch for completed and fully verified feature work
- `release`: production deployment branch
- `feature/*` and `hotfix/*`: implementation branches only

## Production Rules

- Never deploy to production directly from a feature branch.
- Never treat a merge into `master` as permission to deploy automatically.
- Only update `release` from a verified `master` commit.
- Production deployment should happen only after a fresh local run and full verification pass on `master`.

## Required Sequence

1. Implement and verify on a feature branch.
2. Merge into `master`.
3. Run the app locally on `master`.
4. Run the full verification suite on `master`.
5. If the `master` pass is clean and production is approved, fast-forward or merge `master` into `release`.
6. Deploy production from `release`.

## Required Verification

```bash
npm run test:all
```

Also smoke-check the routes affected by the release candidate in a real local browser session before updating `release`.

## Vercel Rule

- The Vercel project must use `release` as the production branch.
- `master` must not auto-deploy to production.
- Preview deployments may continue to exist for non-production branches if desired.

## Working Reference

- Use `.specs/release-checklist.md` as the step-by-step operator checklist for each production update.
