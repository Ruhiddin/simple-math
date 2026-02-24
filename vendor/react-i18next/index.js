import { useEffect, useState } from 'react';
import i18n from 'i18next';

export const initReactI18next = {
  type: '3rdParty',
  init() {},
};

export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((value) => value + 1);
    i18n.on('languageChanged', rerender);
    return () => i18n.off('languageChanged', rerender);
  }, []);

  return {
    i18n,
    t: (key, values) => i18n.t(key, values),
  };
}
