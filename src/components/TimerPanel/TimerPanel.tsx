import styles from './TimerPanel.module.scss';

interface TimerPanelProps {
  remaining: number;
  running: boolean;
}

const TimerPanel = ({ remaining, running }: TimerPanelProps) => (
  <section className={styles.timer}>
    <p>Countdown</p>
    <strong>{remaining}s</strong>
    <span className={running ? styles.running : styles.paused}>{running ? 'Running' : 'Stopped'}</span>
  </section>
);

export default TimerPanel;
