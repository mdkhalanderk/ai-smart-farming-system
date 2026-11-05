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
  ArrowRight,
  BarChart3,
  Droplets,
  Thermometer
} from 'lucide-react';

import { t } from '../lib/i18n';
import {
  getLocalizedLocation,
  getLocalizedCropName,
  getLocalizedMarket,
  formatLocalizedDate
} from '../lib/dynamicTranslator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Interactive SVG 7-Day Price Forecast Graph Component
const PriceTrendChart = ({ forecast, avgPrice, currentLang, commodity, market }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!forecast || forecast.length === 0) return null;

  const width = 800;
  const height = 280;
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 35;
  const paddingBottom = 50;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const prices = forecast.map((f) => f.predicted_price_quintal);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const yMin = Math.max(0, Math.floor((minPrice - priceRange * 0.15) / 50) * 50);
  const yMax = Math.ceil((maxPrice + priceRange * 0.15) / 50) * 50;
  const ySpan = yMax - yMin || 1;

  const getX = (i) => paddingLeft + (i / Math.max(1, forecast.length - 1)) * chartWidth;
  const getY = (val) => paddingTop + chartHeight - ((val - yMin) / ySpan) * chartHeight;

  const points = forecast.map((f, i) => ({
    x: getX(i),
    y: getY(f.predicted_price_quintal),
    day: f,
    price: f.predicted_price_quintal,
    i
  }));

  const linePath = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const gridTicks = [0, 0.33, 0.66, 1].map((r) => {
    const val = yMin + r * ySpan;
    return { val: Math.round(val), y: getY(val) };
  });

  const activeDay = hoveredIdx !== null ? forecast[hoveredIdx] : forecast[0];

  return (
    <div className="space-y-4">
      <div className="w-full bg-[#faf8f5] rounded-xl border border-[#e4dfd5] p-3 sm:p-4 overflow-hidden shadow-inner">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: '340px' }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.28" />
              <stop offset="85%" stopColor="#16a34a" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.00" />
            </linearGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {gridTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={paddingLeft + chartWidth}
                y2={tick.y}
                stroke="#e5e0d6"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                fontWeight="500"
                fill="#6b7c70"
                className="font-mono"
              >
                ₹{tick.val.toLocaleString('en-IN')}
              </text>
            </g>
          ))}

          {avgPrice && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(avgPrice)}
                x2={paddingLeft + chartWidth}
                y2={getY(avgPrice)}
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.8"
              />
              <text
                x={paddingLeft + chartWidth - 6}
                y={getY(avgPrice) - 6}
                textAnchor="end"
                fontSize="10"
                fontWeight="bold"
                fill="#b45309"
              >
                Avg ₹{Math.round(avgPrice).toLocaleString('en-IN')}
              </text>
            </g>
          )}

          <path d={areaPath} fill="url(#priceGradient)" />

          <path
            d={linePath}
            fill="none"
            stroke="#15803d"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadowFilter)"
          />

          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={p.x - chartWidth / (forecast.length * 2)}
                  y={paddingTop}
                  width={chartWidth / forecast.length}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartHeight}
                    stroke="#16a34a"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 5}
                  fill={isHovered ? '#15803d' : '#1b432a'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />

                <g transform={`translate(${p.x}, ${p.y - 12})`}>
                  <rect
                    x="-26"
                    y="-18"
                    width="52"
                    height="18"
                    rx="4"
                    fill={isHovered ? '#15803d' : '#ffffff'}
                    stroke={isHovered ? '#15803d' : '#d6cfc3'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={isHovered ? '#ffffff' : '#1a2e1d'}
                    className="font-mono"
                  >
                    ₹{Math.round(p.price)}
                  </text>
                </g>

                <text
                  x={p.x}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : '600'}
                  fill={isHovered ? '#1b432a' : '#526055'}
                >
                  {formatLocalizedDate(p.day.date, currentLang)}
                </text>
                <text
                  x={p.x}
                  y={paddingTop + chartHeight + 35}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="500"
                  fill="#78887b"
                >
                  ₹{p.day.predicted_price_kg}/kg
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Detail Card for Hovered / Active Day */}
      <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4 text-[#16a34a]" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#142618]">
              {formatLocalizedDate(activeDay.date, currentLang)} • {activeDay.day_name}
            </div>
            <div className="text-[11px] text-[#6b7c70]">
              {getLocalizedCropName(commodity, currentLang)} • {getLocalizedMarket(market, currentLang)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-[10px] text-[#6b7c70] uppercase font-bold block">{t('predicted_modal_price', currentLang) || 'Predicted Modal Price'}</span>
            <span className="text-sm font-bold text-[#143823]">
              ₹{activeDay.predicted_price_quintal?.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#526055]">/ {t('qtl_short', currentLang) || 'Qtl'}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#6b7c70] uppercase font-bold block">{t('retail_equivalent_label', currentLang) || 'Retail Equivalent'}</span>
            <span className="text-sm font-semibold text-[#166534]">
              ₹{activeDay.predicted_price_kg} <span className="text-xs font-normal text-[#526055]">/ {t('kg_short', currentLang) || 'kg'}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-[#e4dfd5] text-[11px] text-[#526055]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              {activeDay.weather?.temperature}°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              {activeDay.weather?.rain} mm
            </span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
              activeDay.trend === 'up'
                ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                : activeDay.trend === 'down'
                ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]'
                : 'bg-[#f5f2ea] text-[#2d3a2f] border border-[#d6cfc3]'
            }`}
          >
            {activeDay.trend_label}
          </span>
        </div>
      </div>
    </div>
  );
};

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
                {t('farmer_profile_context', currentLang) || 'Farmer Profile Context'}
              </div>
              <div className="flex items-center gap-1.5 text-[#2d3a2f]">
                <MapPin className="w-3.5 h-3.5 text-[#1b432a]" />
                <span>{t('agri_district', currentLang)}: <strong className="font-semibold text-[#142618]">{getLocalizedLocation(profile.district || 'Kolar', currentLang)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[#2d3a2f]">
                <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
                <span>{t('primary_crop', currentLang)}: <strong className="font-semibold text-[#142618]">{getLocalizedCropName(profile.main_crop || 'Tomato', currentLang)}</strong></span>
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
                    {getLocalizedMarket(m, currentLang)}
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
                    {getLocalizedCropName(c, currentLang)}
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
                  <span>{t('market_label', currentLang) || 'Market'}: {getLocalizedMarket(predictionResult.market, currentLang)} • {t('crop_label', currentLang) || 'Crop'}: {getLocalizedCropName(predictionResult.commodity, currentLang)}</span>
                </div>
              </div>

            </div>

            {/* 7-Day Detailed Forecast Grid */}
            <div className="editorial-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#e4dfd5] pb-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#142618]">
                    {t('daily_price_forecast_title', currentLang) || 'Daily 7-Day Price Forecast & Weather Regressors'}
                  </h2>
                  <p className="text-[11px] text-[#526055]">
                    {t('estimated_modal_values', currentLang) || 'Estimated Mandi modal values per quintal (100 kg) and per kilogram'}
                  </p>
                </div>
                <span className="text-[11px] text-[#1b432a] font-semibold bg-[#eef5ee] px-2.5 py-0.5 rounded-full border border-[#cbe2ce]">
                  {t('random_forest_model', currentLang) || 'Random Forest Model'}
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
                        {formatLocalizedDate(day.date, currentLang)}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[#142618]">
                        ₹{day.predicted_price_quintal?.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-[#526055] block">/ {t('qtl_short', currentLang) || 'Qtl'}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#166534]">
                        ₹{day.predicted_price_kg}{' '}
                        <span className="text-[10px] font-normal text-[#526055]">/ {t('kg_short', currentLang) || 'kg'}</span>
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

            {/* 7-Day Price Forecast Interactive Graph */}
            {predictionResult.forecast && predictionResult.forecast.length > 0 && (
              <div className="editorial-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#e4dfd5] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#1b432a]" />
                      <h2 className="font-serif font-bold text-lg text-[#142618]">
                        {t('seven_day_price_trend_graph', currentLang) || '7-Day Mandi Price Trend Graph'}
                      </h2>
                    </div>
                    <p className="text-[11px] text-[#526055] mt-0.5">
                      {t('visual_price_projection', currentLang) || 'Visual price projection (₹/Quintal) across the upcoming 7-day trading cycle'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#526055] bg-[#faf8f5] border border-[#e4dfd5] px-2.5 py-1 rounded-lg">
                      {t('avg_benchmark_line', currentLang) || '7-Day Avg'}: <strong className="text-[#142618]">₹{predictionResult.summary?.avg_predicted_quintal?.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-[#15803d] bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-1 rounded-lg">
                      {predictionResult.summary?.overall_trend === 'upward' ? '📈 ' + (t('bullish', currentLang) || 'Bullish') : predictionResult.summary?.overall_trend === 'downward' ? '📉 ' + (t('bearish', currentLang) || 'Bearish') : '⚖️ ' + (t('stable', currentLang) || 'Stable')}
                    </span>
                  </div>
                </div>

                <PriceTrendChart
                  forecast={predictionResult.forecast}
                  avgPrice={predictionResult.summary?.avg_predicted_quintal}
                  currentLang={currentLang}
                  commodity={predictionResult.commodity}
                  market={predictionResult.market}
                />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
