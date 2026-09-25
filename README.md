# Kerta Pusaka AI OS — Phase 1

This is the first build of the "INPUT ONCE, DATA MOVES ITSELF" system for PT Kerta Pusaka
Indonesia. It's a real, working Next.js + Supabase app — not a mockup — but scoped to the
foundation plus one complete module, so quality stays high and you can steer before more gets built.

## What's included in this phase
- Full project scaffold: Next.js 14 (App Router), TypeScript, Tailwind, PWA-ready
- Complete Supabase schema for **all 11 modules** — every table from your spec, plus row-level
  security, indexes, and automatic timestamps
- Login (Supabase Auth)
- Dashboard home with live stats (leads, active projects, open alerts, net cashflow)
- **Leads (CRM): fully working** — list view and an add-lead form, backed by real database calls
- Placeholder screens for Projects, RAB, Materials, Daily Reports, QC, Finance, Photos, AI Alerts,
  and the Knowledge Base, so the whole app's shape is visible and nothing 404s

## What's NOT built yet
The OpenAI integration (AI Watchdog, daily briefings, RAG search), WhatsApp/webhook automation, and
the working screens for the 9 placeholder modules above. These come in the next phases.

## Setup — no coding experience needed, just follow in order

1. **Install Node.js** — get the LTS version from nodejs.org if you don't already have it.
2. **Create a Supabase project** — go to supabase.com, create a free project, and wait for it to
   finish setting up.
3. **Run the database schema** — in your Supabase project, open **SQL Editor**, paste in the
   entire contents of `supabase/schema.sql`, and click **Run**.
4. **Get your API keys** — in Supabase, go to **Project Settings > API**. You'll need the
   Project URL and the `anon` public key now (and the `service_role` key later, for AI features).
5. **Set up your environment file** — copy `.env.local.example` to a new file named `.env.local`
   in this same folder, and paste in the values from step 4.
6. **Install dependencies** — open a terminal in this folder and run:
   ```
   npm install
   ```
7. **Run it**:
   ```
   npm run dev
   ```
   then open http://localhost:3000 in your browser.
8. **Create your first login** — in Supabase, go to **Authentication > Users > Add user** and
   create yourself an account with an email and password. A matching profile row is created for
   you automatically. It defaults to the `site_supervisor` role — open the `profiles` table in
   Supabase's Table Editor and change your own row's `role` to `owner`.

## Notes on decisions I made
- **Role-based access** is wired up per the six roles in your schema, with reasonable defaults —
  e.g. financial data (cashflows) is only visible to owner/finance/project_manager. All of it lives
  in the RLS policies at the bottom of `supabase/schema.sql` and is easy to adjust.
- **`lead_code` / `project_code`** are generated automatically (`LEAD-000001`, `PRJ-000001`) so
  nobody has to invent or type them.
- **Material stock and project progress now update themselves**: logging a material transaction
  adjusts `current_stock` automatically, and submitting a daily report adds its `progress_increment`
  to the project's `progress_percentage`. This wasn't explicit in your original spec but follows
  directly from "data moves itself" — remove the two triggers in the schema if you'd rather control
  this by hand.
- The PWA icon (`public/icons/icon.svg`) is a placeholder — swap it, and add real 192×192 /
  512×512 PNGs, before you install this to a home screen for real.
- Your spec named `next-pwa`, which is what's wired into `next.config.js`. If you hit compatibility
  issues on a newer Next.js version later, `@ducanh2912/next-pwa` is a well-maintained,
  drop-in alternative.

## What's next
The natural build order from here is: **Projects & RAB** (turn a deal into a tracked project) →
**Materials & Daily Reports** (the field PWA workflows) → **Finance** → **AI Watchdog & Knowledge
Base** (the OpenAI + RAG layer) → **WhatsApp/webhook automation**. Tell Claude which one to build
next.
