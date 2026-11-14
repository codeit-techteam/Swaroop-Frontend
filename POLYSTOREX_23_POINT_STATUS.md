# PolyStoreX — 23-Point Client Issue Status

**Audit date:** 14 November 2026  
**Phase 1 code update:** 14 November 2026 — see `POLYSTOREX_PHASE1_COMPLETION.md`  
**Phase 2 code update:** 14 November 2026 — see `POLYSTOREX_PHASE2_COMPLETION.md`  
**Phase 3 code update:** 14 November 2026 — see `POLYSTOREX_PHASE3_COMPLETION.md`  
**Phase 4 code update:** 14 November 2026 — see `POLYSTOREX_PHASE4_COMPLETION.md`  
**Phase 5 independent verification:** 14 November 2026 — see `POLYSTOREX_FINAL_CLIENT_HANDOVER.md`  
**Platform production-ready:** **NO** (APK blocked; buyer E2E not executed; Phase 2–4 largely LOCAL ONLY; prod DB SQL blocked — localhost env only)  
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
| **Current implementation** | API exclusion **DEPLOYED** (`361af18`) + DB soft-deactivate **applied** 14 Nov ~11:30Z UTC. |
| **Status** | **DONE** (**DEPLOYED**) |
| **Evidence** | Soft-deleted products `97625de6-…` / `6facf910-…`; paused offers `OFFER-2026-381852` / `OFFER-2026-513092`. Live search E2E + HD Blow Test → 0; `meta.total` 122. Grade “HD Blow” left intact. |
| **Required changes** | Rotate exposed DB password; optional remove temporary Trusted Source IP later |
| **Repository** | Swaroop-Backend |
| **Dependencies** | None for Issue #1 |
| **Test cases** | Live search 0; DB soft-deleted (done) |

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
| **Current implementation** | Privacy on customer payloads. Phase 2 dry-run reconciliation: **3748** customer-visible grades; heuristic junk **16** / suspected-invalid **123** (client target **444** unmatched — no approved list). Cleanup apply **BLOCKED**. |
| **Status** | **PARTIALLY DONE** — privacy **DEPLOYED**; junk cleanup **BLOCKED** on client list |
| **Evidence** | `catalogue:phase2-report` summary 14 Nov; `tmp/phase2-reconciliation/`; privacy sanitize paths from Phase 1 |
| **Required changes** | Client approved hide/mapping CSV → pause/hide (preserve FKs); redeploy any new code |
| **Repository** | Backend |
| **Dependencies** | Junk CSV / revised catalogue |
| **Test cases** | Customer TDS/cart/PR never show real maker; Admin still sees real data |

---

## Issue 6 — Grade codes (SO- prefix)

| Field | Detail |
|-------|--------|
| **Client expectation** | New PolyStoreX code standard (format TBD by client) |
| **Current implementation** | Live **3666** SO- codes. Dry-run proposes `PSX-{FAMILY}-{GRADE_TOKEN}-{SEQ4}` — **3756** unique, **0** collisions; SO- retained as `legacyAlias`. **Not** a simple SO→PS replace. Production apply **BLOCKED**. |
| **Status** | **BLOCKED** (dry-run **DONE**) |
| **Evidence** | `catalogue:grade-code-dry-run` → `tmp/phase2-grade-code-migration/summary.json`; `phase2-integrity.spec.ts` format contract |
| **Required changes** | Client approves format → dual-read schema (`legacy_code` / aliases) → migrate without rewriting UUIDs |
| **Repository** | Backend (generation + migration) |
| **Dependencies** | Client code-standard approval — **do not migrate first** |
| **Test cases** | Generator uniqueness; buyer-facing sanitize; FK preservation |

---

## Issue 7 — TDS unavailable / Quality Documentation

| Field | Detail |
|-------|--------|
| **Client expectation** | Real TDS PDFs; do not invent docs; Quality Documentation only when files exist |
| **Current implementation** | Gating strengthened (highlights + Trust Badges + no fabricated `buildProductDocuments`). Prod: **438** verified TDS / **437** grades (**11.66%** of customer-visible). Bulk import prep documented; ~550 client PDFs **not** loaded. |
| **Status** | **PARTIALLY DONE** (gating) / bulk content **BLOCKED** on client |
| **Evidence** | `docs/phase2-tds-bulk-import.md`; recon `verifiedTdsDocuments=438`; Customer TrustBadges `hasQualityDocs`; `phase2-integrity` TDS gate test |
| **Required changes** | Client PDF pack + mapping → `import:tds` dry-run then apply; keep VERIFIED gate |
| **Repository** | Backend TDS + Admin upload + Customer/Mobile UI |
| **Dependencies** | Client PDF pack + mapping list |
| **Test cases** | Grade without TDS: unavailable + no false trust tick; with verified file: download works |

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
| **Current implementation** | Phase 3: catalogue fan-out capped (≤3×48 pages, sequential); in-flight + store dedupe; **no 429 auto-retry**; `Retry-After` header; guest home/categories **30s TTL cache** (bumped on offer lifecycle); offer marketplace index applied. Live baseline 14 Nov: products20 **0.61s**, products100 **0.43s**, home **0.46s**, burst50 **0×429**. Auth/OTP bucket still `min(default,60)`. |
| **Status** | **PARTIALLY DONE** — code **DONE** (`LOCAL ONLY` pending Backend + Customer redeploy) |
| **Evidence** | `POLYSTOREX_PHASE3_COMPLETION.md` timings; `services/catalog.ts` MAX_PAGES=3; `apiClient.ts` 429 guard; `marketplace-cache.ts`; `phase3-catalog-loading.test.ts` |
| **Required changes** | Redeploy Backend + Customer; optional Redis if multi-instance |
| **Repository** | Backend + Customer-WEBAPP (+ mobile) |
| **Dependencies** | DO / Vercel redeploy |
| **Test cases** | Cold marketplace ≤6 catalogue GETs; burst GETs under limit; no 429 retry storms |

---

## Issue 11 — Production server and domains

| Field | Detail |
|-------|--------|
| **Client expectation** | Stable production URLs; audit hardcoded interim hosts |
| **Before status (Phase 0)** | **PARTIALLY DONE** |
| **Current implementation** | **LIVE:** `www` / `customer` / `seller` / `admin`.polystorex.com (HTTPS 200). **API custom domain NOT ready** (`api.polystorex.com` NXDOMAIN). Keep DO API. Backend CORS defaults include custom web hosts (redeploy). Docs: `docs/PRODUCTION_DOMAINS.md`. |
| **Status** | **PARTIALLY DONE** — web domains LIVE; API cutover **BLOCKED** |
| **Evidence** | curl 200 on four web hosts; dig empty for api; DO health 200 |
| **Required changes** | DO custom domain for API + TLS; then env flip; Customer `NEXT_PUBLIC_APP_URL` |
| **Repository** | All six |
| **Dependencies** | DNS for API; Vercel/DO env |
| **Test cases** | Smoke each hostname + TLS + CORS + OTP |

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
| **Current implementation** | MOQ tier validation enforced in code; prod remediated **3** invalid tiers → **0**; **1** expired ACTIVE offer → `EXPIRED`. Normalization audit: India/IN samples **107**, Nylon/PA review **4**, Compound review **92** — apply **BLOCKED** (no inferred equivalence). Demo bootstrap tiers start at MOQ 12. |
| **Status** | **PARTIALLY DONE** — integrity **DONE**; master-data normalize **BLOCKED** |
| **Evidence** | `assertPriceTiersRespectMoq`; `catalogue:integrity-remediate` apply 14 Nov; `catalogue:normalize-audit`; `phase2-integrity.spec.ts` |
| **Required changes** | Client master rules for country / Nylon-PA66 / Compound-Virgin; then controlled rewrite |
| **Repository** | Backend seeds + Admin data tools |
| **Dependencies** | Client mapping sheet |
| **Test cases** | Offer activation rejects tier below MOQ; landed math; no auto Nylon≡PA66 |

---

## Issue 14 — Filters

| Field | Detail |
|-------|--------|
| **Client expectation** | Useful Brand/Warehouse/Credit/category filters including PP/Nylon |
| **Current implementation** | Brand filter shows blind-policy copy + disabled when only PRIVATE. `warehousesFromProducts` prefers real hub labels (11 distinct live warehouses). PP/Nylon chip codes normalized in `material-taxonomy`. Credit toggle still “15 / 30 Day Platform Credit”. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY` until Customer redeploy) |
| **Evidence** | `brand-filter.tsx`; `warehousesFromProducts`; `materialsFromCatalog` PP/NYLON; recon `distinctWarehouses=11` |
| **Required changes** | Redeploy Customer WebApp; optional credit facet driven purely from offer payment methods |
| **Repository** | Customer-WEBAPP, SWAROOP, Backend aggregations |
| **Dependencies** | Blind-marketplace product policy |
| **Test cases** | Filter facets match offer attributes; PP/Nylon appear when catalogue has them |

---

## Issue 15 — Today’s Offers “Ends in 365 Days”

| Field | Detail |
|-------|--------|
| **Client expectation** | Honest expiry / countdown |
| **Current implementation** | Mapper never fabricates expiry; null → not limited-time. Marketplace query excludes `validUntil < now`. Prod expired ACTIVE offer remediations: **0** remaining. Frontend test asserts no fake 365-day expiry. |
| **Status** | **PARTIALLY DONE** — code **DONE**; Customer redeploy **LOCAL ONLY** pending |
| **Evidence** | `catalog-mapper.ts` expiresAt null path; `marketplace.service.ts` validUntil filter; integrity remediate expire; `phase2-integrity.test.ts` |
| **Required changes** | Redeploy Customer WebApp; spot-check Today’s Offers UI |
| **Repository** | Customer-WEBAPP |
| **Dependencies** | Vercel deploy |
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
| **Current implementation** | Compact search + category chips; fixed `StickyMarketToolbar` (Sort\|Filter); promo/hero moved to **list footer**; touch targets ≥40×44; safe-area padding kept. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY` — needs APK rebuild) |
| **Evidence** | `sticky-market-toolbar.tsx`; `market-screen.tsx` layout; `category-filter.tsx` min touch sizes |
| **Required changes** | Device QA on small Android widths after APK (#23) |
| **Repository** | SWAROOP |
| **Dependencies** | APK rebuild (#23) |
| **Test cases** | First viewport shows ≥1 product card; toolbar remains while scrolling |

---

## Issue 18 — Logo black background

| Field | Detail |
|-------|--------|
| **Client expectation** | Correct logo on light/dark surfaces; transparent asset if needed |
| **Current implementation** | Prepared `polystorex-logo-on-light.png` (transparent, dark wordmark from supplied artwork). Light surfaces across Customer/Website/Admin/Seller/Expo use on-light; dark surfaces keep transparent white wordmark. Black-plate `logo-light-bg` removed from white chrome. |
| **Status** | **PARTIALLY DONE** (`LOCAL ONLY` until redeploys) |
| **Evidence** | Asset in `*/public/brand/polystorex-logo-on-light.png` + `SWAROOP/assets/brand/`; logo components updated; corners alpha=0 verified |
| **Required changes** | Redeploy all frontends; visual QA light/dark |
| **Repository** | All frontends |
| **Dependencies** | Deploy access |
| **Test cases** | White header/login: no black plate; dark splash: white wordmark readable |

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
| **Current implementation** | Website robots/sitemap/OG **LIVE** on www. Customer code: canonical `customer.polystorex.com`, hostname-only Host, sitemap includes **live-offer grade detail URLs**, private routes disallowed. Redeploy required for live Host/sitemap. |
| **Status** | **PARTIALLY DONE** — Website **DEPLOYED**; Customer SEO **LOCAL ONLY** until Vercel redeploy |
| **Evidence** | Live www robots/sitemap; `phase4-seo.test.ts`; `app/sitemap.ts` fetches `hasOffers=true` grades |
| **Required changes** | Redeploy Customer; set `NEXT_PUBLIC_APP_URL=https://customer.polystorex.com` |
| **Repository** | Website + Customer-WEBAPP |
| **Dependencies** | Vercel redeploy |
| **Test cases** | robots Host = customer.polystorex.com; sitemap has `/marketplace/grades/{uuid}` |

---

## Issue 21 — Accessibility

| Field | Detail |
|-------|--------|
| **Client expectation** | WCAG AA: contrast, labelled controls |
| **Current implementation** | Phase 3: global `:focus-visible` ring; marketplace sort labelled + contrast; logo alt text; mobile toolbar semantics / touch targets. Full axe 165+ checklist **not** certified. |
| **Status** | **PARTIALLY DONE** |
| **Evidence** | `styles/globals.css`; `sort-dropdown.tsx`; `docs/ACCESSIBILITY.md` Phase 3 section; Website `LogoMark` alt |
| **Required changes** | Production axe scan (guest + auth); automated CI optional |
| **Repository** | Customer-WEBAPP (primary), Website, Seller, Admin |
| **Dependencies** | Post-deploy QA |
| **Test cases** | axe critical=0 on login/marketplace/cart; form inputs have names |

---

## Issue 22 — Blog empty; polymer chips

| Field | Detail |
|-------|--------|
| **Client expectation** | Blog content; clickable polymer chips → marketplace |
| **Current implementation** | Homepage ecosystem chips linked. `/materials` polymer families (PP/PVC/HDPE/Nylon/…) now link to marketplace filters. Blog nav/preview hidden without Sanity; `/blogs` noIndex when unconfigured; sitemap omits `/blogs` without posts. |
| **Status** | **PARTIALLY DONE** — chips/empty-blog UX **DONE** (`LOCAL ONLY` until Website redeploy); content still **BLOCKED** on Sanity posts |
| **Evidence** | `app/materials/page.tsx` anchors; `blogs/page.tsx` noIndex; `sitemap.ts` conditional `/blogs` |
| **Required changes** | Redeploy Website; publish Sanity posts when ready |
| **Repository** | Swaroop-Website |
| **Dependencies** | Sanity credentials + authors |
| **Test cases** | PP/Nylon chip → marketplace search; empty blog not in nav/sitemap |

---

## Issue 23 — Android APK

| Field | Detail |
|-------|--------|
| **Client expectation** | Ship APK with latest mobile+backend sync (newer than reported 3.1.2 / 4 Nov) |
| **Current implementation** | Release config ready: **3.1.3 / 3115**, `com.swaroop.app` unchanged, `production-apk` → DO API. **No APK artifact.** EAS CLI as `sumit.codeit1` → **Entity Not Authorized** for App `ccf88988-…` / org `polystorexs-team`. Release step **stopped**. |
| **Status** | **BLOCKED** |
| **Evidence** | `eas project:info` error 14 Nov; `POLYSTOREX_PHASE4_COMPLETION.md` §4; `app.config.ts` / `eas.json` |
| **Required changes** | Invite builder to `polystorexs-team`/`polystorex` → `eas build --profile production-apk`; device QA; **do not** change application id |
| **Repository** | SWAROOP (+ Backend already live for API) |
| **Dependencies** | Expo org access; optional Maps key in EAS secrets |
| **Test cases** | Install APK; version 3.1.3 (3115); hits DO API; smoke marketplace/KYC/checkout |

---

## Deploy / locality matrix (fixes that exist in git)

| Area | Tag |
|------|-----|
| Marketing claims removal on live sites | **DEPLOYED** |
| Blind grade/product `PRIVATE` on live API | **DEPLOYED** (behaviour) |
| Test product DB soft-deactivate | **DONE** (applied 14 Nov 2026 ~11:30Z UTC) |
| Phase 1 API test-product exclusion filter | **DEPLOYED** (`361af18` — live search 0) |
| Phase 1 KYC enforce default true + cart guard | **DEPLOYED** (`361af18`; confirm env not `false`) |
| Phase 1 cart/PR/TDS privacy + PetroTrade→PolyStoreX copy | **DEPLOYED** (`361af18`) |
| Phase 1 Customer WebApp dedupe/KYC UI/commerce copy | **DEPLOYED** (`bedd18c` Vercel Production success) |
| Phase 1 Expo guest finance/orders + KYC redirect | **LOCAL ONLY** (needs APK) |
| Mobile 3.1.3 | **LOCAL ONLY** config — **no artifact** |
| Phase 2 reconciliation scripts + MOQ/expiry DB remediation | **DONE** (scripts local; DB apply 14 Nov) |
| Phase 2 Customer TDS/MOQ/filter UI hardening | **LOCAL ONLY** (needs Vercel redeploy) |
| Phase 2 grade cleanup / SO→PSX migrate / TDS bulk | **BLOCKED** (client) |
| Phase 3 catalogue fan-out / cache / logo / mobile UX | **LOCAL ONLY** (see `POLYSTOREX_PHASE3_COMPLETION.md`) |
| Phase 3 offer marketplace index on prod DB | **DONE** (applied 14 Nov) |

---

## Phase 1 stop criteria

Phase 1 **code + unit tests** are complete (see `POLYSTOREX_PHASE1_COMPLETION.md`). Live health + marketplace verified 14 Nov.

## Phase 2 stop criteria

Phase 2 **tooling + integrity fixes + tests** complete. Client-dependent items remain **BLOCKED**:

1. Approved junk/revised catalogue list (cannot close exact **444**)  
2. Grade-code format approval before production migration  
3. ~550 TDS PDF pack + mapping  
4. Nylon/PA66 and Compound/Virgin master rules  

See `POLYSTOREX_PHASE2_COMPLETION.md`.

## Phase 3 stop criteria

Phase 3 **code + measured baselines + tests** complete:

1. 429 root-cause fan-out fixed without disabling global rate limits  
2. Marketplace timings recorded; guest cache + index shipped  
3. Mobile sticky Sort\|Filter + first-viewport cards  
4. Transparent on-light logo wired  
5. A11y focus/labels/contrast improvements (full axe still open post-deploy)  

Redeploy Backend + frontends to move Phase 3 from **LOCAL ONLY** → **DEPLOYED**.

## Phase 4 stop criteria

Phase 4 **code + domain audit + APK prep** complete (see `POLYSTOREX_PHASE4_COMPLETION.md`):

1. Website SEO LIVE (robots/sitemap/OG HTTPS www)  
2. Customer SEO code: canonical `customer.polystorex.com`, grade sitemap, private Disallow — **LOCAL ONLY** until Vercel redeploy (`NEXT_PUBLIC_APP_URL`)  
3. Materials/homepage polymer chips → marketplace filters; empty blog hidden/noIndex  
4. Web domains LIVE; `api.polystorex.com` **BLOCKED** (DNS) — keep DO API  
5. APK config 3.1.3 / 3115 / `com.swaroop.app` audited; EAS build **BLOCKED** (Entity Not Authorized) — **no APK claimed**  
6. `phase4-seo.test.ts` pass (15 suite tests total including prior phases)

### Deploy / release board (Phase 4)

| Track | Status |
|-------|--------|
| Phase 4 Customer SEO + grade sitemap | **LOCAL ONLY** (live sitemap still interim Vercel URLs, no grade paths) |
| Phase 4 Website blog/chips | **LOCAL ONLY** until Website redeploy (homepage chips already linked in prior deploy) |
| Phase 4 Backend CORS `*.polystorex.com` | **LOCAL ONLY** until DO redeploy |
| APK 3.1.3 (3115) | **BLOCKED** — EAS access |
| API custom domain | **BLOCKED** — DNS |
