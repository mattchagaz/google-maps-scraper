import { FIELD_FILTERS } from '../lib/filters.js';
import styles from './FilterBar.module.css';

export default function FilterBar({ activeKeys, onToggle, search, onSearchChange }) {
  return (
    <div className={styles.wrap}>
      <input
        className={styles.search}
        type="text"
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className={styles.chips}>
        {FIELD_FILTERS.map((f) => {
          const active = activeKeys.includes(f.key);
          return (
            <button
              key={f.key}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ''}`}
              onClick={() => onToggle(f.key)}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
