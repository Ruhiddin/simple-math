import { useCallback, useEffect, useMemo, useState } from 'react';
import SettingsPanel from '../components/SettingsPanel/SettingsPanel';
import ScorePanel from '../components/ScorePanel/ScorePanel';
import QuestionBoard from '../components/QuestionBoard/QuestionBoard';
import TimerPanel from '../components/TimerPanel/TimerPanel';
import AnswerPanel from '../components/AnswerPanel/AnswerPanel';
import NextControls from '../components/NextControls/NextControls';
import { useCountdown } from '../hooks/useCountdown';
import { generateQuestions, type GameSettings, type GeneratedQuestion } from '../utils/questionGenerator';
import styles from './App.module.scss';

type Phase = 'idle' | 'running' | 'reveal' | 'done';

const defaultSettings: GameSettings = {
  methods: ['plus', 'subtract', 'multiply', 'divide'],
  steps: 2,
  questionCount: 8,
  min: 1,
  max: 12,
  timeoutSeconds: 7,
};

const App = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [gameId, setGameId] = useState(0);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const currentQuestion = questions[currentIndex] ?? null;

  const finishQuestion = useCallback(() => {
    setPhase('reveal');
    setQuestions((items) =>
      items.map((question, index) =>
        index === currentIndex
          ? {
              ...question,
              status: 'resolved',
            }
          : question,
      ),
    );
  }, [currentIndex]);

  const remaining = useCountdown({
    duration: settings.timeoutSeconds,
    isRunning: phase === 'running' && currentQuestion !== null,
    onComplete: finishQuestion,
    resetKey: `${gameId}-${currentIndex}`,
  });

  const canAdvance = phase === 'reveal';

  const handleStart = () => {
    const normalized: GameSettings = {
      ...settings,
      steps: Math.max(1, Math.min(3, settings.steps)),
      questionCount: Math.max(1, Math.min(20, settings.questionCount)),
      timeoutSeconds: Math.max(1, settings.timeoutSeconds),
    };

    const generated = generateQuestions(normalized);
    setSettings(normalized);
    setQuestions(generated);
    setCurrentIndex(0);
    setGameId((value) => value + 1);
    setPhase('running');
  };

  const handleNext = useCallback(() => {
    if (phase !== 'reveal') {
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setPhase('done');
      return;
    }

    setCurrentIndex(nextIndex);
    setPhase('running');
  }, [currentIndex, phase, questions.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !canAdvance) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      event.preventDefault();
      handleNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canAdvance, handleNext]);

  const answer = useMemo(() => currentQuestion?.answer ?? null, [currentQuestion]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Arithmetic Arena</h1>
        <button type="button" className={styles.resetBoth} onClick={() => setScores({ player1: 0, player2: 0 })}>
          Reset both
        </button>
      </header>

      <div className={styles.layout}>
        <ScorePanel
          label="Player 1"
          score={scores.player1}
          onIncrement={() => setScores((s) => ({ ...s, player1: s.player1 + 1 }))}
          onDecrement={() => setScores((s) => ({ ...s, player1: s.player1 - 1 }))}
          onReset={() => setScores((s) => ({ ...s, player1: 0 }))}
        />

        <main className={styles.main}>
          {(phase === 'idle' || phase === 'done') && (
            <SettingsPanel settings={settings} onChange={setSettings} onStart={handleStart} />
          )}

          {phase !== 'idle' && (
            <>
              <QuestionBoard questions={questions.filter((question) => question.status !== 'resolved')} currentQuestionId={currentQuestion?.id ?? null} />
              <div className={styles.infoRow}>
                <TimerPanel remaining={remaining} running={phase === 'running'} />
                <AnswerPanel answer={answer} reveal={phase === 'reveal' || phase === 'done'} />
                <NextControls canAdvance={canAdvance} onNext={handleNext} gameOver={phase === 'done'} onRestart={() => setPhase('idle')} />
              </div>
            </>
          )}
        </main>

        <ScorePanel
          label="Player 2"
          score={scores.player2}
          onIncrement={() => setScores((s) => ({ ...s, player2: s.player2 + 1 }))}
          onDecrement={() => setScores((s) => ({ ...s, player2: s.player2 - 1 }))}
          onReset={() => setScores((s) => ({ ...s, player2: 0 }))}
        />
      </div>
    </div>
  );
};

export default App;
