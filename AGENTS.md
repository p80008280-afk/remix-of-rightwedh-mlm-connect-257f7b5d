<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Reward payouts use the company-provided values directly with no additional GST because GST is already handled on the product.
- Admin actions use authenticated browser RPC calls so they work on external hosting without server environment variables.
- The Android APK is served from public/righvedh-sanjivni.apk (not a CDN asset pointer) because the site is also hosted outside Lovable, where /__l5e asset URLs 404.
- Browser database calls are relayed through the same-origin /sbp/* server route (src/lib/supabase-proxy.ts + src/routes/sbp/$.ts) because Indian ISPs (Jio/Airtel/ACT) block *.supabase.co; keep the relay when changing hosting. Write requests to paths ending in a file extension go via /sbp/_x?__p=<path> because Hostinger's CDN returns 404 for POST/PUT to *.jpg/*.png URLs. installSupabaseProxy() must be called explicitly from __root.tsx (never a bare side-effect import) because package.json "sideEffects": false strips bare imports from production builds; verify relay changes against a production build, not the dev server.
