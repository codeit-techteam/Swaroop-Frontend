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

- `versionName`: **3.1.3**
- `versionCode`: **3117**
- Android package / iOS bundle: **`com.polystorex.app`** (changed from `com.swaroop.app` on 17 Nov 2026; installs as a separate app, not an update of the old package)
- EAS project: `polystorex`, target owner `polystorex-team`. See `docs/POLYSTOREX_IDENTITY_MIGRATION_2026-11-17.md` for the open project-access blocker.

## Branding assets

Final orbit + gold/blue-X logo (client, 4 Nov 2026):

- `assets/brand/polystorex-logo-final.png`
- `assets/logo/polystorex-logo.png` / `polystorex-mark.png`
- `assets/images/` icons, adaptive icon, splash (black background)

## Secrets

| Where | What goes there |
| --- | --- |
| `.env` | Local secrets. Never commit. |
| `.env.local`, `.secrets/` | Local overrides and EAS staging env. Never commit. |
| `.env.example` | Names and safe public defaults only. |
| `google-services.json`, `GoogleService-Info.plist` | Firebase client files. Keep them on disk. Git ignores them. |
| EAS | Production public env is in `eas.json`. Upload `google-services.json` as the file variable `GOOGLE_SERVICES_JSON` for builds that do not start from this machine. |

`EXPO_PUBLIC_*` values are compiled into the app bundle. Do not put a server Maps key, a service-account private key, or a database password behind that prefix. Leave `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` empty unless a package-restricted Maps SDK key exists. Address search goes through the backend.

```bash
cp .env.example .env
cp google-services.example.json google-services.json
```

Replace the placeholders in the local copies. Do not commit those copies.

## Key environment variables

| Name | Purpose |
|------|---------|
| `EXPO_PUBLIC_APP_ENV` | `development` \| `preview` \| `production` |
| `EXPO_PUBLIC_API_BASE_URL` | Backend API (`…/api/v1`) |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional native Maps SDK key. Empty in git. |
| `GOOGLE_SERVICES_JSON` | EAS file-secret path to `google-services.json` |
| `ANDROID_VERSION_CODE` | Play versionCode override |

Production builds currently point at DigitalOcean: `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1`. Do not point a release build at `api.polystorex.com` until that host answers on `/api/v1/health`.

## Build / deploy

```bash
npm run typecheck
npm run build:android:preview
npm run build:android:production-apk   # only after release gate
```

## Known issues / blockers (4 Nov 2026)

- Production backend URL + `AUTH_STRICT_OTP` / MSG91 production env: **Client Action Required**
- Package ID change to `com.polystorex.app`: **applied in config 17 Nov 2026; no build yet**
- Google Maps billing / device verification: **Client Action Required**
- ABS EXTRUSION 3000D ₹10/MT test offer: **commercial confirmation before price change**
- Catalogue merges / HSN fill: **dry-run only until backup + approval** (`Swaroop-Backend/scripts/dry-run-catalogue-cleanup.mjs`)
- App Store / Play Store listing URLs: **not published** — badges stay hidden
- Website robots.txt on live host still showed localhost until redeploy with fixed `robots.ts`

## Task tracker

See `POLYSTOREX_MASTER_TASK_TRACKER.csv` in this repo.

Never commit `.env`, `.secrets/`, signing keys, service-account JSON, or `google-services.json`.
