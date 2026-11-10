# PolyStoreX Release Report — Customer App v3.1.3 (3115)

**Audit date:** 10 Nov 2026  
**Prepared from:** live codebase + production health/API probes + unit tests  
**Honesty rule:** APK / deploy / device tests are only marked complete when evidence exists.

---

## A. Android build

| Field | Value |
|-------|--------|
| APK file/link | **Not available** — EAS build not started |
| Version name (prepared) | `3.1.3` |
| Version code (prepared) | `3115` |
| Build ID | — |
| Build date | — |
| Package ID | `com.swaroop.app` (**unchanged**; do not switch to `com.polystorex.app` without client confirmation — new package = new Play listing, no update path, separate signing) |
| Production API | `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1` |
| Device testing | **Not run** (no APK artifact) |

### Why the APK was not generated

- EAS CLI is logged in as `vikramsahrawat09` / `vikram.bajriwala@gmail.com`.
- Project `polystorex` (`ccf88988-1846-42d3-8944-a10d70252de7`, owner `polystorexs-team`) returns **Entity Not Authorized**.
- **Required action:** `eas login` as an account with access to **polystorexs-team**, then:

```bash
cd SWAROOP
eas build --platform android --profile production-apk --non-interactive
```

Version bump is already in local working tree: `eas.json` + `app.config.ts` → 3.1.3 / 3115.

---

## B. Fixes included (status checklist)

| # | Issue | Status | APK? | Backend deploy? | Evidence / notes |
|---|--------|--------|------|-----------------|------------------|
| 1 | TDS / Quality Documentation tick | **Implemented and verified (code)**; PDFs pending client | Yes (mobile gate) | No for tick; Admin upload already on backend | Mobile: Quality Documentation trust/highlight only when `documents.length > 0` (`productDetails.ts`). Web quality card already gated. Prod: no fabricated PDFs. **~550 Source.One PDFs still client-pending.** |
| 2 | Search PVC count / chips | **Implemented but not tested on device** | Yes | No | Code on `main` (`market-screen`). Unit: market-filters **11/11 pass**. Prod grades search `q=PVC` returns `meta.total=170` (API). |
| 3 | Pricing ABS ₹10 / min floor | **Backend deployed and verified** (live offers) | Partial (Best Value UI) | Already on DO for floor | Prod products: `total=124`, price min **48500** (none &lt; 1250). ABS EXTRUSION 3000D `liveOfferCount=0`. Unit: commerce-pricing **10/10**. |
| 4 | Duplicates / catalogue counts | **Implemented but not tested** (dedupe); counts DB-backed | Yes (dedupe UI) | Counts from API | Prod live product cards **124**. Local reconciliation doc: customer grades 3748 / seller 3752 / live 62 on Docker DB — **prod live cards = 124**. Do not hardcode. |
| 5 | Filters (location, origin, scroll, sort count) | **Implemented but not tested on device** | Yes | No | Sort excluded from filter badge (unit verified). |
| 6 | Order progress from backend | **Implemented but not tested on device** | Yes | Already (STAGE_PERCENT) | Static % maps removed; prefer API progress. PT-PO-8799 not found as static fixture. |
| 7 | Checkout two-step confirm | **Implemented but not tested on device** | Yes | No | Confirm dialog before PR submit (mobile + customer web). |
| 8 | Test data cleanup | **Partially done** | No | Soft-pause applied on reconciled DB | Demo ₹95 / ₹200 offers soft-paused locally. E2E / scxsxcsc / Nylon 20k not found in code/prod probe. Re-run dry-run against **prod** `DATABASE_URL` if different. |
| 9 | Blind marketplace | **Products: Backend deployed and verified**; **Grades list: Implemented but NOT deployed** | Yes | **Grades sanitize needs DO deploy** | Prod `/public/marketplace/products`: `manufacturer`/`brand` = `PRIVATE`, no identity leaks. Prod `/public/marketplace/grades?q=PVC` still returned real makers (TAITA, KANEKA, …) until new `toCustomerGrade` sanitize is deployed. |
| 10 | Add to Cart server-first | **Implemented but not tested on device** | Yes | Cart API already live | Success toast only after server confirmation (prior fix on main). |
| 11 | Google Maps | **Pending client dependency** | Key must be in EAS env for map-picker banner | Server key on backend | App uses **backend** Places/Geocode (`GOOGLE_MAPS_SERVER_API_KEY`). No `react-native-maps` / Maps SDK for Android in Expo config. Client `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` only gates map-picker messaging; **not** in `eas.json` env → production APK will use placeholder unless EAS secret set. |
| 12 | Android package ID | **Pending client confirmation** | Keep `com.swaroop.app` | — | Changing to `com.polystorex.app` creates a **new app identity** (cannot update existing install / Play listing). |

### Seller Web / Admin (summary)

| Item | Status |
|------|--------|
| GST/PAN Verified only with non-empty IDs | Implemented in backend profile summary + seller web UI (`Not added`) — on seller `main` |
| Analytics from API (no mock KPIs) | Implemented on seller web `main` |
| My Offers warehouse-scoped | Implemented |
| Offer units ₹/MT | Implemented on grade detail |
| Warehouse missing validation | Implemented |
| Create New Grade E2E | Code present; not re-verified against prod Admin in this session |
| Admin catalogue / HSN / offers / support | Assumed functional from prior ship; not full E2E this session |

---

## C. Backend-only fixes

| Description | Module / API | Production deployment | Verification | Client testing? |
|-------------|--------------|----------------------|--------------|-----------------|
| Marketplace price floor / Best Value gate | `marketplace.service` + `commerce-pricing` + offer activate/resume | **Deployed** (commit `b092386` behaviour observed) | Health OK; live prices ≥ 48500; ABS 3000D live=0 | Yes for pricing |
| Blind product payloads | `blind-marketplace.mapper` / products | **Deployed** | Prod products PRIVATE | Yes for product cards |
| Blind **grade** list/detail sanitize | `toCustomerGrade` in `marketplace.service.ts` | **Not deployed** (local change 10 Nov) | Unit tests 27 pass; prod grades still leak makers | **Wait for DO deploy** |
| GST/PAN verified requires ID | seller profile summary | Deployed with `b092386` (code on origin/main) | Code review; not re-hit authenticated seller API here | Yes after seller login |
| OTP production lock | MSG91 + `AUTH_STRICT_OTP` | **Verified on production** | Health: `otp.provider=msg91`, `authStrictOtp=true`, template/sender/header/DLT configured | Yes for login OTP |
| Local `.env` note | — | N/A | Local machine still has `AUTH_DEV_FIXED_OTP=true` / `AUTH_STRICT_OTP=false` — **does not affect DO** | — |

Production target: DigitalOcean App `swaroop-backend-xzwkz.ondigitalocean.app`.  
`doctl` not authenticated in this environment — deploy of the new grade-sanitize commit must be done by whoever has DO access after push.

---

## D. Pending client dependencies

### 1. Source.One TDS PDFs (~550)
Upload/map via Admin TDS workflow. Do not invent documents.

### 2. Google Cloud Maps (account `it@polystorex.com`)

APIs the stack actually uses:

| API | Used by | Required? |
|-----|---------|-----------|
| **Places API** (Autocomplete / Place Details) | Backend `google-maps.client` via locations endpoints | **Yes** (address search) |
| **Geocoding API** | Backend reverse/forward geocode | **Yes** if reverse-geocode / pin flows used |
| Maps SDK for Android | Not in current Expo plugins / no MapView | **No** for current build |
| Maps JavaScript API | Customer/seller web only if those apps embed JS maps | Check web apps separately |

Client checklist (no passwords/2FA requested):

1. Confirm GCP project ownership under `it@polystorex.com` and note **Project ID**.
2. Ensure **billing** is linked and active.
3. Enable **Places API** and **Geocoding API** on that project.
4. Create/restrict a **server** API key → set as DigitalOcean env `GOOGLE_MAPS_SERVER_API_KEY` (prefer IP restrict to DO egress IPs).
5. Optional client key for map-picker UX: Android restriction package `com.swaroop.app` + release SHA-1 from **polystorexs-team** EAS credentials (fingerprint **not obtainable** here — wrong Expo account). Set as EAS secret `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` for `production-apk`.
6. Confirm quotas; no daily zero-cap that would break autocomplete.

### 3. Android package ID
Confirm keep `com.swaroop.app` vs rename to `com.polystorex.app` (new store identity).

### 4. EAS access
Grant build rights for `polystorexs-team` / project `polystorex` to the operator running the APK build.

---

## E. Next build

**Earliest realistic APK:** same calendar day as (1) `eas login` to `polystorexs-team` and (2) push + DigitalOcean deploy of grade blind-sanitize, optional Maps EAS secret.

If EAS access is granted on **10 Nov 2026**, target build window: **10–11 Nov 2026**.  
If access slips, next build date = **day of EAS authorization + DO deploy**, not a guessed fixed date.

---

## F. Local changes prepared this session (not all pushed)

**SWAROOP (uncommitted):**
- `src/constants/productDetails.ts` — gate Quality Documentation
- `eas.json`, `app.config.ts` — 3.1.3 / 3115

**Swaroop-Backend (uncommitted):**
- `marketplace.service.ts` + spec — blind sanitize on customer/public grades

**Already on origin/main (prior):** pricing floor, product blind mapper, GST/PAN, seller/customer web checkout/TDS/filters, etc.
