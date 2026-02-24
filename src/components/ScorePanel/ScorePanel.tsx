import { useTranslation } from 'react-i18next';
import styles from './ScorePanel.module.scss';

interface ScorePanelProps {
  label: string;
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}

const ScorePanel = ({ label, score, onIncrement, onDecrement, onReset }: ScorePanelProps) => {
  const { t } = useTranslation();

  return (
    <aside className={styles.panel} aria-label={t('scoreboard.title', { label })}>
      <h3>{label}</h3>
      <p className={styles.score}>{score}</p>
      <div className={styles.controls}>
        <button type="button" onClick={onIncrement} aria-label={t('scoreboard.addPoint', { label })}>
          +1
        </button>
        <button type="button" onClick={onDecrement} aria-label={t('scoreboard.subtractPoint', { label })}>
          -1
        </button>
        <button type="button" className={styles.reset} onClick={onReset}>
          {t('scoreboard.reset')}
        </button>
      </div>
    </aside>
  );
};

export default ScorePanel;
