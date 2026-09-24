# Product commission and Hostinger upload folder

## Goal
Update the Aaurva product to ₹500 direct commission and ₹500 pair matching, then provide one ready-to-upload static `dist` ZIP for Hostinger `public_html`.

## Changes
- Update the live product record so future approved orders use ₹500 direct and ₹500 pair payouts.
- Replace the old ₹900/₹300 values across the homepage, product page, plan page, terms, and admin product defaults.
- Convert the remaining member/admin actions from same-server calls to protected database calls so login, registration, dashboard, tree, rewards, orders, withdrawals, and admin actions work from a static Hostinger upload.
- Add a static build configuration plus Hostinger rewrite file for direct links such as `/login`, `/dashboard`, and `/admin`.
- Build and package the exact `dist` contents into an upload-ready ZIP with brief upload instructions.

## Security
- Keep administrator authorization enforced by the database.
- Include only the public browser connection details needed by the site; no private database credential will be placed in the folder.

## Verification
- Confirm the live product values are ₹500 and ₹500.
- Test the static folder locally, including direct route refreshes, member login, admin login, live reads, and protected actions where safe.
- Confirm the ZIP contains the website files at its root, ready to extract into `public_html`.
