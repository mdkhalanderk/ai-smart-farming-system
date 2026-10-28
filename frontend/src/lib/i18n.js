// Multi-lingual i18n support for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)
import React, { useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
];

export const normalizeLang = (lang) => {
  if (!lang) return getSavedLanguage();
  const lower = String(lang).trim().toLowerCase();
  if (lower === 'kannada' || lower === 'kn' || lower === 'ka') return 'Kannada';
  if (lower === 'hindi' || lower === 'hi') return 'Hindi';
  return 'English';
};

export const translations = {
  English: {
    // Top Bar & Navigation
    precision_agri: 'PRECISION INDIAN AGRICULTURE',
    nav_dashboard: 'Dashboard',
    nav_detect: 'Disease Detection',
    nav_mandi: 'Mandi Prices',
    nav_yield: 'Crop Yield',
    nav_community: 'Community Alerts',
    nav_reports: 'Reports & Benchmarks',
    nav_signin: 'Farmer Sign In',
    nav_register: 'Register Account',
    nav_signout: 'Sign Out',
    nav_profile: 'Profile',
    nav_overview: 'Platform Overview',
    profile_settings: 'Profile Settings',
    edit_farm_details: 'Edit Farm Details',

    // Landing Page
    hero_tag: 'Agricultural Intelligence Platform for Indian Cultivation',
    hero_title: 'Practical AI Disease Detection & Market Intelligence for Indian Agriculture',
    hero_subtitle: 'A comprehensive advisory platform providing leaf disease diagnosis, recommended treatment guidelines, 7-day mandi market price trends, and localized crop yield estimates.',
    cta_create_account: 'Create Farmer Account',
    cta_signin: 'Sign In to Dashboard',
    feature_crop_health: 'Crop Health',
    feature_crop_health_desc: 'Instant Photo Inspection',
    feature_scope: 'Crop Scope',
    feature_scope_desc: 'Grounded ICAR Advisory',
    feature_mandi: 'Mandi Forecast',
    feature_mandi_desc: 'Karnataka APMC Network',
    feature_outbreak: 'Outbreak Alert',
    feature_outbreak_desc: 'District Warnings & Sync',
    core_modules_title: 'Core Agricultural Modules',
    core_modules_subtitle: 'Engineered to support daily farming decisions with verifiable agronomic grounding across all 31 districts of Karnataka.',

    // Dashboard
    welcome_farmer: 'Welcome, {name}',
    farm_advisory_for: 'Local farm advisory for {district} District. Check crop health, live mandi market prices, and seasonal harvest estimates.',
    agri_district: 'Agricultural District',
    primary_crop: 'Primary Cultivated Crop',
    advisory_lang: 'Advisory Language',
    not_provided: 'Not provided',
    not_selected: 'Not selected',
    crop_health: 'Crop Health',
    disease_diagnosis: 'Disease Diagnosis',
    disease_diagnosis_desc: 'Upload leaf photos to quickly identify plant diseases and view recommended treatment guidelines.',
    launch_scanner: 'Launch Scanner',
    mandi_rates: 'Mandi Rates',
    price_forecasting: 'Price Forecasting',
    price_forecasting_desc: 'Track daily mandi prices and 7-day price trends per quintal and per kg to plan your harvest sales.',
    view_prices: 'View Mandi Rates',
    yield_estimation: 'Yield Estimation',
    regional_yield_forecast: 'Crop Yield Forecast',
    regional_yield_desc: 'Estimate seasonal production volume per acre calibrated to your soil type, season, and irrigation.',
    forecast_harvest: 'Estimate Harvest Yield',
    community_alerts: 'Community Alerts',
    district_warnings: 'District Outbreak Warnings',
    community_warnings_desc: 'Review crowdsourced disease reports from farmers in your district to take early preventive measures.',
    view_alerts: 'Review Outbreak Alerts',
    regional_crop_intelligence: 'Regional Agricultural Intelligence & Map',
    map_title: 'Agricultural Map & Regional Advisory',
    map_desc: 'Select an area or taluk on the map to view recommended crops, harvest estimates, and local market prices.',
    select_any_crop: 'Select Any Crop to Forecast Yield in',
    all_recommended_crops: 'All Top Crops',
    expected_crop_yield: 'Expected Crop Yield',
    mandi_benchmark_price: 'Mandi Benchmark Price',
    gross_rev_per_acre: 'Est. Revenue / Acre',
    scan_leaf_disease: 'Scan Leaf Disease',
    mandi_forecasts: 'Mandi Forecasts',
    optimal_crops_for: 'Optimal Crops for',
    top_recommended_for: 'Top Recommended Crops for',
    taluk_level_precision: 'Taluk-Level Precision',
    district_overview: 'District Overview',
    soil_profile: 'Soil Profile',
    specialty_label: 'Specialty',
    ranked_by_fitness: 'Ranked by Soil & Climatic Fitness',
    cycle_label: 'Cycle',
    target_label: 'Target',
    mandi_label: 'Mandi',
    focus_karnataka: 'Karnataka',
    all_india: 'All India',
    nearest_mandi: 'Nearest APMC Mandi',
    modal_price: 'Modal Mandi Rate',
    soil_type: 'Soil Type',
    annual_rainfall: 'Annual Rainfall',
    agro_zone: 'Agro-Climatic Zone',

    // Disease Scanner
    scanner_title: 'Crop Leaf Pathology Scanner',
    scanner_subtitle: 'Upload clear leaf photos for AI diagnostic scanning or review accredited ICAR pathology references across all 14 major Indian crops.',
    select_crop_label: 'Select Cultivated Crop',
    select_crop_sub: 'Controls the active AI model and grounded pathology scope',
    model_active: 'Validated Model Active',
    awaiting_model: 'ICAR Knowledgebase Active',
    upload_prompt: 'Upload a photo of the affected leaf',
    upload_specs: 'Supports JPG, JPEG, PNG, or WebP format (up to 15 MB)',
    choose_photo: 'Choose Leaf Image',
    analyze_leaf: 'Analyze Leaf Diagnosis',
    analyzing: 'AI Scanning Pathology...',
    reset_image: 'Choose Different Photo',
    confirmed_pathology: 'Confirmed Pathology',
    healthy_foliage: 'Healthy Foliage Detected',
    confidence: 'Model Confidence',
    symptoms: 'Identified Symptoms',
    immediate_action: 'Immediate Farmer Action',
    treatment: 'Recommended Treatment (ICAR)',
    favorable_conditions: 'Favorable Weather Conditions',
    when_to_contact: 'When to Contact KVK Expert',
    top_probabilities: 'Top Model Probabilities:',
    unable_to_detect: 'Unable to Detect Foliage',
    camera_tip: 'Take a close-up, well-lit photo of the affected leaf for best diagnostic accuracy.',
    drop_photo_here: 'Drop leaf photo here or click to browse',
    browse_files: 'Browse from Device',

    // Disease Result
    diagnostic_title: 'Pathology Diagnostic & Management Guide',
    grounded_reference: 'Grounded Agronomic Reference',
    major_pathologies: 'Major Recognized Pathologies in Indian Cultivation:',
    scientific_name: 'Scientific Name:',
    conditions: 'Conditions:',
    preventive_cultural: 'Cultural / Organic Management:',
    chemical_management: 'Chemical Protection (ICAR):',
    kvk_expert_notice: 'Contact local Krishi Vigyan Kendra (KVK) if symptoms persist or spread across more than 15% of your plot.',
    print_prescription: 'Print / Save Advisory',

    // Mandi Price Prediction
    price_title: 'Mandi Market Price Forecasting',
    price_subtitle: 'Real-time daily mandi rates and 7-day predictive price trends across all Karnataka APMC markets powered by Machine Learning.',
    select_market: 'Select APMC Market',
    select_commodity: 'Select Commodity',
    calculate_forecast: 'Forecast 7-Day Prices',
    forecasting: 'Calculating Trends...',
    current_modal_rate: 'Current Market Price',
    seven_day_forecast: '7-Day Price Trajectory',
    price_trend: 'Expected Trend',
    bullish: 'Bullish (Upward)',
    bearish: 'Bearish (Downward)',
    stable: 'Stable',
    price_per_quintal: '₹/Quintal',
    price_per_kg: '₹/kg',
    market_arrival_insight: 'APMC Market Arrival & Weather Insight',

    // Yield Prediction
    yield_title: 'Crop Yield Forecasting Engine',
    yield_subtitle: 'Estimate seasonal production volume (Quintals & Tonnes per Hectare) tailored to your district soil profile, season, and irrigation status.',
    state_label: 'State',
    season_label: 'Cultivation Season',
    field_area_ha: 'Cultivated Land Area (Hectares)',
    soil_type_label: 'Field Soil Classification',
    irrigation_toggle: 'Irrigation Availability',
    with_irrigation: 'Assured Irrigation (Canal / Borewell / Drip)',
    rainfed: 'Rainfed Farming',
    calculate_yield: 'Calculate Projected Yield',
    calculating: 'Processing Agronomic Model...',
    projected_yield: 'Projected Total Production',
    mean_yield: 'Average Productivity per Hectare',
    estimated_gross_income: 'Estimated Gross Revenue at Current Market Rates',

    // Community Alerts
    community_title: 'Farmer Community Disease Alerts',
    community_subtitle: 'Crowdsourced disease sightings verified with ICAR pathology guidelines. Stay updated on nearby crop health incidents.',
    active_district_filter: 'Filter by Karnataka District',
    report_new_outbreak: 'Report Field Observation',
    post_observation: 'Submit Crop Disease Observation',
    crop_name: 'Crop Name',
    suspected_disease: 'Suspected Disease / Symptom',
    observation_details: 'Field Observation Details',
    submit_report: 'Submit Advisory Alert',
    submitting: 'Broadcasting Alert...',
    verified_by_icar: 'ICAR Grounded Advisory',
    farmers_affected: 'Farmers Watching Alert',

    // Reports Page
    reports_title: 'Pathology AI Evaluation & Farmer History',
    reports_subtitle: 'Rigorous benchmark validation metrics across 14 crops alongside your personal diagnostic history log.',
    tab_benchmark: 'Model Performance Benchmarks',
    tab_history: 'Farmer Diagnosis History',
    test_accuracy: 'Test Set Accuracy',
    precision_metric: 'Precision (Macro)',
    recall_metric: 'Recall (Macro)',
    f1_metric: 'F1-Score (Weighted)',
    search_history: 'Search history by crop or disease...',
    no_history_found: 'No past scan history found for this farmer account.',

    // Profile & Setup
    farmer_profile_details: 'Farmer Profile Details',
    full_name: 'Full Name',
    active_mobile: 'Active Mobile Number',
    select_district: 'Select Your Agricultural District',
    select_taluk: 'Select Taluk / Tehsil',
    select_village: 'Village / Hobli',
    select_crop: 'Select Your Primary Crop',
    lang_preference: 'Advisory Language Preference',
    save_continue: 'Save & Continue to Dashboard',
    saving: 'Saving Profile...',
    verified_account: 'Verified Farmer Account',
    edit_details: 'Edit Details',
    return_dashboard: 'Return to Dashboard',
    account_id: 'Account ID',
    custom_village: 'Enter Custom Village...',

    // Footer
    footer_desc: 'Agricultural decision platform integrating machine vision pathology, ICAR crop management practices, and APMC mandi market intelligence for Indian farming communities.',
    footer_sources: 'Advisory Sources',
    footer_features: 'Platform Features',
    diagnostic_notice: 'Diagnostic Notice',
    diagnostic_notice_body: 'Computer vision diagnoses serve as early screening tools. Always verify severe or widespread foliar symptoms with your local Krishi Vigyan Kendra (KVK) officer before applying chemical interventions.'
  },

  Kannada: {
    // Top Bar & Navigation
    precision_agri: 'ಭಾರತೀಯ ಕೃಷಿ ಸಲಹಾ ವ್ಯವಸ್ಥೆ',
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_detect: 'ರೋಗ ಪತ್ತೆ',
    nav_mandi: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    nav_yield: 'ಬೆಳೆ ಇಳುವರಿ',
    nav_community: 'ರೈತ ಸಮುದಾಯ ಎಚ್ಚರಿಕೆ',
    nav_reports: 'ವರದಿಗಳು ಮತ್ತು ಮಾನದಂಡ',
    nav_signin: 'ರೈತರ ಲಾಗಿನ್',
    nav_register: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    nav_signout: 'ನಿರ್ಗಮಿಸಿ',
    nav_profile: 'ಪ್ರೊಫೈಲ್',
    nav_overview: 'ವೇದಿಕೆಯ ಪರಿಚಯ',
    profile_settings: 'ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್',
    edit_farm_details: 'ಕೃಷಿ ವಿವರಗಳನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ',

    // Landing Page
    hero_tag: 'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಅತ್ಯಾಧುನಿಕ ಕೃಷಿ ಸಲಹಾ ವೇದಿಕೆ',
    hero_title: 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚನೆ',
    hero_subtitle: 'ಎಲೆ ರೋಗ ಪತ್ತೆ, ICAR ಶಿಫಾರಸು ಮಾಡಿದ ಪರಿಹಾರಗಳು, 7 ದಿನಗಳ APMC ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಬೆಳೆ ಇಳುವರಿ ಅಂದಾಜು ಒದಗಿಸುವ ಸಮಗ್ರ ವೇದಿಕೆ.',
    cta_create_account: 'ರೈತ ಖಾತೆ ತೆರೆಯಿರಿ',
    cta_signin: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಪ್ರವೇಶಿಸಿ',
    feature_crop_health: 'ಬೆಳೆ ಆರೋಗ್ಯ',
    feature_crop_health_desc: 'ತ್ವರಿತ ಎಲೆ ಫೋಟೋ ತಪಾಸಣೆ',
    feature_scope: 'ಬೆಳೆ ವ್ಯಾಪ್ತಿ',
    feature_scope_desc: 'ICAR ಪ್ರಮಾಣಿತ ಮಾರ್ಗದರ್ಶನ',
    feature_mandi: 'ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚನೆ',
    feature_mandi_desc: 'ಕರ್ನಾಟಕದ APMC ಜಾಲ',
    feature_outbreak: 'ರೋಗ ಹರಡುವಿಕೆ ಎಚ್ಚರಿಕೆ',
    feature_outbreak_desc: 'ಜಿಲ್ಲಾವಾರು ರೈತ ಮಾಹಿತಿ',
    core_modules_title: 'ಪ್ರಮುಖ ಕೃಷಿ ಸೇವೆಗಳು',
    core_modules_subtitle: 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳಿಗೆ ಸೂಕ್ತವಾದ ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ದರಗಳು.',

    // Dashboard
    welcome_farmer: 'ಸ್ವಾಗತ, {name}',
    farm_advisory_for: '{district} ಜಿಲ್ಲೆಯ ಕೃಷಿ ಸಲಹೆ. ಬೆಳೆ ಆರೋಗ್ಯ, ಲೈವ್ ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ಸುಗ್ಗಿ ಇಳುವರಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
    agri_district: 'ಕೃಷಿ ಜಿಲ್ಲೆ',
    primary_crop: 'ಪ್ರಮುಖ ಬೆಳೆ',
    advisory_lang: 'ಸಲಹಾ ಭಾಷೆ',
    not_provided: 'ನೀಡಿಲ್ಲ',
    not_selected: 'ಆರಿಸಲಾಗಿಲ್ಲ',
    crop_health: 'ಬೆಳೆ ಆರೋಗ್ಯ',
    disease_diagnosis: 'ರೋಗ ಪತ್ತೆ ಮತ್ತು ಪರಿಹಾರ',
    disease_diagnosis_desc: 'ಬೆಳೆ ರೋಗಗಳನ್ನು ಗುರುತಿಸಲು ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ನೋಡಿ.',
    launch_scanner: 'ಸ್ಕ್ಯಾನರ್ ಆರಂಭಿಸಿ',
    mandi_rates: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    price_forecasting: 'ದರ ಮುನ್ಸೂಚನೆ',
    price_forecasting_desc: 'ದೈನಂದಿನ APMC ಧಾರಣೆಗಳು ಮತ್ತು ಮುಂದಿನ 7 ದಿನಗಳ ಬೆಲೆ ಏರಿಳಿತಗಳನ್ನು ಕ್ವಿಂಟಾಲ್ ಮತ್ತು ಕೆಜಿ ಲೆಕ್ಕದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.',
    view_prices: 'ಮಾರುಕಟ್ಟೆ ದರ ವೀಕ್ಷಿಸಿ',
    yield_estimation: 'ಇಳುವರಿ ಅಂದಾಜು',
    regional_yield_forecast: 'ಬೆಳೆ ಇಳುವರಿ ಮುನ್ಸೂಚನೆ',
    regional_yield_desc: 'ನಿಮ್ಮ ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ನೀರಾವರಿ ಆಧಾರದ ಮೇಲೆ ಪ್ರತಿ ಎಕರೆ ಇಳುವರಿ ಪ್ರಮಾಣವನ್ನು ಲೆಕ್ಕಹಾಕಿ.',
    forecast_harvest: 'ಇಳುವರಿ ಲೆಕ್ಕಹಾಕಿ',
    community_alerts: 'ಸಮುದಾಯ ಎಚ್ಚರಿಕೆ',
    district_warnings: 'ಜಿಲ್ಲಾ ಮಟ್ಟದ ರೋಗ ಎಚ್ಚರಿಕೆಗಳು',
    community_warnings_desc: 'ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಇತರ ರೈತರು ವರದಿ ಮಾಡಿದ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ನೋಡಿ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.',
    view_alerts: 'ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    regional_crop_intelligence: 'ಪ್ರಾದೇಶಿಕ ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ನಕ್ಷೆ',
    map_title: 'ಕೃಷಿ ನಕ್ಷೆ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಬೆಳೆ ಮಾಹಿತಿ',
    map_desc: 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು, ಇಳುವರಿ ಅಂದಾಜು ಮತ್ತು ಸ್ಥಳೀಯ ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನೋಡಲು ನಕ್ಷೆಯಲ್ಲಿ ಜಿಲ್ಲೆ ಅಥವಾ ತಾಲೂಕನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    select_any_crop: 'ಯಾವುದೇ ಬೆಳೆಯ ಇಳುವರಿ ಅಂದಾಜು ನೋಡಲು ಆಯ್ಕೆಮಾಡಿ',
    all_recommended_crops: 'ಎಲ್ಲಾ ಪ್ರಮುಖ ಬೆಳೆಗಳು',
    expected_crop_yield: 'ನಿರೀಕ್ಷಿತ ಬೆಳೆ ಇಳುವರಿ',
    mandi_benchmark_price: 'ಮಂಡಿ ಬೆಲೆ ಮಾನದಂಡ',
    gross_rev_per_acre: 'ಅಂದಾಜು ಆದಾಯ / ಎಕರೆಗೆ',
    scan_leaf_disease: 'ಎಲೆ ರೋಗ ಪತ್ತೆ',
    mandi_forecasts: 'ಮಂಡಿ ಮುನ್ಸೂಚನೆ',
    optimal_crops_for: 'ಸೂಕ್ತ ಬೆಳೆಗಳು -',
    top_recommended_for: 'ಪ್ರಮುಖ ಶಿಫಾರಸು ಬೆಳೆಗಳು -',
    taluk_level_precision: 'ತಾಲೂಕು ಮಟ್ಟದ ನಿಖರತೆ',
    district_overview: 'ಜಿಲ್ಲಾ ಅವಲೋಕನ',
    soil_profile: 'ಮಣ್ಣಿನ ವಿವರ',
    specialty_label: 'ವಿಶೇಷತೆ',
    ranked_by_fitness: 'ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಶ್ರೇಯಾಂಕ',
    cycle_label: 'ಅವಧಿ',
    target_label: 'ಗುರಿ',
    mandi_label: 'ಮಂಡಿ',
    focus_karnataka: 'ಕರ್ನಾಟಕ',
    all_india: 'ಇಡೀ ಭಾರತ',
    nearest_mandi: 'ಹತ್ತಿರದ APMC ಮಾರುಕಟ್ಟೆ',
    modal_price: 'ಮಾರುಕಟ್ಟೆ ಸರಾಸರಿ ದರ',
    soil_type: 'ಮಣ್ಣಿನ ವಿಧ',
    annual_rainfall: 'ವಾರ್ಷಿಕ ಮಳೆ',
    agro_zone: 'ಕೃಷಿ ಹವಾಮಾನ ವಲಯ',

    // Disease Scanner
    scanner_title: 'ಬೆಳೆ ಎಲೆ ರೋಗ ಪತ್ತೆ ಸ್ಕ್ಯಾನರ್',
    scanner_subtitle: 'AI ರೋಗ ನಿರ್ಣಯಕ್ಕಾಗಿ ಸ್ಪಷ್ಟ ಎಲೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ICAR ಪ್ರಮಾಣಿತ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ.',
    select_crop_label: 'ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    select_crop_sub: 'ಸಕ್ರಿಯ AI ಮಾದರಿ ಮತ್ತು ICAR ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ',
    model_active: 'ದೃಢೀಕೃತ AI ಮಾದರಿ ಸಕ್ರಿಯವಾಗಿದೆ',
    awaiting_model: 'ICAR ಜ್ಞಾನಕೋಶ ಸಕ್ರಿಯವಾಗಿದೆ',
    upload_prompt: 'ಬಾಧಿತ ಎಲೆಯ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    upload_specs: 'JPG, JPEG, PNG, ಅಥವಾ WebP ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 15 MB)',
    choose_photo: 'ಎಲೆಯ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ',
    analyze_leaf: 'AI ರೋಗ ಪತ್ತೆ ಆರಂಭಿಸಿ',
    analyzing: 'ರೋಗ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    reset_image: 'ಬೇರೆ ಫೋಟೋ ಆರಿಸಿ',
    confirmed_pathology: 'ರೋಗ ದೃಢಪಟ್ಟಿದೆ',
    healthy_foliage: 'ಆರೋಗ್ಯಕರ ಬೆಳೆ ಎಲೆ',
    confidence: 'ಮಾದರಿಯ ನಿಖರತೆ',
    symptoms: 'ಗುರುತಿಸಲಾದ ಲಕ್ಷಣಗಳು',
    immediate_action: 'ರೈತರು ತಕ್ಷಣ ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮ',
    treatment: 'ಶಿಫಾರಸು ಮಾಡಿದ ಚಿಕಿತ್ಸೆ (ICAR)',
    favorable_conditions: 'ರೋಗ ಉಲ್ಬಣಕ್ಕೆ ಅನುಕೂಲಕರ ಹವಾಮಾನ',
    when_to_contact: 'KVK ವಿಜ್ಞಾನಿಗಳನ್ನು ಯಾವಾಗ ಸಂಪರ್ಕಿಸಬೇಕು',
    top_probabilities: 'ಪ್ರಮುಖ ರೋಗ ಸಾಧ್ಯತೆಗಳು:',
    unable_to_detect: 'ಎಲೆ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ',
    camera_tip: 'ನಿಖರ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಎಲೆಯ ಹತ್ತಿರದ, ಸ್ಪಷ್ಟ ಬೆಳಕಿನ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
    drop_photo_here: 'ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಹಾಕಿ ಅಥವಾ ಫೈಲ್ ಆರಿಸಿ',
    browse_files: 'ಸಾಧನದಿಂದ ಆರಿಸಿ',

    // Disease Result
    diagnostic_title: 'ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ನಿರ್ವಹಣಾ ಮಾರ್ಗದರ್ಶಿ',
    grounded_reference: 'ಪ್ರಮಾಣಿತ ಕೃಷಿ ಉಲ್ಲೇಖ',
    major_pathologies: 'ಭಾರತೀಯ ಕೃಷಿಯಲ್ಲಿ ಕಂಡುಬರುವ ಪ್ರಮುಖ ರೋಗಗಳು:',
    scientific_name: 'ವೈಜ್ಞಾನಿಕ ಹೆಸರು:',
    conditions: 'ಅನುಕೂಲಕರ ವಾತಾವರಣ:',
    preventive_cultural: 'ನೈಸರ್ಗಿಕ / ಜೈವಿಕ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು:',
    chemical_management: 'ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ (ICAR ಶಿಫಾರಸು):',
    kvk_expert_notice: 'ರೋಗವು ಶೇ.15 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಹರಡಿದರೆ ತಕ್ಷಣ ನಿಮ್ಮ ತಾಲ್ಲೂಕಿನ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK) ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    print_prescription: 'ವರದಿಯನ್ನು ಉಳಿಸಿ / ಪ್ರಿಂಟ್ ಮಾಡಿ',

    // Mandi Price Prediction
    price_title: 'APMC ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮುನ್ಸೂಚನೆ',
    price_subtitle: 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ APMC ಮಾರುಕಟ್ಟೆಗಳ ಲೈವ್ ದರಗಳು ಮತ್ತು ಮುಂದಿನ 7 ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆ.',
    select_market: 'APMC ಮಾರುಕಟ್ಟೆಯನ್ನು ಆರಿಸಿ',
    select_commodity: 'ಕೃಷಿ ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    calculate_forecast: '7 ದಿನಗಳ ಬೆಲೆ ಲೆಕ್ಕಹಾಕಿ',
    forecasting: 'ಬೆಲೆ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...',
    current_modal_rate: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ',
    seven_day_forecast: '7 ದಿನಗಳ ಬೆಲೆ ಮುನ್ನೋಟ',
    price_trend: 'ಬೆಲೆಯ ಪ್ರವೃತ್ತಿ',
    bullish: 'ಏರಿಕೆ (ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆ)',
    bearish: 'ಇಳಿಕೆ (ಕಡಿಮೆಯಾಗುವ ಸಾಧ್ಯತೆ)',
    stable: 'ಸ್ಥಿರ',
    price_per_quintal: '₹/ಕ್ವಿಂಟಾಲ್',
    price_per_kg: '₹/ಕೆ.ಜಿ.',
    market_arrival_insight: 'ಮಾರುಕಟ್ಟೆ ಆವಕ ಮತ್ತು ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ',

    // Yield Prediction
    yield_title: 'ಬೆಳೆ ಇಳುವರಿ ಮುನ್ಸೂಚನಾ ವ್ಯವಸ್ಥೆ',
    yield_subtitle: 'ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಮಣ್ಣು, ಹಂಗಾಮು ಮತ್ತು ನೀರಾವರಿ ಆಧಾರದ ಮೇಲೆ ನಿರೀಕ್ಷಿತ ಇಳುವರಿಯನ್ನು (ಕ್ವಿಂಟಾಲ್/ಹೆಕ್ಟೇರ್) ಲೆಕ್ಕಹಾಕಿ.',
    state_label: 'ರಾಜ್ಯ',
    season_label: 'ಕೃಷಿ ಹಂಗಾಮು',
    field_area_ha: 'ಕೃಷಿ ಭೂಮಿ ವಿಸ್ತೀರ್ಣ (ಹೆಕ್ಟೇರ್‌ಗಳಲ್ಲಿ)',
    soil_type_label: 'ಮಣ್ಣಿನ ವರ್ಗೀಕರಣ',
    irrigation_toggle: 'ನೀರಾವರಿ ಸೌಲಭ್ಯ',
    with_irrigation: 'ಖಾತರಿ ನೀರಾವರಿ (ಕಾಲುವೆ / ಬೋರ್‌ವೆಲ್ / ಹನಿ ನೀರಾವರಿ)',
    rainfed: 'ಮಳೆಯಾಶ್ರಿತ ಕೃಷಿ',
    calculate_yield: 'ಇಳುವರಿ ಪ್ರಮಾಣವನ್ನು ಅಂದಾಜಿಸಿ',
    calculating: 'ಇಳುವರಿ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    projected_yield: 'ನಿರೀಕ್ಷಿತ ಒಟ್ಟು ಉತ್ಪಾದನೆ',
    mean_yield: 'ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ ಸರಾಸರಿ ಇಳುವರಿ',
    estimated_gross_income: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರದಲ್ಲಿ ಅಂದಾಜು ಒಟ್ಟು ಆದಾಯ',

    // Community Alerts
    community_title: 'ರೈತ ಸಮುದಾಯದ ರೋಗ ಎಚ್ಚರಿಕೆಗಳು',
    community_subtitle: 'ರೈತರಿಂದ ಸಂಗ್ರಹಿಸಿದ ರೋಗ ವರದಿಗಳು ಮತ್ತು ICAR ಪರಿಹಾರಗಳು. ನಿಮ್ಮ ಭಾಗದ ಬೆಳೆ ರೋಗಗಳ ಬಗ್ಗೆ ಎಚ್ಚರದಿಂದಿರಿ.',
    active_district_filter: 'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ',
    report_new_outbreak: 'ಹೊಸ ರೋಗ ವರದಿ ಸಲ್ಲಿಸಿ',
    post_observation: 'ಬೆಳೆ ರೋಗ ಲಕ್ಷಣವನ್ನು ವರದಿ ಮಾಡಿ',
    crop_name: 'ಬೆಳೆಯ ಹೆಸರು',
    suspected_disease: 'ಸಂಭಾವ್ಯ ರೋಗ ಅಥವಾ ಲಕ್ಷಣ',
    observation_details: 'ಕ್ಷೇತ್ರ ವೀಕ್ಷಣೆಯ ವಿವರಗಳು',
    submit_report: 'ಎಚ್ಚರಿಕೆ ಪ್ರಕಟಿಸಿ',
    submitting: 'ವರದಿ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    verified_by_icar: 'ICAR ದೃಢೀಕೃತ ಸಲಹೆ',
    farmers_affected: 'ಎಚ್ಚರಿಕೆ ವೀಕ್ಷಿಸುತ್ತಿರುವ ರೈತರು',

    // Reports Page
    reports_title: 'AI ಮಾದರಿ ನಿಖರತೆ ಮತ್ತು ರೈತರ ತಪಾಸಣಾ ಇತಿಹಾಸ',
    reports_subtitle: '14 ಬೆಳೆಗಳ ಮೇಲಿನ ನಿಖರತೆ ಮಾನದಂಡಗಳು ಮತ್ತು ನಿಮ್ಮ ಹಿಂದಿನ ರೋಗ ತಪಾಸಣೆಗಳ ಪಟ್ಟಿ.',
    tab_benchmark: 'ಮಾದರಿಯ ನಿಖರತೆಯ ಮಾನದಂಡಗಳು',
    tab_history: 'ರೋಗ ತಪಾಸಣಾ ಇತಿಹಾಸ',
    test_accuracy: 'ಪರೀಕ್ಷಾ ನಿಖರತೆ',
    precision_metric: 'ನಿಖರತೆ (Precision)',
    recall_metric: 'ಮರುಸ್ಥಾಪನೆ (Recall)',
    f1_metric: 'F1-ಅಂಕ (F1-Score)',
    search_history: 'ಬೆಳೆ ಅಥವಾ ರೋಗದ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ...',
    no_history_found: 'ಯಾವುದೇ ಹಿಂದಿನ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ ಲಭ್ಯವಿಲ್ಲ.',

    // Profile & Setup
    farmer_profile_details: 'ರೈತರ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು',
    full_name: 'ಪೂರ್ಣ ಹೆಸರು',
    active_mobile: 'ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    select_district: 'ನಿಮ್ಮ ಕೃಷಿ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    select_taluk: 'ತಾಲ್ಲೂಕನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    select_village: 'ಗ್ರಾಮ / ಹೋಬಳಿ',
    select_crop: 'ನಿಮ್ಮ ಪ್ರಮುಖ ಬೆಳೆಯನ್ನು ಆರಿಸಿ',
    lang_preference: 'ಸಲಹಾ ಭಾಷೆಯ ಆದ್ಯತೆ',
    save_continue: 'ಉಳಿಸಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ',
    saving: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    verified_account: 'ದೃಢೀಕೃತ ರೈತ ಖಾತೆ',
    edit_details: 'ವಿವರಗಳನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ',
    return_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    account_id: 'ಖಾತೆ ಗುರುತು',
    custom_village: 'ಗ್ರಾಮದ ಹೆಸರು ಬರೆಯಿರಿ...',

    // Footer
    footer_desc: 'ಭಾರತೀಯ ಕೃಷಿ ಸಮುದಾಯಕ್ಕಾಗಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ, ICAR ಪದ್ಧತಿಗಳು ಮತ್ತು APMC ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸುವ ವೇದಿಕೆ.',
    footer_sources: 'ಮಾಹಿತಿ ಮೂಲಗಳು',
    footer_features: 'ವೇದಿಕೆಯ ಸೌಲಭ್ಯಗಳು',
    diagnostic_notice: 'ರೋಗ ನಿರ್ಣಯ ಸೂಚನೆ',
    diagnostic_notice_body: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯು ಪ್ರಾಥಮಿಕ ಪತ್ತೆಗೆ ಸಹಕಾರಿಯಾಗಿದೆ. ರೋಗ ಉಲ್ಬಣಿಸಿದಲ್ಲಿ ಯಾವುದೇ ರಾಸಾಯನಿಕ ಬಳಸುವ ಮುನ್ನ ನಿಮ್ಮ ತಾಲ್ಲೂಕಿನ ಕೃಷಿ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.'
  },

  Hindi: {
    // Top Bar & Navigation
    precision_agri: 'भारतीय परिशुद्ध कृषि प्रणाली',
    nav_dashboard: 'डैशबोर्ड',
    nav_detect: 'रोग पहचान',
    nav_mandi: 'मंडी भाव',
    nav_yield: 'फसल उपज',
    nav_community: 'किसान समुदाय अलर्ट',
    nav_reports: 'रिपोर्ट और मानक',
    nav_signin: 'किसान लॉगिन',
    nav_register: 'खाता बनाएं',
    nav_signout: 'लॉग आउट',
    nav_profile: 'प्रोफाइल',
    nav_overview: 'मंच विवरण',
    profile_settings: 'प्रोफाइल सेटिंग्स',
    edit_farm_details: 'खेत विवरण संपादित करें',

    // Landing Page
    hero_tag: 'भारतीय किसानों के लिए अत्याधुनिक कृषि सलाह मंच',
    hero_title: 'सटीक AI रोग पहचान और 7-दिवसीय मंडी भाव पूर्वानुमान',
    hero_subtitle: 'पत्ती रोग निदान, ICAR प्रमाणित उपचार, 7-दिवसीय APMC मंडी भाव रुझान और स्थानीय फसल उपज अनुमान प्रदान करने वाला व्यापक मंच।',
    cta_create_account: 'किसान खाता बनाएं',
    cta_signin: 'डैशबोर्ड में प्रवेश करें',
    feature_crop_health: 'फसल स्वास्थ्य',
    feature_crop_health_desc: 'तत्काल फोटो निरीक्षण',
    feature_scope: 'फसल दायरा',
    feature_scope_desc: 'ICAR प्रमाणित परामर्श',
    feature_mandi: 'मंडी पूर्वानुमान',
    feature_mandi_desc: 'कर्नाटक APMC नेटवर्क',
    feature_outbreak: 'प्रकोप चेतावनी',
    feature_outbreak_desc: 'जिला स्तर पर किसान अलर्ट',
    core_modules_title: 'मुख्य कृषि सेवाएं',
    core_modules_subtitle: 'कर्नाटक के सभी 31 जिलों के लिए प्रामाणिक कृषि सलाह और बाजार मूल्य।',

    // Dashboard
    welcome_farmer: 'स्वागत है, {name}',
    farm_advisory_for: '{district} जिले के लिए स्थानीय कृषि परामर्श। फसल स्वास्थ्य, लाइव मंडी भाव और मौसमी उपज का आकलन करें।',
    agri_district: 'कृषि जिला',
    primary_crop: 'मुख्य फसल',
    advisory_lang: 'सलाह भाषा',
    not_provided: 'उपलब्ध नहीं',
    not_selected: 'चयनित नहीं',
    crop_health: 'फसल स्वास्थ्य',
    disease_diagnosis: 'रोग निदान',
    disease_diagnosis_desc: 'फसल रोगों की पहचान के लिए पत्ती का फोटो अपलोड करें और अनुशंसित उपचार देखें।',
    launch_scanner: 'स्कैनर शुरू करें',
    mandi_rates: 'मंडी भाव',
    price_forecasting: 'मूल्य पूर्वानुमान',
    price_forecasting_desc: 'दैनिक मंडी भाव और अगले 7 दिनों के मूल्य रुझान प्रति क्विंटल और प्रति किलो देखें।',
    view_prices: 'मंडी भाव देखें',
    yield_estimation: 'उपज अनुमान',
    regional_yield_forecast: 'फसल उपज पूर्वानुमान',
    regional_yield_desc: 'अपनी मिट्टी, मौसम और सिंचाई के आधार पर प्रति हेक्टेयर उत्पादन का सटीक अनुमान लगाएं।',
    forecast_harvest: 'उपज का अनुमान लगाएं',
    community_alerts: 'सामुदायिक अलर्ट',
    district_warnings: 'जिला प्रकोप चेतावनियां',
    community_warnings_desc: 'अपने जिले के अन्य किसानों द्वारा साझा की गई रोग चेतावनियां देखें और सुरक्षा उपाय करें।',
    view_alerts: 'चेतावनियां देखें',
    regional_crop_intelligence: 'क्षेत्रीय कृषि बुद्धिमत्ता और मानचित्र',
    map_title: 'कृषि मानचित्र और क्षेत्रीय फसल सलाह',
    map_desc: 'अनुशंसित फसलें, पैदावार अनुमान और स्थानीय बाजार दरें देखने के लिए मानचित्र पर कोई क्षेत्र या तालुका चुनें।',
    select_any_crop: 'पैदावार देखने के लिए कोई भी फसल चुनें',
    all_recommended_crops: 'सभी प्रमुख फसलें',
    expected_crop_yield: 'अपेक्षित फसल पैदावार',
    mandi_benchmark_price: 'मंडी बेंचमार्क दर',
    gross_rev_per_acre: 'अनुमानित आय / एकड़',
    scan_leaf_disease: 'पत्ती रोग स्कैन करें',
    mandi_forecasts: 'मंडी पूर्वानुमान',
    optimal_crops_for: 'के लिए उपयुक्त फसलें -',
    top_recommended_for: 'शीर्ष अनुशंसित फसलें -',
    taluk_level_precision: 'तालुका स्तर की सटीकता',
    district_overview: 'जिला अवलोकन',
    soil_profile: 'मिट्टी का प्रकार',
    specialty_label: 'विशेषता',
    ranked_by_fitness: 'मिट्टी और जलवायु के आधार पर रैंक',
    cycle_label: 'अवधि',
    target_label: 'लक्ष्य',
    mandi_label: 'मंडी',
    focus_karnataka: 'कर्नाटक',
    all_india: 'संपूर्ण भारत',
    nearest_mandi: 'निकटतम APMC मंडी',
    modal_price: 'मॉडल मंडी दर',
    soil_type: 'मिट्टी का प्रकार',
    annual_rainfall: 'वार्षिक वर्षा',
    agro_zone: 'कृषि-जलवायु क्षेत्र',

    // Disease Scanner
    scanner_title: 'फसल पत्ती रोग पहचान स्कैनर',
    scanner_subtitle: 'AI डायग्नोस्टिक स्कैनिंग के लिए पत्ती का स्पष्ट फोटो अपलोड करें या ICAR प्रमाणित परामर्श देखें।',
    select_crop_label: 'फसल का चयन करें',
    select_crop_sub: 'सक्रिय AI मॉडल और ICAR रोगविज्ञान को नियंत्रित करता है',
    model_active: 'सत्यापित AI मॉडल सक्रिय',
    awaiting_model: 'ICAR ज्ञानकोश सक्रिय',
    upload_prompt: 'प्रभावित पत्ती की स्पष्ट तस्वीर अपलोड करें',
    upload_specs: 'JPG, JPEG, PNG या WebP समर्थित (अधिकतम 15 MB)',
    choose_photo: 'पत्ती का फोटो चुनें',
    analyze_leaf: 'रोग निदान शुरू करें',
    analyzing: 'रोग का विश्लेषण हो रहा है...',
    reset_image: 'दूसरा फोटो चुनें',
    confirmed_pathology: 'पुष्ट रोग निदान',
    healthy_foliage: 'स्वस्थ पत्ती पहचानी गई',
    confidence: 'मॉडल सटीकता',
    symptoms: 'पहचाने गए लक्षण',
    immediate_action: 'किसान द्वारा तत्काल कार्रवाई',
    treatment: 'अनुशंसित उपचार (ICAR)',
    favorable_conditions: 'रोग प्रसार के लिए अनुकूल मौसम',
    when_to_contact: 'KVK विशेषज्ञ से कब संपर्क करें',
    top_probabilities: 'प्रमुख रोग संभावनाएं:',
    unable_to_detect: 'पत्ती पहचानने में असमर्थ',
    camera_tip: 'सटीक परिणाम के लिए अच्छी रोशनी में पत्ती की नजदीकी तस्वीर लें।',
    drop_photo_here: 'तस्वीर यहां खींचकर लाएं या फाइल चुनें',
    browse_files: 'डिवाइस से चुनें',

    // Disease Result
    diagnostic_title: 'रोग निदान और प्रबंधन मार्गदर्शिका',
    grounded_reference: 'प्रमाणित कृषि संदर्भ',
    major_pathologies: 'भारतीय कृषि में पहचाने गए मुख्य रोग:',
    scientific_name: 'वैज्ञानिक नाम:',
    conditions: 'अनुकूल परिस्थितियां:',
    preventive_cultural: 'प्राकृतिक / जैविक नियंत्रण:',
    chemical_management: 'रासायनिक छिड़काव (ICAR अनुशंसित):',
    kvk_expert_notice: 'यदि रोग 15% से अधिक क्षेत्र में फैलता है तो तुरंत स्थानीय कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
    print_prescription: 'परामर्श सहेजें / प्रिंट करें',

    // Mandi Price Prediction
    price_title: 'मंडी बाजार मूल्य पूर्वानुमान',
    price_subtitle: 'कर्नाटक की सभी APMC मंडियों के वास्तविक मूल्य और अगले 7 दिनों के पूर्वानुमानित रुझान।',
    select_market: 'APMC मंडी चुनें',
    select_commodity: 'कृषि वस्तु चुनें',
    calculate_forecast: '7-दिवसीय मूल्य का पूर्वानुमान करें',
    forecasting: 'मूल्य विश्लेषण जारी है...',
    current_modal_rate: 'वर्तमान मंडी भाव',
    seven_day_forecast: '7 दिनों का मूल्य रुझान',
    price_trend: 'अपेक्षित रुझान',
    bullish: 'तेजी (बढ़ने की संभावना)',
    bearish: 'मंदी (घटने की संभावना)',
    stable: 'स्थिर',
    price_per_quintal: '₹/क्विंटल',
    price_per_kg: '₹/किलो',
    market_arrival_insight: 'मंडी आवक और मौसम विश्लेषण',

    // Yield Prediction
    yield_title: 'फसल उपज पूर्वानुमान प्रणाली',
    yield_subtitle: 'अपनी मिट्टी, मौसम और सिंचाई व्यवस्था के आधार पर प्रति हेक्टेयर उत्पादन (क्विंटल/हेक्टेयर) का अनुमान लगाएं।',
    state_label: 'राज्य',
    season_label: 'बुवाई का मौसम',
    field_area_ha: 'खेत का क्षेत्रफल (हेक्टेयर में)',
    soil_type_label: 'मिट्टी का प्रकार',
    irrigation_toggle: 'सिंचाई सुविधा',
    with_irrigation: 'निश्चित सिंचाई (नहर / बोरवेल / ड्रिप)',
    rainfed: 'वर्षा आधारित खेती',
    calculate_yield: 'अनुमानित उपज की गणना करें',
    calculating: 'कृषि मॉडल प्रक्रिया में है...',
    projected_yield: 'अनुमानित कुल उत्पादन',
    mean_yield: 'प्रति हेक्टेयर औसत उपज',
    estimated_gross_income: 'वर्तमान मंडी भाव पर अनुमानित कुल आय',

    // Community Alerts
    community_title: 'किसान समुदाय रोग अलर्ट',
    community_subtitle: 'किसानों द्वारा दर्ज की गई फसलों की बीमारियां और ICAR समाधान। अपने क्षेत्र के प्रकोप से सतर्क रहें।',
    active_district_filter: 'कर्नाटक जिले के अनुसार छांटें',
    report_new_outbreak: 'नई बीमारी की सूचना दें',
    post_observation: 'फसल रोग लक्षण दर्ज करें',
    crop_name: 'फसल का नाम',
    suspected_disease: 'संभावित बीमारी या लक्षण',
    observation_details: 'खेत अवलोकन का विवरण',
    submit_report: 'अलर्ट साझा करें',
    submitting: 'अलर्ट भेजा जा रहा है...',
    verified_by_icar: 'ICAR प्रमाणित सलाह',
    farmers_affected: 'अलर्ट देखने वाले किसान',

    // Reports Page
    reports_title: 'AI मॉडल प्रदर्शन और किसान इतिहास',
    reports_subtitle: '14 प्रमुख फसलों पर AI मॉडल के मूल्यांकन मानक और आपके व्यक्तिगत स्कैन का इतिहास।',
    tab_benchmark: 'मॉडल प्रदर्शन बेंचमार्क',
    tab_history: 'किसान निदान इतिहास',
    test_accuracy: 'परीक्षण सटीकता',
    precision_metric: 'परिशुद्धता (Precision)',
    recall_metric: 'स्मरण दर (Recall)',
    f1_metric: 'F1-स्कोर (F1-Score)',
    search_history: 'फसल या बीमारी के नाम से खोजें...',
    no_history_found: 'इस खाते के लिए कोई पूर्व स्कैन उपलब्ध नहीं है।',

    // Profile & Setup
    farmer_profile_details: 'किसान प्रोफाइल विवरण',
    full_name: 'पूरा नाम',
    active_mobile: 'सक्रिय मोबाइल नंबर',
    select_district: 'अपना कृषि जिला चुनें',
    select_taluk: 'तालुका चुनें',
    select_village: 'गांव / होबली',
    select_crop: 'अपनी मुख्य फसल चुनें',
    lang_preference: 'परामर्श भाषा प्राथमिकता',
    save_continue: 'सहेजें और डैशबोर्ड पर जाएं',
    saving: 'प्रोफाइल सहेजा जा रहा है...',
    verified_account: 'सत्यापित किसान खाता',
    edit_details: 'विवरण संपादित करें',
    return_dashboard: 'डैशबोर्ड पर वापस जाएं',
    account_id: 'खाता आईडी',
    custom_village: 'गांव का नाम लिखें...',

    // Footer
    footer_desc: 'भारतीय कृषि समुदाय के लिए कंप्यूटर विजन, ICAR कार्यप्रणाली और APMC मंडी बुद्धिमत्ता को एकीकृत करने वाला मंच।',
    footer_sources: 'सलाहकार स्रोत',
    footer_features: 'मंच की विशेषताएं',
    diagnostic_notice: 'निदान सूचना',
    diagnostic_notice_body: 'कंप्यूटर विजन निदान प्रारंभिक जांच के लिए है। किसी भी रासायनिक छिड़काव से पहले गंभीर लक्षणों के लिए अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से परामर्श लें।'
  }
};

const LANG_STORAGE_KEY = 'smart_crop_lang';

export const getSavedLanguage = () => {
  try {
    const val = localStorage.getItem(LANG_STORAGE_KEY);
    return val ? normalizeLang(val) : 'English';
  } catch {
    return 'English';
  }
};

export const setSavedLanguage = (lang) => {
  try {
    const normalized = normalizeLang(lang);
    localStorage.setItem(LANG_STORAGE_KEY, normalized);
    window.dispatchEvent(new CustomEvent('app-language-changed', { detail: normalized }));
  } catch (e) {
    console.warn('Failed to save language in localStorage:', e);
  }
};

export const t = (key, lang = null, params = {}) => {
  const activeLang = normalizeLang(lang);
  let text = translations[activeLang]?.[key] || translations.English[key] || key;
  
  // Parameter replacement e.g. {name}, {district}
  if (params && typeof params === 'object') {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal ?? '');
    }
  }
  return text;
};

// React Hook for immediate reactive re-rendering when language toggles
export const useLanguage = () => {
  const [lang, setLang] = useState(() => getSavedLanguage());

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e?.detail) setLang(normalizeLang(e.detail));
    };

    window.addEventListener('app-language-changed', handleLangChange);
    return () => {
      window.removeEventListener('app-language-changed', handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang) => {
    const norm = normalizeLang(newLang);
    setLang(norm);
    setSavedLanguage(norm);
  };

  const translate = (key, params = {}) => t(key, lang, params);

  return { language: lang, setLanguage: changeLanguage, t: translate };
};
