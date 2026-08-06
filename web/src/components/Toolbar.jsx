import { FIELD_FILTERS } from '../lib/filters.js';
import styles from './Toolbar.module.css';

export default function Toolbar({
  title,
  activeKeys,
  onToggleFilter,
  search,
  onSearchChange,
  totalCount,
  filteredCount,
  onExport,
}) {
  const filtersOn = activeKeys.length > 0 || search.trim().length > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>
          {filtersOn ? `${filteredCount} de ${totalCount}` : `${totalCount} lead${totalCount === 1 ? '' : 's'}`}
        </span>
        <button type="button" className={styles.export} onClick={onExport} disabled={filteredCount === 0}>
          ⬇ Baixar Excel ({filteredCount})
        </button>
      </div>

      <div className={styles.row}>
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
                onClick={() => onToggleFilter(f.key)}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
