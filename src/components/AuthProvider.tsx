'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Listen for any login/logout/change events from Supabase
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      // Refresh the page to stay in sync with the server session
      window.location.reload();
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
