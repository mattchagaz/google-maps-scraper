import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { isMissing } from '../lib/filters.js';
import { extractWhatsappNumber, buildChatLink } from '../lib/whatsapp.js';
import StatusPill from './StatusPill.jsx';
import styles from './LeadModal.module.css';

const FIELDS = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'website', label: 'Website', link: true },
  { key: 'redes', label: 'Redes Sociais', link: true },
  { key: 'email', label: 'Email' },
  { key: 'endereco', label: 'Endereço' },
];

function Value({ value, link }) {
  if (isMissing(value)) return <span className={styles.empty}>Sem info</span>;
  if (link) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className={styles.link}>
        {value}
      </a>
    );
  }
  return <span>{value}</span>;
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado!`));
}

function NotesSection({ lead, onSaveNotes }) {
  const [text, setText] = useState(lead.notas || '');
  const [saving, setSaving] = useState(false);
  const dirty = text !== (lead.notas || '');

  const save = async () => {
    setSaving(true);
    try {
      await onSaveNotes(lead.id, text.trim() || null);
      toast.success('Nota salva.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.sectionBox}>
      <div className={styles.sectionTitle}>Notas</div>
      <textarea
        className={styles.notesInput}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Anote o que rolou com esse lead — ligou, respondeu, pediu orçamento..."
      />
      {dirty && (
        <button type="button" className={styles.sectionBtn} disabled={saving} onClick={save}>
          {saving ? 'Salvando...' : '💾 Salvar nota'}
        </button>
      )}
    </div>
  );
}

export default function LeadModal({ lead, onClose, onStatusChange, onDeleteLead, onSaveNotes, waMessage }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!lead) return null;

  const number = extractWhatsappNumber(lead.whatsapp, lead.telefone);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{lead.nome}</h2>
            <span className={styles.subtitle}>
              Coletado em {new Date(lead.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.row}>
          <StatusPill value={lead.status} onChange={(v) => onStatusChange(lead.id, v)} />

          {!isMissing(lead.avaliacao) && (
            <span className={styles.chipStatic}>
              ⭐ {lead.avaliacao}
              {!isMissing(lead.num_avaliacoes) && ` (${lead.num_avaliacoes})`}
            </span>
          )}

          {!isMissing(lead.telefone) && (
            <button type="button" className={styles.chip} onClick={() => copyToClipboard(lead.telefone, 'Telefone')}>
              📞 {lead.telefone}
            </button>
          )}

          {number && (
            <a className={styles.chipGreen} href={buildChatLink(number, waMessage)} target="_blank" rel="noreferrer">
              💬 Chamar no WhatsApp
            </a>
          )}
        </div>

        <div className={styles.grid}>
          {FIELDS.map((f) => (
            <div key={f.key} className={styles.field}>
              <span className={styles.label}>{f.label}</span>
              <Value value={lead[f.key]} link={f.link} />
            </div>
          ))}
        </div>

        <NotesSection lead={lead} onSaveNotes={onSaveNotes} />

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => {
              onDeleteLead(lead);
            }}
          >
            🗑 Excluir lead
          </button>
        </div>
      </div>
    </div>
  );
}
