import { images } from '../../assets';
import type { HomeBanner } from '@/types/home';

/**
 * Local fallback when CMS has no ACTIVE HOME_HERO.
 * Uses bundled industrial creative so Home always looks production-ready offline.
 */
export const DEFAULT_HOME_HERO_BANNER: HomeBanner = {
  id: 'default-home-hero',
  badge: 'Blind B2B Marketplace',
  title: 'Source Petrochemicals with Confidence',
  subtitle: '',
  description:
    'Discover verified grades, compare market prices and procure directly through a secure blind marketplace.',
  buttonLabel: 'Browse Marketplace',
  imageUrl: '',
  imageSource: images.homeHeroBanner,
  ctaAction: 'OPEN_MARKETPLACE',
  layoutVariant: 'IMAGE_OVERLAY',
};

export const HOME_BANNERS: HomeBanner[] = [
  {
    id: 'banner-storage-tanks',
    badge: 'MARKET INSIGHTS',
    title: 'Petrochemical Storage',
    subtitle: 'Supply Watch',
    description: 'Regional tank inventory trends shaping polymer availability.',
    buttonLabel: 'View Analysis',
    ctaAction: 'OPEN_MARKETPLACE',
    layoutVariant: 'IMAGE_OVERLAY',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'banner-polymer-pellets',
    badge: 'MARKET OUTLOOK',
    title: 'Industrial Polymer Pellets',
    subtitle: 'Stable Pricing',
    description: 'Domestic polymer grades remain balanced across major hubs.',
    buttonLabel: 'View Market',
    ctaAction: 'OPEN_MARKETPLACE',
    layoutVariant: 'IMAGE_OVERLAY',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'banner-container-port',
    badge: 'LOGISTICS',
    title: 'Container Port Flow',
    subtitle: 'Import Pipeline',
    description: 'Port throughput updates for chemical and polymer consignments.',
    buttonLabel: 'Explore Routes',
    ctaAction: 'OPEN_MARKETPLACE',
    layoutVariant: 'IMAGE_OVERLAY',
    imageUrl:
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'banner-chemical-logistics',
    badge: 'SUPPLY CHAIN',
    title: 'Chemical Logistics',
    subtitle: 'Delivery Estimates',
    description: 'Optimized industrial supply routes for landed-cost planning.',
    buttonLabel: 'Track Supply',
    ctaAction: 'OPEN_ORDERS',
    layoutVariant: 'IMAGE_OVERLAY',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'banner-crude-trends',
    badge: 'CRUDE WATCH',
    title: 'Crude Oil Trends',
    subtitle: 'Price Impact',
    description: 'International crude movements may affect polymer pricing.',
    buttonLabel: 'Read Report',
    ctaAction: 'OPEN_MARKETPLACE',
    layoutVariant: 'IMAGE_OVERLAY',
    imageUrl:
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=80',
  },
];

export const HERO_AUTO_SLIDE_MS = 5500;
/** Photo creatives — compact marketplace card height. */
export const HERO_BANNER_HEIGHT = 200;
/** Navy-emphasis / dual-CTA heroes get a bit more room. */
export const HERO_BANNER_NAVY_HEIGHT = 220;
