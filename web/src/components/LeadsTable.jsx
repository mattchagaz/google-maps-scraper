import { useState } from 'react';
import { isMissing } from '../lib/filters.js';
import { extractWhatsappNumber, buildChatLink } from '../lib/whatsapp.js';
import StatusPill from './StatusPill.jsx';
import styles from './LeadsTable.module.css';

const COLUMNS = [
  { key: 'nome', label: 'Nome' },
  { key: 'avaliacao', label: 'Avaliação', rating: true },
  { key: 'website', label: 'Website', link: true },
  { key: 'redes', label: 'Redes Sociais', link: true },
  { key: 'telefone', label: 'Telefone', copyable: true },
  { key: 'email', label: 'Email' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'endereco', label: 'Endereço' },
];

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function Cell({ value, link }) {
  if (isMissing(value)) return <span className={styles.empty}>—</span>;
  if (link) {
    return (
      <a className={styles.link} href={value} target="_blank" rel="noreferrer">
        {value.replace(/^https?:\/\//, '')}
      </a>
    );
  }
  return <span>{value}</span>;
}

function PhoneCell({ value, copied, onCopy }) {
  if (isMissing(value)) return <span className={styles.empty}>—</span>;
  return (
    <span className={styles.phoneCell}>
      {value}
      <button type="button" className={styles.copyBtn} title="Copiar telefone" onClick={onCopy}>
        {copied ? '✓' : <CopyIcon />}
      </button>
    </span>
  );
}

function RatingCell({ lead }) {
  if (isMissing(lead.avaliacao)) return <span className={styles.empty}>—</span>;
  return (
    <span>
      ⭐ {lead.avaliacao}
      {!isMissing(lead.num_avaliacoes) && <span className={styles.ratingCount}> ({lead.num_avaliacoes})</span>}
    </span>
  );
}

function WhatsappCell({ lead, message }) {
  const number = extractWhatsappNumber(lead.whatsapp, lead.telefone);
  if (!number) return <span className={styles.empty}>—</span>;
  return (
    <a className={styles.waBtn} href={buildChatLink(number, message)} target="_blank" rel="noreferrer">
      💬 Chamar
    </a>
  );
}

export default function LeadsTable({
  leads,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteLead,
  onStatusChange,
  waMessage,
  onOpenLead,
}) {
  const [copiedId, setCopiedId] = useState(null);

  if (loading) return <div className={styles.state}>Carregando leads...</div>;
  if (leads.length === 0) return <div className={styles.state}>Nenhum lead encontrado para esses filtros.</div>;

  const copyPhone = (tel, id) => {
    navigator.clipboard.writeText(tel).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
    });
  };

  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input type="checkbox" className={styles.checkbox} checked={allSelected} onChange={onToggleSelectAll} />
            </th>
            <th>Status</th>
            <th>WhatsApp</th>
            {COLUMNS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className={selectedIds.has(lead.id) ? styles.rowSelected : ''}>
              <td>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.has(lead.id)}
                  onChange={() => onToggleSelect(lead.id)}
                />
              </td>
              <td>
                <StatusPill value={lead.status} onChange={(v) => onStatusChange(lead.id, v)} />
              </td>
              <td>
                <WhatsappCell lead={lead} message={waMessage} />
              </td>
              {COLUMNS.map((c) =>
                c.copyable ? (
                  <td key={c.key}>
                    <PhoneCell
                      value={lead[c.key]}
                      copied={copiedId === lead.id}
                      onCopy={() => copyPhone(lead[c.key], lead.id)}
                    />
                  </td>
                ) : c.key === 'nome' ? (
                  <td key={c.key} className={styles.nameCell}>
                    <button type="button" className={styles.nameBtn} onClick={() => onOpenLead(lead)}>
                      {lead.nome}
                      {lead.notas && <span title="Tem nota">📝</span>}
                    </button>
                  </td>
                ) : c.rating ? (
                  <td key={c.key}>
                    <RatingCell lead={lead} />
                  </td>
                ) : (
                  <td key={c.key}>
                    <Cell value={lead[c.key]} link={c.link} />
                  </td>
                )
              )}
              <td>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  title="Excluir lead"
                  onClick={() => onDeleteLead(lead)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
