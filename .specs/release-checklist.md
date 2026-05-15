# Release Checklist

Use this checklist every time production needs to be updated.

## Before Release

- Confirm the target code is already merged into `master`.
- Pull the latest `master`.
- Start the app locally from `master`.
- Smoke-check the routes affected by the release.
- Run the full verification suite:

```bash
npm run test:all
```

## Promote to Release

- Confirm the `master` verification pass is clean.
- Confirm production deployment is intentionally approved.
- Update `release` from `master` using a PR from `master` to `release`.
- Merge the PR only after reviewing the commit range.

## After Release

- Confirm Vercel created a new production deployment from `release`.
- Open the live app and smoke-check the affected routes again.
- If a production issue is found, fix it on a new branch, merge to `master`, verify again, and then promote `master` to `release` once more.
