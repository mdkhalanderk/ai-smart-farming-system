import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, MapPin, Sprout, Globe, Phone, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, setSavedLanguage, t } from '../lib/i18n';
import { ALL_KARNATAKA_DISTRICTS, getTaluksForDistrict, getVillagesForTaluk } from '../lib/locationData';

const MAJOR_CROPS = [
  'Tomato',
  'Rice / Paddy',
  'Wheat',
  'Potato',
  'Chilli',
  'Cotton',
  'Maize',
  'Sugarcane',
  'Groundnut',
  'Soybean',
  'Pulses (Chickpea / Pigeon Pea)',
  'Banana',
  'Mango',
  'Onion'
];

export const ProfileSetup = () => {
  const { profile, saveProfile, language, setLanguage } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(() => profile?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(() => profile?.mobile_number || profile?.phone || '');
  const [district, setDistrict] = useState(() => profile?.district || '');
  const [taluk, setTaluk] = useState(() => profile?.taluk || '');
  const [village, setVillage] = useState(() => profile?.village || '');
  const [customVillage, setCustomVillage] = useState(false);
  const [mainCrop, setMainCrop] = useState(() => profile?.main_crop || profile?.primary_crops || '');
  const [preferredLanguage, setPreferredLanguage] = useState(() => language || profile?.preferred_language || 'English');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      const ph = profile.mobile_number || profile.phone;
      if (ph && !mobileNumber) setMobileNumber(ph);
      if (profile.district && !district) setDistrict(profile.district);
      if (profile.taluk && !taluk) setTaluk(profile.taluk);
      if (profile.village && !village) setVillage(profile.village);
      const cr = profile.main_crop || profile.primary_crops;
      if (cr && !mainCrop) setMainCrop(cr);
      if (profile.preferred_language) setPreferredLanguage(profile.preferred_language);
    }
  }, [profile]);

  const availableTaluks = district ? getTaluksForDistrict(district) : [];
  const availableVillages = (district && taluk) ? getVillagesForTaluk(district, taluk) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!mobileNumber.trim()) return setError('Please enter your active mobile number.');
    if (!district) return setError('Please select your agricultural district.');
    if (!mainCrop) return setError('Please select your main cultivated crop.');

    setLoading(true);

    try {
      await saveProfile({
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        district,
        taluk: taluk || '',
        village: village || '',
        main_crop: mainCrop,
        preferred_language: preferredLanguage
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save farmer profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#e4dfd5] shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1b432a] text-white mx-auto flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1a2e1d] tracking-tight">
            {t('farmer_profile_details', preferredLanguage)}
          </h1>
          <p className="text-xs text-[#526055] mt-1.5 font-medium">
            Configure your farm location and primary crop for localized alerts
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1b432a]" />
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Ramesh Gowda"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-sm text-[#1a2e1d] bg-white"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1b432a]" />
              Mobile Number (for SMS Alerts) *
            </label>
            <input
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-sm text-[#1a2e1d] bg-white"
            />
          </div>

          {/* Agricultural District, Taluk, and Village Hierarchy */}
          <div className="space-y-3.5 p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1a2e1d] uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#1b432a]" />
              <span>Farm Geographic Location</span>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-xs font-semibold text-[#2d3a2f] mb-1">
                District *
              </label>
              <select
                required
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setTaluk('');
                  setVillage('');
                  setCustomVillage(false);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-sm text-[#1a2e1d] bg-white font-medium"
              >
                <option value="">-- Select Your District --</option>
                {ALL_KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluk & Village Dependent Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d3a2f] mb-1">
                  Taluk / Tehsil
                </label>
                <select
                  disabled={!district || availableTaluks.length === 0}
                  value={taluk}
                  onChange={(e) => {
                    setTaluk(e.target.value);
                    setVillage('');
                    setCustomVillage(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-xs font-medium text-[#1a2e1d] bg-white disabled:bg-[#f0ece2] disabled:cursor-not-allowed"
                >
                  <option value="">{district ? '-- Select Taluk --' : 'Select District First'}</option>
                  {availableTaluks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village Select or Custom Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2d3a2f]">
                    Village / Hobli
                  </label>
                  {taluk && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomVillage(!customVillage);
                        setVillage('');
                      }}
                      className="text-[11px] text-[#1b432a] font-semibold hover:underline cursor-pointer"
                    >
                      {customVillage ? 'Choose from list' : '+ Type Custom'}
                    </button>
                  )}
                </div>

                {customVillage ? (
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Enter village name..."
                    className="w-full px-3 py-2 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-xs font-medium text-[#1a2e1d] bg-white"
                  />
                ) : (
                  <select
                    disabled={!taluk || availableVillages.length === 0}
                    value={village}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomVillage(true);
                        setVillage('');
                      } else {
                        setVillage(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-xs font-medium text-[#1a2e1d] bg-white disabled:bg-[#f0ece2] disabled:cursor-not-allowed"
                  >
                    <option value="">{taluk ? '-- Select Village / Hobli --' : 'Select Taluk First'}</option>
                    {availableVillages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                    {taluk && <option value="__custom__">+ Enter Custom Village...</option>}
                  </select>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#6b7c70]">
              Calibrates micro-climate radar alerts, soil classification, and nearest APMC market prices.
            </p>
          </div>

          {/* Main Crop Select */}
          <div>
            <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-[#1b432a]" />
              Primary Cultivated Crop *
            </label>
            <select
              required
              value={mainCrop}
              onChange={(e) => {
                setMainCrop(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] text-sm text-[#1a2e1d] bg-white"
            >
              <option value="">-- Select Your Primary Crop --</option>
              {MAJOR_CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1b432a]" />
              {t('lang_preference', preferredLanguage)}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => {
                    setPreferredLanguage(lang.code);
                    setLanguage(lang.code);
                  }}
                  className={`py-2.5 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    preferredLanguage === lang.code
                      ? 'bg-[#1b432a] text-white border-[#1b432a] shadow-sm'
                      : 'bg-white text-[#2d3a2f] border-[#d6cfc3] hover:bg-[#f5f2ea]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {preferredLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{lang.native}</span>
                  </div>
                  <span className={`text-[10px] ${preferredLanguage === lang.code ? 'text-[#cbe2ce]' : 'text-[#6b7c70]'}`}>
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mt-6 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('saving', preferredLanguage)}</span>
              </>
            ) : (
              <span>{t('save_continue', preferredLanguage)}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
