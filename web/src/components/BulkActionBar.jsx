import { STATUS_OPTIONS } from '../lib/status.js';
import styles from './BulkActionBar.module.css';

export default function BulkActionBar({ count, onClear, onDelete, onSetStatus, onExport }) {
  return (
    <div className={styles.bar}>
      <span className={styles.count}>{count} selecionado(s)</span>

      <select
        className={styles.statusSelect}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onSetStatus(e.target.value);
          e.target.value = '';
        }}
      >
        <option value="" disabled>
          Marcar como...
        </option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button type="button" className={styles.action} onClick={onExport}>
        ⬇ Exportar
      </button>
      <button type="button" className={`${styles.action} ${styles.danger}`} onClick={onDelete}>
        🗑 Excluir
      </button>

      <button type="button" className={styles.clear} onClick={onClear}>
        Cancelar
      </button>
    </div>
  );
}
