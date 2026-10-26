import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  Sprout,
  Calendar,
  CloudSun,
  Loader2,
  AlertCircle,
  RefreshCw,
  Info,
  MapPin,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

import { t } from '../lib/i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const PricePrediction = () => {
  const { profile, language } = useAuth();
  const currentLang = language || 'English';

  const [markets, setMarkets] = useState([
    'Bengaluru APMC',
    'Bagalkot',
    'Ballari',
    'Belagavi',
    'Bidar',
    'Byadgi',
    'Challakere',
    'Chamarajanagar',
    'Chikkaballapura',
    'Chikkamagaluru',
    'Chintamani',
    'Chitradurga',
    'Davangere',
    'Dharwad',
    'Gadag',
    'Gangavathi',
    'Hassan',
    'Haveri',
    'Hosakote',
    'Hosapete',
    'Hubballi',
    'Kalaburagi',
    'Kodagu (Madikeri)',
    'Kolar',
    'Koppal',
    'Kundapura',
    'Mandya',
    'Mangaluru',
    'Mysuru',
    'Puttur',
    'Raichur',
    'Ramanagara',
    'Ranebennur',
    'Shivamogga',
    'Sindhanur',
    'Sirsi',
    'Srinivaspur',
    'Tiptur',
    'Tumakuru',
    'Udupi',
    'Vijayapura',
    'Yadgir',
  ]);
  const [commodities, setCommodities] = useState(['Onion', 'Tomato', 'Potato', 'Rice', 'Wheat']);

  const [selectedMarket, setSelectedMarket] = useState('Bengaluru APMC');
  const [selectedCommodity, setSelectedCommodity] = useState('Onion');

  const [loading, setLoading] = useState(false);
  const [fetchingMetaData, setFetchingMetaData] = useState(true);
  const [error, setError] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);

  // Set smart initial defaults based on farmer profile
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setFetchingMetaData(true);
        const [resM, resC] = await Promise.all([
          fetch(`${API_BASE_URL}/api/price/markets`).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/api/price/commodities`).then((r) => r.json()).catch(() => null),
        ]);

        if (resM?.markets && resM.markets.length > 0) {
          setMarkets(resM.markets);
          if (profile?.district) {
            const matchedM = resM.markets.find(
              (m) => m.toLowerCase().includes(profile.district.toLowerCase())
            );
            if (matchedM) setSelectedMarket(matchedM);
          }
        }

        if (resC?.commodities && resC.commodities.length > 0) {
          setCommodities(resC.commodities);
          if (profile?.main_crop) {
            const matchedC = resC.commodities.find(
              (c) => c.toLowerCase() === profile.main_crop.toLowerCase()
            );
            if (matchedC) setSelectedCommodity(matchedC);
          }
        }
      } catch (err) {
        console.warn('Metadata fetch warning:', err);
      } finally {
        setFetchingMetaData(false);
      }
    };

    fetchMetadata();
  }, [profile]);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setPredictionResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/price/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market: selectedMarket,
          commodity: selectedCommodity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch price predictions.');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setPredictionResult(data);
      } else {
        throw new Error(data.message || 'Price prediction failed.');
      }
    } catch (err) {
      console.error('Price prediction error:', err);
      setError(
        err.message ||
          'Unable to connect to the Price Prediction server. Please check your network or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load prediction
  useEffect(() => {
    handlePredict();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
              {t('price_title', currentLang)}
            </h1>
            <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
              {t('price_subtitle', currentLang)}
            </p>
          </div>

          {profile && (
            <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] text-xs space-y-1 shrink-0 w-full sm:w-auto">
              <div className="text-[10px] font-semibold text-[#526055] uppercase tracking-wider">
                Farmer Profile Context
              </div>
              <div className="flex items-center gap-1.5 text-[#2d3a2f]">
                <MapPin className="w-3.5 h-3.5 text-[#1b432a]" />
                <span>{t('agri_district', currentLang)}: <strong className="font-semibold text-[#142618]">{profile.district || 'Kolar'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[#2d3a2f]">
                <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
                <span>{t('primary_crop', currentLang)}: <strong className="font-semibold text-[#142618]">{profile.main_crop || 'Tomato'}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Market Selection Form Card */}
        <div className="editorial-card p-5 sm:p-6">
          <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            
            {/* Select Market */}
            <div className="space-y-1.5">
              <label htmlFor="marketSelect" className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#1b432a]" />
                <span>{t('select_market', currentLang)}</span>
              </label>
              <select
                id="marketSelect"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
              >
                {markets.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Commodity */}
            <div className="space-y-1.5">
              <label htmlFor="commoditySelect" className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
                <span>{t('select_commodity', currentLang)}</span>
              </label>
              <select
                id="commoditySelect"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-normal text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none"
              >
                {commodities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('forecasting', currentLang)}</span>
                  </>
                ) : (
                  <>
                    <span>{t('calculate_forecast', currentLang)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Error Alert State */}
        {error && (
          <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Forecast Data Notice</span>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={handlePredict}
              className="px-3 py-1 rounded bg-[#dc2626] text-white text-xs font-semibold shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="editorial-card p-10 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-[#1b432a] animate-spin mx-auto" />
            <p className="text-xs text-[#526055] font-medium">
              Fetching APMC modal rates & weather regressors for {selectedCommodity} in {selectedMarket}...
            </p>
          </div>
        )}

        {/* Prediction Results */}
        {predictionResult && !loading && (
          <div className="space-y-6">
            
            {/* Top Cards: Current Market Price vs 7-Day Outlook */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Current Market Price */}
              <div className="editorial-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                    {t('current_modal_rate', currentLang)}
                  </div>
                  <div className="text-2xl font-bold text-[#142618] mt-1">
                    ₹{predictionResult.current_price?.modal_price?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[#526055]">/ {t('price_per_quintal', currentLang)}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#166534] mt-0.5">
                    ₹{predictionResult.current_price?.modal_price_kg}{' '}
                    <span className="text-xs font-normal text-[#526055]">/ {t('price_per_kg', currentLang)}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#e4dfd5] text-[11px] text-[#6b7c70] flex justify-between">
                  <span>Range: ₹{predictionResult.current_price?.min_price} – ₹{predictionResult.current_price?.max_price}</span>
                  <span>{predictionResult.current_price?.date}</span>
                </div>
              </div>

              {/* Card 2: 7-Day Average Predicted Price */}
              <div className="editorial-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                    {t('seven_day_forecast', currentLang)}
                  </div>
                  <div className="text-2xl font-bold text-[#142618] mt-1">
                    ₹{predictionResult.summary?.avg_predicted_quintal?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[#526055]">/ {t('price_per_quintal', currentLang)}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#1b432a] mt-0.5">
                    ₹{predictionResult.summary?.avg_predicted_kg}{' '}
                    <span className="text-xs font-normal text-[#526055]">/ {t('price_per_kg', currentLang)}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#e4dfd5] text-[11px] text-[#6b7c70] flex justify-between">
                  <span>Min: ₹{predictionResult.summary?.min_predicted_quintal}</span>
                  <span>Max: ₹{predictionResult.summary?.max_predicted_quintal}</span>
                </div>
              </div>

              {/* Card 3: Overall Market Trend Outlook */}
              <div className="editorial-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                    {t('price_trend', currentLang)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {predictionResult.summary?.overall_trend === 'upward' ? (
                      <TrendingUp className="w-5 h-5 text-[#16a34a]" />
                    ) : predictionResult.summary?.overall_trend === 'downward' ? (
                      <TrendingDown className="w-5 h-5 text-[#d97706]" />
                    ) : (
                      <Minus className="w-5 h-5 text-[#526055]" />
                    )}
                    <span className="text-base font-bold text-[#142618]">
                      {predictionResult.summary?.overall_trend === 'upward'
                        ? t('bullish', currentLang)
                        : predictionResult.summary?.overall_trend === 'downward'
                        ? t('bearish', currentLang)
                        : t('stable', currentLang)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#526055] mt-1 leading-relaxed">
                    {t('market_arrival_insight', currentLang)}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#e4dfd5] text-[11px] text-[#6b7c70]">
                  <span>Market: {predictionResult.market} • Crop: {predictionResult.commodity}</span>
                </div>
              </div>

            </div>

            {/* 7-Day Detailed Forecast Grid */}
            <div className="editorial-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#e4dfd5] pb-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#142618]">
                    Daily 7-Day Price Forecast & Weather Regressors
                  </h2>
                  <p className="text-[11px] text-[#526055]">
                    Estimated Mandi modal values per quintal (100 kg) and per kilogram
                  </p>
                </div>
                <span className="text-[11px] text-[#1b432a] font-semibold bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cbe2ce]">
                  Random Forest Model
                </span>
              </div>

              {/* 7 Days Table / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {predictionResult.forecast?.map((day) => (
                  <div
                    key={day.date}
                    className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-[#526055] uppercase block">
                        {day.day_name}
                      </span>
                      <span className="text-xs font-bold text-[#142618]">
                        {new Date(day.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[#142618]">
                        ₹{day.predicted_price_quintal?.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-[#526055] block">/ Qtl</span>
                      </div>
                      <div className="text-xs font-semibold text-[#166534]">
                        ₹{day.predicted_price_kg}{' '}
                        <span className="text-[10px] font-normal text-[#526055]">/ kg</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e4dfd5]">
                      <div
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded text-center ${
                          day.trend === 'up'
                            ? 'bg-[#ecfdf5] text-[#065f46]'
                            : day.trend === 'down'
                            ? 'bg-[#fffbeb] text-[#92400e]'
                            : 'bg-[#f5f2ea] text-[#2d3a2f]'
                        }`}
                      >
                        {day.trend_label}
                      </div>
                    </div>

                    <div className="text-[10px] text-[#6b7c70] space-y-0.5 pt-1 border-t border-[#e4dfd5]">
                      <div className="flex justify-between">
                        <span>Temp:</span>
                        <strong className="text-[#1a2e1d]">{day.weather?.temperature}°C</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Rain:</span>
                        <strong className="text-[#1a2e1d]">{day.weather?.rain} mm</strong>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
