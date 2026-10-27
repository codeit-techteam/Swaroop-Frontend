/**
 * Pure formatting for the in-app version label (N-02 / A-01).
 * Kept free of native imports so it can be unit-tested under Node.
 */
export type AppVersionParts = {
  /** Marketing version, e.g. "3.1.1". */
  version: string | null;
  /** Native build number / Android versionCode, e.g. "3112". */
  build: string | null;
};

export const cleanVersionPart = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

export function formatAppVersionLabel(parts: AppVersionParts): string {
  const version = cleanVersionPart(parts.version) ?? 'unknown';
  const build = cleanVersionPart(parts.build);
  return build && build !== version ? `Version ${version} (${build})` : `Version ${version}`;
}
