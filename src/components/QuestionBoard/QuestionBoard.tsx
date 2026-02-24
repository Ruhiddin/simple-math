import { useTranslation } from 'react-i18next';
import type { GeneratedQuestion } from '../../utils/questionGenerator';
import QuestionCard from '../QuestionCard/QuestionCard';
import styles from './QuestionBoard.module.scss';

interface QuestionBoardProps {
  questions: GeneratedQuestion[];
  revealCorrectId: number | null;
}

const QuestionBoard = ({ questions, revealCorrectId }: QuestionBoardProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.board}>
      <h2>{t('questions.title')}</h2>
      <ul>
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} isRevealedCorrect={question.id === revealCorrectId} />
        ))}
      </ul>
    </section>
  );
};

export default QuestionBoard;
