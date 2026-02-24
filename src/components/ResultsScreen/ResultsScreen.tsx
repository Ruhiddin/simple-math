import styles from './ResultsScreen.module.scss';

interface ResultsScreenProps {
  player1Score: number;
  player2Score: number;
  onHome: () => void;
}

const ResultsScreen = ({ player1Score, player2Score, onHome }: ResultsScreenProps) => {
  return (
    <section className={styles.results}>
      <div className={styles.card}>
        <p className={styles.kicker}>Game Finished</p>
        <h2>Results</h2>
        <div className={styles.scoreGrid}>
          <article>
            <h3>Player 1</h3>
            <p>{player1Score}</p>
          </article>
          <article>
            <h3>Player 2</h3>
            <p>{player2Score}</p>
          </article>
        </div>
        <button type="button" onClick={onHome}>
          Home
        </button>
      </div>
    </section>
  );
};

export default ResultsScreen;
