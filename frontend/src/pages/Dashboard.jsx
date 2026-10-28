import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Sprout,
  MapPin,
  Globe,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  ShieldCheck,
  ChevronRight,
  FileText
} from 'lucide-react';
import { t } from '../lib/i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const Dashboard = () => {
  const { profile, user, language } = useAuth();
  const farmerName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const farmerDistrict = profile?.district || 'Kolar';
  const farmerCrop = profile?.main_crop || profile?.primary_crops || 'Rice / Paddy';
  const currentLang = language || profile?.preferred_language || 'English';
  const langDisplay = (currentLang === 'hi' || currentLang === 'Hindi') ? 'ಕನ್ನಡ / हिन्दी (Hindi)' : (currentLang === 'kn' || currentLang === 'Kannada') ? 'ಕನ್ನಡ (Kannada)' : 'English';

  const [mandiPrice, setMandiPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    // Fetch quick live price for farmer's main crop
    const fetchQuickPrice = async () => {
      try {
        setLoadingPrice(true);
        const commodity = farmerCrop.includes('Onion') ? 'Onion' : farmerCrop.includes('Potato') ? 'Potato' : farmerCrop.includes('Wheat') ? 'Wheat' : farmerCrop.includes('Rice') ? 'Rice' : 'Tomato';
        const res = await fetch(`${API_BASE_URL}/api/price/current?market=Bengaluru APMC&commodity=${commodity}`);
        const data = await res.json();
        if (data?.status === 'success' && data?.data) {
          setMandiPrice(data.data);
        }
      } catch (err) {
        console.warn('Dashboard quick price notice:', err);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchQuickPrice();
  }, [farmerCrop]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Farmer Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e4dfd5] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5" />
              <span>{t('nav_dashboard', currentLang)}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
              {t('welcome_farmer', currentLang, { name: farmerName })}
            </h1>
            <p className="text-xs sm:text-sm text-[#526055] max-w-xl">
              {t('farm_advisory_for', currentLang, { district: farmerDistrict })}
            </p>
          </div>

          {/* Farm Metadata Chip */}
          <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] text-xs text-[#2d3a2f] space-y-1.5 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>
                {t('agri_district', currentLang)}: <strong className="font-semibold text-[#142618]">{farmerDistrict}</strong>
                {profile?.taluk && <span className="text-[#526055]"> • {profile.taluk}</span>}
                {profile?.village && <span className="text-[#526055]"> ({profile.village})</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>{t('primary_crop', currentLang)}: <strong className="font-semibold text-[#142618]">{farmerCrop}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#1b432a]" />
              <span>{t('advisory_lang', currentLang)}: <strong className="font-semibold text-[#142618]">{langDisplay}</strong></span>
            </div>
          </div>
        </div>

        {/* Primary Action Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Disease Scanner */}
          <div className="editorial-card p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                {t('crop_health', currentLang)}
              </div>
              <h2 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('disease_diagnosis', currentLang)}
              </h2>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('disease_diagnosis_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e4dfd5]">
              <Link
                to="/detect"
                className="w-full py-2 px-3 rounded-md bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>{t('launch_scanner', currentLang)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Mandi Prices */}
          <div className="editorial-card p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                {t('mandi_rates', currentLang)}
              </div>
              <h2 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('price_forecasting', currentLang)}
              </h2>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('price_forecasting_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e4dfd5]">
              <Link
                to="/price-prediction"
                className="w-full py-2 px-3 rounded-md bg-white hover:bg-[#faf8f5] text-[#1a2e1d] border border-[#d6cfc3] text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>{t('view_prices', currentLang)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Crop Yield */}
          <div className="editorial-card p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                {t('yield_estimation', currentLang)}
              </div>
              <h2 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('regional_yield_forecast', currentLang)}
              </h2>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('regional_yield_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e4dfd5]">
              <Link
                to="/yield-prediction"
                className="w-full py-2 px-3 rounded-md bg-white hover:bg-[#faf8f5] text-[#1a2e1d] border border-[#d6cfc3] text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>{t('forecast_harvest', currentLang)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Community Alerts */}
          <div className="editorial-card p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                {t('community_alerts', currentLang)}
              </div>
              <h2 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('district_warnings', currentLang)}
              </h2>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('community_warnings_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e4dfd5]">
              <Link
                to="/community"
                className="w-full py-2 px-3 rounded-md bg-white hover:bg-[#faf8f5] text-[#1a2e1d] border border-[#d6cfc3] text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span>{t('view_alerts', currentLang)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Agricultural Intelligence Row: Mandi Snapshot & Regional Advisory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mandi Price Snapshot */}
          <div className="editorial-card p-6 lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1b432a]" />
                <h3 className="font-serif font-bold text-base text-[#1a2e1d]">
                  Mandi Snapshot
                </h3>
              </div>
              <span className="text-[11px] text-[#6b7c70] font-mono">Bengaluru APMC</span>
            </div>

            {mandiPrice ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-[#f0ece2]">
                  <span className="text-[#526055]">Commodity</span>
                  <span className="font-semibold text-[#1a2e1d]">{mandiPrice.commodity}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#f0ece2]">
                  <span className="text-[#526055]">Modal Price</span>
                  <span className="font-bold text-[#143823] text-sm">₹{mandiPrice.modal_price} / Qtl</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#f0ece2]">
                  <span className="text-[#526055]">Retail Equivalent</span>
                  <span className="font-semibold text-[#1a2e1d]">₹{mandiPrice.retail_per_kg || (mandiPrice.modal_price / 100).toFixed(1)} / kg</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#526055]">Price Range</span>
                  <span className="text-[#6b7c70]">₹{mandiPrice.min_price} – ₹{mandiPrice.max_price}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#6b7c70] py-4 text-center">
                Mandi rates loading or market closed today.
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/price-prediction"
                className="text-xs text-[#1b432a] font-semibold hover:underline flex items-center gap-1"
              >
                <span>7-day forecasted trends</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Regional Agro-Climatic Advisory */}
          <div className="editorial-card p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4dfd5] pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-[#1b432a]" />
                <h3 className="font-serif font-bold text-base text-[#1a2e1d]">
                  Agro-Climatic Advisory for {farmerDistrict}
                </h3>
              </div>
              <span className="text-[11px] text-[#6b7c70]">ICAR-KVK Advisory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1.5">
                <h4 className="font-semibold text-[#1a2e1d] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Irrigation Recommendation</span>
                </h4>
                <p className="text-[#526055] leading-relaxed">
                  Morning drip irrigation recommended. Keep leaf foliage dry during afternoon hours to limit fungal spore germination in high relative humidity.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1.5">
                <h4 className="font-semibold text-[#1a2e1d] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Foliar Disease Alert</span>
                </h4>
                <p className="text-[#526055] leading-relaxed">
                  Watch for early blight target-spots on bottom canopy leaves in solanaceous plots. Ensure copper-based preventive spray if cloudy dew persists.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e4dfd5] flex items-center justify-between text-xs text-[#6b7c70]">
              <span>Next KVK Field Day: Tuesday</span>
              <Link to="/community" className="text-[#1b432a] font-semibold hover:underline">
                View district community board &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
