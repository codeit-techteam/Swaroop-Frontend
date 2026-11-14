# PolyStoreX — Phase 1 Completion Report

**Date:** 14 November 2026  
**Scope:** P0 critical production fixes + production rollout steps.  

---

## Deployment status (verified)

| Workstream | Status | Evidence |
|------------|--------|----------|
| **Backend redeploy** | **DEPLOYED** | DO App built commit `361af18` (pushed by `skr-c0der`). Live public API: E2E search **0 hits**, HD Blow Test **0 hits**, product `meta.total` **122** (was 123/124). Real `HDPE Blow Moulding Grade` still listed. |
| **Customer WebApp redeploy** | **DEPLOYED** | GitHub Production deployment `bedd18c` at 2026-11-14T11:22:46Z; Vercel check **success** (`swaroop-customer-webapp`). |
| **KYC_ENFORCE_FOR_TRADING** | **DEPLOYED (code default true)** | Commit `361af18` defaults enforce **on** unless env is explicitly `false`/`0`/`off`. Confirm in DO App → Settings → App-Level / component env that the var is unset or `true`. |
| **DB soft-deactivate `--apply`** | **DONE** | Trusted Source `49.37.43.103/32` added. Applied 14 Nov 2026 ~11:30Z UTC: soft-deleted `E2E-BULK-14198` + `HD Blow Test`; paused offers `OFFER-2026-381852` + `OFFER-2026-513092`. Live search still 0; product total 122. |

**Security note:** A production DB password was visible in a control-panel screenshot shared in chat. **Rotate the `doadmin` password in DigitalOcean after this session** and update the App Platform database binding / `DATABASE_URL`. Do not paste the new password into chat.

---

## Steps completed

### 1. Backend (exclusion, KYC, privacy, branding)
1. Phase 1 code pushed as `361af18` on `codeit-techteam/Swaroop-Backend/main`.
2. DigitalOcean App Platform auto-build/deploy observed (Building → live).
3. Post-deploy API verification:
   - `GET /public/marketplace/products?search=E2E%20Bulk` → **0**
   - `GET /public/marketplace/products?search=HD%20Blow%20Test` → **0**
   - `GET /public/marketplace/products?search=HD%20Blow` → only genuine HDPE Blow grades
   - Product total **122**

### 2. Customer WebApp (dedupe, KYC UI)
1. Committed and pushed `bedd18c` — KYC gate on `kycVerified`, Buy Now gated, gradeId offer dedupe, guest-safe commerce errors, production empty notification mock.
2. GitHub/Vercel Production deployment **success**.

### 3. Soft-deactivate (remaining human step — ~1 minute)
Trusted Sources currently blocks the laptop. In DigitalOcean:

1. Open **Swaroop** project → database **`db-pgsql-blr1-33341`**.
2. **Trusted Sources** → **Add Trusted Source**.
3. Add IP **`49.37.43.103/32`** (current public IP) — or temporarily allow the App’s egress if you prefer to run from a jump host.
4. Save, wait ~30s, then reply **“Trusted Sources added”** (or run locally):

```bash
cd /Users/sumit/Desktop/Swaroop-Backend
# Use Connection string from DO UI (do not commit). Prefer password reset first.
export DATABASE_URL='postgresql://doadmin:REDACTED@db-pgsql-blr1-33341-do-user-45017195-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require'
./scripts/phase1-prod-soft-deactivate.sh
```

That script dry-runs, applies soft-delete + pause offers, then re-checks the live API.

### 4. Confirm KYC env on DO (30 seconds)
1. App **`swaroop-backend`** → **Settings** → Environment Variables.
2. Ensure `KYC_ENFORCE_FOR_TRADING` is **absent** or **`true`** (code default is true on `361af18`).
3. If it is set to `false`, change to `true` and redeploy.

---

## Per-issue Phase 1 results

### Issue 1 — Test products
| Field | Value |
|-------|--------|
| **Before** | NOT DONE — both SKUs ACTIVE on live API |
| **Implemented** | API exclusion in `buyableMarketplaceProductWhere` / offer filters; soft-deactivate script ready |
| **Live** | Public search hides both test SKUs (**DEPLOYED** filter) |
| **Remaining** | Soft-delete rows in Postgres once Trusted Sources allows laptop IP |
| **Tests** | excluded-product unit tests passed |

### Issue 2 — Duplicate listings / recommendations
| Field | Value |
|-------|--------|
| **Before** | Offers dedupe by grade name |
| **Implemented** | `dedupeOffersByGrade` prefers `gradeId`; mapper emits `gradeId` |
| **Deployment** | **DEPLOYED** (`bedd18c` on Vercel) |
| **Tests** | marketplace-dedupe 3/3 pass |

### Issue 3 — Fake auth / notifications
| Field | Value |
|-------|--------|
| **Implemented** | Production `notificationsCatalogMock` → `[]` |
| **Deployment** | **DEPLOYED** (`bedd18c`) |

### Issue 4 — Routing / KYC / Buy Now
| Field | Value |
|-------|--------|
| **Implemented** | Web `kycVerified` gate; Buy Now blocked; Backend enforce default true; cart add guarded |
| **Deployment** | Backend **DEPLOYED** (`361af18`); Customer Web **DEPLOYED** (`bedd18c`) |
| **Confirm** | DO env not explicitly `false` |

### Issue 5 — Manufacturer privacy (secondary fields)
| Field | Value |
|-------|--------|
| **Implemented** | Cart / PR / customer TDS sanitize |
| **Deployment** | **DEPLOYED** (`361af18`) |

### Issue 9 — PetroTrade branding
| Field | Value |
|-------|--------|
| **Implemented** | Customer-facing Backend strings → PolyStoreX |
| **Deployment** | **DEPLOYED** (`361af18`) |

### Issue 12 — Logged-out API / pricing errors
| Field | Value |
|-------|--------|
| **Implemented** | Web commerce error copy + checkout mapping (**DEPLOYED**). Expo guest gating still **LOCAL ONLY** until APK. |

---

## Tests executed

| Suite | Result |
|-------|--------|
| Backend excluded-test-products / KYC guard / public marketplace | PASS |
| Customer WebApp marketplace-dedupe.test.ts | PASS (3/3) |
| Live API post-deploy probes | PASS (test SKUs hidden) |

---

## Remaining before calling Phase 1 fully closed

1. **Add Trusted Source `49.37.43.103`** → run soft-deactivate `--apply` → confirm DB `deleted_at` set.  
2. **Rotate exposed DB password.**  
3. Glance KYC env on DO (should already be enforce-on).  
4. Optional: Expo APK for mobile guest/KYC navigation (Issue 23 / #12 mobile).

Phase 2 may proceed for **junk grades / TDS / data mapping** once item 1 is done or explicitly accepted as residual risk (API already hides test SKUs).
