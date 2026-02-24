import { useTranslation } from 'react-i18next';
import styles from './NextControls.module.scss';

interface NextControlsProps {
  canAdvance: boolean;
  onNext: () => void;
  gameOver: boolean;
  onRestart: () => void;
}

const NextControls = ({ canAdvance, onNext, gameOver, onRestart }: NextControlsProps) => {
  const { t } = useTranslation();

  if (gameOver) {
    return (
      <section className={styles.controls}>
        <h3>{t('next.gameOver')}</h3>
        <button type="button" onClick={onRestart}>
          {t('next.restart')}
        </button>
      </section>
    );
  }

  return (
    <section className={styles.controls}>
      <button type="button" disabled={!canAdvance} onClick={onNext}>
        {t('next.next')}
      </button>
      <small>{canAdvance ? t('next.pressSpace') : t('next.waitTimer')}</small>
    </section>
  );
};

export default NextControls;
