# Righwedh Sanjivni — Premium MLM Website Plan

Ek complete MLM platform banayenge — Ayurveda theme (green + gold, jaisa aapke logo mein hai) ke saath premium look. Backend ke liye Lovable Cloud enable karenge (database + auth + storage).

## Design Direction
- **Theme:** Premium Ayurveda — deep forest green (#1a4d2e types), royal gold accents, cream/ivory background
- **Fonts:** Playfair Display (headings, serif — logo jaisa) + Inter (body)
- **Logo:** Aapka uploaded RS Righwedh Sanjivni logo header/footer/login mein use hoga
- **Feel:** Luxury herbal brand + modern SaaS dashboard

## Public Pages (before login)
1. **Home / Landing** — hero, company intro, plan overview, featured products, testimonials, CTA
2. **About Us** — Righwedh Sanjivni story, mission, founder (Kartik Tirgar)
3. **Products** — product catalogue with images, price, BV (business volume)
4. **Business Plan** — binary MLM plan explanation with tree diagram
5. **Contact** — address (Pratapgarh Chotisadri), phone (8619990944), email, 24-hour timing
6. **Login / Register** — register sirf sponsor referral link se (…/register?ref=SPONSORID)

## User Dashboard (after login)
1. **Dashboard home** — wallet balance, total team, left/right leg BV, today's income, rank
2. **My Profile** — personal, KYC, bank details, profile pic
3. **Genealogy (Tree View)** — interactive binary tree; har node par **"+" button** jisse us position (left/right) par naya member add/invite kar sake (aapki requirement)
4. **Direct Team** — direct sponsored list
5. **Downline** — full downline list with level filter
6. **Products / Shop** — products browse + order (order = BV = commission trigger)
7. **My Orders** — order history
8. **Income Reports:**
   - Direct/Sponsor income (A ne B ko sale kiya → A ko commission; A ne C ko sale kiya → A ko commission)
   - Pair/Matching income (jab B aur C dono ka BV match ho → upar wale (A) ko pair commission)
   - Level income, Rank bonus
9. **Wallet & Withdrawal** — balance, withdraw request, transaction history
10. **Referral link** — copy karke share
11. **Support / Tickets**

## Admin Panel
- Members list, KYC approval, product manage (CRUD), order manage, commission settings (direct %, pair ratio, capping), withdrawal approve/reject, announcements, reports

## Commission Logic (aapke bataye anusaar)
- **Direct/Sale commission:** Jab bhi koi member (A ka direct B ya C) product buy kare → A ko fixed % commission
- **Pair/Binary matching:** Left leg (B side) aur Right leg (C side) ka BV match hone par upar wale ko pair commission (e.g., 10% of matched BV), carry-forward unmatched BV
- **"+" option:** Har member apne tree me kisi bhi empty left/right slot par plus button dabakar new member invite/add kar sake — same structure recursively
- Capping, daily cap, minimum pair BV — admin configurable

## Tech Stack
- TanStack Start (already set up) + React + Tailwind v4 + shadcn
- Lovable Cloud (Supabase) — auth, Postgres DB, RLS
- Tables: `profiles`, `user_roles` (admin/user), `sponsors_tree` (user_id, sponsor_id, parent_id, position left/right), `products`, `orders`, `order_items`, `wallet_transactions`, `commissions`, `withdrawals`, `settings`
- Binary tree stored with parent_id + position; recursive queries for downline
- Postgres trigger/function on order insert → generate direct + pair commissions + credit wallets
- react-d3-tree ya custom SVG for genealogy visualisation with "+" nodes

## Delivery Plan (phased in this build)
**Phase 1 (this turn):** Enable Cloud, design system (green+gold Ayurveda), landing page, About, Products showcase, Business Plan, Contact, header/footer with logo
**Phase 2:** Auth (register with sponsor ref, login), user dashboard shell, profile
**Phase 3:** Binary tree schema + genealogy view with "+" invite, downline lists
**Phase 4:** Products + orders + BV
**Phase 5:** Commission engine (direct + pair) + wallet + withdrawal
**Phase 6:** Admin panel + reports + polish

Har phase ke baad aapko preview milega, feedback lekar aage badhenge. Approve karein toh Phase 1 se start karta hu.
