import { useMemo, useState } from 'react';
import FilterBar from './FilterBar.jsx';
import { applyFilters, isMissing } from '../lib/filters.js';
import styles from './ResultsPanel.module.css';

const FLAGS = [
  { key: 'website', icon: '🌐', label: 'Sem website' },
  { key: 'telefone', icon: '📞', label: 'Sem telefone' },
  { key: 'email', icon: '✉️', label: 'Sem email' },
];

export default function ResultsPanel({ data, activeKeys, onToggleFilter, search, onSearchChange }) {
  const ordered = useMemo(() => [...data].reverse(), [data]);
  const filtered = useMemo(
    () => applyFilters(ordered, activeKeys, search),
    [ordered, activeKeys, search]
  );

  const filtersOn = activeKeys.length > 0 || search.trim().length > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>✅ Coleta concluída</span>
        <span className={styles.count}>
          {filtersOn ? `${filtered.length} de ${data.length}` : `${data.length} empresa(s)`}
        </span>
      </div>

      <FilterBar
        activeKeys={activeKeys}
        onToggle={onToggleFilter}
        search={search}
        onSearchChange={onSearchChange}
      />

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>Nenhum resultado para esses filtros.</div>
        ) : (
          filtered.map((d, i) => (
            <div className={styles.item} key={`${d.nome}-${i}`}>
              <span className={styles.name}>{d.nome}</span>
              <span className={styles.flags}>
                {FLAGS.filter((f) => isMissing(d[f.key])).map((f) => (
                  <span key={f.key} className={styles.flag} title={f.label}>
                    {f.icon}
                  </span>
                ))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
