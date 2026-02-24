import type i18n from 'i18next';

export const initReactI18next: {
  type: string;
  init: (instance: typeof i18n) => void;
};

export function useTranslation(): {
  i18n: typeof i18n;
  t: (key: string, values?: Record<string, unknown>) => string;
};
