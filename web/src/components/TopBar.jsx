import styles from './TopBar.module.css';

export default function TopBar({ auth, totalLeads, totalCollections }) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.badge}>📍</span>
        <div>
          <div className={styles.title}>Maps Scraper</div>
          <div className={styles.subtitle}>
            {totalCollections} coleta{totalCollections === 1 ? '' : 's'} · {totalLeads} lead
            {totalLeads === 1 ? '' : 's'} nesta visão
          </div>
        </div>
      </div>
      <div className={styles.account}>
        <span className={styles.email}>{auth.user.email}</span>
        <button type="button" className={styles.signOut} onClick={auth.signOut}>
          Sair
        </button>
      </div>
    </header>
  );
}
