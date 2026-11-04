# PolyStoreX — Customer Mobile App (SWAROOP)

Expo React Native app for PolyStoreX buyers (and embedded seller module under `src/seller/`).

## Production website

- Marketing site: https://polystorex.com
- Proposed app hosts (pending client DNS): `customer.polystorex.com`, `seller.polystorex.com`, `admin.polystorex.com`

## Repository map

| Repo | Role |
|------|------|
| `SWAROOP` | Customer mobile (this repo) + embedded seller screens |
| `Swaroop-Customer-WEBAPP` | Customer web |
| `Swaroop-seller-Webapp` | Seller web |
| `Swaroop-ADMIN` | Admin panel |
| `Swaroop-Backend` | NestJS + Postgres API |
| `Swaroop-Website` | Public marketing site |

## Current app version

- `versionName`: **3.1.2**
- `versionCode`: **3114**
- Android package / iOS bundle: **`com.swaroop.app`** (do not change to `com.polystorex.app` until client confirms Play Console impact)
- EAS project: `polystorex` under `polystorexs-team`

## Branding assets

Final orbit + gold/blue-X logo (client, 4 Nov 2026):

- `assets/brand/polystorex-logo-final.png`
- `assets/logo/polystorex-logo.png` / `polystorex-mark.png`
- `assets/images/` icons, adaptive icon, splash (black background)

## Key environment variables

| Name | Purpose |
|------|---------|
| `EXPO_PUBLIC_APP_ENV` | `development` \| `preview` \| `production` |
| `EXPO_PUBLIC_API_BASE_URL` | Backend API (`…/api/v1`) |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps (must be in EAS secrets for release) |
| `ANDROID_VERSION_CODE` | Play versionCode override |

Production builds currently point at DigitalOcean: `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1`. A dedicated PolyStoreX production backend is **not yet confirmed** — do not ship a “production” APK against an unverified test API.

## Build / deploy

```bash
npm run typecheck
npm run build:android:preview
npm run build:android:production-apk   # only after release gate
```

## Known issues / blockers (4 Nov 2026)

- Production backend URL + `AUTH_STRICT_OTP` / MSG91 production env: **Client Action Required**
- Package ID change to `com.polystorex.app`: **Client approval + Play Console check**
- Google Maps billing / device verification: **Client Action Required**
- ABS EXTRUSION 3000D ₹10/MT test offer: **commercial confirmation before price change**
- Catalogue merges / HSN fill: **dry-run only until backup + approval** (`Swaroop-Backend/scripts/dry-run-catalogue-cleanup.mjs`)
- App Store / Play Store listing URLs: **not published** — badges stay hidden
- Website robots.txt on live host still showed localhost until redeploy with fixed `robots.ts`

## Task tracker

See `POLYSTOREX_MASTER_TASK_TRACKER.csv` in this repo.

Never commit credentials, signing keys, or `.env` files with secrets.
