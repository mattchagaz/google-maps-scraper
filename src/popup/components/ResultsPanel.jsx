import { useMemo, useState } from 'react';
import FilterBar from './FilterBar.jsx';
import { applyFilters, isMissing } from '../lib/filters.js';
import styles from './ResultsPanel.module.css';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL;

function openDashboard() {
  if (DASHBOARD_URL) chrome.tabs.create({ url: DASHBOARD_URL });
}

const FLAGS = [
  { key: 'website', icon: '🌐', label: 'Sem website' },
  { key: 'telefone', icon: '📞', label: 'Sem telefone' },
  { key: 'whatsapp', icon: '💬', label: 'Sem WhatsApp' },
  { key: 'email', icon: '✉️', label: 'Sem email' },
];

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function ResultsPanel({ data, activeKeys, onToggleFilter, search, onSearchChange, onClear, showDashboardHint }) {
  const ordered = useMemo(() => [...data].reverse(), [data]);
  const filtered = useMemo(
    () => applyFilters(ordered, activeKeys, search),
    [ordered, activeKeys, search]
  );

  const filtersOn = activeKeys.length > 0 || search.trim().length > 0;

  const [copiedIdx, setCopiedIdx] = useState(null);
  const copyPhone = (tel, idx) => {
    navigator.clipboard.writeText(tel).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1200);
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>✅ Coleta concluída</span>
        <span className={styles.right}>
          <span className={styles.count}>
            {filtersOn ? `${filtered.length} de ${data.length}` : `${data.length} empresa(s)`}
          </span>
          <button type="button" className={styles.clear} onClick={onClear} title="Limpar resultados">
            🗑 Limpar
          </button>
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
                {!isMissing(d.telefone) && (
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => copyPhone(d.telefone, i)}
                    title="Copiar telefone"
                  >
                    {copiedIdx === i ? '✓' : <CopyIcon />}
                  </button>
                )}
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

      {showDashboardHint && (
        <button type="button" className={styles.dashboardHint} onClick={openDashboard}>
          💡 Categoria, avaliação e notas completas no Dashboard ↗
        </button>
      )}
    </div>
  );
}
