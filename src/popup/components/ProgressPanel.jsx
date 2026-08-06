import styles from './ProgressPanel.module.css';

export default function ProgressPanel({ progress, error }) {
  if (error) {
    return (
      <div className={`${styles.panel} ${styles.panelError}`}>
        <div className={styles.header}>
          <span>❌ Erro</span>
        </div>
        <div className={styles.bar}>
          <div className={`${styles.fill} ${styles.fillError}`} style={{ width: '100%' }} />
        </div>
        <div className={styles.status}>{error}</div>
      </div>
    );
  }

  const current = progress?.current ?? 0;
  const total = progress?.total ?? 0;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>⏳ Coletando...</span>
        <span className={styles.count}>
          {current} / {total || '?'}
        </span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.status}>
        {progress?.company ? `🏢 ${progress.company}` : 'Iniciando...'}
      </div>
    </div>
  );
}
