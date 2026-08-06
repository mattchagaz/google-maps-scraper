import styles from './AlertBanner.module.css';

export default function AlertBanner() {
  return (
    <div className={styles.alert}>
      <span className={styles.icon}>⚠️</span>
      Abra o Google Maps e faça uma busca antes de iniciar.
    </div>
  );
}
