import { formatExpression } from "../../utils/formatExpression";
import type { GeneratedQuestion } from "../../utils/questionGenerator";
import styles from "./QuestionCard.module.scss";

interface QuestionCardProps {
  question: GeneratedQuestion;
  isRevealedCorrect: boolean;
}

const QuestionCard = ({ question, isRevealedCorrect }: QuestionCardProps) => (
  <li
    className={`${styles.card} ${isRevealedCorrect ? styles.correct : ""} ${question.status === "RESOLVED" ? styles.resolved : ""}`}
  >
    <span className={styles.id}>{question.displayIndex}. </span>
    <span>{formatExpression(question.numbers, question.operators)}</span>
  </li>
);

export default QuestionCard;
