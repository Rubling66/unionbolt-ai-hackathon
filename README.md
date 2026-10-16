# Union Bolts — public prototype

In-progress member software: safety notes, grievances, and contract questions. This repository is the public prototype. The newer private build is `unionbolts-platform-v2`.

`package.json` sets `homepage` to `https://unionbolts.com`. This README does not treat that domain as a launched product. The dconsult page that links here says the same: in progress, and the product site is not claimed live.

## Stack in this repo

- Next.js, React, TypeScript
- Tailwind CSS and Radix UI
- Jest (`npm test`)
- Pinecone client, Daily, PayPal, and Google Pay packages are dependencies

Lint is `npm run lint` (`next lint`). Tests are `npm test`. Code format is recorded in `docs/CODE_FORMAT.md`.

## Run

```powershell
npm install
npm run dev
```

## Notation

Say what the screen does. Do not write a member count, a security certification, or "revolutionary" in code comments or in this file. A comment records a routing rule or a reason a vendor call stays behind a flag.
