import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext(null);

async function fetchStaffMe(accessToken) {
  const res = await fetch('/api/admin/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || 'Not authorized as staff.' };
  }
  return { ok: true, data };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const [staffLoading, setStaffLoading] = useState(false);
  const skipStaffFetchOnce = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setStaff(null);
      setStaffLoading(false);
      return;
    }

    if (skipStaffFetchOnce.current) {
      skipStaffFetchOnce.current = false;
      setStaffLoading(false);
      return;
    }

    let cancelled = false;
    setStaffLoading(true);

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) {
          setStaff(null);
          setStaffLoading(false);
        }
        return;
      }

      const me = await fetchStaffMe(session.access_token);
      if (cancelled) return;

      if (!me.ok) {
        await supabase.auth.signOut();
        setStaff(null);
        setStaffLoading(false);
        return;
      }

      setStaff(me.data);
      setStaffLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: { message: 'No session after sign-in.' } };
    }

    const me = await fetchStaffMe(session.access_token);
    if (!me.ok) {
      await supabase.auth.signOut();
      return { error: { message: me.error } };
    }

    skipStaffFetchOnce.current = true;
    setStaff(me.data);
    return { error: null };
  }

  async function signOut() {
    setStaff(null);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      staff,
      staffLoading,
      signIn,
      signOut,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
