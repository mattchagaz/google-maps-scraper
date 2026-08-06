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

  return { collections, loading, error, refresh, remove };
}
