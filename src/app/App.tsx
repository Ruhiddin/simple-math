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
  targetSelectionMode: 'random',
};

const pickNextTarget = (items: GeneratedQuestion[], mode: GameSettings['targetSelectionMode']) => {
  const remaining = items.filter((question) => question.status === 'ACTIVE');
  if (remaining.length === 0) {
    return null;
  }

  if (mode === 'sequential') {
    return remaining.sort((a, b) => a.displayIndex - b.displayIndex)[0]?.id ?? null;
  }

  return remaining[Math.floor(Math.random() * remaining.length)]?.id ?? null;
};

const App = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [gameId, setGameId] = useState(0);
  const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null);
  const [revealCorrectId, setRevealCorrectId] = useState<number | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const targetQuestion = useMemo(
    () => questions.find((question) => question.id === targetQuestionId) ?? null,
    [questions, targetQuestionId],
  );

  const finishQuestion = useCallback(() => {
    if (targetQuestionId === null) {
      return;
    }

    setPhase('reveal');
    setRevealCorrectId(targetQuestionId);
    setQuestions((items) =>
      items.map((question) =>
        question.id === targetQuestionId
          ? {
              ...question,
              status: 'RESOLVED',
            }
          : question,
      ),
    );
  }, [targetQuestionId]);

  const remaining = useCountdown({
    duration: settings.timeoutSeconds,
    isRunning: phase === 'running' && targetQuestion !== null,
    onComplete: finishQuestion,
    resetKey: `${gameId}-${targetQuestionId ?? 'none'}`,
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
    const nextTargetId = pickNextTarget(generated, normalized.targetSelectionMode);

    setSettings(normalized);
    setQuestions(generated);
    setTargetQuestionId(nextTargetId);
    setRevealCorrectId(null);
    setGameId((value) => value + 1);
    setPhase(nextTargetId === null ? 'done' : 'running');
  };

  const handleNext = useCallback(() => {
    if (phase !== 'reveal') {
      return;
    }

    const nextTargetId = pickNextTarget(questions, settings.targetSelectionMode);
    if (nextTargetId === null) {
      setPhase('done');
      setTargetQuestionId(null);
      setRevealCorrectId(null);
      return;
    }

    setTargetQuestionId(nextTargetId);
    setRevealCorrectId(null);
    setPhase('running');
  }, [phase, questions, settings.targetSelectionMode]);

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
              <QuestionBoard questions={questions} revealCorrectId={revealCorrectId} />
              <div className={styles.infoRow}>
                <TimerPanel remaining={remaining} running={phase === 'running'} />
                <AnswerPanel
                  answer={targetQuestion?.answer ?? null}
                  revealQuestionNumber={
                    revealCorrectId === null
                      ? null
                      : (questions.find((question) => question.id === revealCorrectId)?.displayIndex ?? null)
                  }
                />
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
