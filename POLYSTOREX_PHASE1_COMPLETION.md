# PolyStoreX — Phase 1 Completion Report

**Date:** 14 November 2026  
**Scope:** P0 critical production fixes (code).  
**Deployment:** **LOCAL ONLY** unless noted — no production deploy claimed in this phase.

---

## Summary

Phase 1 implemented defense-in-depth test-product exclusion, recommendation dedupe by `gradeId`, KYC trading gates (UI + backend default-on), manufacturer privacy hardening (cart/PR/TDS), PetroTrade → PolyStoreX customer-facing copy, guest API noise reduction, and unit tests.

**Blocked without client/ops:** soft-deactivate of live test rows in production Postgres (`DATABASE_URL` still `localhost` in workspace). Live API still returns E2E / HD Blow Test until Backend is redeployed **or** DB script is applied.

---

## Per-issue Phase 1 results

### Issue 1 — Test products
| Field | Value |
|-------|--------|
| **Before** | NOT DONE — both SKUs ACTIVE on live API |
| **Implemented** | `excluded-test-products.ts` wired into `buyableMarketplaceProductWhere` + `activeMarketplaceOfferWhere`; soft-deactivate script unchanged (ready). |
| **Files** | `Swaroop-Backend/src/modules/customers/marketplace/excluded-test-products.ts`, `marketplace.service.ts`, `excluded-test-products.spec.ts` |
| **Tests** | 3/3 excluded-product tests passed |
| **Deployment** | **LOCAL ONLY** — live still shows E2E Bulk Pricing Test |
| **Blockers** | Production `DATABASE_URL` + backup for `--apply`; Backend redeploy for API filter |

### Issue 2 — Duplicate listings / recommendations
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE — offers dedupe by grade **name** |
| **Implemented** | `dedupeOffersByGrade` prefers `gradeId` / `gradeCode`; mapper emits `gradeId` on offers. Distinct seller offers not auto-merged. |
| **Files** | `Swaroop-Customer-WEBAPP/lib/marketplace-dedupe.ts`, `types/offers.ts`, `lib/catalog-mapper.ts`, `lib/marketplace-dedupe.test.ts` |
| **Tests** | 3/3 dedupe tests passed |
| **Deployment** | **LOCAL ONLY** |
| **Blockers** | Redeploy Customer WebApp; optional client UX rule for multi-offer cards |

### Issue 3 — Fake auth / notifications
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE — runtime OK; mocks present |
| **Implemented** | Production builds export empty `notificationsCatalogMock`; store remains empty + backend ownership; guest Sign In path unchanged |
| **Files** | `mock/notifications-catalog.ts`, `mock/profile.ts` (+ kyc fields) |
| **Tests** | Covered indirectly by existing notification ownership backend patterns; guest UX manual |
| **Deployment** | **LOCAL ONLY** |
| **Blockers** | Redeploy; browser storage clear for legacy `petrotrade.*` keys |

### Issue 4 — Routing / KYC / Buy Now
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE — GST/onboarding bypass; Buy Now ungated; KYC enforce default false |
| **Implemented** | `KycFeatureGate` uses `kycVerified`; Buy Now/Add to Cart disabled + KYC CTA; backend `KYC_ENFORCE_FOR_TRADING` defaults **true**; guard on cart add; Expo redirects to KYC docs (not Home) |
| **Files** | `KycFeatureGate.tsx`, `use-purchase-actions.ts`, `sticky-purchase-panel.tsx`, `profileStore.ts`, `types/profile.ts`, `customer-kyc-approved.guard.ts` (+ spec), `configuration.ts`, `env.validation.ts`, `cart.controller.ts`, `SWAROOP/src/navigation/guards.tsx` |
| **Tests** | Guard spec 3/3 passed |
| **Deployment** | **LOCAL ONLY** — set DO env if override needed |
| **Blockers** | Redeploy Backend + Customer Web + confirm DO env |

### Issue 5 — Manufacturer privacy (customer-facing)
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE — products/grades PRIVATE; cart/PR/TDS leaks |
| **Implemented** | Cart grade sanitize; PR item sanitize; TDS customer audience returns PRIVATE manufacturer/code |
| **Files** | `cart.service.ts`, `blind-marketplace.mapper.ts` (`toCustomerFacingPr`), `grade-tds.service.ts` |
| **Tests** | Blind mapper suite still 19+; privacy covered in mapper specs |
| **Deployment** | **LOCAL ONLY** |
| **Blockers** | Backend redeploy; junk grades remain Phase 2 |

### Issue 8 — Marketing claims
| Field | Value |
|-------|--------|
| **Before** | DONE / DEPLOYED |
| **Implemented** | No change (already verified) |
| **Deployment** | **DEPLOYED** (unchanged) |

### Issue 9 — PetroTrade branding
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE |
| **Implemented** | 30 customer-facing Backend string replacements → PolyStoreX; preserved `verifiedByPetroTrade` field + historical PT-ORD in mocks; Website already uses Veylron Polychem Private Limited |
| **Files** | Multiple Backend credit/KYC/checkout/seller modules; `swagger.setup.ts` |
| **Tests** | Order progress specs updated via string replace |
| **Deployment** | **LOCAL ONLY** |
| **Blockers** | Backend redeploy |

### Issue 12 — Logged-out API / pricing errors
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE |
| **Implemented** | Expo `hydrateOrder` + home finance gated on login; commerce copy for UNAUTHORIZED / KYC_NOT_APPROVED; checkout error mapping |
| **Files** | `SWAROOP/.../order-store.ts`, `home-screen.tsx`, `commerce-errors.ts`, `checkout.ts` |
| **Deployment** | **LOCAL ONLY** |
| **Blockers** | Mobile APK + web redeploy |

### Issue 11 — Production configuration
| Field | Value |
|-------|--------|
| **Before** | PARTIALLY DONE |
| **Implemented** | Documented interim DO defaults; admin default no longer localhost; no custom-domain switch |
| **Files** | `Swaroop-Customer-WEBAPP/lib/env.ts` |
| **Deployment** | N/A (config) |
| **Blockers** | DNS when client ready |

---

## Tests executed

| Suite | Result |
|-------|--------|
| Backend `excluded-test-products.spec.ts` | PASS |
| Backend `customer-kyc-approved.guard.spec.ts` | PASS |
| Backend `blind-marketplace.mapper.spec.ts` | PASS |
| Backend `public-marketplace.controller.spec.ts` | PASS |
| Customer WebApp `lib/marketplace-dedupe.test.ts` | PASS (3/3) |

---

## Remaining blockers before Phase 2

1. **Production DATABASE_URL** (+ backup) to soft-deactivate test products  
2. **Redeploy** Swaroop-Backend (exclusion filter, KYC default, privacy, branding)  
3. **Redeploy** Swaroop-Customer-WEBAPP (dedupe, KYC UI, commerce copy)  
4. Confirm DigitalOcean `KYC_ENFORCE_FOR_TRADING` (defaults true in code; override only if needed)  
5. Optional: Expo APK rebuild for mobile guest/KYC navigation fixes  

Phase 2 must not start until the above are done **or** explicitly accepted as residual risk.
