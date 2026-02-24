import { useTranslation } from 'react-i18next';
import styles from './AnswerPanel.module.scss';

interface AnswerPanelProps {
  answer: number | null;
  revealQuestionNumber: number | null;
}

const AnswerPanel = ({ answer, revealQuestionNumber }: AnswerPanelProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.answer}>
      <h3>{t('answer.title')}</h3>
      {answer === null ? <p className={styles.waiting}>{t('answer.waiting')}</p> : <p className={styles.value}>{answer}</p>}
      <small>{t('answer.hint1')}</small>
      <small>{t('answer.hint2')}</small>
      {revealQuestionNumber !== null && <p className={styles.reveal}>{t('answer.correct', { number: revealQuestionNumber })}</p>}
    </section>
  );
};

export default AnswerPanel;
