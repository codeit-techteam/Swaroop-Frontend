export const locales = {
  en: {
    common: {
      appName: 'Swaroop',
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      noResults: 'No results found',
      offline: 'You are offline',
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
    },
    validation: {
      required: 'This field is required',
      invalidEmail: 'Enter a valid email address',
      invalidPhone: 'Enter a valid phone number',
    },
  },
} as const;

export type Locale = keyof typeof locales;
export type TranslationKeys = typeof locales.en;

export const defaultLocale: Locale = 'en';

export const getTranslation = (locale: Locale = defaultLocale): TranslationKeys => locales[locale];
