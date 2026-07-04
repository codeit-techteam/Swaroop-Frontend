import { appConfig } from '@/config/env';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};

export const firebaseConfig: FirebaseConfig = {
  apiKey: appConfig.firebase.apiKey,
  authDomain: appConfig.firebase.authDomain,
  projectId: appConfig.firebase.projectId,
};

export const initializeFirebase = (): FirebaseConfig => firebaseConfig;
