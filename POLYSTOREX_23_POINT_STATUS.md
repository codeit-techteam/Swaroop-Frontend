# PolyStoreX — 23-Point Client Issue Status

**Audit date:** 14 November 2026  
**Phase 1 code update:** 14 November 2026 — see `POLYSTOREX_PHASE1_COMPLETION.md`  
**Rule:** Every status has evidence. No DONE from prior assistant summaries alone.  
**Deploy rule:** Do not mark DEPLOYED without independent verification.

Status labels: `DONE` | `PARTIALLY DONE` | `NOT DONE` | `BLOCKED` | `NEEDS VERIFICATION`  
Deploy tags: `DEPLOYED` | `LOCAL ONLY` | `N/A`

---

## Issue 1 — Test products (E2E Bulk Pricing Test / HD Blow Test)

| Field | Detail |
|-------|--------|
| **Client expectation** | Remove test SKUs from marketplace, search, recommendations, cart surfaces |
| **Before status (Phase 0)** | **NOT DONE** |
| **Current implementation** | API exclusion filter + soft-deactivate script. Live API still returns E2E until Backend redeploy and/or DB apply. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY`) |
| **Evidence** | `excluded-test-products.ts` + wired into `buyableMarketplaceProductWhere` / `activeMarketplaceOfferWhere`. Specs pass. Live probe 14 Nov still: E2E Bulk Pricing Test ACTIVE. Prod `DATABASE_URL` unavailable (localhost only). |
| **Required changes** | Prod DB `--apply` + Backend redeploy; re-probe search → 0 |
| **Repository** | Swaroop-Backend |
| **Dependencies** | Production `DATABASE_URL` + backup |
| **Test cases** | Unit: excluded ids; Live: search both names → 0 after deploy |

---

## Issue 2 — Duplicate listings (123 vs 64 unique)

| Field | Detail |
|-------|--------|
| **Client expectation** | No confusing duplicate grade cards; unique grade identity |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | Multi-offer catalogue unchanged (123/64). Recommended offers now dedupe by **gradeId**. Distinct seller offers not auto-merged. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY`) — recommendation uniqueness fixed in code |
| **Evidence** | `dedupeOffersByGrade` uses `gradeId`; `catalog-mapper` emits `gradeId`/`gradeCode`; `marketplace-dedupe.test.ts` 3/3 pass |
| **Required changes** | Redeploy Customer WebApp; optional client rule for marketplace multi-offer cards |
| **Repository** | Customer-WEBAPP (+ Backend popular grades already id-deduped) |
| **Dependencies** | Vercel redeploy |
| **Test cases** | Recommended: unique gradeIds; unit suite green |

---

## Issue 3 — Fake authentication and notifications

| Field | Detail |
|-------|--------|
| **Client expectation** | Logged-out users see no fake profile; no fake Logout; no sample PT-ORD / Navratri feed |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | Runtime empty feed + guest Sign In. Production `notificationsCatalogMock` now **[]**. Backend list/markRead scoped by `userId`. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY`) — production mock seed gated |
| **Evidence** | `mock/notifications-catalog.ts` `NODE_ENV === "production" → []`; store still starts empty; PT-ORD preserved only inside non-prod demo seeds |
| **Required changes** | Redeploy + guest QA; clear legacy `petrotrade.*` storage for testers |
| **Repository** | Customer-WEBAPP |
| **Dependencies** | Vercel redeploy |
| **Test cases** | Guest: Sign In only; signed-in: backend notifications only |

---

## Issue 4 — Broken navigation and KYC / Buy Now

| Field | Detail |
|-------|--------|
| **Client expectation** | Cart/Orders/Support/Profile/PRs reachable with clear KYC messaging; Buy Now blocked until KYC complete |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | Web gate uses `kycVerified`; Buy Now/Add to Cart blocked with “Complete KYC first”; Backend enforce defaults **true**; cart add guarded; Expo incomplete KYC → KYC docs (not Home) |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY`) — awaiting deploy + E2E |
| **Evidence** | `KycFeatureGate.tsx`, `use-purchase-actions.ts`, `configuration.ts` default true, `cart.controller.ts` `@UseGuards(CustomerKycApprovedGuard)`, guard specs 3/3, Expo `guards.tsx` |
| **Required changes** | Redeploy Backend + Customer Web + mobile; confirm DO env |
| **Repository** | Customer-WEBAPP, Backend, SWAROOP |
| **Dependencies** | Deploy access |
| **Test cases** | Incomplete KYC: panel + disabled CTAs; API `KYC_NOT_APPROVED` |

---

## Issue 5 — Grade Directory (PRIVATE + junk)

| Field | Detail |
|-------|--------|
| **Client expectation** | Sensible manufacturer display; hide junk/generic grades; ~3748 catalogue awareness |
| **Before status (Phase 0)** | **PARTIALLY DONE** — privacy DEPLOYED; junk open |
| **Current implementation** | Phase 1 hardened secondary leaks (cart/PR/TDS customer payloads → PRIVATE). Junk hygiene still Phase 2. |
| **Status** | **PARTIALLY DONE** — privacy strengthened (`LOCAL ONLY` for new sanitize paths); junk **NOT DONE** |
| **Evidence** | `cart.service.ts` sanitize; `toCustomerFacingPr` sanitize; `grade-tds.service.ts` customer audience blinds manufacturer |
| **Required changes** | Backend redeploy; client junk list for Phase 2 |
| **Repository** | Backend |
| **Dependencies** | Junk CSV (Phase 2) |
| **Test cases** | Customer TDS/cart/PR never show real maker; Admin still sees real data |

---

## Issue 6 — Grade codes (SO- prefix)

| Field | Detail |
|-------|--------|
| **Client expectation** | New PolyStoreX code standard (format TBD by client) |
| **Current implementation** | `gradeCodeOf` builds `SO-{category}-{gradeNo}-{manufacturer}-{hash}`; live SO- search total **3666** |
| **Status** | **BLOCKED** |
| **Evidence** | `source-one-csv.ts` `gradeCodeOf`; live `SO-ABS-3000D-PRIVATE-DD7728`; `sanitizeBlindCode` replaces maker token with PRIVATE |
| **Required changes** | Client approves target format + uniqueness rules → migration plan → dual-read period |
| **Repository** | Backend (generation + migration) |
| **Dependencies** | Client code-standard approval — **do not migrate first** |
| **Test cases** | Generator unit tests for new scheme; uniqueness; buyer-facing sanitize |

---

## Issue 7 — TDS unavailable / Quality Documentation

| Field | Detail |
|-------|--------|
| **Client expectation** | Real TDS PDFs; do not invent docs; Quality Documentation only when files exist |
| **Current implementation** | Backend serves verified TDS only; web/mobile gate highlights on real docs; library largely empty pending client PDFs |
| **Status** | **PARTIALLY DONE** (gating) / content **BLOCKED** on client |
| **Evidence** | `grade-tds.service.ts` `VERIFIED`; `lib/cx-feed.ts` strips quality highlight without docs; `grade-tds-section.tsx`; Expo bump commit notes TDS gate; no fabricated PDFs found in prod path |
| **Required changes** | Ingest ~550 client PDFs via Admin/import; map to grades; keep gate |
| **Repository** | Backend TDS + Admin upload + Customer/Mobile UI |
| **Dependencies** | Client PDF pack + mapping list |
| **Test cases** | Grade without TDS: unavailable + no false “enabled” trust tick; with verified file: download works |

---

## Issue 8 — Unverified website claims

| Field | Detail |
|-------|--------|
| **Client expectation** | Remove unverifiable marketing claims everywhere |
| **Current implementation** | Removed from six-repo source (except mentioning in audit MD). Live sites return **0** hits |
| **Status** | **DONE** — **DEPLOYED** |
| **Evidence** | Repo ripgrep: claims only in `POLYSTOREX_CLIENT_STATUS_14_NOV_2026.md`. Live HTML 14 Nov: `www.polystorex.com`, `swaroop-website.vercel.app`, `swaroop-customer-webapp.vercel.app` — 0 for India’s Largest / 500+ Industrial / 10K Cr / 99.9% Uptime / ISO 27001 |
| **Required changes** | Monitor app-store listings / PDFs outside repos; keep copy review in release checklist |
| **Repository** | Website + Customer-WEBAPP (verified) |
| **Dependencies** | None for code |
| **Test cases** | `check:bundle-urls` / grep CI for banned phrases |

---

## Issue 9 — Legacy PetroTrade branding

| Field | Detail |
|-------|--------|
| **Client expectation** | PolyStoreX portal branding; careful with historical PT-ORD ids |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | Backend user-facing PetroTrade strings → PolyStoreX (30 replacements). `verifiedByPetroTrade` field preserved. Website legal name already **Veylron Polychem Private Limited**. Historical PT-ORD only in non-prod demo seeds. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY`) — storage keys still `petrotrade.*` |
| **Evidence** | Backend ripgrep: only `verifiedByPetroTrade` remains as PetroTrade token; Website `content/company.ts` legalName |
| **Required changes** | Redeploy Backend; optional storage-key migration later |
| **Repository** | Backend, Website (legal already OK), Customer-WEBAPP |
| **Dependencies** | Backend redeploy |
| **Test cases** | New credit/KYC messages say PolyStoreX; PT-ORD history untouched |

---

## Issue 10 — HTTP 429 and slow pages

| Field | Detail |
|-------|--------|
| **Client expectation** | Marketplace/grade pages load acceptably; no spurious 429 |
| **Current implementation** | In-memory rate limit raised (marketplace GET 600/min in config); Customer catalog may still paginate up to 10×100; heavy Prisma includes; no Redis/shared cache |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `rate-limit.guard.ts`; `configuration.ts` `THROTTLE_MARKETPLACE_LIMIT`; `services/catalog.ts` multi-page fetch; `marketplace.service.ts` includes; indexes in `schema.prisma` |
| **Required changes** | Server-side filter/pagination; reduce client fan-out; shared rate-limit store; query profiling; CDN/cache for public catalogue |
| **Repository** | Backend + Customer-WEBAPP (+ mobile) |
| **Dependencies** | DO redeploy for limit changes; optional Redis |
| **Test cases** | Load marketplace logged-out < target SLA; burst GETs under limit; no retry storms |

---

## Issue 11 — Production server and domains

| Field | Detail |
|-------|--------|
| **Client expectation** | Stable production URLs; audit hardcoded interim hosts |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | Phase 1 documented interim DO defaults; Customer `adminApiUrl` default is admin Vercel host (not localhost). No unconfigured custom-domain switch. |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `Swaroop-Customer-WEBAPP/lib/env.ts`; live DO health still OK |
| **Required changes** | DNS cutover when client ready |
| **Repository** | All six |
| **Dependencies** | DNS + hosting access |
| **Test cases** | Smoke each hostname + TLS + CORS |

---

## Issue 12 — Logged-out API calls / pricing errors

| Field | Detail |
|-------|--------|
| **Client expectation** | Guests don’t hit 401 on orders/payments; clear pricing rules |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | Expo order hydrate + finance summary gated on login. Commerce errors map UNAUTHORIZED / KYC_NOT_APPROVED without raw 401 text. Listing prices remain public. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY`) |
| **Evidence** | `SWAROOP/src/store/order-store.ts`, `home-screen.tsx`, `commerce-errors.ts`, `checkout.ts` error mapping |
| **Required changes** | Redeploy apps; device QA |
| **Repository** | SWAROOP, Customer-WEBAPP |
| **Dependencies** | APK / web deploy |
| **Test cases** | Guest: no `/customer/orders` or finance calls |

---

## Issue 13 — Data consistency

| Field | Detail |
|-------|--------|
| **Client expectation** | Consistent regions/hubs; correct polymer linkages; MOQ vs tiers; material class |
| **Current implementation** | Seed/catalog inconsistencies remain (region strings, Nylon→PA66_GF master, demo 0–11 MT tier). Prod DB not fully queryable locally |
| **Status** | **NOT DONE** |
| **Evidence** | `catalog-products.json` region mix; Nylon product → `PA66_GF30_FR_BK`; `demo-bootstrap.service.ts` `{minQty:0,maxQty:11}`; `commerce-pricing.ts` MOQ checks; live region values need authenticated/admin audit |
| **Required changes** | Master-data correction scripts with client-approved mappings; validate tier ≥ MOQ |
| **Repository** | Backend seeds + Admin data tools |
| **Dependencies** | Prod DB access; client mapping sheet |
| **Test cases** | Fixture assertions for Nylon linkage; offer activation rejects tier below MOQ |

---

## Issue 14 — Filters

| Field | Detail |
|-------|--------|
| **Client expectation** | Useful Brand/Warehouse/Credit/category filters including PP/Nylon |
| **Current implementation** | Brand collapses to PRIVATE (by design). Warehouse often “All Regions”. Credit product model 15/30 days. Chips derived from live listings |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `catalog-mapper.ts` `resolveBlindManufacturer` / `warehousesFromProducts`; `payment-eligibility.ts` tenure `[15,30]`; mobile `marketCategoryChips()` |
| **Required changes** | Client policy: hide Brand when blind, or show polymer family instead; enrich warehouse facets; align credit filter with offers |
| **Repository** | Customer-WEBAPP, SWAROOP, Backend aggregations |
| **Dependencies** | Blind-marketplace product policy |
| **Test cases** | Filter facets match offer attributes; PP/Nylon appear when catalogue has them |

---

## Issue 15 — Today’s Offers “Ends in 365 Days”

| Field | Detail |
|-------|--------|
| **Client expectation** | Honest expiry / countdown |
| **Current implementation** | Mapper no longer fabricates `validUntil`; UI uses “Open availability” when null |
| **Status** | **NEEDS VERIFICATION** |
| **Evidence** | `catalog-mapper.ts` L568–570 comment+logic; `offer-countdown.tsx` / banners. Live marketplace SSR HTML did not contain “Ends in 365” (CSR — incomplete proof). Fix commit `10a5075` on Customer `main` |
| **Required changes** | Confirm on deployed production after hard refresh; ensure API `validUntil` populated when truly limited |
| **Repository** | Customer-WEBAPP |
| **Dependencies** | Vercel deploy confirmation |
| **Test cases** | Offer with null expiry → Open availability; with date → accurate countdown; never +365 fabricate |

---

## Issue 16 — Dashboard Purchase Requests / landed decimals

| Field | Detail |
|-------|--------|
| **Client expectation** | View All → Purchase Requests; sensible landed price rounding |
| **Current implementation** | `procurement-table.tsx` `actionHref={ROUTES.purchaseRequests}`. Landed preview still uses 2-decimal `formatInr` from commerce strings |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY` until deploy) |
| **Evidence** | `components/dashboard/procurement-table.tsx` L111–112; `components/marketplace/product-card.tsx` landed formatting; `commerce-pricing.ts` |
| **Required changes** | Rounding policy (e.g. whole ₹/MT); deploy verify View All |
| **Repository** | Customer-WEBAPP (+ Backend pricing if formula change) |
| **Dependencies** | Client rounding rule |
| **Test cases** | View All lands on PR list; sample landed values match rounding spec |

---

## Issue 17 — Mobile marketplace layout

| Field | Detail |
|-------|--------|
| **Client expectation** | Products in first viewport; compact search/categories; sticky Sort\|Filter |
| **Current implementation** | Header → search → categories → optional hero → list; no sticky filter bar |
| **Status** | **NOT DONE** |
| **Evidence** | `SWAROOP/src/features/customer/market-screen.tsx`; `MarketFilterSheet`; no `stickyHeaderIndices` |
| **Required changes** | Compact header; sticky Sort\|Filter; defer/remove hero above fold |
| **Repository** | SWAROOP |
| **Dependencies** | APK rebuild (#23) for device delivery |
| **Test cases** | First viewport shows ≥1 product card on common phones; sticky bar remains while scrolling |

---

## Issue 18 — Logo black background

| Field | Detail |
|-------|--------|
| **Client expectation** | Correct logo on light/dark surfaces; transparent asset if needed |
| **Current implementation** | Dual assets (`logoOnLight` black plate / transparent on dark) documented and wired |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | Customer `components/auth/logo.tsx`; Expo `src/components/ui/app-logo.tsx`; Website `components/brand/logo.tsx`; adaptive icon bg `#000000` in `app.config.ts` |
| **Required changes** | Audit every surface for wrong variant; optional client-supplied fully transparent wordmark |
| **Repository** | All frontends |
| **Dependencies** | Optional new asset from brand |
| **Test cases** | Visual checklist light/dark web + mobile splash/header |

---

## Issue 19 — Price visibility inconsistency

| Field | Detail |
|-------|--------|
| **Client expectation** | Consistent policy (client chooses commercial rule) |
| **Current implementation** | **Implemented policy:** listing/material prices visible to guests; checkout/credit/docs require sign-in. Marketing copy sometimes implies prices hidden until sign-in |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | Public marketplace products include prices; `pricing-estimate.ts` public; Website `marketplace-banner.tsx` mixed wording; product cards show Material Price without auth |
| **Required changes** | Align all marketing strings to the implemented policy **or** change policy after written client approval |
| **Repository** | Website + Customer-WEBAPP + SWAROOP |
| **Dependencies** | Client commercial policy confirmation |
| **Test cases** | Guest sees/hides prices per approved policy on home, marketplace, PDP |

---

## Issue 20 — SEO (canonical, robots, grade sitemap)

| Field | Detail |
|-------|--------|
| **Client expectation** | Correct www canonicals; robots; grade pages in sitemap where appropriate |
| **Current implementation** | Website SEO uses www host; Customer sitemap is shallow (login/register/marketplace/grades **index** only — no per-grade URLs) |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `Swaroop-Website/app/robots.ts`, `app/sitemap.ts`, `lib/seo.ts`; Customer `app/sitemap.ts` / `lib/seo.ts` `PRODUCTION_APP_URL` Vercel fallback |
| **Required changes** | Decide indexability of customer grade URLs; generate sitemap entries; set `NEXT_PUBLIC_APP_URL` to canonical customer domain |
| **Repository** | Website + Customer-WEBAPP |
| **Dependencies** | Domain/DNS; SEO indexing policy |
| **Test cases** | robots → sitemap; sample grade URL present if policy allows; canonical host consistent |

---

## Issue 21 — Accessibility

| Field | Detail |
|-------|--------|
| **Client expectation** | WCAG AA: contrast, labelled controls |
| **Current implementation** | Spot `aria-label` fixes; docs admit 165+ items not done; no jest-axe suite |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `docs/ACCESSIBILITY.md`; cart/sidebar labels; build fix `c517f9a` |
| **Required changes** | Automated axe CI on key routes; systematic contrast pass |
| **Repository** | Customer-WEBAPP (primary), Website, Seller, Admin |
| **Dependencies** | Design token decisions for contrast |
| **Test cases** | axe critical=0 on login/marketplace/cart; form inputs have names |

---

## Issue 22 — Blog empty; polymer chips

| Field | Detail |
|-------|--------|
| **Client expectation** | Blog content; clickable polymer chips → marketplace |
| **Current implementation** | Homepage ecosystem chips link to customer marketplace with category/search. `/materials` tags are plain `<li>`. Blog empty without Sanity config |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `materials-ecosystem.tsx` links; `app/materials/page.tsx` non-links; `isSanityConfigured()` / `BlogEmptyState`; commit `9280a6e` |
| **Required changes** | Wire materials chips; configure Sanity + publish posts |
| **Repository** | Swaroop-Website |
| **Dependencies** | Sanity project credentials (secure); content authors |
| **Test cases** | Each chip navigates with expected query; blog lists ≥1 published post when CMS ready |

---

## Issue 23 — Android APK

| Field | Detail |
|-------|--------|
| **Client expectation** | Ship APK with latest mobile+backend sync (newer than reported 3.1.2 / 4 Nov) |
| **Current implementation** | Config **3.1.3 / 3115**, package `com.swaroop.app`, prod API in `eas.json`. **No APK built**. Newest local artifact **3.1.1/3113**. EAS unauthorized for `polystorexs-team` |
| **Status** | **BLOCKED** |
| **Evidence** | `app.config.ts` L6–11, L50–51; `eas.json`; `docs/release-report-v3.1.3-3115.md`; filesystem APK search; live API PRIVATE grades shows some Nov 10+ backend behaviour deployed, but **Backend commit SHA for Nov 14 not proven** |
| **Required changes** | Authorized `eas login` → `eas build --profile production-apk`; device QA; do **not** change application id without approval |
| **Repository** | SWAROOP (+ Backend already live for API) |
| **Dependencies** | Expo org access; optional Maps key in EAS secrets |
| **Test cases** | Install APK; version 3.1.3 (3115); hits DO API; smoke marketplace/KYC/checkout |

---

## Deploy / locality matrix (fixes that exist in git)

| Area | Tag |
|------|-----|
| Marketing claims removal on live sites | **DEPLOYED** |
| Blind grade/product `PRIVATE` on live API | **DEPLOYED** (behaviour) |
| Test product DB soft-deactivate | **NOT applied** (no prod DATABASE_URL) |
| Phase 1 API test-product exclusion filter | **LOCAL ONLY** (needs Backend redeploy) |
| Phase 1 KYC enforce default true + cart guard | **LOCAL ONLY** |
| Phase 1 cart/PR/TDS privacy + PetroTrade→PolyStoreX copy | **LOCAL ONLY** |
| Phase 1 Customer WebApp dedupe/KYC UI/commerce copy | **LOCAL ONLY** |
| Phase 1 Expo guest finance/orders + KYC redirect | **LOCAL ONLY** (needs APK) |
| Mobile 3.1.3 | **LOCAL ONLY** config — **no artifact** |

---

## Phase 1 stop criteria

Phase 1 **code + unit tests** are complete. Phase 2 must wait until:

1. Production DB soft-deactivate **or** Backend redeploy of exclusion filter is verified live (search E2E / HD Blow Test → 0), **or** residual risk accepted in writing  
2. Customer WebApp + Backend redeploys documented with revision ids  
3. See `POLYSTOREX_PHASE1_COMPLETION.md` for full evidence |
