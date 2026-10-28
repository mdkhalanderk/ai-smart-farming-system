import React from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';
import { IndiaAgriculturalMap } from '../components/IndiaAgriculturalMap';
import { Sprout, MapPin, Globe } from 'lucide-react';

export const YieldPrediction = () => {
  const { profile, user, language } = useAuth();
  const currentLang = language || profile?.preferred_language || 'English';

  const farmerDistrict = profile?.district || 'Kolar';
  const farmerCrop = profile?.main_crop || profile?.primary_crops || 'Tomato';
  const defaultArea = profile?.taluk || profile?.district || 'Kolar';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e4dfd5] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5" />
              <span>{t('yield_estimation', currentLang)}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
              {t('yield_title', currentLang)}
            </h1>
            <p className="text-xs sm:text-sm text-[#526055] max-w-2xl leading-relaxed">
              Select any district or taluk on the interactive map below to view optimal high-yield crops, expected harvest quantities, soil suitability, and local APMC market prices.
            </p>
          </div>

          {/* Farm Metadata Chip */}
          <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] text-xs text-[#2d3a2f] space-y-1.5 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>
                {t('agri_district', currentLang)}: <strong className="font-semibold text-[#142618]">{farmerDistrict}</strong>
                {profile?.taluk && <span className="text-[#526055]"> • {profile.taluk}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>{t('primary_crop', currentLang)}: <strong className="font-semibold text-[#142618]">{farmerCrop}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>Region: <strong className="font-semibold text-[#142618]">{profile?.state || 'Karnataka'}</strong></span>
            </div>
          </div>
        </div>

        {/* The Exact Feature From Dashboard: Select Area -> Get All Info About Crops There */}
        <IndiaAgriculturalMap defaultArea={defaultArea} />

      </div>
    </div>
  );
};
