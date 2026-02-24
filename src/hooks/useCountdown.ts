import { useEffect, useRef, useState } from 'react';

interface UseCountdownParams {
  duration: number;
  isRunning: boolean;
  onExpire?: (roundStepKey: number) => void;
  roundStepKey: number;
}

export const useCountdown = ({ duration, isRunning, onExpire, roundStepKey }: UseCountdownParams) => {
  const [remaining, setRemaining] = useState(duration);
  const expiredRoundRef = useRef<number | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setRemaining(duration);
    expiredRoundRef.current = null;
  }, [duration, roundStepKey]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          if (expiredRoundRef.current !== roundStepKey) {
            expiredRoundRef.current = roundStepKey;
            onExpireRef.current?.(roundStepKey);
          }
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, roundStepKey]);

  return remaining;
};
