import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCollections } from '../hooks/useCollections.js';
import { useLeads } from '../hooks/useLeads.js';
import { useMessageTemplate } from '../hooks/useMessageTemplate.js';
import { applyFilters } from '../lib/filters.js';
import { downloadXLS } from '../lib/xlsExport.js';
import TopBar from '../components/TopBar.jsx';
import CollectionList from '../components/CollectionList.jsx';
import Toolbar from '../components/Toolbar.jsx';
import LeadsTable from '../components/LeadsTable.jsx';
import BulkActionBar from '../components/BulkActionBar.jsx';
import LeadModal from '../components/LeadModal.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard({ auth }) {
  const {
    collections,
    loading: collectionsLoading,
    error: collectionsError,
    remove,
    rename,
    refreshTotals,
  } = useCollections(auth.user);
  const [selectedId, setSelectedId] = useState(null); // null = "todas as coletas"
  const { leads, loading: leadsLoading, removeLead, removeLeads, updateStatus, updateNotes } = useLeads(
    auth.user,
    selectedId
  );
  const [waMessage, setWaMessage] = useMessageTemplate();

  const [activeKeys, setActiveKeys] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openLeadId, setOpenLeadId] = useState(null);

  // Trocar de coleta invalida qualquer seleção da tabela anterior.
  useEffect(() => setSelectedIds(new Set()), [selectedId]);

  const toggleFilter = (key) =>
    setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const filtered = useMemo(() => {
    const byFields = applyFilters(leads, activeKeys, search);
    return statusFilter ? byFields.filter((l) => l.status === statusFilter) : byFields;
  }, [leads, activeKeys, search, statusFilter]);

  const selectedCollection = collections.find((c) => c.id === selectedId) ?? null;
  const openLead = leads.find((l) => l.id === openLeadId) ?? null;

  const handleDelete = async (id) => {
    if (!confirm('Excluir essa coleta e todos os leads dela? Isso não pode ser desfeito.')) return;
    try {
      await remove(id);
      if (selectedId === id) setSelectedId(null);
      toast.success('Coleta excluída.');
    } catch (err) {
      toast.error(`Erro ao excluir coleta: ${err.message}`);
    }
  };

  const handleRename = async (id, label) => {
    try {
      await rename(id, label);
      toast.success('Coleta renomeada.');
    } catch (err) {
      toast.error(`Erro ao renomear: ${err.message}`);
    }
  };

  const handleDeleteLead = async (lead) => {
    if (!confirm(`Excluir "${lead.nome}"? Isso não pode ser desfeito.`)) return;
    try {
      await removeLead(lead.id);
      refreshTotals(); // o total da coleta dona desse lead mudou no banco (trigger)
      if (openLeadId === lead.id) setOpenLeadId(null);
      toast.success(`"${lead.nome}" excluído.`);
    } catch (err) {
      toast.error(`Erro ao excluir lead: ${err.message}`);
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      const allSelected = filtered.length > 0 && filtered.every((l) => prev.has(l.id));
      return allSelected ? new Set() : new Set(filtered.map((l) => l.id));
    });

  const clearSelection = () => setSelectedIds(new Set());

  const bulkDelete = async () => {
    if (!confirm(`Excluir ${selectedIds.size} lead(s)? Isso não pode ser desfeito.`)) return;
    const count = selectedIds.size;
    try {
      await removeLeads([...selectedIds]);
      clearSelection();
      refreshTotals();
      toast.success(`${count} lead(s) excluído(s).`);
    } catch (err) {
      toast.error(`Erro ao excluir: ${err.message}`);
    }
  };

  const bulkSetStatus = async (status) => {
    try {
      await updateStatus([...selectedIds], status);
      clearSelection();
      toast.success('Status atualizado.');
    } catch (err) {
      toast.error(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const bulkExport = () => {
    downloadXLS(leads.filter((l) => selectedIds.has(l.id)), 'selecionados');
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
          onRename={handleRename}
        />

        <main className={styles.main}>
          <Toolbar
            activeKeys={activeKeys}
            onToggleFilter={toggleFilter}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalCount={leads.length}
            filteredCount={filtered.length}
            title={selectedCollection ? selectedCollection.label : 'Todas as coletas'}
            onExport={() =>
              downloadXLS(filtered, selectedCollection ? selectedCollection.label.replace(/\s+/g, '_') : 'todas_coletas')
            }
            waMessage={waMessage}
            onWaMessageChange={setWaMessage}
          />

          {selectedIds.size > 0 && (
            <BulkActionBar
              count={selectedIds.size}
              onClear={clearSelection}
              onDelete={bulkDelete}
              onSetStatus={bulkSetStatus}
              onExport={bulkExport}
            />
          )}

          <LeadsTable
            leads={filtered}
            loading={leadsLoading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDeleteLead={handleDeleteLead}
            onStatusChange={(id, status) =>
              updateStatus([id], status).catch((err) => toast.error(`Erro ao atualizar status: ${err.message}`))
            }
            waMessage={waMessage}
            onOpenLead={(lead) => setOpenLeadId(lead.id)}
          />
        </main>
      </div>

      {openLead && (
        <LeadModal
          lead={openLead}
          onClose={() => setOpenLeadId(null)}
          onStatusChange={(id, status) =>
            updateStatus([id], status).catch((err) => toast.error(`Erro ao atualizar status: ${err.message}`))
          }
          onDeleteLead={handleDeleteLead}
          onSaveNotes={updateNotes}
          waMessage={waMessage}
        />
      )}
    </div>
  );
}
