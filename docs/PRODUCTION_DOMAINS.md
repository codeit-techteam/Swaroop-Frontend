# PolyStoreX — Production Domains (Phase 4 audit)

**Audit date:** 14 November 2026  
**Rule:** Do not replace a working production endpoint until the replacement is configured **and** verified.

## Verified live hosts (HTTPS 200)

| Role | Target host | Status 14 Nov | Interim still working |
|------|-------------|----------------|------------------------|
| Public website | `https://www.polystorex.com` / `https://polystorex.com` | **LIVE** | `swaroop-website.vercel.app` |
| Customer WebApp | `https://customer.polystorex.com` | **LIVE** (DNS → Vercel) | `swaroop-customer-webapp.vercel.app` |
| Seller WebApp | `https://seller.polystorex.com` | **LIVE** | seller Vercel host |
| Admin Panel | `https://admin.polystorex.com` | **LIVE** | `swaroop-admin-pi.vercel.app` |
| Backend API | `https://api.polystorex.com` | **NOT CONFIGURED** (DNS NXDOMAIN) | **`https://swaroop-backend-xzwkz.ondigitalocean.app`** — keep as production API |

## DNS notes

- `customer` / `seller` / `admin` CNAMEs resolve to `*.vercel-dns-017.com` — Vercel project domains appear attached.
- `api.polystorex.com` has **no** A/CNAME — do **not** point clients at it yet.
- DigitalOcean App Platform remains the API origin until a custom domain + TLS + CORS cutover is verified.

## Required env after cutover (do not flip API until ready)

### Customer WebApp (Vercel)
```
NEXT_PUBLIC_APP_URL=https://customer.polystorex.com
NEXT_PUBLIC_API_BASE_URL=https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1
# Later, only after api.polystorex.com health + CORS pass:
# NEXT_PUBLIC_API_BASE_URL=https://api.polystorex.com/api/v1
```

### Website (Vercel)
```
NEXT_PUBLIC_SITE_URL=https://polystorex.com
NEXT_PUBLIC_SITEMAP_HOST=https://www.polystorex.com
NEXT_PUBLIC_CUSTOMER_APP_URL=https://customer.polystorex.com
NEXT_PUBLIC_SELLER_APP_URL=https://seller.polystorex.com
NEXT_PUBLIC_ADMIN_APP_URL=https://admin.polystorex.com
NEXT_PUBLIC_API_BASE_URL=<current DO API>
```

### Backend (DigitalOcean)
```
CORS_ORIGINS=https://polystorex.com,https://www.polystorex.com,https://customer.polystorex.com,https://seller.polystorex.com,https://admin.polystorex.com,...interim vercel hosts...
CORS_ALLOW_PLATFORM_HOSTS=true   # until vercel previews no longer needed
```

Code defaults in `configuration.ts` already include the `*.polystorex.com` app hosts alongside interim Vercel hosts (Phase 4).

## API custom-domain checklist (blocked until DNS)

1. Add `api.polystorex.com` CNAME/A to DigitalOcean App Platform custom domain.  
2. Wait for TLS certificate.  
3. `GET https://api.polystorex.com/api/v1/health` → 200.  
4. Update CORS allow-list.  
5. Smoke OTP + marketplace from Customer/Seller/Admin.  
6. Then update frontend `NEXT_PUBLIC_API_BASE_URL` / Expo `EXPO_PUBLIC_API_BASE_URL`.  
7. Keep DO host as fallback for ≥1 release.

## Redirects

- Prefer `www.polystorex.com` for sitemap/robots (already hardcoded).  
- Apex `polystorex.com` should redirect or alias to www (client DNS).  
- Customer robots/sitemap must emit `customer.polystorex.com` (code updated Phase 4; redeploy required — live robots still showed interim Host until redeploy).
