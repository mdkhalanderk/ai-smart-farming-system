import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { getSavedLanguage, setSavedLanguage } from '../lib/i18n';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BACKEND_TOKEN_KEY = 'smart_crop_backend_token';
const CACHED_PROFILE_KEY = 'smart_crop_profile';
const CACHED_USER_KEY = 'smart_crop_user';

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      const u = localStorage.getItem(CACHED_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState(null);

  const [profile, setProfileState] = useState(() => {
    try {
      const p = localStorage.getItem(CACHED_PROFILE_KEY);
      return p ? JSON.parse(p) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguageState] = useState(() => getSavedLanguage());

  // Listen for language changes across components
  useEffect(() => {
    const handleLangChange = (e) => {
      if (e?.detail) {
        setLanguageState(e.detail);
      }
    };
    window.addEventListener('app-language-changed', handleLangChange);
    return () => {
      window.removeEventListener('app-language-changed', handleLangChange);
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authProvider, setAuthProvider] = useState('backend'); // 'supabase' | 'backend'

  const configStatus = getSupabaseConfigStatus();

  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    if (newUser) {
      try {
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(newUser));
      } catch {}
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  }, []);

  const setProfile = useCallback((newProfile) => {
    setProfileState(newProfile);
    if (newProfile) {
      try {
        const activeLang = getSavedLanguage();
        const merged = { ...newProfile, preferred_language: activeLang || newProfile.preferred_language || 'English' };
        localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(merged));
      } catch {}

      // Only adopt profile language if user hasn't explicitly chosen a language in localStorage
      const savedLang = localStorage.getItem('smart_crop_lang');
      if (!savedLang && newProfile.preferred_language) {
        setLanguageState(newProfile.preferred_language);
        setSavedLanguage(newProfile.preferred_language);
      }
    } else {
      localStorage.removeItem(CACHED_PROFILE_KEY);
    }
  }, []);

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    setSavedLanguage(newLang);
    setProfileState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, preferred_language: newLang };
      try {
        localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Notify backend
    const token = localStorage.getItem(BACKEND_TOKEN_KEY);
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferred_language: newLang })
      }).catch(() => {});
    }

    // Also update Supabase if user logged in
    if (user?.id && isSupabaseConfigured) {
      supabase.from('farmer_profiles').update({ preferred_language: newLang }).eq('id', user.id).then(() => {}).catch(() => {});
    }
  }, [user]);

  // Helper to fetch profile from backend
  const fetchBackendProfile = useCallback(async (token) => {
    try {
      setProfileLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          return data.profile;
        }
      }
      return null;
    } catch (err) {
      console.warn('Backend profile fetch error:', err.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [setProfile]);

  // Helper to fetch profile from Supabase
  const fetchSupabaseProfile = useCallback(async (userId) => {
    if (!userId || !isSupabaseConfigured) return null;
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.warn('Supabase profile fetch error:', err.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (userIdOrToken) => {
    const localToken = localStorage.getItem(BACKEND_TOKEN_KEY);
    if (localToken) {
      return await fetchBackendProfile(localToken);
    }
    return await fetchSupabaseProfile(userIdOrToken);
  }, [fetchBackendProfile, fetchSupabaseProfile]);

  // Initial session restoration across page reloads
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // 1. Check local backend session token first
      const backendToken = localStorage.getItem(BACKEND_TOKEN_KEY);
      if (backendToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${backendToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.user) {
              setUser(data.user);
              setSession({ access_token: backendToken, user: data.user });
              setProfile(data.profile || null);
              setAuthProvider('backend');
              setLoading(false);
              return;
            }
          } else {
            localStorage.removeItem(BACKEND_TOKEN_KEY);
          }
        } catch (e) {
          console.warn('Backend session restoration failed, checking Supabase:', e.message);
        }
      }

      // 2. If no backend token, check Supabase session
      if (isSupabaseConfigured) {
        try {
          const { data: { session: activeSession }, error } = await supabase.auth.getSession();
          if (isMounted) {
            if (!error && activeSession?.user) {
              setUser(activeSession.user);
              setSession(activeSession);
              setAuthProvider('supabase');
              await fetchSupabaseProfile(activeSession.user.id);
            } else {
              setUser(null);
              setSession(null);
              setProfile(null);
            }
          }
        } catch (err) {
          console.warn('Supabase getSession notice:', err.message);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    restoreSession();

    // Subscribe to Supabase auth events
    let subscription = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;
        // Only override if not currently logged in via backend token
        if (!localStorage.getItem(BACKEND_TOKEN_KEY)) {
          if (newSession?.user) {
            setUser(newSession.user);
            setSession(newSession);
            setAuthProvider('supabase');
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              await fetchSupabaseProfile(newSession.user.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        }
        setLoading(false);
      });
      subscription = data?.subscription;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchBackendProfile, fetchSupabaseProfile]);

  // Farmer Registration with seamless fallback
  const signUp = async (email, password, extraData = {}) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Function to register directly against our secure FastAPI Backend
    const registerViaBackend = async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
          full_name: extraData.full_name || 'Farmer',
          district: extraData.district || 'Kolar',
          state: extraData.state || 'Karnataka',
          main_crop: extraData.main_crop || 'Tomato',
          phone: extraData.mobile_number || extraData.phone || ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      const token = data.session?.access_token;
      if (token) {
        localStorage.setItem(BACKEND_TOKEN_KEY, token);
      }
      setUser(data.user);
      setSession(data.session);
      setProfile(data.profile);
      setAuthProvider('backend');

      return {
        user: data.user,
        session: data.session,
        profile: data.profile,
        requiresVerification: false
      };
    };

    // If Supabase is not configured or configured with an unreachable placeholder URL, use backend auth directly
    if (!isSupabaseConfigured || configStatus.url?.includes('cgqztsvrnjkzytzhxwiy')) {
      return await registerViaBackend();
    }

    // Otherwise attempt Supabase first
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: extraData.full_name || '',
            district: extraData.district || 'Kolar',
            main_crop: extraData.main_crop || 'Tomato'
          }
        }
      });

      if (error) {
        // If Supabase remote host is unreachable (paused / deleted / NXDOMAIN / network drop), automatically fall back to backend auth
        if (
          error.message?.includes('fetch failed') ||
          error.message?.includes('Failed to fetch') ||
          error.status === 0
        ) {
          console.warn('Supabase endpoint unreachable. Switching to secure backend authentication...');
          return await registerViaBackend();
        }
        if (error.message?.toLowerCase().includes('already registered')) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }
        throw new Error(error.message || 'Failed to register account.');
      }

      if (!data?.user) {
        throw new Error('Registration failed to return user data.');
      }

      const requiresVerification = !data.session;
      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        setAuthProvider('supabase');
        await fetchSupabaseProfile(data.user.id);
      }

      return {
        user: data.user,
        session: data.session,
        requiresVerification
      };
    } catch (err) {
      if (err.message?.includes('fetch failed') || err.message?.includes('Failed to fetch')) {
        return await registerViaBackend();
      }
      setAuthError(err.message);
      throw err;
    }
  };

  // Farmer Sign In with seamless fallback
  const signIn = async (email, password) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    const loginViaBackend = async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password.');
      }

      const token = data.session?.access_token;
      if (token) {
        localStorage.setItem(BACKEND_TOKEN_KEY, token);
      }
      setUser(data.user);
      setSession(data.session);
      setProfile(data.profile);
      setAuthProvider('backend');
      return data;
    };

    if (!isSupabaseConfigured || configStatus.url?.includes('cgqztsvrnjkzytzhxwiy')) {
      return await loginViaBackend();
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        if (
          error.message?.includes('fetch failed') ||
          error.message?.includes('Failed to fetch') ||
          error.status === 0
        ) {
          console.warn('Supabase endpoint unreachable. Attempting backend login...');
          return await loginViaBackend();
        }
        if (error.message?.toLowerCase().includes('invalid login credentials')) {
          // Try backend in case user was registered in local backend database
          try {
            return await loginViaBackend();
          } catch {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
        }
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Your email address has not been confirmed yet. Please verify your email using the link sent to your inbox.');
        }
        throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
      }

      if (data?.session && data?.user) {
        localStorage.removeItem(BACKEND_TOKEN_KEY);
        setUser(data.user);
        setSession(data.session);
        setAuthProvider('supabase');
        await fetchSupabaseProfile(data.user.id);
        return data;
      } else {
        throw new Error('Authentication succeeded but no active session was returned.');
      }
    } catch (err) {
      if (err.message?.includes('fetch failed') || err.message?.includes('Failed to fetch')) {
        return await loginViaBackend();
      }
      setAuthError(err.message);
      throw err;
    }
  };

  // Farmer Sign In with seamless fallback
  const resetPassword = async (email, newPassword) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        new_password: newPassword.trim()
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to update password.');
    }

    const token = data.session?.access_token;
    if (token) {
      localStorage.setItem(BACKEND_TOKEN_KEY, token);
    }
    setUser(data.user);
    setSession(data.session);
    setProfile(data.profile);
    setAuthProvider('backend');
    return data;
  };

  // Farmer Sign Out
  const signOut = async () => {
    setAuthError(null);
    const backendToken = localStorage.getItem(BACKEND_TOKEN_KEY);

    if (backendToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${backendToken}` }
        });
      } catch (err) {
        console.warn('Backend logout warning:', err.message);
      }
      localStorage.removeItem(BACKEND_TOKEN_KEY);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign-out warning:', err.message);
      }
    }

    localStorage.removeItem(CACHED_PROFILE_KEY);
    localStorage.removeItem(CACHED_USER_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Save or update farmer profile
  const saveProfile = async (profileData) => {
    if (!user) {
      throw new Error('You must be signed in to save your farmer profile.');
    }

    if (!profileData.full_name?.trim()) throw new Error('Full Name is required.');
    if (!profileData.district?.trim()) throw new Error('Agricultural District is required.');
    const cropValue = (profileData.main_crop || profileData.primary_crops || '').trim();
    if (!cropValue) throw new Error('Main Crop selection is required.');

    const phoneVal = (profileData.mobile_number || profileData.phone || '').trim();
    const langVal = profileData.preferred_language || language || 'English';

    const normalizedData = {
      full_name: profileData.full_name.trim(),
      phone: phoneVal,
      mobile_number: phoneVal,
      district: profileData.district.trim(),
      state: profileData.state || 'Karnataka',
      primary_crops: cropValue,
      main_crop: cropValue,
      preferred_language: langVal,
      land_size: profileData.land_size || '2.5 Acres',
      farming_type: profileData.farming_type || 'Integrated',
      experience_years: Number(profileData.experience_years) || 5
    };

    if (langVal) {
      setLanguageState(langVal);
      setSavedLanguage(langVal);
    }

    const backendToken = localStorage.getItem(BACKEND_TOKEN_KEY);

    // If using backend auth
    if (backendToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${backendToken}`
          },
          body: JSON.stringify(normalizedData)
        });

        const resData = await res.json();
        if (res.ok && resData.profile) {
          setProfile(resData.profile);
          return resData.profile;
        }
      } catch (err) {
        console.warn('Backend profile update notice:', err);
      }
    }

    // Fallback or Supabase auth
    if (isSupabaseConfigured && !configStatus.url?.includes('cgqztsvrnjkzytzhxwiy')) {
      try {
        const payload = {
          id: user.id,
          ...normalizedData,
          updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase
          .from('farmer_profiles')
          .upsert(payload)
          .select()
          .single();

        if (!error && data) {
          setProfile(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase profile save notice:', err);
      }
    }

    // Always update local cached profile
    setProfile(normalizedData);
    return normalizedData;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        language,
        setLanguage,
        loading,
        profileLoading,
        authError,
        authProvider,
        isSupabaseConfigured,
        configStatus,
        signUp,
        signIn,
        resetPassword,
        signOut,
        fetchProfile,
        saveProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
