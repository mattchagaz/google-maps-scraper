import { useEffect, useState } from 'react';
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

  return { leads, loading, error };
}
