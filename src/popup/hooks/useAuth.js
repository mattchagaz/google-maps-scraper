import { useCallback, useEffect, useState } from 'react';
import { supabase, cloudConfigured } from '../lib/supabase.js';

/**
 * Thin wrapper around Supabase auth for the popup's optional cloud sync.
 * Entirely inert when Supabase isn't configured (cloudConfigured === false).
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(cloudConfigured);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!cloudConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    return !error;
  }, []);

  const signUp = useCallback(async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    return !error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { cloudConfigured, user, loading, authError, signIn, signUp, signOut };
}
