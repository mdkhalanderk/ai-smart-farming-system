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
  FileText,
  Radio,
  MessageSquare
} from 'lucide-react';
import { t } from '../lib/i18n';
import {
  getLocalizedLocation,
  getLocalizedCropName,
  getLocalizedAlert,
  getLocalizedMarket
} from '../lib/dynamicTranslator';

import { API_BASE_URL } from '../lib/config';

export const Dashboard = () => {
  const { profile, user, language } = useAuth();
  const farmerName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
  const farmerDistrict = profile?.district || 'Kolar';
  const farmerCrop = profile?.main_crop || profile?.primary_crops || 'Rice / Paddy';
  const currentLang = language || profile?.preferred_language || 'English';
  const langDisplay = (currentLang === 'hi' || currentLang === 'Hindi') ? 'ಕನ್ನಡ / हिन्दी (Hindi)' : (currentLang === 'kn' || currentLang === 'Kannada') ? 'ಕನ್ನಡ (Kannada)' : 'English';

  const [mandiPrice, setMandiPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [topAlerts, setTopAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

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

  useEffect(() => {
    const fetchTopAlerts = async () => {
      try {
        setLoadingAlerts(true);
        const res = await fetch(`${API_BASE_URL}/api/community/alerts?user_district=${encodeURIComponent(farmerDistrict)}&limit=3`);
        const json = await res.json();
        if (json?.status === 'success' && Array.isArray(json?.alerts)) {
          setTopAlerts(json.alerts);
        }
      } catch (err) {
        console.warn('Dashboard top alerts notice:', err);
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchTopAlerts();
  }, [farmerDistrict]);

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

        {/* Top 3 Community Biosecurity Surveillance Preview */}
        <div className="editorial-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#e4dfd5] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#142618]">
                  {t('biosecurity_surveillance_district', currentLang, { district: getLocalizedLocation(farmerDistrict, currentLang) }) || `Community Biosecurity Surveillance — ${farmerDistrict} District`}
                </h3>
                <p className="text-xs text-[#526055]">
                  {t('top_occurrences_subtitle', currentLang) || '3 most critical pest & disease occurrences verified near your plots'}
                </p>
              </div>
            </div>

            <Link
              to="/community"
              className="py-1.5 px-3 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>{t('see_all_alerts_discussions', currentLang) || 'See All Alerts & Discussions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingAlerts ? (
              <div className="col-span-3 text-center py-6 text-xs text-[#6b7c70]">
                {t('scanning_surveillance', currentLang) || 'Scanning district surveillance network...'}
              </div>
            ) : topAlerts.length > 0 ? (
              topAlerts.map((rawA) => {
                const a = getLocalizedAlert(rawA, currentLang);
                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl border border-[#e4dfd5] bg-white hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded-md ${
                          a.danger_level === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          a.danger_level === 'High' ? 'bg-amber-100 text-amber-900' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {a.danger_level === 'Critical' ? (t('danger_critical', currentLang) || 'Critical') :
                           a.danger_level === 'High' ? (t('danger_high', currentLang) || 'High') :
                           (t('danger_medium', currentLang) || 'Moderate')}
                        </span>
                        <span className="text-[#526055] font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#1b432a]" />
                          {a.distance_km === 0 ? (t('same_district', currentLang) || 'Same District') : `${a.distance_km} ${t('km_away', currentLang) || 'km away'}`}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#142618] line-clamp-1" title={a.title}>
                        {a.title}
                      </h4>

                      <p className="text-xs text-[#526055] line-clamp-2 leading-relaxed">
                        {a.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#f0ece2] flex items-center justify-between text-[11px]">
                      <span className="text-[#6b7c70]">{getLocalizedCropName(a.crop, currentLang)} • {getLocalizedLocation(a.district, currentLang)}</span>
                      <Link
                        to={`/community?alert_id=${a.id}`}
                        className="text-[#1b432a] font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>{t('details_and_chat', currentLang) || 'Details & Chat'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-[#6b7c70]">
                {t('no_outbreaks_reported', currentLang, { district: getLocalizedLocation(farmerDistrict, currentLang) }) || `No critical outbreaks currently reported in ${farmerDistrict}.`}
              </div>
            )}
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
                  {t('mandi_snapshot', currentLang) || 'Mandi Snapshot'}
                </h3>
              </div>
              <span className="text-[11px] text-[#6b7c70] font-mono">{getLocalizedMarket('Bengaluru APMC', currentLang)}</span>
            </div>

            {mandiPrice ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-[#f0ece2]">
                  <span className="text-[#526055]">{t('commodity_label', currentLang) || 'Commodity'}</span>
                  <span className="font-semibold text-[#1a2e1d]">{getLocalizedCropName(mandiPrice.commodity, currentLang)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#f0ece2]">
                  <span className="text-[#526055]">{t('modal_price_label', currentLang) || 'Modal Price'}</span>
                  <span className="font-bold text-[#143823] text-sm">₹{mandiPrice.modal_price} / {t('qtl_short', currentLang) || 'Qtl'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#f0ece2]">
                  <span className="text-[#526055]">{t('retail_equivalent_label', currentLang) || 'Retail Equivalent'}</span>
                  <span className="font-semibold text-[#1a2e1d]">₹{mandiPrice.retail_per_kg || (mandiPrice.modal_price / 100).toFixed(1)} / {t('kg_short', currentLang) || 'kg'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#526055]">{t('price_range_label', currentLang) || 'Price Range'}</span>
                  <span className="text-[#6b7c70]">₹{mandiPrice.min_price} – ₹{mandiPrice.max_price}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#6b7c70] py-4 text-center">
                {t('mandi_rates_loading', currentLang) || 'Mandi rates loading or market closed today.'}
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/price-prediction"
                className="text-xs text-[#1b432a] font-semibold hover:underline flex items-center gap-1"
              >
                <span>{t('seven_day_trends', currentLang) || '7-day forecasted trends'}</span>
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
                  {t('agro_climatic_advisory_for', currentLang, { district: getLocalizedLocation(farmerDistrict, currentLang) }) || `Agro-Climatic Advisory for ${farmerDistrict}`}
                </h3>
              </div>
              <span className="text-[11px] text-[#6b7c70]">{t('icar_kvk_advisory', currentLang) || 'ICAR-KVK Advisory'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1.5">
                <h4 className="font-semibold text-[#1a2e1d] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>{t('irrigation_rec_title', currentLang) || 'Irrigation Recommendation'}</span>
                </h4>
                <p className="text-[#526055] leading-relaxed">
                  {t('irrigation_rec_desc', currentLang) || 'Morning drip irrigation recommended. Keep leaf foliage dry during afternoon hours to limit fungal spore germination in high relative humidity.'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1.5">
                <h4 className="font-semibold text-[#1a2e1d] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>{t('foliar_disease_title', currentLang) || 'Foliar Disease Alert'}</span>
                </h4>
                <p className="text-[#526055] leading-relaxed">
                  {t('foliar_disease_desc', currentLang) || 'Watch for early blight target-spots on bottom canopy leaves in solanaceous plots. Ensure copper-based preventive spray if cloudy dew persists.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e4dfd5] flex items-center justify-between text-xs text-[#6b7c70]">
              <span>{t('next_kvk_field_day', currentLang) || 'Next KVK Field Day: Tuesday'}</span>
              <Link to="/community" className="text-[#1b432a] font-semibold hover:underline">
                {t('view_community_board', currentLang) || 'View district community board →'}
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
