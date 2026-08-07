import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/** Lists the logged-in user's collections (scraper runs), newest first. */
export function useCollections(user) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else {
      setError(null);
      setCollections(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(async (id) => {
    const { error: err } = await supabase.from('collections').delete().eq('id', id);
    if (err) throw err;
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const rename = useCallback(async (id, label) => {
    const clean = label.trim();
    if (!clean) return;
    const { error: err } = await supabase.from('collections').update({ label: clean }).eq('id', id);
    if (err) throw err;
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, label: clean } : c)));
  }, []);

  // Pulls just the latest totals — used after a lead is deleted, since
  // the DB trigger updates `total` server-side but this list is local.
  const refreshTotals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('collections').select('id, total');
    if (!data) return;
    setCollections((prev) =>
      prev.map((c) => {
        const match = data.find((d) => d.id === c.id);
        return match ? { ...c, total: match.total } : c;
      })
    );
  }, [user]);

  return { collections, loading, error, refresh, remove, rename, refreshTotals };
}
