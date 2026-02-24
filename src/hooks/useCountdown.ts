import { useEffect, useRef, useState } from 'react';

interface UseCountdownParams {
  duration: number;
  isRunning: boolean;
  onExpire?: () => void;
  resetKey: string;
}

export const useCountdown = ({ duration, isRunning, onExpire, resetKey }: UseCountdownParams) => {
  const [remaining, setRemaining] = useState(duration);
  const completedRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setRemaining(duration);
    completedRef.current = false;
  }, [duration, resetKey]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          if (!completedRef.current) {
            completedRef.current = true;
            onExpireRef.current?.();
          }
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  return remaining;
};
