import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { t } from '../lib/i18n';
import {
  Search,
  MapPin,
  Sprout,
  TrendingUp,
  BarChart3,
  Droplets,
  Sun,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Compass,
  Maximize2,
  Filter,
  Check
} from 'lucide-react';
import { searchLocations, getTaluksForDistrict, KARNATAKA_LOCATION_DATA } from '../lib/locationData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Universal All-Crop Agricultural Knowledgebase for Single-Crop Selection in Any Area
const ALL_AVAILABLE_CROPS = [
  { id: 'tomato', name: 'Tomato', sci: 'Solanum lycopersicum', meanQtl: 380, tonnes: 38.0, range: '340 – 430 Qtl/Ha', price: 2400, cycle: '100 - 120 Days', season: 'Kharif & Rabi', suitability: 98, rationale: 'High diurnal temperatures and well-drained loam foster solid fruit firmness and heavy cluster yield.' },
  { id: 'potato', name: 'Potato', sci: 'Solanum tuberosum', meanQtl: 230, tonnes: 23.0, range: '200 – 280 Qtl/Ha', price: 1850, cycle: '80 - 100 Days', season: 'Rabi & Late Kharif', suitability: 94, rationale: 'Friable sandy loam and cool night temperatures enable uniform tuber initiation and rapid bulking.' },
  { id: 'rice', name: 'Rice / Paddy', sci: 'Oryza sativa', meanQtl: 58, tonnes: 5.8, range: '50 – 72 Qtl/Ha', price: 2500, cycle: '120 - 140 Days', season: 'Kharif & Summer', suitability: 96, rationale: 'Canal and alluvial river tracts maintain ideal water depth and microclimate for high tillering.' },
  { id: 'wheat', name: 'Wheat', sci: 'Triticum aestivum', meanQtl: 54, tonnes: 5.4, range: '45 – 65 Qtl/Ha', price: 2425, cycle: '110 - 130 Days', season: 'Rabi', suitability: 93, rationale: 'Cool winter vegetative cycle and clear sunshine during grain filling maximize 1000-grain weight.' },
  { id: 'maize', name: 'Maize', sci: 'Zea mays', meanQtl: 68, tonnes: 6.8, range: '60 – 85 Qtl/Ha', price: 2300, cycle: '105 - 115 Days', season: 'Kharif & Rabi', suitability: 95, rationale: 'Strong photosynthetic solar conversion in well-drained red and black soils produces dense full cobs.' },
  { id: 'cotton', name: 'Cotton', sci: 'Gossypium hirsutum', meanQtl: 26, tonnes: 2.6, range: '20 – 35 Qtl/Ha', price: 7300, cycle: '150 - 165 Days', season: 'Kharif', suitability: 91, rationale: 'Deep vertisols store deep moisture needed for steady boll bursting and superior staple length.' },
  { id: 'sugarcane', name: 'Sugarcane', sci: 'Saccharum officinarum', meanQtl: 1150, tonnes: 115.0, range: '950 – 1350 Qtl/Ha', price: 340, cycle: '300 - 365 Days', season: 'Annual', suitability: 97, rationale: 'High solar insolation and perennial irrigation basin deliver exceptional biomass and high sucrose recovery.' },
  { id: 'groundnut', name: 'Groundnut / Peanut', sci: 'Arachis hypogaea', meanQtl: 22, tonnes: 2.2, range: '18 – 28 Qtl/Ha', price: 6550, cycle: '105 - 120 Days', season: 'Kharif & Rabi', suitability: 90, rationale: 'Friable sandy loam allows easy gynophore (peg) penetration and high oil synthesis.' },
  { id: 'pulses', name: 'Pulses / Red Gram (Tur)', sci: 'Cajanus cajan', meanQtl: 20, tonnes: 2.0, range: '15 – 26 Qtl/Ha', price: 7500, cycle: '130 - 160 Days', season: 'Kharif', suitability: 95, rationale: 'Deep taproot and root nodule nitrogen fixation make it exceptionally drought resilient in black soil.' },
  { id: 'bengal_gram', name: 'Bengal Gram (Chana)', sci: 'Cicer arietinum', meanQtl: 18, tonnes: 1.8, range: '14 – 24 Qtl/Ha', price: 6200, cycle: '85 - 105 Days', season: 'Rabi', suitability: 92, rationale: 'Utilizes residual soil moisture after Kharif harvest with minimal supplemental watering.' },
  { id: 'mustard', name: 'Mustard', sci: 'Brassica juncea', meanQtl: 22, tonnes: 2.2, range: '17 – 27 Qtl/Ha', price: 5650, cycle: '100 - 115 Days', season: 'Rabi', suitability: 88, rationale: 'Thrives under cool, dry winter conditions with high glucosinolate oil concentration.' },
  { id: 'soybean', name: 'Soybean', sci: 'Glycine max', meanQtl: 24, tonnes: 2.4, range: '18 – 30 Qtl/Ha', price: 4850, cycle: '90 - 105 Days', season: 'Kharif', suitability: 91, rationale: 'Short duration oilseed legume with high vegetative vigor in northern transition zones.' },
  { id: 'onion', name: 'Onion', sci: 'Allium cepa', meanQtl: 240, tonnes: 24.0, range: '200 – 300 Qtl/Ha', price: 2250, cycle: '90 - 120 Days', season: 'Kharif & Late Rabi', suitability: 93, rationale: 'High day-night temperature differential promotes dense bulb formation with tight outer scales.' },
  { id: 'chilli', name: 'Chilli (Byadagi / Guntur)', sci: 'Capsicum annuum', meanQtl: 38, tonnes: 3.8, range: '30 – 50 Qtl/Ha', price: 18500, cycle: '140 - 170 Days', season: 'Kharif', suitability: 94, rationale: 'Warm semi-arid harvest conditions preserve high ASTA color units and oleoresin capsaicin.' },
  { id: 'mango', name: 'Mango', sci: 'Mangifera indica', meanQtl: 110, tonnes: 11.0, range: '90 – 130 Qtl/Ha', price: 3600, cycle: 'Perennial', season: 'Summer Harvest', suitability: 93, rationale: 'Dry winter flowering season avoids blossom blight and yields high Brix fruit sweetness.' },
  { id: 'banana', name: 'Banana', sci: 'Musa acuminata', meanQtl: 320, tonnes: 32.0, range: '280 – 380 Qtl/Ha', price: 2800, cycle: '300 - 365 Days', season: 'Year-Round', suitability: 92, rationale: 'Abundant river alluvial soil and tropical humidity promote heavy bunch development and uniform fingers.' },
  { id: 'arecanut', name: 'Arecanut (Supari)', sci: 'Areca catechu', meanQtl: 28, tonnes: 2.8, range: '22 – 35 Qtl/Ha', price: 44500, cycle: 'Perennial', season: 'Post-Monsoon', suitability: 95, rationale: 'Heavy Malnad and coastal precipitation coupled with laterite soil drives prime kernel density.' },
  { id: 'ginger', name: 'Ginger', sci: 'Zingiber officinale', meanQtl: 180, tonnes: 18.0, range: '140 – 220 Qtl/Ha', price: 6500, cycle: '210 - 240 Days', season: 'Kharif Harvest', suitability: 91, rationale: 'Elevated loamy terrain with organic compost mulch prevents rhizome rot and maximizes gingerol.' },
  { id: 'coffee', name: 'Coffee (Arabica / Robusta)', sci: 'Coffea spp.', meanQtl: 15, tonnes: 1.5, range: '12 – 18 Qtl/Ha', price: 18000, cycle: 'Perennial', season: 'Winter Picking', suitability: 94, rationale: 'Shaded canopy rainforests and high elevation generate premium specialty cup acidity and aroma.' },
  { id: 'jute', name: 'Jute', sci: 'Corchorus olitorius', meanQtl: 32, tonnes: 3.2, range: '25 – 38 Qtl/Ha', price: 5050, cycle: '120 - 135 Days', season: 'Annual', suitability: 88, rationale: 'Humid river plains with abundant retting pools produce fine, tensile golden bast fiber.' }
];

// Comprehensive Agricultural Hubs across Karnataka & India with GPS Coordinates
const AGRICULTURAL_HUBS = [
  { id: 'bagalkot', name: 'Bagalkot', state: 'Karnataka', lat: 16.1875, lng: 75.6980, topCrop: 'Sugarcane & Maize', price: '₹335/Qtl', specialty: 'Ghataprabha & Malaprabha River Basin' },
  { id: 'ballari', name: 'Ballari', state: 'Karnataka', lat: 15.1394, lng: 76.9214, topCrop: 'Sona Masuri & Chilli', price: '₹2,550/Qtl', specialty: 'Siruguppa Sona Masuri Bowl' },
  { id: 'belgaum', name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lng: 74.4977, topCrop: 'Sugarcane & Soybean', price: '₹4,850/Qtl', specialty: 'Northern Transition Cane Belt' },
  { id: 'bengaluru_rural', name: 'Bengaluru Rural', state: 'Karnataka', lat: 13.2483, lng: 77.7125, topCrop: 'Tomato & Vegetables', price: '₹2,450/Qtl', specialty: 'Devanahalli Pomelo & Polyhouse Hub' },
  { id: 'bengaluru', name: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lng: 77.5946, topCrop: 'Exotic Vegetables & Flowers', price: '₹2,500/Qtl', specialty: 'High-Demand Metropolitan Hub' },
  { id: 'bidar', name: 'Bidar', state: 'Karnataka', lat: 17.9104, lng: 77.5199, topCrop: 'Red Gram & Soybean', price: '₹9,400/Qtl', specialty: 'North-Eastern Pulse Capital' },
  { id: 'chamarajanagar', name: 'Chamarajanagar', state: 'Karnataka', lat: 11.9261, lng: 76.9437, topCrop: 'Banana & Turmeric', price: '₹3,200/Qtl', specialty: 'Gundlupet Banana & Floriculture' },
  { id: 'chikkaballapura', name: 'Chikkaballapura', state: 'Karnataka', lat: 13.4355, lng: 77.7275, topCrop: 'Tomato & Silk', price: '₹2,380/Qtl', specialty: 'Horticulture & Silk Cocoon Center' },
  { id: 'chikkamagaluru', name: 'Chikkamagaluru', state: 'Karnataka', lat: 13.3161, lng: 75.7720, topCrop: 'Coffee & Black Pepper', price: '₹19,500/Qtl', specialty: 'Coffee Land of Karnataka' },
  { id: 'chitradurga', name: 'Chitradurga', state: 'Karnataka', lat: 14.2251, lng: 76.3980, topCrop: 'Groundnut & Pomegranate', price: '₹6,650/Qtl', specialty: 'Challakere Oil City of Karnataka' },
  { id: 'dakshina_kannada', name: 'Dakshina Kannada', state: 'Karnataka', lat: 12.9141, lng: 74.8560, topCrop: 'Arecanut & Black Pepper', price: '₹44,500/Qtl', specialty: 'CAMPCO Arecanut Headquarters' },
  { id: 'davangere', name: 'Davangere', state: 'Karnataka', lat: 14.4644, lng: 75.9218, topCrop: 'Maize & Cotton', price: '₹2,300/Qtl', specialty: 'Maize Capital of Karnataka' },
  { id: 'dharwad', name: 'Dharwad', state: 'Karnataka', lat: 15.4589, lng: 75.0078, topCrop: 'Cotton & Soybean', price: '₹7,450/Qtl', specialty: 'UAS Dharwad Research Heartland' },
  { id: 'gadag', name: 'Gadag', state: 'Karnataka', lat: 15.4319, lng: 75.6355, topCrop: 'Bengal Gram (Chana)', price: '₹6,200/Qtl', specialty: 'Annigeri Bengal Gram Bowl' },
  { id: 'hassan', name: 'Hassan', state: 'Karnataka', lat: 13.0033, lng: 76.1004, topCrop: 'Potato (230 Qtl/Ha)', price: '₹1,950/Qtl', specialty: 'Karnataka Potato Heartland' },
  { id: 'haveri', name: 'Haveri', state: 'Karnataka', lat: 14.7954, lng: 75.3991, topCrop: 'Byadagi Chilli & Maize', price: '₹28,500/Qtl', specialty: 'GI-Tagged Byadagi Chilli Yard' },
  { id: 'kalaburagi', name: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lng: 76.8343, topCrop: 'Red Gram (GI Kalaburagi Tur)', price: '₹9,650/Qtl', specialty: 'Tur Bowl of Karnataka' },
  { id: 'kodagu', name: 'Kodagu', state: 'Karnataka', lat: 12.4244, lng: 75.7382, topCrop: 'Coorg Coffee & Spices', price: '₹14,200/Qtl', specialty: 'Scotland of India Plantation Belt' },
  { id: 'kolar', name: 'Kolar', state: 'Karnataka', lat: 13.1367, lng: 78.1291, topCrop: 'Tomato (380 Qtl/Ha)', price: '₹2,400/Qtl', specialty: 'Asia’s 2nd Largest Tomato Market' },
  { id: 'koppal', name: 'Koppal', state: 'Karnataka', lat: 15.3524, lng: 76.1557, topCrop: 'Sona Masuri Paddy', price: '₹2,600/Qtl', specialty: 'Gangavathi Rice Mill Capital' },
  { id: 'mandya', name: 'Mandya', state: 'Karnataka', lat: 12.5230, lng: 76.8966, topCrop: 'Sugarcane (1150 Qtl/Ha)', price: '₹340/Qtl', specialty: 'Sugar City of Karnataka' },
  { id: 'mysuru', name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394, topCrop: 'Rice / Paddy (58 Qtl/Ha)', price: '₹2,400/Qtl', specialty: 'Fine Grain Paddy & Banana' },
  { id: 'raichur', name: 'Raichur', state: 'Karnataka', lat: 16.2120, lng: 77.3439, topCrop: 'Sona Masuri & Cotton', price: '₹2,580/Qtl', specialty: 'Krishna-Tungabhadra Doab Granary' },
  { id: 'ramanagara', name: 'Ramanagara', state: 'Karnataka', lat: 12.7209, lng: 77.2799, topCrop: 'Silk Cocoon & Mango', price: '₹4,200/Qtl', specialty: 'Silk City of India' },
  { id: 'shimoga', name: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lng: 75.5681, topCrop: 'Rice & Arecanut', price: '₹2,420/Qtl', specialty: 'Malnad Paddy & Arecanut' },
  { id: 'tumakuru', name: 'Tumakuru', state: 'Karnataka', lat: 13.3392, lng: 77.1017, topCrop: 'Groundnut & Tiptur Copra', price: '₹6,550/Qtl', specialty: 'Tiptur Copra & Oilseeds Hub' },
  { id: 'udupi', name: 'Udupi', state: 'Karnataka', lat: 13.3409, lng: 74.7421, topCrop: 'Coastal Paddy & Coconut', price: '₹2,400/Qtl', specialty: 'Coastal Rice & Fishery Belt' },
  { id: 'uttara_kannada', name: 'Uttara Kannada', state: 'Karnataka', lat: 14.8185, lng: 74.1350, topCrop: 'Sirsi Supari (GI Areca)', price: '₹46,500/Qtl', specialty: 'TSS Sirsi Spices Hub' },
  { id: 'vijayanagara', name: 'Vijayanagara', state: 'Karnataka', lat: 15.2740, lng: 76.3900, topCrop: 'Sugarcane & Banana', price: '₹338/Qtl', specialty: 'Tungabhadra Basin Irrigation Tract' },
  { id: 'vijayapura', name: 'Vijayapura', state: 'Karnataka', lat: 16.8302, lng: 75.7100, topCrop: 'Table Grapes & Raisins', price: '₹21,000/Qtl', specialty: 'Grape & Raisin City of India' },
  { id: 'yadgir', name: 'Yadgir', state: 'Karnataka', lat: 16.7628, lng: 77.1442, topCrop: 'Red Gram & Cotton', price: '₹9,350/Qtl', specialty: 'Upper Krishna Pulse Corridor' },
  { id: 'punjab', name: 'Punjab (National Bench)', state: 'Punjab', lat: 30.9010, lng: 75.8573, topCrop: 'Wheat (54 Qtl/Ha)', price: '₹2,425/Qtl', specialty: 'Granary of India (Khanna Mandi)' },
  { id: 'maharashtra', name: 'Nashik (National Bench)', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, topCrop: 'Onion (240 Qtl/Ha)', price: '₹2,250/Qtl', specialty: 'Lasalgaon Onion Capital' },
  { id: 'andhra_pradesh', name: 'Guntur (National Bench)', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, topCrop: 'Dry Chilli (45 Qtl/Ha)', price: '₹18,500/Qtl', specialty: 'World’s Largest Mirchi Yard' }
];

// Granular GPS Coordinates & Agricultural Metadata for Specific Taluks
const TALUK_COORDINATES = {
  // Kolar Taluks
  'kolar': { lat: 13.1367, lng: 78.1291, district: 'Kolar', specialty: 'Tomato & Vegetables Market' },
  'srinivaspur': { lat: 13.3377, lng: 78.2128, district: 'Kolar', specialty: 'Mango City of Karnataka' },
  'malur': { lat: 13.0033, lng: 77.9406, district: 'Kolar', specialty: 'Carrot & Exotic Vegetables' },
  'mulbagal': { lat: 13.1642, lng: 78.3962, district: 'Kolar', specialty: 'Groundnut & Tomato' },
  'bangarapet': { lat: 12.9861, lng: 78.2014, district: 'Kolar', specialty: 'Finger Millet & Sericulture' },

  // Mandya Taluks
  'mandya': { lat: 12.5230, lng: 76.8966, district: 'Mandya', specialty: 'Sugar City of Karnataka' },
  'maddur': { lat: 12.5843, lng: 77.0450, district: 'Mandya', specialty: 'Asia’s Largest Tender Coconut Market' },
  'pandavapura': { lat: 12.4950, lng: 76.6669, district: 'Mandya', specialty: 'Organic Alemane Jaggery & Cane' },
  'malavalli': { lat: 12.3869, lng: 77.0543, district: 'Mandya', specialty: 'Fine Paddy & Mulberry Silk' },
  'srirangapatna': { lat: 12.4238, lng: 76.6830, district: 'Mandya', specialty: 'Kaveri Basin Cane & Banana' },
  'krishnarajpet (k.r. pet)': { lat: 12.6631, lng: 76.4912, district: 'Mandya', specialty: 'Sugarcane & Silk' },
  'k.r. pet': { lat: 12.6631, lng: 76.4912, district: 'Mandya', specialty: 'Sugarcane & Silk' },
  'nagamangala': { lat: 12.8197, lng: 76.7578, district: 'Mandya', specialty: 'Ragi & Dairy Belt' },

  // Mysuru Taluks
  'mysuru': { lat: 12.2958, lng: 76.6394, district: 'Mysuru', specialty: 'Fine Grain Paddy & Vegetables' },
  'nanjangud': { lat: 12.1197, lng: 76.6806, district: 'Mysuru', specialty: 'GI-Tagged Nanjangud Rasabale Banana' },
  'hunsur': { lat: 12.3086, lng: 76.2917, district: 'Mysuru', specialty: 'High-Value Ginger & Hybrid Maize' },
  'piriyapatna': { lat: 12.3411, lng: 76.0967, district: 'Mysuru', specialty: 'FCV Tobacco & Spices' },
  't. narasipura': { lat: 12.2131, lng: 76.9022, district: 'Mysuru', specialty: 'Triveni Sangama Silt Paddy' },
  't narasipura': { lat: 12.2131, lng: 76.9022, district: 'Mysuru', specialty: 'Triveni Sangama Silt Paddy' },
  'h.d. kote': { lat: 11.9867, lng: 76.3267, district: 'Mysuru', specialty: 'Cotton & Pulses' },
  'k.r. nagar': { lat: 12.5828, lng: 76.3861, district: 'Mysuru', specialty: 'Paddy & Sugarcane' },

  // Hassan Taluks
  'hassan': { lat: 13.0033, lng: 76.1004, district: 'Hassan', specialty: 'Potato Heartland & Maize' },
  'sakleshpur': { lat: 12.9439, lng: 75.7878, district: 'Hassan', specialty: 'Shade-Grown Coffee, Pepper & Cardamom' },
  'channarayapatna': { lat: 12.9056, lng: 76.3892, district: 'Hassan', specialty: 'Cold Storage Potato & Coconut' },
  'belur': { lat: 13.1650, lng: 75.8606, district: 'Hassan', specialty: 'Coffee & Kharif Potato' },
  'arsikere': { lat: 13.3139, lng: 76.2575, district: 'Hassan', specialty: 'Coconut, Copra & Oilseeds Market' },
  'holenarasipura': { lat: 12.7889, lng: 76.2417, district: 'Hassan', specialty: 'Hemavathi Basin Sugarcane & Paddy' },
  'alur': { lat: 12.9861, lng: 75.9861, district: 'Hassan', specialty: 'Coffee & Maize' },
  'arkalgud': { lat: 12.7667, lng: 76.0611, district: 'Hassan', specialty: 'Paddy & Tobacco' },

  // Tumakuru Taluks
  'tumakuru': { lat: 13.3392, lng: 77.1017, district: 'Tumakuru', specialty: 'Groundnut, Pulses & Oilseeds' },
  'tiptur': { lat: 13.2625, lng: 76.4789, district: 'Tumakuru', specialty: 'GI-Tagged Tiptur Ball Copra' },
  'madhugiri': { lat: 13.6622, lng: 77.2106, district: 'Tumakuru', specialty: 'High-Oil Groundnut & Pomegranate' },
  'sira': { lat: 13.7439, lng: 76.9067, district: 'Tumakuru', specialty: 'Groundnut, Castor & Sesame' },
  'kunigal': { lat: 13.0242, lng: 77.0319, district: 'Tumakuru', specialty: 'Ragi & Dairy Fodder' },
  'gubbi': { lat: 13.3106, lng: 76.9367, district: 'Tumakuru', specialty: 'Arecanut & Coconut' },
  'koratagere': { lat: 13.5244, lng: 77.2347, district: 'Tumakuru', specialty: 'Groundnut & Ragi' },
  'pavagada': { lat: 14.1000, lng: 77.2800, district: 'Tumakuru', specialty: 'Drought-Tolerant Groundnut' },
  'chikkanayakanahalli': { lat: 13.4189, lng: 76.6189, district: 'Tumakuru', specialty: 'Coconut & Copra' },
  'turuvekere': { lat: 13.1606, lng: 76.6669, district: 'Tumakuru', specialty: 'Coconut & Pulses' },

  // Ballari Taluks
  'ballari': { lat: 15.1394, lng: 76.9214, district: 'Ballari', specialty: 'Cotton & Chilli Trading Yard' },
  'siruguppa': { lat: 15.6333, lng: 76.8967, district: 'Ballari', specialty: 'Rice Bowl of Karnataka (Sona Masuri)' },
  'sandur': { lat: 15.0833, lng: 76.5500, district: 'Ballari', specialty: 'Bt Cotton & Bengal Gram' },
  'kampli': { lat: 15.4000, lng: 76.6000, district: 'Ballari', specialty: 'Tungabhadra Sugarcane & Banana' },

  // Shivamogga Taluks
  'shivamogga': { lat: 13.9299, lng: 75.5681, district: 'Shivamogga', specialty: 'Malnad Paddy & Arecanut' },
  'thirthahalli': { lat: 13.6833, lng: 75.2333, district: 'Shivamogga', specialty: 'Asia’s Finest Arecanut (Rashi) & Pepper' },
  'sagar': { lat: 14.1667, lng: 75.0333, district: 'Shivamogga', specialty: 'Arecanut, Spices & Organic Paddy' },
  'shikaripura': { lat: 14.2667, lng: 75.3500, district: 'Shivamogga', specialty: 'Anjanapura Paddy & Maize Granary' },
  'bhadravati': { lat: 13.8400, lng: 75.7000, district: 'Shivamogga', specialty: 'Bhadra Basin Sugarcane & Paddy' },
  'soraba': { lat: 14.3833, lng: 75.1000, district: 'Shivamogga', specialty: 'Paddy & Arecanut' },
  'hosanagara': { lat: 13.9167, lng: 75.0667, district: 'Shivamogga', specialty: 'Heavy Rainfall Malnad Spices' },

  // Belagavi Taluks
  'belagavi': { lat: 15.8497, lng: 74.4977, district: 'Belagavi', specialty: 'Northern Cane Belt & Soybean' },
  'chikkodi': { lat: 16.4300, lng: 74.5900, district: 'Belagavi', specialty: 'High Sugar Recovery Cane & Nipani Tobacco' },
  'athani': { lat: 16.7333, lng: 75.0667, district: 'Belagavi', specialty: 'Krishna Valley Table Grapes & Raisins' },
  'gokak': { lat: 16.1667, lng: 74.8333, district: 'Belagavi', specialty: 'Ghataprabha Sugarcane & Maize' },
  'bailhongal': { lat: 15.8167, lng: 74.8667, district: 'Belagavi', specialty: 'Soybean & Cotton' },
  'hukkeri': { lat: 16.2333, lng: 74.6000, district: 'Belagavi', specialty: 'Sugarcane & Groundnut' },
  'raibag': { lat: 16.4833, lng: 74.7833, district: 'Belagavi', specialty: 'Sugarcane & Maize' },
  'khanapur': { lat: 15.6333, lng: 74.5167, district: 'Belagavi', specialty: 'Rainfed Paddy & Forestry' },

  // Davangere Taluks
  'davangere': { lat: 14.4644, lng: 75.9218, district: 'Davangere', specialty: 'Maize Capital of Karnataka' },
  'channagiri': { lat: 14.0267, lng: 75.9272, district: 'Davangere', specialty: 'Shanti Sagara Arecanut Capital' },
  'harihara': { lat: 14.5125, lng: 75.8036, district: 'Davangere', specialty: 'Tungabhadra Maize & Paddy' },
  'honnali': { lat: 14.2464, lng: 75.6425, district: 'Davangere', specialty: 'Paddy & Maize' },
  'jagalur': { lat: 14.5208, lng: 76.3458, district: 'Davangere', specialty: 'Rainfed Cotton & Groundnut' },

  // Chikkaballapura Taluks
  'chikkaballapura': { lat: 13.4355, lng: 77.7275, district: 'Chikkaballapura', specialty: 'Tomato & Silk Center' },
  'chintamani': { lat: 13.4000, lng: 78.0500, district: 'Chikkaballapura', specialty: 'Famous Groundnut Roast & Tomato APMC' },
  'gauribidanur': { lat: 13.6167, lng: 77.5167, district: 'Chikkaballapura', specialty: 'Hybrid Maize & Marigold Floriculture' },
  'sidlaghatta': { lat: 13.3833, lng: 77.8667, district: 'Chikkaballapura', specialty: 'Govt Silk Cocoon Market' },
  'bagepalli': { lat: 13.7833, lng: 77.7833, district: 'Chikkaballapura', specialty: 'Groundnut & Ragi' },
  'gudibanda': { lat: 13.6667, lng: 77.7000, district: 'Chikkaballapura', specialty: 'Dryland Oilseeds' },

  // Bengaluru Taluks
  'devanahalli': { lat: 13.2483, lng: 77.7125, district: 'Bengaluru Rural', specialty: 'GI-Tagged Devanahalli Pomelo & Grapes' },
  'anekal': { lat: 12.7106, lng: 77.6978, district: 'Bengaluru Urban', specialty: 'High-Tech Polyhouse Capsicum & Cut Roses' },
  'hosakote': { lat: 13.0697, lng: 77.7981, district: 'Bengaluru Rural', specialty: 'Vegetables & Poultry' },
  'doddaballapura': { lat: 13.2928, lng: 77.5422, district: 'Bengaluru Rural', specialty: 'Maize & Silk' },
  'nelamangala': { lat: 13.0978, lng: 77.3917, district: 'Bengaluru Rural', specialty: 'Vegetables & Fodder' },

  // Haveri & Gadag
  'byadgi': { lat: 14.6800, lng: 75.4800, district: 'Haveri', specialty: 'GI-Tagged Byadagi Red Chilli Capital' },
  'ranebennur': { lat: 14.6200, lng: 75.6200, district: 'Haveri', specialty: 'Global Hybrid Seed Valley' },
  'gadag': { lat: 15.4319, lng: 75.6355, district: 'Gadag', specialty: 'Bengal Gram (Chana) & Cotton' },
  'annigeri': { lat: 15.4300, lng: 75.4300, district: 'Dharwad', specialty: 'Ancestral Annigeri-1 Chickpea Hub' },
  'ron': { lat: 15.7000, lng: 75.7333, district: 'Gadag', specialty: 'Jowar & Sunflower' },

  // Raichur & Koppal
  'sindhanur': { lat: 15.7800, lng: 76.7600, district: 'Raichur', specialty: 'Tungabhadra Modern Paddy Basin' },
  'manvi': { lat: 15.9800, lng: 77.0500, district: 'Raichur', specialty: 'Cotton & Groundnut' },
  'gangavathi': { lat: 15.4300, lng: 76.5300, district: 'Koppal', specialty: 'Rice Bowl of Karnataka (Sona Masuri)' },
  'kushtagi': { lat: 15.7500, lng: 76.2000, district: 'Koppal', specialty: 'Pomegranate & Groundnut' },

  // Bagalkot & Vijayapura
  'jamkhandi': { lat: 16.5000, lng: 75.3000, district: 'Bagalkot', specialty: 'Krishna Basin Sugarcane & Weaving' },
  'badami': { lat: 15.9180, lng: 75.6760, district: 'Bagalkot', specialty: 'Heritage Pulses & Maize' },
  'indi': { lat: 17.1700, lng: 75.9600, district: 'Vijayapura', specialty: 'Lime (Nimbe) & Pomegranate' },
  'basavana bagewadi': { lat: 16.5800, lng: 75.9700, district: 'Vijayapura', specialty: 'Basavana Bagewadi Red Onion' },
  'tikota': { lat: 16.8500, lng: 75.5200, district: 'Vijayapura', specialty: 'Premium Table Grapes & Raisins' },

  // Kalaburagi, Bidar & Yadgir
  'aland': { lat: 17.5600, lng: 76.5700, district: 'Kalaburagi', specialty: 'Black Soil Pigeon Pea (Tur)' },
  'sedam': { lat: 17.1800, lng: 77.2800, district: 'Kalaburagi', specialty: 'Limestone Belt Red Gram & Jowar' },
  'basavakalyan': { lat: 17.8700, lng: 76.9500, district: 'Bidar', specialty: 'Soybean & Bengal Gram' },
  'humnabad': { lat: 17.7700, lng: 77.1300, district: 'Bidar', specialty: 'Ginger, Tur & Sugarcane' },
  'shahapur': { lat: 16.7000, lng: 76.8400, district: 'Yadgir', specialty: 'UKP Canal Paddy & Cotton' },
  'surpur': { lat: 16.5200, lng: 76.7600, district: 'Yadgir', specialty: 'Red Gram & Groundnut' },

  // Coastal & Malnad
  'puttur': { lat: 12.7667, lng: 75.2000, district: 'Dakshina Kannada', specialty: 'CAMPCO Arecanut & Cocoa' },
  'belthangady': { lat: 13.0000, lng: 75.2600, district: 'Dakshina Kannada', specialty: 'Spices, Rubber & Arecanut' },
  'kundapura': { lat: 13.6300, lng: 74.6900, district: 'Udupi', specialty: 'Coastal Rice & Coconut' },
  'karkala': { lat: 13.2100, lng: 74.9900, district: 'Udupi', specialty: 'Cashew, Coconut & Paddy' },
  'sirsi': { lat: 14.6200, lng: 74.8500, district: 'Uttara Kannada', specialty: 'GI-Tagged Sirsi Supari & Vanilla' },
  'kumta': { lat: 14.4200, lng: 74.4200, district: 'Uttara Kannada', specialty: 'Coastal Spices & Betel Leaf' },
  'madikeri': { lat: 12.4244, lng: 75.7382, district: 'Kodagu', specialty: 'Coorg Arabica Coffee & Pepper' },
  'virajpet': { lat: 12.2000, lng: 75.8000, district: 'Kodagu', specialty: 'Robusta Coffee & Cardamom' },

  // Southern & Central
  'chamarajanagar': { lat: 11.9261, lng: 76.9437, district: 'Chamarajanagar', specialty: 'Banana & Silk' },
  'gundlupet': { lat: 11.8000, lng: 76.6900, district: 'Chamarajanagar', specialty: 'Marigold Floriculture & Potato' },
  'kollegal': { lat: 12.1500, lng: 77.1200, district: 'Chamarajanagar', specialty: 'Kaveri Basin Turmeric & Sugarcane' },
  'challakere': { lat: 14.3100, lng: 76.6500, district: 'Chitradurga', specialty: 'Oil City Groundnut & Sunflower' },
  'hiriyur': { lat: 13.9500, lng: 76.6200, district: 'Chitradurga', specialty: 'Vani Vilasa Sagar Coconut & Pomegranate' },
  'kadur': { lat: 13.5500, lng: 76.0100, district: 'Chikkamagaluru', specialty: 'Onion, Coconut & Pulses' },
  'mudigere': { lat: 13.1300, lng: 75.6400, district: 'Chikkamagaluru', specialty: 'Rainforest Coffee & Cardamom' },
  'hosapete (hospet)': { lat: 15.2740, lng: 76.3900, district: 'Vijayanagara', specialty: 'Tungabhadra Sugarcane & Banana' },
  'harapanahalli': { lat: 14.8000, lng: 75.9800, district: 'Vijayanagara', specialty: 'Maize & Cotton' },
  'channapatna': { lat: 12.6500, lng: 77.2000, district: 'Ramanagara', specialty: 'Silk Cocoon & Mango' },
  'kanakapura': { lat: 12.5500, lng: 77.4200, district: 'Ramanagara', specialty: 'Ragi, Mulberry & Dairy' }
};

export const IndiaAgriculturalMap = ({ defaultArea = 'Kolar' }) => {
  const { language } = useAuth();
  const currentLang = language || 'English';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState(defaultArea);
  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [advisoryData, setAdvisoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dynamically calculate displayed crops based on user selection
  const displayCrops = useMemo(() => {
    if (!advisoryData) return [];
    if (selectedCropFilter === 'ALL') {
      return advisoryData.recommended_crops || [];
    }

    // 1. Check if selected crop exists in area's recommended crops
    const found = (advisoryData.recommended_crops || []).find((c) =>
      c.crop_id?.toLowerCase() === selectedCropFilter.toLowerCase() ||
      c.crop_name?.toLowerCase().includes(selectedCropFilter.toLowerCase()) ||
      selectedCropFilter.toLowerCase().includes(c.crop_id?.toLowerCase())
    );
    if (found) return [found];

    // 2. Otherwise dynamically synthesize from ALL_AVAILABLE_CROPS
    const meta = ALL_AVAILABLE_CROPS.find((c) => c.id === selectedCropFilter);
    if (!meta) return advisoryData.recommended_crops || [];

    return [{
      crop_id: meta.id,
      crop_name: meta.name,
      scientific_name: meta.sci,
      suitability_score: Math.max(82, Math.min(95, meta.suitability - (advisoryData.soil_type?.toLowerCase().includes('black') && meta.id === 'groundnut' ? 8 : 0))),
      suitability_level: 'Cultivable with Management',
      why_suitable: `${meta.rationale} Calibrated for ${advisoryData.soil_type || 'local soils'} in ${advisoryData.area_name}.`,
      projected_yield: {
        mean_yield_qtl_ha: meta.meanQtl,
        mean_yield_tonnes_ha: meta.tonnes,
        yield_range: meta.range,
        historical_district_avg: `${Math.round(meta.meanQtl * 0.9)} Qtl/Ha`,
        growth_duration_days: meta.cycle,
        best_season: meta.season
      },
      mandi_price: {
        commodity: meta.name,
        modal_price_qtl: meta.price,
        modal_price_kg: +(meta.price / 100).toFixed(1),
        price_range_qtl: `₹${Math.round(meta.price * 0.88).toLocaleString()} – ₹${Math.round(meta.price * 1.12).toLocaleString()}`,
        market_name: advisoryData.nearest_mandi || `${advisoryData.district} APMC`,
        trend_direction: 'bullish',
        trend_pct: '+4.5% expected',
        estimated_gross_revenue_per_acre: `₹${Math.round((meta.meanQtl * meta.price) / 2.471).toLocaleString()}`
      },
      icar_guidelines: `Follow ICAR & State Agricultural University package of practices for ${meta.name} cultivation in ${advisoryData.district}.`
    }];
  }, [advisoryData, selectedCropFilter]);

  // 1. Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Find default center
      const defaultHub = AGRICULTURAL_HUBS.find(h => h.name.toLowerCase() === defaultArea.toLowerCase()) || AGRICULTURAL_HUBS[0];

      const map = L.map(mapContainerRef.current, {
        center: [defaultHub.lat, defaultHub.lng],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      // Free, authentic OpenStreetMap tiles with NO API KEY required
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add custom styled zoom controls top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map click anywhere -> find closest hub or taluk
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        let closest = null;
        let minDist = 999999;

        // Check taluks first for hyper-local precision
        Object.entries(TALUK_COORDINATES).forEach(([tKey, tData]) => {
          const d = Math.pow(tData.lat - lat, 2) + Math.pow(tData.lng - lng, 2);
          if (d < minDist) {
            minDist = d;
            closest = { type: 'taluk', name: tKey, district: tData.district };
          }
        });

        if (closest && minDist < 0.2) {
          handleSelectArea({ taluk: closest.name, district: closest.district });
          return;
        }

        AGRICULTURAL_HUBS.forEach(hub => {
          const d = Math.pow(hub.lat - lat, 2) + Math.pow(hub.lng - lng, 2);
          if (d < minDist) {
            minDist = d;
            closest = { type: 'hub', name: hub.name };
          }
        });

        if (closest) {
          handleSelectArea(closest.name);
        }
      });
    }

    // Force map to adapt to container layout
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render / Update Leaflet Markers for Hubs & Specific Taluks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // 2.1 Render Primary Regional Hub Markers
    AGRICULTURAL_HUBS.forEach(hub => {
      const isSelected = !advisoryData?.is_taluk && (
        selectedArea.toLowerCase().includes(hub.name.toLowerCase()) ||
        hub.name.toLowerCase().includes(selectedArea.toLowerCase())
      );

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelected ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: rgba(27, 67, 42, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: ${isSelected ? '26px' : '20px'}; height: ${isSelected ? '26px' : '20px'}; border-radius: 9999px; background-color: ${isSelected ? '#1b432a' : '#2e7d47'}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
              <div style="width: 7px; height: 7px; border-radius: 9999px; background-color: #ffffff;"></div>
            </div>
            <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 4px; white-space: nowrap; font-size: 11px; font-weight: 700; color: ${isSelected ? '#142618' : '#2e3a30'}; background: rgba(255,255,255,0.95); padding: 2px 7px; border-radius: 6px; border: 1.5px solid ${isSelected ? '#1b432a' : '#d6cfc3'}; box-shadow: 0 2px 4px rgba(0,0,0,0.12); pointer-events: none; z-index: ${isSelected ? 50 : 10};">
              ${hub.name}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([hub.lat, hub.lng], { icon: customIcon }).addTo(map);

      marker.bindTooltip(`
        <div style="padding: 2px; font-family: sans-serif; font-size: 11px;">
          <strong style="color: #1b432a; font-size: 12px; display: block; margin-bottom: 2px;">${hub.name}, ${hub.state}</strong>
          <div>Crop: <strong>${hub.topCrop}</strong></div>
          <div>Mandi: <strong style="color: #15803d;">${hub.price}</strong></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${hub.specialty}</div>
        </div>
      `, { offset: [0, -14], direction: 'top' });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        handleSelectArea(hub.name);
      });

      markersRef.current[`hub_${hub.id}`] = marker;
    });

    // 2.2 Render Granular Taluk Pins for Active District
    const activeDist = advisoryData?.district || 'Kolar';
    const taluksInDistrict = getTaluksForDistrict(activeDist);

    taluksInDistrict.forEach(tlkName => {
      const normTlk = tlkName.toLowerCase();
      const coord = TALUK_COORDINATES[normTlk];
      if (!coord) return;

      const isTalukSelected = advisoryData?.is_taluk && (
        selectedArea.toLowerCase().includes(normTlk) ||
        (advisoryData.taluk && advisoryData.taluk.toLowerCase() === normTlk)
      );

      const talukIcon = L.divIcon({
        className: 'custom-taluk-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isTalukSelected ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: rgba(22, 163, 74, 0.45); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: ${isTalukSelected ? '22px' : '15px'}; height: ${isTalukSelected ? '22px' : '15px'}; border-radius: 9999px; background-color: ${isTalukSelected ? '#16a34a' : '#22c55e'}; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
              <div style="width: 5px; height: 5px; border-radius: 9999px; background-color: #ffffff;"></div>
            </div>
            <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 3px; white-space: nowrap; font-size: 10px; font-weight: 700; color: ${isTalukSelected ? '#14532d' : '#1e3a24'}; background: ${isTalukSelected ? '#f0fdf4' : 'rgba(255,255,255,0.95)'}; padding: 1.5px 6px; border-radius: 5px; border: 1.5px solid ${isTalukSelected ? '#16a34a' : '#86efac'}; box-shadow: 0 1px 3px rgba(0,0,0,0.15); pointer-events: none; z-index: ${isTalukSelected ? 60 : 20};">
              📍 ${tlkName}
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const talukMarker = L.marker([coord.lat, coord.lng], { icon: talukIcon }).addTo(map);

      talukMarker.bindTooltip(`
        <div style="padding: 2px; font-family: sans-serif; font-size: 11px;">
          <strong style="color: #166534; font-size: 12px; display: block; margin-bottom: 2px;">📍 ${tlkName} Taluk (${activeDist})</strong>
          <div>Specialty: <strong>${coord.specialty || 'Commercial Cropping'}</strong></div>
          <div style="color: #15803d; font-weight: 600; margin-top: 2px;">Click for Taluk-Specific Advisory &rarr;</div>
        </div>
      `, { offset: [0, -12], direction: 'top' });

      talukMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        handleSelectArea({ taluk: tlkName, district: activeDist, name: tlkName });
      });

      markersRef.current[`taluk_${normTlk}`] = talukMarker;
    });
  }, [selectedArea, advisoryData]);

  // 3. Fetch Regional / Taluk Crop Advisory from Backend
  useEffect(() => {
    const fetchAreaAdvisory = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE_URL}/api/regional-advisory?area=${encodeURIComponent(selectedArea)}`);
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setAdvisoryData(json.data);
        } else {
          setError('Unable to load advisory for selected area.');
        }
      } catch (err) {
        console.warn('Regional advisory fetch error:', err);
        setError('Network error fetching regional agricultural intelligence.');
      } finally {
        setLoading(false);
      }
    };

    fetchAreaAdvisory();
  }, [selectedArea]);

  // Handle live search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      const results = searchLocations(val);
      const quickMatches = AGRICULTURAL_HUBS.filter(p =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        p.state.toLowerCase().includes(val.toLowerCase()) ||
        p.topCrop.toLowerCase().includes(val.toLowerCase())
      ).map(p => ({ type: 'Region', name: p.name, district: p.name, state: p.state }));

      const combined = [...quickMatches, ...results];
      const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
      setSuggestions(unique.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectArea = (target) => {
    let raw = '';
    let targetTaluk = '';
    let targetDistrict = '';

    if (typeof target === 'string') {
      raw = target;
    } else if (target && typeof target === 'object') {
      targetTaluk = target.taluk || '';
      targetDistrict = target.district || '';
      raw = target.taluk ? `${target.taluk} (${target.district || ''})` : (target.district || target.name || '');
    }

    // Extract core name e.g. "Srinivaspur (Kolar)" -> "Srinivaspur"
    let clean = raw;
    const m = raw.match(/^([^(,]+)/);
    if (m && m[1].trim()) {
      clean = m[1].trim();
    }

    const finalQuery = targetTaluk || clean || raw;
    setSelectedArea(finalQuery);
    setSearchQuery('');
    setShowSuggestions(false);

    // Zoom and fly to coordinates: check taluks first, then hubs
    const norm = finalQuery.toLowerCase().trim();
    const talukCoord = TALUK_COORDINATES[norm] || Object.entries(TALUK_COORDINATES).find(([k]) => norm.includes(k) || k.includes(norm))?.[1];

    if (talukCoord && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([talukCoord.lat, talukCoord.lng], 10, {
        duration: 1.2,
        easeLinearity: 0.25
      });
      return;
    }

    const hub = AGRICULTURAL_HUBS.find(h =>
      h.name.toLowerCase().includes(norm) ||
      norm.includes(h.name.toLowerCase()) ||
      (h.state && norm.includes(h.state.toLowerCase()))
    );

    if (hub && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hub.lat, hub.lng], 8, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  };

  // Quick zoom buttons
  const handleResetIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.0, 79.0], 5, { duration: 1.2 });
    }
  };

  const handleFocusKarnataka = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([14.2, 76.2], 7, { duration: 1.2 });
    }
  };

  const activeDistrict = advisoryData?.district || 'Kolar';
  const availableTaluks = getTaluksForDistrict(activeDistrict);

  return (
    <div className="bg-white rounded-2xl border border-[#e4dfd5] shadow-xs overflow-hidden">
      
      {/* Top Banner & Search Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-[#f7f5ef] to-white border-b border-[#e4dfd5]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#142618] tracking-tight">
              {t('map_title', currentLang)}
            </h2>
            <p className="text-xs sm:text-sm text-[#526055] mt-1 max-w-2xl">
              {t('map_desc', currentLang)}
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6b7c70] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search District, Taluk, or State..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#d6cfc3] bg-white text-xs text-[#1a2e1d] font-medium placeholder:text-[#88968d] focus:outline-none focus:ring-2 focus:ring-[#1b432a] shadow-xs"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#e4dfd5] shadow-lg overflow-hidden divide-y divide-[#f0ece2]">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectArea(item);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectArea(item);
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-[#f5f2ea] flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${item.type === 'Taluk' ? 'text-[#16a34a]' : 'text-[#1b432a]'}`} />
                      <span className="font-semibold text-[#1a2e1d]">{item.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${item.type === 'Taluk' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#eef5ee] text-[#1b432a]'}`}>
                      {item.type || 'District'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Filter Chips for Major Hubs */}
        <div className="mt-4 pt-3 border-t border-[#e4dfd5] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-semibold text-[#6b7c70] uppercase tracking-wider shrink-0">
            Districts / States:
          </span>
          {AGRICULTURAL_HUBS.map((loc) => {
            const isActive = !advisoryData?.is_taluk && selectedArea.toLowerCase().includes(loc.name.toLowerCase());
            return (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleSelectArea(loc.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1b432a] text-white shadow-xs scale-105'
                    : 'bg-[#faf8f5] hover:bg-[#ede8dc] text-[#2d3a2f] border border-[#d6cfc3]'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Granular Taluk Precision Selector Sub-Bar */}
        {availableTaluks.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-[#f0ece2] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-[#15803d] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Taluks in {activeDistrict}:</span>
            </span>

            {/* All District Option */}
            <button
              type="button"
              onClick={() => handleSelectArea(activeDistrict)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !advisoryData?.is_taluk
                  ? 'bg-[#1b432a] text-white shadow-2xs font-bold'
                  : 'bg-[#faf8f5] hover:bg-[#ede8dc] text-[#526055] border border-[#d6cfc3]'
              }`}
            >
              All {activeDistrict} ({t('district_overview', currentLang)})
            </button>

            {/* Individual Taluk Buttons */}
            {availableTaluks.map((tlk) => {
              const isTalukActive = advisoryData?.is_taluk && (
                selectedArea.toLowerCase().includes(tlk.toLowerCase()) ||
                (advisoryData.taluk && advisoryData.taluk.toLowerCase() === tlk.toLowerCase())
              );

              return (
                <button
                  key={tlk}
                  type="button"
                  onClick={() => handleSelectArea({ taluk: tlk, district: activeDistrict, name: tlk })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    isTalukActive
                      ? 'bg-[#16a34a] text-white shadow-xs font-bold ring-2 ring-[#16a34a]/30 scale-105'
                      : 'bg-white hover:bg-[#f0fdf4] text-[#1a2e1d] border border-[#d6cfc3] hover:border-[#16a34a]'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isTalukActive ? 'text-white' : 'text-[#16a34a]'}`} />
                  <span>{tlk}</span>
                  {isTalukActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Leaflet Map (Left) + Detailed Area Intelligence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#e4dfd5]">
        
        {/* Left Column: Interactive Leaflet Map (5 Cols) */}
        <div className="lg:col-span-5 p-5 bg-[#faf8f5] flex flex-col justify-between relative">
          
          <div className="flex items-center justify-between mb-2.5 text-xs text-[#526055]">
            <span className="font-semibold text-[#1a2e1d] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#1b432a]" />
              Live Interactive Map • {advisoryData?.is_taluk ? `Zoomed in: ${advisoryData.taluk}` : activeDistrict}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFocusKarnataka}
                className="px-2 py-0.5 rounded bg-white border border-[#d6cfc3] hover:bg-[#f5f2ea] text-[11px] font-semibold text-[#1a2e1d] transition-colors cursor-pointer"
                title="Focus Karnataka"
              >
                {t('focus_karnataka', currentLang)}
              </button>
              <button
                type="button"
                onClick={handleResetIndia}
                className="px-2 py-0.5 rounded bg-white border border-[#d6cfc3] hover:bg-[#f5f2ea] text-[11px] font-semibold text-[#1a2e1d] transition-colors cursor-pointer"
                title="Show all India"
              >
                {t('all_india', currentLang)}
              </button>
            </div>
          </div>

          {/* Real Leaflet Map Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] sm:h-[480px] rounded-xl border border-[#e4dfd5] shadow-inner overflow-hidden relative z-10"
            style={{ background: '#e5e7eb' }}
          />

          {/* Regional Climate Badge */}
          {advisoryData && (
            <div className="w-full mt-3 p-3.5 rounded-xl bg-white border border-[#e4dfd5] text-xs text-[#2d3a2f] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[#1b432a] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" />
                  <span>{advisoryData.agro_climatic_zone}</span>
                </span>
                <span className="text-[11px] text-[#6b7c70]">{advisoryData.annual_rainfall_mm} mm/yr</span>
              </div>
              <p className="text-[11px] text-[#526055] leading-relaxed">
                {advisoryData.climate_summary}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Crop Suitability, Yield & Price Advisory (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          
          {loading && (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#1b432a] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#526055] font-medium">
                Synthesizing agro-climatic crop suitability and Mandi forecasts for {selectedArea}...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && advisoryData && (
            <div className="space-y-6">
              
              {/* Selected Area Overview Card */}
              <div className="p-5 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-[#1a2e1d]">
                      {advisoryData.area_name}
                    </h3>
                    {advisoryData.is_taluk ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                        <span>{t('taluk_level_precision', currentLang)}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#eef5ee] text-[#1b432a] text-[11px] font-semibold">
                        {t('district_overview', currentLang)}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#d6cfc3] text-[#526055] text-[11px] font-medium">
                      {advisoryData.district} • {advisoryData.state}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#526055] mt-1.5">
                    {t('soil_profile', currentLang)}: <strong className="text-[#1a2e1d]">{advisoryData.soil_type}</strong>
                  </p>

                  {advisoryData.specialty && (
                    <div className="mt-2 text-xs font-medium text-[#1b432a] bg-[#eef5ee] border border-[#cbe2ce] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                      <span><strong>{t('specialty_label', currentLang)}:</strong> {advisoryData.specialty}</span>
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-[#526055] shrink-0">
                  <div className="flex items-center gap-1.5 sm:justify-end text-[#1b432a] font-semibold">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{t('annual_rainfall', currentLang)}: {advisoryData.annual_rainfall_mm} mm</span>
                  </div>
                  <span className="text-[11px] text-[#6b7c70] block mt-0.5">
                    {t('nearest_mandi', currentLang)}: <strong className="text-[#142618]">{advisoryData.nearest_mandi}</strong>
                  </span>
                </div>
              </div>

              {/* Crop Selection Bar for Any Crop in Selected Area */}
              <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#e4dfd5] space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#142618]">
                    <Filter className="w-4 h-4 text-[#1b432a]" />
                    <span>{t('select_any_crop', currentLang)} {advisoryData.area_name}:</span>
                  </div>

                  {/* Dropdown for All 20 Crops */}
                  <div className="relative">
                    <select
                      value={selectedCropFilter}
                      onChange={(e) => setSelectedCropFilter(e.target.value)}
                      className="w-full sm:w-auto pl-3 pr-8 py-1.5 rounded-lg bg-white border border-[#d6cfc3] text-[#1a2e1d] font-bold text-xs focus:ring-2 focus:ring-[#1b432a] focus:outline-none shadow-2xs cursor-pointer"
                    >
                      <option value="ALL">⭐ {t('all_recommended_crops', currentLang)} ({advisoryData.recommended_crops?.length || 0})</option>
                      <optgroup label="Select Specific Crop to Forecast">
                        {ALL_AVAILABLE_CROPS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.season})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Quick 1-Click Interactive Crop Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setSelectedCropFilter('ALL')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCropFilter === 'ALL'
                        ? 'bg-[#1b432a] text-white shadow-2xs font-bold'
                        : 'bg-white hover:bg-[#ede8dc] text-[#526055] border border-[#d6cfc3]'
                    }`}
                  >
                    ⭐ {t('all_recommended_crops', currentLang)}
                  </button>

                  {ALL_AVAILABLE_CROPS.map((c) => {
                    const isCropActive = selectedCropFilter === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCropFilter(c.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                          isCropActive
                            ? 'bg-[#16a34a] text-white shadow-xs font-bold scale-105'
                            : 'bg-white hover:bg-[#f0fdf4] text-[#1a2e1d] border border-[#d6cfc3] hover:border-[#16a34a]'
                        }`}
                      >
                        {isCropActive && <Check className="w-3 h-3 text-white" />}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crop Yield Cards Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-[#1b432a]" />
                    <h4 className="font-serif font-bold text-base text-[#142618]">
                      {selectedCropFilter !== 'ALL'
                        ? `Crop Yield & Market Forecast: ${displayCrops[0]?.crop_name} in ${advisoryData.area_name}`
                        : (advisoryData.is_taluk
                            ? `${t('optimal_crops_for', currentLang)} ${advisoryData.taluk || advisoryData.area_name}`
                            : `${t('top_recommended_for', currentLang)} ${advisoryData.area_name}`)}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCropFilter !== 'ALL' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCropFilter('ALL')}
                        className="text-xs font-bold text-[#1b432a] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>&larr; {t('all_recommended_crops', currentLang)}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#6b7c70] font-medium">
                        {t('ranked_by_fitness', currentLang)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {displayCrops.map((crop, idx) => (
                    <div
                      key={crop.crop_id || idx}
                      className="p-5 rounded-xl bg-white border border-[#e4dfd5] hover:border-[#1b432a] transition-all shadow-xs space-y-4"
                    >
                      {/* Crop Title & Suitability Badge */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#f0ece2] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#eef5ee] text-[#1b432a] text-xs font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <h5 className="font-serif font-bold text-base text-[#1a2e1d]">
                              {crop.crop_name}
                            </h5>
                          </div>
                          <span className="text-[11px] italic text-[#6b7c70]">
                            {crop.scientific_name}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{crop.suitability_score}% Match • {crop.suitability_level}</span>
                        </div>
                      </div>

                      {/* Agronomic Suitability Rationale */}
                      <p className="text-xs text-[#435446] leading-relaxed">
                        {crop.why_suitable}
                      </p>

                      {/* Dual Metric Cards: Expected Yield & Mandi APMC Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        
                        {/* Yield Card */}
                        <div className="p-3.5 rounded-lg bg-[#faf8f5] border border-[#e4dfd5] space-y-1">
                          <div className="flex items-center justify-between text-xs text-[#526055]">
                            <span className="font-semibold flex items-center gap-1">
                              <BarChart3 className="w-3.5 h-3.5 text-[#1b432a]" />
                              {t('expected_crop_yield', currentLang)}
                            </span>
                            <span className="text-[10px] text-[#6b7c70]">{crop.projected_yield?.best_season}</span>
                          </div>

                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-lg font-bold text-[#142618]">
                              {crop.projected_yield?.mean_yield_qtl_ha} Qtl/Ha
                            </span>
                            <span className="text-xs text-[#6b7c70]">
                              ({crop.projected_yield?.mean_yield_tonnes_ha} Tonnes/Ha)
                            </span>
                          </div>

                          <div className="text-[11px] text-[#526055] flex justify-between pt-1">
                            <span>{t('cycle_label', currentLang)}: {crop.projected_yield?.growth_duration_days}</span>
                            <span>{t('target_label', currentLang)}: {crop.projected_yield?.yield_range}</span>
                          </div>
                        </div>

                        {/* Mandi Price Card */}
                        <div className="p-3.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] space-y-1">
                          <div className="flex items-center justify-between text-xs text-[#166534]">
                            <span className="font-semibold flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {t('mandi_benchmark_price', currentLang)}
                            </span>
                            <span className="text-[10px] font-bold text-[#15803d]">
                              {crop.mandi_price?.trend_pct}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-lg font-bold text-[#143823]">
                              ₹{crop.mandi_price?.modal_price_qtl} / Qtl
                            </span>
                            <span className="text-xs text-[#6b7c70]">
                              (₹{crop.mandi_price?.modal_price_kg} / kg)
                            </span>
                          </div>

                          <div className="text-[11px] text-[#526055] flex justify-between pt-1">
                            <span>{t('mandi_label', currentLang)}: {crop.mandi_price?.market_name}</span>
                            <span>{t('gross_rev_per_acre', currentLang)}: {crop.mandi_price?.estimated_gross_revenue_per_acre}</span>
                          </div>
                        </div>

                      </div>

                      {/* Action Links */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-[11px] text-[#6b7c70] italic">
                          ICAR Tip: {crop.icar_guidelines}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            to="/detect"
                            className="px-3 py-1.5 rounded-md bg-[#eef5ee] hover:bg-[#dcecdc] text-[#1b432a] font-semibold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>{t('scan_leaf_disease', currentLang)}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <Link
                            to="/price-prediction"
                            className="px-3 py-1.5 rounded-md bg-white border border-[#d6cfc3] hover:bg-[#f5f2ea] text-[#1a2e1d] font-semibold text-xs transition-colors"
                          >
                            {t('mandi_forecasts', currentLang)}
                          </Link>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
