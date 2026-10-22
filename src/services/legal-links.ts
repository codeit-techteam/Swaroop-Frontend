import { Linking } from 'react-native';

import Toast from 'react-native-toast-message';

import { appConfig } from '@/config/env';
import { logger } from '@/utils/logger';

export type LegalLinks = {
  websiteUrl: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  supportUrl: string | null;
  supportEmail: string | null;
  missing: string[];
};

let cached: LegalLinks | null = null;
let inflight: Promise<LegalLinks> | null = null;

const EMPTY: LegalLinks = {
  websiteUrl: null,
  termsUrl: null,
  privacyUrl: null,
  supportUrl: null,
  supportEmail: null,
  missing: [
    'PUBLIC_TERMS_URL (or PUBLIC_WEBSITE_URL)',
    'PUBLIC_PRIVACY_URL (or PUBLIC_WEBSITE_URL)',
    'PUBLIC_SUPPORT_URL / PUBLIC_SUPPORT_EMAIL (or PUBLIC_WEBSITE_URL)',
  ],
};

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Fetch approved legal/support destinations from the backend (no auth). */
export async function fetchLegalLinks(): Promise<LegalLinks> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${appConfig.apiBaseUrl}/public/legal-links`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { data?: LegalLinks };
      const data = body.data;
      if (!data) throw new Error('Missing legal links payload');
      cached = {
        websiteUrl: data.websiteUrl ?? null,
        termsUrl: data.termsUrl ?? null,
        privacyUrl: data.privacyUrl ?? null,
        supportUrl: data.supportUrl ?? null,
        supportEmail: data.supportEmail ?? null,
        missing: Array.isArray(data.missing) ? data.missing : [],
      };
      return cached;
    } catch (error) {
      logger.warn('Legal links fetch failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      return EMPTY;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

async function openExternal(url: string, label: string): Promise<void> {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Toast.show({
        type: 'error',
        text1: `Unable to open ${label}`,
        text2: 'No app is available to handle this link.',
      });
      return;
    }
    await Linking.openURL(url);
  } catch (error) {
    logger.warn('Failed to open legal link', {
      label,
      message: error instanceof Error ? error.message : String(error),
    });
    Toast.show({
      type: 'error',
      text1: `Unable to open ${label}`,
      text2: 'Please try again in a moment.',
    });
  }
}

function missingToast(label: string, keys: string[]): void {
  Toast.show({
    type: 'info',
    text1: `${label} is not configured`,
    text2:
      keys.length > 0
        ? `Missing: ${keys.join(', ')}`
        : 'Ask an admin to set the public legal URL in backend environment.',
  });
}

export async function openTermsOfService(): Promise<void> {
  const links = await fetchLegalLinks();
  if (!isHttpUrl(links.termsUrl)) {
    missingToast('Terms of Service', links.missing.filter((k) => k.includes('TERMS') || k.includes('WEBSITE')));
    return;
  }
  await openExternal(links.termsUrl, 'Terms of Service');
}

export async function openPrivacyPolicy(): Promise<void> {
  const links = await fetchLegalLinks();
  if (!isHttpUrl(links.privacyUrl)) {
    missingToast('Privacy Policy', links.missing.filter((k) => k.includes('PRIVACY') || k.includes('WEBSITE')));
    return;
  }
  await openExternal(links.privacyUrl, 'Privacy Policy');
}

/** Prefer support page URL; fall back to configured mailto only. Never invent an address. */
export async function openContactSupport(): Promise<void> {
  const links = await fetchLegalLinks();
  if (isHttpUrl(links.supportUrl)) {
    await openExternal(links.supportUrl, 'Contact Support');
    return;
  }
  if (links.supportEmail) {
    await openExternal(`mailto:${links.supportEmail}`, 'Contact Support');
    return;
  }
  missingToast(
    'Contact Support',
    links.missing.filter((k) => k.includes('SUPPORT') || k.includes('WEBSITE')),
  );
}
