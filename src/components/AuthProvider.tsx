'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user once at startup
    supabase.auth.getSession().then(() => setLoading(false));

    // Listen for login/logout changes and recheck silently
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, _session) => {
      // We do NOT reload the page anymore.
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p className="text-center p-4">Loading...</p>;
  }

  return <>{children}</>;
}
