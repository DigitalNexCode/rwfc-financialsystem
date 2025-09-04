import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types/supabase';

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        // 1. Get the initial session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        // 2. If a session exists, fetch the user's profile
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile on initial load:', error.message);
            setUser(null);
          } else {
            setUser(profile);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("An error occurred during initial session fetch:", e);
      } finally {
        // 3. Ensure loading is set to false after the initial check is complete
        setLoading(false);
      }
    };

    fetchInitialSession();

    // 4. Set up a listener for subsequent auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile on auth change:', error.message);
          setUser(null);
        } else {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
