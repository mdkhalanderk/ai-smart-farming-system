import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  ShieldAlert,
  Users,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  MapPin,
  ChevronDown,
  Globe,
  Edit3,
  Bell,
  MessageSquare
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, setSavedLanguage, t } from '../lib/i18n';

import { API_BASE_URL } from '../lib/config';

export const Navbar = () => {
  const { user, profile, signOut, language, setLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const currentLang = language || 'English';

  const fetchNotifications = async () => {
    const token = localStorage.getItem('smart_crop_backend_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('smart_crop_backend_token');
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/community/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleNotificationClick = async (notif) => {
    const token = localStorage.getItem('smart_crop_backend_token');
    if (token && !notif.is_read) {
      fetch(`${API_BASE_URL}/api/community/notifications/${notif.id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotificationsOpen(false);

    if (notif.alert_id) {
      navigate(`/community?alert_id=${notif.alert_id}`);
    } else if (notif.conversation_id) {
      navigate(`/community?tab=messages&conv_id=${notif.conversation_id}`);
    } else {
      navigate('/community');
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) => `
    px-2 xl:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0
    ${
      isActive(path)
        ? 'bg-[#1b432a] text-white shadow-xs'
        : 'text-[#2d3a2f] hover:text-[#143420] hover:bg-[#f0ece2]'
    }
  `;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e4dfd5] shadow-xs w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 gap-2 lg:gap-3">
          
          {/* Brand Logo & Editorial Title */}
          <a
            href={user ? '/dashboard' : '/'}
            onClick={(e) => {
              e.preventDefault();
              const hasSession = Boolean(user || localStorage.getItem('smart_crop_backend_token'));
              window.location.href = hasSession ? '/dashboard' : '/';
            }}
            className="flex items-center gap-2.5 group shrink-0 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Smart Crop Advisory Logo"
              className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl object-cover shrink-0 shadow-xs ring-1 ring-black/5 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col shrink-0">
              <span className="font-serif font-bold text-[#1a2e1d] text-sm sm:text-base xl:text-lg tracking-tight leading-tight whitespace-nowrap group-hover:text-[#143420] transition-colors">
                Smart Crop Advisory
              </span>
              <span className="text-[9px] xl:text-[10px] font-semibold text-[#526055] uppercase tracking-wider whitespace-nowrap hidden sm:block">
                {t('precision_agri', currentLang)}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {user ? (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <LayoutDashboard className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{t('nav_dashboard', currentLang)}</span>
                </Link>

                <Link to="/detect" className={navLinkClass('/detect')}>
                  <ShieldAlert className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{t('nav_detect', currentLang)}</span>
                </Link>

                <Link to="/price-prediction" className={navLinkClass('/price-prediction')}>
                  <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{t('nav_mandi', currentLang)}</span>
                </Link>

                <Link to="/yield-prediction" className={navLinkClass('/yield-prediction')}>
                  <Sprout className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{t('nav_yield', currentLang)}</span>
                </Link>

                <Link to="/community" className={navLinkClass('/community')}>
                  <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span>{t('nav_community', currentLang)}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  <span>{t('nav_overview', currentLang)}</span>
                </Link>
                <Link to="/login" className={navLinkClass('/login')}>
                  <span>{t('nav_signin', currentLang)}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action / Language Selector / Profile Menu */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Quick Language Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#f5f2ea] border border-[#d6cfc3]">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageSelect(l.code)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    currentLang === l.code
                      ? 'bg-[#1b432a] text-white shadow-xs'
                      : 'text-[#445247] hover:text-[#1b432a]'
                  }`}
                  title={`Switch to ${l.label}`}
                >
                  {l.native}
                </button>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#e4dfd5] shrink-0">
                {/* Farmer Messages Shortcut */}
                <Link
                  to="/community?tab=messages"
                  className="p-2 rounded-lg text-[#526055] hover:text-[#1b432a] hover:bg-[#f0ece2] transition-colors relative"
                  title="Farmer Messages & Discussions"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>

                {/* Biosecurity & Chat Notification Bell */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((prev) => !prev)}
                    className="p-2 rounded-lg text-[#526055] hover:text-[#1b432a] hover:bg-[#f0ece2] transition-colors relative cursor-pointer"
                    title="Biosecurity & Chat Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Notifications Dropdown Drawer */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-[#e4dfd5] shadow-xl py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-[#f0ece2] flex items-center justify-between bg-[#faf8f5]/60 rounded-t-2xl">
                        <span className="font-serif font-bold text-xs text-[#1a2e1d] flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-[#1b432a]" />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
                              {unreadCount}
                            </span>
                          )}
                        </span>

                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-[#1b432a] hover:underline font-semibold cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-[#f0ece2]">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 text-xs hover:bg-[#faf8f5] transition-colors cursor-pointer space-y-1 ${
                                !n.is_read ? 'bg-[#f0fdf4]/60 font-medium' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="font-bold text-[#142618] text-[11px] truncate">{n.title}</span>
                                <span className="text-[9px] text-[#6b7c70] shrink-0">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#526055] line-clamp-2 leading-relaxed">
                                {n.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-[#6b7c70]">
                            No new biosecurity or chat notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Logo Button */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    id="profile-avatar-btn"
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-full bg-[#1b432a] text-white font-serif font-bold flex items-center justify-center text-sm shadow-xs hover:bg-[#143420] transition-all cursor-pointer ring-2 ring-transparent hover:ring-[#1b432a]/30 focus:outline-none shrink-0"
                    title={t('profile_settings', currentLang)}
                    aria-label={t('profile_settings', currentLang)}
                  >
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'F'}
                  </button>

                  {/* Profile Settings Dropdown */}
                  {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-[#e4dfd5] shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#f0ece2] bg-[#faf8f5]/60 rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1b432a] text-white font-serif font-bold flex items-center justify-center text-xs shrink-0">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'F'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#1a2e1d] truncate">
                            {profile?.full_name || 'Farmer Account'}
                          </p>
                          <p className="text-[11px] text-[#6b7c70] truncate mt-0.5">
                            {profile?.district || 'Karnataka'}{profile?.main_crop ? ` • ${profile.main_crop}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#1a2e1d] hover:bg-[#faf8f5] flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#1b432a]" />
                        <span>{t('profile_settings', currentLang)}</span>
                      </Link>

                      <Link
                        to="/profile-setup"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#1a2e1d] hover:bg-[#faf8f5] flex items-center gap-2.5 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-[#1b432a]" />
                        <span>{t('edit_farm_details', currentLang)}</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#f0ece2] my-1" />

                    <div className="px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs font-semibold text-[#991b1b] hover:bg-[#fef2f2] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav_signout', currentLang)}</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                {t('nav_register', currentLang)}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Profile Logo */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            {/* Quick Language Toggle Mobile */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#f5f2ea] border border-[#d6cfc3]">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageSelect(l.code)}
                  className={`px-1.5 py-0.5 text-[11px] font-semibold rounded transition-all cursor-pointer ${
                    currentLang === l.code
                      ? 'bg-[#1b432a] text-white shadow-xs'
                      : 'text-[#445247] hover:text-[#1b432a]'
                  }`}
                  title={`Switch to ${l.label}`}
                >
                  {l.native}
                </button>
              ))}
            </div>

            {user && (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-[#1b432a] text-white font-serif font-bold flex items-center justify-center text-xs shadow-xs shrink-0"
                title="Profile Settings"
                aria-label="Profile Settings"
              >
                {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'F'}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#2d3a2f] hover:bg-[#faf8f5] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e4dfd5] bg-white px-4 pt-3 pb-6 space-y-2">
          {user ? (
            <>
              <div className="pb-3 mb-3 border-b border-[#e4dfd5] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1a2e1d]">
                    {profile?.full_name || user.email}
                  </p>
                  <p className="text-[11px] text-[#6b7c70]">
                    District: {profile?.district || 'Not Selected'} | Crop: {profile?.main_crop || profile?.primary_crops || 'Rice / Paddy'}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-[#1b432a] font-semibold underline"
                >
                  Profile
                </Link>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('nav_dashboard', currentLang)}</span>
              </Link>
              <Link
                to="/detect"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/detect')}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('nav_detect', currentLang)}</span>
              </Link>
              <Link
                to="/price-prediction"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/price-prediction')}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{t('nav_mandi', currentLang)}</span>
              </Link>
              <Link
                to="/yield-prediction"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/yield-prediction')}
              >
                <Sprout className="w-4 h-4" />
                <span>{t('nav_yield', currentLang)}</span>
              </Link>
              <Link
                to="/community"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/community')}
              >
                <Users className="w-4 h-4" />
                <span>{t('nav_community', currentLang)}</span>
              </Link>

              <div className="pt-3 border-t border-[#e4dfd5]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#991b1b] hover:bg-[#fef2f2] rounded-md flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav_signout', currentLang)}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/')}
              >
                {t('nav_overview', currentLang)}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass('/login')}
              >
                {t('nav_signin', currentLang)}
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center mt-2 px-4 py-2.5 rounded-lg bg-[#1b432a] text-white text-xs font-semibold"
              >
                {t('nav_register', currentLang)}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
