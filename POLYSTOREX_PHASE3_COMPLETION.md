# PolyStoreX — Phase 3 Completion Report

**Date:** 14 November 2026  
**Scope:** HTTP 429 root causes, marketplace performance, frontend pagination, mobile Market UX, logo transparency, accessibility hardening, measured evidence.

**Rule:** Do not claim improvements without measurements. Rate limiting was **not** disabled globally; auth/OTP buckets stay stricter.

---

## 1. Baseline measurements (live API, 14 Nov 2026 ~11:51Z UTC)

Host: `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1`

| Probe | HTTP | Time | Bytes / notes |
|-------|------|------|----------------|
| `GET /health` | 200 | **0.880s** | 414 B |
| `GET /public/marketplace/products?page=1&limit=20` | 200 | **0.614s** | 45,408 B · meta total **122**, pages **7** |
| `GET /public/marketplace/products?page=1&limit=100` | 200 | **0.425s** | 224,440 B · 99 items after dedupe |
| `GET /public/marketplace` (home) | 200 | **0.463s** | home payload |
| `GET /public/marketplace/categories` | 200 | **0.181s** | categories |
| `GET /public/marketplace/grades?page=1&limit=12` | 200 | **0.208s** | grades page |
| Burst 50 × products `limit=20` | all 200 | **10.18s** total | **0** HTTP 429 |

**Client-side 429 root cause (code evidence, not live 429 in this burst):**  
Customer Web previously looped `page <= 10` at `limit=100` for **both** products and offers on every marketplace mount (up to **20** GETs), with no in-flight dedupe and React Strict Mode double-mount risk. Auth/OTP limits remain `min(default, 60)` per IP; catalogue bucket stays separate.

---

## 2. Fixes delivered

### 2.1 HTTP 429 / request storms
| Change | Location |
|--------|----------|
| Cap catalogue hydrate at **MAX_PAGES=3**, page size **48**, sequential + 40ms stagger | `Swaroop-Customer-WEBAPP/services/catalog.ts` |
| In-flight dedupe (`catalogInflight` / `offersInflight`) | same |
| Store skips duplicate `fetchCatalog` / `fetchOffers` unless `{ force: true }` | `marketplaceStore.ts`, `offersStore.ts` |
| Axios **never auto-retries 429** | `lib/apiClient.ts` |
| Rate limiter sets **`Retry-After`** header; auth/OTP bucket still tight | `rate-limit.guard.ts` |
| Expo catalog same cap + memory/in-flight cache (Home+Market share) | `SWAROOP/src/services/catalog.ts`, `use-marketplace-catalog.ts` |
| Session expiry guest reload / Retry buttons use `{ force: true }` | `session-hydrator.tsx`, dashboard/offers pages |

**Expected request budget after fix (122 live products):** ≤3 product pages + ≤3 offer pages = **≤6** GETs per cold load (was up to 20), and **1** in-flight coalesced call under Strict Mode. Home→Market on mobile no longer doubles the fan-out.

Follow-up from [Explore Phase3 perf hotspots](5cac7ea8-adc9-457e-a022-5c427421fc8f): CxFeedHydrator / dashboard duplicate mounts are neutralized by store guards; Expo Home duplicate path closed via shared cache.

### 2.2 Backend / DB performance
| Change | Evidence |
|--------|----------|
| TTL cache (30s) for guest `home` + `listCategories` | `marketplace-cache.ts` + `marketplace.service.ts` |
| Cache bump on offer activate / resume / pause / expire | `offers.service.ts` |
| New index `offers(status, visibility, deleted_at, base_price)` applied on prod | migration + live `CREATE INDEX` |
| EXPLAIN on price-floor ACTIVE scan | before **0.104ms** → after **0.069ms** (small table; still Seq Scan at this size) |

### 2.3 Frontend data loading
- Server-driven pagination retained (`meta.page/limit/total`).
- Initial catalogue no longer blindly walks 10×100.
- Marketplace skeleton + retry already present; Retry now uses `fetchCatalog({ force: true })`.
- Grade directory / catalogue search already debounced (`useDebounce` 250–350ms).

### 2.4 Mobile marketplace (SWAROOP)
- Compact search + category chip row.
- Sticky Sort \| Filter toolbar (`StickyMarketToolbar`) fixed under search.
- Hero/promo moved to **list footer** so product cards enter the first viewport.
- Touch targets ≥40×44 on Filter / chips; safe-area bottom padding retained.

### 2.5 Logo
- Prepared **`polystorex-logo-on-light.png`** from supplied transparent artwork (dark wordmark, transparent bg — **not** text/emoji recreation).
- Wired on Customer, Website, Admin, Seller, Expo for light surfaces.
- Dark surfaces keep `polystorex-logo-transparent.png`.
- Black-plate `logo-light-bg` no longer used on white UI chrome.

### 2.6 Accessibility
- Global `:focus-visible` ring.
- Sort dropdown labelled; muted text contrast raised.
- Website logo mark `alt="PolyStoreX"`.
- Documented in `docs/ACCESSIBILITY.md`. Full axe certification still outstanding post-deploy.

---

## 3. Tests run

| Suite | Result |
|-------|--------|
| Backend `phase2-integrity` + `offer-price-tiers` | **15/15 pass** |
| Backend `marketplace-cache.spec` | added |
| Customer `phase3-catalog-loading` + `phase2-integrity` | **9/9 pass** |

---

## 4. Deploy / remaining

| Item | Status |
|------|--------|
| Backend redeploy (cache + Retry-After + index migration in repo) | **LOCAL ONLY** until DO deploy |
| Customer / Website / Admin / Seller / Expo asset+code redeploy | **LOCAL ONLY** |
| Full axe WCAG 2.2 AA certification | **NOT DONE** (requires production scan) |
| Redis shared rate-limit store | Not required at current traffic; in-memory OK for single DO instance |

---

## 5. Issue status impact

| Issue | New status |
|-------|------------|
| #10 HTTP 429 / slow pages | **PARTIALLY DONE** → code DONE, **LOCAL ONLY** pending redeploy; measured baselines recorded |
| #17 Mobile marketplace | **PARTIALLY DONE** (`LOCAL ONLY`) — sticky toolbar + first-viewport cards |
| #18 Logo black background | **PARTIALLY DONE** → transparent on-light shipped (`LOCAL ONLY` until redeploy) |
| #21 Accessibility | **PARTIALLY DONE** — focus/labels/contrast fixes; full AA scan still open |

See `POLYSTOREX_23_POINT_STATUS.md`.
