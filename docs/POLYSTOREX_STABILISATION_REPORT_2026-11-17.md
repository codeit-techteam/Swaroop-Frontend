# PolyStoreX production stabilisation report

**Date:** 17 November 2026  
**Evidence:** live HTTPS checks against the current hosts, plus the code on `main` in each repository.  
**Deployment:** none of the code changes in this session have been deployed. Production behaviour below is what the live hosts returned today.

## Production URLs checked today

| App | URL | Result |
| --- | --- | --- |
| Public website | https://www.polystorex.com | HTTP 200. https://polystorex.com returns 308 to www. |
| Customer WebApp | https://customer.polystorex.com | HTTP 307 to `/login`. |
| Seller WebApp | https://seller.polystorex.com | HTTP 200. |
| Admin Panel | https://admin.polystorex.com | HTTP 307 to `/login`. |
| Interim website host | https://swaroop-website.vercel.app | HTTP 404 `NOT_FOUND`. The custom domain is the live site. |
| Interim customer host | https://swaroop-customer-webapp.vercel.app | HTTP 307 to `/login`. |
| Interim seller host | https://swaroop-seller-webapp.vercel.app | HTTP 200. |
| Interim admin host | https://swaroop-admin-pi.vercel.app | HTTP 307 to `/login`. |
| Backend | https://swaroop-backend-xzwkz.ondigitalocean.app | `/api/v1/health` and `/health` HTTP 200, `database=connected`, OTP provider `msg91`, `authStrictOtp=true`. |
| Target API host | https://api.polystorex.com | DNS does not resolve (`NXDOMAIN`). No CNAME exists to copy. |

API prefix in production is `/api/v1`.

## A. Client issue tracker

| # | Client issue | Repository | Root cause | Changes this session | Tests | Deploy required | Production verified | Blocker | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Custom API domain `api.polystorex.com` | All clients + backend | No DNS record. Clients correctly still call the DigitalOcean host. | CORS now allow-lists the five PolyStoreX origins, the known Vercel production hosts, and the DigitalOcean API host. Localhost is allowed only outside production. Arbitrary `*.vercel.app` hosts are allowed only when `CORS_ALLOW_PLATFORM_HOSTS=true`. API base URLs were **not** switched. | Not deployed. Live preflight for `https://customer.polystorex.com` already returns `access-control-allow-origin` on the current deployment. | Yes, backend only, after DNS exists for the API host. Frontends stay on the DigitalOcean URL until then. | Custom domain: no. Current API health: yes. | Client must add the DigitalOcean CNAME. The target value is not in this repo and was not invented. | BLOCKED BY CLIENT INPUT / ACCESS |
| 2 | Sample notifications: Monsoon rates, August GST invoices, Navratri 22 Sept | Admin, Customer Web, Seller Web | Admin `GET /api/push-notifications` serves an in-memory fixture. Navratri was `SCHEDULED` for 22 Sept 2026, and `promoteDueScheduled()` rewrites `sentAt` to the current time when the date has passed. Confirmed live on both admin hosts at 17 Nov 2026 06:12 UTC: `PSH-2401`, `PSH-2403`, `PSH-2404` with Navratri `sentAt=2026-11-17T06:12:54.619Z`. | Fixture list emptied. Those IDs and titles are rejected by the admin API and dropped by customer and seller inboxes. Guests no longer poll the admin inbox. Seller notification store no longer starts from the local mock list. | Customer `lib/sample-admin-pushes.test.ts` passed (2). Backend notification ownership test passed. | Yes. Admin, Customer Web, and Seller Web. | Still visible in production until those three apps are redeployed. | None for the code fix. | IMPLEMENTED BUT NOT DEPLOYED |
| 3 | 121 listings vs 62 unique grades, duplicate offers | Backend catalogue | Live public API on 17 Nov: **122** offers, **122** products, **53** distinct grade ids inside those offers, **51** grades with more than one offer. **59** offer groups share the same grade, price, MOQ and quantity (59 extra rows). Public payloads do not include seller id or warehouse id, so those rows were not classified as confirmed duplicates. | No rows deleted or deactivated. | Live read of `/api/v1/public/marketplace/offers`. | No | Counts above are from production. Cleanup was not applied. | Need seller id, warehouse id and an approved keep/remove list before any delete. Local `DATABASE_URL` returned `ECONNREFUSED`, so the DB reconciliation script could not run. | PARTIALLY IMPLEMENTED |
| 4 | Manufacturer filter shows only PRIVATE | Backend + Customer Web | Buyer payloads replace the grade-master manufacturer with the literal `PRIVATE`. Live grade list: 3,748 grades, 3,748 `manufacturer=PRIVATE`. Seller identity is a separate field (`ANONYMOUS SUPPLIER`) and was already hidden. | Buyer `manufacturer` / `brand` now return the grade-master manufacturer. Product-level aliases such as `Relindvb` are still not used. Supplier stays `ANONYMOUS SUPPLIER`. Customer filter label is Manufacturer and is no longer disabled solely because the value is PRIVATE. | Backend mapper, marketplace and phase-2 specs passed. | Yes, backend and Customer Web. | Production still returns PRIVATE until the backend deploy. | None | IMPLEMENTED BUT NOT DEPLOYED |
| 5 | About 444 junk grades | Backend | Not confirmed. The approved deletion list has not been supplied. Public directory has 82 non-`SO-` codes (`HDPE_FILM`, `PP_INJECTION`, and similar family codes) which are candidates only. | No deactivation and no deletion. | Live grade-code count only. | No | Candidate count only. | Waiting for the client's approved list. | BLOCKED BY CLIENT INPUT / ACCESS |
| 6 | 3,666 codes start with `SO-` | Backend | Confirmed on the public grade directory: **3,666** of **3,748** customer-visible grades use an `SO-` code. | New Source.One imports now generate `PSX-{FAMILY}-{GRADE}-{SEQ4}` and omit manufacturer and seller names. Existing rows are matched on `sourceKey` and their `code` column is not updated. | `source-one-csv.spec.ts` passed, including a 3000D example that does not contain `TAITA`. | Yes, before the next grade import. Do not run an import until the client accepts the format. | Count verified. Codes in the database were not changed. | Client approval before any production code rewrite or import. | IMPLEMENTED BUT NOT DEPLOYED for new codes only. Existing codes NOT MIGRATED. |
| 7 | ABS EXTRUSION 3000D has `ABS_EXTRUSION_SR101_TDS.pdf` | Backend TDS | Live `GET /api/v1/public/marketplace/grades/a7b4c0bd-6107-4037-a67e-3d3d83355bae/tds` returns document `71b31aba-d2de-443f-95aa-f3d427d8bb4c`, filename `ABS_EXTRUSION_SR101_TDS.pdf`, status `VERIFIED`. | Customer and public TDS reads drop that filename when the grade is 3000D. The SR101 grade keeps the same filename. No replacement file was attached. Dry-run script: `Swaroop-Backend/scripts/unlink-wrong-abs-3000d-tds.mjs`. It was not applied. | `incorrect-tds-mappings.spec.ts` passed. | Yes, backend. A database unlink still needs a reachable production `DATABASE_URL` and a backup. | Wrong file still returned by production. | Local database connection refused. Production credentials were not used from this machine. | IMPLEMENTED BUT NOT DEPLOYED (API filter). Database unlink NOT APPLIED. |
| 8 | Missing TDS documents | Backend | All **53** grades that currently have live offers returned `available: false` on the public TDS endpoint. A full missing-TDS list for the other 3,695 grades needs the database script `scripts/phase2-catalogue-reconciliation.mjs`, which could not connect. | No fabricated documents. Unavailable copy already exists in `listForGrade` when no verified file remains. | Live TDS fetch for the 53 offer grades. | No | Offer-grade gap verified. Full catalogue gap not exported. | Database access. | PARTIALLY IMPLEMENTED |
| 9 | 401s on public pages | Customer Web + backend | `GET /api/v1/customer/marketplace/grades` is authenticated and returns 401, which is correct. Guests are supposed to use `/api/v1/public/marketplace/...`, and that route returned 200. Guest calls to orders and cart return 401. There is no public `/api/v1/notifications` route (404). | No auth bypass. Guest admin-push polling stopped. | Live guest requests. | Customer Web deploy for the guest notification poll. | Public catalogue loads with 200. Private routes still 401. | None | DONE AND VERIFIED IN PRODUCTION for the public catalogue split. Guest push poll fix is IMPLEMENTED BUT NOT DEPLOYED. |
| 10 | "Sign in to see price" | Customer Web | Public offer payloads include `price`. Pricing is not currently gated, so the exact sentence was not added as a blanket hide. Protected actions already say sign-in is required. | No change that would hide live public prices. | Live offer payload includes `price`. | No | Public prices are visible. | Confirm with the client if public prices must be hidden. | NOT IMPLEMENTED as a price hide. Current product shows public prices. |
| 11 | Search, pagination, 429s, mobile filters | Customer Web + backend | Existing code already paginates public grades (`limit`/`page`, 3,748 total, 38 pages at 100). Customer tests already cover request fan-out and "do not retry 429". Sticky sort/filter was not reworked in this session. | No further performance change. Response times were not re-benchmarked after a code change because the catalogue queries were not modified. | Existing `phase3-catalog-loading.test.ts` passed. | No | Public grades respond. A before/after timing study was not run. | Needs a profiled slow-query pass against the production database. | PARTIALLY IMPLEMENTED (already in the repo, not re-tuned today) |
| 12 | Canonical URLs point at `/marketplace` | Customer Web | Root metadata set `alternates.canonical` to `/marketplace`, so pages without their own canonical inherited it. Grade pages used the title "Grade Details". Product pages used `Product ${uuid}`. Register had no own canonical. Live marketplace canonical is already `https://customer.polystorex.com/marketplace`. Live robots host is `customer.polystorex.com`. | Root canonical removed. Register, grade and product pages set their own canonical. Titles are loaded from the public grade/product name and fall back to "Grade" or "Product", never the raw UUID. | `phase4-seo.test.ts` passed. | Yes, Customer Web. | Live pages still have the previous metadata until deploy. | None | IMPLEMENTED BUT NOT DEPLOYED |
| 13 | Empty blog indexed | Website | Sitemap on www has no `/blogs` URL (verified). Navigation still includes Blogs when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, even with zero posts. Homepage HTML contains `/blogs`. | Nav requires `NEXT_PUBLIC_BLOG_PUBLISHED=true`. Empty blog metadata is `noIndex`. `robots.txt` disallows `/blogs` when there are zero slugs. No articles were created. | Not run (website has no unit test script for this). | Yes, website. | Sitemap exclusion is already live. Nav hide is not deployed. | None | PARTIALLY IMPLEMENTED. Sitemap exclusion is DONE AND VERIFIED IN PRODUCTION. Nav hide is IMPLEMENTED BUT NOT DEPLOYED. |
| 14 | PetroTrade branding | All apps | User-facing login title on the live customer site is `Login \| PolyStoreX`. Homepage HTML has no PetroTrade. Storage keys such as `petrotrade.cart.v1` and `pt_customer_token` remain so existing sessions are not wiped. | No historical order numbers or storage keys were rewritten. | Live HTML check. | No | Live customer login title verified. | A full string audit of emails was not re-run against the mail provider. | PARTIALLY IMPLEMENTED |
| 15 | APK 3.1.3 (3115) | Expo app | `app.config.ts` and `eas.json` already set version `3.1.3`, `versionCode` `3115`, package `com.swaroop.app`, EAS project `ccf88988-1846-42d3-8944-a10d70252de7`, owner `polystorexs-team`. Production API in `eas.json` is still the DigitalOcean host. | No build was started. | `eas project:info` | No | Config verified in git. Artifact not generated. | Logged-in Expo user is `codeit.techteam@gmail.com` (`sumit.codeit1`). That user received `Entity not authorized` for `AppEntity[ccf88988-1846-42d3-8944-a10d70252de7]`. `polystorexs-team` must grant access. | BLOCKED BY CLIENT INPUT / ACCESS |

## B. Backend domain migration

- **Old API hostname:** `https://swaroop-backend-xzwkz.ondigitalocean.app`
- **New target hostname:** `https://api.polystorex.com`
- **API prefix:** `/api/v1` (confirmed by the live health route)
- **Environment variables that already select the API base:**
  - Customer, Seller, Admin, Website: `NEXT_PUBLIC_API_BASE_URL`
  - Expo: `EXPO_PUBLIC_API_BASE_URL` (set in `eas.json` for preview, `production-apk` and `production`)
- **Values were not changed to `api.polystorex.com`.** DNS does not resolve, so pointing clients there would break login, OTP and the catalogue.
- **Fallback:** the DigitalOcean hostname remains the production default in each app.
- **CORS code change (not deployed):** production allows the configured `CORS_ORIGINS`, plus these exact origins:
  - `https://polystorex.com`
  - `https://www.polystorex.com`
  - `https://customer.polystorex.com`
  - `https://seller.polystorex.com`
  - `https://admin.polystorex.com`
  - `https://api.polystorex.com` (listed so the cutover does not require another code change)
  - `https://swaroop-customer-webapp.vercel.app`
  - `https://swaroop-seller-webapp.vercel.app`
  - `https://swaroop-admin-pi.vercel.app`
  - `https://swaroop-website.vercel.app`
  - `https://swaroop-backend-xzwkz.ondigitalocean.app`
  - Localhost, `127.0.0.1` and private LAN addresses only when `NODE_ENV` is not `production`
  - Requests with no `Origin` (Expo and other native clients) stay allowed
  - Credentials, `Authorization`, and `OPTIONS` remain enabled
- **Health check:** live DigitalOcean `/api/v1/health` returned `status=ok`, `database=connected`, `storage=configured`, `surepass=configured`, `otp.provider=msg91`, `authStrictOtp=true` at `2026-11-17T06:12:55.526Z`.
- **SSL:** the DigitalOcean host has a valid HTTPS certificate. `api.polystorex.com` has no certificate because it has no DNS.
- **DNS action pending from the client:** add the CNAME that DigitalOcean App Platform shows for `api.polystorex.com`. That target string is generated inside DigitalOcean and is not stored in these repositories. Do not disable the existing hostname.
- **Remaining deployment tasks:**
  1. Add the custom domain in DigitalOcean App Platform.
  2. Copy the generated CNAME target into GoDaddy.
  3. Wait until `https://api.polystorex.com/api/v1/health` returns 200 with `database=connected`.
  4. Deploy the CORS change if it is not already covered by the live `CORS_ORIGINS`.
  5. Smoke OTP, catalogue, cart, orders, purchase requests, notifications, support, seller offers and admin.
  6. Only then set `NEXT_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_API_BASE_URL` to `https://api.polystorex.com/api/v1` and ship a new APK.

## C. TDS report

Confirmed wrong mapping, still live:

| Grade id | Grade | Code | Manufacturer shown today | Document id | File | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `a7b4c0bd-6107-4037-a67e-3d3d83355bae` | ABS EXTRUSION 3000D | `SO-ABS-3000D-PRIVATE-DD7728` | PRIVATE (API mask; catalogue manufacturer is not in the public payload) | `71b31aba-d2de-443f-95aa-f3d427d8bb4c` | `ABS_EXTRUSION_SR101_TDS.pdf` | VERIFIED, incorrectly attached. No replacement was uploaded. |

After the backend deploy, that file is omitted for 3000D and the API message is "Technical Data Sheet is currently unavailable for this grade." The file remains in storage. The unlink script clears `grade_id`, sets `is_active=false` and `verification_status=REJECTED` only for rows that match this filename and a 3000D grade. It writes a JSON backup first and does nothing unless `--apply` is passed. It was not applied.

Grades with live offers and no TDS (public API, 17 Nov 2026): all 53 distinct grades represented by the 122 offers. Examples: `HDPE_FILM`, `PP_INJECTION`, `PVC_PIPE`, `HDPE_MOULD`, `LLDPE_FILM`, `PET_BOTTLE`, `PP_RAFFIA`, `HDPE_PIPE`, `ABS_INJECTION`, `EVA_FILM`, `PP_CP`, `LLDPE_ROTO`, `PET_SHEET`, `TOLUENE`, `GLYCOL`. Manufacturer on every public row is currently `PRIVATE`. A row-by-row export of the other 3,695 grades was not produced because the database client on this machine was refused.

## D. Catalogue report

Numbers are from `GET /api/v1/public/marketplace/grades` and `/offers` on 17 November 2026. They are customer-visible records, not a raw `grades` table count.

| Measure | Value |
| --- | --- |
| Catalogue grades (customer-visible) | 3,748 |
| Active listings (live offers) | 122 |
| Active product cards | 122 |
| Unique grades with offers | 53 |
| Grades with more than one offer | 51 |
| Offer groups with identical grade, price, MOQ and quantity | 59 groups, 59 extra rows |
| Confirmed duplicate listings deleted | 0 |
| Genuine multiple offers | Not separated. Public responses hide seller id and warehouse id, so extra rows were left in place. |
| Candidate junk grades | 82 public codes that do not start with `SO-` (generic family codes). The client's figure of about 444 was not independently confirmed and nothing was deleted. |
| Grade codes starting with `SO-` | 3,666 |
| Grade-code migration applied | 0 existing rows |
| New-code format in source, not yet imported | `PSX-{FAMILY}-{GRADE_TOKEN}-{SEQ4}` example shape `PSX-ABS_EXTRUSION-3000D-XXXX` |

Terminology used above: catalogue grades are grade-master records; live listings are offers; unique grades with offers are distinct grade ids present on those offers.

## E. APK report

| Field | Value |
| --- | --- |
| Version | 3.1.3 (`EXPO_PUBLIC_APP_VERSION` in `eas.json`, default in `app.config.ts`) |
| Build number | 3115 (`ANDROID_VERSION_CODE`) |
| Application id | `com.swaroop.app` (unchanged) |
| EAS project | `ccf88988-1846-42d3-8944-a10d70252de7` |
| EAS owner / slug | `polystorexs-team` / `polystorex` |
| Production API baked into EAS profiles | `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1` |
| Build status | Not started |
| Artifact | None |
| Device testing | Not done |

**Build command once `polystorexs-team` grants this Expo account access:**

```bash
cd /Users/sumit/Desktop/SWAROOP
eas build --platform android --profile production-apk --non-interactive
```

Do not switch that profile's `EXPO_PUBLIC_API_BASE_URL` until `https://api.polystorex.com/api/v1/health` succeeds.

Logged-in account today: `codeit.techteam@gmail.com` (`sumit.codeit1`). `eas project:info` returned `Entity not authorized` for the project id above.

## F. Deployment status

| Area | In git working tree | On production |
| --- | --- | --- |
| API host | Still DigitalOcean | DigitalOcean, healthy |
| `api.polystorex.com` | Not used as a client default | DNS missing |
| CORS strictness | Code updated | Live preflight still follows the deployed process. Unknown browser origins are already rejected; `*.vercel.app` wildcards stay on until this backend build is deployed and `CORS_ALLOW_PLATFORM_HOSTS` is not `true` in DigitalOcean. |
| Sample notifications | Removed from the admin fixture and filtered in the apps | Still returned by `https://admin.polystorex.com/api/push-notifications?audience=customer&status=SENT` |
| Manufacturer field | Grade-master name in buyer payloads | Still `PRIVATE` |
| Wrong 3000D TDS | Hidden in the customer/public read path | Still attached and `VERIFIED` |
| Grade codes | New imports would use `PSX-` | 3,666 live `SO-` codes unchanged |
| SEO canonicals | Per-page canonicals in source | Live marketplace canonical is correct for that one page; other pages need the Customer Web deploy |
| Blog nav | Hidden unless `NEXT_PUBLIC_BLOG_PUBLISHED=true` | Sitemap already omits `/blogs`. The website nav still links to it. |
| APK | Config matches 3.1.3 / 3115 | No new artifact |

Nothing in this session was committed or pushed.

## Tests run

- Backend vitest, 6 files, 57 tests, all passed: blind marketplace mapper, marketplace service, phase-2 integrity, Source.One CSV codes, incorrect TDS mapping, notification ownership.
- Customer Web `npm test`: 17 tests passed, including sample-push exclusion, SEO helpers, and catalogue loading guards.
- Website, Seller, and Admin have no test script that was executed. Seller and Admin changes are TypeScript only and were not built in this session.
- End-to-end OTP, KYC, cart, purchase request, seller offer and admin TDS flows were not run. No production customer account was used. No fake pass was recorded.

## What was deliberately not done

- No GoDaddy or DigitalOcean DNS edit.
- No database delete of grades, offers, or notifications.
- No production TDS row update (script is dry-run only; this machine cannot reach the database).
- No grade-code rewrite of existing rows.
- No fixed OTP or auth bypass.
- No APK upload and no invented artifact URL.
- No new blog posts.
