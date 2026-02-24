import { formatExpression } from '../../utils/formatExpression';
import type { GeneratedQuestion } from '../../utils/questionGenerator';
import styles from './QuestionCard.module.scss';

interface QuestionCardProps {
  question: GeneratedQuestion;
  isActive: boolean;
}

const QuestionCard = ({ question, isActive }: QuestionCardProps) => (
  <li className={`${styles.card} ${isActive ? styles.active : ''} ${question.status === 'resolved' ? styles.resolved : ''}`}>
    <span className={styles.id}>#{question.id}</span>
    <span>{formatExpression(question.numbers, question.operators)}</span>
  </li>
);

export default QuestionCard;
