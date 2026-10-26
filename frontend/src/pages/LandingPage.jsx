import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  BookOpen,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';

export const LandingPage = () => {
  const { language } = useAuth();
  const currentLang = language || 'English';

  return (
    <div className="bg-[#faf8f5] flex flex-col">
      
      {/* Editorial Hero Section */}
      <section className="border-b border-[#e4dfd5] bg-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef5ee] text-[#1b432a] border border-[#cbe2ce] text-xs font-semibold mb-6">
            <Sprout className="w-3.5 h-3.5" />
            <span>{t('hero_tag', currentLang)}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#142618] tracking-tight leading-tight max-w-4xl mx-auto">
            {t('hero_title', currentLang)}
          </h1>

          <p className="mt-5 text-sm sm:text-base text-[#526055] max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle', currentLang)}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('cta_create_account', currentLang)}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-[#faf8f5] text-[#1a2e1d] text-sm font-semibold border border-[#d6cfc3] transition-colors flex items-center justify-center gap-2"
            >
              <span>{t('cta_signin', currentLang)}</span>
            </Link>
          </div>

          {/* Key Feature Scope */}
          <div className="mt-14 pt-10 border-t border-[#e4dfd5] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="text-xs font-semibold uppercase text-[#526055] tracking-wider">{t('feature_crop_health', currentLang)}</div>
              <div className="text-sm font-bold text-[#1a2e1d] mt-1">{t('disease_diagnosis', currentLang)}</div>
              <div className="text-xs text-[#6b7c70] mt-0.5">{t('feature_crop_health_desc', currentLang)}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="text-xs font-semibold uppercase text-[#526055] tracking-wider">{t('feature_scope', currentLang)}</div>
              <div className="text-sm font-bold text-[#1a2e1d] mt-1">14 Major Crops</div>
              <div className="text-xs text-[#6b7c70] mt-0.5">{t('feature_scope_desc', currentLang)}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="text-xs font-semibold uppercase text-[#526055] tracking-wider">{t('feature_mandi', currentLang)}</div>
              <div className="text-sm font-bold text-[#1a2e1d] mt-1">7-Day APMC Trends</div>
              <div className="text-xs text-[#6b7c70] mt-0.5">{t('feature_mandi_desc', currentLang)}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5]">
              <div className="text-xs font-semibold uppercase text-[#526055] tracking-wider">{t('feature_outbreak', currentLang)}</div>
              <div className="text-sm font-bold text-[#1a2e1d] mt-1">{t('community_alerts', currentLang)}</div>
              <div className="text-xs text-[#6b7c70] mt-0.5">{t('feature_outbreak_desc', currentLang)}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618]">
            {t('core_modules_title', currentLang)}
          </h2>
          <p className="text-xs sm:text-sm text-[#526055] mt-2">
            {t('core_modules_subtitle', currentLang)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Module 1 */}
          <div className="editorial-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('disease_diagnosis', currentLang)}
              </h3>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('disease_diagnosis_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#e4dfd5] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1b432a]">14 Major Indian Crops</span>
              <Link to="/detect" className="text-[#1b432a] font-semibold underline">{t('launch_scanner', currentLang)} &rarr;</Link>
            </div>
          </div>

          {/* Module 2 */}
          <div className="editorial-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('price_forecasting', currentLang)}
              </h3>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('price_forecasting_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#e4dfd5] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1b432a]">All Karnataka APMC Markets</span>
              <Link to="/price-prediction" className="text-[#1b432a] font-semibold underline">{t('view_prices', currentLang)} &rarr;</Link>
            </div>
          </div>

          {/* Module 3 */}
          <div className="editorial-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#eef5ee] text-[#1b432a] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1a2e1d]">
                {t('yield_estimation', currentLang)}
              </h3>
              <p className="text-xs text-[#526055] leading-relaxed">
                {t('regional_yield_desc', currentLang)}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#e4dfd5] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1b432a]">12 Crop Classifications</span>
              <Link to="/yield-prediction" className="text-[#1b432a] font-semibold underline">{t('forecast_harvest', currentLang)} &rarr;</Link>
            </div>
          </div>

        </div>
      </section>

      {/* Scope Table: Indian Crops Covered */}
      <section className="bg-white border-y border-[#e4dfd5] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#142618]">
              Indian Agricultural Scope & Research Partners
            </h2>
            <p className="text-xs text-[#526055] mt-1.5">
              Crop advisory references grounded in accredited research from the Indian Council of Agricultural Research (ICAR).
            </p>
          </div>

          <div className="border border-[#e4dfd5] rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f2ea] border-b border-[#e4dfd5] text-[#2d3a2f] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Crop</th>
                    <th className="py-3 px-4">Botanical Name</th>
                    <th className="py-3 px-4">AI Vision Status</th>
                    <th className="py-3 px-4">Advisory Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4dfd5] text-[#2d3a2f]">
                  <tr className="bg-[#f0fdf4]/40 font-medium">
                    <td className="py-3 px-4 font-semibold text-[#143823]">Tomato</td>
                    <td className="py-3 px-4 italic text-[#526055]">Solanum lycopersicum</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">VMamba Tiny SS2D (10 Classes)</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">ICAR-IIHR Bengaluru</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Rice / Paddy</td>
                    <td className="py-3 px-4 italic text-[#526055]">Oryza sativa</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">NRRI Vision Classifier Active</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">ICAR-NRRI Cuttack</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Wheat</td>
                    <td className="py-3 px-4 italic text-[#526055]">Triticum aestivum</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">IIWBR Vision Classifier Active</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">ICAR-IIWBR Karnal</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Potato</td>
                    <td className="py-3 px-4 italic text-[#526055]">Solanum tuberosum</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">CPRI Vision Classifier Active</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">ICAR-CPRI Shimla</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Chilli / Pepper</td>
                    <td className="py-3 px-4 italic text-[#526055]">Capsicum annuum</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">IIHR Vision Classifier Active</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">ICAR-IIHR Bengaluru</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Cotton</td>
                    <td className="py-3 px-4 italic text-[#526055]">Gossypium hirsutum</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">CICR Vision Classifier Active</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">ICAR-CICR Nagpur</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Sugarcane, Maize, Pulses, Onion</td>
                    <td className="py-3 px-4 italic text-[#526055]">Multiple genera</td>
                    <td className="py-3 px-4">
                      <span className="badge-active">Multi-Crop Classifier Active</span>
                    </td>
                    <td className="py-3 px-4 text-[#526055]">SBI, IIMR, IIPR, DOGR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-[#6b7c70] mt-3">
            * Note: All 14 major Indian crops have active pathology vision classification calibrated with grounded ICAR treatment advisories.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142618]">
          Ready to Start Monitoring Your Crops?
        </h2>
        <p className="text-xs sm:text-sm text-[#526055] mt-2 max-w-lg mx-auto">
          Create a free farmer account to log in, track market trends, and receive district alerts.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/signup"
            className="px-6 py-2.5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            {t('cta_create_account', currentLang)}
          </Link>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-lg bg-white hover:bg-[#f5f2ea] text-[#1a2e1d] text-xs sm:text-sm font-semibold border border-[#d6cfc3] transition-colors"
          >
            {t('cta_signin', currentLang)}
          </Link>
        </div>
      </section>

    </div>
  );
};
