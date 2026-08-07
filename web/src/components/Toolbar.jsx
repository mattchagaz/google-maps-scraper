import { useState } from 'react';
import { FIELD_FILTERS } from '../lib/filters.js';
import StatusPill from './StatusPill.jsx';
import styles from './Toolbar.module.css';

export default function Toolbar({
  title,
  activeKeys,
  onToggleFilter,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
  onExport,
  waMessage,
  onWaMessageChange,
}) {
  const [editingMessage, setEditingMessage] = useState(false);
  const filtersOn = activeKeys.length > 0 || search.trim().length > 0 || !!statusFilter;

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>
          {filtersOn ? `${filteredCount} de ${totalCount}` : `${totalCount} lead${totalCount === 1 ? '' : 's'}`}
        </span>
        <button
          type="button"
          className={styles.waEdit}
          onClick={() => setEditingMessage((v) => !v)}
          title="Editar mensagem padrão do WhatsApp"
        >
          💬 Mensagem
        </button>
        <button type="button" className={styles.export} onClick={onExport} disabled={filteredCount === 0}>
          ⬇ Baixar Excel ({filteredCount})
        </button>
      </div>

      {editingMessage && (
        <div className={styles.messageBox}>
          <textarea
            className={styles.messageInput}
            value={waMessage}
            onChange={(e) => onWaMessageChange(e.target.value)}
            rows={2}
            placeholder="Mensagem enviada quando você clica em Chamar no Zap..."
          />
        </div>
      )}

      <div className={styles.row}>
        <input
          className={styles.search}
          type="text"
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <StatusPill value={statusFilter} onChange={onStatusFilterChange} allowAll />
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
