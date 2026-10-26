import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, MapPin, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';

export const Footer = () => {
  const { language } = useAuth();
  const currentLang = language || 'English';

  return (
    <footer className="bg-[#142618] text-[#d6ded8] border-t border-[#223d28]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand & Overview */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#254d32] text-white flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-white text-lg tracking-tight">
                {t('app_name', currentLang)}
              </span>
            </Link>
            <p className="text-xs text-[#9eb3a4] leading-relaxed">
              {t('footer_desc', currentLang)}
            </p>
            <div className="pt-2 text-[11px] text-[#86a08e] flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#52b775]" />
              <span>Calibrated for Indian Agro-Climatic Zones</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Platform Features</h4>
            <ul className="space-y-2 text-xs text-[#9eb3a4]">
              <li>
                <Link to="/detect" className="hover:text-white transition-colors">
                  Crop Leaf Disease Detection
                </Link>
              </li>
              <li>
                <Link to="/price-prediction" className="hover:text-white transition-colors">
                  7-Day Mandi Price Forecasts
                </Link>
              </li>
              <li>
                <Link to="/yield-prediction" className="hover:text-white transition-colors">
                  Crop Yield Estimation
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  District Outbreak Warnings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Farmer Profile & Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Extension Citations */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Advisory Sources</h4>
            <ul className="space-y-2 text-xs text-[#9eb3a4]">
              <li>ICAR - IIHR Bengaluru (Horticulture)</li>
              <li>ICAR - NRRI Cuttack (Rice / Paddy)</li>
              <li>ICAR - IIWBR Karnal (Wheat)</li>
              <li>ICAR - CPRI Shimla (Potato)</li>
              <li>ICAR - CICR Nagpur (Cotton)</li>
              <li>TNAU Agritech Portal (General Field Crops)</li>
            </ul>
          </div>

          {/* Technical Scope Notice */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Advisory Standard</h4>
            <div className="p-3.5 rounded-xl bg-[#1b3320] border border-[#27482f] text-xs space-y-1.5 text-[#a8bdae]">
              <div className="flex items-center gap-1.5 text-[#52b775] font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Diagnostic Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Computer vision diagnoses serve as early screening tools. Always verify severe or widespread foliar symptoms with your local Krishi Vigyan Kendra (KVK) officer before applying chemical interventions.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#223d28] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#7d9484]">
          <p>© {new Date().getFullYear()} Smart Crop Advisory System. Developed for Indian Agricultural Extension.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Grounded Reference Architecture</span>
            <span>•</span>
            <span>Supabase RLS Protected</span>
            <span>•</span>
            <span>Zero Synthetic Hallucinations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
