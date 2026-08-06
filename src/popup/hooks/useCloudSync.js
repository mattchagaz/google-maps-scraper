import { useEffect, useRef, useState } from 'react';
import { syncCollection } from '../lib/cloudSync.js';

/**
 * Watches a scrape run finish (isRunning: true → false) and pushes the
 * result to Supabase exactly once per run — never on popup reopen, never
 * twice. No-ops silently if the user isn't logged in.
 */
export function useCloudSync({ isRunning, collectedData, user }) {
  const [status, setStatus] = useState('idle'); // idle | syncing | done | error
  const [error, setError] = useState(null);
  const wasRunning = useRef(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isRunning) {
      wasRunning.current = true;
      syncedRef.current = false;
      setStatus('idle');
      return;
    }

    if (!wasRunning.current) return; // popup opened with an already-finished run — don't resync
    wasRunning.current = false;
    if (syncedRef.current || !user || collectedData.length === 0) return;

    syncedRef.current = true;
    setStatus('syncing');
    syncCollection(collectedData)
      .then(() => setStatus('done'))
      .catch((e) => {
        setStatus('error');
        setError(e.message);
      });
  }, [isRunning, collectedData, user]);

  return { status, error };
}
