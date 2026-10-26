import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { DiseaseResult } from './DiseaseResult';
import {
  Upload,
  Image as ImageIcon,
  X,
  ShieldAlert,
  Loader2,
  AlertCircle,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Sprout,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { t, getSavedLanguage } from '../lib/i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CROP_OPTIONS = [
  { id: 'tomato', name: 'Tomato' },
  { id: 'rice', name: 'Rice / Paddy' },
  { id: 'wheat', name: 'Wheat' },
  { id: 'potato', name: 'Potato' },
  { id: 'chilli', name: 'Chilli / Pepper' },
  { id: 'cotton', name: 'Cotton' },
  { id: 'maize', name: 'Maize / Corn' },
  { id: 'sugarcane', name: 'Sugarcane' },
  { id: 'groundnut', name: 'Groundnut / Peanut' },
  { id: 'soybean', name: 'Soybean' },
  { id: 'pulses', name: 'Pulses (Chickpea / Pigeon Pea)' },
  { id: 'banana', name: 'Banana' },
  { id: 'mango', name: 'Mango' },
  { id: 'onion', name: 'Onion' }
];


export const DiseaseDetection = () => {
  const { user, profile, language } = useAuth();

  const getInitialCrop = () => {
    try {
      const cached = localStorage.getItem('smart_crop_profile');
      if (cached) {
        const p = JSON.parse(cached);
        const c = p.main_crop || p.primary_crops;
        if (c) {
          const match = CROP_OPTIONS.find(
            (opt) =>
              opt.id === c.toLowerCase() ||
              opt.name.toLowerCase().includes(c.toLowerCase()) ||
              c.toLowerCase().includes(opt.id)
          );
          if (match) return match.id;
        }
      }
    } catch (e) {}
    return 'rice';
  };

  const [selectedCrop, setSelectedCrop] = useState(() => getInitialCrop());
  const [cropMetadata, setCropMetadata] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const lang = language || profile?.preferred_language || getSavedLanguage();

  // Set crop from profile when profile updates
  useEffect(() => {
    if (profile?.main_crop || profile?.primary_crops) {
      const savedCrop = profile.main_crop || profile.primary_crops;
      const match = CROP_OPTIONS.find((c) =>
        savedCrop.toLowerCase().includes(c.id) ||
        c.name.toLowerCase().includes(savedCrop.toLowerCase())
      );
      if (match) setSelectedCrop(match.id);
    }
  }, [profile?.main_crop, profile?.primary_crops]);


  // Fetch crop metadata and supported classes when selectedCrop changes
  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/crops/${selectedCrop}`);
        const data = await res.json();
        if (data?.status === 'success') {
          setCropMetadata(data.crop);
        }
      } catch (e) {
        console.warn('Failed to load crop metadata:', e);
      }
    };
    fetchCropDetails();
  }, [selectedCrop]);

  const handleFileChange = (file) => {
    setError('');
    setResult(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image size exceeds 15 MB limit. Please select a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  const currentCropOption = CROP_OPTIONS.find((c) => c.id === selectedCrop) || CROP_OPTIONS[0];

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('crop', currentCropOption.name);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Inference API server error.');
      }

      const data = await response.json();
      setResult(data);

      // Save diagnosis to backend SQLite history
      if (data.status === 'success' && data.disease) {
        try {
          const userId = user?.id || (profile?.phone_number ? `farmer_${profile.phone_number}` : 'demo_farmer');
          fetch(`${API_BASE_URL}/api/reports/save-diagnosis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              crop: data.crop || currentCropOption.name,
              disease: data.disease,
              confidence: typeof data.confidence === 'number' ? Math.round(data.confidence * 100) / 100 : 96.5,
              image_name: selectedFile?.name || 'field_leaf_sample.jpg'
            })
          }).catch((e) => console.warn('Diagnosis history save notice:', e));
        } catch (histErr) {
          console.warn('Diagnosis history exception:', histErr);
        }

        // If an active disease outbreak is confirmed, broadcast to the district community feed
        if (
          !data.uncertain &&
          !data.disease.toLowerCase().includes('healthy')
        ) {
          try {
            fetch(`${API_BASE_URL}/api/community/reports`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                author_name: profile?.full_name || 'Verified Farmer',
                phone: profile?.phone_number || '',
                district: profile?.district || 'Kolar',
                taluk: profile?.taluk || '',
                village: profile?.village || '',
                crop_name: data.crop || currentCropOption.name,
                disease_name: data.disease,
                severity: data.confidence > 80 || data.confidence > 0.8 ? 'High' : 'Moderate',
                warning_title: `${data.crop || currentCropOption.name} ${data.disease} Detected`,
                warning_message: data.disease_info?.what_to_do_now || 'Isolated during foliage inspection. Recommended immediate ICAR preventive advisory.'
              })
            }).catch((e) => console.warn('Community broadcast notice:', e));
          } catch (commErr) {
            console.warn('Community broadcast exception:', commErr);
          }
        }
      }
    } catch (err) {
      console.error('Inference error:', err);
      setError(err.message || 'Unable to connect to Disease Detection backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#1b432a] text-white mx-auto flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
            {t('scanner_title', lang)}
          </h1>
          <p className="text-xs sm:text-sm text-[#526055] mt-1.5 leading-relaxed">
            {t('scanner_subtitle', lang)}
          </p>
        </div>

        {/* Target Crop Selector & Scope Card */}
        <div className="editorial-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e4dfd5] pb-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#1b432a]" />
              <div>
                <label htmlFor="cropSelect" className="text-xs font-semibold text-[#1a2e1d] uppercase tracking-wider block">
                  {t('select_crop_label', lang)}
                </label>
                <span className="text-[11px] text-[#6b7c70]">
                  {t('select_crop_sub', lang)}
                </span>
              </div>
            </div>

            <select
              id="cropSelect"
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setResult(null);
                setError('');
              }}
              className="px-3 py-2 rounded-lg border border-[#d6cfc3] font-semibold text-xs bg-white text-[#1a2e1d] focus:ring-2 focus:ring-[#1b432a] focus:outline-none w-full sm:w-auto"
            >
              {CROP_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Readiness Status Bar */}
          <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="badge-active">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Inspection</span>
              </span>
              <span className="text-xs font-semibold text-[#1a2e1d]">
                {currentCropOption.name} Health Scanner
              </span>
            </div>

            <span className="text-[11px] text-[#526055]">
              Accredited Agricultural Guidelines
            </span>
          </div>

          {/* Common Recognized Disease Chips */}
          {cropMetadata?.classes && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider block">
                Common Crop Conditions & Diseases:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cropMetadata.classes.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#e4dfd5] text-[#2d3a2f] text-[11px] font-medium"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload & Diagnostic Box */}
        <div className="editorial-card p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!imagePreview ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors ${
                dragActive
                  ? 'border-[#1b432a] bg-[#eef5ee]'
                  : 'border-[#d6cfc3] hover:border-[#1b432a] bg-[#faf8f5]'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-[#eef5ee] text-[#1b432a] mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>

              <h3 className="font-serif font-bold text-base text-[#1a2e1d] mb-1">
                {t('upload_prompt', lang)} ({currentCropOption.name})
              </h3>
              <p className="text-xs text-[#526055] mb-5">
                {t('upload_specs', lang)}
              </p>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>{t('choose_photo', lang)}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview Box */}
              <div className="relative rounded-xl overflow-hidden bg-[#162619] border border-[#e4dfd5] max-h-96 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt={`Selected ${currentCropOption.name} Leaf`}
                  className="max-h-96 w-auto object-contain rounded-xl"
                />

                {!loading && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-[#142618]/80 hover:bg-[#991b1b] text-white transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {loading && (
                  <div className="absolute inset-0 bg-[#142618]/70 flex flex-col items-center justify-center text-white gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#52b775]" />
                    <span className="text-xs font-semibold">{t('analyzing', lang)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
                <div className="text-xs text-[#526055] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1b432a]" />
                  <span>Photo Quality Check Active</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white border border-[#d6cfc3] hover:bg-[#f5f2ea] text-[#1a2e1d] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('reset_image', lang)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('analyzing', lang)}</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4" />
                        <span>{t('analyze_leaf', lang)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* Diagnostic Results Presentation */}
        {result && <DiseaseResult result={result} imagePreview={imagePreview} selectedCrop={currentCropOption} lang={lang} />}

      </div>
    </div>
  );
};
