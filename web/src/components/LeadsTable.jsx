import { isMissing } from '../lib/filters.js';
import styles from './LeadsTable.module.css';

const COLUMNS = [
  { key: 'nome', label: 'Nome' },
  { key: 'website', label: 'Website', link: true },
  { key: 'redes', label: 'Redes Sociais', link: true },
  { key: 'telefone', label: 'Telefone' },
  { key: 'email', label: 'Email' },
  { key: 'agendamento', label: 'Agendamento', link: true },
  { key: 'cardapio', label: 'Cardápio', link: true },
  { key: 'endereco', label: 'Endereço' },
];

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

export default function LeadsTable({ leads, loading }) {
  if (loading) return <div className={styles.state}>Carregando leads...</div>;
  if (leads.length === 0) return <div className={styles.state}>Nenhum lead encontrado para esses filtros.</div>;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              {COLUMNS.map((c) => (
                <td key={c.key}>
                  <Cell value={lead[c.key]} link={c.link} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
