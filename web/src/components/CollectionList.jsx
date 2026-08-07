import { useState } from 'react';
import styles from './CollectionList.module.css';

function formatDate(iso) {
  return (
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function CollectionList({ collections, loading, error, selectedId, onSelect, onDelete, onRename }) {
  const totalLeads = collections.reduce((sum, c) => sum + c.total, 0);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  const startEdit = (c) => {
    setEditingId(c.id);
    setDraft(c.label);
  };

  const commitEdit = () => {
    if (editingId && draft.trim()) onRename(editingId, draft);
    setEditingId(null);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>Coletas</div>

      <button
        type="button"
        className={`${styles.item} ${selectedId === null ? styles.itemActive : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className={styles.itemLabel}>Todas as coletas</span>
        <span className={styles.itemCount}>{totalLeads}</span>
      </button>

      {loading && <div className={styles.hint}>Carregando...</div>}
      {error && <div className={styles.hintError}>{error}</div>}
      {!loading && collections.length === 0 && (
        <div className={styles.hint}>
          Nenhuma coleta ainda. Rode a extensão com sua conta conectada pra ver os leads aqui.
        </div>
      )}

      <div className={styles.list}>
        {collections.map((c) => (
          <div key={c.id} className={`${styles.item} ${selectedId === c.id ? styles.itemActive : ''}`}>
            {editingId === c.id ? (
              <input
                autoFocus
                className={styles.renameInput}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <button type="button" className={styles.itemButton} onClick={() => onSelect(c.id)}>
                <span className={styles.itemLabel}>{c.label}</span>
                <span className={styles.itemMeta}>
                  {formatDate(c.created_at)} · {c.total} lead{c.total === 1 ? '' : 's'}
                </span>
              </button>
            )}

            {editingId !== c.id && (
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Renomear coleta"
                  onClick={() => startEdit(c)}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Excluir coleta"
                  onClick={() => onDelete(c.id)}
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
