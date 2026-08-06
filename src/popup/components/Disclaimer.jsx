import styles from './Disclaimer.module.css';

export default function Disclaimer() {
  return (
    <div className={styles.box}>
      ⚖️ <strong>Aviso Legal:</strong> O uso desta extensão pode violar os{' '}
      <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noreferrer">
        Termos de Uso
      </a>{' '}
      do Google Maps. Use com responsabilidade.
    </div>
  );
}
