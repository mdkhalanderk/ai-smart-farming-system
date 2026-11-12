import React, { useEffect, useState } from 'react';
import { Sprout, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

export function PageLoader({ message = 'Loading Krishi Drishti...' }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-full border-3 border-[#cbe2ce] border-t-[#1b432a] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sprout className="w-6 h-6 text-[#2d6a4f] animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-semibold text-[#1a2e1d] tracking-wide">
        {message}
      </p>
      <p className="text-xs text-[#526055] mt-1">
        Loading agricultural intelligence & data...
      </p>
    </div>
  );
}

/**
 * Global top progress bar + mobile-friendly loading indicator whenever
 * an API call to the backend is in flight for >350ms.
 */
export function GlobalNetworkLoader() {
  const [activeCount, setActiveCount] = useState(0);
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    const origFetch = window.fetch;
    let mounted = true;

    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      const isApiCall = url.includes('/api/') || (API_BASE_URL && url.startsWith(API_BASE_URL));
      if (!isApiCall) {
        return origFetch(...args);
      }
      if (mounted) setActiveCount((c) => c + 1);
      try {
        return await origFetch(...args);
      } finally {
        if (mounted) setActiveCount((c) => Math.max(0, c - 1));
      }
    };

    return () => {
      mounted = false;
      window.fetch = origFetch;
    };
  }, []);

  useEffect(() => {
    if (activeCount === 0) {
      setShowPill(false);
      return;
    }
    const timer = setTimeout(() => {
      if (activeCount > 0) setShowPill(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeCount]);

  if (activeCount === 0) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-[#cbe2ce]/60 overflow-hidden">
        <div className="h-full w-1/2 bg-[#1b432a] animate-pulse rounded-r-full" style={{ animation: 'pulse 0.8s ease-in-out infinite' }} />
      </div>
      {showPill && (
        <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#142618]/90 text-white text-xs font-medium shadow-lg backdrop-blur-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#52b775]" />
          <span>Connecting to server...</span>
        </div>
      )}
    </>
  );
}
