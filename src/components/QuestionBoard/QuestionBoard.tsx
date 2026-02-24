import type { GeneratedQuestion } from '../../utils/questionGenerator';
import QuestionCard from '../QuestionCard/QuestionCard';
import styles from './QuestionBoard.module.scss';

interface QuestionBoardProps {
  questions: GeneratedQuestion[];
  currentQuestionId: number | null;
}

const QuestionBoard = ({ questions, currentQuestionId }: QuestionBoardProps) => (
  <section className={styles.board}>
    <h2>Questions</h2>
    <ul>
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} isActive={question.id === currentQuestionId} />
      ))}
    </ul>
  </section>
);

export default QuestionBoard;
