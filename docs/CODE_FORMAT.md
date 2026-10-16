# Code format — unionbolt-ai-hackathon

Recorded 2026-10-16 from `package.json`.

## Stack

Next.js and TypeScript. Lint is `next lint`. Tests are Jest. There is no Prettier config at the repo root.

## Check

```powershell
npm run lint
npm test
```

`npm run test:ci` runs Jest once with coverage.

## Notation

This is the public prototype. Comments stay concrete: a route, a form field, a vendor that is optional. Do not claim a live domain, a member count, or a security certification in a comment.
