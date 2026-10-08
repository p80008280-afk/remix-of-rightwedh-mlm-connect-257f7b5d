# Righvedh Sanjivni

Official web platform for **Righvedh Sanjivni** — an Ayurveda wellness company offering pure herbal products and a direct-selling business opportunity across India.

## Features

- Product catalog with online ordering (UPI payment with proof upload)
- Member registration and login (mobile number / username / Member ID)
- Member dashboard: team tree, direct team, wallet, rewards, withdrawals, KYC
- Binary plan: direct commission, pair matching, 18-level rewards
- Admin panel: members, orders, withdrawals, products, plan settings, KYC review, top-up IDs
- Android app (APK) download

## Tech Stack

- React 19 + TanStack Start (Vite 7)
- Tailwind CSS v4
- Lovable Cloud (database, auth, storage)

## Development

Requires Node.js / Bun.

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```

## Deployment

- **Hostinger (Node):** `bash scripts/package-hostinger.sh` — see `HOSTINGER-DEPLOYMENT.md`
- **Netlify:** `bash scripts/package-netlify.sh` — see `NETLIFY-DEPLOYMENT.md`
