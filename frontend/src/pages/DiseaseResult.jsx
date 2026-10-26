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
  Sprout
} from 'lucide-react';
import { t } from '../lib/i18n';

export const DiseaseResult = ({ result, imagePreview, selectedCrop, lang = 'English' }) => {
  if (!result) return null;

  // 1. Model Awaiting Integration Display (Only if explicit status)
  if (result.status === 'model_awaiting_integration') {
    const advisory = result.advisory || {};
    const diseases = advisory.major_diseases || [];

    return (
      <div className="space-y-6">
        {/* Status Notice Card */}
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

        {/* Grounded ICAR Reference Guide */}
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

          {/* Recognized Diseases List */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-[#1a2e1d] uppercase tracking-wider">
              Major Recognized Pathologies in Indian Cultivation:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diseases.map((d, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] space-y-2.5">
                  <div>
                    <h5 className="font-bold text-sm text-[#142618]">
                      {d.disease_name}
                    </h5>
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

          <div className="pt-4 border-t border-[#e4dfd5] text-[11px] text-[#6b7c70] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#1b432a]" />
            <span>Information sourced directly from accredited ICAR institutes for Indian agro-climatic conditions.</span>
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
          {t('unable_to_detect', lang)}
        </h3>
        <p className="text-xs text-[#78350f] max-w-md mx-auto leading-relaxed">
          {result.message || 'Image rejected by leaf quality validator. Please upload a clear, focused photo showing sufficient green leaf area.'}
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
              Analysis certainty ({Math.round((result.confidence || 0) * 100)}%) is low. Please take another photo in good daylight.
              {result.message && ` ${result.message}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Healthy Leaf Detection
  if (result.disease === 'Healthy' || result.is_healthy) {
    const confidencePercent = Math.round((result.confidence || 0) * 100);
    return (
      <div className="space-y-6">
        <div className="editorial-card p-6 sm:p-8 border-[#cbe2ce] bg-[#f0fdf4]/30 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Diagnostic Scan Result</span>
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#143823]">
                {t('healthy_foliage', lang)}
              </h2>
              <p className="text-xs text-[#166534]">
                No foliar pathogen or viral curling detected on this {result.crop || 'crop'} leaf.
              </p>
            </div>

            <div className="text-right p-3 rounded-lg bg-white border border-[#cbe2ce] shrink-0">
              <span className="text-[10px] font-semibold text-[#526055] uppercase block">{t('confidence', lang)}</span>
              <span className="text-xl font-bold text-[#143823]">{confidencePercent}%</span>
              <span className="text-[10px] text-[#6b7c70] block">Assessment</span>
            </div>
          </div>

          {imagePreview && (
            <div className="pt-4 border-t border-[#cbe2ce] flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Analyzed leaf"
                className="w-16 h-16 object-cover rounded-lg border border-[#cbe2ce]"
              />
              <div className="text-xs text-[#526055]">
                <span className="font-semibold text-[#1a2e1d] block">Analyzed Image</span>
                <span>Inspected across validated foliar classes with zero disease markers found.</span>
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Guidance */}
        <div className="editorial-card p-6 space-y-3">
          <h4 className="font-serif font-bold text-base text-[#142618]">
            Recommended Crop Maintenance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#526055]">
            <div className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5]">
              <strong className="block text-[#1a2e1d] mb-1">Morning Drip Irrigation</strong>
              Water at soil level to prevent foliage dampness that invites fungal spores.
            </div>
            <div className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5]">
              <strong className="block text-[#1a2e1d] mb-1">Canopy Airflow</strong>
              Prune dense bottom foliage to ensure adequate ventilation between rows.
            </div>
            <div className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5]">
              <strong className="block text-[#1a2e1d] mb-1">Weekly Monitoring</strong>
              Regularly check leaf undersides for early whitefly or red spider mite stippling.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Validated Disease Diagnosis (All Crops)
  const info = result.disease_info || {};
  const confidencePercent = Math.round((result.confidence || 0) * 100);

  return (
    <div className="space-y-6">
      
      {/* Primary Diagnosis Card */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b] text-[11px] font-semibold border border-[#fecaca]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('confirmed_pathology', lang)}</span>
            </div>
            <h2 className="font-serif font-bold text-2xl text-[#142618]">
              {result.crop} — {result.disease}
            </h2>
            {info.scientific_name && (
              <p className="text-xs italic text-[#526055]">
                {info.scientific_name}
              </p>
            )}
          </div>

          <div className="text-right p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] shrink-0">
            <span className="text-[10px] font-semibold text-[#526055] uppercase block">{t('confidence', lang)}</span>
            <span className="text-xl font-bold text-[#143823]">{confidencePercent}%</span>
            <span className="text-[10px] text-[#6b7c70] block">
              Confidence
            </span>
          </div>
        </div>

        {/* Top 3 Probabilities Bar */}
        {result.top_probabilities && (
          <div className="p-3 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1.5">
            <span className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider block">
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
              <span>Inspected for visible leaf infection and symptoms.</span>
            </div>
          </div>
        )}

      </div>

      {/* Structured ICAR Treatment Knowledge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* What is it? */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <h3>Disease Overview</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">
            {info.what_is_it || 'Visual foliar pathology affecting yield.'}
          </p>
        </div>

        {/* Symptoms */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <h3>{t('symptoms', lang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">
            {info.symptoms || 'Leaf lesions and tissue necrosis.'}
          </p>
        </div>

        {/* Immediate Action */}
        <div className="editorial-card p-5 space-y-2 bg-[#f0fdf4]/20 border-[#cbe2ce]">
          <div className="flex items-center gap-2 text-[#166534] font-bold text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <h3>{t('immediate_action', lang)}</h3>
          </div>
          <p className="text-xs text-[#2d3a2f] leading-relaxed font-medium">
            {info.what_to_do_now || 'Prune severely infected foliage and isolate the affected crop area.'}
          </p>
        </div>

        {/* Treatment / Management */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <h3>{t('treatment', lang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">
            {info.management_treatment || 'Apply recommended fungicides or bactericides at prescribed concentrations.'}
          </p>
        </div>

        {/* Conditions favoring spread */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <Thermometer className="w-4 h-4" />
            <h3>{t('favorable_conditions', lang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">
            {info.favorable_conditions || 'Moderate temperatures and high relative humidity.'}
          </p>
        </div>

        {/* When to contact expert */}
        <div className="editorial-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#143823] font-bold text-xs uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <h3>{t('when_to_contact', lang)}</h3>
          </div>
          <p className="text-xs text-[#526055] leading-relaxed">
            {info.when_to_contact_expert || 'Contact your local Krishi Vigyan Kendra if symptoms spread to more than 20% of the crop.'}
          </p>
        </div>

      </div>

      {/* Advisory Citation */}
      <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex items-center justify-between text-[11px] text-[#6b7c70]">
        <span>Citation: {info.source || 'ICAR-IIHR Advisory'}</span>
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
