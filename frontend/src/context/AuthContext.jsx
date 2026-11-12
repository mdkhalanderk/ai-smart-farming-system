import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { getSavedLanguage, setSavedLanguage } from '../lib/i18n';

import { API_BASE_URL } from '../lib/config';

const AuthContext = createContext(null);
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
      // 1. Check local backend session token first for instant FastAuth restoration
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
          console.warn('Backend session restoration notice:', e.message);
        }
      }

      // 2. Fallback: check Supabase session if configured
      if (isSupabaseConfigured) {
        try {
          const { data: { session: activeSession }, error } = await supabase.auth.getSession();
          if (isMounted && !error && activeSession?.user) {
            setUser(activeSession.user);
            setSession(activeSession);
            setAuthProvider('supabase');
            if (activeSession.access_token) {
              localStorage.setItem(BACKEND_TOKEN_KEY, activeSession.access_token);
              const prof = await fetchBackendProfile(activeSession.access_token);
              if (!prof) {
                await fetchSupabaseProfile(activeSession.user.id);
              }
            }
            setLoading(false);
            return;
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
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          setAuthProvider('supabase');
          if (newSession.access_token) {
            localStorage.setItem(BACKEND_TOKEN_KEY, newSession.access_token);
          }
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            await fetchBackendProfile(newSession.access_token || '');
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(BACKEND_TOKEN_KEY);
          setUser(null);
          setSession(null);
          setProfile(null);
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

  // Farmer Registration with seamless FastAuth Engine
  const signUp = async (email, password, extraData = {}) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Direct registration against our high-speed FastAPI Backend (Zero email confirmation blockage)
    try {
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

      // Attempt background non-blocking sync to Supabase if configured
      if (isSupabaseConfigured && data.user) {
        try {
          supabase.from('farmer_profiles').upsert({
            id: data.user.id,
            name: extraData.full_name || 'Farmer',
            mobile: extraData.mobile_number || extraData.phone || '',
            district: extraData.district || 'Kolar',
            main_crop: extraData.main_crop || 'Tomato',
            language: language || 'English',
            updated_at: new Date().toISOString()
          }).then(() => {}).catch(() => {});
        } catch (_) {}
      }

      return {
        user: data.user,
        session: data.session,
        profile: data.profile,
        requiresVerification: false
      };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Farmer Sign In: Prioritize FastAuth Engine for immediate, zero-friction access
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

    // 1. Try local backend login first
    try {
      return await loginViaBackend();
    } catch (backendErr) {
      // 2. Fallback: If user was registered in Supabase
      if (isSupabaseConfigured) {
        try {
          const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (!supaErr && supaData?.user && supaData?.session) {
            localStorage.setItem(BACKEND_TOKEN_KEY, supaData.session.access_token);
            setUser(supaData.user);
            setSession(supaData.session);
            setAuthProvider('supabase');
            await fetchBackendProfile(supaData.session.access_token);
            return supaData;
          }

          // If Supabase rejected because email was unconfirmed, auto-register/login via FastAuth backend!
          if (supaErr?.message?.toLowerCase().includes('email not confirmed')) {
            try {
              const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: cleanEmail,
                  password: password,
                  full_name: 'Farmer',
                  district: 'Kolar',
                  state: 'Karnataka',
                  main_crop: 'Tomato',
                  phone: ''
                })
              });
              const regData = await regRes.json();
              if (regRes.ok && regData.session?.access_token) {
                localStorage.setItem(BACKEND_TOKEN_KEY, regData.session.access_token);
                setUser(regData.user);
                setSession(regData.session);
                setProfile(regData.profile);
                setAuthProvider('backend');
                return regData;
              }
            } catch (_) {}
          }
        } catch (_) {}
      }

      setAuthError(backendErr.message);
      throw backendErr;
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
      taluk: (profileData.taluk || '').trim(),
      village: (profileData.village || '').trim(),
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

    // Supabase farmer_profiles table update
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: user.id,
          name: normalizedData.full_name,
          mobile: normalizedData.mobile_number,
          district: normalizedData.district,
          main_crop: normalizedData.main_crop,
          language: normalizedData.preferred_language,
          updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase
          .from('farmer_profiles')
          .upsert(payload)
          .select()
          .maybeSingle();

        if (!error && data) {
          setProfile({ ...normalizedData, ...data });
          return { ...normalizedData, ...data };
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
