# PolyStoreX — Phase 2 Completion Report

**Date:** 14 November 2026  
**Scope:** Catalogue audit tooling, grade-code migration dry-run, TDS gates + bulk-import prep, MOQ/pricing validation, data-normalization audit, filters/expiry, DB reconciliation reports, tests.  

**Rule:** Client-dependent destructive cleanup stays **BLOCKED**. No fabricated TDS PDFs. No SO→PS rename.

---

## Live DB reconciliation (queried 14 Nov 2026 ~11:44–11:46Z)

| Metric | Count |
|--------|------:|
| Catalogue grades (all) | **3756** |
| Unique grade codes | **3756** |
| Active grades | **3752** |
| Customer-visible grades | **3748** |
| SO-prefixed codes | **3666** |
| Active products | **125** |
| Live marketplace listings | **123** |
| Live listings price-sane (≥ freight floor) | **122** |
| Duplicate grade candidate groups | **10** |
| Junk-category candidates | **16** |
| Suspected-invalid candidates (heuristic) | **123** |
| Client-reported suspected target | **444** |
| Suspected vs 444 delta | **-321** (list not provided — cannot reconcile exact 444) |
| Missing manufacturers (customer-visible) | **104** |
| Manufacturer coverage % | **97.23** |
| Verified TDS documents | **438** |
| Grades with verified TDS | **437** |
| TDS coverage % of customer-visible | **11.66** |
| Invalid MOQ/price tiers (after remediation) | **0** |
| Expired offers still ACTIVE (after remediation) | **0** |
| Distinct warehouses on live offers | **11** |

Counts come from `npm run catalogue:phase2-report` against production `DATABASE_URL` — not hardcoded.

---

## Workstream status

| # | Workstream | Status | Notes |
|---|------------|--------|-------|
| 1 | Catalogue cleanup preparation | **DONE (tooling)** / cleanup **BLOCKED** | Dry-run reconciliation + pause-suspicious scripts. No permanent grade deletes. No approved client junk CSV (`CLIENT_JUNK_GRADE_LIST` unset). |
| 2 | Grade-code migration | **DONE (dry-run)** / apply **BLOCKED** | Proposed `PSX-{FAMILY}-{GRADE_TOKEN}-{SEQ4}`; 3756 unique proposals; 0 collisions; SO- kept as `legacyAlias`. Explicitly **not** SO→PS. |
| 3 | TDS / quality documentation | **PARTIALLY DONE** / bulk **BLOCKED** | Visibility gated on verified docs; Admin upload/replace exists; bulk-import doc prepared. Client ~550 PDF pack not delivered. |
| 4 | Pricing and MOQ validation | **DONE** | Backend `assertPriceTiersRespectMoq`; frontend drops sub-MOQ tiers; configurable `COMMERCE_MIN_MATERIAL_PRICE_PER_MT`; Best Value uses sane prices only. Prod: deleted 3 invalid tiers. |
| 5 | Data normalization | **DONE (audit)** / apply **BLOCKED** | India/IN, Nylon/PA66, Compound/Virgin flagged for review. No auto-equivalence. |
| 6 | Filters and offer expiry | **PARTIALLY DONE** | Brand filter respects blind policy; warehouses from real hubs; PP/Nylon chip mapping; no fake 365-day countdown; expired ACTIVE offer remediations applied. Credit UI still shows platform 15/30 (matches product model). |
| 7 | Reconciliation reports | **DONE** | Scripts under Backend `scripts/phase2-*.mjs` + `tmp/phase2-*`. |
| 8 | Tests | **DONE** | Backend `phase2-integrity.spec.ts` + MOQ util specs; Customer `lib/phase2-integrity.test.ts`. |

---

## BLOCKED (client-dependent)

1. **Revised catalogue / junk list** — cannot match or hide the reported **444** without an approved CSV/mapping. Heuristic found **123** candidates.
2. **Grade-code production migration** — awaiting client approval of `PSX-…` format (or alternate).
3. **TDS bulk PDF pack (~550)** — do not fabricate; import pipeline ready (`docs/phase2-tds-bulk-import.md`).
4. **Nylon 66 ↔ PA66 GF / Compound ↔ Virgin master rules** — review files only; no inferred technical equivalence.
5. **India vs IN canonical country rewrite** — proposed ISO `IN` + display “India”; apply after client confirmation.

---

## Applied production data fixes (non-catalogue)

Safe integrity remediation (`APPLY=1 catalogue:integrity-remediate`):

- Deleted **3** `offer_price_tiers` rows with `min_qty < moq`
- Set **1** expired `ACTIVE` offer (`OFF-202609-234051`) to `EXPIRED`

These do **not** delete grades or break historical order/cart/offer/TDS FK targets.

---

## Code / tooling delivered

**Backend**

- `scripts/phase2-catalogue-reconciliation.mjs`
- `scripts/dry-run-grade-code-migration.mjs`
- `scripts/phase2-data-normalization-audit.mjs`
- `scripts/phase2-data-integrity-remediation.mjs`
- `docs/phase2-tds-bulk-import.md`
- MOQ assert on offer create/update; price-review gates on activate
- npm scripts: `catalogue:phase2-report`, `catalogue:grade-code-dry-run`, `catalogue:normalize-audit`, `catalogue:integrity-remediate`

**Customer WebApp**

- Quality Documentation gated in highlights + Trust Badges
- `buildProductDocuments` no longer fabricates TDS/MSDS
- Sub-MOQ bulk tiers filtered in `catalog-mapper`
- Brand filter blind copy; warehouse facets from real hubs
- PP / Nylon material chip normalization

---

## Deploy / next steps

1. Redeploy **Swaroop-Backend** and **Swaroop-Customer-WEBAPP** so Phase 2 code paths are live.
2. Client delivers: junk/grade hide list, grade-code format approval, TDS PDF pack + mapping, Nylon/Compound master rules.
3. Re-run `catalogue:phase2-report` after any approved cleanup.
4. Rotate DB password if still exposed from earlier session screenshots.

---

## Phase 2 stop criteria

- [x] Dry-run catalogue reconciliation with DB-backed counts  
- [x] Grade-code dry-run report (no production rewrite)  
- [x] TDS visibility gates + bulk-import prep (no fake PDFs)  
- [x] MOQ/pricing validation + integrity remediation for bad tiers/expiry  
- [x] Normalization audit marked BLOCKED for apply  
- [x] Tests + this status report updated  
- [ ] Client-approved destructive catalogue cleanup — **BLOCKED**  
- [ ] Production grade-code migration — **BLOCKED**  
- [ ] TDS bulk load complete — **BLOCKED**  
