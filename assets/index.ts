/**
 * Local asset registry.
 * SVG illustrations and brand icons live in `src/icons` (react-native-svg)
 * so they can use theme colors. Raster assets are registered here.
 */

export const images = {
  icon: require('./images/icon.png'),
  adaptiveIcon: require('./images/adaptive-icon.png'),
  splashIcon: require('./images/splash-icon.png'),
  favicon: require('./images/favicon.png'),
  notificationIcon: require('./images/notification-icon.png'),
  /** Default Customer Home hero creative (CMS / R2 overrides when uploaded). */
  homeHeroBanner: require('./images/home-hero-banner.png'),
} as const;

export const assetPaths = {
  images: './images',
  icons: './icons',
  illustrations: './illustrations',
  logo: './logo',
  fonts: './fonts',
} as const;
