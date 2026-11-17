# PolyStoreX identity migration: audit and status

**Date:** 17 Nov 2026
**Scope:** `SWAROOP` (Expo customer app) and `Swaroop-Backend`
**Outcome:** app identity changed in config. No APK was built. The build is blocked on EAS project access, and two parts of the brief (FCM, Maps key) rest on assumptions the repositories do not support.

Status labels: Completed and verified / Implemented but not tested / Waiting for credentials/access / Waiting for client action / Failed with reason.

---

## 1. Blockers

### 1.1 EAS project is not readable by the company account

| Check | Result |
| --- | --- |
| `eas whoami` | `poly_storex` / `it@polystorex.com`. Owner of `poly_storex` and `polystorex-team`. |
| `eas project:info` | **Failed.** `Entity Not Authorized: AppEntity[ccf88988-1846-42d3-8944-a10d70252de7] ... action = READ` |

The company account owns `polystorex-team`, but it cannot read project `ccf88988-1846-42d3-8944-a10d70252de7`. Before this change `app.config.ts` recorded the project under `polystorexs-team` (with an extra `s`), tied to `swaroop.veylorn@gmail.com`. The most likely explanation is that the project still lives in that old account. This could not be confirmed from the CLI, because the CLI cannot list projects in an account.

No new project was created and the project id was not changed.

**Client action (pick one):**

1. **Transfer the existing project (keeps the id).** An Owner or Admin of `polystorexs-team` opens the project on expo.dev, then Project settings, then Transfer project, and selects `polystorex-team`. Expo requires the person doing the transfer to hold Owner or Admin on both accounts, so first invite `it@polystorex.com` to `polystorexs-team` as Admin, or do the transfer from the old owner login after it has been invited to `polystorex-team`.
2. **Approve a replacement project** under `polystorex-team`. The project id and the EAS Update URL would change. Since the package id is new and no build of `com.polystorex.app` has shipped, nothing installed depends on the old id.

After either: `cd SWAROOP && eas project:info` must print `@polystorex-team/polystorex`.

### 1.2 There is no Firebase or FCM integration to migrate

The brief describes an existing Firebase/FCM setup. Neither repository has one.

| Area | What exists |
| --- | --- |
| `google-services.json` / `GoogleService-Info.plist` | Not in the repo, not in git history. `app.config.ts` has no `googleServicesFile`. |
| Push token registration in the app | None. No call to `getExpoPushTokenAsync` or `getDevicePushTokenAsync` anywhere, in any commit. |
| Notification tap / background handling | None. No response listener, no last-response check. |
| App code using `expo-notifications` | `setNotificationHandler` and permission helpers only (`src/services/notification-service.ts`, `src/utils/permissions.ts`). |
| `src/services/firebase-service.ts` | Returns three env strings. Never initialises Firebase. No Firebase SDK in `package.json`. |
| `EXPO_PUBLIC_FIREBASE_*`, `EXPO_PUBLIC_ONESIGNAL_APP_ID` | Placeholders (`preview-placeholder`). Not set in `eas.json`. |
| Backend push sender | None. No `firebase-admin`, no Expo push client, no service account, no env var for one. |
| Backend token storage | None. No device or push-token model in `prisma/schema.prisma`. |

What does exist is an **in-app notification inbox**. The backend writes rows to the `Notification` table (`src/modules/notifications/notification.service.ts`, channel `IN_APP`) from order, purchase request, payment, dispatch, support, KYC and admin flows. The app reads them over REST (`/customer/notifications`, `/seller/notifications`). That inbox does not depend on the package id or on Firebase, so the identity change does not affect it.

Consequences:

- There is no old Firebase project to replace and no old service account in use.
- Device push (foreground, background, terminated, tap-to-open) has never worked and will not work in the new APK either. It is a new feature, not a migration.
- Building it needs: a backward-compatible Prisma migration for device tokens, register/unregister endpoints, a sender hooked into `NotificationService.create`, app-side token registration on login and removal on logout, a tap handler that reuses `getNotificationRoute`, the company Firebase files, and a backend deploy. None of that was started, because it changes the production schema and was not what the brief assumed.

**Client action if push is wanted:** create the Firebase project under `it@polystorex.com`, register Android app `com.polystorex.app`, download `google-services.json`, and generate a service account key. Do not send the files in chat. They go into an EAS file variable and the backend host environment.

### 1.3 Maps: no native map in the app, and one key is reused in three roles

| Finding | Detail |
| --- | --- |
| Native Maps SDK | Not used. No `react-native-maps`, no `MapView`, no Maps plugin in `app.config.ts`. |
| Address search, place details, reverse geocode | Go through the backend (`/api/v1/locations/*`), which calls Places API (New) and Geocoding with `GOOGLE_MAPS_SERVER_API_KEY`. |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in the app | Read once, in `AddressFormScreen.tsx`, to decide whether to show a "map picker is not in this build" line. It is never sent to Google. |
| Key reuse | The same key value is present in `SWAROOP/.env` (`EXPO_PUBLIC_`), `Swaroop-Backend/.env` (server key) and `Swaroop-Customer-WEBAPP/.env.local` (`NEXT_PUBLIC_`). Compared by value, not printed. |
| New company key | Not available in this workspace session. Which Google Cloud project the existing key belongs to cannot be determined from the repositories. |

So the Android Maps SDK key, its package restriction and its SHA-1 restriction do not apply to this build: there is nothing in the APK for them to protect. The app needs **no** Maps key. Putting one in the APK would only expose it.

The one-key-in-three-roles setup is the problem to fix. A key that works in a browser bundle cannot also be IP-restricted for the server.

**Client action:**

1. In the Google Cloud project owned by `it@polystorex.com`, with billing attached, enable Places API (New) and Geocoding API. Enable Maps JavaScript API only for the web confirmation map.
2. Create a **server key**: application restriction = the DigitalOcean egress IPs, API restriction = Places API (New) + Geocoding API. Set it as `GOOGLE_MAPS_SERVER_API_KEY` on the DigitalOcean app.
3. Create a separate **browser key**: HTTP referrer restriction for the PolyStoreX web hosts, API restriction = Maps JavaScript API. Set it as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` on Vercel.
4. Remove `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` from `SWAROOP/.env`. That file is not uploaded to EAS Build, but a local `eas update` or `expo export` from this machine would inline the value into the JS bundle.
5. Delete the old shared key once production traffic has moved.

---

## 2. What was changed

| File | Change | Status |
| --- | --- | --- |
| `SWAROOP/app.config.ts` | `android.package` and `ios.bundleIdentifier` to `com.polystorex.app`; `owner` to `polystorex-team`; default `versionCode` to 3116; comments corrected | Completed and verified (resolved config) |
| `SWAROOP/eas.json` | `ANDROID_VERSION_CODE` 3115 to 3116 in `preview`, `production-apk`, `production` | Completed and verified (resolved config) |
| `SWAROOP/.env.example` | Package id in the Maps comment; warning not to reuse the server key | Completed |
| `SWAROOP/README.md` | Current version, package id, EAS owner | Completed |
| `Swaroop-Backend/docs/location-platform.md` | Package id in the key-restriction table | Completed |

Nothing was committed. No backend source code changed and nothing was deployed.

Resolved config under the `production-apk` environment (`npx expo config --type public`):

| Field | Value |
| --- | --- |
| name / slug / owner | `PolyStoreX` / `polystorex` / `polystorex-team` |
| Android package / iOS bundle | `com.polystorex.app` / `com.polystorex.app` |
| version / versionCode | `3.1.3` / `3116` |
| scheme | `polystorex` |
| API base URL | `https://swaroop-backend-xzwkz.ondigitalocean.app/api/v1` |
| cleartext traffic | `false` |
| Maps key embedded / Firebase key embedded | no / no |
| EAS project id | `ccf88988-1846-42d3-8944-a10d70252de7` (unchanged, not accessible) |

Version: 3.1.3 was kept because no 3.1.3 build was ever produced. 3115 was configured but never built; 3116 follows the instruction to increment from it.

### Items checked that needed no change

| Item | Why |
| --- | --- |
| Native `android/` and `ios/` directories | Do not exist. The project is generated by Expo config plugins at build time, so `applicationId`, namespace and manifest follow `app.config.ts`. |
| Deep links | Only the custom scheme `polystorex://`. It does not depend on the package id. No Android intent filters, App Links or iOS associated domains are configured. |
| OAuth redirects | None. Auth is phone OTP and JWT. |
| Payment SDKs | None in the app. No package-bound payment configuration. |
| Icons and splash | Already PolyStoreX artwork (`assets/images/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `notification-icon.png`). |
| `production-apk` profile | Already exists: `buildType: apk`, `EXPO_PUBLIC_APP_ENV=production`, production API URL, channel `production`. The `production` AAB profile is untouched. |
| Backend | Has no reference to the package id. Tokens, accounts, orders and purchase requests are keyed by user, not by app identity. |
| OTP | Live health check reports `provider: msg91`, `msg91Configured: true`, `authStrictOtp: true`. Backend env validation refuses to boot in production without `AUTH_STRICT_OTP`. |
| `api.polystorex.com` | Still has no DNS record. The DigitalOcean host remains the production API. |

### Left as is, on purpose

- `package.json` `"name": "swaroop"`: private npm name, not user-facing.
- Storage keys prefixed `swaroop_`: renaming gains nothing and risks session data.
- Dated reports (`POLYSTOREX_*.md`, `docs/release-report-v3.1.3-3115.md`, backend `docs/*report*.md`): historical records, they still mention `com.swaroop.app` and `polystorexs-team`.

### Consequence of the new package id

`com.polystorex.app` installs as a separate app. Devices with `com.swaroop.app` keep the old app until it is removed, and users sign in again on the new one. Accounts and data are server-side and are unaffected. A Play listing for the new id would be a new listing.

---

## 3. Checks run

| Check | Result |
| --- | --- |
| `npx expo config --type public` (production-apk env) | Resolves with the values above |
| `npx expo-doctor` | 19 of 20 pass. Failing check: 22 packages are behind the SDK 58 patch versions (for example `expo-notifications` 58.1.6 vs 58.1.9, `react-native` 0.88.0 vs 0.88.1) |
| `npm run typecheck` | **3 errors, all in files this change did not touch**: `checkout-screen.tsx:428`, `market-screen.tsx:669`, `SellerAnalyticsScreen.tsx:265` |
| `npm run lint` | 1,701 errors and 52 warnings, almost all Prettier formatting; 1,679 auto-fixable. Not introduced by this change |
| Unit tests (25 files) | 126 tests pass. 1 file fails to load: `product-quote-estimate.test.ts` imports `react-native`, which the `tsx` runner cannot transform |
| Device tests | **Not run.** There is no APK |

The type and lint errors do not stop an EAS build, because Metro does not type-check. They were not fixed here because they are outside the migration.

---

## 4. Deliverables

| # | Item | Value | Status |
| --- | --- | --- | --- |
| 1 | Package id | `com.swaroop.app` to `com.polystorex.app` (Android and iOS) | Completed and verified (config only) |
| 2 | Firebase project | Old: none found. New: none exists yet | Waiting for client action |
| 3 | Maps configuration | Old: one shared key in three env files. New: not configured | Waiting for client action |
| 4 | Files changed | Section 2 | Completed |
| 5 | EAS organization and project | Account `polystorex-team` verified. Project `ccf88988-...` not readable | Waiting for credentials/access |
| 6 | FCM notification testing | Not possible: no push implementation, no APK | Failed with reason |
| 7 | Google Maps testing | Not run on a device. No native map in the app | Waiting for client action |
| 8 | Authentication testing | Backend OTP configuration verified by health check. No device test | Implemented but not tested |
| 9 | Backend changes and deployment | One doc line. No code change, no deploy, no schema change | Completed |
| 10 | Android version and build number | `3.1.3` / `3116` | Completed and verified (config only) |
| 11 | APK build | Not started | Waiting for credentials/access |
| 12 | APK artifact URL | None | Waiting for credentials/access |
| 13 | Remaining client actions | Sections 1.1, 1.2, 1.3 | Waiting for client action |

iOS: bundle id updated. There is no `GoogleService-Info.plist`, and iOS credentials in EAS could not be inspected without project access, so iOS readiness is unknown.

---

## 5. Build steps once the EAS project is accessible

```bash
cd /Users/sumit/Desktop/SWAROOP
eas whoami                      # expect it@polystorex.com
eas project:info                # expect @polystorex-team/polystorex
eas build --platform android --profile production-apk
```

Run the first build interactively, not with `--non-interactive`. A new package id normally has no Android keystore in EAS yet, and EAS asks before generating one. Existing credentials could not be inspected without project access. Back the keystore up afterwards: every later release of this package must be signed with it.

Signing fingerprints, if they are ever needed for a restricted Android key: `eas credentials --platform android`, after the first build.

Before distributing the APK, test on a real device: launch and splash, OTP request and verify with a real number, address search and current location, marketplace, cart, checkout, purchase request, orders, and the in-app notification inbox.
