import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  MessageSquare,
  MessageCircle,
  Filter,
  ArrowUpDown,
  Camera,
  Image as ImageIcon,
  Search,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Flame,
  Radio,
  Eye
} from 'lucide-react';
import { ALL_KARNATAKA_DISTRICTS } from '../lib/locationData';
import { getLocalizedAlert, formatLocalizedDate, getLocalizedLocation, getLocalizedCropName } from '../lib/dynamicTranslator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CROPS_LIST = [
  'Tomato',
  'Rice / Paddy',
  'Potato',
  'Wheat',
  'Cotton',
  'Maize',
  'Sugarcane',
  'Banana',
  'Coconut',
  'Arecanut',
  'Chilli',
  'Onion',
  'Groundnut',
  'Soybean'
];

const DANGER_LEVELS = [
  { level: 'Critical', label: 'Critical Outbreak', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { level: 'High', label: 'High Urgency', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { level: 'Medium', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { level: 'Low', label: 'Low Advisory', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
];

export const CommunityPage = ({ initialTab = 'alerts' }) => {
  const { user, profile, language } = useAuth();
  const currentLang = language || 'English';
  const location = useLocation();
  const navigate = useNavigate();

  // Active view tab: 'alerts' or 'messages'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'messages' ? 'messages' : initialTab;
  });

  // Filter States
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterDanger, setFilterDanger] = useState('All');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'latest' | 'nearest' | 'danger'
  const [searchQuery, setSearchQuery] = useState('');

  // Alerts data & pagination
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);
  const LIMIT = 12;

  // Modal: Create Alert
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCrop, setNewCrop] = useState(profile?.main_crop || 'Tomato');
  const [newDistrict, setNewDistrict] = useState(profile?.district || 'Kolar');
  const [newTaluk, setNewTaluk] = useState(profile?.taluk || '');
  const [newDanger, setNewDanger] = useState('Medium');
  const [newDescription, setNewDescription] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Detail Alert Modal
  const [viewingAlert, setViewingAlert] = useState(null);

  // Chat / Conversations State
  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [chatPhotoFile, setChatPhotoFile] = useState(null);
  const [chatPhotoPreview, setChatPhotoPreview] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatContainerRef = useRef(null);
  const lastMsgCountRef = useRef(0);
  const chatFileInputRef = useRef(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'messages' && activeTab !== 'messages') {
      setActiveTab('messages');
    }
    const convId = params.get('conv_id');
    if (convId && conversations.length > 0) {
      const match = conversations.find((c) => c.id === convId);
      if (match) setActiveConv(match);
    }
  }, [location.search, conversations]);

  // Fetch Community Alerts
  const fetchAlerts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPageOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError('');

    try {
      const currentOffset = reset ? 0 : pageOffset;
      const token = localStorage.getItem('smart_crop_backend_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      if (filterDistrict && filterDistrict !== 'All') params.append('district', filterDistrict);
      if (filterCrop && filterCrop !== 'All') params.append('crop', filterCrop);
      if (filterDanger && filterDanger !== 'All') params.append('danger_level', filterDanger);
      if (sortBy) params.append('sort_by', sortBy);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (profile?.district) params.append('user_district', profile.district);
      params.append('limit', LIMIT.toString());
      params.append('offset', currentOffset.toString());

      const res = await fetch(`${API_BASE_URL}/api/community/alerts?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.status === 'success' && Array.isArray(data.alerts)) {
        if (reset) {
          setAlerts(data.alerts);
        } else {
          setAlerts((prev) => [...prev, ...data.alerts]);
        }
        setTotalCount(data.total_count || 0);
        setHasMore(Boolean(data.has_more));
        setPageOffset(currentOffset + data.alerts.length);
      } else {
        if (reset) setAlerts([]);
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Error fetching alerts:', err);
      setError('Unable to load alerts at this time. Please check your internet connection.');
      if (reset) setAlerts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterDistrict, filterCrop, filterDanger, sortBy, searchQuery, profile?.district, pageOffset]);

  // Refetch alerts on filter change
  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlerts(true);
    }
  }, [filterDistrict, filterCrop, filterDanger, sortBy, activeTab]);

  // Debounced search
  useEffect(() => {
    if (activeTab !== 'alerts') return;
    const timer = setTimeout(() => {
      fetchAlerts(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Conversations for Authenticated Farmer
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('smart_crop_backend_token');
    if (!token) return;

    setLoadingConvs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'messages' && user) {
      fetchConversations();
    }
  }, [activeTab, user, fetchConversations]);

  // Fetch Messages for Active Conversation
  const fetchMessages = useCallback(async (convId, isBackground = false) => {
    const token = localStorage.getItem('smart_crop_backend_token');
    if (!token || !convId) return;

    if (!isBackground) {
      setLoadingMessages(true);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.messages)) {
        setMessages((prev) => {
          // If message IDs are identical, keep existing array reference to avoid unnecessary re-renders
          if (prev.length === data.messages.length) {
            const isSame = prev.every((m, idx) => m.id === data.messages[idx]?.id);
            if (isSame) return prev;
          }
          return data.messages;
        });
      }
    } catch (err) {
      console.warn('Error loading messages:', err);
    } finally {
      if (!isBackground) {
        setLoadingMessages(false);
      }
    }
  }, []);

  // Set up Realtime & polling for active conversation
  useEffect(() => {
    if (!activeConv?.id) {
      setMessages([]);
      return;
    }

    fetchMessages(activeConv.id, false);

    // Supabase Realtime channel subscription
    let channel = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel(`messages:${activeConv.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${activeConv.id}`
            },
            (payload) => {
              if (payload.new) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === payload.new.id)) return prev;
                  return [...prev, payload.new];
                });
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel error:', err);
      }
    }

    // Secondary polling interval (every 5s) to ensure reliability without jerking the UI
    const interval = setInterval(() => {
      fetchMessages(activeConv.id, true);
    }, 5000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, [activeConv?.id, fetchMessages]);

  // Scroll to bottom of internal chat box ONLY (never scrolls window/body)
  useEffect(() => {
    if (chatContainerRef.current) {
      // Auto-scroll inside chat box only when message count changes or switched conv
      if (messages.length !== lastMsgCountRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        lastMsgCountRef.current = messages.length;
      }
    }
  }, [messages, activeConv?.id]);

  // Helper to determine the opposite farmer's name in conversation
  const getOtherFarmerName = (conv) => {
    if (!conv) return 'Farmer';
    if (conv.other_farmer_name && conv.other_farmer_name.trim().toLowerCase() !== 'farmer') {
      return conv.other_farmer_name.trim();
    }
    if (conv.other_user_name && conv.other_user_name.trim().toLowerCase() !== 'farmer') {
      return conv.other_user_name.trim();
    }
    const myId = user?.id;
    const myName = (profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '').trim().toLowerCase();

    if (conv.creator_id === myId || (conv.creator_name && conv.creator_name.trim().toLowerCase() === myName)) {
      if (conv.participant_name && conv.participant_name.trim().toLowerCase() !== 'farmer') return conv.participant_name.trim();
    } else {
      if (conv.creator_name && conv.creator_name.trim().toLowerCase() !== 'farmer') return conv.creator_name.trim();
    }

    if (conv.participant_name && conv.participant_name.trim().toLowerCase() !== 'farmer' && conv.participant_name.trim().toLowerCase() !== myName) {
      return conv.participant_name.trim();
    }
    if (conv.creator_name && conv.creator_name.trim().toLowerCase() !== 'farmer' && conv.creator_name.trim().toLowerCase() !== myName) {
      return conv.creator_name.trim();
    }

    // Match alert author name if available
    const matchedAlert = alerts.find((a) => a.id === conv.alert_id);
    if (matchedAlert?.author_name && matchedAlert.author_name.trim().toLowerCase() !== 'farmer') {
      return matchedAlert.author_name.trim();
    }

    return conv.other_user_name || conv.creator_name || conv.participant_name || 'Farmer';
  };

  // Handle Photo File Select for Alert
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCreateError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCreateError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setSelectedPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setCreateError('');
  };

  // Handle Photo File Select for Chat
  const handleChatPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Maximum size is 5MB.');
      return;
    }

    setChatPhotoFile(file);
    setChatPhotoPreview(URL.createObjectURL(file));
  };

  // Submit Alert Creation
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newTitle.trim() || newTitle.trim().length < 5) {
      return setCreateError('Please enter a clear title (min 5 characters).');
    }
    if (!newCrop.trim()) return setCreateError('Please choose the affected crop.');
    if (!newDistrict.trim()) return setCreateError('Please select the affected district.');
    if (!newDescription.trim() || newDescription.trim().length < 15) {
      return setCreateError('Please provide detailed field observations (min 15 characters).');
    }

    setSubmittingAlert(true);
    const token = localStorage.getItem('smart_crop_backend_token');

    try {
      let uploadedPhotoUrl = null;

      // Upload photo first if selected
      if (selectedPhotoFile) {
        const formData = new FormData();
        formData.append('file', selectedPhotoFile);
        formData.append('bucket', 'alert-photos');

        const uploadHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        const uploadRes = await fetch(`${API_BASE_URL}/api/community/upload`, {
          method: 'POST',
          headers: uploadHeaders,
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          uploadedPhotoUrl = uploadData.url;
        } else {
          console.warn('Photo upload fallback notice:', uploadData);
        }
      }

      // Create alert
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        crop: newCrop.trim(),
        district: newDistrict.trim(),
        taluk: newTaluk.trim(),
        danger_level: newDanger,
        photo_url: uploadedPhotoUrl,
        author_name: profile?.full_name || user?.email?.split('@')[0] || 'Local Farmer',
        author_phone: profile?.mobile_number || ''
      };

      const res = await fetch(`${API_BASE_URL}/api/community/alerts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCreateSuccess('Biosecurity alert broadcast successfully to all district farmers.');
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess('');
          setNewTitle('');
          setNewDescription('');
          setSelectedPhotoFile(null);
          setPhotoPreview(null);
          fetchAlerts(true);
        }, 1200);
      } else {
        setCreateError(data.detail || 'Unable to publish alert. Please try again.');
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setCreateError('Network error while publishing alert.');
    } finally {
      setSubmittingAlert(false);
    }
  };

  // Upvote Alert
  const handleUpvote = async (alertId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/alerts/${alertId}/upvote`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, upvotes: data.upvotes } : a))
        );
        if (viewingAlert && viewingAlert.id === alertId) {
          setViewingAlert((prev) => ({ ...prev, upvotes: data.upvotes }));
        }
      }
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };

  // Start / Open Chat with Alert Creator
  const handleStartChatWithFarmer = async (alertObj) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('smart_crop_backend_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Do not chat with yourself
    if (alertObj.user_id && alertObj.user_id === user.id) {
      alert("This is your own alert. Other farmers will contact you here.");
      setActiveTab('messages');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/community/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          alert_id: alertObj.id,
          receiver_id: alertObj.user_id
        })
      });

      const data = await res.json();
      if (res.ok && data.conversation) {
        setActiveTab('messages');
        setActiveConv(data.conversation);
        setViewingAlert(null);
        fetchConversations();
      } else {
        alert(data.detail || 'Could not initiate conversation.');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      alert('Unable to connect to farmer chat.');
    }
  };

  // Send Message in Active Conversation
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInputText.trim() && !chatPhotoFile) return;
    if (!activeConv) return;

    setSendingMessage(true);
    const token = localStorage.getItem('smart_crop_backend_token');

    try {
      let photoUrl = null;

      // Upload photo if attached
      if (chatPhotoFile) {
        const formData = new FormData();
        formData.append('file', chatPhotoFile);
        formData.append('bucket', 'chat-photos');

        const uploadRes = await fetch(`${API_BASE_URL}/api/community/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          photoUrl = uploadData.url;
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/community/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: chatInputText.trim(),
          photo_url: photoUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setChatInputText('');
        setChatPhotoFile(null);
        setChatPhotoPreview(null);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilterDistrict('All');
    setFilterCrop('All');
    setFilterDanger('All');
    setSortBy('priority');
    setSearchQuery('');
  };

  const activeFiltersCount =
    (filterDistrict !== 'All' ? 1 : 0) +
    (filterCrop !== 'All' ? 1 : 0) +
    (filterDanger !== 'All' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Helper for danger pill
  const getDangerBadge = (level) => {
    const raw = (level || '').toLowerCase();
    if (raw === 'critical') {
      return { level: 'Critical', label: t('danger_critical', currentLang) || 'Critical Outbreak', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    if (raw === 'high') {
      return { level: 'High', label: t('danger_high', currentLang) || 'High Danger', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (raw === 'medium' || raw === 'moderate') {
      return { level: 'Medium', label: t('danger_medium', currentLang) || 'Moderate Advisory', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    return { level: 'Low', label: t('danger_low', currentLang) || 'Low Advisory', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1b432a] text-white text-[11px] font-bold tracking-wide uppercase">
                {t('biosecurity_network', currentLang) || 'Biosecurity Network'}
              </span>
              <span className="text-xs text-[#6b7c70] flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                {t('live_surveillance', currentLang) || 'Live District Surveillance'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618] tracking-tight">
              {t('community_alerts_title', currentLang) || 'Farmer Community & Outbreak Alerts'}
            </h1>
            <p className="text-xs sm:text-sm text-[#526055] leading-relaxed">
              {t('community_alerts_desc', currentLang) || 'Real-time pest, disease, and weather warnings verified across 31 Karnataka districts. Connect directly with neighboring growers to coordinate sprays and field containment.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('broadcast_outbreak_btn', currentLang) || 'Broadcast Outbreak'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Community Alerts vs Messages & Farmer Chats */}
        <div className="flex items-center justify-between border-b border-[#e4dfd5] pb-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                setActiveTab('alerts');
                setActiveConv(null);
              }}
              className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'alerts'
                  ? 'border-[#1b432a] text-[#1b432a]'
                  : 'border-transparent text-[#6b7c70] hover:text-[#1a2e1d]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('community_alerts_tab', currentLang) || 'Community Alerts'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#eef5ee] text-[#1b432a] font-bold">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'messages'
                  ? 'border-[#1b432a] text-[#1b432a]'
                  : 'border-transparent text-[#6b7c70] hover:text-[#1a2e1d]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('farmer_messages_tab', currentLang) || 'Farmer Messages'}</span>
              {conversations.some((c) => c.unread_count > 0) && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                  {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-[#6b7c70] hidden sm:block">
            {t('farm_district_label', currentLang) || 'Farm District'}: <strong className="text-[#1a2e1d]">{getLocalizedLocation(profile?.district || 'Karnataka', currentLang)}</strong>
          </span>
        </div>

        {/* TAB 1: COMMUNITY ALERTS & FILTERING */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">

            {/* Filter & Search Bar */}
            <div className="editorial-card p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-[#6b7c70] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_alerts_placeholder', currentLang) || "Search crop, symptom, or village..."}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium text-[#1a2e1d] focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7c70] hover:text-[#1a2e1d]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* District Filter */}
                <div>
                  <select
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-semibold text-[#1a2e1d] focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  >
                    <option value="All">{t('all_districts_option', currentLang) || 'All Districts (31)'}</option>
                    {ALL_KARNATAKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {getLocalizedLocation(d, currentLang)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop Filter */}
                <div>
                  <select
                    value={filterCrop}
                    onChange={(e) => setFilterCrop(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-semibold text-[#1a2e1d] focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  >
                    <option value="All">{t('all_crops_option', currentLang) || 'All Crops'}</option>
                    {CROPS_LIST.map((c) => (
                      <option key={c} value={c}>
                        {getLocalizedCropName(c, currentLang)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Danger Level Filter */}
                <div>
                  <select
                    value={filterDanger}
                    onChange={(e) => setFilterDanger(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-semibold text-[#1a2e1d] focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  >
                    <option value="All">{t('all_danger_levels_option', currentLang) || 'All Danger Levels'}</option>
                    <option value="Critical">{t('danger_critical', currentLang) || 'Critical'}</option>
                    <option value="High">{t('danger_high', currentLang) || 'High'}</option>
                    <option value="Medium">{t('danger_medium', currentLang) || 'Medium'}</option>
                    <option value="Low">{t('danger_low', currentLang) || 'Low'}</option>
                  </select>
                </div>
              </div>

              {/* Sort & Quick Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f0ece2] text-xs">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#1b432a]" />
                  <span className="font-semibold text-[#526055]">{t('sort_by', currentLang) || 'Sort By:'}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'priority', label: t('sort_priority', currentLang) || 'Recommended Priority' },
                      { id: 'latest', label: t('sort_latest', currentLang) || 'Latest First' },
                      { id: 'nearest', label: t('sort_nearest', currentLang) || 'Nearest to My Farm' },
                      { id: 'danger', label: t('sort_danger', currentLang) || 'Highest Danger' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSortBy(s.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                          sortBy === s.id
                            ? 'bg-[#1b432a] text-white shadow-xs'
                            : 'bg-white hover:bg-[#f0ece2] text-[#2d3a2f] border border-[#d6cfc3]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#991b1b] hover:text-[#7f1d1d] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t('reset_filters', currentLang) || 'Reset Filters'} ({activeFiltersCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Alerts Grid */}
            {loading ? (
              <div className="editorial-card p-12 text-center space-y-2">
                <Loader2 className="w-7 h-7 text-[#1b432a] animate-spin mx-auto" />
                <p className="text-xs text-[#526055] font-medium">Computing spatial proximities and verifying district reports...</p>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alerts.map((rawA) => {
                    const a = getLocalizedAlert(rawA, currentLang);
                    const dangerBadge = getDangerBadge(a.danger_level);
                    return (
                      <div
                        key={a.id}
                        className="editorial-card p-5 flex flex-col justify-between hover:shadow-md transition-shadow group relative border border-[#e4dfd5]"
                      >
                        <div className="space-y-3">

                          {/* Card Header: Badges & Proximity */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${dangerBadge.color}`}>
                                {dangerBadge.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[10px] font-bold border border-[#fde68a]">
                                {t(a.crop_name || a.crop, currentLang) || a.crop_name || a.crop}
                              </span>
                            </div>

                            {a.distance_km !== null && a.distance_km !== undefined && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                                  a.distance_km === 0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-[#faf8f5] text-[#526055] border border-[#e4dfd5]'
                                }`}
                              >
                                <MapPin className="w-3 h-3 text-[#1b432a]" />
                                {a.distance_km === 0 ? (t('same_district', currentLang) || 'Same District') : `${a.distance_km} ${t('km_away', currentLang) || 'km away'}`}
                              </span>
                            )}
                          </div>

                          {/* Photo Thumbnail if present */}
                          {a.photo_url && (
                            <div
                              onClick={() => setViewingAlert(rawA)}
                              className="w-full h-36 rounded-lg overflow-hidden bg-[#f0ece2] relative cursor-pointer group-hover:opacity-95 transition-opacity"
                            >
                              <img
                                src={a.photo_url.startsWith('http') ? a.photo_url : `${API_BASE_URL}${a.photo_url}`}
                                alt={a.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{t('inspect_image', currentLang) || 'Inspect Image'}</span>
                              </div>
                            </div>
                          )}

                          {/* Title & Author */}
                          <div className="space-y-1">
                            <h3
                              onClick={() => setViewingAlert(rawA)}
                              className="font-serif font-bold text-base text-[#142618] hover:text-[#1b432a] cursor-pointer line-clamp-1"
                              title={a.title}
                            >
                              {a.title}
                            </h3>
                            <div className="text-[11px] text-[#6b7c70] flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[#1a2e1d]">{a.author_name || 'Farmer'}</span>
                              <span>•</span>
                              <span className="font-medium text-[#1b432a]">{a.district} {t('district_word', currentLang) || 'District'}</span>
                              {a.taluk && <span>({a.taluk})</span>}
                            </div>
                          </div>

                          {/* Description Excerpt */}
                          <p className="text-xs text-[#526055] line-clamp-3 leading-relaxed">
                            {a.description}
                          </p>
                        </div>

                        {/* Card Footer: Timestamp, Upvote & Chat CTA */}
                        <div className="pt-3 mt-3 border-t border-[#f0ece2] flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#6b7c70] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatLocalizedDate(a.created_at, currentLang)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpvote(a.id)}
                              className="p-1.5 rounded-md hover:bg-[#f0fdf4] text-[#15803d] border border-transparent hover:border-[#bbf7d0] transition-colors cursor-pointer"
                              title="Upvote / Confirm Occurrence"
                            >
                              <ThumbsUp className="w-3.5 h-3.5 inline mr-1" />
                              <span className="text-xs font-bold">{a.upvotes || 0}</span>
                            </button>

                            <button
                              onClick={() => handleStartChatWithFarmer(a)}
                              className="py-1.5 px-3 rounded-md bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{t('chat_with_farmer', currentLang) || 'Chat'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Pagination */}
                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => fetchAlerts(false)}
                      disabled={loadingMore}
                      className="py-2.5 px-6 rounded-lg bg-white hover:bg-[#faf8f5] text-[#1a2e1d] border border-[#d6cfc3] text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#1b432a]" />
                          <span>Loading more alerts...</span>
                        </>
                      ) : (
                        <span>Load More Alerts ({totalCount - alerts.length} remaining)</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="editorial-card p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#eef5ee] text-[#1b432a] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-[#16a34a]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#142618]">
                  {t('no_matching_outbreaks', currentLang) || 'No Matching Biosecurity Outbreaks'}
                </h3>
                <p className="text-xs text-[#526055] max-w-md mx-auto leading-relaxed">
                  {t('no_matching_outbreaks_desc', currentLang) || 'No active field alerts matched your current filter criteria. You can clear your filters or report an outbreak from your plot.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="py-2 px-4 rounded-lg bg-[#1b432a] text-white text-xs font-semibold cursor-pointer"
                  >
                    {t('clear_all_filters', currentLang) || 'Clear All Filters'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FARMER-TO-FARMER MESSAGES & CHATS */}
        {activeTab === 'messages' && (
          <div className="editorial-card overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[580px] border border-[#e4dfd5]">

            {/* Conversations Sidebar */}
            <div className={`p-4 border-r border-[#e4dfd5] bg-[#faf8f5]/50 flex flex-col justify-between ${activeConv ? 'hidden lg:flex' : 'flex'}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e4dfd5]">
                  <h3 className="font-serif font-bold text-base text-[#142618] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#1b432a]" />
                    <span>{t('my_farmer_chats', currentLang) || 'My Farmer Chats'}</span>
                  </h3>
                  <button
                    onClick={fetchConversations}
                    disabled={loadingConvs}
                    className="p-1 rounded text-[#526055] hover:text-[#1a2e1d] cursor-pointer"
                    title="Refresh chats"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingConvs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingConvs ? (
                  <div className="p-8 text-center text-xs text-[#6b7c70]">
                    <Loader2 className="w-5 h-5 text-[#1b432a] animate-spin mx-auto mb-2" />
                    {t('loading_discussions', currentLang) || 'Loading discussions...'}
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                    {conversations.map((c) => {
                      const isSelected = activeConv?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setActiveConv(c)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white border-[#1b432a] shadow-xs ring-1 ring-[#1b432a]/20'
                              : 'bg-white/80 hover:bg-white border-[#e4dfd5]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold text-xs text-[#142618] truncate">
                              {getOtherFarmerName(c) === 'Farmer' ? (t('farmer_label', currentLang) || 'Farmer') : getOtherFarmerName(c)}
                            </span>
                            <span className="text-[10px] text-[#6b7c70] shrink-0">
                              {formatLocalizedDate(c.updated_at, currentLang)}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#1b432a] font-semibold truncate mt-0.5">
                            {getLocalizedAlert({ title: c.alert_title }, currentLang).title}
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[11px] text-[#526055]">
                            <span className="truncate max-w-[180px]">
                              {c.last_message || t('start_chat_with_farmer', currentLang) || 'Start chatting with farmer...'}
                            </span>
                            {c.unread_count > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold shrink-0">
                                {c.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <MessageCircle className="w-8 h-8 text-[#6b7c70] mx-auto opacity-40" />
                    <p className="text-xs text-[#526055] font-medium">{t('no_active_conversations', currentLang) || 'No active farmer conversations.'}</p>
                    <p className="text-[11px] text-[#6b7c70]">
                      {t('click_chat_hint', currentLang) || 'Click Chat on any community alert to message the posting farmer.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Messages View */}
            <div className={`lg:col-span-2 flex flex-col justify-between bg-white ${!activeConv ? 'hidden lg:flex' : 'flex'}`}>
              {activeConv ? (
                <>
                  {/* Active Chat Header */}
                  <div className="p-4 border-b border-[#e4dfd5] bg-[#faf8f5] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveConv(null)}
                        className="lg:hidden p-1 rounded-md text-[#526055] hover:text-[#1a2e1d] cursor-pointer"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="w-9 h-9 rounded-full bg-[#1b432a] text-white font-bold flex items-center justify-center text-xs shrink-0 font-serif">
                        {getOtherFarmerName(activeConv).charAt(0)}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-[#142618]">
                          {getOtherFarmerName(activeConv) === 'Farmer' ? (t('farmer_label', currentLang) || 'Farmer') : getOtherFarmerName(activeConv)}
                        </h4>
                        <p className="text-[11px] text-[#526055] flex items-center gap-1">
                          <span>Re:</span>
                          <strong className="text-[#1b432a] truncate max-w-xs">{getLocalizedAlert({ title: activeConv.alert_title }, currentLang).title}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const match = alerts.find((a) => a.id === activeConv.alert_id);
                        if (match) setViewingAlert(match);
                      }}
                      className="text-xs text-[#1b432a] hover:underline flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                    >
                      <span>{t('view_alert_btn', currentLang) || 'View Alert'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div
                    ref={chatContainerRef}
                    className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[460px] bg-[#faf8f5]/30"
                  >
                    {loadingMessages && messages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6b7c70]">
                        <Loader2 className="w-5 h-5 text-[#1b432a] animate-spin mx-auto mb-2" />
                        {t('fetching_messages', currentLang) || 'Fetching encrypted messages...'}
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((m) => {
                        const isMine = m.sender_id === user?.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[78%] p-3 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                                isMine
                                  ? 'bg-[#1b432a] text-white rounded-br-xs'
                                  : 'bg-white text-[#1a2e1d] border border-[#e4dfd5] rounded-bl-xs'
                              }`}
                            >
                              {!isMine && (
                                <p className="text-[10px] font-bold text-[#1b432a]">
                                  {m.sender_name || 'Farmer'}
                                </p>
                              )}

                              {m.photo_url && (
                                <div className="rounded-lg overflow-hidden my-1 bg-black/10 max-h-48">
                                  <img
                                    src={m.photo_url.startsWith('http') ? m.photo_url : `${API_BASE_URL}${m.photo_url}`}
                                    alt="Field snapshot"
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(m.photo_url.startsWith('http') ? m.photo_url : `${API_BASE_URL}${m.photo_url}`, '_blank')}
                                  />
                                </div>
                              )}

                              {(m.content || m.message_text || m.text || m.message) && (
                                <p className="leading-relaxed whitespace-pre-wrap">{m.content || m.message_text || m.text || m.message}</p>
                              )}

                              <div
                                className={`text-[9px] text-right ${
                                  isMine ? 'text-white/70' : 'text-[#6b7c70]'
                                }`}
                              >
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-xs text-[#6b7c70] space-y-1">
                        <MessageSquare className="w-8 h-8 text-[#6b7c70] mx-auto opacity-30" />
                        <p>{t('no_messages_yet', currentLang) || 'No messages yet.'}</p>
                        <p className="text-[11px]">{t('start_chat_hint', currentLang) || 'Send a friendly greeting or query to start communicating!'}</p>
                      </div>
                    )}
                  </div>

                  {/* Photo Preview in Chat */}
                  {chatPhotoPreview && (
                    <div className="p-2 border-t border-[#e4dfd5] bg-[#faf8f5] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-white border border-[#d6cfc3] relative">
                        <img src={chatPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-[#1a2e1d] font-semibold truncate">
                        {chatPhotoFile?.name}
                      </span>
                      <button
                        onClick={() => {
                          setChatPhotoFile(null);
                          setChatPhotoPreview(null);
                        }}
                        className="p-1 rounded-full text-[#991b1b] hover:bg-rose-50 cursor-pointer ml-auto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-[#e4dfd5] bg-white flex items-center gap-2">
                    <input
                      type="file"
                      ref={chatFileInputRef}
                      onChange={handleChatPhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      className="p-2 rounded-lg text-[#526055] hover:text-[#1b432a] hover:bg-[#faf8f5] border border-[#d6cfc3] transition-colors cursor-pointer"
                      title={t('attach_photo', currentLang)}
                    >
                      <Camera className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={t('type_message_placeholder', currentLang)}
                      className="flex-1 py-2 px-3 rounded-lg border border-[#d6cfc3] bg-white text-xs text-[#1a2e1d] font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    />

                    <button
                      type="submit"
                      disabled={sendingMessage || (!chatInputText.trim() && !chatPhotoFile)}
                      className="py-2 px-4 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {sendingMessage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('sending', currentLang)}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('send', currentLang)}</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-[#142618]">
                    {t('no_conversations_title', currentLang)}
                  </h4>
                  <p className="text-xs text-[#526055] max-w-sm leading-relaxed">
                    {t('no_conversations_subtitle', currentLang)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 1: BROADCAST FIELD OUTBREAK */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-[#142618]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="editorial-card max-w-lg w-full p-6 sm:p-8 space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-[#e4dfd5] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#142618]">
                    {t('broadcast_modal_title', currentLang)}
                  </h3>
                  <p className="text-xs text-[#6b7c70]">
                    {t('broadcast_modal_subtitle', currentLang)}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded text-[#526055] hover:text-[#1a2e1d] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-medium">
                  {createSuccess}
                </div>
              )}

              <form onSubmit={handleCreateAlert} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                    Alert Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Late blight spreading on bottom canopy after heavy dew"
                    className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                      {t('affected_crop_label', currentLang) || 'Affected Crop *'}
                    </label>
                    <select
                      value={newCrop}
                      onChange={(e) => setNewCrop(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    >
                      {CROPS_LIST.map((c) => (
                        <option key={c} value={c}>
                          {getLocalizedCropName(c, currentLang)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                      {t('affected_district_label', currentLang) || 'District *'}
                    </label>
                    <select
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    >
                      {ALL_KARNATAKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {getLocalizedLocation(d, currentLang)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                      {t('danger_level_label', currentLang) || 'Danger Level *'}
                    </label>
                    <select
                      value={newDanger}
                      onChange={(e) => setNewDanger(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    >
                      <option value="Critical">{t('danger_critical', currentLang) || 'Critical (High Severity Outbreak)'}</option>
                      <option value="High">{t('danger_high', currentLang) || 'High Urgency'}</option>
                      <option value="Medium">{t('danger_medium', currentLang) || 'Medium (Moderate Symptoms)'}</option>
                      <option value="Low">{t('danger_low', currentLang) || 'Low (General Advisory)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                      {t('taluk_area_optional', currentLang) || 'Taluk / Area (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={newTaluk}
                      onChange={(e) => setNewTaluk(e.target.value)}
                      placeholder="e.g. Srinivaspur, Malur"
                      className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                    />
                  </div>
                </div>

                {/* Photograph Upload */}
                <div>
                  <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                    {t('upload_field_photo_label', currentLang) || 'Upload Field Photograph (Max 5MB)'}
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-lg border-2 border-dashed border-[#d6cfc3] hover:border-[#1b432a] bg-[#faf8f5] text-center cursor-pointer transition-colors"
                  >
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Field preview"
                          className="w-32 h-24 object-cover rounded-md mx-auto shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Camera className="w-6 h-6 text-[#1b432a] mx-auto" />
                        <p className="text-xs font-semibold text-[#1a2e1d]">Click to select field image</p>
                        <p className="text-[10px] text-[#6b7c70]">JPEG, PNG, or WebP</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a2e1d] mb-1">
                    Field Observations & Recommended Containment *
                  </label>
                  <textarea
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe symptoms, plot area, weather conditions, and what sprays or preventative measures you recommend..."
                    className="w-full p-2.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1b432a]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e4dfd5]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-[#d6cfc3] bg-white text-xs font-semibold text-[#526055] hover:bg-[#faf8f5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAlert}
                    className="px-5 py-2 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {submittingAlert ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Broadcasting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Broadcast to District</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: VIEW DETAILED ALERT */}
        {viewingAlert && (() => {
          const localizedAlert = getLocalizedAlert(viewingAlert, currentLang);
          return (
            <div className="fixed inset-0 z-50 bg-[#142618]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="editorial-card max-w-2xl w-full p-6 sm:p-8 space-y-4 my-8">
                <div className="flex items-start justify-between border-b border-[#e4dfd5] pb-3 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDangerBadge(viewingAlert.danger_level).color}`}>
                        {getDangerBadge(viewingAlert.danger_level).label}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] text-[10px] font-bold">
                        {getLocalizedCropName(viewingAlert.crop, currentLang)}
                      </span>
                      {viewingAlert.distance_km !== null && viewingAlert.distance_km !== undefined && (
                        <span className="text-[10px] text-[#526055] font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#1b432a]" />
                          {viewingAlert.distance_km === 0 ? (t('same_district', currentLang) || 'Same District') : `${viewingAlert.distance_km} ${t('km_away', currentLang) || 'km away'}`}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#142618]">
                      {localizedAlert.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setViewingAlert(null)}
                    className="p-1 rounded text-[#526055] hover:text-[#1a2e1d] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Photo Display */}
                {viewingAlert.photo_url && (
                  <div className="rounded-xl overflow-hidden bg-black/5 max-h-72">
                    <img
                      src={viewingAlert.photo_url.startsWith('http') ? viewingAlert.photo_url : `${API_BASE_URL}${viewingAlert.photo_url}`}
                      alt={localizedAlert.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Author & Location Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] text-xs">
                  <div>
                    <span className="text-[#6b7c70] block text-[10px] uppercase font-bold">{t('reporter_label', currentLang) || 'Reporter'}</span>
                    <span className="font-semibold text-[#1a2e1d]">{viewingAlert.author_name && viewingAlert.author_name.toLowerCase() !== 'farmer' ? viewingAlert.author_name : (t('farmer_label', currentLang) || 'Farmer')}</span>
                  </div>
                  <div>
                    <span className="text-[#6b7c70] block text-[10px] uppercase font-bold">{t('district_label', currentLang) || 'District'}</span>
                    <span className="font-semibold text-[#1a2e1d]">{getLocalizedLocation(viewingAlert.district, currentLang)}</span>
                  </div>
                  <div>
                    <span className="text-[#6b7c70] block text-[10px] uppercase font-bold">{t('taluk_label', currentLang) || 'Taluk'}</span>
                    <span className="font-semibold text-[#1a2e1d]">{getLocalizedLocation(viewingAlert.taluk || 'District Wide', currentLang)}</span>
                  </div>
                  <div>
                    <span className="text-[#6b7c70] block text-[10px] uppercase font-bold">{t('date_label', currentLang) || 'Date'}</span>
                    <span className="font-semibold text-[#1a2e1d]">
                      {formatLocalizedDate(viewingAlert.created_at, currentLang)}
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <div className="space-y-1.5 text-xs text-[#526055] leading-relaxed">
                  <h4 className="font-bold text-[#1a2e1d] uppercase tracking-wider text-[11px]">{t('field_report_label', currentLang) || 'Field Report'}</h4>
                  <p className="whitespace-pre-wrap">{localizedAlert.description}</p>
                </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#e4dfd5] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleUpvote(viewingAlert.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] text-xs font-semibold cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{t('confirm_upvote', currentLang) || 'Confirm / Upvote'} ({viewingAlert.upvotes || 0})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingAlert(null)}
                    className="px-4 py-1.5 rounded-lg border border-[#d6cfc3] bg-white text-xs font-semibold text-[#526055] hover:bg-[#faf8f5] cursor-pointer"
                  >
                    {t('close', currentLang) || 'Close'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartChatWithFarmer(viewingAlert)}
                    className="px-4 py-1.5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('chat_with_farmer', currentLang) || 'Chat with Farmer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ); })()}

      </div>
    </div>
  );
};
