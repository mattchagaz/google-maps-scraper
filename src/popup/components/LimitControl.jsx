import styles from './LimitControl.module.css';

export default function LimitControl({ value, onChange, disabled }) {
  return (
    <div className={styles.section}>
      <label className={styles.label} htmlFor="limitSlider">
        🏢 Limite de empresas
      </label>
      <div className={styles.row}>
        <input
          id="limitSlider"
          className={styles.slider}
          type="range"
          min={5}
          max={100}
          step={5}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
}
