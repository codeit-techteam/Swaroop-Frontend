# PolyStoreX — Client Dependencies & External Access

**Audit date:** 14 November 2026  
**Purpose:** Everything the engineering team needs from the client / ops before remaining issues can close.  
**Security:** Do **not** send passwords, private API keys, or Auth Tokens in chat or ticket comments. Use a password manager / secrets vault / secure share link.

---

## 1. Files and data the client must provide

| # | Item | Needed for | Format / notes |
|---|------|------------|----------------|
| 1 | **Junk / invalid grade hide list** | Issue #5 | Approved CSV/XLSX of grade codes or Source.One rows to hide (preferred) or delete. Must explicitly approve destructive deletes. |
| 2 | **Target grade-code standard** | Issue #6 | Written format (prefix, segments, uniqueness, examples). **No migration until approved.** |
| 3 | **TDS / COA PDF pack (~550)** | Issue #7 | PDFs + mapping to grade code / Source.One id. Do not invent documents. |
| 4 | **Master-data correction sheet** | Issue #13 | Region/hub taxonomy; Nylon 66 ↔ correct PA66 grade; Compound vs Virgin rules; MOQ vs tier rules. |
| 5 | **Duplicate-listing UX decision** | Issue #2 | One marketplace card per `gradeId` vs one card per seller offer. |
| 6 | **KYC trading policy** | Issue #4 | Exact definition of “complete KYC” for Buy Now / cart / checkout; whether `KYC_ENFORCE_FOR_TRADING` may be enabled in production. |
| 7 | **Price visibility policy confirmation** | Issue #19 | Confirm current implemented policy (listing prices public; checkout/credit/docs require sign-in) **or** provide alternate written policy. |
| 8 | **Landed-price rounding rule** | Issue #16 | e.g. whole ₹/MT vs 2 decimals. |
| 9 | **Credit product naming** | Issue #9 | Approve rename of user-visible “PetroTrade Credit” → “PolyStoreX Credit” (or other). Historical order IDs stay unless separate approval. |
| 10 | **Blog content / Sanity authorship** | Issue #22 | Posts or content calendar once CMS is connected. |
| 11 | **Optional transparent logo asset** | Issue #18 | If brand wants wordmark without black plate on all light surfaces. |
| 12 | **SEO indexing policy for grade URLs** | Issue #20 | Whether customer grade detail pages should appear in sitemap / be indexed. |

---

## 2. Credentials and access (secure channel only)

Provide access via organisation owners; rotate if shared in plaintext historically.

| Access | Why | How to share safely |
|--------|-----|---------------------|
| **DigitalOcean** project for `swaroop-backend-xzwkz` | Deploy confirmation, Trusted Sources, DB connection | Invite engineer as member; do not paste tokens in chat |
| **Production `DATABASE_URL`** | Test-product soft-deactivate; junk hide; data audits | Vault / DO Connection Pool string via secure share; IP-allowlist runner |
| **Managed DB backup confirmation** | Required before any `--apply` scripts | Screenshot or DO backup id |
| **Vercel** (Customer, Seller, Admin, Website) | Confirm production deployment SHAs / env | Team invite |
| **Expo / EAS** account with access to **`polystorexs-team`** / project `polystorex` | Build APK 3.1.3 (3115) | Add authorized Expo user; current blocker: Entity Not Authorized |
| **Sanity project** (Website blog) | Issue #22 | Share Project ID + dataset via env on Vercel; write tokens only in Vercel env |
| **DNS registrar** for `polystorex.com` | Issue #11 custom domains | Or perform DNS changes from client side using checklist below |
| **Google Maps** (if map-picker required on APK) | Mobile maps messaging | Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in **EAS secrets**, not chat |
| **MSG91 / DLT** (already configured on live health) | OTP continuity | Only if changes needed — via DO env UI |

**Never request in plain text:** database passwords, JWT secrets, MSG91 auth keys, Surepass tokens, OTP secrets, Expo tokens, Vercel tokens.

---

## 3. DNS and domain actions (Issue #11)

Interim production hosts in use today:

| Role | Current host |
|------|----------------|
| API | `swaroop-backend-xzwkz.ondigitalocean.app` |
| Customer web | `swaroop-customer-webapp.vercel.app` (and related) |
| Admin | `swaroop-admin-pi.vercel.app` |
| Website | `www.polystorex.com` / `swaroop-website.vercel.app` |

### Client/DNS checklist (when cutover approved)

- [ ] Confirm target hostnames (e.g. `api.polystorex.com`, `app.polystorex.com`, admin hostname).  
- [ ] Create DNS records (CNAME/A) per Vercel / DigitalOcean docs.  
- [ ] Attach TLS certificates.  
- [ ] Update frontend env base URLs.  
- [ ] Update Backend `CORS_ORIGINS` / platform host flags.  
- [ ] Smoke OTP, marketplace, admin login on new hosts.  
- [ ] Keep interim hosts until smoke passes; then deprecate.

Website repo contains additional DNS notes under content/DNS checklist files — follow those for Vercel project names.

---

## 4. Approvals required before engineering proceeds

| Approval | Blocks |
|----------|--------|
| Soft-deactivate live test products | Issue #1 apply step |
| Junk grade hide vs delete | Issue #5 |
| Grade-code migration design | Issue #6 |
| Enable `KYC_ENFORCE_FOR_TRADING` in production | Issue #4 backend hard block |
| Retain `com.swaroop.app` (recommended) vs new id | Issue #23 — **new id = new Play listing** |
| Historical order reference migration | Issue #9 — default **preserve** |
| Commercial price-visibility change | Issue #19 |
| Custom domain go-live window | Issue #11 |

---

## 5. What engineering already has (no client action)

- Live API read access for public marketplace/health probes  
- Soft-deactivate **scripts and runbook** (not yet applied)  
- Customer WebApp / Backend code fixes on git `main` awaiting deploy proof  
- Expo config bumped to **3.1.3 / 3115** with package `com.swaroop.app`  
- Blind marketplace `PRIVATE` manufacturer behaviour already live  

---

## 6. Suggested client response template

```text
1. Production DB: [secure share link / DO invite] + backup id: _____
2. DO Trusted Sources: runner IP _____ allowlisted: yes/no
3. Junk grade file: [attachment] hide-only / hide+delete: _____
4. Grade code standard: [attachment or description]
5. TDS pack: [drive link] + mapping file: _____
6. KYC trading definition: _____ ; enable KYC_ENFORCE_FOR_TRADING: yes/no
7. Price visibility: confirm current public listings OR alternate: _____
8. EAS: Expo user _____ added to polystorexs-team: yes/no
9. Android package: keep com.swaroop.app: yes/no
10. Domains: proceed with cutover dates: _____
```

---

## 7. Immediate blockers ranked

1. **EAS `polystorexs-team` access** → APK (#23)  
2. **Production DATABASE_URL + backup** → test products (#1), junk (#5), deep data (#13)  
3. **Junk list + grade-code standard + TDS PDFs** → catalogue trust (#5–7)  
4. **KYC / price / rounding / credit naming policies** → finish #4, #9, #16, #19  
5. **DNS / Vercel-DO env alignment** → #11 long-term  
