import { useTranslation } from 'react-i18next';
import type { GameSettings } from '../../utils/questionGenerator';
import type { Operator } from '../../utils/evaluateExpression';
import styles from './SettingsPanel.module.scss';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onStart: () => void;
}

const methods: { key: string; value: Operator }[] = [
  { key: 'plus', value: 'plus' },
  { key: 'subtract', value: 'subtract' },
  { key: 'multiply', value: 'multiply' },
  { key: 'divide', value: 'divide' },
];

const SettingsPanel = ({ settings, onChange, onStart }: SettingsPanelProps) => {
  const { t } = useTranslation();

  const updateNumber = (key: keyof Omit<GameSettings, 'methods' | 'targetSelectionMode'>, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  const toggleMethod = (method: Operator) => {
    const exists = settings.methods.includes(method);
    const methodsNext = exists ? settings.methods.filter((item) => item !== method) : [...settings.methods, method];
    onChange({ ...settings, methods: methodsNext.length > 0 ? methodsNext : [method] });
  };

  return (
    <section className={styles.settings}>
      <h2>{t('settings.title')}</h2>
      <div className={styles.methods}>
        {methods.map((method) => (
          <label key={method.value}>
            <input
              type="checkbox"
              checked={settings.methods.includes(method.value)}
              onChange={() => toggleMethod(method.value)}
            />
            {t(`settings.methods.${method.key}`)}
          </label>
        ))}
      </div>
      <div className={styles.grid}>
        <label>
          {t('settings.steps')}
          <input type="number" min={1} max={3} value={settings.steps} onChange={(e) => updateNumber('steps', Number(e.target.value))} />
        </label>
        <label>
          {t('settings.questions')}
          <input
            type="number"
            min={1}
            max={20}
            value={settings.questionCount}
            onChange={(e) => updateNumber('questionCount', Number(e.target.value))}
          />
        </label>
        <label>
          {t('settings.rangeMin')}
          <input type="number" value={settings.min} onChange={(e) => updateNumber('min', Number(e.target.value))} />
        </label>
        <label>
          {t('settings.rangeMax')}
          <input type="number" value={settings.max} onChange={(e) => updateNumber('max', Number(e.target.value))} />
        </label>
        <label>
          {t('settings.timeout')}
          <input
            type="number"
            min={1}
            value={settings.timeoutSeconds}
            onChange={(e) => updateNumber('timeoutSeconds', Number(e.target.value))}
          />
        </label>
        <label>
          {t('settings.targetSelection')}
          <select
            value={settings.targetSelectionMode}
            onChange={(e) => onChange({ ...settings, targetSelectionMode: e.target.value as GameSettings['targetSelectionMode'] })}
          >
            <option value="random">{t('settings.random')}</option>
            <option value="sequential">{t('settings.sequential')}</option>
          </select>
        </label>
      </div>
      <button type="button" className={styles.start} onClick={onStart}>
        {t('settings.start')}
      </button>
    </section>
  );
};

export default SettingsPanel;
