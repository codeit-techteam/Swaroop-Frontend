import { appConfig } from '@/config/env';

export type MapsConfig = {
  apiKey: string;
};

export const mapsConfig: MapsConfig = {
  apiKey: appConfig.googleMapsApiKey,
};

export const getMapsApiKey = (): string => mapsConfig.apiKey;
