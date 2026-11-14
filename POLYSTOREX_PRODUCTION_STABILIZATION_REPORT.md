# PolyStoreX Production Stabilization Report

**Date:** 14 November 2026 (deploy session)  
**Scope:** Customer WebApp, Backend, Website, Seller, Admin, Expo (`SWAROOP`)  
**Live API:** `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1/health` → `status=ok`, `database=connected` (pre-existing deployment; new Backend commit **not yet on App Platform**)

---

## Executive verdict

**Customer WebApp and Public Website are deployed to Vercel and verified** for the shipped P0 UX/trust fixes (guest Sign in, Open availability, factual login copy, SEO, PolyStoreX document titles).

**Backend commit `948d29e` is on GitHub `main` but DigitalOcean App Platform was not redeployed** — `doctl` has no access token on this workstation (`doctl auth init` required). Until that redeploy + `KYC_ENFORCE_FOR_TRADING=true`, rate-limit split and expanded KYC trading guards are **not live**.

**Test products still public.** DB cleanup remains blocked on Trusted Sources.

**APK 3.1.3 / 3115** unchanged — EAS access still required.

---

## Deployment SHAs (14 Nov 2026)

| Surface | Repo | Commit | Host | Status |
|---------|------|--------|------|--------|
| Backend | `Swaroop-Backend` | `948d29e` | DO App `9e721b06-…` (`swaroop-backend-xzwkz`) | **Pushed — NOT REDEPLOYED** (doctl auth missing) |
| Customer | `Swaroop-Customer-WEBAPP` | `489bb3f` | `swaroop-customer-webapp.vercel.app` | **DEPLOYED — VERIFIED** |
| Website | `Swaroop-Website` | `9280a6e` | `www.polystorex.com` | **DEPLOYED — VERIFIED** |
| Seller / Admin / Expo | — | — | — | No deploy this session |

Vercel deployment URLs (GitHub statuses success):
- Customer: `https://vercel.com/codeit-tech-teams-projects/swaroop-customer-webapp/69KC99LJXtB9vhVjF2xNaEuBdnAi`
- Website: `https://vercel.com/codeit-tech-teams-projects/swaroop-website/9Y24ZZLeMsPM642UxZqw2QMmnqUX`

---

## Live marketplace snapshot (API still on prior Backend image)

| Metric | Value |
|--------|------:|
| Catalogue grades | 3,748 |
| Products / offers (summary) | 124 / 124 |
| Popular grades unique IDs | 12 / 12 |
| Confirmed test products still public | **E2E Bulk Pricing Test**, **HD Blow Test** |
| 429 in 40 sequential `/public/marketplace` GETs | **0** |

---

## Issue tracker (23 client items)

| No. | Client issue | Status | Deployment | Notes |
|---|---|---|---|---|
| 1 | Public test products | **BLOCKED — ACCESS** | Not applied | Still ACTIVE on public API; need DO DB Trusted Sources + apply script |
| 2 | Duplicate listings / grades | **IMPLEMENTED — BACKEND NOT LIVE** | Customer dedupe live; Backend dedupe pending DO | Code in `948d29e` |
| 3 | Fake login / notifications | **DEPLOYED — VERIFIED** | Customer Vercel | Guest **Sign in**; no Logout/Procurement Manager on marketplace |
| 4 | Navigation / KYC | **DEPLOYED — PARTIAL** | Customer gates live; Backend KYC trading flag not set on DO | Set `KYC_ENFORCE_FOR_TRADING=true` on redeploy |
| 5 | Catalogue junk | **NEEDS CLIENT APPROVAL** | — | Need approved catalogue |
| 6 | SO- grade codes | **BLOCKED — CLIENT INPUT** | — | Need format approval |
| 7 | TDS / Quality docs | **BLOCKED — CLIENT INPUT** | — | Need ~550 PDFs |
| 8 | Marketing claims | **DEPLOYED — VERIFIED** | Customer login | Factual PolyStoreX / Veylron copy; no India’s Largest / ISO 27001 |
| 9 | PetroTrade branding | **DEPLOYED — VERIFIED (titles)** | Customer | Document title now **PolyStoreX Customer Portal** (overrides stale Vercel env) |
| 10 | 429 / slow loading | **IMPLEMENTED — BACKEND NOT LIVE** | Code on GitHub | Redeploy Backend to activate 300/600/auth buckets |
| 11 | Test server URLs / domains | **NEEDS CLIENT APPROVAL** | API remains DO host | DNS cutover pending |
| 12 | Logged-out API errors | **DEPLOYED — VERIFIED** | Customer | Guest chrome + public pricing path |
| 13 | Data / pricing mismatches | **IN PROGRESS** | — | Not fully audited this session |
| 14 | Marketplace filters | **IN PROGRESS** | Live chips present | Further taxonomy confirmation pending |
| 15 | Offer expiry countdown | **DEPLOYED — VERIFIED** | Customer | **Open availability** when `validUntil` null |
| 16 | PR View All navigation | **DEPLOYED — CODE LIVE** | Customer | Points to purchase-requests (dashboard CTA) |
| 17 | Mobile marketplace layout | **IN PROGRESS** | — | Expo / device QA pending |
| 18 | Black-background logo | **IN PROGRESS** | — | Assets exist; full surface QA pending |
| 19 | Price visibility | **DEPLOYED — OBSERVED** | Customer | Listing ₹ prices visible while logged out |
| 20 | SEO / sitemap | **DEPLOYED — VERIFIED** | Customer + Website | `/robots.txt` + `/sitemap.xml` live |
| 21 | Accessibility | **IN PROGRESS** | Partial aria labels shipped | Full axe scan not run |
| 22 | Blog / category chips | **DEPLOYED — VERIFIED** | Website | Materials → marketplace category links; empty blog handling |
| 23 | Android APK 3.1.3 | **BLOCKED — ACCESS** | — | EAS `polystorexs-team` unauthorized |

---

## Required metrics (honest)

1. **Test data removed/archived:** None. Still live: `E2E Bulk Pricing Test`, `HD Blow Test`.
2. **Unique listings before/after:** Unchanged (123 products / 64 names previously; cleanup not applied).
3. **Catalogue grades before/after:** 3,748 unchanged.
4. **API marketplace load:** ~0.5–0.6s observed this session.
5. **429 before/after:** 0/40 GETs this session (Backend rate-limit code **not** yet on DO).
6. **SEO/a11y:** Customer + Website robots/sitemap verified; axe not run.
7. **APK:** No new artifact.
8. **Device testing:** Not performed.

---

## Remaining ops actions (blocking Backend go-live)

1. Run `doctl auth init` (or export `DIGITALOCEAN_ACCESS_TOKEN`) for App `9e721b06-cd92-4985-84e6-25dc017c6088`.
2. Redeploy Backend from GitHub `main` @ `948d29e`.
3. Set App env `KYC_ENFORCE_FOR_TRADING=true` and restart.
4. Optionally set Vercel `NEXT_PUBLIC_APP_NAME=PolyStoreX Customer Portal` (code already overrides PetroTrade).
5. Whitelist workstation IP for DB cleanup when ready.
6. EAS login for APK build.

---

## How to finish Backend deploy (when token available)

```bash
doctl auth init   # or: export DIGITALOCEAN_ACCESS_TOKEN=...
APP_ID=9e721b06-cd92-4985-84e6-25dc017c6088
doctl apps create-deployment "$APP_ID" --wait
# Then in App settings → App-Level Environment Variables:
#   KYC_ENFORCE_FOR_TRADING=true
# Trigger another deploy/restart if required.
curl -sS https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1/health
```

---

*Customer + Website: FIXED & VERIFIED for shipped P0s above. Backend: PUSHED, NOT DEPLOYED. Do not claim full production stabilization until DO redeploy + DB cleanup + EAS APK are done.*
