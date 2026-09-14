# Hostinger deployment

This application is a Node Web App, not a plain `public_html` website. Its admin actions, registration, tree, rewards, orders, withdrawals, and password operations need the included server process.

## Upload

1. Open **Hostinger hPanel → Websites → Add website → Node.js Web App**.
2. Download the generated `hostinger-upload.zip`, upload it, and extract it as the application source.
3. Select **Node.js 22**.
4. Set the start command to `npm start` (entry file: `.output/server/index.mjs`).
5. Add the environment variables listed below in hPanel. Never put the service-role value in frontend files.
6. Deploy, then connect `lime-giraffe-256167.hostingersite.com` to this Node Web App.

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL` (same value as `SUPABASE_URL`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (same value as `SUPABASE_PUBLISHABLE_KEY`)
- `NODE_ENV=production`

The actual secret values are intentionally not stored in this archive or repository. Copy them from the project environment into Hostinger's Environment Variables screen.

To create a fresh archive after future code changes, run `bun run hostinger:package` from the project folder.

## Health check

After deployment, open `/login`, sign in, refresh `/dashboard` directly, and verify the Admin pages. If Hostinger shows a static `public_html` upload screen instead of Node Web App settings, that hosting plan cannot execute this application's secure backend.