import { useTranslation } from 'react-i18next';
import type { GameSettings } from '../../utils/questionGenerator';
import type { Operator } from '../../utils/evaluateExpression';
import StepperInput from '../StepperInput/StepperInput';
import styles from './SettingsPanel.module.scss';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onStart: () => void;
  onReset: () => void;
}

const methods: { key: string; value: Operator }[] = [
  { key: 'plus', value: 'plus' },
  { key: 'subtract', value: 'subtract' },
  { key: 'multiply', value: 'multiply' },
  { key: 'divide', value: 'divide' },
];

const SettingsPanel = ({ settings, onChange, onStart, onReset }: SettingsPanelProps) => {
  const { t } = useTranslation();

  const toggleMethod = (method: Operator) => {
    const exists = settings.methods.includes(method);
    const methodsNext = exists ? settings.methods.filter((item) => item !== method) : [...settings.methods, method];
    onChange({ ...settings, methods: methodsNext.length > 0 ? methodsNext : [method] });
  };

  return (
    <section className={styles.settings}>
      <h2>{t('settings.title')}</h2>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h3>{t('settings.operations')}</h3>
          <div className={styles.methodPills} role="group" aria-label={t('settings.operations')}>
            {methods.map((method) => {
              const active = settings.methods.includes(method.value);

              return (
                <button
                  type="button"
                  key={method.value}
                  className={`${styles.methodPill} ${active ? styles.active : ''}`}
                  onClick={() => toggleMethod(method.value)}
                  aria-pressed={active}
                >
                  {t(`settings.methods.${method.key}`)}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h3>{t('settings.questionSetup')}</h3>
          <div className={styles.inputGrid}>
            <StepperInput
              label={t('settings.steps')}
              value={settings.actions}
              min={1}
              max={5}
              onChange={(value) => onChange({ ...settings, actions: value })}
            />
            <StepperInput
              label={t('settings.questions')}
              value={settings.questionCount}
              min={1}
              max={20}
              onChange={(value) => onChange({ ...settings, questionCount: value })}
            />
            <label className={styles.selectField}>
              <span>{t('settings.targetSelection')}</span>
              <select
                value={settings.targetSelectionMode}
                onChange={(e) => onChange({ ...settings, targetSelectionMode: e.target.value as GameSettings['targetSelectionMode'] })}
              >
                <option value="random">{t('settings.random')}</option>
                <option value="sequential">{t('settings.sequential')}</option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h3>{t('settings.numberRange')}</h3>
          <div className={styles.inputGrid}>
            <StepperInput
              label={t('settings.rangeMin')}
              value={settings.min}
              min={-50}
              max={50}
              onChange={(value) => onChange({ ...settings, min: value })}
            />
            <StepperInput
              label={t('settings.rangeMax')}
              value={settings.max}
              min={-50}
              max={50}
              onChange={(value) => onChange({ ...settings, max: value })}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h3>{t('settings.timer')}</h3>
          <div className={styles.inputGrid}>
            <StepperInput
              label={t('settings.timeout')}
              value={settings.timeoutSeconds}
              min={1}
              max={120}
              onChange={(value) => onChange({ ...settings, timeoutSeconds: value })}
            />
          </div>
        </section>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.reset} onClick={onReset}>
          {t('settings.reset')}
        </button>
        <button type="button" className={styles.start} onClick={onStart}>
          {t('settings.start')}
        </button>
      </div>
    </section>
  );
};

export default SettingsPanel;
