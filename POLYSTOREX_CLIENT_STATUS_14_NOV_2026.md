# PolyStoreX — Client Status Update (14 November 2026)

**Prepared for:** Client feedback review (23 issues)  
**Customer WebApp:** Deployed to Vercel (`489bb3f`) — verified  
**Public Website:** Deployed to Vercel / `www.polystorex.com` (`9280a6e`) — verified  
**Backend:** Commit `948d29e` on GitHub; **DigitalOcean App Platform redeploy blocked** (no `doctl` API token on build machine)

---

## Live now (end users can see)

| # | Issue | Live evidence |
|---|---|---|
| **3** | Fake guest identity / sample notifications | Marketplace guest chrome shows **Sign in** / **Sign in to view cart** |
| **8** | Unverified marketing claims | Login: factual PolyStoreX / Veylron copy |
| **9** | PetroTrade titles | Document title **Marketplace \| PolyStoreX Customer Portal** |
| **12** | Logged-out pricing errors | Guest marketplace shows ₹ material prices |
| **15** | Fake 365-day offer expiry | Today’s Offers show **Open availability** |
| **16** | PR View All → wrong route | Code live on Customer deploy |
| **19** | Price visibility | Listing prices public on marketplace |
| **20** | SEO | Customer + Website `robots.txt` / `sitemap.xml` live |
| **22** | Materials chips / blog | Website materials → marketplace category links |

---

## Pushed but not live on API yet

| # | Issue | Blocker |
|---|---|---|
| **2** (Backend grade dedupe) | GitHub `948d29e` | Redeploy DO App |
| **4** (KYC on checkout APIs) | Needs `KYC_ENFORCE_FOR_TRADING=true` | Redeploy + env |
| **10** (429 rate-limit split) | Code ready | Redeploy DO App |

---

## Still blocked on your side

| # | Issue | Need from you |
|---|---|---|
| **1** | Remove E2E / HD Blow Test products | DO DB Network Access for cleanup IP + password rotate |
| **5–7** | Catalogue / SO- codes / TDS | Approved list, code format, ~550 PDFs |
| **11** | `*.polystorex.com` API cutover | DNS/TLS |
| **23** | APK 3.1.3 / 3115 | EAS access to `polystorexs-team` |
| **Backend deploy** | Activate API fixes | Provide DigitalOcean API token or run Console redeploy of app `swaroop-backend-xzwkz` from `main` |

---

## Production numbers (unchanged — cleanup not applied)

| Metric | Value |
|--------|------:|
| Catalogue grades | 3,748 |
| Active products / offers | 124 / 124 |
| Test products still public | E2E Bulk Pricing Test, HD Blow Test |

Detailed tracker: `POLYSTOREX_PRODUCTION_STABILIZATION_REPORT.md`
