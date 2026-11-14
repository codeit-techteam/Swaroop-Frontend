# PolyStoreX — Complete Multi-Repository Production Audit

**Audit date:** 14 November 2026  
**Phase:** 0 — Inspect only (no fixes implemented in this phase)  
**Auditor role:** Full-stack / backend / database / QA / release engineering  
**Honesty rule:** Status requires code, API, artifact, or deployment evidence. Prior `POLYSTOREX_*` notes were cross-checked and **not** trusted alone.

---

## Executive summary

The PolyStoreX platform is a six-repo B2B petrochemical marketplace: Expo mobile, Customer/Seller/Admin Next.js apps, NestJS+Prisma backend, and a Sanity-backed marketing site. All clients target DigitalOcean API host `swaroop-backend-xzwkz.ondigitalocean.app`.

**Production API is live** (health OK, DB connected, MSG91 OTP configured). Live catalogue evidence from 14 Nov 2026:

| Metric | Live value |
|--------|------------|
| Active marketplace products | **123** (API `meta.total` briefly reported 124; full page fetch returned 123) |
| Unique product names | **64** |
| Unique product codes | **65** |
| Customer-visible grades | **3,748** |
| Grades with `SO-` in search | **3,666** |
| Product manufacturers (customer API) | **PRIVATE** for all 123 |
| Test products still public | **E2E Bulk Pricing Test**, **HD Blow Test** (both `ACTIVE`) |

**Headline:** Many Customer WebApp and Backend fixes exist on `main`, but **most P0/P1 buyer UX fixes are not independently proven on Vercel**, production DB cleanup is **blocked** (local `DATABASE_URL` → `localhost:5433`), and **no 3.1.3 APK artifact exists** (EAS org access blocked). Issue **#8 marketing claims** are removed in source **and** absent from live `polystorex.com` / Vercel HTML. Grade-list `PRIVATE` sanitize is **confirmed on live API**.

### Status rollup (23 issues)

| Status | Count |
|--------|------:|
| DONE | 1 |
| PARTIALLY DONE | 17 |
| NOT DONE | 3 |
| BLOCKED | 2 |
| NEEDS VERIFICATION | 1 |

---

## Repository-wise findings

### 1. SWAROOP (Expo React Native Customer App)

| Item | Evidence |
|------|----------|
| Stack | Expo SDK 58, RN 0.88, expo-router, TanStack Query, Zustand |
| Version in tree | **3.1.3** / Android **3115** — `app.config.ts`, `eas.json` |
| Package ID | `com.swaroop.app` (unchanged) |
| API env | `EXPO_PUBLIC_API_BASE_URL` → DO `/api/v1` in EAS prod profiles |
| APK artifacts on disk | Oldest–newest: 3.0.x RCs; newest **`PolyStoreX-3.1.1-preview3113.apk`**. **No 3.1.2 or 3.1.3 APK/AAB** |
| EAS | Project `polystorex` / owner `polystorexs-team`; docs report **Entity Not Authorized** for current Expo login |
| Outstanding | Mobile marketplace sticky filters (#17), logged-out home API calls (#12), KYC hard redirects (`src/navigation/guards.tsx`) |
| Git | `main` clean except untracked prior audit MD files |

### 2. Swaroop-Customer-WEBAPP

| Item | Evidence |
|------|----------|
| Stack | Next.js 15.5, React 19 |
| Recent commits (14 Nov) | Guest/KYC/offer expiry (`10a5075`), a11y build fix (`c517f9a`), PetroTrade app-name ignore (`489bb3f`) |
| Strengths in code | Middleware no longer silent-redirects incomplete KYC; `KycFeatureGate`; notification store no longer seeds mocks; catalog mapper stops fabricating 365-day expiry; marketplace dedupe helpers |
| Gaps | Buy Now without full KYC UI gate; mock catalogs still in repo; `petrotrade.*` storage keys; weak KYC gate (`onboardingCompleted \|\| gstVerified`); no automated tests |
| Deploy | Live login shows PolyStoreX / Sign in. **Exact Vercel commit vs `489bb3f` not confirmed** → treat UX fixes as **LOCAL ONLY** until Vercel deploy evidence |

### 3. Swaroop-seller-Webapp

| Item | Evidence |
|------|----------|
| Stack | Next.js 15 |
| Git | `main` with **1 uncommitted** change: `modules/finance/credit-insurance-view.tsx` |
| Branding | PolyStoreX logo applied; 0 `PetroTrade` source hits |
| Tests | Vitest dependency present; no `test` script / specs found |

### 4. Swaroop-ADMIN

| Item | Evidence |
|------|----------|
| Stack | Next.js 15 |
| Role | Grades visibility (`CUSTOMER_HIDDEN`), credit ops, catalogue |
| Mock remnant | `lib/mock-data/push-notifications.ts` (Navratri sample) — admin mock UI, not customer feed |
| Deploy host | Documented `swaroop-admin-pi.vercel.app` |

### 5. Swaroop-Backend

| Item | Evidence |
|------|----------|
| Stack | NestJS 12, Prisma 7, PostgreSQL, Vitest |
| Live host | `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1` — **health verified 14 Nov 2026** |
| Confirmed live behaviour | Blind products + grades `manufacturer: PRIVATE`; codes like `SO-ABS-3000D-PRIVATE-DD7728`; OTP MSG91 strict |
| Local DB | `DATABASE_URL` host **`localhost:5433`** — **production DB not queryable** from this workspace |
| No `.do/app.yaml` in Backend repo | Deploy mechanism via Dockerfile + `prisma migrate deploy`; **deployed git SHA unknown** (health has no build id) |
| Tests run this audit | `blind-marketplace.mapper.spec.ts` — **19/19 passed** |
| Outstanding | Test-product soft-deactivate not applied; junk grades still `customerVisible`; PetroTrade credit copy (~43 hits); `KYC_ENFORCE_FOR_TRADING` defaults **false** |

### 6. Swaroop-Website

| Item | Evidence |
|------|----------|
| Stack | Next.js 15 + Sanity |
| Live claims check | `www.polystorex.com` and `swaroop-website.vercel.app` HTML: **0** matches for client’s unverified superlatives / ISO / PetroTrade |
| Gaps | Blog empty without Sanity project id; `/materials` polymer tags not linked; sitemap has no grade URLs (grades live on customer app) |

---

## Numbered issue status (summary)

| # | Issue | Status | Deploy tag |
|---|--------|--------|------------|
| 1 | Test products in marketplace | **NOT DONE** | Live API still ACTIVE |
| 2 | Duplicate listings / recommended grades | **PARTIALLY DONE** | Live 123/64 confirmed; dedupe incomplete |
| 3 | Fake auth / notifications | **PARTIALLY DONE** | Code fixed; **LOCAL ONLY** / session QA needed |
| 4 | Broken navigation / KYC / Buy Now | **PARTIALLY DONE** | Code fixed; Buy Now + env enforce gaps |
| 5 | Grade Directory PRIVATE + junk | **PARTIALLY DONE** | PRIVATE **DEPLOYED**; junk still live |
| 6 | SO- grade codes | **BLOCKED** | Awaiting client target format |
| 7 | TDS / Quality Documentation | **PARTIALLY DONE** | UI gates exist; ~550 PDFs client-blocked |
| 8 | Unverified website claims | **DONE** | **DEPLOYED** (live HTML clean) |
| 9 | Legacy PetroTrade branding | **PARTIALLY DONE** | UI mostly done; backend strings remain |
| 10 | HTTP 429 / slow pages | **PARTIALLY DONE** | Limits in code; latency root causes open |
| 11 | Production server / domains | **PARTIALLY DONE** | Interim hosts live; custom DNS blocked |
| 12 | Logged-out API / pricing errors | **PARTIALLY DONE** | Web improved; mobile home still calls protected APIs |
| 13 | Data consistency | **NOT DONE** | Seed/catalog evidence; prod DB not fully audited |
| 14 | Filters | **PARTIALLY DONE** | PRIVATE intentional; facet gaps remain |
| 15 | Today’s Offers 365 Days | **NEEDS VERIFICATION** | Fabrication removed in code; CSR deploy UX unproven |
| 16 | Dashboard PR link / decimals | **PARTIALLY DONE** | PR href fixed in code; rounding open |
| 17 | Mobile marketplace layout | **NOT DONE** | No sticky Sort\|Filter in `market-screen.tsx` |
| 18 | Logo black plate | **PARTIALLY DONE** | Dual assets exist; variant QA open |
| 19 | Price visibility policy | **PARTIALLY DONE** | Listing prices public; marketing copy mixed |
| 20 | SEO / sitemap / robots | **PARTIALLY DONE** | www website OK; grade sitemap missing |
| 21 | Accessibility | **PARTIALLY DONE** | Spot fixes; 165+ checklist deferred |
| 22 | Blog + polymer chips | **PARTIALLY DONE** | Homepage chips linked; blog/CMS + materials chips open |
| 23 | Android APK release | **BLOCKED** | EAS auth; no 3.1.3 artifact |

Detailed evidence per issue: see `POLYSTOREX_23_POINT_STATUS.md`.

---

## Cross-repository dependencies

```
[Website] ──enquiries/marketing──► [Backend]
[Customer Web] ──/public|/customer/*──► [Backend] ──Prisma──► PostgreSQL
[Seller Web]   ──/seller|/auth/*──────► [Backend]
[Admin]        ──/admin/*─────────────► [Backend]
[Expo Mobile]  ──same API + R2 images─► [Backend]
[Website Sanity] ──blog CMS (optional)
```

Shared production API base (env names only):  
`EXPO_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` → DO host `/api/v1`.

Hardcoded interim hosts found in **36+** config/docs files across repos (DO + Vercel).

---

## Database and production safety

| Check | Result |
|-------|--------|
| Prod DB access from workspace | **BLOCKED** — local `.env` points at `localhost:5433` |
| Live API read-only probes | **Done** — products, grades, health |
| Test products | Still public — cleanup scripts ready, **not applied** |
| Destructive ops this phase | **None** |
| PII in this report | **None** exposed |
| Recommended before any write | Managed DO backup + Trusted Sources allowlist + approved runbook |

Scripts ready (not executed with `--apply` this phase):

- `Swaroop-Backend/scripts/confirm-live-test-products.mjs`
- `Swaroop-Backend/scripts/soft-deactivate-confirmed-test-products.mjs`
- `Swaroop-Backend/docs/test-product-cleanup-runbook.md`

---

## Root-cause themes

1. **Data hygiene vs product design:** Client “64 unique vs 123 listings” matches multi-offer catalogue; junk Source.One categories and test SKUs are separate hygiene problems.  
2. **Blind marketplace by design:** `PRIVATE` manufacturer is intentional (`blindManufacturerLabel`), not a bug — but it collapses Brand filters.  
3. **Partial rebrand:** Shell UI → PolyStoreX; credit/KYC API copy and `petrotrade.*` keys still PetroTrade-era.  
4. **Deploy lag / unknown SHAs:** Fixes on git `main` ≠ proven Vercel/DO revision; Backend health lacks commit metadata.  
5. **Release blocked on access:** EAS org + prod `DATABASE_URL` + custom DNS are client/ops dependencies.

---

## Dependencies and blockers (short)

See `POLYSTOREX_CLIENT_DEPENDENCIES.md` for the full list.

Must-have before claiming production closure:

1. Production `DATABASE_URL` (secure channel) + DO Trusted Sources  
2. Client approval: grade-code format, junk-grade hide list, TDS PDF pack (~550)  
3. EAS login for `polystorexs-team` to build APK 3.1.3/3115  
4. Confirm/redeploy Customer WebApp + Backend with env `KYC_ENFORCE_FOR_TRADING` decision  
5. DNS/custom domain approvals for proposed production URLs  

---

## Related artifacts created this phase

| File | Purpose |
|------|---------|
| `POLYSTOREX_PRODUCTION_AUDIT.md` | This executive audit |
| `POLYSTOREX_23_POINT_STATUS.md` | Per-issue evidence matrix |
| `POLYSTOREX_PHASE_PLAN.md` | Phased implementation order |
| `POLYSTOREX_CLIENT_DEPENDENCIES.md` | Client/ops inputs required |

**STOP:** Phase 0 complete. No implementation changes were made for the 23 issues in this phase.
