import styles from './ActionBar.module.css';

export default function ActionBar({ isRunning, hasResults, downloadCount, disabled, onStart, onStop, onDownload }) {
  return (
    <div className={styles.row}>
      {isRunning ? (
        <button type="button" className={`${styles.btn} ${styles.danger}`} onClick={onStop}>
          <span className={styles.icon}>■</span> Parar
        </button>
      ) : (
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onStart} disabled={disabled}>
          <span className={styles.icon}>▶</span> Iniciar Coleta
        </button>
      )}

      {!isRunning && hasResults && (
        <button type="button" className={`${styles.btn} ${styles.success}`} onClick={onDownload}>
          <span className={styles.icon}>⬇</span> Baixar Excel ({downloadCount})
        </button>
      )}
    </div>
  );
}
