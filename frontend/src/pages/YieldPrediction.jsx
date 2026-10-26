import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';
import {
  Sprout,
  BarChart3,
  MapPin,
  Calendar,
  Layers,
  Droplets,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CROPS = [
  'Tomato',
  'Potato',
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Groundnut',
  'Pulses',
  'Mustard',
  'Soybean',
  'Sugarcane',
  'Jute'
];

const STATES = [
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Gujarat',
  'Rajasthan',
  'Bihar',
  'West Bengal',
  'Kerala',
  'Odisha'
];

const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Annual'];
const SOIL_TYPES = ['Red', 'Black', 'Loamy', 'Clay', 'Alluvial', 'Laterite', 'Sandy'];

export const YieldPrediction = () => {
  const { profile, language } = useAuth();
  const currentLang = language || 'English';

  const [crop, setCrop] = useState(profile?.main_crop || 'Tomato');
  const [state, setState] = useState('Karnataka');
  const [season, setSeason] = useState('Kharif');
  const [areaHectares, setAreaHectares] = useState('2.0');
  const [soilType, setSoilType] = useState('Red');
  const [irrigation, setIrrigation] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const areaVal = parseFloat(areaHectares);
    if (isNaN(areaVal) || areaVal <= 0) {
      setError('Field cultivation area must be a positive number greater than 0.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/yield/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          state,
          season,
          area_hectares: areaVal,
          soil_type: soilType,
          irrigation
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Yield prediction failed.');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setResult(data);
      } else {
        throw new Error(data.message || 'Prediction calculation error.');
      }
    } catch (err) {
      console.error('Yield prediction error:', err);
      setError(err.message || 'Unable to connect to Crop Yield backend service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
              {t('yield_title', currentLang)}
            </h1>
            <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
              {t('yield_subtitle', currentLang)}
            </p>
          </div>
        </div>

        {/* Input Form Card */}
        <div className="editorial-card p-6 sm:p-8">
          <form onSubmit={handlePredict} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Crop */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
                  <span>{t('select_crop_label', currentLang)}</span>
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1b432a]" />
                  <span>{t('state_label', currentLang)}</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1b432a]" />
                  <span>{t('season_label', currentLang)} *</span>
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Field Area in Hectares */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider">
                  {t('field_area_ha', currentLang)} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(e.target.value)}
                  placeholder="e.g. 2.0"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
                />
                <span className="text-[10px] text-[#6b7c70]">1 Hectare ≈ 2.47 Acres</span>
              </div>

              {/* Soil Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1b432a]" />
                  <span>{t('soil_type_label', currentLang)} *</span>
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
                >
                  {SOIL_TYPES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Irrigation Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#1b432a]" />
                  <span>{t('irrigation_toggle', currentLang)} *</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIrrigation(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      irrigation
                        ? 'bg-[#1b432a] text-white border-[#1b432a]'
                        : 'bg-white text-[#2d3a2f] border-[#d6cfc3] hover:bg-[#faf8f5]'
                    }`}
                  >
                    {t('with_irrigation', currentLang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIrrigation(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      !irrigation
                        ? 'bg-[#1b432a] text-white border-[#1b432a]'
                        : 'bg-white text-[#2d3a2f] border-[#d6cfc3] hover:bg-[#faf8f5]'
                    }`}
                  >
                    {t('rainfed', currentLang)}
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-6 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('calculating', currentLang)}</span>
                  </>
                ) : (
                  <>
                    <span>{t('calculate_yield', currentLang)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Yield Result Display */}
        {result && (
          <div className="space-y-6">
            
            {/* Primary Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="editorial-card p-5 space-y-2">
                <span className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider block">
                  {t('mean_yield', currentLang)}
                </span>
                <div className="text-2xl font-bold text-[#142618]">
                  {result.predicted_yield_per_hectare || result.yield_per_hectare}{' '}
                  <span className="text-xs font-normal text-[#526055]">Qtl / Ha</span>
                </div>
                <p className="text-[11px] text-[#6b7c70]">
                  Calibrated for {soilType} soil in {state}
                </p>
              </div>

              <div className="editorial-card p-5 space-y-2">
                <span className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider block">
                  {t('projected_yield', currentLang)}
                </span>
                <div className="text-2xl font-bold text-[#143823]">
                  {result.total_predicted_yield_quintals || result.total_yield || (parseFloat(areaHectares) * (result.predicted_yield_per_hectare || 25)).toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[#526055]">Quintals</span>
                </div>
                <p className="text-[11px] text-[#6b7c70]">
                  Estimated across {areaHectares} Hectares
                </p>
              </div>

              <div className="editorial-card p-5 space-y-2">
                <span className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider block">
                  {t('confidence', currentLang)}
                </span>
                <div className="text-lg font-bold text-[#1a2e1d]">
                  {result.confidence_interval || '± 8.5% Variance'}
                </div>
                <p className="text-[11px] text-[#6b7c70]">
                  Based on regional historical records
                </p>
              </div>

            </div>

            {/* Agronomic Guidance */}
            {result.agronomic_recommendations && (
              <div className="editorial-card p-6 space-y-3">
                <h3 className="font-serif font-bold text-base text-[#142618]">
                  Farming & Soil Recommendations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#526055]">
                  {Array.isArray(result.agronomic_recommendations) ? (
                    result.agronomic_recommendations.map((rec, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs">{result.agronomic_recommendations}</p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
