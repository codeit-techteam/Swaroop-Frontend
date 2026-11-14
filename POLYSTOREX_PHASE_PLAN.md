# PolyStoreX — Phased Implementation Plan (Post-Audit)

**Based on:** Phase 0 audit of 14 November 2026  
**Rule:** Do not start a phase until its entry criteria and client blockers for that phase are met.  
**Safety:** No destructive catalogue deletes; no grade-code migration; no new Android application id without approval.

---

## Guiding principles

1. **Production data first for P0 visibility** — test SKUs and junk grades hurt trust more than polish.  
2. **Deploy what is already coded** before large new features.  
3. **Blind marketplace policy stays** unless client changes it — fix UX around PRIVATE, don’t “restore brands” unilaterally.  
4. **Mobile APK** only after web/API stabilisation smoke, unless client prioritises APK earlier.  
5. Every phase ends with **evidence** (API probes, screenshots, build URLs, test logs).

---

## Phase 1 — Production data & deploy hygiene (P0 unblock)

**Goal:** Remove false catalogue signals and ship already-written buyer fixes.

### Entry criteria
- [ ] Production `DATABASE_URL` available via secure channel  
- [ ] DO Trusted Sources allow runner IP  
- [ ] Managed DB backup completed  

### Workstream A — Test products (#1)
1. Re-run `confirm-live-test-products.mjs` against live API.  
2. Dry-run `soft-deactivate-confirmed-test-products.mjs`.  
3. Apply with `--apply` for confirmed IDs only.  
4. Re-probe search for both names → expect 0.

### Workstream B — Redeploy coded fixes
1. Confirm/redeploy **Customer WebApp** (`main` including KYC/guest/expiry/PR link).  
2. Confirm/redeploy **Backend** (`948d29e` or later) and record image/deploy id.  
3. Decide and set `KYC_ENFORCE_FOR_TRADING` only after client policy written.  
4. Smoke: guest sidebar, notifications empty, offer countdown, PR View All, health.

### Workstream C — Claims / branding smoke (#8, partial #9)
1. Re-grep live sites for banned claims.  
2. Spot-check customer portal title = PolyStoreX.

### Exit criteria
- Test products absent from public API  
- Customer WebApp production revision documented  
- Backend deploy revision documented  
- Issue #1 → DONE; #8 remains DONE; #3/#4/#15/#16 move to NEEDS VERIFICATION → DONE after QA  

### Dependencies
Prod DB access; Vercel/DO deploy access; KYC policy decision.

---

## Phase 2 — Catalogue trust & trading guards (P0 remainder)

**Goal:** Junk hygiene, TDS readiness, KYC/Buy Now correctness, PetroTrade user-visible copy.

### Entry criteria
- Phase 1 exit met  
- Client junk-grade list **or** written hide rules  
- Client KYC trading definition (what is “0/4” vs buy-enabled)  

### Workstream A — Junk grades (#5)
1. Map client list → `customerVisible=false` (prefer hide over delete).  
2. Tighten importer defaults for SUBSCRIPTION/DISABLED-like categories.  
3. Admin bulk tools + audit report.  
4. **Do not** delete Source.One rows without approved source list.

### Workstream B — KYC / navigation / Buy Now (#4)
1. Align `KycFeatureGate` with admin-approved KYC (not GST-or-onboarding alone).  
2. Disable Buy Now / cart CTA in UI when incomplete.  
3. Soften Expo redirects to explicit KYC panel (parity with web).  
4. Enable backend guard in prod only if client confirms.

### Workstream C — TDS pipeline (#7)
1. Receive ~550 PDFs + mapping.  
2. Import/verify via existing TDS modules.  
3. Keep Quality Documentation gated on real files.

### Workstream D — PetroTrade user strings (#9)
1. Replace customer-visible “PetroTrade Credit” / notification copy with PolyStoreX.  
2. Preserve historical `PT-ORD` / order references.  
3. Plan storage-key migration (`petrotrade.*` → `polystorex.*`) with one-time clear.

### Workstream E — Duplicate UX (#2)
1. Client chooses: one card per `gradeId` vs multi-offer.  
2. Unify Recommended Grades dedupe on `gradeId`.  
3. Mobile related-products parity.

### Exit criteria
- Junk searches empty (or only approved leftovers)  
- Buy Now blocked for incomplete KYC per policy  
- TDS path proven on sample grades  
- No PetroTrade in new customer-facing API messages  

### Dependencies
Junk list; TDS pack; KYC policy; credit product rename approval.

---

## Phase 3 — Performance, public API behaviour, filters (P1)

**Goal:** Fix 429/slowness, guest API noise, filter/data correctness.

### Entry criteria
- Phase 2 trading guards stable  
- Optional: Redis/shared store decision for rate limits  

### Workstream A — Performance (#10)
1. Profile marketplace/grade endpoints (Prisma includes, N+1).  
2. Replace client 10-page catalog hydrate with server filters + pagination.  
3. Tune throttle; consider Redis for multi-instance DO.  
4. Add cache for public catalogue summaries if safe.

### Workstream B — Guest API (#12) + price policy copy (#19)
1. Gate Expo home finance/orders.  
2. Align website/home copy with **listing prices public** policy (or change policy with approval).  
3. Ensure PDP guest path uses public estimate only.

### Workstream C — Data consistency (#13) + filters (#14)
1. Client mapping sheet: regions/hubs, Nylon↔PA66, Compound vs Virgin.  
2. Enforce offer tier ≥ MOQ on activate.  
3. Replace Brand=PRIVATE dead-end with polymer/family facet if approved.  
4. Align credit filter to 15/30.

### Workstream D — Domains (#11)
1. DNS cutover checklist from `POLYSTOREX_CLIENT_DEPENDENCIES.md`.  
2. Update env + CORS; keep interim hosts until green.

### Exit criteria
- Marketplace p95 under agreed SLA  
- Guest DevTools clean of 401 storms  
- Filters match live offers  
- Custom domains optional but documented  

### Dependencies
Mapping sheet; DNS; infra for Redis (optional).

---

## Phase 4 — Mobile UX, APK release, SEO/a11y (P2 + #23)

**Goal:** Ship Android 3.1.3 and close UX/SEO/a11y gaps.

### Entry criteria
- Phase 1–3 API behaviour acceptable on devices  
- EAS access to `polystorexs-team`  

### Workstream A — Mobile marketplace (#17)
1. Compact search/categories.  
2. Sticky Sort \| Filter.  
3. First-viewport product visibility.

### Workstream B — APK (#23)
1. Confirm `com.swaroop.app` retained.  
2. `eas build --platform android --profile production-apk`.  
3. Device QA matrix; publish artifact link.  
4. Do **not** create new application id.

### Workstream C — Logo (#18)
1. Surface-by-surface variant audit.  
2. Optional transparent asset from brand.

### Workstream D — SEO (#20) + a11y (#21) + blog/chips (#22)
1. Customer sitemap policy for grades.  
2. axe CI on critical routes; contrast pass.  
3. Sanity blog content; materials page chips clickable.

### Workstream E — Grade codes (#6) — **planning only**
1. Collect client target format.  
2. Write migration design (dual-read).  
3. **No production migration in Phase 4** without signed approval.

### Exit criteria
- Installable APK 3.1.3 (3115) verified  
- Mobile first-viewport acceptance  
- SEO/a11y/blog acceptance checklist signed  

### Dependencies
EAS org; Sanity; brand assets; SEO indexing policy.

---

## Phase 5 — Hardening, migration execution, release engineering

**Goal:** Execute approved migrations; observability; regression suite; production readiness sign-off.

### Entry criteria
- Written approvals for: grade-code migration (#6), any catalogue deletes, domain cutover complete  

### Workstream A — Grade code migration (#6)
1. Dual-write/dual-read window.  
2. Backfill with uniqueness checks.  
3. Customer-visible sanitize updated.  
4. Rollback plan tested on staging.

### Workstream B — Observability & QA
1. Health payload includes build SHA.  
2. Synthetic checks: marketplace, OTP, KYC gate, checkout.  
3. Expand Vitest + add Customer WebApp smoke tests.  
4. Catalogue dry-run reports in CI (read-only).

### Workstream C — Release engineering
1. Document deploy owners for DO/Vercel/EAS.  
2. Forbidden-claims grep in CI.  
3. APK + web release checklist template.

### Exit criteria
- All 23 issues either DONE or explicitly accepted residual risk  
- Production sign-off document with evidence links  

---

## Recommended safe order (compressed)

```
1. Prod backup + soft-deactivate test products (#1)
2. Redeploy Customer WebApp + Backend; document SHAs (#3,#4,#10,#15,#16)
3. Client junk list → hide grades (#5)
4. KYC UI + optional KYC_ENFORCE (#4)
5. PetroTrade customer-visible string pass (#9)
6. Recommended-grades gradeId dedupe (#2)
7. Performance + guest API + filters (#10,#12,#14,#19)
8. Data mapping corrections (#13)
9. Mobile layout + EAS APK (#17,#23)
10. SEO / a11y / blog (#20,#21,#22)
11. Logo QA (#18)
12. Domains DNS (#11) when ready
13. TDS ingest when PDFs arrive (#7)
14. Grade-code migration only after approval (#6)
```

---

## Phase ownership (suggested)

| Phase | Primary repos |
|-------|----------------|
| 1 | Backend, Customer-WEBAPP |
| 2 | Backend, Admin, Customer-WEBAPP, SWAROOP |
| 3 | Backend, Customer-WEBAPP, Website, SWAROOP |
| 4 | SWAROOP, Website, Customer-WEBAPP |
| 5 | Backend + all clients |

---

## Out of scope unless re-approved

- Changing Android package to `com.polystorex.app`  
- Mass deletion of 3,748 grades  
- Inventing TDS PDFs  
- Choosing a new commercial price-visibility policy without client sign-off  
- Migrating historical order reference prefixes  
