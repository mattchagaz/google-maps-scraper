import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Keeps each lead view alive while the dashboard is open. Switching away from
// a collection and back should not issue another request or flash the table.
// A full browser reload intentionally starts with fresh data.
const leadsCache = new Map();

function cacheKey(userId, collectionId) {
  return `${userId}:${collectionId ?? 'all'}`;
}

function updateCachedLeads(userId, update) {
  const prefix = `${userId}:`;
  for (const [key, cachedLeads] of leadsCache) {
    if (key.startsWith(prefix)) leadsCache.set(key, update(cachedLeads));
  }
}

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
    const key = cacheKey(user.id, collectionId);
    const cachedLeads = leadsCache.get(key);

    if (cachedLeads) {
      setError(null);
      setLeads(cachedLeads);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (collectionId) query = query.eq('collection_id', collectionId);

    query.then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) setError(err.message);
      else {
        setError(null);
        leadsCache.set(key, data);
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
    updateCachedLeads(user.id, (cachedLeads) => cachedLeads.filter((lead) => lead.id !== id));
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, [user]);

  const removeLeads = useCallback(async (ids) => {
    const { error: err } = await supabase.from('leads').delete().in('id', ids);
    if (err) throw err;
    updateCachedLeads(user.id, (cachedLeads) => cachedLeads.filter((lead) => !ids.includes(lead.id)));
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
  }, [user]);

  const updateStatus = useCallback(async (ids, status) => {
    const { error: err } = await supabase.from('leads').update({ status }).in('id', ids);
    if (err) throw err;
    updateCachedLeads(user.id, (cachedLeads) =>
      cachedLeads.map((lead) => (ids.includes(lead.id) ? { ...lead, status } : lead))
    );
    setLeads((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, status } : l)));
  }, [user]);

  // `cnpjData` is the object returned by lib/cnpj.js's fetchCnpjData().
  const updateCnpj = useCallback(async (id, cnpjData) => {
    const { error: err } = await supabase.from('leads').update(cnpjData).eq('id', id);
    if (err) throw err;
    updateCachedLeads(user.id, (cachedLeads) =>
      cachedLeads.map((lead) => (lead.id === id ? { ...lead, ...cnpjData } : lead))
    );
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...cnpjData } : l)));
  }, [user]);

  const updateNotes = useCallback(async (id, notas) => {
    const { error: err } = await supabase.from('leads').update({ notas }).eq('id', id);
    if (err) throw err;
    updateCachedLeads(user.id, (cachedLeads) =>
      cachedLeads.map((lead) => (lead.id === id ? { ...lead, notas } : lead))
    );
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notas } : l)));
  }, [user]);

  return { leads, loading, error, removeLead, removeLeads, updateStatus, updateCnpj, updateNotes };
}
