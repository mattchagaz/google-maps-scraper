import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.badge}>📍</div>
      <div>
        <h1 className={styles.title}>Maps Scraper</h1>
        <p className={styles.subtitle}>Coletor de empresas</p>
      </div>
    </header>
  );
}
