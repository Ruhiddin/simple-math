import { useEffect, useId, useState } from 'react';
import styles from './StepperInput.module.scss';

interface StepperInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  helperText?: string;
  disabled?: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const StepperInput = ({
  label,
  value,
  onChange,
  min,
  max,
  helperText,
  disabled = false,
}: StepperInputProps) => {
  const [draft, setDraft] = useState(String(value));
  const inputId = useId();
  const helperId = helperText ? `${inputId}-help` : undefined;

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }

    const nextValue = clamp(parsed, min, max);
    setDraft(String(nextValue));

    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const step = (delta: number) => {
    if (disabled) {
      return;
    }

    const nextValue = clamp(value + delta, min, max);
    setDraft(String(nextValue));

    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.control}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => step(-1)}
          aria-label={`Decrease ${label}`}
          disabled={disabled || value <= min}
        >
          −
        </button>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="-?[0-9]*"
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitDraft();
              return;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              step(1);
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              step(-1);
            }
          }}
          aria-describedby={helperId}
        />
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => step(1)}
          aria-label={`Increase ${label}`}
          disabled={disabled || value >= max}
        >
          +
        </button>
      </div>
      {helperText ? (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default StepperInput;
