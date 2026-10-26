"""
Grounded Agricultural Advisory Knowledge Base
Sourced strictly from official ICAR institutes and State Agricultural Universities (TNAU, UAS Bengaluru).
"""

from typing import Dict, Any
from backend.disease_data import TOMATO_DISEASE_KNOWLEDGE

# Non-tomato grounded advisory information
MULTI_CROP_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "rice": {
        "crop_name": "Rice / Paddy",
        "scientific_name": "Oryza sativa",
        "research_institute": "ICAR-National Rice Research Institute (NRRI), Cuttack",
        "overview": "Rice is India's principal kharif cereal. High humidity and standing water create conducive microclimates for fungal and bacterial leaf blights.",
        "major_diseases": [
            {
                "disease_name": "Bacterial Leaf Blight",
                "scientific_name": "Xanthomonas oryzae pv. oryzae",
                "symptoms": "Water-soaked lesions starting from leaf tips and margins, progressing into wavy yellow-white stripes along the blade.",
                "favorable_conditions": "Heavy rainfall, high humidity (>85%), temperatures 25-30°C, and high nitrogen application.",
                "management": "Avoid excess nitrogen fertilizer; drain excess standing water; spray Copper Hydroxide (2.5 g/L) + Streptocycline (1 g/10 L); grow resistant varieties like Swarna Sub1 or Improved Samba Mahsuri.",
                "expert_contact": "Contact local District Agricultural Officer if tip wilting exceeds 20% of the tillers."
            },
            {
                "disease_name": "Rice Blast",
                "scientific_name": "Magnaporthe oryzae (Pyricularia oryzae)",
                "symptoms": "Spindle-shaped or eye-shaped spots with grey or whitish centers and brown margins on leaf blades (leaf blast) and necrotic darkening at panicle base (neck blast).",
                "favorable_conditions": "Intermittent rain, cloudy weather, night temperatures 20-24°C, and leaf wetness exceeding 10 hours.",
                "management": "Treat seeds with Tricyclazole 75% WP @ 2g/kg; spray Tricyclazole @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L at early boot stage.",
                "expert_contact": "Notify KVK immediately if panicle neck blast is observed before milky grain stage."
            },
            {
                "disease_name": "Sheath Blight",
                "scientific_name": "Rhizoctonia solani",
                "symptoms": "Oval or greenish-grey water-soaked spots on leaf sheaths near water line; spots enlarge into irregular lesions with dark brown borders.",
                "favorable_conditions": "High plant density, continuous flooding, warm temperatures (28-32°C), and high humidity (>95%).",
                "management": "Maintain recommended plant spacing; avoid excessive split doses of urea; apply Hexaconazole 5% SC @ 2ml/L or Validamycin 3% L @ 2.5ml/L at tiller initiation.",
                "expert_contact": "Consult local extension officer if lesions reach the upper flag leaf sheath."
            }
        ]
    },
    "wheat": {
        "crop_name": "Wheat",
        "scientific_name": "Triticum aestivum",
        "research_institute": "ICAR-Indian Institute of Wheat and Barley Research (IIWBR), Karnal",
        "overview": "Wheat is India's premier rabi cereal crop. Rusts and bunts represent the foremost biosecurity concerns across Indo-Gangetic and Peninsular plains.",
        "major_diseases": [
            {
                "disease_name": "Yellow / Stripe Rust",
                "scientific_name": "Puccinia striiformis",
                "symptoms": "Bright yellow pustules (uredinia) arranged in distinct linear stripes along leaf veins; powder rubs off easily onto fingers.",
                "favorable_conditions": "Cool humid weather (10-15°C) with persistent fog, dew, and moisture.",
                "management": "Grow rust-resistant varieties like DBW 187, DBW 222, or HD 3086; spray Propiconazole 25% EC (Tilt) @ 1 ml/L at first appearance of yellow pustule stripes.",
                "expert_contact": "Yellow rust requires immediate reporting to the IIWBR Surveillance Network if detected in northern plains."
            },
            {
                "disease_name": "Brown / Leaf Rust",
                "scientific_name": "Puccinia triticina",
                "symptoms": "Round to oval orange-brown pustules scattered randomly across upper leaf surfaces without linear orientation.",
                "favorable_conditions": "Warmer temperatures (20-25°C) with leaf wetness in mid to late rabi season.",
                "management": "Spray Tebuconazole 25.9% EC @ 1 ml/L or Propiconazole 25% EC @ 1 ml/L; avoid late sowing.",
                "expert_contact": "Contact KVK if top two canopy leaves show greater than 10% pustule coverage."
            }
        ]
    },
    "potato": {
        "crop_name": "Potato",
        "scientific_name": "Solanum tuberosum",
        "research_institute": "ICAR-Central Potato Research Institute (CPRI), Shimla",
        "overview": "Potato requires vigilant foliar monitoring. Late Blight can devastate an entire field within 48 to 72 hours during foggy cool conditions.",
        "major_diseases": [
            {
                "disease_name": "Late Blight",
                "scientific_name": "Phytophthora infestans",
                "symptoms": "Water-soaked irregular pale to dark brown spots on leaf tips and margins; white cottony fungal growth on underside of leaves under high humidity; foul odor in infected fields.",
                "favorable_conditions": "Temperatures between 12-22°C with relative humidity >90% for more than 48 hours (CPRI Indo-Blightcast alert).",
                "management": "Preventive spray of Mancozeb 75% WP @ 2.5 g/L; curative spray with Cymoxanil + Mancozeb (Moximate @ 3 g/L) or Dimethomorph @ 1.5 g/L upon symptom onset.",
                "expert_contact": "Inform district horticulture office immediately when blight forecasting alerts trigger."
            },
            {
                "disease_name": "Early Blight",
                "scientific_name": "Alternaria solani",
                "symptoms": "Small brown angular spots exhibiting concentric rings ('target board' pattern) on older foliage, turning yellow around lesions.",
                "favorable_conditions": "Warm temperatures (24-28°C) alternating with rain or heavy dew.",
                "management": "Spray Chlorothalonil 75% WP @ 2 g/L or Azoxystrobin @ 1 ml/L; ensure balanced nitrogen and potassium fertilization.",
                "expert_contact": "Consult local horticulture officer if defoliation reaches middle canopy."
            }
        ]
    },
    "chilli": {
        "crop_name": "Chilli / Pepper",
        "scientific_name": "Capsicum annuum",
        "research_institute": "ICAR-Indian Institute of Horticultural Research (IIHR), Bengaluru",
        "overview": "Chilli crops face severe yield reductions from thrips, mites, Anthracnose fruit rot, and leaf curl virus complexes across south and central India.",
        "major_diseases": [
            {
                "disease_name": "Anthracnose / Die-back (Fruit Rot)",
                "scientific_name": "Colletotrichum capsici",
                "symptoms": "Circular sunken spots on ripe fruits with concentric black concentric rings containing acervuli; twigs dry out from top downwards (die-back).",
                "favorable_conditions": "Warm humid conditions (28-30°C) with frequent rain showers during fruit ripening.",
                "management": "Treat seed with Thiram @ 2 g/kg; spray Difenoconazole 25% EC @ 1 ml/L or Azoxystrobin @ 1 ml/L at flowering and fruit development.",
                "expert_contact": "Contact KVK if twig die-back exceeds 15% of plants in the plot."
            },
            {
                "disease_name": "Chilli Leaf Curl Virus",
                "scientific_name": "Begomovirus (vectored by Bemisia tabaci / Whitefly)",
                "symptoms": "Upward curling, puckering, and reduction in leaf size; thickened leaf veins; stunted bushy plant growth with no marketable fruit set.",
                "favorable_conditions": "Dry hot weather with high whitefly pest populations.",
                "management": "Set yellow sticky traps (15-20 traps/acre); spray Diafenthiuron 50% WP @ 1.2 g/L or Spiromesifen 22.9% SC @ 1 ml/L to manage vector whiteflies; uproot severely stunted plants.",
                "expert_contact": "Consult entomologist if whitefly counts exceed 5 per leaf."
            }
        ]
    },
    "cotton": {
        "crop_name": "Cotton",
        "scientific_name": "Gossypium hirsutum",
        "research_institute": "ICAR-Central Institute for Cotton Research (CICR), Nagpur",
        "overview": "Cotton is India's primary fiber commercial crop. Bacterial blight and fungal foliar diseases affect boll formation and lint quality.",
        "major_diseases": [
            {
                "disease_name": "Bacterial Blight / Angular Leaf Spot",
                "scientific_name": "Xanthomonas citri pv. malvacearum",
                "symptoms": "Small angular water-soaked spots bounded by leaf veins; lesions turn reddish-brown to black; black lesions on petioles and stems ('black arm' phase).",
                "favorable_conditions": "Warm temperatures (30-35°C), high humidity, wind-driven rain showers.",
                "management": "Acid delinting of seeds; foliar spray of Copper Oxychloride 50% WP @ 2.5 g/L + Streptocycline @ 1 g/10 L of water.",
                "expert_contact": "Contact CICR or local KVK if black arm phase threatens main branches."
            },
            {
                "disease_name": "Grey Mildew / Dahiya Disease",
                "scientific_name": "Ramularia areola",
                "symptoms": "Pale translucent angular spots on lower leaf surface covered by white frosty powdery mildew fungal growth; leaves turn yellow and drop prematurely.",
                "favorable_conditions": "Intermittent rain and high humidity (>80%) during boll development.",
                "management": "Spray Wettable Sulphur 80% WP @ 3 g/L or Carbendazim 50% WP @ 1 g/L or Kresoxim-methyl @ 1 ml/L.",
                "expert_contact": "Notify extension officer if premature defoliation occurs before boll maturation."
            }
        ]
    },
    "maize": {
        "crop_name": "Maize / Corn",
        "scientific_name": "Zea mays",
        "research_institute": "ICAR-Indian Institute of Maize Research (IIMR), Ludhiana",
        "overview": "Maize is cultivated across kharif, rabi, and spring seasons. Maydis and Turcicum blights are the most widespread foliar constraints.",
        "major_diseases": [
            {
                "disease_name": "Maydis Leaf Blight",
                "scientific_name": "Bipolaris maydis",
                "symptoms": "Small elongated diamond or rectangular-shaped lesions between leaf veins with light brown centers and reddish-brown borders.",
                "favorable_conditions": "Warm temperatures (24-30°C) and moderate to high humidity.",
                "management": "Plant resistant hybrids; spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L at first appearance of leaf spots.",
                "expert_contact": "Contact KVK if lesions progress upward past the ear leaf."
            }
        ]
    },
    "sugarcane": {
        "crop_name": "Sugarcane",
        "scientific_name": "Saccharum officinarum",
        "research_institute": "ICAR-Sugarcane Breeding Institute (SBI), Coimbatore",
        "overview": "Sugarcane diseases cause serious sucrose degradation in mills. Red Rot is known as the 'cancer of sugarcane'.",
        "major_diseases": [
            {
                "disease_name": "Red Rot",
                "scientific_name": "Colletotrichum falcatum",
                "symptoms": "Yellowing and withering of 3rd and 4th leaves from crown; split stalks show longitudinal reddening with characteristic crosswise white bands and alcohol sour odor.",
                "favorable_conditions": "Waterlogged fields, continuous cropping of susceptible varieties like Co 0238, high humidity.",
                "management": "Use certified seed setts; treat setts with Carbendazim (0.1%) or hot water (52°C for 30 min); practice crop rotation with paddy; plant resistant varieties like Co 0118, Co 15023.",
                "expert_contact": "Immediately report to the Sugar Mill Cane Officer upon identification of red rot."
            }
        ]
    },
    "groundnut": {
        "crop_name": "Groundnut / Peanut",
        "scientific_name": "Arachis hypogaea",
        "research_institute": "ICAR-Directorate of Groundnut Research (DGR), Junagadh",
        "overview": "Tikka disease (early and late leaf spots) causes massive defoliation in rainfed groundnut across Saurashtra and Rayalaseema.",
        "major_diseases": [
            {
                "disease_name": "Tikka Disease (Leaf Spot Complex)",
                "scientific_name": "Cercospora arachidicola (Early) / Phaeoisariopsis personata (Late)",
                "symptoms": "Dark brown to black subcircular spots on leaves with bright yellow halos (early) or circular black spots without yellow halos on leaf underside (late).",
                "favorable_conditions": "High humidity, prolonged leaf wetness, temperature 25-30°C.",
                "management": "Seed treatment with Mancozeb @ 3 g/kg; spray Carbendazim 12% + Mancozeb 63% WP (Saaf @ 2 g/L) or Tebuconazole @ 1 ml/L at 40-45 days after sowing.",
                "expert_contact": "Consult local agricultural officer if defoliation exceeds 25% during pod development."
            }
        ]
    },
    "soybean": {
        "crop_name": "Soybean",
        "scientific_name": "Glycine max",
        "research_institute": "ICAR-Indian Institute of Soybean Research (IISR), Indore",
        "overview": "Soybean in Madhya Pradesh and Maharashtra is vulnerable to Rust and Yellow Mosaic Virus during heavy monsoon breaks.",
        "major_diseases": [
            {
                "disease_name": "Soybean Rust",
                "scientific_name": "Phakopsora pachyrhizi",
                "symptoms": "Tiny polygon-shaped chlorotic lesions on lower leaf surfaces; pustules turn brown to reddish-brown and release tan spores; premature defoliation.",
                "favorable_conditions": "Cloudy weather, temperatures 18-28°C with relative humidity >80% for consecutive days.",
                "management": "Spray Hexaconazole 5% SC @ 2 ml/L or Propiconazole 25% EC @ 1 ml/L at first detection of lower leaf lesions.",
                "expert_contact": "Report immediately to ICAR-IISR if rust appears during pod-filling stage."
            }
        ]
    },
    "pulses": {
        "crop_name": "Pulses (Chickpea / Pigeon Pea)",
        "scientific_name": "Cicer arietinum / Cajanus cajan",
        "research_institute": "ICAR-Indian Institute of Pulses Research (IIPR), Kanpur",
        "overview": "Chickpea and pigeon pea are major protein crops. Vascular wilts and blight cause severe crop failure under soil moisture stress.",
        "major_diseases": [
            {
                "disease_name": "Fusarium Wilt",
                "scientific_name": "Fusarium oxysporum f. sp. ciceris",
                "symptoms": "Drooping of upper petioles and leaflets; foliage turns dull green or greyish; split stem reveals dark brown to black internal vascular discoloration.",
                "favorable_conditions": "Warm soil temperatures (25-30°C) with low soil moisture.",
                "management": "Seed treatment with Trichoderma viride @ 5 g/kg or Carbendazim @ 2 g/kg; practice 3-year crop rotation; plant resistant varieties like JG 11, JAKI 9218.",
                "expert_contact": "Consult pulses breeder or KVK agronomist for certified wilt-resistant seed varieties."
            }
        ]
    },
    "banana": {
        "crop_name": "Banana",
        "scientific_name": "Musa acuminata",
        "research_institute": "ICAR-National Research Centre for Banana (NRCB), Tiruchirappalli",
        "overview": "Banana production in Tamil Nadu, Maharashtra, and Karnataka requires strict monitoring for fungal Sigatoka spots and Fusarium wilt.",
        "major_diseases": [
            {
                "disease_name": "Sigatoka Leaf Spot",
                "scientific_name": "Pseudocercospora musae / Pseudocercospora fijiensis",
                "symptoms": "Small reddish-brown streaks parallel to leaf veins, enlarging into elliptical spots with dark brown margins and grey centers; causes rapid leaf dry-up.",
                "favorable_conditions": "Warm humid conditions (25-28°C), high rainfall, dense planting, poor drainage.",
                "management": "Remove and burn severely infected leaves; spray Propiconazole 25% EC @ 1 ml/L + mineral oil (10 ml/L) or Tridemorph @ 1 ml/L at 25-day intervals during monsoon.",
                "expert_contact": "Contact NRCB helpline if yellowing affects upper 4 leaves of bearing plants."
            }
        ]
    },
    "mango": {
        "crop_name": "Mango",
        "scientific_name": "Mangifera indica",
        "research_institute": "ICAR-Central Institute for Subtropical Horticulture (CISH), Lucknow",
        "overview": "Mango orchard management focuses on protecting blossoming panicles and fruit from Anthracnose and powdery mildew.",
        "major_diseases": [
            {
                "disease_name": "Mango Anthracnose",
                "scientific_name": "Colletotrichum gloeosporioides",
                "symptoms": "Dark brown to black angular necrotic spots on leaves; panicle blight leading to flower drop; tear-stain black lesions on maturing fruit.",
                "favorable_conditions": "Frequent rain, morning dew, temperature 25-30°C during flowering.",
                "management": "Spray Copper Oxychloride 50% WP @ 3 g/L or Azoxystrobin @ 1 ml/L prior to blossom opening and during fruit development.",
                "expert_contact": "Consult horticulture officer if panicle blight exceeds 20% in the orchard."
            }
        ]
    },
    "onion": {
        "crop_name": "Onion",
        "scientific_name": "Allium cepa",
        "research_institute": "ICAR-Directorate of Onion and Garlic Research (DOGR), Pune",
        "overview": "Onion foliage diseases decrease bulb sizing drastically in Maharashtra, Karnataka, and Madhya Pradesh.",
        "major_diseases": [
            {
                "disease_name": "Purple Blotch",
                "scientific_name": "Alternaria porri",
                "symptoms": "Small sunken whitish spots with purple or dark reddish centers on leaves and seed stalks; spots expand rapidly girdling the leaf and causing it to break over.",
                "favorable_conditions": "High relative humidity (80-90%), warm temperatures (28-30°C), and dew.",
                "management": "Seed treatment with Thiram @ 2.5 g/kg; foliar spray of Difenoconazole 25% EC @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L with sticker (Sandovit @ 0.5 ml/L).",
                "expert_contact": "Contact DOGR or local KVK if leaf tip purple discoloration covers more than 30% of field."
            }
        ]
    }
}

def get_crop_advisory(crop_id_or_name: str) -> Dict[str, Any]:
    """Retrieves grounded agricultural advisory for a crop."""
    from backend.crop_registry import normalize_crop_id
    from backend.disease_data import CROP_DISEASE_DATABASE, TOMATO_DISEASE_KNOWLEDGE
    crop_id = normalize_crop_id(crop_id_or_name)

    if crop_id == "tomato":
        return {
            "crop_name": "Tomato",
            "scientific_name": "Solanum lycopersicum",
            "research_institute": "ICAR-Indian Institute of Horticultural Research (IIHR), Bengaluru",
            "overview": "Tomato is one of India's major vegetable crops. VMamba AI selective scan model is trained on 10 tomato leaf classes.",
            "diseases": TOMATO_DISEASE_KNOWLEDGE
        }

    info = MULTI_CROP_KNOWLEDGE.get(crop_id, {
        "crop_name": crop_id_or_name,
        "research_institute": "ICAR National Agricultural Advisory Portal",
        "overview": f"Grounded agricultural advisory for {crop_id_or_name}.",
        "major_diseases": []
    })
    res = dict(info)
    res["diseases"] = CROP_DISEASE_DATABASE.get(crop_id, {})
    return res

