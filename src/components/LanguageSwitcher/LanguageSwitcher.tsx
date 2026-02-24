import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.scss';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: 'en' | 'uz') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className={styles.switcher}>
      {(['en', 'uz'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => changeLanguage(lang)}
          className={i18n.language === lang ? styles.active : ''}
          aria-label={t('language.switchTo', { language: t(`language.${lang}`) })}
        >
          {t(`language.${lang}`)}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
