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

export type ContactSupportOptions = {
  /** Pre-select topic on the marketing /contact form (e.g. SELL_MATERIALS). */
  topic?: string;
};

let cached: LegalLinks | null = null;
let inflight: Promise<LegalLinks> | null = null;

/**
 * Live marketing site with production /terms, /privacy, /contact.
 * petrotrade.in is still a GoDaddy park/lander; swaroop-website.vercel.app 404s.
 * Remove remaps once custom DNS serves the site.
 */
export const LIVE_WEBSITE_ORIGIN = 'https://swaroop-website-mocha.vercel.app';

const BROKEN_WEBSITE_HOSTS = new Set([
  'petrotrade.in',
  'www.petrotrade.in',
  'swaroop-website.vercel.app',
]);

const LIVE_TERMS_URL = `${LIVE_WEBSITE_ORIGIN}/terms`;
const LIVE_PRIVACY_URL = `${LIVE_WEBSITE_ORIGIN}/privacy`;
const LIVE_SUPPORT_URL = `${LIVE_WEBSITE_ORIGIN}/contact`;

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Rewrite known-broken public website hosts to the live Vercel deployment so
 * Terms / Privacy / Support open real pages instead of a lander or 404.
 */
function resolvePublicWebsiteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (BROKEN_WEBSITE_HOSTS.has(parsed.hostname.toLowerCase())) {
      const live = new URL(LIVE_WEBSITE_ORIGIN);
      parsed.protocol = live.protocol;
      parsed.host = live.host;
      return parsed.toString();
    }
    return url;
  } catch {
    return null;
  }
}

function withTopic(url: string, topic?: string): string {
  if (!topic) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('topic')) {
      parsed.searchParams.set('topic', topic);
    }
    return parsed.toString();
  } catch {
    return url;
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
        websiteUrl: resolvePublicWebsiteUrl(data.websiteUrl) ?? LIVE_WEBSITE_ORIGIN,
        termsUrl: resolvePublicWebsiteUrl(data.termsUrl) ?? LIVE_TERMS_URL,
        privacyUrl: resolvePublicWebsiteUrl(data.privacyUrl) ?? LIVE_PRIVACY_URL,
        supportUrl: resolvePublicWebsiteUrl(data.supportUrl) ?? LIVE_SUPPORT_URL,
        supportEmail: data.supportEmail ?? null,
        missing: Array.isArray(data.missing) ? data.missing : [],
      };
      return cached;
    } catch (error) {
      logger.warn('Legal links fetch failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      // Offline / API down — still open production legal pages.
      return {
        websiteUrl: LIVE_WEBSITE_ORIGIN,
        termsUrl: LIVE_TERMS_URL,
        privacyUrl: LIVE_PRIVACY_URL,
        supportUrl: LIVE_SUPPORT_URL,
        supportEmail: null,
        missing: [],
      };
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

export async function openTermsOfService(): Promise<void> {
  const links = await fetchLegalLinks();
  await openExternal(isHttpUrl(links.termsUrl) ? links.termsUrl : LIVE_TERMS_URL, 'Terms of Service');
}

export async function openPrivacyPolicy(): Promise<void> {
  const links = await fetchLegalLinks();
  await openExternal(
    isHttpUrl(links.privacyUrl) ? links.privacyUrl : LIVE_PRIVACY_URL,
    'Privacy Policy',
  );
}

/** Prefer support page URL; fall back to configured mailto only. Never invent an address. */
export async function openContactSupport(options?: ContactSupportOptions): Promise<void> {
  const links = await fetchLegalLinks();
  if (isHttpUrl(links.supportUrl)) {
    await openExternal(withTopic(links.supportUrl, options?.topic), 'Contact Support');
    return;
  }
  if (links.supportEmail) {
    await openExternal(`mailto:${links.supportEmail}`, 'Contact Support');
    return;
  }
  await openExternal(withTopic(LIVE_SUPPORT_URL, options?.topic), 'Contact Support');
}
