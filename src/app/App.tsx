import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsPanel from "../components/SettingsPanel/SettingsPanel";
import ScorePanel from "../components/ScorePanel/ScorePanel";
import QuestionBoard from "../components/QuestionBoard/QuestionBoard";
import TimerPanel from "../components/TimerPanel/TimerPanel";
import AnswerPanel from "../components/AnswerPanel/AnswerPanel";
import NextControls from "../components/NextControls/NextControls";
import ResultsScreen from "../components/ResultsScreen/ResultsScreen";
import LanguageSwitcher from "../components/LanguageSwitcher/LanguageSwitcher";
import { useCountdown } from "../hooks/useCountdown";
import {
  generateQuestions,
  type GameSettings,
  type GeneratedQuestion,
} from "../utils/questionGenerator";
import styles from "./App.module.scss";

type Mode = "SETUP" | "PLAY" | "RESULTS";
type PlayPhase = "running" | "reveal";
const STORAGE_KEY = "simple-math-settings";
const ACTIONS_MIN = 1;
const ACTIONS_MAX = 5;

const defaultSettings: GameSettings = {
  methods: ["plus", "subtract", "multiply", "divide"],
  actions: 2,
  questionCount: 5,
  min: 1,
  max: 5,
  timeoutSeconds: 7,
  targetSelectionMode: "random",
};

const validMethods: GameSettings["methods"] = [
  "plus",
  "subtract",
  "multiply",
  "divide",
];

const asFiniteNumber = (value: unknown): number | null => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const toInteger = (value: number): number => Math.trunc(value);

const validateStoredSettings = (value: unknown): GameSettings | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<GameSettings>;
  if (!Array.isArray(candidate.methods)) {
    return null;
  }

  const methods = candidate.methods.filter(
    (method): method is GameSettings["methods"][number] =>
      typeof method === "string" &&
      validMethods.includes(method as GameSettings["methods"][number]),
  );

  if (methods.length === 0) {
    return null;
  }

  const actions = asFiniteNumber(candidate.actions);
  const questionCount = asFiniteNumber(candidate.questionCount);
  const min = asFiniteNumber(candidate.min);
  const max = asFiniteNumber(candidate.max);
  const timeoutSeconds = asFiniteNumber(candidate.timeoutSeconds);

  if (
    actions === null ||
    questionCount === null ||
    min === null ||
    max === null ||
    timeoutSeconds === null ||
    (candidate.targetSelectionMode !== "random" &&
      candidate.targetSelectionMode !== "sequential")
  ) {
    return null;
  }

  return {
    methods,
    actions: clamp(toInteger(actions), ACTIONS_MIN, ACTIONS_MAX),
    questionCount: clamp(toInteger(questionCount), 1, 20),
    min: toInteger(min),
    max: toInteger(max),
    timeoutSeconds: Math.max(1, toInteger(timeoutSeconds)),
    targetSelectionMode: candidate.targetSelectionMode,
  };
};

const getInitialSettings = (): GameSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw);
    return validateStoredSettings(parsed) ?? defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const pickNextTarget = (
  items: GeneratedQuestion[],
  mode: GameSettings["targetSelectionMode"],
) => {
  const remaining = items.filter((question) => question.status === "ACTIVE");
  if (remaining.length === 0) {
    return null;
  }

  if (mode === "sequential") {
    return (
      remaining.sort((a, b) => a.displayIndex - b.displayIndex)[0]?.id ?? null
    );
  }

  return remaining[Math.floor(Math.random() * remaining.length)]?.id ?? null;
};

const App = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<GameSettings>(getInitialSettings);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [mode, setMode] = useState<Mode>("SETUP");
  const [playPhase, setPlayPhase] = useState<PlayPhase>("running");
  const [targetQuestionId, setTargetQuestionId] = useState<number | null>(null);
  const [revealCorrectId, setRevealCorrectId] = useState<number | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [roundStepKey, setRoundStepKey] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultSettings.timeoutSeconds,
  );
  const [revealRoundStepKey, setRevealRoundStepKey] = useState<number | null>(
    null,
  );
  const roundStepKeyRef = useRef(roundStepKey);
  const targetQuestionIdRef = useRef(targetQuestionId);
  const modeRef = useRef(mode);
  const playPhaseRef = useRef(playPhase);
  const revealedRoundRef = useRef<number | null>(null);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  useEffect(() => {
    roundStepKeyRef.current = roundStepKey;
  }, [roundStepKey]);

  useEffect(() => {
    targetQuestionIdRef.current = targetQuestionId;
  }, [targetQuestionId]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    playPhaseRef.current = playPhase;
  }, [playPhase]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    revealedRoundRef.current = null;
  }, [roundStepKey]);

  const targetQuestion = useMemo(
    () =>
      questions.find((question) => question.id === targetQuestionId) ?? null,
    [questions, targetQuestionId],
  );

  const forceReveal = useCallback((expiredRoundStepKey: number) => {
    if (
      expiredRoundStepKey !== roundStepKeyRef.current ||
      revealedRoundRef.current === expiredRoundStepKey ||
      targetQuestionIdRef.current === null ||
      modeRef.current !== "PLAY" ||
      playPhaseRef.current !== "running"
    ) {
      return;
    }

    revealedRoundRef.current = expiredRoundStepKey;

    setPlayPhase("reveal");
    setRevealRoundStepKey(expiredRoundStepKey);
    setRevealCorrectId(targetQuestionIdRef.current);
    setQuestions((items) =>
      items.map((question) =>
        question.id === targetQuestionIdRef.current
          ? {
              ...question,
              status: "RESOLVED",
            }
          : question,
      ),
    );
  }, []);

  const remaining = useCountdown({
    duration: settings.timeoutSeconds,
    isRunning:
      mode === "PLAY" && playPhase === "running" && targetQuestion !== null,
    onExpire: forceReveal,
    roundStepKey,
  });

  useEffect(() => {
    setRemainingSeconds(remaining);
  }, [remaining]);

  const canAdvance = mode === "PLAY" && playPhase === "reveal";
  const visibleRevealCorrectId =
    mode === "PLAY" &&
    playPhase === "reveal" &&
    revealRoundStepKey === roundStepKey
      ? revealCorrectId
      : null;

  const resetGameSession = useCallback(() => {
    setMode("SETUP");
    setQuestions([]);
    setTargetQuestionId(null);
    setRevealCorrectId(null);
    setRevealRoundStepKey(null);
    setRemainingSeconds(settings.timeoutSeconds);
    setRoundStepKey(0);
    setPlayPhase("running");
  }, [settings.timeoutSeconds]);

  const handleStart = useCallback(() => {
    const normalized: GameSettings = {
      ...settings,
      actions: clamp(toInteger(settings.actions), ACTIONS_MIN, ACTIONS_MAX),
      questionCount: Math.max(1, Math.min(20, toInteger(settings.questionCount))),
      min: toInteger(settings.min),
      max: toInteger(settings.max),
      timeoutSeconds: Math.max(1, toInteger(settings.timeoutSeconds)),
    };

    const generated = generateQuestions(normalized);
    const nextTargetId = pickNextTarget(
      generated,
      normalized.targetSelectionMode,
    );

    setSettings(normalized);
    setQuestions(generated);
    setTargetQuestionId(nextTargetId);
    setRevealCorrectId(null);
    setRevealRoundStepKey(null);
    setRemainingSeconds(normalized.timeoutSeconds);
    setRoundStepKey((value) => value + 1);
    if (nextTargetId === null) {
      setMode("RESULTS");
      return;
    }

    setMode("PLAY");
    setPlayPhase("running");
  }, [settings]);

  const handleNext = useCallback(() => {
    if (mode !== "PLAY" || playPhase !== "reveal") {
      return;
    }

    const nextTargetId = pickNextTarget(
      questions,
      settings.targetSelectionMode,
    );
    if (nextTargetId === null) {
      setMode("RESULTS");
      setTargetQuestionId(null);
      setRevealCorrectId(null);
      setRevealRoundStepKey(null);
      setPlayPhase("running");
      return;
    }

    setPlayPhase("running");
    setTargetQuestionId(nextTargetId);
    setRevealCorrectId(null);
    setRevealRoundStepKey(null);
    setRemainingSeconds(settings.timeoutSeconds);
    setRoundStepKey((value) => value + 1);
  }, [
    mode,
    playPhase,
    questions,
    settings.targetSelectionMode,
    settings.timeoutSeconds,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || !canAdvance) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      event.preventDefault();
      handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canAdvance, handleNext]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>{t("app.title")}</h1>
        <div className={styles.headerActions}>
          <LanguageSwitcher />
          {(mode === "PLAY" || mode === "RESULTS") && (
            <button
              type="button"
              className={styles.homeButton}
              onClick={resetGameSession}
            >
              {t("app.home")}
            </button>
          )}
          <button
            type="button"
            className={styles.resetBoth}
            onClick={() => setScores({ player1: 0, player2: 0 })}
          >
            {t("app.resetBoth")}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <ScorePanel
          label={t("players.player1")}
          score={scores.player1}
          onIncrement={() =>
            setScores((s) => ({ ...s, player1: s.player1 + 1 }))
          }
          onDecrement={() =>
            setScores((s) => ({ ...s, player1: s.player1 - 1 }))
          }
          onReset={() => setScores((s) => ({ ...s, player1: 0 }))}
        />

        <main className={styles.main}>
          {mode === "SETUP" && (
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              onStart={handleStart}
              onReset={resetSettings}
            />
          )}

          {mode === "PLAY" && (
            <section className={styles.playArea}>
              <div className={styles.infoRow}>
                <TimerPanel
                  remaining={remainingSeconds}
                  running={playPhase === "running"}
                />
                <AnswerPanel
                  answer={targetQuestion?.answer ?? null}
                  revealQuestionNumber={
                    visibleRevealCorrectId === null
                      ? null
                      : (questions.find(
                          (question) => question.id === visibleRevealCorrectId,
                        )?.displayIndex ?? null)
                  }
                />
              </div>

              <QuestionBoard
                questions={questions}
                revealCorrectId={visibleRevealCorrectId}
              />

              <div className={styles.nextRow}>
                <NextControls
                  canAdvance={canAdvance}
                  onNext={handleNext}
                  gameOver={false}
                  onRestart={resetGameSession}
                />
              </div>
            </section>
          )}

          {mode === "RESULTS" && (
            <ResultsScreen
              player1Score={scores.player1}
              player2Score={scores.player2}
              onHome={resetGameSession}
            />
          )}
        </main>

        <ScorePanel
          label={t("players.player2")}
          score={scores.player2}
          onIncrement={() =>
            setScores((s) => ({ ...s, player2: s.player2 + 1 }))
          }
          onDecrement={() =>
            setScores((s) => ({ ...s, player2: s.player2 - 1 }))
          }
          onReset={() => setScores((s) => ({ ...s, player2: 0 }))}
        />
      </div>
    </div>
  );
};

export default App;
