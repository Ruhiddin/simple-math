import { useTranslation } from 'react-i18next';
import styles from './TimerPanel.module.scss';

interface TimerPanelProps {
  remaining: number;
  running: boolean;
}

const TimerPanel = ({ remaining, running }: TimerPanelProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.timer}>
      <p>{t('timer.title')}</p>
      <strong>{remaining}s</strong>
      <span className={running ? styles.running : styles.paused}>{running ? t('timer.running') : t('timer.stopped')}</span>
    </section>
  );
};

export default TimerPanel;
