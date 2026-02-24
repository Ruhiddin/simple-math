import { useEffect, useRef, useState } from 'react';

interface UseCountdownParams {
  duration: number;
  isRunning: boolean;
  onExpire?: (roundStepKey: number) => void;
  roundStepKey: number;
}

export const useCountdown = ({ duration, isRunning, onExpire, roundStepKey }: UseCountdownParams) => {
  const [remaining, setRemaining] = useState(duration);
  const remainingRef = useRef(duration);
  const expiredRoundRef = useRef<number | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    remainingRef.current = duration;
    setRemaining(duration);
    expiredRoundRef.current = null;
  }, [duration, roundStepKey]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      const next = Math.max(remainingRef.current - 1, 0);
      remainingRef.current = next;
      setRemaining(next);

      if (next <= 0) {
        if (expiredRoundRef.current !== roundStepKey) {
          expiredRoundRef.current = roundStepKey;
          onExpireRef.current?.(roundStepKey);
        }
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, roundStepKey]);

  return remaining;
};
