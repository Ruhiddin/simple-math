import { useTranslation } from 'react-i18next';
import styles from './ResultsScreen.module.scss';

interface ResultsScreenProps {
  player1Score: number;
  player2Score: number;
  onHome: () => void;
}

const ResultsScreen = ({ player1Score, player2Score, onHome }: ResultsScreenProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.results}>
      <div className={styles.card}>
        <p className={styles.kicker}>{t('results.finished')}</p>
        <h2>{t('results.title')}</h2>
        <div className={styles.scoreGrid}>
          <article>
            <h3>{t('players.player1')}</h3>
            <p>{player1Score}</p>
          </article>
          <article>
            <h3>{t('players.player2')}</h3>
            <p>{player2Score}</p>
          </article>
        </div>
        <button type="button" onClick={onHome}>
          {t('app.home')}
        </button>
      </div>
    </section>
  );
};

export default ResultsScreen;
