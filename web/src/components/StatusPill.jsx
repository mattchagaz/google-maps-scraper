import { STATUS_OPTIONS, statusInfo } from '../lib/status.js';
import styles from './StatusPill.module.css';

const ALL_COLOR = '#7a7a90';

/**
 * Colored select — a status pill when `value` is one of STATUS_OPTIONS,
 * or (with allowAll) a filter dropdown with an extra "todos" option.
 */
export default function StatusPill({ value, onChange, allowAll = false, allLabel = 'Todos os status' }) {
  const info = value ? statusInfo(value) : { color: ALL_COLOR };
  return (
    <span className={styles.wrap} style={{ '--pill-color': info.color }}>
      <span className={styles.dot} />
      <select
        className={styles.pill}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        onClick={(e) => e.stopPropagation()}
      >
        {allowAll && <option value="">{allLabel}</option>}
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </span>
  );
}
