# PolyStoreX — Phase 4 Completion Report

**Date:** 14 November 2026  
**Scope:** SEO, blog/materials chips, production domains, APK release prep, release readiness evidence.

---

## Release readiness (executive)

| Track | Ready? | Evidence |
|-------|--------|----------|
| Public website SEO | **YES** (live) | `robots.txt` + `sitemap.xml` on `www.polystorex.com` HTTPS; OG image 200 |
| Customer SEO (canonical + grade sitemap) | **CODE DONE** — redeploy needed | Canonical default → `customer.polystorex.com`; live robots still interim Host until Vercel redeploy |
| Custom domains (web apps) | **LIVE** | customer/seller/admin.polystorex.com → HTTP 200 |
| API custom domain | **BLOCKED** | `api.polystorex.com` DNS NXDOMAIN; keep DO API |
| Backend CORS for custom hosts | **CODE DONE** — redeploy needed | `configuration.ts` includes `*.polystorex.com` |
| Materials polymer chips | **CODE DONE** | `/materials` families link to marketplace `?category=polymers&search=` |
| Blog empty handling | **DONE** | Nav gated on Sanity; preview returns null; `/blogs` noIndex when unconfigured; sitemap omits `/blogs` without posts |
| Android APK 3.1.3 (3115) | **BLOCKED** | EAS: Entity Not Authorized for project `ccf88988-…` under `polystorexs-team` |
| Application ID | **UNCHANGED** | `com.swaroop.app` — no Play Store identity change |

**Build number prepared:** version **3.1.3** · `versionCode` **3115** · package **`com.swaroop.app`**  
**APK artifact:** **none** (build not started — access blocked).

---

## 1. SEO

### Website (live verified)
- Robots: Allow `/`, Disallow `/request-credit/track`, Host `www.polystorex.com`, Sitemap HTTPS.
- Sitemap: production WWW URLs only (no localhost).
- OG: `/opengraph-image` → 200 `image/png`.

### Customer (code + interim live)
- Canonical production host set to **`https://customer.polystorex.com`** (never localhost; Vercel interim not preferred for SEO).
- `robots.txt` Host uses **hostname only** (`customer.polystorex.com`).
- Private routes remain Disallow (dashboard, cart, KYC, orders, …).
- Sitemap includes public paths + **live-offer grade detail URLs** from `GET /public/marketplace/grades?hasOffers=true` (53 grades today, capped).
- Grade detail pages use `pageMetadata` with absolute OG/canonical.

**Live before redeploy:** customer robots still advertised interim Vercel Host — redeploy Customer WebApp to publish Phase 4 SEO.

---

## 2. Blog and materials chips

- Homepage `BlogsPreview` already returns `null` when no posts; nav Blogs only if Sanity project id set.
- `/blogs` metadata `noIndex` when Sanity not configured.
- Website sitemap includes `/blogs` **only** when post slugs exist.
- `/materials` polymer cards (HDPE, PP, PVC, Nylon, …) are **clickable** →  
  `{customerMarketplace}?category=polymers&search={CODE}`  
  (homepage ecosystem chips already linked).

---

## 3. Production domains

See `docs/PRODUCTION_DOMAINS.md`.

| Host | Probe 14 Nov |
|------|----------------|
| www.polystorex.com | 200 |
| customer.polystorex.com | 200 |
| seller.polystorex.com | 200 |
| admin.polystorex.com | 200 |
| api.polystorex.com | **DNS fail** |
| swaroop-backend-xzwkz.ondigitalocean.app/api/v1/health | 200 |

**Do not** switch Expo/web API base URLs to `api.polystorex.com` until DNS + TLS + health + CORS pass.

---

## 4. APK release preparation

| Item | Value / status |
|------|----------------|
| Expo `name` | PolyStoreX |
| slug / owner | `polystorex` / `polystorexs-team` |
| version | **3.1.3** |
| Android `versionCode` | **3115** |
| applicationId | **`com.swaroop.app`** (unchanged — do not alter) |
| `eas.json` profile | `production-apk` → APK, prod DO API |
| API URL in EAS env | `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1` |
| Splash / adaptive icon | black splash + adaptive `#000000` |
| Permissions | INTERNET, LOCATION, CAMERA, STORAGE, BIOMETRIC, NOTIFICATIONS, … |
| Google Maps | optional `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` / EAS secret |
| MSG91 OTP | server-side (Backend health OTP configured) — not in APK |
| EAS CLI user | `sumit.codeit1` / `codeit.techteam@gmail.com` |
| EAS project access | **DENIED** — `Entity Not Authorized` AppEntity `ccf88988-1846-42d3-8944-a10d70252de7` |

### Exact access requirement to unblock APK
1. Owner of Expo org **`polystorexs-team`** invites `codeit.techteam@gmail.com` (or the builder’s Expo account) with permission to **read/build** project **`polystorex`**.  
2. Builder runs `eas login` as that user.  
3. Confirm: `eas project:info` succeeds in `/Users/sumit/Desktop/SWAROOP`.  
4. Then: `eas build --platform android --profile production-apk`.  
5. Do **not** change `android.package` / iOS bundle id without written approval.

**Stop:** APK release step halted — no artifact claimed.

---

## 5. Release QA checklist (status)

| Area | Status |
|------|--------|
| Backend health (DO) | **PASS** (live) |
| Marketplace public products | **PASS** (Phase 1–3 probes) |
| Login / OTP | Needs device/web QA after redeploy (MSG91 configured on health) |
| KYC | Code deployed Phase 1; E2E still recommended |
| Search / filters / PDP / cart / PRs / orders / support / notifications / logout | Manual QA pending on `customer.polystorex.com` after Phase 2–4 redeploy |
| Deep links (`polystorex://`) | Configured in Expo scheme — device QA pending APK |
| Price visibility | Listing prices public (policy); checkout gated |
| Frontend vs Backend deploy | Track separately — Backend DO ≠ Vercel frontends ≠ EAS APK |

---

## 6. Unresolved / client-dependent

1. Invite Expo builder to `polystorexs-team` / project `polystorex`.  
2. DNS + TLS for `api.polystorex.com` before API cutover.  
3. Set Vercel `NEXT_PUBLIC_APP_URL=https://customer.polystorex.com` and redeploy Customer SEO.  
4. Redeploy Backend for CORS custom-domain defaults.  
5. Sanity blog content (optional) — until then blog stays hidden/noIndex.  
6. Full axe WCAG certification (Phase 3 residual).  
7. Phase 2 client catalogue / TDS / grade-code approvals (unchanged BLOCKED).

---

## Files touched (Phase 4)

- `Swaroop-Customer-WEBAPP/lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts`, `grades/[id]/page.tsx`, `lib/env.ts`
- `Swaroop-Website/app/materials/page.tsx`, `app/sitemap.ts`, `app/blogs/page.tsx`, `lib/seo.ts`
- `Swaroop-Backend/src/config/configuration.ts` (CORS origins)
- `SWAROOP/docs/PRODUCTION_DOMAINS.md`, this report, status/plan/deps updates
- `Swaroop-Customer-WEBAPP/lib/phase4-seo.test.ts` (+ `package.json` test script)

### Verification (14 Nov)

| Check | Result |
|-------|--------|
| Customer unit tests (incl. Phase 4 SEO) | **15/15 pass** |
| `www.polystorex.com/robots.txt` | Host `www.polystorex.com`; Sitemap HTTPS |
| `www` / customer OG assets | HTTP 200 |
| Live customer sitemap | Still interim `swaroop-customer-webapp.vercel.app` URLs; **no** grade detail entries yet → redeploy required |
| Live customer robots | Private Disallow present; Host/canonical flip pending redeploy |
| DO API health | 200 |
| `api.polystorex.com` DNS | Empty / fail — do not cut over |
| EAS project access | Entity Not Authorized — APK stopped |
