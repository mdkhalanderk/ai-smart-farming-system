import React from 'react';
import { Sprout } from 'lucide-react';

export function PageLoader({ message = 'Loading Krishi Drishti...' }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-full border-3 border-[#cbe2ce] border-t-[#1b432a] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sprout className="w-6 h-6 text-[#2d6a4f] animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-[#1a2e1d] tracking-wide">
        {message}
      </p>
      <p className="text-xs text-[#526055] mt-1">
        Calibrating agricultural intelligence & data
      </p>
    </div>
  );
}

