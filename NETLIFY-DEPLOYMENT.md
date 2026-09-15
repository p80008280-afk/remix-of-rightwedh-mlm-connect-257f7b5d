# Netlify deployment

This application uses server functions (admin panel, registration, orders, withdrawals, rewards, tree, uploads). Netlify drag-and-drop upload only deploys static files, so **use Git integration or the Netlify CLI** — do not use the "Upload your project files" box.

## Recommended: connect GitHub

1. Push this project folder to a GitHub repository.
2. In Netlify, click **Add new site → Import an existing project → GitHub**.
3. Pick the repository. Netlify will auto-detect:
   - Build command: `bun install && bun run build:netlify`
   - Publish directory: `dist`
4. Click **Deploy**.

## Required environment variables

Go to **Site settings → Environment variables** and add:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL` (same value as `SUPABASE_URL`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (same value as `SUPABASE_PUBLISHABLE_KEY`)
- `NODE_ENV=production`

The service-role key must stay in Netlify environment variables only — never commit it.

## Alternative: Netlify CLI

Install and deploy from your local machine:

```bash
npm install -g netlify-cli
netlify login
netlify link
netlify deploy --build --prod
```

The CLI reads `netlify.toml` and uses the same build command and environment variables.

## Health check

After deploy, open `/login`, sign in, refresh `/dashboard` directly, and verify the Admin pages.
