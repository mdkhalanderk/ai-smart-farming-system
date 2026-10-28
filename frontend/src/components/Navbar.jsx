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
  BarChart3,
  Edit3
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, setSavedLanguage, t } from '../lib/i18n';

export const Navbar = () => {
  const { user, profile, signOut, language, setLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const currentLang = language || 'English';

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
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-[#1b432a] flex items-center justify-center text-white shrink-0">
              <Sprout className="w-4 h-4 xl:w-5 xl:h-5" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="font-serif font-bold text-[#1a2e1d] text-sm sm:text-base xl:text-lg tracking-tight leading-tight whitespace-nowrap group-hover:text-[#143420] transition-colors">
                Smart Crop Advisory
              </span>
              <span className="text-[9px] xl:text-[10px] font-semibold text-[#526055] uppercase tracking-wider whitespace-nowrap hidden sm:block">
                {t('precision_agri', currentLang)}
              </span>
            </div>
          </Link>

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
                  <span className="hidden xl:inline">{t('nav_detect', currentLang)}</span>
                  <span className="xl:hidden">Disease</span>
                </Link>

                <Link to="/price-prediction" className={navLinkClass('/price-prediction')}>
                  <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span className="hidden xl:inline">{t('nav_mandi', currentLang)}</span>
                  <span className="xl:hidden">Prices</span>
                </Link>

                <Link to="/yield-prediction" className={navLinkClass('/yield-prediction')}>
                  <Sprout className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span className="hidden xl:inline">{t('nav_yield', currentLang)}</span>
                  <span className="xl:hidden">Yield</span>
                </Link>

                <Link to="/community" className={navLinkClass('/community')}>
                  <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span className="hidden xl:inline">{t('nav_community', currentLang)}</span>
                  <span className="xl:hidden">Community</span>
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
              <div className="relative flex items-center pl-2 border-l border-[#e4dfd5] shrink-0" ref={profileDropdownRef}>
                {/* Profile Logo Button */}
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
