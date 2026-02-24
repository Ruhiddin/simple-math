import styles from './AnswerPanel.module.scss';

interface AnswerPanelProps {
  answer: number | null;
  reveal: boolean;
}

const AnswerPanel = ({ answer, reveal }: AnswerPanelProps) => (
  <section className={styles.answer}>
    <h3>Computer Answer</h3>
    {reveal ? <p>Correct answer: {answer}</p> : <p className={styles.waiting}>Answer hidden until timer ends</p>}
  </section>
);

export default AnswerPanel;
