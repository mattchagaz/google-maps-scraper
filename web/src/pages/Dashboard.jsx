import { useMemo, useState } from 'react';
import { useCollections } from '../hooks/useCollections.js';
import { useLeads } from '../hooks/useLeads.js';
import { applyFilters } from '../lib/filters.js';
import { downloadXLS } from '../lib/xlsExport.js';
import TopBar from '../components/TopBar.jsx';
import CollectionList from '../components/CollectionList.jsx';
import Toolbar from '../components/Toolbar.jsx';
import LeadsTable from '../components/LeadsTable.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard({ auth }) {
  const { collections, loading: collectionsLoading, error: collectionsError, remove } =
    useCollections(auth.user);
  const [selectedId, setSelectedId] = useState(null); // null = "todas as coletas"
  const { leads, loading: leadsLoading } = useLeads(auth.user, selectedId);

  const [activeKeys, setActiveKeys] = useState([]);
  const [search, setSearch] = useState('');

  const toggleFilter = (key) =>
    setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const filtered = useMemo(() => applyFilters(leads, activeKeys, search), [leads, activeKeys, search]);

  const selectedCollection = collections.find((c) => c.id === selectedId) ?? null;

  const handleDelete = async (id) => {
    if (!confirm('Excluir essa coleta e todos os leads dela? Isso não pode ser desfeito.')) return;
    await remove(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className={styles.page}>
      <TopBar auth={auth} totalLeads={leads.length} totalCollections={collections.length} />

      <div className={styles.body}>
        <CollectionList
          collections={collections}
          loading={collectionsLoading}
          error={collectionsError}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={handleDelete}
        />

        <main className={styles.main}>
          <Toolbar
            activeKeys={activeKeys}
            onToggleFilter={toggleFilter}
            search={search}
            onSearchChange={setSearch}
            totalCount={leads.length}
            filteredCount={filtered.length}
            title={selectedCollection ? selectedCollection.label : 'Todas as coletas'}
            onExport={() =>
              downloadXLS(filtered, selectedCollection ? selectedCollection.label.replace(/\s+/g, '_') : 'todas_coletas')
            }
          />

          <LeadsTable leads={filtered} loading={leadsLoading} />
        </main>
      </div>
    </div>
  );
}
