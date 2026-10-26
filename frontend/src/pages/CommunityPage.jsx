import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';
import {
  Users,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Sprout,
  CheckCircle2,
  ShieldAlert,
  PlusCircle,
  X,
  Send,
  Loader2,
  Clock,
  ThumbsUp,
  Info
} from 'lucide-react';
import { ALL_KARNATAKA_DISTRICTS } from '../lib/locationData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const CommunityPage = () => {
  const { user, profile, language } = useAuth();
  const currentLang = language || 'English';
  const [activeDistrict, setActiveDistrict] = useState(profile?.district || 'Kolar');
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Observation submission modal state
  const [showModal, setShowModal] = useState(false);
  const [reportCrop, setReportCrop] = useState(profile?.main_crop || 'Tomato');
  const [reportDistrict, setReportDistrict] = useState(profile?.district || 'Kolar');
  const [reportDisease, setReportDisease] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchCommunityWarnings = async () => {
    setLoading(true);
    setError('');

    try {
      const districtName = activeDistrict || profile?.district || 'Kolar';
      const res = await fetch(`${API_BASE_URL}/api/community/reports?district=${encodeURIComponent(districtName)}`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.reports)) {
        setWarnings(json.reports);
      } else {
        setWarnings([]);
      }
    } catch (err) {
      console.warn('Backend community fetch notice:', err);
      setError(`Failed to retrieve community reports: ${err.message}`);
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityWarnings();
  }, [activeDistrict, profile]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!reportCrop.trim()) return setModalError('Please select a crop.');
    if (!reportDistrict.trim()) return setModalError('Please select a district.');
    if (!reportDisease.trim() || reportDisease.trim().length < 3) {
      return setModalError('Please enter the suspected disease or symptom (min 3 characters).');
    }
    if (!reportDescription.trim() || reportDescription.trim().length < 10) {
      return setModalError('Please provide a helpful description of your field observation (min 10 characters).');
    }

    setSubmitting(true);

    try {
      const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';
      const res = await fetch(`${API_BASE_URL}/api/community/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: user?.id || 'anonymous',
          author_name: authorName,
          district: reportDistrict.trim(),
          taluk: profile?.taluk || '',
          village: profile?.village || '',
          crop_name: reportCrop.trim(),
          disease_name: reportDisease.trim(),
          warning_title: `${reportCrop.trim()} Observation: ${reportDisease.trim()}`,
          warning_message: reportDescription.trim(),
          severity: 'Moderate'
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setModalSuccess('Observation successfully posted to district biosecurity alerts.');
        setTimeout(() => {
          setShowModal(false);
          setModalSuccess('');
          setReportDisease('');
          setReportDescription('');
          fetchCommunityWarnings();
        }, 1200);
      } else {
        setModalError(data.detail || 'Unable to save observation.');
      }
    } catch (err) {
      console.error('Error posting community report:', err);
      setModalError('Network error submitting observation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (reportId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/reports/${reportId}/upvote`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWarnings(prev => prev.map(w => w.id === reportId ? { ...w, upvotes: data.upvotes } : w));
      }
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
              {t('community_title', currentLang)}
            </h1>
            <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
              {t('community_subtitle', currentLang)}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-4 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('report_new_outbreak', currentLang)}</span>
          </button>
        </div>

        {/* District Selector & Refresh Bar */}
        <div className="editorial-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#526055]">
            <MapPin className="w-4 h-4 text-[#1b432a]" />
            <span className="font-semibold text-[#1a2e1d]">{t('active_district_filter', currentLang)}:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-[#d6cfc3] bg-white text-xs text-[#1a2e1d] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
            >
              <option value="All">All Districts (31)</option>
              {ALL_KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>

            <button
              onClick={fetchCommunityWarnings}
              disabled={loading}
              className="p-2 rounded-lg bg-[#faf8f5] hover:bg-[#f0ece2] border border-[#d6cfc3] text-[#2d3a2f] transition-colors cursor-pointer"
              title="Refresh District Alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Warnings List */}
        {loading ? (
          <div className="editorial-card p-10 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#1b432a] animate-spin mx-auto" />
            <p className="text-xs text-[#526055]">Checking verified district occurrences...</p>
          </div>
        ) : warnings.length > 0 ? (
          <div className="space-y-4">
            {warnings.map((w, idx) => (
              <div key={w.id || idx} className="editorial-card p-5 sm:p-6 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#e4dfd5] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] text-[11px] font-semibold">
                        {w.crop_name || 'Crop'}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#142618]">
                        {w.warning_title || w.disease_name}
                      </h3>
                      {w.severity === 'High' && (
                        <span className="px-2 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] text-[10px] font-bold">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#6b7c70]">
                      Reported by: <strong className="text-[#1a2e1d]">{w.author_name || 'Local Farmer'}</strong>
                      {w.taluk && <span> • {w.taluk} Taluk</span>}
                      {w.village && <span> ({w.village})</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#6b7c70]">
                    <span className="flex items-center gap-1 font-semibold text-[#1b432a]">
                      <MapPin className="w-3.5 h-3.5" />
                      {w.district}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(w.detected_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#526055] leading-relaxed">
                  {w.warning_message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0ece2]">
                  <div className="text-[11px] text-[#166534] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>ICAR Biosecurity Network</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpvote(w.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({w.upvotes || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="editorial-card p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#142618]">
              No Active Outbreak Alerts in {activeDistrict}
            </h3>
            <p className="text-xs text-[#526055] max-w-md mx-auto">
              No foliar pest or disease outbreaks have been reported in this district over the past 7 days.
            </p>
          </div>
        )}

        {/* Modal: Post Field Observation */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-[#142618]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="editorial-card max-w-lg w-full p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#e4dfd5] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#142618]">
                  Post Field Observation
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded text-[#526055] hover:text-[#1a2e1d] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium">
                  {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-medium">
                  {modalSuccess}
                </div>
              )}

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                      Cultivated Crop
                    </label>
                    <select
                      value={reportCrop}
                      onChange={(e) => setReportCrop(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Rice / Paddy">Rice / Paddy</option>
                      <option value="Potato">Potato</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Maize">Maize</option>
                      <option value="Sugarcane">Sugarcane</option>
                      <option value="Banana">Banana</option>
                      <option value="Coconut">Coconut</option>
                      <option value="Arecanut">Arecanut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                      District
                    </label>
                    <select
                      value={reportDistrict}
                      onChange={(e) => setReportDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    >
                      {ALL_KARNATAKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                    Suspected Disease / Symptom
                  </label>
                  <input
                    type="text"
                    value={reportDisease}
                    onChange={(e) => setReportDisease(e.target.value)}
                    placeholder="e.g. Yellow leaf curl, Early blight spots, Stem borer"
                    className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                    Field Description & Observations
                  </label>
                  <textarea
                    rows={4}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe severity, leaf symptoms, plot area affected, and recent weather..."
                    className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e4dfd5]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-[#d6cfc3] bg-white text-xs font-semibold text-[#526055] hover:bg-[#faf8f5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Broadcast Alert</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
