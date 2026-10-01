import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSecretKeyDetected, isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Profile, UserSession } from '../types/user';

interface AuthContextType {
  user: UserSession | null;
  profile: Profile | null;
  loading: boolean;
  isCloudConnected: boolean;
  isSecretKey: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'habitflow_local_session';
const LOCAL_PROFILE_KEY = 'habitflow_local_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isCloudConnected = isSupabaseConfigured();
  const isSecretKey = isSecretKeyDetected();

  async function fetchProfileFromSupabase(userId: string, defaultName: string, email: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data);
      } else {
        // Upsert default profile
        const newProfile: Profile = {
          id: userId,
          name: defaultName,
          email: email,
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  }

  // Load user session on mount
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (isCloudConnected && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session fetch error:', error);
          }

          if (session?.user) {
            const u: UserSession = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            };
            if (mounted) {
              setUser(u);
              await fetchProfileFromSupabase(session.user.id, u.name, u.email);
            }
          } else {
            if (mounted) {
              setUser(null);
              setProfile(null);
            }
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user) {
              const u: UserSession = {
                id: session.user.id,
                email: session.user.email || '',
                name:
                  session.user.user_metadata?.name ||
                  session.user.email?.split('@')[0] ||
                  'User',
              };
              setUser(u);
              await fetchProfileFromSupabase(session.user.id, u.name, u.email);
            } else {
              setUser(null);
              setProfile(null);
            }
            setLoading(false);
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Local fallback authentication
        try {
          const savedUser = localStorage.getItem(LOCAL_USER_KEY);
          const savedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);

          if (savedUser) {
            setUser(JSON.parse(savedUser));
            if (savedProfile) {
              setProfile(JSON.parse(savedProfile));
            }
          } else {
            // Default demo account for immediate live evaluation
            const defaultUser: UserSession = {
              id: 'demo-user-1',
              email: 'alex@habitflow.app',
              name: 'Alex Morgan',
            };
            const defaultProfile: Profile = {
              id: defaultUser.id,
              name: defaultUser.name,
              email: defaultUser.email,
              created_at: new Date().toISOString(),
            };
            setUser(defaultUser);
            setProfile(defaultProfile);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
            localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
          }
        } catch (e) {
          console.error('Local auth restore failed', e);
        } finally {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [isCloudConnected]);

  const signIn = async (email: string, password: string) => {
    if (isCloudConnected && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid login credentials');
      }

      if (data.user) {
        const u: UserSession = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        };
        setUser(u);
        await fetchProfileFromSupabase(data.user.id, u.name, u.email);
      }
    } else {
      // Local mode sign in
      const localId = `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const name = email.split('@')[0];
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      const u: UserSession = { id: localId, email, name: capitalized };
      const p: Profile = { id: localId, name: capitalized, email };

      setUser(u);
      setProfile(p);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(p));
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const trimmedName = name.trim();
    if (isCloudConnected && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: trimmedName,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to sign up');
      }

      if (data.user) {
        const u: UserSession = {
          id: data.user.id,
          email: data.user.email || '',
          name: trimmedName || data.user.email?.split('@')[0] || 'User',
        };
        setUser(u);
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: u.name,
          email: u.email,
        });
        setProfile({
          id: data.user.id,
          name: u.name,
          email: u.email,
        });
      }
    } else {
      const localId = `user-${Date.now()}`;
      const u: UserSession = { id: localId, email, name: trimmedName || 'User' };
      const p: Profile = { id: localId, name: trimmedName || 'User', email };

      setUser(u);
      setProfile(p);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(p));
    }
  };

  const signOut = async () => {
    if (isCloudConnected && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_PROFILE_KEY);
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfileName = async (name: string) => {
    const trimmed = name.trim();
    if (!user) return;

    if (isCloudConnected && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ name: trimmed, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message || 'Failed to update profile name');
      }

      await supabase.auth.updateUser({
        data: { name: trimmed },
      });
    }

    const updatedUser = { ...user, name: trimmed };
    const updatedProfile = { ...(profile || { id: user.id, email: user.email }), name: trimmed };

    setUser(updatedUser);
    setProfile(updatedProfile);

    if (!isCloudConnected) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updatedProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isCloudConnected,
        isSecretKey,
        signIn,
        signUp,
        signOut,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
