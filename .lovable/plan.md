# Hostinger folder-upload version

## Goal
Create a production folder that can be uploaded to the Hostinger temporary domain and still use the existing live database for members, products, orders, rewards, wallets, and uploads.

## What will change
- Add a separate static production build for Hostinger while keeping the current application source and screens.
- Replace same-server calls with authenticated database operations that work from the browser on Hostinger.
- Preserve mobile/password login, registration, member dashboard, shop, checkout, image uploads, admin records, order and withdrawal review, member status, products, rewards, and tree views.
- Add Hostinger rewrite configuration so `/login`, `/dashboard`, and `/admin` open correctly after refresh.
- Produce one upload-ready ZIP/folder and a short setup note for the temporary Hostinger domain.

## Security and data
- Continue using the current live database; existing 20 members, six products, settings, and future orders remain in one place.
- Keep admin access role-checked in the database; no private database key will be placed in uploaded files.
- Move eligible admin actions to protected database functions so a visitor cannot perform them by editing browser data.
- Keep public configuration in the compiled site only where it is intended for browser use.

## Important limitation
The current “admin sets another member’s login password” action requires a private server credential that Lovable Cloud does not expose. The Hostinger folder-upload version will keep normal member login and registration, but this one action will be disabled or changed to a safe self-reset flow. Everything else listed above will be migrated and tested.

## Verification
- Test the Hostinger-style static build locally at desktop and mobile sizes.
- Test member login, admin login, live database reads, one safe write flow, direct URL refresh, and image loading.
- Confirm no perpetual loading screen and provide the exact folder contents to upload into `public_html`.
