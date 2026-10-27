/**
 * Single source of truth for the version shown inside the app (N-02 / A-01).
 *
 * The label is derived from the installed binary (versionName / versionCode on
 * Android, CFBundleShortVersionString / CFBundleVersion on iOS) so it can never
 * drift from the APK manifest the way a hardcoded constant did.
 */
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import {
  type AppVersionParts,
  cleanVersionPart,
  formatAppVersionLabel,
} from '@/utils/app-version-label';

export { formatAppVersionLabel, type AppVersionParts } from '@/utils/app-version-label';

/** Reads the version baked into the installed binary, falling back to the Expo manifest. */
export function getAppVersionParts(): AppVersionParts {
  const expoConfig = Constants.expoConfig;
  const manifestBuild =
    cleanVersionPart(expoConfig?.android?.versionCode) ??
    cleanVersionPart(expoConfig?.ios?.buildNumber);
  return {
    version:
      cleanVersionPart(Application.nativeApplicationVersion) ??
      cleanVersionPart(expoConfig?.version),
    build: cleanVersionPart(Application.nativeBuildVersion) ?? manifestBuild,
  };
}

/** e.g. "Version 3.1.1 (3112)". */
export function getAppVersionLabel(): string {
  return formatAppVersionLabel(getAppVersionParts());
}
