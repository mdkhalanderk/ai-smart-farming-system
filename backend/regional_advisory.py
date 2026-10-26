"""
Regional Agricultural Advisory & Area Intelligence Service.
Provides agro-climatic crop suitability, projected yield, and live Mandi market intelligence
for all Karnataka districts/taluks and major agricultural states across India.
"""

from typing import Dict, Any, List, Optional
import re

# Comprehensive Regional Agro-Climatic Intelligence Knowledgebase
REGIONAL_DATA: Dict[str, Dict[str, Any]] = {
    "kolar": {
        "area_name": "Kolar",
        "state": "Karnataka",
        "district": "Kolar",
        "taluks": ["Kolar", "Bangarapet", "Malur", "Mulbagal", "Srinivaspur"],
        "agro_climatic_zone": "Eastern Dry Zone (Zone-5)",
        "soil_type": "Red Sandy Loam & Gravelly Clay Loam (Well Drained)",
        "annual_rainfall_mm": 744,
        "climate_summary": "Semi-arid with moderate temperatures, dry winters, and high solar radiation ideal for horticulture.",
        "nearest_mandi": "Kolar APMC (Asia's Second Largest Tomato Market)",
        "coordinates": {"lat": 13.1367, "lng": 78.1291},
        "recommended_crops": [
            {
                "crop_id": "tomato",
                "crop_name": "Tomato",
                "scientific_name": "Solanum lycopersicum",
                "suitability_score": 98,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "High diurnal temperature variation and red sandy loam soil produce high fruit firmness and disease resilience.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 380,
                    "mean_yield_tonnes_ha": 38.0,
                    "yield_range": "340 – 430 Qtl/Ha",
                    "historical_district_avg": "320 Qtl/Ha",
                    "growth_duration_days": "100 - 120 Days",
                    "best_season": "Kharif & Rabi (Round the Year with Drip)"
                },
                "mandi_price": {
                    "commodity": "Tomato",
                    "modal_price_qtl": 2400,
                    "modal_price_kg": 24.0,
                    "price_range_qtl": "₹2,100 – ₹2,800",
                    "market_name": "Kolar APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.2% expected (7-day APMC arrival forecast)",
                    "estimated_gross_revenue_per_acre": "₹2,20,000 – ₹2,90,000"
                },
                "icar_guidelines": "Mulching recommended; monitor for Early Blight and TSWV during monsoon."
            },
            {
                "crop_id": "mango",
                "crop_name": "Mango (Totapuri / Alphonso)",
                "scientific_name": "Mangifera indica",
                "suitability_score": 94,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Srinivaspur in Kolar is the 'Mango City' of Karnataka with optimal dry flowering weather.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 110,
                    "mean_yield_tonnes_ha": 11.0,
                    "yield_range": "90 – 130 Qtl/Ha",
                    "historical_district_avg": "95 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Apr-Jun)",
                    "best_season": "Summer Harvest"
                },
                "mandi_price": {
                    "commodity": "Mango",
                    "modal_price_qtl": 3600,
                    "modal_price_kg": 36.0,
                    "price_range_qtl": "₹3,000 – ₹4,200",
                    "market_name": "Srinivaspur Fruit Market",
                    "trend_direction": "stable",
                    "trend_pct": "+3.0%",
                    "estimated_gross_revenue_per_acre": "₹1,40,000 – ₹1,90,000"
                },
                "icar_guidelines": "Prune post-harvest; spray recommended micronutrients during fruit set."
            },
            {
                "crop_id": "potato",
                "crop_name": "Potato",
                "scientific_name": "Solanum tuberosum",
                "suitability_score": 91,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Light loose red soils allow uniform tuber expansion without soil compaction.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 210,
                    "mean_yield_tonnes_ha": 21.0,
                    "yield_range": "180 – 240 Qtl/Ha",
                    "historical_district_avg": "175 Qtl/Ha",
                    "growth_duration_days": "80 - 95 Days",
                    "best_season": "Kharif & Late Rabi"
                },
                "mandi_price": {
                    "commodity": "Potato",
                    "modal_price_qtl": 1850,
                    "modal_price_kg": 18.5,
                    "price_range_qtl": "₹1,600 – ₹2,100",
                    "market_name": "Bengaluru / Malur APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.5%",
                    "estimated_gross_revenue_per_acre": "₹1,30,000 – ₹1,75,000"
                },
                "icar_guidelines": "Ensure certified seed tubers to prevent bacterial wilt and late blight."
            },
            {
                "crop_id": "groundnut",
                "crop_name": "Groundnut / Peanut",
                "scientific_name": "Arachis hypogaea",
                "suitability_score": 87,
                "suitability_level": "Favorable",
                "why_suitable": "Tolerates dry spells; pegging is effortless in friable sandy loam.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 22,
                    "mean_yield_tonnes_ha": 2.2,
                    "yield_range": "18 – 26 Qtl/Ha",
                    "historical_district_avg": "19 Qtl/Ha",
                    "growth_duration_days": "105 - 115 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Groundnut",
                    "modal_price_qtl": 6400,
                    "modal_price_kg": 64.0,
                    "price_range_qtl": "₹5,900 – ₹6,900",
                    "market_name": "Kolar APMC",
                    "trend_direction": "stable",
                    "trend_pct": "+1.8%",
                    "estimated_gross_revenue_per_acre": "₹52,000 – ₹70,000"
                },
                "icar_guidelines": "Apply gypsum at 45 days after sowing to ensure complete pod filling."
            }
        ]
    },
    "mandya": {
        "area_name": "Mandya",
        "state": "Karnataka",
        "district": "Mandya",
        "taluks": ["Mandya", "Maddur", "Malavalli", "Pandavapura", "Srirangapatna", "K.R. Pet", "Nagamangala"],
        "agro_climatic_zone": "Southern Dry Zone (Zone-6)",
        "soil_type": "Rich Red Loamy & Alluvial Canal Irrigated Soil",
        "annual_rainfall_mm": 780,
        "climate_summary": "Extensive perennial irrigation via Cauvery & KRS canal system; moderate tropical climate.",
        "nearest_mandi": "Mandya APMC (Major Jaggery & Rice Trading Hub)",
        "coordinates": {"lat": 12.5230, "lng": 76.8966},
        "recommended_crops": [
            {
                "crop_id": "sugarcane",
                "crop_name": "Sugarcane",
                "scientific_name": "Saccharum officinarum",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Mandya is Karnataka's 'Sugar Bowl'. Abundant canal irrigation and high solar heat unit accumulation.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 1150,
                    "mean_yield_tonnes_ha": 115.0,
                    "yield_range": "1000 – 1300 Qtl/Ha",
                    "historical_district_avg": "1050 Qtl/Ha",
                    "growth_duration_days": "360 - 400 Days",
                    "best_season": "Adsali & Eksali Plantations"
                },
                "mandi_price": {
                    "commodity": "Sugarcane (FRP / Mill Rate)",
                    "modal_price_qtl": 340,
                    "modal_price_kg": 3.4,
                    "price_range_qtl": "₹320 – ₹360 (per quintal mill gate)",
                    "market_name": "MySugar / Mandya Sugar Mills",
                    "trend_direction": "stable",
                    "trend_pct": "State FRP Protected",
                    "estimated_gross_revenue_per_acre": "₹1,35,000 – ₹1,80,000"
                },
                "icar_guidelines": "Adopt trash mulching and drip fertigation to conserve canal water."
            },
            {
                "crop_id": "rice",
                "crop_name": "Rice / Paddy (Sona Masuri / Jyothi)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 96,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Continuous canal discharge and nutrient-rich alluvial deposits create record paddy yields.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 62,
                    "mean_yield_tonnes_ha": 6.2,
                    "yield_range": "55 – 70 Qtl/Ha",
                    "historical_district_avg": "52 Qtl/Ha",
                    "growth_duration_days": "125 - 135 Days",
                    "best_season": "Kharif & Summer"
                },
                "mandi_price": {
                    "commodity": "Paddy (Common / Grade A)",
                    "modal_price_qtl": 2350,
                    "modal_price_kg": 23.5,
                    "price_range_qtl": "₹2,183 (MSP) – ₹2,550",
                    "market_name": "Mandya APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.1%",
                    "estimated_gross_revenue_per_acre": "₹60,000 – ₹78,000"
                },
                "icar_guidelines": "Maintain water depth of 2-5 cm during tillering; check for stem borer and blast."
            },
            {
                "crop_id": "banana",
                "crop_name": "Banana (Yelakki / Grand Naine)",
                "scientific_name": "Musa acuminata",
                "suitability_score": 92,
                "suitability_level": "Highly Suitable",
                "why_suitable": "High organic matter and consistent moisture availability support vigorous vegetative biomass.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 480,
                    "mean_yield_tonnes_ha": 48.0,
                    "yield_range": "420 – 540 Qtl/Ha",
                    "historical_district_avg": "400 Qtl/Ha",
                    "growth_duration_days": "300 - 330 Days",
                    "best_season": "Year-round planting"
                },
                "mandi_price": {
                    "commodity": "Banana (Yelakki)",
                    "modal_price_qtl": 3100,
                    "modal_price_kg": 31.0,
                    "price_range_qtl": "₹2,600 – ₹3,700",
                    "market_name": "Bengaluru / Maddur Market",
                    "trend_direction": "bullish",
                    "trend_pct": "+7.5%",
                    "estimated_gross_revenue_per_acre": "₹1,70,000 – ₹2,40,000"
                },
                "icar_guidelines": "Protect bunches with polypropylene sleeves; de-sucker regularly."
            }
        ]
    },
    "mysuru": {
        "area_name": "Mysuru (Mysore)",
        "state": "Karnataka",
        "district": "Mysuru",
        "taluks": ["Mysuru", "Nanjangud", "T. Narasipura", "Hunsur", "Piriyapatna", "H.D. Kote", "K.R. Nagar"],
        "agro_climatic_zone": "Southern Transition Zone (Zone-7)",
        "soil_type": "Deep Red Loam & Black Clay Pockets",
        "annual_rainfall_mm": 800,
        "climate_summary": "Favorable sub-humid to semi-arid transition with dual monsoons and high soil depth.",
        "nearest_mandi": "Bandipalya APMC, Mysuru",
        "coordinates": {"lat": 12.2958, "lng": 76.6394},
        "recommended_crops": [
            {
                "crop_id": "rice",
                "crop_name": "Rice / Paddy",
                "scientific_name": "Oryza sativa",
                "suitability_score": 95,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Kabini & Cauvery river basins furnish rich silty bottomlands ideal for aromatic and fine grain rice.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 58,
                    "mean_yield_tonnes_ha": 5.8,
                    "yield_range": "50 – 66 Qtl/Ha",
                    "historical_district_avg": "48 Qtl/Ha",
                    "growth_duration_days": "130 - 140 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Rice / Paddy",
                    "modal_price_qtl": 2400,
                    "modal_price_kg": 24.0,
                    "price_range_qtl": "₹2,200 – ₹2,600",
                    "market_name": "Bandipalya APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+3.8%",
                    "estimated_gross_revenue_per_acre": "₹58,000 – ₹74,000"
                },
                "icar_guidelines": "Use SRI method to reduce seed rate and increase tillers."
            },
            {
                "crop_id": "pulses",
                "crop_name": "Pulses (Horsegram / Chickpea / Cowpea)",
                "scientific_name": "Cicer arietinum / Vigna unguiculata",
                "suitability_score": 91,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Nanjangud and H.D. Kote soils have natural nitrogen-fixing rhizobium density and good moisture holding capacity.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 15,
                    "mean_yield_tonnes_ha": 1.5,
                    "yield_range": "12 – 18 Qtl/Ha",
                    "historical_district_avg": "12 Qtl/Ha",
                    "growth_duration_days": "85 - 100 Days",
                    "best_season": "Rabi / Post-monsoon"
                },
                "mandi_price": {
                    "commodity": "Bengal Gram / Pulses",
                    "modal_price_qtl": 6100,
                    "modal_price_kg": 61.0,
                    "price_range_qtl": "₹5,600 – ₹6,700",
                    "market_name": "Nanjangud APMC",
                    "trend_direction": "stable",
                    "trend_pct": "+2.4%",
                    "estimated_gross_revenue_per_acre": "₹38,000 – ₹52,000"
                },
                "icar_guidelines": "Seed treatment with Rhizobium and Trichoderma is highly recommended."
            },
            {
                "crop_id": "cotton",
                "crop_name": "Cotton",
                "scientific_name": "Gossypium hirsutum",
                "suitability_score": 88,
                "suitability_level": "Favorable",
                "why_suitable": "Hunsur and H.D. Kote black loam soils support deep tap root development with high boll retention.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 24,
                    "mean_yield_tonnes_ha": 2.4,
                    "yield_range": "20 – 28 Qtl/Ha",
                    "historical_district_avg": "19 Qtl/Ha",
                    "growth_duration_days": "150 - 170 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Cotton (Medium Staple)",
                    "modal_price_qtl": 7150,
                    "modal_price_kg": 71.5,
                    "price_range_qtl": "₹6,700 – ₹7,600",
                    "market_name": "Mysuru / Hunsur APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.1%",
                    "estimated_gross_revenue_per_acre": "₹70,000 – ₹95,000"
                },
                "icar_guidelines": "Install pheromone traps early for pink bollworm monitoring."
            }
        ]
    },
    "bengaluru": {
        "area_name": "Bengaluru (Urban & Rural)",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "taluks": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Nelamangala", "Devanahalli", "Doddaballapura", "Hosakote"],
        "agro_climatic_zone": "Eastern Dry Zone (Zone-5)",
        "soil_type": "Red Sandy Loam with High Organic Amendments",
        "annual_rainfall_mm": 920,
        "climate_summary": "Equable pleasant climate, proximity to massive urban consumer demand and Yeshwanthpur APMC.",
        "nearest_mandi": "Yeshwanthpur APMC & Binny Mill Flower/Fruit Market",
        "coordinates": {"lat": 12.9716, "lng": 77.5946},
        "recommended_crops": [
            {
                "crop_id": "tomato",
                "crop_name": "Tomato (High Yield Hybrid)",
                "scientific_name": "Solanum lycopersicum",
                "suitability_score": 96,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "High market proximity minimizes post-harvest transit losses and secures premium daily retail pricing.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 390,
                    "mean_yield_tonnes_ha": 39.0,
                    "yield_range": "350 – 440 Qtl/Ha",
                    "historical_district_avg": "330 Qtl/Ha",
                    "growth_duration_days": "100 - 115 Days",
                    "best_season": "Year-round in polyhouse/drip"
                },
                "mandi_price": {
                    "commodity": "Tomato",
                    "modal_price_qtl": 2500,
                    "modal_price_kg": 25.0,
                    "price_range_qtl": "₹2,200 – ₹2,900",
                    "market_name": "Yeshwanthpur APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.8%",
                    "estimated_gross_revenue_per_acre": "₹2,40,000 – ₹3,20,000"
                },
                "icar_guidelines": "Deploy yellow sticky traps for whitefly management."
            },
            {
                "crop_id": "onion",
                "crop_name": "Onion (Bellary / Nashik Red)",
                "scientific_name": "Allium cepa",
                "suitability_score": 90,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Well-drained sandy loam in Hosakote and Nelamangala prevents bulb rot.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 180,
                    "mean_yield_tonnes_ha": 18.0,
                    "yield_range": "150 – 210 Qtl/Ha",
                    "historical_district_avg": "145 Qtl/Ha",
                    "growth_duration_days": "110 - 125 Days",
                    "best_season": "Late Kharif / Rabi"
                },
                "mandi_price": {
                    "commodity": "Onion",
                    "modal_price_qtl": 2100,
                    "modal_price_kg": 21.0,
                    "price_range_qtl": "₹1,800 – ₹2,400",
                    "market_name": "Yeshwanthpur APMC",
                    "trend_direction": "stable",
                    "trend_pct": "+2.1%",
                    "estimated_gross_revenue_per_acre": "₹1,20,000 – ₹1,65,000"
                },
                "icar_guidelines": "Withhold irrigation 10 days before harvest to improve curing and shelf life."
            }
        ]
    },
    "belgaum": {
        "area_name": "Belagavi (Belgaum)",
        "state": "Karnataka",
        "district": "Belagavi",
        "taluks": ["Belagavi", "Gokak", "Chikkodi", "Athani", "Bailhongal", "Hukkeri", "Ramdurg", "Saundatti", "Raibag", "Khanapur"],
        "agro_climatic_zone": "Northern Transition & Hilly Zone (Zone-8/9)",
        "soil_type": "Deep Black Clayey Soil (Vertisol) & Laterite Loam",
        "annual_rainfall_mm": 1150,
        "climate_summary": "Vast perennial water from Ghataprabha & Malaprabha rivers; rich black cotton soils.",
        "nearest_mandi": "Belagavi APMC & Gokak Cotton Market",
        "coordinates": {"lat": 15.8497, "lng": 74.4977},
        "recommended_crops": [
            {
                "crop_id": "sugarcane",
                "crop_name": "Sugarcane (Co 86032 / Co 0238)",
                "scientific_name": "Saccharum officinarum",
                "suitability_score": 98,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Largest sugarcane producing district in Karnataka. Deep black soils retain high water and nutrients.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 1200,
                    "mean_yield_tonnes_ha": 120.0,
                    "yield_range": "1050 – 1350 Qtl/Ha",
                    "historical_district_avg": "1100 Qtl/Ha",
                    "growth_duration_days": "360 - 380 Days",
                    "best_season": "October - February Planting"
                },
                "mandi_price": {
                    "commodity": "Sugarcane",
                    "modal_price_qtl": 345,
                    "modal_price_kg": 3.45,
                    "price_range_qtl": "₹325 – ₹365",
                    "market_name": "Belagavi Sugar Cooperative Mills",
                    "trend_direction": "stable",
                    "trend_pct": "State SAP Benchmark",
                    "estimated_gross_revenue_per_acre": "₹1,45,000 – ₹1,95,000"
                },
                "icar_guidelines": "Apply potash at tillering for higher sucrose recovery."
            },
            {
                "crop_id": "soybean",
                "crop_name": "Soybean (JS 335 / DSb 21)",
                "scientific_name": "Glycine max",
                "suitability_score": 93,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Black cotton soils and heavy southwest monsoon furnish perfect conditions for high protein oilseeds.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 26,
                    "mean_yield_tonnes_ha": 2.6,
                    "yield_range": "22 – 30 Qtl/Ha",
                    "historical_district_avg": "21 Qtl/Ha",
                    "growth_duration_days": "90 - 100 Days",
                    "best_season": "Kharif (June - July sowing)"
                },
                "mandi_price": {
                    "commodity": "Soybean (Yellow)",
                    "modal_price_qtl": 4850,
                    "modal_price_kg": 48.5,
                    "price_range_qtl": "₹4,500 – ₹5,200",
                    "market_name": "Bailhongal / Belagavi APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.3%",
                    "estimated_gross_revenue_per_acre": "₹50,000 – ₹68,000"
                },
                "icar_guidelines": "Inoculate seed with Bradyrhizobium japonicum prior to sowing."
            },
            {
                "crop_id": "maize",
                "crop_name": "Maize / Corn",
                "scientific_name": "Zea mays",
                "suitability_score": 90,
                "suitability_level": "Highly Suitable",
                "why_suitable": "High solar radiation with well-timed precipitation delivers vigorous cob development.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 65,
                    "mean_yield_tonnes_ha": 6.5,
                    "yield_range": "55 – 75 Qtl/Ha",
                    "historical_district_avg": "52 Qtl/Ha",
                    "growth_duration_days": "100 - 115 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Maize (Hybrid)",
                    "modal_price_qtl": 2250,
                    "modal_price_kg": 22.5,
                    "price_range_qtl": "₹2,090 (MSP) – ₹2,400",
                    "market_name": "Gokak APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+3.7%",
                    "estimated_gross_revenue_per_acre": "₹58,000 – ₹76,000"
                },
                "icar_guidelines": "Scout for Fall Armyworm (FAW) whorl feeding at 15–30 days."
            }
        ]
    },
    "davangere": {
        "area_name": "Davangere",
        "state": "Karnataka",
        "district": "Davangere",
        "taluks": ["Davangere", "Harihara", "Honnali", "Channagiri", "Jagalur"],
        "agro_climatic_zone": "Central Dry Zone (Zone-4)",
        "soil_type": "Medium Black Soil & Red Sandy Soil",
        "annual_rainfall_mm": 644,
        "climate_summary": "Bhadra reservoir canal system irrigates large tracts; central trade hub for grains.",
        "nearest_mandi": "Davangere APMC (Major Cotton & Maize Exchange)",
        "coordinates": {"lat": 14.4644, "lng": 75.9218},
        "recommended_crops": [
            {
                "crop_id": "maize",
                "crop_name": "Maize / Corn",
                "scientific_name": "Zea mays",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Known as the 'Manchester and Maize Capital of Karnataka'. Extensive processing factories and poultry demand.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 70,
                    "mean_yield_tonnes_ha": 7.0,
                    "yield_range": "60 – 80 Qtl/Ha",
                    "historical_district_avg": "58 Qtl/Ha",
                    "growth_duration_days": "105 - 115 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Maize",
                    "modal_price_qtl": 2300,
                    "modal_price_kg": 23.0,
                    "price_range_qtl": "₹2,100 – ₹2,450",
                    "market_name": "Davangere APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.9%",
                    "estimated_gross_revenue_per_acre": "₹65,000 – ₹85,000"
                },
                "icar_guidelines": "Ensure balanced NPK + Zinc application at knee-high stage."
            },
            {
                "crop_id": "cotton",
                "crop_name": "Cotton",
                "scientific_name": "Gossypium hirsutum",
                "suitability_score": 92,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Black soils of Jagalur and Harihara sustain long fiber development.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 26,
                    "mean_yield_tonnes_ha": 2.6,
                    "yield_range": "22 – 30 Qtl/Ha",
                    "historical_district_avg": "21 Qtl/Ha",
                    "growth_duration_days": "150 - 165 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Cotton",
                    "modal_price_qtl": 7300,
                    "modal_price_kg": 73.0,
                    "price_range_qtl": "₹6,800 – ₹7,800",
                    "market_name": "Davangere Cotton Yard",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.2%",
                    "estimated_gross_revenue_per_acre": "₹75,000 – ₹1,02,000"
                },
                "icar_guidelines": "Monitor sucking pests (aphids, jassids) in early vegetative stage."
            }
        ]
    },
    "shimoga": {
        "area_name": "Shivamogga (Shimoga)",
        "state": "Karnataka",
        "district": "Shivamogga",
        "taluks": ["Shivamogga", "Bhadravati", "Sagar", "Shikaripura", "Soraba", "Thirthahalli", "Hosanagara"],
        "agro_climatic_zone": "Southern Transition & Hilly Zone (Zone-7/9)",
        "soil_type": "Laterite Loam & Rich Forest Humus Clay",
        "annual_rainfall_mm": 1813,
        "climate_summary": "Western Ghats Gateway; heavy monsoon showers, dense rivers (Tunga, Bhadra, Sharavathi).",
        "nearest_mandi": "Shivamogga APMC",
        "coordinates": {"lat": 13.9299, "lng": 75.5681},
        "recommended_crops": [
            {
                "crop_id": "rice",
                "crop_name": "Rice / Paddy (Highland & Lowland Varieties)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 98,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "High precipitation and Tunga canal networks create premier conditions for traditional and improved paddy.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 60,
                    "mean_yield_tonnes_ha": 6.0,
                    "yield_range": "52 – 68 Qtl/Ha",
                    "historical_district_avg": "50 Qtl/Ha",
                    "growth_duration_days": "130 - 145 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Paddy (Fine)",
                    "modal_price_qtl": 2420,
                    "modal_price_kg": 24.2,
                    "price_range_qtl": "₹2,250 – ₹2,600",
                    "market_name": "Shivamogga APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+3.4%",
                    "estimated_gross_revenue_per_acre": "₹60,000 – ₹78,000"
                },
                "icar_guidelines": "Watch out for sheath blight and blast in humid high rainfall periods."
            },
            {
                "crop_id": "banana",
                "crop_name": "Banana",
                "scientific_name": "Musa acuminata",
                "suitability_score": 91,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Consistent high relative humidity and warm tropical valleys produce heavy bunch weights.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 450,
                    "mean_yield_tonnes_ha": 45.0,
                    "yield_range": "390 – 510 Qtl/Ha",
                    "historical_district_avg": "380 Qtl/Ha",
                    "growth_duration_days": "330 - 360 Days",
                    "best_season": "Year-round"
                },
                "mandi_price": {
                    "commodity": "Banana",
                    "modal_price_qtl": 2950,
                    "modal_price_kg": 29.5,
                    "price_range_qtl": "₹2,500 – ₹3,400",
                    "market_name": "Shivamogga Market",
                    "trend_direction": "stable",
                    "trend_pct": "+2.8%",
                    "estimated_gross_revenue_per_acre": "₹1,50,000 – ₹2,10,000"
                },
                "icar_guidelines": "Adequate drainage trenches are vital to prevent Sigatoka leaf spot."
            }
        ]
    },
    "punjab": {
        "area_name": "Punjab (Indo-Gangetic Plains)",
        "state": "Punjab",
        "district": "Ludhiana / Patiala / Bhatinda",
        "taluks": ["Ludhiana Central", "Jagraon", "Khanna", "Samrala", "Payal"],
        "agro_climatic_zone": "Trans-Gangetic Plains Region (Zone-6)",
        "soil_type": "Deep Alluvial Loam (Highly Fertile Indo-Gangetic Alluvium)",
        "annual_rainfall_mm": 650,
        "climate_summary": "Continental sub-tropical; warm summers and chilling winter frost essential for wheat vernalization.",
        "nearest_mandi": "Khanna Mandi (Asia's Largest Grain Market)",
        "coordinates": {"lat": 30.9010, "lng": 75.8573},
        "recommended_crops": [
            {
                "crop_id": "wheat",
                "crop_name": "Wheat (HD-2967 / PBW-550)",
                "scientific_name": "Triticum aestivum",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Chilly continental winter days and deep alluvial soils generate the highest national grain yields.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 54,
                    "mean_yield_tonnes_ha": 5.4,
                    "yield_range": "48 – 60 Qtl/Ha",
                    "historical_district_avg": "49 Qtl/Ha",
                    "growth_duration_days": "140 - 150 Days",
                    "best_season": "Rabi (Nov - April)"
                },
                "mandi_price": {
                    "commodity": "Wheat (Sharbati / Common)",
                    "modal_price_qtl": 2425,
                    "modal_price_kg": 24.25,
                    "price_range_qtl": "₹2,275 (MSP) – ₹2,550",
                    "market_name": "Khanna Grain Market",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.0%",
                    "estimated_gross_revenue_per_acre": "₹55,000 – ₹72,000"
                },
                "icar_guidelines": "First irrigation (CRI stage) at 21 days after sowing is critical for root crown establishment."
            },
            {
                "crop_id": "rice",
                "crop_name": "Rice / Basmati (Pusa 1121 / 1509)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 95,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Extensive canal and tubewell infrastructure delivers peak grain elongation in aromatic basmati.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 52,
                    "mean_yield_tonnes_ha": 5.2,
                    "yield_range": "44 – 58 Qtl/Ha",
                    "historical_district_avg": "46 Qtl/Ha",
                    "growth_duration_days": "120 - 135 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Basmati Paddy",
                    "modal_price_qtl": 3850,
                    "modal_price_kg": 38.5,
                    "price_range_qtl": "₹3,400 – ₹4,400",
                    "market_name": "Amritsar / Khanna APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.5%",
                    "estimated_gross_revenue_per_acre": "₹80,000 – ₹1,10,000"
                },
                "icar_guidelines": "Adopt direct-seeded rice (DSR) to conserve groundwater tables."
            }
        ]
    },
    "maharashtra": {
        "area_name": "Maharashtra (Nashik / Pune / Marathwada)",
        "state": "Maharashtra",
        "district": "Nashik / Pune",
        "taluks": ["Nashik", "Niphad", "Yeola", "Dindori", "Sinnar", "Baramati"],
        "agro_climatic_zone": "Western Plateau & Hill Region (Zone-9)",
        "soil_type": "Black Cotton Soil & Deep Clay Loam (Regur)",
        "annual_rainfall_mm": 720,
        "climate_summary": "Semi-arid Deccan plateau with high solar radiation and cool nights ideal for bulbs and cash crops.",
        "nearest_mandi": "Lasalgaon APMC (Asia's Largest Onion Market)",
        "coordinates": {"lat": 19.9975, "lng": 73.7898},
        "recommended_crops": [
            {
                "crop_id": "onion",
                "crop_name": "Onion (Nashik Red / Garwa)",
                "scientific_name": "Allium cepa",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Lasalgaon in Nashik commands national onion trading with unmatched climate and soil characteristics.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 240,
                    "mean_yield_tonnes_ha": 24.0,
                    "yield_range": "200 – 270 Qtl/Ha",
                    "historical_district_avg": "190 Qtl/Ha",
                    "growth_duration_days": "115 - 130 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Onion (Red)",
                    "modal_price_qtl": 2250,
                    "modal_price_kg": 22.5,
                    "price_range_qtl": "₹1,900 – ₹2,600",
                    "market_name": "Lasalgaon APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+7.2%",
                    "estimated_gross_revenue_per_acre": "₹1,40,000 – ₹1,95,000"
                },
                "icar_guidelines": "Ensure well-ventilated storage structures (Kanda Chawl) to avoid post-harvest rot."
            },
            {
                "crop_id": "cotton",
                "crop_name": "Cotton (Bt Hybrid)",
                "scientific_name": "Gossypium hirsutum",
                "suitability_score": 93,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Deep regur soils retain residual moisture across the dry winter boll-opening stage.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 23,
                    "mean_yield_tonnes_ha": 2.3,
                    "yield_range": "19 – 27 Qtl/Ha",
                    "historical_district_avg": "18 Qtl/Ha",
                    "growth_duration_days": "160 - 180 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Raw Cotton",
                    "modal_price_qtl": 7200,
                    "modal_price_kg": 72.0,
                    "price_range_qtl": "₹6,800 – ₹7,700",
                    "market_name": "Jalna / Akola APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.8%",
                    "estimated_gross_revenue_per_acre": "₹68,000 – ₹94,000"
                },
                "icar_guidelines": "Implement refugee crops around perimeter to slow bollworm resistance."
            }
        ]
    },
    "andhra_pradesh": {
        "area_name": "Andhra Pradesh (Guntur / Krishna Basin)",
        "state": "Andhra Pradesh",
        "district": "Guntur / Krishna",
        "taluks": ["Guntur", "Tenali", "Sattenapalli", "Narasaraopet", "Mangalagiri"],
        "agro_climatic_zone": "Southern Coastal Plains (Zone-10)",
        "soil_type": "Deep Black Vertisols & River Delta Clay",
        "annual_rainfall_mm": 890,
        "climate_summary": "Hot coastal tropical conditions with heavy Krishna river delta canal irrigation.",
        "nearest_mandi": "Guntur Mirchi Yard (Asia's Largest Chilli Market)",
        "coordinates": {"lat": 16.3067, "lng": 80.4365},
        "recommended_crops": [
            {
                "crop_id": "chilli",
                "crop_name": "Chilli (Guntur Sannam / Teja)",
                "scientific_name": "Capsicum annuum",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Guntur is the world's renowned chilli capital. The high heat units and heavy soils produce intense capsaicin and deep red ASTA color value.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 45,
                    "mean_yield_tonnes_ha": 4.5,
                    "yield_range": "38 – 52 Qtl/Ha (Dry Pods)",
                    "historical_district_avg": "36 Qtl/Ha",
                    "growth_duration_days": "150 - 180 Days",
                    "best_season": "Kharif to Late Rabi"
                },
                "mandi_price": {
                    "commodity": "Dry Red Chilli (Guntur Teja)",
                    "modal_price_qtl": 18500,
                    "modal_price_kg": 185.0,
                    "price_range_qtl": "₹16,500 – ₹21,000",
                    "market_name": "Guntur Mirchi Yard",
                    "trend_direction": "bullish",
                    "trend_pct": "+8.4%",
                    "estimated_gross_revenue_per_acre": "₹2,60,000 – ₹3,80,000"
                },
                "icar_guidelines": "Inspect for Thrips and Anthracnose fruit rot; avoid excess overhead sprinkler water."
            },
            {
                "crop_id": "rice",
                "crop_name": "Rice / Paddy (BPT 5204 / Samba Mahsuri)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 95,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "The 'Rice Bowl of India'. Krishna delta canals ensure uninterrupted flooding stages.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 65,
                    "mean_yield_tonnes_ha": 6.5,
                    "yield_range": "58 – 72 Qtl/Ha",
                    "historical_district_avg": "56 Qtl/Ha",
                    "growth_duration_days": "140 - 150 Days",
                    "best_season": "Sarva & Dalwa"
                },
                "mandi_price": {
                    "commodity": "Samba Mahsuri Paddy",
                    "modal_price_qtl": 2600,
                    "modal_price_kg": 26.0,
                    "price_range_qtl": "₹2,350 – ₹2,850",
                    "market_name": "Tenali / Guntur APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.1%",
                    "estimated_gross_revenue_per_acre": "₹68,000 – ₹88,000"
                },
                "icar_guidelines": "Apply zinc sulfate to avoid khaira-like deficiency in coastal alkaline soils."
            }
        ]
    },
    "tumakuru": {
        "area_name": "Tumakuru (Tumkur)",
        "state": "Karnataka",
        "district": "Tumakuru",
        "taluks": ["Tumakuru", "Tiptur", "Madhugiri", "Sira", "Kunigal", "Gubbi", "Koratagere", "Pavagada", "Chikkanayakanahalli", "Turuvekere"],
        "agro_climatic_zone": "Central Dry Zone (Zone-4)",
        "soil_type": "Red Sandy Loam & Gravelly Soils",
        "annual_rainfall_mm": 688,
        "climate_summary": "Semi-arid with abundant sunshine. Tiptur is Karnataka's prime coconut copra capital; Pavagada has immense groundnut acreage.",
        "nearest_mandi": "Tiptur Copra APMC & Tumakuru Grain Yard",
        "coordinates": {"lat": 13.3392, "lng": 77.1017},
        "recommended_crops": [
            {
                "crop_id": "groundnut",
                "crop_name": "Groundnut / Peanut (TMV 2 / Kadiri 6)",
                "scientific_name": "Arachis hypogaea",
                "suitability_score": 96,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Friable sandy soils of Pavagada and Madhugiri facilitate peg penetration and uniform pod filling.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 24,
                    "mean_yield_tonnes_ha": 2.4,
                    "yield_range": "20 – 28 Qtl/Ha",
                    "historical_district_avg": "20 Qtl/Ha",
                    "growth_duration_days": "105 - 115 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Groundnut Pods",
                    "modal_price_qtl": 6550,
                    "modal_price_kg": 65.5,
                    "price_range_qtl": "₹6,000 – ₹7,100",
                    "market_name": "Tumakuru APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.2%",
                    "estimated_gross_revenue_per_acre": "₹55,000 – ₹75,000"
                },
                "icar_guidelines": "Apply gypsum at 30 days after sowing and ensure seed treatment with Trichoderma."
            },
            {
                "crop_id": "pulses",
                "crop_name": "Pulses (Horsegram / Pigeon Pea / Red Gram)",
                "scientific_name": "Cajanus cajan",
                "suitability_score": 92,
                "suitability_level": "Highly Suitable",
                "why_suitable": "High drought hardiness and ability to exploit deep soil moisture in semi-arid zones.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 16,
                    "mean_yield_tonnes_ha": 1.6,
                    "yield_range": "13 – 19 Qtl/Ha",
                    "historical_district_avg": "13 Qtl/Ha",
                    "growth_duration_days": "140 - 160 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Tur / Red Gram",
                    "modal_price_qtl": 9200,
                    "modal_price_kg": 92.0,
                    "price_range_qtl": "₹8,400 – ₹10,000",
                    "market_name": "Tumakuru APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.8%",
                    "estimated_gross_revenue_per_acre": "₹50,000 – ₹70,000"
                },
                "icar_guidelines": "Watch for pod borer (Helicoverpa armigera) at flowering; set up pheromone traps."
            }
        ]
    },
    "hassan": {
        "area_name": "Hassan",
        "state": "Karnataka",
        "district": "Hassan",
        "taluks": ["Hassan", "Channarayapatna", "Arsikere", "Holenarasipura", "Sakleshpur", "Belur", "Alur", "Arkalgud"],
        "agro_climatic_zone": "Southern Transition & Hilly Zone (Zone-7/9)",
        "soil_type": "Red Sandy Loam, Clay Loam & Lateritic Soil",
        "annual_rainfall_mm": 1040,
        "climate_summary": "Diverse terrain from Sakleshpur Western Ghats coffee estates to fertile Hemavathi river plains.",
        "nearest_mandi": "Hassan Potato & Grain Market",
        "coordinates": {"lat": 13.0033, "lng": 76.1004},
        "recommended_crops": [
            {
                "crop_id": "potato",
                "crop_name": "Potato (Kufri Jyoti / Kufri Surya)",
                "scientific_name": "Solanum tuberosum",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Hassan is Karnataka's prime potato heartland. High elevation (950m) and cool monsoons promote high dry matter accumulation.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 230,
                    "mean_yield_tonnes_ha": 23.0,
                    "yield_range": "200 – 260 Qtl/Ha",
                    "historical_district_avg": "190 Qtl/Ha",
                    "growth_duration_days": "80 - 95 Days",
                    "best_season": "Early Kharif (May - June planting)"
                },
                "mandi_price": {
                    "commodity": "Potato",
                    "modal_price_qtl": 1950,
                    "modal_price_kg": 19.5,
                    "price_range_qtl": "₹1,700 – ₹2,200",
                    "market_name": "Hassan APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.1%",
                    "estimated_gross_revenue_per_acre": "₹1,40,000 – ₹1,90,000"
                },
                "icar_guidelines": "Adopt prophylactic spray of Mancozeb against early and late blight before monsoon breaks."
            },
            {
                "crop_id": "maize",
                "crop_name": "Maize",
                "scientific_name": "Zea mays",
                "suitability_score": 91,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Channarayapatna and Holenarasipura fertile loams deliver vigorous cob girth and grain filling.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 66,
                    "mean_yield_tonnes_ha": 6.6,
                    "yield_range": "56 – 74 Qtl/Ha",
                    "historical_district_avg": "54 Qtl/Ha",
                    "growth_duration_days": "100 - 110 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Maize",
                    "modal_price_qtl": 2280,
                    "modal_price_kg": 22.8,
                    "price_range_qtl": "₹2,100 – ₹2,420",
                    "market_name": "Arsikere APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+3.6%",
                    "estimated_gross_revenue_per_acre": "₹58,000 – ₹78,000"
                },
                "icar_guidelines": "Apply zinc sulfate at 25 kg/ha basal to avoid zinc deficiency chlorosis."
            }
        ]
    },
    "chikkaballapura": {
        "area_name": "Chikkaballapura",
        "state": "Karnataka",
        "district": "Chikkaballapura",
        "taluks": ["Chikkaballapura", "Gauribidanur", "Bagepalli", "Sidlaghatta", "Chintamani", "Gudibanda"],
        "agro_climatic_zone": "Eastern Dry Zone (Zone-5)",
        "soil_type": "Red Sandy Loam with Clay Pockets",
        "annual_rainfall_mm": 720,
        "climate_summary": "Renowned for high-value horticulture, grapes, and sericulture, benefiting from high diurnal temperature shifts.",
        "nearest_mandi": "Chintamani APMC & Chikkaballapura Tomato Yard",
        "coordinates": {"lat": 13.4355, "lng": 77.7275},
        "recommended_crops": [
            {
                "crop_id": "tomato",
                "crop_name": "Tomato",
                "scientific_name": "Solanum lycopersicum",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "High sun hours, dry atmosphere, and red gravelly soils yield firm fruits with excellent transport durability.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 375,
                    "mean_yield_tonnes_ha": 37.5,
                    "yield_range": "330 – 420 Qtl/Ha",
                    "historical_district_avg": "315 Qtl/Ha",
                    "growth_duration_days": "100 - 120 Days",
                    "best_season": "Year-round with drip"
                },
                "mandi_price": {
                    "commodity": "Tomato",
                    "modal_price_qtl": 2380,
                    "modal_price_kg": 23.8,
                    "price_range_qtl": "₹2,050 – ₹2,750",
                    "market_name": "Chikkaballapura APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.9%",
                    "estimated_gross_revenue_per_acre": "₹2,10,000 – ₹2,80,000"
                },
                "icar_guidelines": "Staking is essential to keep foliage off soil and reduce fruit rot."
            },
            {
                "crop_id": "groundnut",
                "crop_name": "Groundnut",
                "scientific_name": "Arachis hypogaea",
                "suitability_score": 90,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Gauribidanur and Bagepalli drylands produce high oil content pods in light loamy soils.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 21,
                    "mean_yield_tonnes_ha": 2.1,
                    "yield_range": "18 – 25 Qtl/Ha",
                    "historical_district_avg": "18 Qtl/Ha",
                    "growth_duration_days": "105 - 115 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Groundnut",
                    "modal_price_qtl": 6450,
                    "modal_price_kg": 64.5,
                    "price_range_qtl": "₹5,900 – ₹6,950",
                    "market_name": "Chintamani APMC",
                    "trend_direction": "stable",
                    "trend_pct": "+2.2%",
                    "estimated_gross_revenue_per_acre": "₹52,000 – ₹70,000"
                },
                "icar_guidelines": "Timely weeding at 20 and 40 days prevents severe nutrient competition."
            }
        ]
    },
    "bellary": {
        "area_name": "Ballari (Bellary)",
        "state": "Karnataka",
        "district": "Ballari",
        "taluks": ["Ballari", "Sandur", "Siruguppa", "Kampli"],
        "agro_climatic_zone": "North Eastern Dry Zone (Zone-3)",
        "soil_type": "Deep Black Vertisols (Black Cotton Soil)",
        "annual_rainfall_mm": 610,
        "climate_summary": "Semi-arid with high temperatures; Tungabhadra canal irrigation transforms Siruguppa into a paddy bowl.",
        "nearest_mandi": "Ballari Cotton Market & Siruguppa Rice APMC",
        "coordinates": {"lat": 15.1394, "lng": 76.9214},
        "recommended_crops": [
            {
                "crop_id": "rice",
                "crop_name": "Rice / Sona Masuri (Siruguppa Brand)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Siruguppa in Ballari is world famous for premium Sona Masuri table rice thanks to fertile clay deposits and Tungabhadra waters.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 64,
                    "mean_yield_tonnes_ha": 6.4,
                    "yield_range": "56 – 72 Qtl/Ha",
                    "historical_district_avg": "54 Qtl/Ha",
                    "growth_duration_days": "130 - 140 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Sona Masuri Paddy",
                    "modal_price_qtl": 2550,
                    "modal_price_kg": 25.5,
                    "price_range_qtl": "₹2,300 – ₹2,750",
                    "market_name": "Siruguppa APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.6%",
                    "estimated_gross_revenue_per_acre": "₹64,000 – ₹82,000"
                },
                "icar_guidelines": "Avoid excessive nitrogen application to prevent neck blast."
            },
            {
                "crop_id": "chilli",
                "crop_name": "Chilli (Byadagi / Guntur Hybrid)",
                "scientific_name": "Capsicum annuum",
                "suitability_score": 93,
                "suitability_level": "Highly Suitable",
                "why_suitable": "High summer heat and heavy clay vertisols yield vibrant red color and high oleoresin.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 38,
                    "mean_yield_tonnes_ha": 3.8,
                    "yield_range": "32 – 44 Qtl/Ha (Dry)",
                    "historical_district_avg": "30 Qtl/Ha",
                    "growth_duration_days": "150 - 170 Days",
                    "best_season": "Kharif to Winter"
                },
                "mandi_price": {
                    "commodity": "Dry Chilli",
                    "modal_price_qtl": 17200,
                    "modal_price_kg": 172.0,
                    "price_range_qtl": "₹15,000 – ₹19,500",
                    "market_name": "Ballari APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+7.0%",
                    "estimated_gross_revenue_per_acre": "₹2,20,000 – ₹3,10,000"
                },
                "icar_guidelines": "Ensure raised nursery beds to avoid damping-off seedlings."
            }
        ]
    }
,
    "bagalkot": {
        "area_name": "Bagalkot",
        "state": "Karnataka",
        "district": "Bagalkot",
        "taluks": ["Bagalkot", "Badami", "Bilagi", "Jamkhandi", "Mudhol", "Hunagund", "Ilkal", "Rabkavi Banhatti", "Guledagudda"],
        "agro_climatic_zone": "Northern Dry Zone (Zone-3)",
        "soil_type": "Deep Black Clay Vertisols & Red Sandy Loam in Ghataprabha basin",
        "annual_rainfall_mm": 560,
        "climate_summary": "Semi-arid with high summer temperatures and rich irrigation along Ghataprabha and Malaprabha rivers.",
        "nearest_mandi": "Jamkhandi / Bagalkot APMC",
        "coordinates": {"lat": 16.1875, "lng": 75.6980},
        "recommended_crops": [
            {
                "crop_id": "sugarcane",
                "crop_name": "Sugarcane (Ghataprabha Basin)",
                "scientific_name": "Saccharum officinarum",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "High sugar recovery zone supported by Krishna and Ghataprabha canal networks and local co-op mills.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 1100,
                    "mean_yield_tonnes_ha": 110.0,
                    "yield_range": "950 – 1250 Qtl/Ha",
                    "historical_district_avg": "980 Qtl/Ha",
                    "growth_duration_days": "360 - 390 Days",
                    "best_season": "Adsali & Suru"
                },
                "mandi_price": {
                    "commodity": "Sugarcane (FRP Mill Gate)",
                    "modal_price_qtl": 335,
                    "modal_price_kg": 3.35,
                    "price_range_qtl": "₹315 – ₹355",
                    "market_name": "Jamkhandi Sugar Mills",
                    "trend_direction": "stable",
                    "trend_pct": "FRP Protected",
                    "estimated_gross_revenue_per_acre": "₹1,30,000 – ₹1,70,000"
                },
                "icar_guidelines": "Adopt paired row planting and sub-surface drip irrigation."
            },
            {
                "crop_id": "maize",
                "crop_name": "Maize (Hybrid Grain)",
                "scientific_name": "Zea mays",
                "suitability_score": 93,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Warm sunny days and fertile black vertisols produce dense, high-starch cobs.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 68,
                    "mean_yield_tonnes_ha": 6.8,
                    "yield_range": "58 – 76 Qtl/Ha",
                    "historical_district_avg": "54 Qtl/Ha",
                    "growth_duration_days": "100 - 115 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Maize",
                    "modal_price_qtl": 2280,
                    "modal_price_kg": 22.8,
                    "price_range_qtl": "₹2,090 (MSP) – ₹2,450",
                    "market_name": "Bagalkot APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+3.8%",
                    "estimated_gross_revenue_per_acre": "₹55,000 – ₹72,000"
                },
                "icar_guidelines": "Scout for Fall Armyworm (FAW) at whorl stage; apply whorl application of neem formulation."
            }
        ]
    },
    "bengaluru_rural": {
        "area_name": "Bengaluru Rural",
        "state": "Karnataka",
        "district": "Bengaluru Rural",
        "taluks": ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"],
        "agro_climatic_zone": "Eastern Dry Zone (Zone-5)",
        "soil_type": "Red Gravelly Sandy Loam (High Infiltration)",
        "annual_rainfall_mm": 790,
        "climate_summary": "Temperate plateau micro-climate with direct proximity to India's fastest growing metropolitan consumption centers.",
        "nearest_mandi": "Hosakote / Devanahalli APMC",
        "coordinates": {"lat": 13.2483, "lng": 77.7125},
        "recommended_crops": [
            {
                "crop_id": "tomato",
                "crop_name": "Tomato & Polyhouse Vegetables",
                "scientific_name": "Solanum lycopersicum",
                "suitability_score": 96,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Direct metro distribution link reduces transit spoilage; ideal drainage.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 370,
                    "mean_yield_tonnes_ha": 37.0,
                    "yield_range": "330 – 420 Qtl/Ha",
                    "historical_district_avg": "310 Qtl/Ha",
                    "growth_duration_days": "100 - 115 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Tomato",
                    "modal_price_qtl": 2450,
                    "modal_price_kg": 24.5,
                    "price_range_qtl": "₹2,100 – ₹2,900",
                    "market_name": "Hosakote / K.R. Market",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.2%",
                    "estimated_gross_revenue_per_acre": "₹2,15,000 – ₹2,85,000"
                },
                "icar_guidelines": "Use drip irrigation with mulching; stake plants with trellising wire."
            }
        ]
    },
    "bidar": {
        "area_name": "Bidar",
        "state": "Karnataka",
        "district": "Bidar",
        "taluks": ["Bidar", "Basavakalyan", "Bhalki", "Humnabad", "Aurad", "Hulsoor", "Kamalnagar"],
        "agro_climatic_zone": "North Eastern Transition Zone (Zone-1)",
        "soil_type": "Deep Black Clay Vertisols & Lateritic Gravely Soils",
        "annual_rainfall_mm": 845,
        "climate_summary": "Semi-arid plateau with fertile basaltic soils renowned for pulse seed production.",
        "nearest_mandi": "Bidar APMC (Major Pulse & Oilseed Yard)",
        "coordinates": {"lat": 17.9104, "lng": 77.5199},
        "recommended_crops": [
            {
                "crop_id": "pulses",
                "crop_name": "Pigeon Pea / Red Gram (Tur - BSMR 736)",
                "scientific_name": "Cajanus cajan",
                "suitability_score": 98,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Bidar is Karnataka's premier pulse hub; deep moisture retentive black soils prevent drought stress.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 18,
                    "mean_yield_tonnes_ha": 1.8,
                    "yield_range": "15 – 22 Qtl/Ha",
                    "historical_district_avg": "14 Qtl/Ha",
                    "growth_duration_days": "150 - 180 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Red Gram (Tur)",
                    "modal_price_qtl": 9400,
                    "modal_price_kg": 94.0,
                    "price_range_qtl": "₹7,550 (MSP) – ₹10,200",
                    "market_name": "Bidar APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.4%",
                    "estimated_gross_revenue_per_acre": "₹65,000 – ₹85,000"
                },
                "icar_guidelines": "Treat seed with Rhizobium and Trichoderma; monitor for pod borer (Helicoverpa)."
            },
            {
                "crop_id": "soybean",
                "crop_name": "Soybean (JS 335 / DSb 21)",
                "scientific_name": "Glycine max",
                "suitability_score": 94,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Excellent rainfall during early Kharif ensures strong pod establishment.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 24,
                    "mean_yield_tonnes_ha": 2.4,
                    "yield_range": "20 – 28 Qtl/Ha",
                    "historical_district_avg": "19 Qtl/Ha",
                    "growth_duration_days": "90 - 100 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Soybean",
                    "modal_price_qtl": 4750,
                    "modal_price_kg": 47.5,
                    "price_range_qtl": "₹4,600 (MSP) – ₹5,100",
                    "market_name": "Bidar / Bhalki APMC",
                    "trend_direction": "stable",
                    "trend_pct": "+2.0%",
                    "estimated_gross_revenue_per_acre": "₹42,000 – ₹55,000"
                },
                "icar_guidelines": "Incorporate broad bed furrow system to prevent waterlogging."
            }
        ]
    },
    "chamarajanagar": {
        "area_name": "Chamarajanagar",
        "state": "Karnataka",
        "district": "Chamarajanagar",
        "taluks": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"],
        "agro_climatic_zone": "Southern Dry Zone (Zone-6)",
        "soil_type": "Red Sandy Loam & Deep Alluvium in Suvarnavathi Basin",
        "annual_rainfall_mm": 720,
        "climate_summary": "Sheltered rain-shadow terrain with prolific groundwater recharge along forest catchment fringes.",
        "nearest_mandi": "Gundlupet / Kollegal APMC",
        "coordinates": {"lat": 11.9261, "lng": 76.9437},
        "recommended_crops": [
            {
                "crop_id": "banana",
                "crop_name": "Banana (Nanjangud Rasabale & Yelakki)",
                "scientific_name": "Musa acuminata",
                "suitability_score": 95,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Loamy alluvial soils along river corridors provide ideal aeration and high potassium.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 440,
                    "mean_yield_tonnes_ha": 44.0,
                    "yield_range": "380 – 500 Qtl/Ha",
                    "historical_district_avg": "360 Qtl/Ha",
                    "growth_duration_days": "300 - 330 Days",
                    "best_season": "All Seasons"
                },
                "mandi_price": {
                    "commodity": "Banana (Yelakki)",
                    "modal_price_qtl": 3200,
                    "modal_price_kg": 32.0,
                    "price_range_qtl": "₹2,700 – ₹3,800",
                    "market_name": "Gundlupet Yard",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.8%",
                    "estimated_gross_revenue_per_acre": "₹1,60,000 – ₹2,20,000"
                },
                "icar_guidelines": "De-sucker plants diligently; apply organic compost and bio-potash."
            }
        ]
    },
    "chikkamagaluru": {
        "area_name": "Chikkamagaluru (Chikmagalur)",
        "state": "Karnataka",
        "district": "Chikkamagaluru",
        "taluks": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere", "Ajjampura", "Kalasa"],
        "agro_climatic_zone": "Hilly Malnad & Central Transition Zone (Zone-9 & 7)",
        "soil_type": "Rich Humus Deep Red Lateritic Soils & Forest Loam",
        "annual_rainfall_mm": 1925,
        "climate_summary": "Pristine Western Ghats altitude (900m-1400m) with misty mornings, cool shade, and heavy southwest monsoon.",
        "nearest_mandi": "Chikkamagaluru / Kadur APMC",
        "coordinates": {"lat": 13.3161, "lng": 75.7720},
        "recommended_crops": [
            {
                "crop_id": "coffee",
                "crop_name": "Coffee (Arabica & Robusta Shade-Grown)",
                "scientific_name": "Coffea arabica",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "The birthplace of Indian coffee (Baba Budangiri). Multi-tier canopy shade yields premium cup quality.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 14,
                    "mean_yield_tonnes_ha": 1.4,
                    "yield_range": "11 – 18 Qtl/Ha (Clean Coffee)",
                    "historical_district_avg": "12 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Dec-Feb)",
                    "best_season": "Winter Harvest"
                },
                "mandi_price": {
                    "commodity": "Coffee (Arabica Parchment)",
                    "modal_price_qtl": 19500,
                    "modal_price_kg": 195.0,
                    "price_range_qtl": "₹17,000 – ₹22,000",
                    "market_name": "Chikkamagaluru Curing Works",
                    "trend_direction": "bullish",
                    "trend_pct": "+8.4%",
                    "estimated_gross_revenue_per_acre": "₹1,80,000 – ₹2,60,000"
                },
                "icar_guidelines": "Maintain two-tier shade trees (silver oak and dadap); monitor for white stem borer."
            }
        ]
    },
    "chitradurga": {
        "area_name": "Chitradurga",
        "state": "Karnataka",
        "district": "Chitradurga",
        "taluks": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
        "agro_climatic_zone": "Central Dry Zone (Zone-4)",
        "soil_type": "Red Sandy Loam & Medium Black Soils",
        "annual_rainfall_mm": 574,
        "climate_summary": "Semi-arid dry plateau with long sunshine hours; renowned for oilseed and high-sugar pomegranate cultivation.",
        "nearest_mandi": "Challakere / Chitradurga APMC (Oil City of Karnataka)",
        "coordinates": {"lat": 14.2251, "lng": 76.3980},
        "recommended_crops": [
            {
                "crop_id": "groundnut",
                "crop_name": "Groundnut / Peanut (TMV 2 / Kadiri 6)",
                "scientific_name": "Arachis hypogaea",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Challakere is the 'Oil City' of Karnataka with thousands of acres of well-aerated sandy soil.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 25,
                    "mean_yield_tonnes_ha": 2.5,
                    "yield_range": "20 – 30 Qtl/Ha",
                    "historical_district_avg": "21 Qtl/Ha",
                    "growth_duration_days": "105 - 115 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Groundnut (Pod)",
                    "modal_price_qtl": 6650,
                    "modal_price_kg": 66.5,
                    "price_range_qtl": "₹6,377 (MSP) – ₹7,200",
                    "market_name": "Challakere Oil Market",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.3%",
                    "estimated_gross_revenue_per_acre": "₹58,000 – ₹78,000"
                },
                "icar_guidelines": "Apply gypsum at peg formation; treat seed with Trichoderma viride."
            },
            {
                "crop_id": "onion",
                "crop_name": "Onion (Arka Kalyan / Bhima Super)",
                "scientific_name": "Allium cepa",
                "suitability_score": 93,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Loose friable soils allow unhindered bulb development and rapid curing under dry sun.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 220,
                    "mean_yield_tonnes_ha": 22.0,
                    "yield_range": "180 – 260 Qtl/Ha",
                    "historical_district_avg": "190 Qtl/Ha",
                    "growth_duration_days": "110 - 120 Days",
                    "best_season": "Kharif & Late Kharif"
                },
                "mandi_price": {
                    "commodity": "Onion",
                    "modal_price_qtl": 2200,
                    "modal_price_kg": 22.0,
                    "price_range_qtl": "₹1,800 – ₹2,600",
                    "market_name": "Chitradurga APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.2%",
                    "estimated_gross_revenue_per_acre": "₹1,40,000 – ₹1,95,000"
                },
                "icar_guidelines": "Apply sulphur @ 30 kg/ha for pungency; cure bulbs under shade for 10-15 days."
            }
        ]
    },
    "dakshina_kannada": {
        "area_name": "Dakshina Kannada (Mangaluru)",
        "state": "Karnataka",
        "district": "Dakshina Kannada",
        "taluks": ["Mangaluru", "Bantwal", "Belthangady", "Puttur", "Sullia", "Moodabidri", "Kadaba"],
        "agro_climatic_zone": "Coastal Zone (Zone-10)",
        "soil_type": "Deep Coastal Laterite & Alluvial Clay Loam",
        "annual_rainfall_mm": 3950,
        "climate_summary": "Humid tropical coastal climate with high atmospheric humidity and abundant torrential monsoon rains.",
        "nearest_mandi": "Puttur / Mangaluru APMC (CAMPCO Arecanut Headquarters)",
        "coordinates": {"lat": 12.9141, "lng": 74.8560},
        "recommended_crops": [
            {
                "crop_id": "arecanut",
                "crop_name": "Arecanut (Mangala / Intercropped with Pepper)",
                "scientific_name": "Areca catechu",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Headquarters of CAMPCO; tropical humidity and deep laterite soils maximize chali arecanut yield.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 28,
                    "mean_yield_tonnes_ha": 2.8,
                    "yield_range": "24 – 34 Qtl/Ha",
                    "historical_district_avg": "25 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Oct-Mar)",
                    "best_season": "Winter Harvest"
                },
                "mandi_price": {
                    "commodity": "Arecanut (Chali)",
                    "modal_price_qtl": 44500,
                    "modal_price_kg": 445.0,
                    "price_range_qtl": "₹41,000 – ₹49,000",
                    "market_name": "CAMPCO Puttur",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.0%",
                    "estimated_gross_revenue_per_acre": "₹3,50,000 – ₹4,80,000"
                },
                "icar_guidelines": "Apply Bordeaux mixture (1%) as prophylactic spray before monsoon against fruit rot (Koleroga)."
            }
        ]
    },
    "dharwad": {
        "area_name": "Dharwad",
        "state": "Karnataka",
        "district": "Dharwad",
        "taluks": ["Dharwad", "Hubballi Urban", "Hubballi Rural", "Kundgol", "Navalgund", "Kalghatgi", "Alnavar", "Annigeri"],
        "agro_climatic_zone": "Northern Transition Zone (Zone-8)",
        "soil_type": "Medium to Deep Black Vertisols (Clay Content 50-60%)",
        "annual_rainfall_mm": 740,
        "climate_summary": "Highly fertile transition belt housing the premier University of Agricultural Sciences (UAS Dharwad).",
        "nearest_mandi": "Amaragol APMC Hubballi (North Karnataka's Largest Agro-Market)",
        "coordinates": {"lat": 15.4589, "lng": 75.0078},
        "recommended_crops": [
            {
                "crop_id": "cotton",
                "crop_name": "Bt Cotton (Medium / Long Staple)",
                "scientific_name": "Gossypium hirsutum",
                "suitability_score": 96,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Rich deep black soil has high water retention perfectly timed for cotton boll development.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 26,
                    "mean_yield_tonnes_ha": 2.6,
                    "yield_range": "22 – 32 Qtl/Ha",
                    "historical_district_avg": "22 Qtl/Ha",
                    "growth_duration_days": "150 - 170 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Raw Cotton (Kapas)",
                    "modal_price_qtl": 7450,
                    "modal_price_kg": 74.5,
                    "price_range_qtl": "₹7,122 (MSP) – ₹8,100",
                    "market_name": "Hubballi APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.5%",
                    "estimated_gross_revenue_per_acre": "₹65,000 – ₹88,000"
                },
                "icar_guidelines": "Maintain strict refuge crop; monitor for pink bollworm using pheromone traps."
            },
            {
                "crop_id": "soybean",
                "crop_name": "Soybean (DSb 21 / JS 335)",
                "scientific_name": "Glycine max",
                "suitability_score": 94,
                "suitability_level": "Highly Suitable",
                "why_suitable": "Bred and certified by UAS Dharwad for high oil and protein content.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 26,
                    "mean_yield_tonnes_ha": 2.6,
                    "yield_range": "22 – 30 Qtl/Ha",
                    "historical_district_avg": "21 Qtl/Ha",
                    "growth_duration_days": "95 - 105 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Soybean",
                    "modal_price_qtl": 4820,
                    "modal_price_kg": 48.2,
                    "price_range_qtl": "₹4,600 (MSP) – ₹5,200",
                    "market_name": "Dharwad APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+3.2%",
                    "estimated_gross_revenue_per_acre": "₹44,000 – ₹58,000"
                },
                "icar_guidelines": "Inoculate seeds with Bradyrhizobium japonicum before planting."
            }
        ]
    },
    "gadag": {
        "area_name": "Gadag",
        "state": "Karnataka",
        "district": "Gadag",
        "taluks": ["Gadag", "Ron", "Shirahatti", "Mundargi", "Nargund", "Gajendragad", "Lakshmeshwar"],
        "agro_climatic_zone": "Northern Dry Zone (Zone-3)",
        "soil_type": "Deep Black Cotton Soils & Grey Clay Loam",
        "annual_rainfall_mm": 612,
        "climate_summary": "Semi-arid plateau with extensive wind energy corridors and premier pulse-producing vertisols.",
        "nearest_mandi": "Gadag APMC (Renowned Bengal Gram & Cotton Yard)",
        "coordinates": {"lat": 15.4319, "lng": 75.6355},
        "recommended_crops": [
            {
                "crop_id": "pulses",
                "crop_name": "Bengal Gram / Chickpea (JG 11 / Annigeri 1)",
                "scientific_name": "Cicer arietinum",
                "suitability_score": 98,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Annigeri in Gadag is the ancestral home of the famed Annigeri-1 chickpea; exceptional drought resistance.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 19,
                    "mean_yield_tonnes_ha": 1.9,
                    "yield_range": "15 – 24 Qtl/Ha",
                    "historical_district_avg": "15 Qtl/Ha",
                    "growth_duration_days": "90 - 105 Days",
                    "best_season": "Rabi (Residual Moisture)"
                },
                "mandi_price": {
                    "commodity": "Bengal Gram (Chana)",
                    "modal_price_qtl": 6200,
                    "modal_price_kg": 62.0,
                    "price_range_qtl": "₹5,440 (MSP) – ₹6,800",
                    "market_name": "Gadag APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.0%",
                    "estimated_gross_revenue_per_acre": "₹45,000 – ₹62,000"
                },
                "icar_guidelines": "Deep plowing in summer; seed treatment with Trichoderma to stop fusarium wilt."
            }
        ]
    },
    "haveri": {
        "area_name": "Haveri",
        "state": "Karnataka",
        "district": "Haveri",
        "taluks": ["Haveri", "Byadgi", "Hangal", "Hirekerur", "Ranebennur", "Savanur", "Shiggaon", "Rattihalli"],
        "agro_climatic_zone": "Northern Transition Zone (Zone-8)",
        "soil_type": "Rich Red Loam & Fertile Deep Black Soil Pockets",
        "annual_rainfall_mm": 753,
        "climate_summary": "World-famous chilli hub with well-balanced monsoons and high morning dew beneficial for spice curing.",
        "nearest_mandi": "Byadgi APMC (Asia's Second Largest Red Chilli Market)",
        "coordinates": {"lat": 14.7954, "lng": 75.3991},
        "recommended_crops": [
            {
                "crop_id": "chilli",
                "crop_name": "Byadagi Chilli (Kaddi / Dabbi - GI Tagged)",
                "scientific_name": "Capsicum annuum",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "World-famous GI-tagged Byadagi chilli; unique deep red color, wrinkle texture, and mild spiciness.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 34,
                    "mean_yield_tonnes_ha": 3.4,
                    "yield_range": "28 – 40 Qtl/Ha",
                    "historical_district_avg": "26 Qtl/Ha",
                    "growth_duration_days": "150 - 170 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Byadagi Chilli (Dry)",
                    "modal_price_qtl": 28500,
                    "modal_price_kg": 285.0,
                    "price_range_qtl": "₹22,000 – ₹36,000",
                    "market_name": "Byadgi APMC Yard",
                    "trend_direction": "bullish",
                    "trend_pct": "+8.5% (High Oleoresin Demand)",
                    "estimated_gross_revenue_per_acre": "₹2,60,000 – ₹3,80,000"
                },
                "icar_guidelines": "Dry pods on clean tarpaulins under shade to preserve vibrant natural red color value."
            },
            {
                "crop_id": "maize",
                "crop_name": "Maize (Hybrid Seed)",
                "scientific_name": "Zea mays",
                "suitability_score": 95,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Ranebennur is a global seed production valley for MNC hybrids.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 72,
                    "mean_yield_tonnes_ha": 7.2,
                    "yield_range": "64 – 82 Qtl/Ha",
                    "historical_district_avg": "58 Qtl/Ha",
                    "growth_duration_days": "105 - 115 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Maize",
                    "modal_price_qtl": 2320,
                    "modal_price_kg": 23.2,
                    "price_range_qtl": "₹2,090 – ₹2,500",
                    "market_name": "Ranebennur APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.0%",
                    "estimated_gross_revenue_per_acre": "₹58,000 – ₹76,000"
                },
                "icar_guidelines": "Monitor whorls for FAW; intercrop with cowpea as trap crop."
            }
        ]
    },
    "kalaburagi": {
        "area_name": "Kalaburagi (Gulbarga)",
        "state": "Karnataka",
        "district": "Kalaburagi",
        "taluks": ["Kalaburagi", "Afzalpur", "Aland", "Chincholi", "Chittapur", "Jevargi", "Sedam", "Kamalapur", "Shahabad", "Kalgi", "Yadrami"],
        "agro_climatic_zone": "North Eastern Dry Zone (Zone-2)",
        "soil_type": "Deep Black Vertisols (Bheema & Krishna River Basins)",
        "annual_rainfall_mm": 777,
        "climate_summary": "Semi-arid with high solar irradiance; Karnataka's undisputed 'Tur Bowl' (GI-Tagged Kalaburagi Red Gram).",
        "nearest_mandi": "Nehru Gunj APMC, Kalaburagi",
        "coordinates": {"lat": 17.3297, "lng": 76.8343},
        "recommended_crops": [
            {
                "crop_id": "pulses",
                "crop_name": "Pigeon Pea / Red Gram (GI Tagged Kalaburagi Tur)",
                "scientific_name": "Cajanus cajan",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "GI Tagged Kalaburagi Tur has high protein, superior taste, and cooks faster due to limestone-rich vertisols.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 20,
                    "mean_yield_tonnes_ha": 2.0,
                    "yield_range": "16 – 25 Qtl/Ha",
                    "historical_district_avg": "15 Qtl/Ha",
                    "growth_duration_days": "150 - 180 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Red Gram (Tur / Arhar)",
                    "modal_price_qtl": 9650,
                    "modal_price_kg": 96.5,
                    "price_range_qtl": "₹7,550 (MSP) – ₹10,500",
                    "market_name": "Nehru Gunj APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.8%",
                    "estimated_gross_revenue_per_acre": "₹70,000 – ₹94,000"
                },
                "icar_guidelines": "Adopt 3:1 or 4:2 red gram + soybean intercropping for sustainable risk mitigation."
            }
        ]
    },
    "kodagu": {
        "area_name": "Kodagu (Coorg)",
        "state": "Karnataka",
        "district": "Kodagu",
        "taluks": ["Madikeri", "Somwarpet", "Virajpet", "Kushalnagar", "Ponnampet"],
        "agro_climatic_zone": "Hilly Malnad Zone (Zone-9)",
        "soil_type": "Deep Rich Forest Loam & Gravely Laterite (High Humus)",
        "annual_rainfall_mm": 2725,
        "climate_summary": "Scotland of India; lush evergreen montane micro-climate (850m-1300m) renowned for Robusta coffee, black pepper, and Coorg oranges.",
        "nearest_mandi": "Gonikoppal / Madikeri Market",
        "coordinates": {"lat": 12.4244, "lng": 75.7382},
        "recommended_crops": [
            {
                "crop_id": "coffee",
                "crop_name": "Coffee (Coorg Robusta / Arabica)",
                "scientific_name": "Coffea canephora",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Produces over 35% of India's coffee. Heavy monsoon rainfall and thick natural canopy provide perfect terroir.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 16,
                    "mean_yield_tonnes_ha": 1.6,
                    "yield_range": "13 – 20 Qtl/Ha",
                    "historical_district_avg": "13 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Jan-Mar)",
                    "best_season": "Winter"
                },
                "mandi_price": {
                    "commodity": "Coffee (Robusta Cherry)",
                    "modal_price_qtl": 14200,
                    "modal_price_kg": 142.0,
                    "price_range_qtl": "₹12,500 – ₹16,000",
                    "market_name": "Gonikoppal / Kushalnagar",
                    "trend_direction": "bullish",
                    "trend_pct": "+9.2%",
                    "estimated_gross_revenue_per_acre": "₹1,60,000 – ₹2,30,000"
                },
                "icar_guidelines": "Train black pepper vines onto dadap and silver oak shade trees for dual income."
            }
        ]
    },
    "koppal": {
        "area_name": "Koppal",
        "state": "Karnataka",
        "district": "Koppal",
        "taluks": ["Koppal", "Gangavathi", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi", "Kukanoor"],
        "agro_climatic_zone": "Northern Dry Zone (Zone-3)",
        "soil_type": "Deep Black Clay & Red Sandy Loam in Tungabhadra Left Bank Command",
        "annual_rainfall_mm": 572,
        "climate_summary": "Semi-arid with high sunshine hours and perennial canal irrigation through Tungabhadra Left Bank Canal (TLBC).",
        "nearest_mandi": "Gangavathi APMC (The Rice Mill Capital of Karnataka)",
        "coordinates": {"lat": 15.3524, "lng": 76.1557},
        "recommended_crops": [
            {
                "crop_id": "rice",
                "crop_name": "Rice / Paddy (Sona Masuri / BPT 5204)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Gangavathi is celebrated as the 'Rice Bowl of Karnataka'; canal irrigation creates world-class aromatic Sona Masuri.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 66,
                    "mean_yield_tonnes_ha": 6.6,
                    "yield_range": "58 – 75 Qtl/Ha",
                    "historical_district_avg": "56 Qtl/Ha",
                    "growth_duration_days": "130 - 145 Days",
                    "best_season": "Kharif & Summer"
                },
                "mandi_price": {
                    "commodity": "Sona Masuri Paddy (Grade A)",
                    "modal_price_qtl": 2600,
                    "modal_price_kg": 26.0,
                    "price_range_qtl": "₹2,350 – ₹2,850",
                    "market_name": "Gangavathi APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.2%",
                    "estimated_gross_revenue_per_acre": "₹68,000 – ₹88,000"
                },
                "icar_guidelines": "Alternate wetting and drying (AWD) recommended to optimize canal water allocation."
            }
        ]
    },
    "raichur": {
        "area_name": "Raichur",
        "state": "Karnataka",
        "district": "Raichur",
        "taluks": ["Raichur", "Manvi", "Sindhanur", "Devadurga", "Lingsugur", "Maski", "Sirwar"],
        "agro_climatic_zone": "North Eastern Dry Zone (Zone-2)",
        "soil_type": "Deep Black Vertisols (Krishna-Tungabhadra Doab)",
        "annual_rainfall_mm": 621,
        "climate_summary": "Fertile river doab between Krishna and Tungabhadra; highest density of mechanized combine harvesters and modern rice mills in South India.",
        "nearest_mandi": "Sindhanur / Raichur APMC (Largest Mechanical Grain Yard)",
        "coordinates": {"lat": 16.2120, "lng": 77.3439},
        "recommended_crops": [
            {
                "crop_id": "rice",
                "crop_name": "Rice / Paddy (Sona Masuri / Nellore Sona)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 98,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Sindhanur is renowned for high productivity mechanized paddy cultivation in the Tungabhadra command.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 65,
                    "mean_yield_tonnes_ha": 6.5,
                    "yield_range": "58 – 74 Qtl/Ha",
                    "historical_district_avg": "55 Qtl/Ha",
                    "growth_duration_days": "130 - 140 Days",
                    "best_season": "Kharif & Rabi"
                },
                "mandi_price": {
                    "commodity": "Paddy (Sona Masuri)",
                    "modal_price_qtl": 2580,
                    "modal_price_kg": 25.8,
                    "price_range_qtl": "₹2,300 – ₹2,800",
                    "market_name": "Sindhanur APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.8%",
                    "estimated_gross_revenue_per_acre": "₹66,000 – ₹85,000"
                },
                "icar_guidelines": "Soil test-based NPK application; monitor for brown planthopper (BPH) at base of stems."
            },
            {
                "crop_id": "cotton",
                "crop_name": "Cotton (Long Staple Bt Cotton)",
                "scientific_name": "Gossypium hirsutum",
                "suitability_score": 95,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Deep clay retention and hot sun produce long, clean lint with high micronaire value.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 25,
                    "mean_yield_tonnes_ha": 2.5,
                    "yield_range": "21 – 30 Qtl/Ha",
                    "historical_district_avg": "21 Qtl/Ha",
                    "growth_duration_days": "150 - 165 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Raw Cotton (Kapas)",
                    "modal_price_qtl": 7500,
                    "modal_price_kg": 75.0,
                    "price_range_qtl": "₹7,122 – ₹8,200",
                    "market_name": "Raichur Cotton Market",
                    "trend_direction": "bullish",
                    "trend_pct": "+4.2%",
                    "estimated_gross_revenue_per_acre": "₹68,000 – ₹90,000"
                },
                "icar_guidelines": "Nipping of terminal buds at 75-80 days to encourage sympodial branches."
            }
        ]
    },
    "ramanagara": {
        "area_name": "Ramanagara",
        "state": "Karnataka",
        "district": "Ramanagara",
        "taluks": ["Ramanagara", "Channapatna", "Kanakapura", "Magadi", "Harohalli"],
        "agro_climatic_zone": "Eastern Dry Zone (Zone-5)",
        "soil_type": "Red Sandy Loam & Gravely Granite Outcrops",
        "annual_rainfall_mm": 810,
        "climate_summary": "Semi-arid granitic rolling plateau; 'Silk City of India' with Asia's largest cocoon market.",
        "nearest_mandi": "Ramanagara Silk Cocoon Market / Channapatna APMC",
        "coordinates": {"lat": 12.7209, "lng": 77.2799},
        "recommended_crops": [
            {
                "crop_id": "mango",
                "crop_name": "Mango (Totapuri / Badami / Mallika)",
                "scientific_name": "Mangifera indica",
                "suitability_score": 96,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Gravelly hillside red soils with high drainage produce sweet, fiber-free table mangoes.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 105,
                    "mean_yield_tonnes_ha": 10.5,
                    "yield_range": "85 – 125 Qtl/Ha",
                    "historical_district_avg": "90 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Apr-Jun)",
                    "best_season": "Summer"
                },
                "mandi_price": {
                    "commodity": "Mango (Badami / Alphonso)",
                    "modal_price_qtl": 4200,
                    "modal_price_kg": 42.0,
                    "price_range_qtl": "₹3,500 – ₹5,200",
                    "market_name": "Ramanagara Fruit Yard",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.0%",
                    "estimated_gross_revenue_per_acre": "₹1,50,000 – ₹2,10,000"
                },
                "icar_guidelines": "Post-harvest hot water treatment against fruit fly infestation."
            }
        ]
    },
    "udupi": {
        "area_name": "Udupi",
        "state": "Karnataka",
        "district": "Udupi",
        "taluks": ["Udupi", "Brahmavara", "Karkala", "Kaup", "Kundapura", "Byndoor", "Hebri"],
        "agro_climatic_zone": "Coastal Zone (Zone-10)",
        "soil_type": "Sandy Alluvium & Coastal Laterite Soils",
        "annual_rainfall_mm": 4100,
        "climate_summary": "Heavy monsoon rains (June-September) followed by warm, humid sunny maritime winter.",
        "nearest_mandi": "Kundapura / Udupi APMC",
        "coordinates": {"lat": 13.3409, "lng": 74.7421},
        "recommended_crops": [
            {
                "crop_id": "rice",
                "crop_name": "Paddy / Rice (MO-4 / Jaya / Panchami)",
                "scientific_name": "Oryza sativa",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Coastal valley floodplains have high silt deposition and continuous rainfall during Kharif.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 52,
                    "mean_yield_tonnes_ha": 5.2,
                    "yield_range": "46 – 60 Qtl/Ha",
                    "historical_district_avg": "45 Qtl/Ha",
                    "growth_duration_days": "120 - 130 Days",
                    "best_season": "Kharif (Enne / Kaje)"
                },
                "mandi_price": {
                    "commodity": "Paddy (Boiled Rice Variety)",
                    "modal_price_qtl": 2400,
                    "modal_price_kg": 24.0,
                    "price_range_qtl": "₹2,183 (MSP) – ₹2,600",
                    "market_name": "Kundapura APMC",
                    "trend_direction": "stable",
                    "trend_pct": "+3.5%",
                    "estimated_gross_revenue_per_acre": "₹52,000 – ₹68,000"
                },
                "icar_guidelines": "Apply lime to correct soil acidity; adopt salt-tolerant varieties in coastal estuarine fields."
            }
        ]
    },
    "uttara_kannada": {
        "area_name": "Uttara Kannada (Karwar)",
        "state": "Karnataka",
        "district": "Uttara Kannada",
        "taluks": ["Karwar", "Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur", "Dandeli"],
        "agro_climatic_zone": "Coastal & Hill Malnad Zone (Zone-10 & 9)",
        "soil_type": "Deep Lateritic Soils with High Organic Humus & Coastal Alluvium",
        "annual_rainfall_mm": 2850,
        "climate_summary": "Extensive forest cover (>75%) with pristine Ghats valleys producing premier arecanut, cardamom, and spice crops.",
        "nearest_mandi": "TSS Sirsi APMC (Totgars' Cooperative Sale Society - Famous Spice Yard)",
        "coordinates": {"lat": 14.8185, "lng": 74.1350},
        "recommended_crops": [
            {
                "crop_id": "arecanut",
                "crop_name": "Arecanut (Sirsi Supari - GI Tagged)",
                "scientific_name": "Areca catechu",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "GI-tagged 'Sirsi Supari' is round, medium-sized, with a unique ash-grey marbled pattern and sweet chewiness.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 30,
                    "mean_yield_tonnes_ha": 3.0,
                    "yield_range": "25 – 36 Qtl/Ha",
                    "historical_district_avg": "26 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Nov-Feb)",
                    "best_season": "Winter Harvest"
                },
                "mandi_price": {
                    "commodity": "Sirsi Supari (Chali / Rashi)",
                    "modal_price_qtl": 46500,
                    "modal_price_kg": 465.0,
                    "price_range_qtl": "₹42,000 – ₹51,000",
                    "market_name": "TSS Sirsi APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+6.5%",
                    "estimated_gross_revenue_per_acre": "₹3,80,000 – ₹5,20,000"
                },
                "icar_guidelines": "Drain stagnant water during heavy rains; mulch with areca husk and farmyard manure."
            }
        ]
    },
    "vijayanagara": {
        "area_name": "Vijayanagara",
        "state": "Karnataka",
        "district": "Vijayanagara",
        "taluks": ["Hosapete (Hospet)", "Harapanahalli", "Hagaribommanahalli", "Hoovina Hadagali", "Kudligi", "Kotturu"],
        "agro_climatic_zone": "Northern Dry Zone (Zone-3)",
        "soil_type": "Deep Black Clay & Tungabhadra Basin Silt Alluvium",
        "annual_rainfall_mm": 635,
        "climate_summary": "Tungabhadra Dam downstream irrigated tract; ideal heat accumulation and perennial canal discharge.",
        "nearest_mandi": "Hosapete APMC / Bellary Main Yard",
        "coordinates": {"lat": 15.2740, "lng": 76.3900},
        "recommended_crops": [
            {
                "crop_id": "sugarcane",
                "crop_name": "Sugarcane (Co 86032 / CoVSI 9805)",
                "scientific_name": "Saccharum officinarum",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Tungabhadra Right and Left bank canals guarantee water during critical vegetative tillering.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 1120,
                    "mean_yield_tonnes_ha": 112.0,
                    "yield_range": "980 – 1280 Qtl/Ha",
                    "historical_district_avg": "1000 Qtl/Ha",
                    "growth_duration_days": "360 - 390 Days",
                    "best_season": "Adsali & Suru"
                },
                "mandi_price": {
                    "commodity": "Sugarcane (FRP Mill Rate)",
                    "modal_price_qtl": 338,
                    "modal_price_kg": 3.38,
                    "price_range_qtl": "₹320 – ₹360",
                    "market_name": "Kamalapura Sugar Mills",
                    "trend_direction": "stable",
                    "trend_pct": "FRP Protected",
                    "estimated_gross_revenue_per_acre": "₹1,35,000 – ₹1,75,000"
                },
                "icar_guidelines": "Adopt single-eye bud seedling transplantation to cut seed set costs by 60%."
            }
        ]
    },
    "vijayapura": {
        "area_name": "Vijayapura (Bijapur)",
        "state": "Karnataka",
        "district": "Vijayapura",
        "taluks": ["Vijayapura", "Indi", "Basavana Bagewadi", "Sindagi", "Muddebihal", "Babaleshwar", "Chadchan", "Devara Hippargi", "Kolhar", "Nidagundi", "Tikota", "Talikoti"],
        "agro_climatic_zone": "Northern Dry Zone (Zone-3)",
        "soil_type": "Deep Black Clay Vertisols & Calcareous Chalky Soils",
        "annual_rainfall_mm": 570,
        "climate_summary": "Semi-arid dry climate with hot summers and low humidity; undisputed 'Grape and Lime Capital of Karnataka'.",
        "nearest_mandi": "Vijayapura APMC (India's Renowned Raisin & Grape Trading Center)",
        "coordinates": {"lat": 16.8302, "lng": 75.7100},
        "recommended_crops": [
            {
                "crop_id": "grapes",
                "crop_name": "Table Grapes & Raisins (Thompson Seedless / Manik Chaman)",
                "scientific_name": "Vitis vinifera",
                "suitability_score": 99,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Produces over 70% of Karnataka's grapes and raisins. Dry flowering season produces high TSS brix (>22°).",
                "projected_yield": {
                    "mean_yield_qtl_ha": 260,
                    "mean_yield_tonnes_ha": 26.0,
                    "yield_range": "220 – 310 Qtl/Ha",
                    "historical_district_avg": "210 Qtl/Ha",
                    "growth_duration_days": "Perennial (Harvest Feb-Apr)",
                    "best_season": "Winter - Spring Harvest"
                },
                "mandi_price": {
                    "commodity": "Raisins (Kishmish / Green)",
                    "modal_price_qtl": 21000,
                    "modal_price_kg": 210.0,
                    "price_range_qtl": "₹16,000 – ₹26,000",
                    "market_name": "Vijayapura Raisin Yard",
                    "trend_direction": "bullish",
                    "trend_pct": "+7.5%",
                    "estimated_gross_revenue_per_acre": "₹2,80,000 – ₹4,20,000"
                },
                "icar_guidelines": "Adopt Y-trellis or bower training; apply gibberellic acid (GA3) strictly as per NRC Grapes protocol."
            },
            {
                "crop_id": "onion",
                "crop_name": "Onion (Basavana Bagewadi Red)",
                "scientific_name": "Allium cepa",
                "suitability_score": 93,
                "suitability_level": "Highly Suitable",
                "why_suitable": "High potassium vertisols produce long-storing pungent red onions.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 215,
                    "mean_yield_tonnes_ha": 21.5,
                    "yield_range": "180 – 250 Qtl/Ha",
                    "historical_district_avg": "180 Qtl/Ha",
                    "growth_duration_days": "105 - 120 Days",
                    "best_season": "Rabi & Kharif"
                },
                "mandi_price": {
                    "commodity": "Onion",
                    "modal_price_qtl": 2150,
                    "modal_price_kg": 21.5,
                    "price_range_qtl": "₹1,750 – ₹2,550",
                    "market_name": "Vijayapura APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.5%",
                    "estimated_gross_revenue_per_acre": "₹1,35,000 – ₹1,85,000"
                },
                "icar_guidelines": "Avoid nitrogen application in last 3 weeks before harvest to prevent rotting in storage."
            }
        ]
    },
    "yadgir": {
        "area_name": "Yadgir",
        "state": "Karnataka",
        "district": "Yadgir",
        "taluks": ["Yadgir", "Shahapur", "Surpur", "Gurmitkal", "Vadagera", "Hunsagi"],
        "agro_climatic_zone": "North Eastern Dry Zone (Zone-2)",
        "soil_type": "Deep Black Soils & Calcareous Clay in Bheema Basin",
        "annual_rainfall_mm": 636,
        "climate_summary": "Semi-arid dry climate with Upper Krishna Project (UKP) irrigation canal network.",
        "nearest_mandi": "Yadgir APMC / Shahapur Yard",
        "coordinates": {"lat": 16.7628, "lng": 77.1442},
        "recommended_crops": [
            {
                "crop_id": "pulses",
                "crop_name": "Pigeon Pea / Red Gram (Tur)",
                "scientific_name": "Cajanus cajan",
                "suitability_score": 97,
                "suitability_level": "Optimal (Best Fit)",
                "why_suitable": "Part of the fertile Hyderabad-Karnataka pulse belt; heavy black clay allows deep root anchoring.",
                "projected_yield": {
                    "mean_yield_qtl_ha": 19,
                    "mean_yield_tonnes_ha": 1.9,
                    "yield_range": "16 – 23 Qtl/Ha",
                    "historical_district_avg": "15 Qtl/Ha",
                    "growth_duration_days": "150 - 175 Days",
                    "best_season": "Kharif"
                },
                "mandi_price": {
                    "commodity": "Red Gram (Tur)",
                    "modal_price_qtl": 9350,
                    "modal_price_kg": 93.5,
                    "price_range_qtl": "₹7,550 (MSP) – ₹10,100",
                    "market_name": "Yadgir APMC",
                    "trend_direction": "bullish",
                    "trend_pct": "+5.8%",
                    "estimated_gross_revenue_per_acre": "₹65,000 – ₹85,000"
                },
                "icar_guidelines": "Spray pulse magic micronutrient formulation at flowering and pod development stages."
            }
        ]
    }

}

AREA_ALIASES = {
    "kolar": "kolar",
    "bangarapet": "kolar",
    "malur": "kolar",
    "mulbagal": "kolar",
    "srinivaspur": "kolar",
    
    "mandya": "mandya",
    "maddur": "mandya",
    "malavalli": "mandya",
    "pandavapura": "mandya",
    "srirangapatna": "mandya",
    "kr pet": "mandya",
    "k.r. pet": "mandya",
    "nagamangala": "mandya",
    
    "mysuru": "mysuru",
    "mysore": "mysuru",
    "nanjangud": "mysuru",
    "t narasipura": "mysuru",
    "t. narasipura": "mysuru",
    "hunsur": "mysuru",
    "piriyapatna": "mysuru",
    "hd kote": "mysuru",
    "h.d. kote": "mysuru",
    "kr nagar": "mysuru",
    
    "tumakuru": "tumakuru",
    "tumkur": "tumakuru",
    "tiptur": "tumakuru",
    "madhugiri": "tumakuru",
    "sira": "tumakuru",
    "kunigal": "tumakuru",
    "gubbi": "tumakuru",
    "koratagere": "tumakuru",
    "pavagada": "tumakuru",
    
    "hassan": "hassan",
    "sakleshpur": "hassan",
    "channarayapatna": "hassan",
    "arsikere": "hassan",
    "belur": "hassan",
    "arkalgud": "hassan",
    
    "chikkaballapura": "chikkaballapura",
    "chickballapur": "chikkaballapura",
    "gauribidanur": "chikkaballapura",
    "bagepalli": "chikkaballapura",
    "sidlaghatta": "chikkaballapura",
    "chintamani": "chikkaballapura",
    
    "bellary": "bellary",
    "ballari": "bellary",
    "siruguppa": "bellary",
    "sandur": "bellary",
    "kampli": "bellary",
    
    "bengaluru": "bengaluru",
    "bangalore": "bengaluru",
    "bengaluru urban": "bengaluru",
    "bengaluru rural": "bengaluru",
    "anekal": "bengaluru",
    "hosakote": "bengaluru",
    "devanahalli": "bengaluru",
    "nelamangala": "bengaluru",
    "doddaballapura": "bengaluru",
    
    "belgaum": "belgaum",
    "belagavi": "belgaum",
    "gokak": "belgaum",
    "chikkodi": "belgaum",
    "athani": "belgaum",
    "bailhongal": "belgaum",
    "hukkeri": "belgaum",
    
    "davangere": "davangere",
    "harihara": "davangere",
    "honnali": "davangere",
    "channagiri": "davangere",
    "jagalur": "davangere",
    
    "shimoga": "shimoga",
    "shivamogga": "shimoga",
    "bhadravati": "shimoga",
    "sagar": "shimoga",
    "shikaripura": "shimoga",
    "thirthahalli": "shimoga",
    
    "punjab": "punjab",
    "ludhiana": "punjab",
    "patiala": "punjab",
    "bhatinda": "punjab",
    "khanna": "punjab",
    "amritsar": "punjab",
    
    "maharashtra": "maharashtra",
    "nashik": "maharashtra",
    "lasalgaon": "maharashtra",
    "pune": "maharashtra",
    "baramati": "maharashtra",
    "akola": "maharashtra",
    
    "andhra pradesh": "andhra_pradesh",
    "andhra": "andhra_pradesh",
    "guntur": "andhra_pradesh",
    "krishna": "andhra_pradesh",
    "vijayawada": "andhra_pradesh"
}


from backend.taluk_data import TALUK_INTELLIGENCE, get_taluk_advisory, synthesize_taluk_advisory, normalize_taluk_key


def get_regional_advisory(area_query: str, district: Optional[str] = None, taluk: Optional[str] = None) -> Dict[str, Any]:
    """
    Search and return agro-climatic crop suitability, projected yield,
    and market intelligence for a specific taluk or broader district.
    If a taluk is queried, returns granular taluk-level recommendations.
    """
    # 1. If explicit taluk is passed, prioritize taluk lookup
    target_taluk = taluk.strip() if taluk else ""
    if not target_taluk:
        # Check if area_query mentions a taluk e.g. "Srinivaspur Taluk (Kolar)" or "Srinivaspur"
        taluk_candidate = normalize_taluk_key(area_query)
        if taluk_candidate in TALUK_INTELLIGENCE:
            target_taluk = taluk_candidate
        else:
            # Check if any known taluk is in area_query
            for t_key in TALUK_INTELLIGENCE:
                if t_key in area_query.lower() or area_query.lower() in t_key:
                    target_taluk = t_key
                    break

    if target_taluk:
        taluk_data = get_taluk_advisory(target_taluk)
        if taluk_data:
            taluk_data["query_requested"] = area_query
            taluk_data["matched_explicitly"] = True
            return taluk_data

    # 2. Check if query is a taluk under a known district (even if not in hardcoded TALUK_INTELLIGENCE)
    clean_q = normalize_taluk_key(area_query)
    
    # 2a. Priority 1: Exact match in known taluks list
    for dist_key, dist_data in REGIONAL_DATA.items():
        for t in dist_data.get("taluks", []):
            if normalize_taluk_key(t) == clean_q:
                synth_data = synthesize_taluk_advisory(t, dist_data)
                synth_data["query_requested"] = area_query
                synth_data["matched_explicitly"] = True
                return synth_data

    # 2b. Priority 2: Substring or word match in known taluks list
    for dist_key, dist_data in REGIONAL_DATA.items():
        for t in dist_data.get("taluks", []):
            t_norm = normalize_taluk_key(t)
            if len(t_norm) >= 4 and (t_norm in clean_q or clean_q in t_norm):
                synth_data = synthesize_taluk_advisory(t, dist_data)
                synth_data["query_requested"] = area_query
                synth_data["matched_explicitly"] = True
                return synth_data

    # 3. Otherwise, treat as District / Region query
    q = area_query.strip().lower()
    normalized_key = AREA_ALIASES.get(q)
    
    if not normalized_key:
        for alias, key in AREA_ALIASES.items():
            if alias in q or q in alias:
                normalized_key = key
                break
                
    if not normalized_key or normalized_key not in REGIONAL_DATA:
        normalized_key = "kolar"
        matched_explicitly = False
    else:
        matched_explicitly = True
        
    data = REGIONAL_DATA[normalized_key].copy()
    data["query_requested"] = area_query
    data["matched_explicitly"] = matched_explicitly
    data["is_taluk"] = False
    if matched_explicitly and q != normalized_key and q != data.get("district", "").lower():
        data["area_name"] = f"{area_query.title()} ({data['district']} District)"
    return data


def list_available_regions() -> List[Dict[str, Any]]:
    """Returns list of all indexed agricultural regions and taluks for autocomplete."""
    res = []
    # Districts
    for key, data in REGIONAL_DATA.items():
        res.append({
            "key": key,
            "type": "District",
            "name": data["area_name"],
            "area_name": data["area_name"],
            "state": data["state"],
            "district": data["district"],
            "taluk": "",
            "top_crop": data["recommended_crops"][0]["crop_name"] if data.get("recommended_crops") else "Crop Advisory"
        })
    # Taluks
    for key, data in TALUK_INTELLIGENCE.items():
        res.append({
            "key": f"taluk_{key}",
            "type": "Taluk",
            "name": f"{data['taluk']} ({data['district']})",
            "area_name": data["area_name"],
            "state": data["state"],
            "district": data["district"],
            "taluk": data["taluk"],
            "top_crop": data["recommended_crops"][0]["crop_name"] if data.get("recommended_crops") else "Crop Advisory"
        })
    return res

