import styles from './AnswerPanel.module.scss';

interface AnswerPanelProps {
  answer: number | null;
  revealQuestionNumber: number | null;
}

const AnswerPanel = ({ answer, revealQuestionNumber }: AnswerPanelProps) => (
  <section className={styles.answer}>
    <h3>Target Answer</h3>
    {answer === null ? <p className={styles.waiting}>Start a new game to begin.</p> : <p className={styles.value}>{answer}</p>}
    <small>Match this answer to a question. Say the question number out loud.</small>
    <small>When time ends, we reveal the correct question.</small>
    {revealQuestionNumber !== null && <p className={styles.reveal}>Correct: Question #{revealQuestionNumber}</p>}
  </section>
);

export default AnswerPanel;
