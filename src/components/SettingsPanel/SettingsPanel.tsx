import type { GameSettings } from '../../utils/questionGenerator';
import type { Operator } from '../../utils/evaluateExpression';
import styles from './SettingsPanel.module.scss';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onStart: () => void;
}

const methods: { label: string; value: Operator }[] = [
  { label: 'Plus', value: 'plus' },
  { label: 'Subtract', value: 'subtract' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Divide', value: 'divide' },
];

const SettingsPanel = ({ settings, onChange, onStart }: SettingsPanelProps) => {
  const updateNumber = (key: keyof Omit<GameSettings, 'methods'>, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  const toggleMethod = (method: Operator) => {
    const exists = settings.methods.includes(method);
    const methodsNext = exists ? settings.methods.filter((item) => item !== method) : [...settings.methods, method];
    onChange({ ...settings, methods: methodsNext.length > 0 ? methodsNext : [method] });
  };

  return (
    <section className={styles.settings}>
      <h2>Game Settings</h2>
      <div className={styles.methods}>
        {methods.map((method) => (
          <label key={method.value}>
            <input
              type="checkbox"
              checked={settings.methods.includes(method.value)}
              onChange={() => toggleMethod(method.value)}
            />
            {method.label}
          </label>
        ))}
      </div>
      <div className={styles.grid}>
        <label>
          Steps
          <input type="number" min={1} max={3} value={settings.steps} onChange={(e) => updateNumber('steps', Number(e.target.value))} />
        </label>
        <label>
          Questions
          <input
            type="number"
            min={1}
            max={20}
            value={settings.questionCount}
            onChange={(e) => updateNumber('questionCount', Number(e.target.value))}
          />
        </label>
        <label>
          Range Min
          <input type="number" value={settings.min} onChange={(e) => updateNumber('min', Number(e.target.value))} />
        </label>
        <label>
          Range Max
          <input type="number" value={settings.max} onChange={(e) => updateNumber('max', Number(e.target.value))} />
        </label>
        <label>
          Timeout (s)
          <input
            type="number"
            min={1}
            value={settings.timeoutSeconds}
            onChange={(e) => updateNumber('timeoutSeconds', Number(e.target.value))}
          />
        </label>
      </div>
      <button type="button" className={styles.start} onClick={onStart}>
        Start Game
      </button>
    </section>
  );
};

export default SettingsPanel;
