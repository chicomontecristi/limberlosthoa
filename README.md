# Limberlost HOA Portal

Static-first owner portal for the Limberlost HOA (45 properties). Built for a non-technical administrator and an owner population aged 65+.

## Stack
- **Next.js 14** (App Router, static export)
- **Cloudflare Pages** (hosting + CDN, free tier)
- **Decap CMS** at `/admin` (Git-based editorial UI)
- **Supabase** — Postgres + Auth (magic link) + Storage
- **Resend** for mass announcements
- **Porkbun** → Cloudflare DNS

See `/docs` for the full architecture blueprint, schemas, auth flow, sprint schedule, and client handover runbook.

## Quick start (developer)
```powershell
cd C:\Users\JoseChavez\Desktop\Limberlost-HOA
npm install
copy .env.example .env.local   # then fill in real Supabase + Resend values
npm run dev
```
Open http://localhost:3000.

## Build for production
```powershell
npm run build
```
The static site is produced in `/out`. Cloudflare Pages builds this automatically on every push to `main`.

## Deployment
- **Cloudflare Pages** (recommended, free): connect this repo, build command `npm run build`, output directory `out`.
- **Vercel** (fallback): delete `output: 'export'` in `next.config.mjs`, push, Vercel auto-deploys.

## Project structure
```
app/                  Next.js app router
  page.tsx             Public homepage
  contact/             Public contact
  login/               Magic-link sign-in
  portal/              Authenticated owner dashboard (docs, events, members, dues)
  admin/               Admin tools (dues, mass email)
components/           Shared UI (Header, Footer, buttons, nav)
content/              Markdown content managed by Decap CMS
  events/              One file per event
  docs/                One file per HOA document
  members/             One file per board/community member
  home.md              Homepage content
  contact.md           Contact page content
lib/                  Supabase client, content loaders
public/admin/         Decap CMS single-page app + config.yml
supabase/migrations/  SQL DDL (run in Supabase SQL editor on day one)
docs/                 Architecture blueprint & client runbook (Word docs)
```

## First-time Supabase setup
1. Create a Supabase project at supabase.com.
2. Open SQL Editor → paste `supabase/migrations/0001_initial.sql` → Run.
3. Copy the project URL and `anon` key into `.env.local`.
4. Copy the `service_role` key into Cloudflare Pages → Settings → Environment Variables (encrypted).
