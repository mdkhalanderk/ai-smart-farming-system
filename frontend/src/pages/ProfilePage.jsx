import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Sprout, Globe, Phone, Edit3, ShieldCheck, Mail, LogOut } from 'lucide-react';
import { t, getSavedLanguage } from '../lib/i18n';

export const ProfilePage = () => {
  const { profile, user, language, signOut } = useAuth();
  const lang = language || profile?.preferred_language || getSavedLanguage();

  const displayPhone = profile?.mobile_number || profile?.phone || t('not_provided', lang);
  const displayDistrict = profile?.district || t('not_selected', lang);
  const displayCrop = profile?.main_crop || profile?.primary_crops || 'Rice / Paddy';
  const displayLang = profile?.preferred_language || lang || 'English';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#e4dfd5] shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-[#e4dfd5] text-center sm:text-left">
            <div className="w-16 h-16 rounded-xl bg-[#1b432a] text-white flex items-center justify-center text-2xl font-serif font-bold shrink-0">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'F'}
            </div>

            <div className="space-y-1 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-semibold text-[11px] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>{t('verified_account', lang)}</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#1a2e1d] tracking-tight">
                {profile?.full_name || 'Farmer Account'}
              </h1>
              <p className="text-xs text-[#526055] font-mono">
                {user?.email}
              </p>
            </div>

            <Link
              to="/profile-setup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f5f2ea] hover:bg-[#ede8dc] text-[#1a2e1d] text-xs font-semibold border border-[#d6cfc3] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>{t('edit_details', lang)}</span>
            </Link>
          </div>

          <div className="py-6 space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="w-8 h-8 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6b7c70] uppercase tracking-wider">{t('mobile_number', lang)}</p>
                <p className="text-sm font-semibold text-[#1a2e1d]">{displayPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="w-8 h-8 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6b7c70] uppercase tracking-wider">{t('agri_district', lang)}</p>
                <p className="text-sm font-semibold text-[#1a2e1d]">
                  {displayDistrict}
                  {profile?.taluk ? `, ${profile.taluk} Taluk` : ''}
                  {profile?.village ? ` • ${profile.village}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="w-8 h-8 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6b7c70] uppercase tracking-wider">{t('primary_crop', lang)}</p>
                <p className="text-sm font-semibold text-[#1a2e1d]">{displayCrop}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="w-8 h-8 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6b7c70] uppercase tracking-wider">{t('advisory_lang', lang)}</p>
                <p className="text-sm font-semibold text-[#1a2e1d]">{displayLang}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e4dfd5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7c70]">
            <span>{t('account_id', lang)}: {user?.id?.slice(0, 8)}...</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 text-red-700 hover:text-red-900 font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              <span className="text-[#d6cfc3]">|</span>
              <Link to="/dashboard" className="text-[#1b432a] font-semibold hover:underline">
                {t('return_dashboard', lang)} &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
