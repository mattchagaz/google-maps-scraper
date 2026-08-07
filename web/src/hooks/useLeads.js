import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Fetches leads for the user — either one collection (collectionId set)
 * or everything the user owns (collectionId === null, "Todas as coletas").
 */
export function useLeads(user, collectionId) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);

    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (collectionId) query = query.eq('collection_id', collectionId);

    query.then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) setError(err.message);
      else {
        setError(null);
        setLeads(data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, collectionId]);

  // `collections.total` is kept correct by a DB trigger — deleting here
  // only needs to update this hook's own local list.
  const removeLead = useCallback(async (id) => {
    const { error: err } = await supabase.from('leads').delete().eq('id', id);
    if (err) throw err;
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const removeLeads = useCallback(async (ids) => {
    const { error: err } = await supabase.from('leads').delete().in('id', ids);
    if (err) throw err;
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
  }, []);

  const updateStatus = useCallback(async (ids, status) => {
    const { error: err } = await supabase.from('leads').update({ status }).in('id', ids);
    if (err) throw err;
    setLeads((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l)));
  }, []);

  // `cnpjData` is the object returned by lib/cnpj.js's fetchCnpjData().
  const updateCnpj = useCallback(async (id, cnpjData) => {
    const { error: err } = await supabase.from('leads').update(cnpjData).eq('id', id);
    if (err) throw err;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...cnpjData } : l)));
  }, []);

  const updateNotes = useCallback(async (id, notas) => {
    const { error: err } = await supabase.from('leads').update({ notas }).eq('id', id);
    if (err) throw err;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notas } : l)));
  }, []);

  return { leads, loading, error, removeLead, removeLeads, updateStatus, updateCnpj, updateNotes };
}
