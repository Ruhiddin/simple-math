import styles from './NextControls.module.scss';

interface NextControlsProps {
  canAdvance: boolean;
  onNext: () => void;
  gameOver: boolean;
  onRestart: () => void;
}

const NextControls = ({ canAdvance, onNext, gameOver, onRestart }: NextControlsProps) => {
  if (gameOver) {
    return (
      <section className={styles.controls}>
        <h3>Game Over</h3>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
      </section>
    );
  }

  return (
    <section className={styles.controls}>
      <button type="button" disabled={!canAdvance} onClick={onNext}>
        Next
      </button>
      <small>{canAdvance ? 'Press Space for Next' : 'Wait for timer to reach zero'}</small>
    </section>
  );
};

export default NextControls;
