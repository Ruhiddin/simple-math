import styles from './ScorePanel.module.scss';

interface ScorePanelProps {
  label: string;
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}

const ScorePanel = ({ label, score, onIncrement, onDecrement, onReset }: ScorePanelProps) => (
  <aside className={styles.panel} aria-label={`${label} scoreboard`}>
    <h3>{label}</h3>
    <p className={styles.score}>{score}</p>
    <div className={styles.controls}>
      <button type="button" onClick={onIncrement} aria-label={`${label} add point`}>
        +1
      </button>
      <button type="button" onClick={onDecrement} aria-label={`${label} subtract point`}>
        -1
      </button>
      <button type="button" className={styles.reset} onClick={onReset}>
        Reset
      </button>
    </div>
  </aside>
);

export default ScorePanel;
