import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});
const USAGE_UPDATED_EVENT = 'usage:updated';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ used: 0, limit: 10, remaining: 10 });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchUsage(session?.access_token || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        fetchUsage(session?.access_token || null);
      }
    );

    const handleUsageUpdated = (event) => {
      if (event?.detail && typeof event.detail === 'object') {
        setUsage((prev) => ({ ...prev, ...event.detail }));
      }
    };

    window.addEventListener(USAGE_UPDATED_EVENT, handleUsageUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(USAGE_UPDATED_EVENT, handleUsageUpdated);
    };
  }, []);

  const fetchUsage = async (accessToken = null) => {
    try {
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/usage', { headers });
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          setUsage(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const refreshUserProfile = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    setUser(user ?? null);
    return user ?? null;
  };

  const refreshUsage = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetchUsage(session?.access_token || null);
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  const requestPasswordReset = async (email) => {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
    const appOrigin = String(configuredSiteUrl || window.location.origin || '').replace(/\/+$/, '');
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appOrigin}/reset-password`,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    loading,
    usage,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    requestPasswordReset,
    updatePassword,
    refreshUsage,
    refreshUserProfile,
    isAuthenticated: !!user,
    isPremium: user?.user_metadata?.is_premium || false,
    hasInvoiceChaserUnlimited: Boolean(
      user?.user_metadata?.invoice_chaser_unlimited || user?.user_metadata?.is_premium
    ),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
