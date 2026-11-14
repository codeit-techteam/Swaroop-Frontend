# PolyStoreX Stabilization Task Tracker — 14 Nov 2026

Companion to `POLYSTOREX_PRODUCTION_STABILIZATION_REPORT.md`.

Status values: `FIXED & VERIFIED` | `IMPLEMENTED — NOT DEPLOYED` | `IN PROGRESS` | `BLOCKED — CLIENT INPUT` | `BLOCKED — ACCESS` | `NEEDS CLIENT APPROVAL` | `NOT STARTED`

| No | Issue | Status | Owner notes |
|---:|---|---|---|
| 1 | Test products | BLOCKED — ACCESS | Script ready; prod DB URL missing |
| 2 | Duplicate listings | IMPLEMENTED — NOT DEPLOYED | Grade-id + commercial-key dedupe; 123/64 live |
| 3 | Fake session/notifications | IMPLEMENTED — NOT DEPLOYED | Mock seed removed |
| 4 | KYC / redirects | IMPLEMENTED — NOT DEPLOYED | Web gate + backend checkout/cart validate guards |
| 5 | Catalogue quality | NEEDS CLIENT APPROVAL | 3748 live; dry-run only |
| 6 | SO- grade codes | BLOCKED — CLIENT INPUT | Await format |
| 7 | TDS PDFs | BLOCKED — CLIENT INPUT | ~550 PDFs |
| 8 | Marketing claims | IMPLEMENTED — NOT DEPLOYED | Login/OTP cleaned |
| 9 | Rebrand | IN PROGRESS | P0 strings; more surfaces remain |
| 10 | 429 / perf | IMPLEMENTED — NOT DEPLOYED | Guard + defaults updated |
| 11 | Domains | NEEDS CLIENT APPROVAL | DO API still live |
| 12 | Logged-out APIs | IMPLEMENTED — NOT DEPLOYED | Guest chrome + public estimate |
| 13 | Data integrity | IN PROGRESS | Partial |
| 14 | Filters | IN PROGRESS | PRIVATE brand expected |
| 15 | Offer expiry 365d | IMPLEMENTED — NOT DEPLOYED | Null = open availability |
| 16 | PR View All | IMPLEMENTED — NOT DEPLOYED | → purchaseRequests |
| 17 | Mobile UX | IN PROGRESS | Browse layout edits in progress |
| 18 | Logo transparency | IN PROGRESS | Assets exist |
| 19 | Pricing policy | IN PROGRESS | Public listing prices; copy alignment |
| 20 | SEO | IMPLEMENTED — NOT DEPLOYED | robots/sitemap/seo helpers |
| 21 | Accessibility | IN PROGRESS | |
| 22 | Blog / chips | IN PROGRESS | No Blog routes in Customer WebApp |
| 23 | APK 3.1.3 | BLOCKED — ACCESS | Config 3.1.3/3115; no EAS build |

## P0 file change index (this session)

### Customer WebApp
- `store/notificationsCatalogStore.ts`
- `components/notifications/NotificationDrawer.tsx`
- `lib/profile-display.ts`
- `lib/customer-data-reset.ts`
- `lib/post-auth-redirect.ts`
- `lib/catalog-mapper.ts`
- `components/onboarding/OnboardingGate.tsx`
- `components/kyc/KycFeatureGate.tsx` (new)
- `components/layout/customer-app-shell.tsx`
- `components/navigation/customer-sidebar.tsx`
- `components/navigation/customer-top-nav.tsx`
- `components/profile/ProfileAvatarButton.tsx`
- `components/auth/login-hero.tsx`
- `components/auth/otp-hero.tsx`
- `components/auth/otp-verification-card.tsx`
- `components/dashboard/procurement-table.tsx`
- `components/marketplace/offers/offer-countdown.tsx`
- `components/marketplace/offers/offer-card.tsx`
- `components/marketplace/offers/featured-offer.tsx`
- `components/marketplace/offers/my-offers-page.tsx`
- `types/offers.ts`
- `middleware.ts`
- `.env.example`

### Backend
- `scripts/soft-deactivate-confirmed-test-products.mjs` (new)
- `src/common/guards/rate-limit.guard.ts` (catalogue/auth buckets + marketplace limit)
- `src/config/configuration.ts`
- `src/config/env.validation.ts`
- `src/modules/customers/checkout/checkout.controller.ts` (KYC on quote / quote-from-cart)
- `src/modules/customers/cart/cart.controller.ts` (KYC on validate)
- `src/modules/customers/kyc/customer-kyc-approved.guard.ts`
- `src/modules/customers/marketplace/marketplace.service.ts` (popularGrades dedupe)
- `.env.example` (`KYC_ENFORCE_FOR_TRADING=true` recommended)
- `tmp/catalogue-dry-run/live-api-marketplace-snapshot-2026-11-14.json`

### Follow-up from audits ([Audit frontends](f2dfee77-79a9-4a50-a265-024f1520af40), [Audit Customer Web](62c14126-c2aa-467f-91c4-c9c9fa45ffdb), [Audit Backend](e152a524-1dc0-40bd-b4dc-eea13bc91f40), [P1 fixes](d928e670-74f4-4f6d-a65f-6dd13e69f67a), [P2/P3 SEO](485b99a1-e65a-41c7-82bb-c617a6e6d491))
- Seller Web still has large mock-backed stores — out of this P0 slice; track separately.
- Grade list manufacturer sanitize may still need DO redeploy for `/public/marketplace/grades` (prior release note).
- APK blocked on EAS `polystorexs-team` authorization.

### Docs
- `SWAROOP/POLYSTOREX_PRODUCTION_STABILIZATION_REPORT.md`
- `SWAROOP/POLYSTOREX_STABILIZATION_TASK_TRACKER.md`
