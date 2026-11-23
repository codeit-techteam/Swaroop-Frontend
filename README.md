# PolyStoreX Customer App

Expo React Native app for PolyStoreX buyers (`com.polystorex.app`).

## Setup

1. Copy environment template:

```bash
cp .env.example .env
```

2. Fill local values in `.env` (never commit this file).
3. Place `google-services.json` locally for Android FCM (gitignored; EAS uses file secrets).
4. Install and run:

```bash
npm install
npx expo start
```

## Build

```bash
npm run build:android:preview
```

EAS project: `@polystorex-team/polystorex`
