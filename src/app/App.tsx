import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null);
  const [revealCorrectId, setRevealCorrectId] = useState<number | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [roundStepKey, setRoundStepKey] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultSettings.timeoutSeconds);
  const [revealRoundStepKey, setRevealRoundStepKey] = useState<number | null>(null);
  const roundStepKeyRef = useRef(roundStepKey);
  const targetQuestionIdRef = useRef(targetQuestionId);
  const phaseRef = useRef(phase);
  const revealedRoundRef = useRef<number | null>(null);

  useEffect(() => {
    roundStepKeyRef.current = roundStepKey;
  }, [roundStepKey]);

  useEffect(() => {
    targetQuestionIdRef.current = targetQuestionId;
  }, [targetQuestionId]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    revealedRoundRef.current = null;
  }, [roundStepKey]);

  const targetQuestion = useMemo(
    () => questions.find((question) => question.id === targetQuestionId) ?? null,
    [questions, targetQuestionId],
  );

  const forceReveal = useCallback((expiredRoundStepKey: number) => {
    if (
      expiredRoundStepKey !== roundStepKeyRef.current ||
      revealedRoundRef.current === expiredRoundStepKey ||
      targetQuestionIdRef.current === null ||
      phaseRef.current !== 'running'
    ) {
      return;
    }

    revealedRoundRef.current = expiredRoundStepKey;

    setPhase('reveal');
    setRevealRoundStepKey(expiredRoundStepKey);
    setRevealCorrectId(targetQuestionIdRef.current);
    setQuestions((items) =>
      items.map((question) =>
        question.id === targetQuestionIdRef.current
          ? {
              ...question,
              status: 'RESOLVED',
            }
          : question,
      ),
    );
  }, []);

  const remaining = useCountdown({
    duration: settings.timeoutSeconds,
    isRunning: phase === 'running' && targetQuestion !== null,
    onExpire: forceReveal,
    roundStepKey,
  });

  useEffect(() => {
    setRemainingSeconds(remaining);
  }, [remaining]);

  const canAdvance = phase === 'reveal';
  const visibleRevealCorrectId =
    phase === 'reveal' && revealRoundStepKey === roundStepKey ? revealCorrectId : null;

  const resetGame = useCallback(() => {
    setPhase('idle');
    setQuestions([]);
    setTargetQuestionId(null);
    setRevealCorrectId(null);
    setRevealRoundStepKey(null);
    setRemainingSeconds(settings.timeoutSeconds);
    setRoundStepKey(0);
  }, [settings.timeoutSeconds]);

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
    setRevealRoundStepKey(null);
    setRemainingSeconds(normalized.timeoutSeconds);
    setRoundStepKey((value) => value + 1);
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
      setRevealRoundStepKey(null);
      return;
    }

    setPhase('running');
    setTargetQuestionId(nextTargetId);
    setRevealCorrectId(null);
    setRevealRoundStepKey(null);
    setRemainingSeconds(settings.timeoutSeconds);
    setRoundStepKey((value) => value + 1);
  }, [phase, questions, settings.targetSelectionMode, settings.timeoutSeconds]);

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
        <div className={styles.headerActions}>
          {(phase === 'running' || phase === 'reveal') && (
            <button type="button" className={styles.homeButton} onClick={resetGame}>
              Home
            </button>
          )}
          <button type="button" className={styles.resetBoth} onClick={() => setScores({ player1: 0, player2: 0 })}>
            Reset both
          </button>
        </div>
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
              <QuestionBoard questions={questions} revealCorrectId={visibleRevealCorrectId} />
              <div className={styles.infoRow}>
                <TimerPanel remaining={remainingSeconds} running={phase === 'running'} />
                <AnswerPanel
                  answer={targetQuestion?.answer ?? null}
                  revealQuestionNumber={
                    visibleRevealCorrectId === null
                      ? null
                      : (questions.find((question) => question.id === visibleRevealCorrectId)?.displayIndex ?? null)
                  }
                />
                <NextControls canAdvance={canAdvance} onNext={handleNext} gameOver={phase === 'done'} onRestart={resetGame} />
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
