import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Activity,
  Wind,
  Thermometer,
  ShieldCheck,
  Wrench,
  PhoneCall,
  ExternalLink,
  HelpCircle,
  Clock,
  BookOpen,
  Sprout,
  Check,
  AlertCircle,
  ShieldAlert,
  Leaf
} from 'lucide-react';
import { t, useLanguage, mapToI18nCode } from '../lib/i18n';
import { TOMATO_DISEASE_GUIDES } from '../data/diseaseGuides';

export const DiseaseResult = ({ result, imagePreview, selectedCrop, lang: propLang }) => {
  const { language } = useLanguage();
  const currentLang = propLang || language || 'English';
  const langKey = mapToI18nCode(currentLang); // 'en' | 'kn' | 'hi'

  if (!result) return null;

  // 1. Model Awaiting Integration Display (Only for non-integrated secondary crops)
  if (result.status === 'model_awaiting_integration') {
    const advisory = result.advisory || {};
    const diseases = advisory.major_diseases || [];

    return (
      <div className="space-y-6">
        <div className="editorial-card p-6 border-l-4 border-l-[#d97706] bg-[#fffbeb]/40 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-semibold">
                <span>ICAR Pathology Knowledgebase</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#142618]">
                {result.crop} Pathology Diagnostic & Management Guide
              </h3>
              <p className="text-xs text-[#526055] leading-relaxed">
                {result.message ||
                  `Agronomic inspection for ${result.crop} foliage. Consult the accredited ICAR reference guide below for symptom confirmation, cultural controls, and chemical spray schedules.`}
              </p>
            </div>
          </div>
        </div>

        <div className="editorial-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#e4dfd5] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider">
                Grounded Agronomic Reference
              </div>
              <h2 className="font-serif font-bold text-xl text-[#142618]">
                {advisory.crop_name || result.crop} Pathology Guide
              </h2>
            </div>
            <span className="text-xs text-[#1b432a] font-semibold bg-[#eef5ee] px-3 py-1 rounded-full border border-[#cbe2ce]">
              {advisory.research_institute || 'ICAR Agricultural Advisory'}
            </span>
          </div>

          <p className="text-xs text-[#526055] leading-relaxed">
            {advisory.overview || 'Standard plant protection and disease management practices.'}
          </p>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-[#1a2e1d] uppercase tracking-wider">
              Major Recognized Pathologies in Indian Cultivation:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diseases.map((d, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] space-y-2.5">
                  <div>
                    <h5 className="font-bold text-sm text-[#142618]">{d.disease_name}</h5>
                    {d.scientific_name && (
                      <span className="text-[11px] italic text-[#6b7c70] block">
                        {d.scientific_name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs space-y-1.5 text-[#526055]">
                    <div>
                      <strong className="text-[#2d3a2f]">Symptoms: </strong>
                      {d.symptoms}
                    </div>
                    {d.favorable_conditions && (
                      <div>
                        <strong className="text-[#2d3a2f]">Conditions: </strong>
                        {d.favorable_conditions}
                      </div>
                    )}
                    <div>
                      <strong className="text-[#143823]">ICAR Management: </strong>
                      {d.management}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Out-of-Scope / Leaf Quality Failure
  if (result.status === 'unable_to_detect') {
    return (
      <div className="editorial-card p-6 sm:p-8 bg-[#fffbeb]/50 border-[#fde68a] text-center space-y-3">
        <div className="w-12 h-12 bg-[#fef3c7] text-[#b45309] rounded-xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#92400e]">
          {t('unable_to_detect', currentLang) || 'Image Quality Check Failed'}
        </h3>
        <p className="text-xs text-[#78350f] max-w-md mx-auto leading-relaxed">
          {result.message ||
            'Image rejected by leaf quality validator. Please upload a clear, focused photo showing sufficient green leaf area.'}
        </p>
      </div>
    );
  }

  // 3. Low Confidence / Uncertain Banner
  if (result.status === 'uncertain' || result.uncertain) {
    return (
      <div className="editorial-card p-6 bg-[#fffbeb]/50 border-[#fde68a] space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-[#fef3c7] text-[#b45309] rounded-lg flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-[#92400e]">
              Diagnostic Result is Uncertain
            </h3>
            <p className="text-xs text-[#78350f] leading-relaxed">
              Analysis certainty ({Math.round((result.confidence || 0) * 100)}%) is low. Please take
              another photo in good daylight.
              {result.message && ` ${result.message}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Retrieve comprehensive farmer-friendly guide for the disease
  const diseaseKey = result.disease || 'Healthy';
  const guideEntry = TOMATO_DISEASE_GUIDES[diseaseKey] || {};
  const localizedGuide =
    guideEntry.languages?.[langKey] ||
    guideEntry.languages?.en ||
    null;

  const info = result.disease_info || {};
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const isHealthy = diseaseKey === 'Healthy' || result.is_healthy;

  // 4. Healthy Leaf Detection
  if (isHealthy) {
    const healthyGuide = localizedGuide || {
      common_name: t('healthy_foliage', currentLang),
      what_is_happening: t('healthy_message', currentLang),
      symptoms: [
        'Uniform vibrant green color across leaf blade.',
        'Clean margins with no yellow halos or brown lesions.',
        'Firm leaf texture with no dark spots.',
        'Normal leaf expansion with no upward or downward viral curling.'
      ],
      why_it_happens: 'Optimal plant nutrition, proper irrigation, and healthy growing conditions.',
      how_it_spreads: 'Non-pathogenic; plant tissue is healthy.',
      how_serious_is_it: {
        level: 'Zero Pathology Detected',
        description: t('healthy_disclaimer', currentLang)
      },
      what_to_do_now: [
        'Maintain regular morning drip irrigation.',
        'Apply balanced organic manure or recommended NPK fertigation schedule.',
        'Prune lower leaves touching wet soil to prevent future fungal splash.',
        'Inspect leaf undersides weekly for early pests like aphids or whiteflies.'
      ],
      how_to_prevent: [
        'Apply preventive bio-fungicides like Trichoderma viride monthly.',
        'Maintain 60 cm row spacing for good air movement.'
      ]
    };

    return (
      <div className="space-y-6">
        {/* Main Healthy Card */}
        <div className="editorial-card p-6 sm:p-8 border-[#cbe2ce] bg-[#f0fdf4]/50 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('diagnosis_result_title', currentLang)}</span>
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#143823]">
                {healthyGuide.common_name || t('healthy_foliage', currentLang)}
              </h2>
              <p className="text-xs text-[#166534] font-medium leading-relaxed">
                {healthyGuide.what_is_happening}
              </p>
            </div>

            <div className="text-right p-3.5 rounded-xl bg-white border border-[#cbe2ce] shrink-0 shadow-xs">
              <span className="text-[10px] font-semibold text-[#526055] uppercase block">
                {t('confidence', currentLang)}
              </span>
              <span className="text-2xl font-bold text-[#143823]">{confidencePercent}%</span>
              <span className="text-[10px] text-[#6b7c70] block">Assessment</span>
            </div>
          </div>

          {imagePreview && (
            <div className="pt-4 border-t border-[#cbe2ce] flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Analyzed leaf"
                className="w-16 h-16 object-cover rounded-lg border border-[#cbe2ce]"
              />
              <div className="text-xs text-[#526055]">
                <span className="font-semibold text-[#1a2e1d] block">Photographed Foliage</span>
                <span>Inspected across 10 foliar classes with zero disease markers found.</span>
              </div>
            </div>
          )}
        </div>

        {/* 7 Structured Sections for Healthy Leaf */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section B: Symptoms */}
          <div className="editorial-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#166534] font-bold text-xs uppercase tracking-wider">
              <Leaf className="w-4 h-4" />
              <h3>{t('symptoms_title', currentLang)}</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-[#526055]">
              {healthyGuide.symptoms.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#166534] shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section E: How serious is it? + Disclaimer */}
          <div className="editorial-card p-5 space-y-3 bg-[#f0fdf4]/30 border-[#cbe2ce]">
            <div className="flex items-center gap-2 text-[#166534] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <h3>{t('how_serious_title', currentLang)}</h3>
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#dcfce7] text-[#166534] font-semibold text-xs mb-1">
              {healthyGuide.how_serious_is_it.level}
            </div>
            <p className="text-xs text-[#526055] leading-relaxed">
              {healthyGuide.how_serious_is_it.description}
            </p>
          </div>

          {/* Section F: What should you do now? */}
          <div className="editorial-card p-5 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              <h3>{t('what_to_do_title', currentLang)}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthyGuide.what_to_do_now.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] text-xs text-[#526055] flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-[#1b432a] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Initial Assessment Disclaimer */}
        <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#1b432a] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6b7c70] space-y-0.5">
            <strong className="text-[#1a2e1d] block">{t('ai_disclaimer_title', currentLang)}</strong>
            <p>{t('ai_disclaimer_body', currentLang)}</p>
          </div>
        </div>
      </div>
    );
  }

  // 5. Validated Disease Diagnosis for Pathologies (Tomato & Multi-Crop)
  const officialName = guideEntry.official_name || `${result.crop} — ${result.disease}`;
  const scientificName = guideEntry.scientific_name || info.scientific_name || '';
  const commonFarmerName =
    localizedGuide?.common_name ||
    info.common_name ||
    t('confirmed_pathology', currentLang);

  const whatIsHappening =
    localizedGuide?.what_is_happening ||
    info.what_is_it ||
    'Pathological foliar infection reducing crop photosynthetic energy and yield potential.';

  const symptomsList = localizedGuide?.symptoms || [
    info.symptoms || 'Visible leaf lesions, discoloration, or chlorotic halos.'
  ];

  const whyHappens =
    localizedGuide?.why_it_happens ||
    info.why_it_happens ||
    'Pathogen multiplication triggered by high humidity and temperature extremes.';

  const howSpreads =
    localizedGuide?.how_it_spreads ||
    info.how_it_spreads ||
    'Rain splash, air currents, or contact between adjacent vines.';

  const howSerious = localizedGuide?.how_serious_is_it || {
    level: guideEntry.severity_level || 'Moderate Concern',
    description:
      'Can reduce yield if left unmanaged. Note: This assessment is based on the photographed leaf; field-level severity depends on the percentage of crop area affected.'
  };

  const whatToDoNow = localizedGuide?.what_to_do_now || [
    info.what_to_do_now || 'Prune severely infected foliage and isolate the affected plot.',
    info.management_treatment || 'Apply recommended fungicides or bactericides at prescribed concentrations.'
  ];

  const howToPrevent = localizedGuide?.how_to_prevent || [
    info.how_to_prevent || 'Practice crop rotation with non-host crops and use certified seeds.',
    'Scout crop weekly and maintain adequate plant spacing.'
  ];

  return (
    <div className="space-y-6">
      {/* Primary Diagnosis Card */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f2] text-[#991b1b] text-xs font-semibold border border-[#fecaca]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('confirmed_pathology', currentLang)}</span>
            </div>

            {/* Farmer-Friendly Common Name Prominently Displayed */}
            <h2 className="font-serif font-bold text-2xl text-[#142618]">
              {commonFarmerName}
            </h2>

            {/* Official and Scientific Names Displayed as Secondary Information */}
            <div className="text-xs text-[#526055] flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#1a2e1d]">{officialName}</span>
              {scientificName && (
                <>
                  <span className="text-[#d6cfc3]">•</span>
                  <span className="italic text-[#6b7c70]">{scientificName}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] shrink-0 shadow-xs">
            <span className="text-[10px] font-semibold text-[#526055] uppercase block">
              {t('confidence', currentLang)}
            </span>
            <span className="text-2xl font-bold text-[#143823]">{confidencePercent}%</span>
            <span className="text-[10px] text-[#6b7c70] block">Assessment</span>
          </div>
        </div>

        {/* Top 3 Probabilities Bar */}
        {result.top_probabilities && (
          <div className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1.5">
            <span className="text-[10px] font-semibold text-[#526055] uppercase tracking-wider block">
              Condition Assessment
            </span>
            <div className="space-y-1">
              {result.top_probabilities.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-[#2d3a2f]">{item.disease}</span>
                  <span className="font-mono text-[#526055] font-semibold">
                    {(item.probability * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="pt-3 border-t border-[#e4dfd5] flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Analyzed leaf"
              className="w-16 h-16 object-cover rounded-lg border border-[#e4dfd5]"
            />
            <div className="text-xs text-[#526055]">
              <span className="font-semibold text-[#1a2e1d] block">Uploaded Foliage</span>
              <span>Inspected for visible leaf infection, lesion patterns, and pathology symptoms.</span>
            </div>
          </div>
        )}
      </div>

      {/* 7 Structured Sections (A through G) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section A: What is happening to your plant? */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <h3>{t('what_is_happening_title', currentLang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">{whatIsHappening}</p>
        </div>

        {/* Section B: Symptoms */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <h3>{t('symptoms_title', currentLang)}</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-[#526055]">
            {symptomsList.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#991b1b] shrink-0 mt-1.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section C: Why does this happen? */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Thermometer className="w-4 h-4" />
            <h3>{t('why_happens_title', currentLang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">{whyHappens}</p>
        </div>

        {/* Section D: How does it spread? */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Wind className="w-4 h-4" />
            <h3>{t('how_spreads_title', currentLang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">{howSpreads}</p>
        </div>

        {/* Section E: How serious is it? + Field Disclaimer */}
        <div className="editorial-card p-5 space-y-2 md:col-span-2 bg-[#fffbeb]/30 border-[#fde68a]">
          <div className="flex items-center gap-2 text-[#b45309] font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <h3>{t('how_serious_title', currentLang)}</h3>
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] font-semibold text-xs mb-1">
            {howSerious.level}
          </div>
          <p className="text-xs text-[#78350f] leading-relaxed">{howSerious.description}</p>
        </div>

        {/* Section F: What should you do now? (Step-by-step) */}
        <div className="editorial-card p-5 space-y-3 md:col-span-2 bg-[#f0fdf4]/20 border-[#cbe2ce]">
          <div className="flex items-center gap-2 text-[#166534] font-bold text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <h3>{t('what_to_do_title', currentLang)}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatToDoNow.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white border border-[#cbe2ce] text-xs text-[#2d3a2f] flex items-start gap-2 shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section G: How can you prevent it? */}
        <div className="editorial-card p-5 space-y-2 md:col-span-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <h3>{t('how_prevent_title', currentLang)}</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-[#526055]">
            {howToPrevent.map((prev, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#1b432a] shrink-0 mt-0.5" />
                <span>{prev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety & Initial Diagnostic Assessment Disclaimer */}
      <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#1b432a] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6b7c70] space-y-0.5">
            <strong className="text-[#1a2e1d] block">{t('ai_disclaimer_title', currentLang)}</strong>
            <p className="max-w-xl">{t('ai_disclaimer_body', currentLang)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open('https://icar.org.in/kvk-network', '_blank')}
          className="px-3.5 py-1.5 rounded-lg bg-[#1b432a] text-white text-xs font-semibold hover:bg-[#143420] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{t('contact_kvk', currentLang)}</span>
        </button>
      </div>

      {/* Advisory Citation */}
      <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex items-center justify-between text-[11px] text-[#6b7c70]">
        <span>Citation: {info.source || 'ICAR-IIHR Bengaluru & TNAU Plant Pathology Advisory'}</span>
        {info.source_url && (
          <a
            href={info.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1b432a] font-semibold underline flex items-center gap-1"
          >
            <span>Reference Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
