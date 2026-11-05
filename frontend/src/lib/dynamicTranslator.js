/**
 * dynamicTranslator.js
 *
 * Centralized dynamic content localization engine for:
 * 1. Karnataka Districts, Taluks & Indian Agricultural States
 * 2. Agro-Climatic Soils, Weather & APMC Market Centers
 * 3. Crop Recommendations, Varieties, Match Badges & ICAR Agronomic Tips
 * 4. Community Outbreak Alerts (Titles, Descriptions, Categories, Dates)
 */

export const DISTRICT_MAP = {
  // 31 Karnataka Districts
  'Bagalkot': { kn: 'ಬಾಗಲಕೋಟೆ', hi: 'बागलकोट' },
  'Ballari': { kn: 'ಬಳ್ಳಾರಿ', hi: 'बल्लारी' },
  'Belagavi': { kn: 'ಬೆಳಗಾವಿ', hi: 'बेलगावी' },
  'Bengaluru Rural': { kn: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', hi: 'बेंगलुरु ग्रामीण' },
  'Bengaluru Urban': { kn: 'ಬೆಂಗಳೂರು ನಗರ', hi: 'बेंगलुरु शहरी' },
  'Bidar': { kn: 'ಬೀದರ್', hi: 'बीदर' },
  'Chamarajanagar': { kn: 'ಚಾಮರಾಜನಗರ', hi: 'चामराजनगर' },
  'Chikkaballapura': { kn: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', hi: 'चिक्काबल्लापुर' },
  'Chikkamagaluru': { kn: 'ಚಿಕ್ಕಮಗಳೂರು', hi: 'चिक्कमगलुरु' },
  'Chitradurga': { kn: 'ಚಿತ್ರದುರ್ಗ', hi: 'चित्रदुर्ग' },
  'Dakshina Kannada': { kn: 'ದಕ್ಷಿಣ ಕನ್ನಡ', hi: 'दक्षिण कन्नड़' },
  'Davanagere': { kn: 'ದಾವಣಗೆರೆ', hi: 'दावणगेरे' },
  'Davangere': { kn: 'ದಾವಣಗೆರೆ', hi: 'दावणगेरे' },
  'Dharwad': { kn: 'ಧಾರವಾಡ', hi: 'धारवाड़' },
  'Gadag': { kn: 'ಗದಗ', hi: 'गदग' },
  'Hassan': { kn: 'ಹಾಸನ', hi: 'हासन' },
  'Haveri': { kn: 'ಹಾವೇರಿ', hi: 'हावेरी' },
  'Kalaburagi': { kn: 'ಕಲಬುರಗಿ', hi: 'कलबुर्गी' },
  'Kodagu': { kn: 'ಕೊಡಗು', hi: 'कोडगु' },
  'Kolar': { kn: 'ಕೋಲಾರ', hi: 'कोलार' },
  'Koppal': { kn: 'ಕೊಪ್ಪಳ', hi: 'कोप्पल' },
  'Mandya': { kn: 'ಮಂಡ್ಯ', hi: 'मंड्या' },
  'Mysuru': { kn: 'ಮೈಸೂರು', hi: 'मैसूरु' },
  'Raichur': { kn: 'ರಾಯಚೂರು', hi: 'रायचूर' },
  'Ramanagara': { kn: 'ರಾಮನಗರ', hi: 'रामनगर' },
  'Shivamogga': { kn: 'ಶಿವಮೊಗ್ಗ', hi: 'शिवमोग्गा' },
  'Tumakuru': { kn: 'ತುಮಕೂರು', hi: 'तुमकुरु' },
  'Udupi': { kn: 'ಉಡುಪಿ', hi: 'उडुपी' },
  'Uttara Kannada': { kn: 'ಉತ್ತರ ಕನ್ನಡ', hi: 'उत्तर कन्नड़' },
  'Vijayapura': { kn: 'ವಿಜಯಪುರ', hi: 'विजयपुरा' },
  'Yadgir': { kn: 'ಯಾದಗಿರಿ', hi: 'यादगीर' },
  'Vijayanagara': { kn: 'ವಿಜಯನಗರ', hi: 'विजयनगर' },

  // Key Pan-India Agricultural States
  'Karnataka': { kn: 'ಕರ್ನಾಟಕ', hi: 'कर्नाटक' },
  'Maharashtra': { kn: 'ಮಹಾರಾಷ್ಟ್ರ', hi: 'महाराष्ट्र' },
  'Punjab': { kn: 'ಪಂಜಾಬ್', hi: 'पंजाब' },
  'Uttar Pradesh': { kn: 'ಉತ್ತರ ಪ್ರದೇಶ', hi: 'उत्तर प्रदेश' },
  'Madhya Pradesh': { kn: 'ಮಧ್ಯಪ್ರದೇಶ', hi: 'मध्य प्रदेश' },
  'Gujarat': { kn: 'ಗುಜರಾತ್', hi: 'गुजरात' },
  'Tamil Nadu': { kn: 'ತಮಿಳುನಾಡು', hi: 'तमिलनाडु' },
  'Andhra Pradesh': { kn: 'ಆಂಧ್ರಪ್ರದೇಶ', hi: 'आंध्र प्रदेश' },
  'Telangana': { kn: 'ತೆಲಂಗಾಣ', hi: 'तेलंगाना' },
  'Rajasthan': { kn: 'ರಾಜಸ್ಥಾನ', hi: 'राजस्थान' },
  'West Bengal': { kn: 'ಪಶ್ಚಿಮ ಬಂಗಾಳ', hi: 'पश्चिम बंगाल' },
  'Bihar': { kn: 'ಬಿಹಾರ', hi: 'बिहार' },
  'Haryana': { kn: 'ಹರಿಯಾಣ', hi: 'हरियाणा' },
  'Kerala': { kn: 'ಕೇರಳ', hi: 'केरल' },
  'Odisha': { kn: 'ಒಡಿಶಾ', hi: 'ओडिशा' },
  'Assam': { kn: 'ಅಸ್ಸಾಂ', hi: 'असम' }
};

export const TALUK_MAP = {
  // Chitradurga
  'Chitradurga': { kn: 'ಚಿತ್ರದುರ್ಗ', hi: 'चित्रदुर्ग' },
  'Challakere': { kn: 'ಚಳ್ಳಕೆರೆ', hi: 'चल्लाकेरे' },
  'Hiriyur': { kn: 'ಹಿರಿಯೂರು', hi: 'हिरियूर' },
  'Holalkere': { kn: 'ಹೊಳಲ್ಕೆರೆ', hi: 'होललकेरे' },
  'Hosadurga': { kn: 'ಹೊಸದುರ್ಗ', hi: 'होसादुर्गा' },
  'Molakalmuru': { kn: 'ಮೊಳಕಾಲ್ಮುರು', hi: 'मोलाकालमुरु' },

  // Kolar
  'Bangarapet': { kn: 'ಬಂಗಾರಪೇಟೆ', hi: 'बंगरपेट' },
  'Bangarpet': { kn: 'ಬಂಗಾರಪೇಟೆ', hi: 'बंगरपेट' },
  'Malur': { kn: 'ಮಾಲೂರು', hi: 'मालूर' },
  'Mulbagal': { kn: 'ಮುಳುಬಾಗಿಲು', hi: 'मुलबागल' },
  'Srinivaspur': { kn: 'ಶ್ರೀನಿವಾಸಪುರ', hi: 'श्रीनिवासपुर' },

  // Davangere
  'Harihara': { kn: 'ಹರಿಹರ', hi: 'हरिहर' },
  'Honnali': { kn: 'ಹೊನ್ನಾಳಿ', hi: 'होन्नाली' },
  'Channagiri': { kn: 'ಚನ್ನಗಿರಿ', hi: 'चन्नगिरी' },
  'Jagalur': { kn: 'ಜಗಳೂರು', hi: 'जगलूर' },
  'Nyamathi': { kn: 'ನ್ಯಾಮತಿ', hi: 'न्यामती' },

  // Belagavi
  'Athani': { kn: 'ಅಥಣಿ', hi: 'अथणी' },
  'Bailhongal': { kn: 'ಬೈಲಹೊಂಗಲ', hi: 'बैलहोंगल' },
  'Chikkodi': { kn: 'ಚಿಕ್ಕೋಡಿ', hi: 'चिक्कोडी' },
  'Gokak': { kn: 'ಗೋಕಾಕ್', hi: 'गोकाक' },
  'Hukkeri': { kn: 'ಹುಕ್ಕೇರಿ', hi: 'हुक्केरी' },
  'Khanapur': { kn: 'ಖಾನಾಪುರ', hi: 'खानापुर' },
  'Kittur': { kn: 'ಕಿತ್ತೂರು', hi: 'कित्तूर' },
  'Mudalgi': { kn: 'ಮೂಡಲಗಿ', hi: 'मूदलगी' },
  'Nippani': { kn: 'ನಿಪ್ಪಾಣಿ', hi: 'निप्पाणी' },
  'Kagwad': { kn: 'ಕಾಗವಾಡ', hi: 'कागवाड़' },
  'Raibag': { kn: 'ರಾಯಬಾಗ', hi: 'रायबाग' },
  'Ramdurg': { kn: 'ರಾಮದುರ್ಗ', hi: 'रामदुर्ग' },
  'Saundatti': { kn: 'ಸವದತ್ತಿ', hi: 'सौंदत्ती' },
  'Yaragatti': { kn: 'ಯರಗಟ್ಟಿ', hi: 'यारगट्टी' },

  // Mandya
  'Maddur': { kn: 'ಮದ್ದೂರು', hi: 'मद्दूर' },
  'Malavalli': { kn: 'ಮಳವಳ್ಳಿ', hi: 'मलवल्ली' },
  'Pandavapura': { kn: 'ಪಾಂಡವಪುರ', hi: 'पांडवपुरा' },
  'Nagamangala': { kn: 'ನಾಗಮಂಗಲ', hi: 'नागमंगला' },
  'Krishnarajpet': { kn: 'ಕೃಷ್ಣರಾಜಪೇಟೆ', hi: 'कृष्णराजपेट' },
  'Srirangapatna': { kn: 'ಶ್ರೀರಂಗಪಟ್ಟಣ', hi: 'श्रीरंगपट्टण' },

  // Dharwad
  'Hubballi': { kn: 'ಹುಬ್ಬಳ್ಳಿ', hi: 'हुबली' },
  'Hubli': { kn: 'ಹುಬ್ಬಳ್ಳಿ', hi: 'हुबली' },
  'Kalghatgi': { kn: 'ಕಲಘಟಗಿ', hi: 'कलघटगी' },
  'Kundgol': { kn: 'ಕುಂದಗೋಳ', hi: 'कुंदगोल' },
  'Navalgund': { kn: 'ನವಲಗುಂದ', hi: 'नवलगुंड' },
  'Alnavar': { kn: 'ಅಳ್ನಾವರ', hi: 'अलनावर' },
  'Annigeri': { kn: 'ಅಣ್ಣಿಗೇರಿ', hi: 'अन्निगेरी' },

  // Shivamogga
  'Thirthahalli': { kn: 'ತೀರ್ಥಹಳ್ಳಿ', hi: 'तीर्थहल्ली' },
  'Bhadravathi': { kn: 'ಭದ್ರಾವತಿ', hi: 'भद्रावती' },
  'Sagara': { kn: 'ಸಾಗರ', hi: 'सागर' },
  'Shikaripura': { kn: 'ಶಿಕಾರಿಪುರ', hi: 'शिकारीपुर' },
  'Soraba': { kn: 'ಸೊರಬ', hi: 'सोरब' },
  'Hosanagara': { kn: 'ಹೊಸನಗರ', hi: 'होसनगर' },

  // Vijayapura
  'Indi': { kn: 'ಇಂಡಿ', hi: 'इंडि' },
  'Basavana Bagewadi': { kn: 'ಬಸವನ ಬಾಗೇವಾಡಿ', hi: 'बसवन बागेवाड़ी' },
  'Sindagi': { kn: 'ಸಿಂದಗಿ', hi: 'सिंदगी' },
  'Muddebihal': { kn: 'ಮುದ್ದೇಬಿಹಾಳ', hi: 'मुद्देबिहाल' },
  'Chadchan': { kn: 'ಚಡಚಣ', hi: 'चडचण' },
  'Tikota': { kn: 'ಟಿಕೋಟಾ', hi: 'टिकोटा' },
  'Babaleshwar': { kn: 'ಬಬಲೇಶ್ವರ', hi: 'बाबलेश्वर' },
  'Talikoti': { kn: 'ತಾಳಿಕೋಟೆ', hi: 'तालिकोटी' },
  'Devar Hippargi': { kn: 'ದೇವರ ಹಿಪ್ಪರಗಿ', hi: 'देवर हिप्परगी' },
  'Kolhar': { kn: 'ಕೊಲ್ಹಾರ', hi: 'कोल्हार' },

  // Mysuru
  'Nanjangud': { kn: 'ನಂಜನಗೂಡು', hi: 'नंजनगूड' },
  'Hunsur': { kn: 'ಹುಣಸೂರು', hi: 'हुणसूर' },
  'Periyapatna': { kn: 'ಪಿರಿಯಾಪಟ್ಟಣ', hi: 'पिरियापट्टण' },
  'T Narasipura': { kn: 'ಟಿ. ನರಸೀಪುರ', hi: 'टी. नरसीपुर' },
  'Heggadadevankote': { kn: 'ಹೆಗ್ಗಡದೇವನಕೋಟೆ', hi: 'हेग्गडदेवनकोटे' },
  'Saragur': { kn: 'ಸರಗೂರು', hi: 'सरगूर' },
  'Saligrama': { kn: 'ಸಾಲಿಗ್ರಾಮ', hi: 'सालिग्राम' },

  // Hassan
  'Channarayapatna': { kn: 'ಚನ್ನರಾಯಪಟ್ಟಣ', hi: 'चन्नरायपट्टण' },
  'Arsikere': { kn: 'ಅರಸೀಕೆರೆ', hi: 'अरसीकेरे' },
  'Belur': { kn: 'ಬೇಲೂರು', hi: 'बेलूर' },
  'Sakleshpur': { kn: 'ಸಕಲೇಶಪುರ', hi: 'सकलेशपुर' },
  'Holenarasipura': { kn: 'ಹೊಳೆನರಸೀಪುರ', hi: 'होलेनरसीपुर' },
  'Arkalgud': { kn: 'ಅರಕಲಗೂಡು', hi: 'अर्कलगूड' },
  'Alur': { kn: 'ಆಲೂರು', hi: 'आलूर' },

  // Tumakuru
  'Tiptur': { kn: 'ತಿಪಟೂರು', hi: 'तिप्तूर' },
  'Sira': { kn: 'ಶಿರಾ', hi: 'शिरा' },
  'Kunigal': { kn: 'ಕುಣಿಗಲ್', hi: 'कुणिगल' },
  'Madhugiri': { kn: 'ಮಧುಗಿರಿ', hi: 'मधुगिरी' },
  'Pavagada': { kn: 'ಪಾವಗಡ', hi: 'पावगड़ा' },
  'Gubbi': { kn: 'ಗುಬ್ಬಿ', hi: 'गुब्बी' },
  'Chikkanayakanahalli': { kn: 'ಚಿಕ್ಕನಾಯಕನಹಳ್ಳಿ', hi: 'चिक्कनायकनहल्ली' },
  'Koratagere': { kn: 'ಕೊರಟಗೆರೆ', hi: 'कोरटगेरे' },
  'Turuvekere': { kn: 'ತುರುವೇಕೆರೆ', hi: 'तुरुवेकेरे' }
};

export const CROP_TRANSLATIONS = {
  'Tomato': { kn: 'ಟೊಮ್ಯಾಟೊ', hi: 'टमाटर' },
  'Potato': { kn: 'ಆಲೂಗಡ್ಡೆ', hi: 'आलू' },
  'Rice / Paddy': { kn: 'ಭತ್ತ / ಅಕ್ಕಿ', hi: 'धान / चावल' },
  'Rice': { kn: 'ಭತ್ತ', hi: 'धान' },
  'Paddy': { kn: 'ಭತ್ತ', hi: 'धान' },
  'Wheat': { kn: 'ಗೋಧಿ', hi: 'गेहूं' },
  'Maize': { kn: 'ಮೆಕ್ಕೆಜೋಳ', hi: 'मक्का' },
  'Maize / Corn': { kn: 'ಮೆಕ್ಕೆಜೋಳ', hi: 'मक्का' },
  'Sugarcane': { kn: 'ಕಬ್ಬು', hi: 'गन्ना' },
  'Cotton': { kn: 'ಹತ್ತಿ', hi: 'कपास' },
  'Groundnut / Peanut': { kn: 'ಕಡಲೆಕಾಯಿ / ನೆಲಗಡಲೆ', hi: 'मूंगफली' },
  'Groundnut': { kn: 'ಕಡಲೆಕಾಯಿ', hi: 'मूंगफली' },
  'Peanut': { kn: 'ಕಡಲೆಕಾಯಿ', hi: 'मूंगफली' },
  'Onion': { kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज' },
  'Arecanut': { kn: 'ಅಡಿಕೆ', hi: 'सुपारी' },
  'Mango': { kn: 'ಮಾವಿನಹಣ್ಣು', hi: 'आम' },
  'Banana': { kn: 'ಬಾಳೆಹಣ್ಣು', hi: 'केला' },
  'Coconut': { kn: 'ತೆಂಗಿನಕಾಯಿ', hi: 'नारियल' },
  'Coffee': { kn: 'ಕಾಫಿ', hi: 'कॉफ़ी' },
  'Soybean': { kn: 'ಸೋಯಾಬೀನ್', hi: 'सोयाबीन' },
  'Pulses / Red Gram (Tur)': { kn: 'ತೊಗರಿ ಬೇಳೆ (ತೂರ್)', hi: 'अरहर / तूर दाल' },
  'Bengal Gram (Chana)': { kn: 'ಕಡಲೆ ಕಾಳು (ಚನಾ)', hi: 'चना' },
  'Mustard': { kn: 'ಸಾಸಿವೆ', hi: 'सरसों' },
  'Chilli': { kn: 'ಮೆಣಸಿನಕಾಯಿ', hi: 'मिर्च' },
  'Chilli (Byadagi / Guntur)': { kn: 'ಬ್ಯಾಡಗಿ / ಗುಂಟೂರು ಮೆಣಸಿನಕಾಯಿ', hi: 'ब्याडगी / गुंटूर मिर्च' },
  'Ginger': { kn: 'ಶುಂಠಿ', hi: 'अदरक' },
  'Turmeric': { kn: 'ಅರಿಶಿನ', hi: 'हल्दी' },
  'Jute': { kn: 'ಸೆಣಬು', hi: 'पटसन / जूट' }
};

export const SOIL_TRANSLATIONS = {
  'Red Sandy Loam & Medium Black Soils': {
    kn: 'ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಮತ್ತು ಮಧ್ಯಮ ಕಪ್ಪು ಮಣ್ಣು',
    hi: 'लाल रेतीली दोमट और मध्यम काली मिट्टी'
  },
  'Red Sandy Loam & Gravelly Clay Loam (Well Drained)': {
    kn: 'ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಮತ್ತು ಜಲ್ಲಿ ಜೇಡಿಮಣ್ಣು (ಉತ್ತಮ ನೀರು ಬಸಿದುಹೋಗುವ ಮಣ್ಣು)',
    hi: 'लाल रेतीली दोमट और कंकड़युक्त दोमट मिट्टी (अच्छी जल निकासी)'
  },
  'Deep Black Clay Vertisols (High Moisture Retention)': {
    kn: 'ಆಳವಾದ ಕಪ್ಪು ಜೇಡಿಮಣ್ಣು (ಹೆಚ್ಚು ತೇವಾಂಶ ಧಾರಣ ಶಕ್ತಿ)',
    hi: 'गहरी काली मिट्टी (उच्च नमी धारण क्षमता)'
  },
  'Alluvial River Basin & Coastal Loam': {
    kn: 'ಮೆಕ್ಕಲು ನದಿ ಬಯಲು ಮತ್ತು ಕರಾವಳಿ ಜೇಡಿಮಣ್ಣು',
    hi: 'जलोढ़ नदी बेसिन और तटीय दोमट मिट्टी'
  },
  'Red Loam & Coastal Sandy Alluvium': {
    kn: 'ಕೆಂಪು ಜೇಡಿಮಣ್ಣು ಮತ್ತು ಕರಾವಳಿ ಮರಳು ಮೆಕ್ಕಲು',
    hi: 'लाल दोमट और तटीय रेतीली जलोढ़ मिट्टी'
  },
  'Laterite & Forest Sandy Clay Loam': {
    kn: 'ಲ್ಯಾಟರೈಟ್ (ಜಂಬಿಟ್ಟಿಗೆ) ಮತ್ತು ಅರಣ್ಯ ಮರಳು ಜೇಡಿಮಣ್ಣು',
    hi: 'लेटराइट और वन रेतीली चिकनी दोमट मिट्टी'
  }
};

export const MARKET_TRANSLATIONS = {
  'Chitradurga APMC Market / Chitradurga Main Yard': {
    kn: 'ಚಿತ್ರದುರ್ಗ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ / ಮುಖ್ಯ ಯಾರ್ಡ್',
    hi: 'चित्रदुर्ग एपीएमसी मंडी / मुख्य यार्ड'
  },
  'Chitradurga / Challakere Oil Market': {
    kn: 'ಚಿತ್ರದುರ್ಗ / ಚಳ್ಳಕೆರೆ ಎಣ್ಣೆಬೀಜ ಮಾರುಕಟ್ಟೆ',
    hi: 'चित्रदुर्ग / चल्लाकेरे तिलहन मंडी'
  },
  'Kolar APMC (Asia\'s Second Largest Tomato Market)': {
    kn: 'ಕೋಲಾರ ಎಪಿಎಂಸಿ (ಏಷ್ಯಾದ 2ನೇ ಅತಿ ದೊಡ್ಡ ಟೊಮ್ಯಾಟೊ ಮಾರುಕಟ್ಟೆ)',
    hi: 'कोलार एपीएमसी (एशिया की दूसरी सबसे बड़ी टमाटर मंडी)'
  },
  'Srinivaspur Fruit Market': {
    kn: 'ಶ್ರೀನಿವಾಸಪುರ ಹಣ್ಣಿನ ಮಾರುಕಟ್ಟೆ',
    hi: 'श्रीनिवासपुर फल मंडी'
  },
  'Davangere APMC (Major Corn & Grain Terminal)': {
    kn: 'ದಾವಣಗೆರೆ ಎಪಿಎಂಸಿ (ಪ್ರಮುಖ ಜೋಳ ಮತ್ತು ಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ)',
    hi: 'दावणगेरे एपीएमसी (प्रमुख मक्का एवं अनाज मंडी)'
  },
  'Belagavi Sugar & Veg APMC': {
    kn: 'ಬೆಳಗಾವಿ ಸಕ್ಕರೆ ಮತ್ತು ತರಕಾರಿ ಎಪಿಎಂಸಿ',
    hi: 'बेलगावी चीनी एवं सब्जी एपीएमसी'
  },
  'Mandya Jaggery & Rice APMC': {
    kn: 'ಮಂಡ್ಯ ಬೆಲ್ಲ ಮತ್ತು ಭತ್ತದ ಎಪಿಎಂಸಿ',
    hi: 'मंड्या गुड़ और धान एपीएमसी'
  },
  'Hubballi Cotton & Pulse Terminal': {
    kn: 'ಹುಬ್ಬಳ್ಳಿ ಹತ್ತಿ ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯ ಮಾರುಕಟ್ಟೆ',
    hi: 'हुबली कपास एवं दलहन टर्मिनल'
  },
  'Shivamogga / Thirthahalli Areca Market': {
    kn: 'ಶಿವಮೊಗ್ಗ / ತೀರ್ಥಹಳ್ಳಿ ಅಡಿಕೆ ಮಾರುಕಟ್ಟೆ',
    hi: 'शिवमोग्गा / तीर्थहल्ली सुपारी मंडी'
  },
  'Vijayapura Onion & Pulse APMC': {
    kn: 'ವಿಜಯಪುರ ಈರುಳ್ಳಿ ಮತ್ತು ಬೇಳೆಕಾಳು ಎಪಿಎಂಸಿ',
    hi: 'विजयपुरा प्याज और दलहन एपीएमसी'
  }
};

export const SEASONS_MAP = {
  'Kharif': { kn: 'ಖಾರೀಫ್', hi: 'खरीफ' },
  'Rabi': { kn: 'ರಬಿ', hi: 'रबी' },
  'Summer': { kn: 'ಬೇಸಿಗೆ', hi: 'ग्रीष्म' },
  'Summer / Zaid': { kn: 'ಬೇಸಿಗೆ / ಝೈದ್', hi: 'ग्रीष्म / ज़ायद' },
  'Kharif & Rabi': { kn: 'ಖಾರೀಫ್ ಮತ್ತು ರಬಿ', hi: 'खरीफ और रबी' },
  'Annual': { kn: 'ವಾರ್ಷಿಕ ಬೆಳೆ', hi: 'वार्षिक फसल' },
  'Perennial': { kn: 'ಬಹುವಾರ್ಷಿಕ ಬೆಳೆ', hi: 'सदाबहार / बहुवर्षीय' },
  'Kharif & Late Rabi': { kn: 'ಖಾರೀಫ್ ಮತ್ತು ತಡ ರಬಿ', hi: 'खरीफ और देर रबी' },
  'Summer Harvest': { kn: 'ಬೇಸಿಗೆ ಕೊಯ್ಲು', hi: 'ग्रीष्म कटाई' }
};

export const SUITABILITY_MAP = {
  'Optimal (Best Fit)': { kn: 'ಅತ್ಯುತ್ತಮ (ಸೂಕ್ತ ಬೆಳೆ)', hi: 'सर्वोत्तम (सबसे उपयुक्त)' },
  'Highly Suitable': { kn: 'ಹೆಚ್ಚು ಸೂಕ್ತ', hi: 'अत्यधिक उपयुक्त' },
  'Moderately Suitable': { kn: 'ಮಧ್ಯಮ ಸೂಕ್ತ', hi: 'मध्यम उपयुक्त' },
  'Suitable': { kn: 'ಸೂಕ್ತ ಬೆಳೆ', hi: 'उपयुक्त' }
};

export const CROP_RATIONALE_MAP = {
  'groundnut': {
    kn: 'ಚಿತ್ರದುರ್ಗ ತಾಲೂಕಿನ ಮಣ್ಣು ಮತ್ತು ಸ್ಥಳೀಯ ನೀರಾವರಿಗೆ ಸೂಕ್ತವಾಗಿದೆ. ಚಳ್ಳಕೆರೆಯು ಸಾವಿರಾರು ಎಕರೆ ಮರಳು ಮಿಶ್ರಿತ ಭೂಮಿಯೊಂದಿಗೆ ಕರ್ನಾಟಕದ "ಎಣ್ಣೆಬೀಜ ನಗರಿ"ಯಾಗಿದೆ.',
    hi: 'चित्रदुर्ग तालुका की मिट्टी और सिंचाई के लिए पूर्णतः उपयुक्त है। चल्लाकेरे हजारों एकड़ रेतीली मिट्टी के साथ कर्नाटक का "ऑयल सिटी" माना जाता है।'
  },
  'onion': {
    kn: 'ಚಿತ್ರದುರ್ಗ ಮತ್ತು ವಿಜಯಪುರದ ಹಗಲು-ರಾತ್ರಿ ತಾಪಮಾನ ವ್ಯತ್ಯಾಸವು ದಟ್ಟವಾದ ಈರುಳ್ಳಿ ಗಡ್ಡೆ ಬೆಳೆಯಲು ಮತ್ತು ದೀರ್ಘ ಕಾಲ ಸಂಗ್ರಹಕ್ಕೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.',
    hi: 'दिन और रात के तापमान का अंतर प्याज की ठोस गांठों के निर्माण और भंडारण के लिए आदर्श है।'
  },
  'maize': {
    kn: 'ದಾವಣಗೆರೆ ಮತ್ತು ಚಿತ್ರದುರ್ಗದ ಸೂರ್ಯನ ಬೆಳಕು ಹಾಗೂ ಕೆಂಪು-ಕಪ್ಪು ಮಣ್ಣು ಗಟ್ಟಿಯಾದ, ತುಂಬಿದ ಮೆಕ್ಕೆಜೋಳದ ತೆನೆಗಳನ್ನು ಉತ್ಪಾದಿಸುತ್ತದೆ.',
    hi: 'भरपूर धूप और उपजाऊ मिट्टी मक्के के मजबूत और घने दानों के लिए बहुत अनुकूल है।'
  },
  'paddy': {
    kn: 'ಕಾಲುವೆ ನೀರಾವರಿ ಮತ್ತು ನದಿಯ ಮೆಕ್ಕಲು ಮಣ್ಣು ಹೆಚ್ಚಿನ ಇಳುವರಿ ಮತ್ತು ಭತ್ತದ ಆರೋಗ್ಯಕರ ಬೆಳವಣಿಗೆಯನ್ನು ಕಾಪಾಡುತ್ತದೆ.',
    hi: 'नहरी सिंचाई और उपजाऊ मिट्टी अधिक कल्लों और बंपर उपज के लिए उत्तम वातावरण प्रदान करती है।'
  },
  'cotton': {
    kn: 'ಆಳವಾದ ಕಪ್ಪು ಮಣ್ಣು ತೇವಾಂಶವನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಂಡು ಹತ್ತಿಯ ಕಾಯಿಗಳು ಅರಳಲು ಮತ್ತು ಉದ್ದನೆಯ ಎಳೆ ಬೆಳೆಯಲು ಸಹಕಾರಿಯಾಗಿದೆ.',
    hi: 'गहरी काली मिट्टी नमी को बनाए रखती है जो कपास के रेशे की उत्तम लंबाई और अच्छी गुणवत्ता के लिए जरूरी है।'
  },
  'tomato': {
    kn: 'ಉತ್ತಮ ನೀರು ಬಸಿಯುವ ಕೆಂಪು ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣು ಹಾಗೂ ಮಧ್ಯಮ ತಾಪಮಾನವು ಗಟ್ಟಿಯಾದ ಕಾಯಿ ಮತ್ತು ರೋಗ ನಿರೋಧಕತೆಗೆ ಪೂರಕವಾಗಿದೆ.',
    hi: 'हल्की दोमट मिट्टी और अनुकूल तापमान टमाटर के चमकदार फलों और रोग प्रतिरोधक क्षमता को बढ़ाते हैं।'
  },
  'sugarcane': {
    kn: 'ಉತ್ತಮ ಸೂರ್ಯನ ಬಿಸಿಲು ಮತ್ತು ಕೃಷ್ಣಾ/ಕಾವೇರಿ ಕಣಿವೆಯ ನೀರಾವರಿಯು ಅತ್ಯಧಿಕ ಸಕ್ಕರೆ ಇಳುವರಿ ಮತ್ತು ಕಬ್ಬಿನ ತೂಕವನ್ನು ನೀಡುತ್ತದೆ.',
    hi: 'प्रचुर धूप और नहरी सिंचाई गन्ने की भारी फसल और उच्च शर्करा प्राप्ति सुनिश्चित करती है।'
  },
  'arecanut': {
    kn: 'ಹೆಚ್ಚಿನ ಮಳೆ ಬೀಳುವ ಮಲೆನಾಡು ಕಣಿವೆಗಳು ಮತ್ತು ಸಾವಯವ ಮಣ್ಣು ಅಡಿಕೆ ತೋಟಗಳ ಸಮೃದ್ಧ ಬೆಳವಣಿಗೆಗೆ ಹೇಳಿಮಾಡಿಸಿದಂತಿವೆ.',
    hi: 'अधिक वर्षा वाले पहाड़ी क्षेत्र और जैविक मिट्टी सुपारी के बागानों के लिए सबसे उपयुक्त हैं।'
  }
};

export const ICAR_TIPS_MAP = {
  'groundnut': {
    kn: 'ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ಜಿಪ್ಸಮ್ ಹಾಕಿ; ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆಯೊಂದಿಗೆ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
    hi: 'सुइयां बनते समय जिप्सम डालें; ट्राइकोडर्मा विरिडी से बीजोपचार अवश्य करें।'
  },
  'onion': {
    kn: 'ನೇರಳೆ ಕಲೆ ರೋಗ ತಡೆಗಟ್ಟಲು ಬೆಳಗಿನ ಜಾವ ಮ್ಯಾಂಕೋಜೆಬ್ (2.5 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.',
    hi: 'बैंगनी धब्बा रोग से बचाव के लिए सुबह मैंकोजेब (2.5 ग्राम/लीटर) का छिड़काव करें।'
  },
  'maize': {
    kn: 'ಕತ್ತರಿಸುವ ಹುಳು (ಫಾಲ್ ಆರ್ಮಿವರ್ಮ್) ನಿಯಂತ್ರಣಕ್ಕೆ ಸುಳಿಗಳಲ್ಲಿ ಜೈವಿಕ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.',
    hi: 'फॉल आर्मीवर्म की रोकथाम के लिए पोंगे में कीटनाशक का सीधा छिड़काव करें।'
  },
  'tomato': {
    kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಮಲ್ಚಿಂಗ್ ಬಳಸಿ; ಮುಂಗಾರು ಮಳೆಯ ಸಮಯದಲ್ಲಿ ಆರಂಭಿಕ ಕರಕಲು ರೋಗದ ಬಗ್ಗೆ ನಿಗಾ ಇರಿಸಿ.',
    hi: 'मल्चिंग का उपयोग करें; बारिश के दौरान अगेती झुलसा रोग पर नियमित नजर रखें।'
  },
  'potato': {
    kn: 'ಬೀಜದ ಗೆಡ್ಡೆಗಳಿಗೆ ಶಿಲೀಂಧ್ರನಾಶಕ ಉಪಚಾರ ಮಾಡಿ; ಸಾಲುಗಳ ನಡುವೆ ಮಣ್ಣು ಏರಿಸಿ.',
    hi: 'बीज कंदों का उपचार करें और पंक्तियों के बीच मिट्टी चढ़ाना सुनिश्चित करें।'
  },
  'cotton': {
    kn: 'ಪ್ರತಿ ಎಕರೆಗೆ 5 ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಮತ್ತು 5% ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.',
    hi: 'प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं और 5% नीम तेल का छिड़काव करें।'
  },
  'sugarcane': {
    kn: 'ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ರಸಗೊಬ್ಬರ ನೀಡಿ; ಕೆಂಪು ಕೊಳೆ ರೋಗದ ಲಕ್ಷಣಗಳು ಕಂಡಲ್ಲಿ ತಕ್ಷಣ ಪ್ರತ್ಯೇಕಿಸಿ.',
    hi: 'ड्रिप से उर्वरक दें; लाल सड़न रोग दिखने पर संक्रमित पौधों को तुरंत नष्ट करें।'
  },
  'arecanut': {
    kn: 'ಮಳೆಗಾಲದ ಮುನ್ನ ಅಂಟು ದ್ರಾವಣದೊಂದಿಗೆ 1% ಬೋರ್ಡೋ ಮಿಶ್ರಣವನ್ನು ಸಿಂಪಡಿಸಿ.',
    hi: 'मानसून से पहले चिपकने वाले घोल के साथ 1% बोर्डो मिश्रण का छिड़काव करें।'
  }
};

// Verified Community Outbreak Alerts localization
export const ALERT_TRANSLATIONS = {
  // Mahali Arecanut
  'alert_manjunath_arecanut': {
    title: {
      kn: 'ಮೋಡ ಕವಿದ ಮಳೆಗಾಲದಲ್ಲಿ ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗ (ಮಹಾಳಿ) - ಉದುರುತ್ತಿರುವ ಕಾಯಿಗಳು',
      hi: 'बादल और बूंदाबांदी के दौरान सुपारी में महाली/कोलेरोगा फल सड़न रोग'
    },
    desc: {
      kn: 'ತೀರ್ಥಹಳ್ಳಿ ತಾಲೂಕಿನಲ್ಲಿ ಮಂಜು ಮತ್ತು ತೇವಾಂಶದಿಂದ ಅಡಿಕೆಯಲ್ಲಿ ತೀವ್ರ ಕೊಳೆರೋಗ ಕಂಡುಬಂದಿದ್ದು ಕಾಯಿಗಳು ಉದುರುತ್ತಿವೆ. ಮಧ್ಯಾಹ್ನದ ಮಳೆಗೂ ಮುನ್ನ ಅಂಟು ದ್ರಾವಣದೊಂದಿಗೆ 1% ಬೋರ್ಡೋ ಮಿಶ್ರಣವನ್ನು ತಕ್ಷಣ ಸಿಂಪಡಿಸಿ.',
      hi: 'तीर्थहल्ली में नमी के कारण सुपारी में गंभीर कोलेरोगा रोग देखा गया है और फल झड़ रहे हैं। बारिश से पहले तुरंत 1% बोर्डो मिश्रण का सुरक्षात्मक छिड़काव करें।'
    }
  },
  // Red Rot Sugarcane
  'alert_suresh_sugarcane': {
    title: {
      kn: '8 ತಿಂಗಳ ಕಬ್ಬಿನ ಕಾಂಡಗಳಲ್ಲಿ ಕೆಂಪು ಕೊಳೆ ರೋಗ (ರೆಡ್ ರಾಟ್) ಶಿಲೀಂಧ್ರ ಬಾಧೆ',
      hi: '8 महीने के गन्ने के डंठल में लाल सड़न (रेड रॉट) कवक का प्रकोप'
    },
    desc: {
      kn: 'ಮೇಲಿನಿಂದ 3 ಮತ್ತು 4 ನೇ ಎಲೆಗಳು ಅಕಾಲಿಕವಾಗಿ ಹಳದಿಯಾಗಿ ಒಣಗುತ್ತಿವೆ. ಕಬ್ಬಿನ ಕಾಂಡವನ್ನು ಸೀಳಿದಾಗ ಒಳಭಾಗವು ಬಿಳಿ ಪಟ್ಟೆಗಳೊಂದಿಗೆ ಗಾಢ ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದೆ. ಕಾಲುವೆ ನೀರು ಬಳಸುವ ರೈತರು ರೋಗಾಣುಗಳು ಹರಡದಂತೆ ತಕ್ಷಣ ನೀರು ಹರಿಸುವುದನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ.',
      hi: 'ऊपर से तीसरी और चौथी पत्तियां समय से पहले पीली होकर मुरझा रही हैं। तने को चीरने पर अंदर सफेद पट्टियों के साथ गहरा लाल रंग दिखाई देता है। नहर का पानी इस्तेमाल करने वाले किसान नालियों को अलग करें।'
    }
  },
  // Bacterial Leaf Blight
  'alert_basavaraj_paddy': {
    title: {
      kn: 'ನಿರಂತರ ಮಳೆಯ ನಂತರ ಭತ್ತದ ಬೆಳೆಯಲ್ಲಿ ದುಂಡಾಣು ಎಲೆ ಕರಕಲು (ಬಿಎಲ್‌ಬಿ) ರೋಗ ಉಲ್ಬಣ',
      hi: 'लगातार बारिश के बाद धान में बैक्टीरियल लीफ ब्लाइट (BLB) का तेजी से फैलाव'
    },
    desc: {
      kn: '4 ದಿನಗಳ ನಿರಂತರ ಮೋಡ ಮತ್ತು ತುಂತುರು ಮಳೆಯ ನಂತರ ಎಲೆಯ ಅಂಚುಗಳಲ್ಲಿ ಹಳದಿ ಕಲೆಗಳು ಕಾಣಿಸಿಕೊಂಡು ಒಣಗುತ್ತಿವೆ. ಯೂರಿಯಾ ಅಥವಾ ಸಾರಜನಕ ಗೊಬ್ಬರ ನೀಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ; ಬೆಳಗಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಎಕರೆಗೆ 500 ಗ್ರಾಂ ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಮತ್ತು 6 ಗ್ರಾಂ ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ ಸಿಂಪಡಿಸಿ.',
      hi: 'लगातार बारिश के बाद पत्तियों के किनारों पर पीले धब्बे दिख रहे हैं और पत्तियां सफेद होकर सूख रही हैं। यूरिया तुरंत रोकें; कॉपर ऑक्सीक्लोराइड + स्ट्रेप्टोसाइक्लिन का छिड़काव करें।'
    }
  },
  // Spotted Bollworm
  'alert_anand_cotton': {
    title: {
      kn: 'ಹತ್ತಿಯ ಆರಂಭಿಕ ಹೂಮೊಗ್ಗುಗಳಲ್ಲಿ ಚುಕ್ಕೆ ಕಾಯಿಕೊರಕ ಹುಳುವಿನ ಬಾಧೆ',
      hi: 'कपास की शुरुआती फूलों की कलियों में चित्तीदार सुंडी (बोलवर्म) का प्रकोप'
    },
    desc: {
      kn: 'ಹತ್ತಿಯ ಹೂಮೊಗ್ಗುಗಳು ಉದುರುತ್ತಿದ್ದು, ಎಳೆಯ ಕಾಯಿಗಳಿಗೆ ಹುಳುಗಳು ರಂಧ್ರ ಕೊರೆದು ಹಾನಿ ಮಾಡುತ್ತಿವೆ. ಎಕರೆಗೆ 5 ಮೋಹಕ (ಫೆರೋಮೋನ್) ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಹಾಗೂ 5% ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (ಎನ್‌ಎಸ್‌ಕೆಇ) ಸಿಂಪಡಿಸಿ.',
      hi: 'कपास के फूल और कलियां समय से पहले गिर रही हैं और सुंडी गोल छेद कर रही है। प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं और 5% नीम तेल का छिड़काव करें।'
    }
  },
  // Purple Blotch
  'alert_shivanand_onion': {
    title: {
      kn: 'ರಬಿ ಈರುಳ್ಳಿ ಬೆಳೆಯಲ್ಲಿ ಎಲೆಗಳ ತುದಿಯನ್ನು ಒಣಗಿಸುತ್ತಿರುವ ನೇರಳೆ ಕಲೆ ರೋಗ (ಪರ್ಪಲ್ ಬ್ಲಾಚ್)',
      hi: 'रबी प्याज की फसलों में पत्तियों को सुखाने वाला बैंगनी धब्बा (पर्पल ब्लॉच) रोग'
    },
    desc: {
      kn: 'ಈರುಳ್ಳಿ ಎಲೆಗಳ ಮೇಲೆ ನೇರಳೆ ಕಂದು ಬಣ್ಣದ ಕಲೆಗಳು ಕಾಣಿಸಿಕೊಂಡು ಎಲೆಗಳ ತುದಿಗಳು ಮಡಚಿಕೊಂಡು ಒಣಗುತ್ತಿವೆ. ಸ್ವಚ್ಛ ಬೆಳಗಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 2.5 ಗ್ರಾಂ ಮ್ಯಾಂಕೋಜೆಬ್ 75% ಡಬ್ಲ್ಯುಪಿ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
      hi: 'प्याज की पत्तियों पर बैंगनी-भूरे रंग के धब्बे दिख रहे हैं और पत्तियां मुड़कर सूख रही हैं। सुबह के समय 2.5 ग्राम मैंकोजेब प्रति लीटर पानी में मिलाकर छिड़कें।'
    }
  },
  // Early Blight Tomato
  'alert_ravi_tomato': {
    title: {
      kn: 'ಟೊಮ್ಯಾಟೊ ಕೆಳ ಎಲೆಗಳಲ್ಲಿ ಆರಂಭಿಕ ಕರಕಲು ರೋಗದ (ಅರ್ಲಿ ಬ್ಲೈಟ್) ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು',
      hi: 'टमाटर की निचली पत्तियों पर अगेती झुलसा (अर्ली ब्लाइट) के गोल छल्लेदार धब्बे'
    },
    desc: {
      kn: 'ಕೆಳ ಹಂತದ ಎಲೆಗಳ ಮೇಲೆ ಗುರಿ ಹಲಗೆಯಂತಹ ಕಂದು ಬಣ್ಣದ ಉಂಗುರಾಕಾರದ ಕಲೆಗಳು ಕಾಣಿಸಿಕೊಂಡಿವೆ. ಮಣ್ಣಿಗೆ ತಾಗುತ್ತಿರುವ ರೋಗಗ್ರಸ್ತ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೆಗೆಯಿರಿ ಮತ್ತು ತಾಮ್ರಯುಕ್ತ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.',
      hi: 'निचली पत्तियों पर गोल भूरे रंग के छल्लेदार धब्बे देखे गए हैं। संक्रमित निचली पत्तियों को छांटकर हटा दें और कॉपर फफूंदनाशी का छिड़काव करें।'
    }
  }
};

// Generic title & description translation matcher
export const translateAlertText = (text, lang) => {
  if (!text || lang === 'English') return text;
  const isKn = lang === 'Kannada';
  const lower = text.toLowerCase();

  // Pattern checks for common field alerts
  if (lower.includes('mahali') || lower.includes('koleroga')) {
    return isKn
      ? 'ಅಡಿಕೆಯಲ್ಲಿ ಕೊಳೆರೋಗ (ಮಹಾಳಿ) ಬಾಧೆ ಕಂಡುಬಂದಿದ್ದು ಕಾಯಿಗಳು ಉದುರುತ್ತಿವೆ. ತಕ್ಷಣ ಬೋರ್ಡೋ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.'
      : 'सुपारी में महाली/कोलेरोगा रोग के लक्षण दिखे हैं। तुरंत बोर्डो मिश्रण का छिड़काव करें।';
  }
  if (lower.includes('late blight')) {
    return isKn
      ? 'ಟೊಮ್ಯಾಟೊ/ಆಲೂಗಡ್ಡೆಯಲ್ಲಿ ತಡ ಕರಕಲು ರೋಗ (ಲೇಟ್ ಬ್ಲೈಟ್) ಮುನ್ನೆಚ್ಚರಿಕೆ. ರೋಗಗ್ರಸ್ತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದು ನಾಶಮಾಡಿ.'
      : 'टमाटर/आलू में पछेती झुलसा (लेट ब्लाइट) की चेतावनी। प्रभावित पत्तियों को तुरंत हटाकर नष्ट करें।';
  }
  if (lower.includes('early blight')) {
    return isKn
      ? 'ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು (ಆರಂಭಿಕ ಕರಕಲು ರೋಗ). ತಾಮ್ರ ಆಧಾರಿತ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.'
      : 'पत्तियों पर गोल भूरे छल्लेदार धब्बे (अगेती झुलसा)। कॉपर युक्त कवकनाशी का छिड़काव करें।';
  }
  if (lower.includes('red rot')) {
    return isKn
      ? 'ಕಬ್ಬಿನ ಕಾಂಡಗಳಲ್ಲಿ ಕೆಂಪು ಕೊಳೆ ರೋಗದ ಶಿಲೀಂಧ್ರ ಬಾಧೆ. ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ.'
      : 'गन्ने के तनों में लाल सड़न रोग। पानी का बहाव अलग करें ताकि संक्रमण न फैले।';
  }
  if (lower.includes('powdery mildew') || lower.includes('powdery')) {
    return isKn
      ? 'ಎಲೆಗಳ ಮೇಲ್ಮೈಯಲ್ಲಿ ಬಿಳಿ ಬೂದಿ ರೋಗ ಪತ್ತೆ. ಮುಂಜಾನೆ ಗಂಧಕದ ಪುಡಿ (ಸಲ್ಫರ್) ಸಿಂಪಡಿಸಿ.'
      : 'पत्तियों पर सफेद चूर्ण जैसे धब्बे (चूर्णिल आसिता)। सुबह सल्फर का छिड़काव करें।';
  }
  if (lower.includes('rice blast') || lower.includes('blast')) {
    return isKn
      ? 'ಭತ್ತದ ಬೆಳೆಯಲ್ಲಿ ಬೆಂಕಿ ರೋಗ (ರೈಸ್ ಬ್ಲಾಸ್ಟ್). ತೆನೆ ಬರುವ ಮುನ್ನ ಮುನ್ನೆಚ್ಚರಿಕಾ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.'
      : 'धान में झोंका/ब्लास्ट रोग की सूचना। सुरक्षात्मक कवकनाशी का छिड़काव करें।';
  }
  if (lower.includes('bacterial') || lower.includes('blb')) {
    return isKn
      ? 'ದುಂಡಾಣು ಎಲೆ ಕರಕಲು ರೋಗ. ಸಾರಜನಕ ರಸಗೊಬ್ಬರ ನೀಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ.'
      : 'बैक्टीरियल लीफ ब्लाइट रोग। नाइट्रोजन/यूरिया का उपयोग तुरंत बंद करें।';
  }
  if (lower.includes('bollworm')) {
    return isKn
      ? 'ಹತ್ತಿಯ ಹೂಮೊಗ್ಗುಗಳಲ್ಲಿ ಕಾಯಿಕೊರಕ ಹುಳುವಿನ ಬಾಧೆ. ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.'
      : 'कपास की कलियों में बोलवर्म सुंडी का प्रकोप। फेरोमोन ट्रैप लगाएं।';
  }
  if (lower.includes('purple blotch')) {
    return isKn
      ? 'ಈರುಳ್ಳಿಯಲ್ಲಿ ನೇರಳೆ ಕಲೆ ರೋಗ. ಮ್ಯಾಂಕೋಜೆಬ್ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.'
      : 'प्याज में पर्पल ब्लॉच रोग। मैंकोजेब कवकनाशी का छिड़काव करें।';
  }

  return text;
};

// -------------------------------------------------------------
// Public Localization Resolvers
// -------------------------------------------------------------

export const getLocalizedLocation = (name, lang) => {
  if (!name || lang === 'English') return name;
  const isKn = lang === 'Kannada';
  const clean = String(name).trim();

  // Check District
  if (DISTRICT_MAP[clean]) {
    return isKn ? DISTRICT_MAP[clean].kn : DISTRICT_MAP[clean].hi;
  }
  // Case-insensitive district check
  for (const [k, v] of Object.entries(DISTRICT_MAP)) {
    if (k.toLowerCase() === clean.toLowerCase()) {
      return isKn ? v.kn : v.hi;
    }
  }

  // Check Taluk
  if (TALUK_MAP[clean]) {
    return isKn ? TALUK_MAP[clean].kn : TALUK_MAP[clean].hi;
  }
  for (const [k, v] of Object.entries(TALUK_MAP)) {
    if (k.toLowerCase() === clean.toLowerCase()) {
      return isKn ? v.kn : v.hi;
    }
  }

  return clean;
};

export const getLocalizedCropName = (cropName, lang) => {
  if (!cropName || lang === 'English') return cropName;
  const isKn = lang === 'Kannada';
  const clean = String(cropName).trim();

  // Extract base crop if it contains parentheses e.g. "Groundnut / Peanut (TMV 2 / Kadiri 6)"
  const m = clean.match(/^([^(]+)(?:\((.*)\))?$/);
  const base = m ? m[1].trim() : clean;
  const variety = m && m[2] ? m[2].trim() : '';

  let localizedBase = base;
  if (CROP_TRANSLATIONS[base]) {
    localizedBase = isKn ? CROP_TRANSLATIONS[base].kn : CROP_TRANSLATIONS[base].hi;
  } else {
    for (const [k, v] of Object.entries(CROP_TRANSLATIONS)) {
      if (clean.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(base.toLowerCase())) {
        localizedBase = isKn ? v.kn : v.hi;
        break;
      }
    }
  }

  if (variety) {
    return `${localizedBase} (${variety})`;
  }
  return localizedBase;
};

export const getLocalizedSoil = (soilText, lang) => {
  if (!soilText || lang === 'English') return soilText;
  const isKn = lang === 'Kannada';
  if (SOIL_TRANSLATIONS[soilText]) {
    return isKn ? SOIL_TRANSLATIONS[soilText].kn : SOIL_TRANSLATIONS[soilText].hi;
  }
  for (const [k, v] of Object.entries(SOIL_TRANSLATIONS)) {
    if (k.toLowerCase() === soilText.toLowerCase() || soilText.toLowerCase().includes(k.toLowerCase())) {
      return isKn ? v.kn : v.hi;
    }
  }
  return soilText;
};

export const getLocalizedMarket = (marketText, lang) => {
  if (!marketText || lang === 'English') return marketText;
  const isKn = lang === 'Kannada';
  if (MARKET_TRANSLATIONS[marketText]) {
    return isKn ? MARKET_TRANSLATIONS[marketText].kn : MARKET_TRANSLATIONS[marketText].hi;
  }
  for (const [k, v] of Object.entries(MARKET_TRANSLATIONS)) {
    if (k.toLowerCase() === marketText.toLowerCase() || marketText.toLowerCase().includes(k.toLowerCase())) {
      return isKn ? v.kn : v.hi;
    }
  }
  // Dynamic fallback: replace English "APMC Market", "Main Yard"
  let res = marketText;
  if (isKn) {
    res = res.replace(/APMC/gi, 'ಎಪಿಎಂಸಿ')
      .replace(/Market/gi, 'ಮಾರುಕಟ್ಟೆ')
      .replace(/Main Yard/gi, 'ಮುಖ್ಯ ಯಾರ್ಡ್')
      .replace(/Fruit/gi, 'ಹಣ್ಣಿನ')
      .replace(/Oil/gi, 'ಎಣ್ಣೆಬೀಜ');
  } else {
    res = res.replace(/APMC/gi, 'एपीएमसी')
      .replace(/Market/gi, 'मंडी')
      .replace(/Main Yard/gi, 'मुख्य यार्ड')
      .replace(/Fruit/gi, 'फल')
      .replace(/Oil/gi, 'तिलहन');
  }
  return res;
};

export const getLocalizedSeason = (seasonText, lang) => {
  if (!seasonText || lang === 'English') return seasonText;
  const isKn = lang === 'Kannada';
  if (SEASONS_MAP[seasonText]) {
    return isKn ? SEASONS_MAP[seasonText].kn : SEASONS_MAP[seasonText].hi;
  }
  for (const [k, v] of Object.entries(SEASONS_MAP)) {
    if (k.toLowerCase() === String(seasonText).toLowerCase()) {
      return isKn ? v.kn : v.hi;
    }
  }
  return seasonText;
};

export const getLocalizedSuitability = (levelText, lang) => {
  if (!levelText || lang === 'English') return levelText;
  const isKn = lang === 'Kannada';
  if (SUITABILITY_MAP[levelText]) {
    return isKn ? SUITABILITY_MAP[levelText].kn : SUITABILITY_MAP[levelText].hi;
  }
  return levelText;
};

export const getLocalizedCropRationale = (cropId, lang, defaultText) => {
  if (lang === 'English') return defaultText;
  const isKn = lang === 'Kannada';
  const cId = String(cropId || '').toLowerCase();
  for (const [k, v] of Object.entries(CROP_RATIONALE_MAP)) {
    if (cId.includes(k)) {
      return isKn ? v.kn : v.hi;
    }
  }
  return defaultText;
};

export const getLocalizedIcarTip = (cropId, lang, defaultText) => {
  if (lang === 'English') return defaultText;
  const isKn = lang === 'Kannada';
  const cId = String(cropId || '').toLowerCase();
  for (const [k, v] of Object.entries(ICAR_TIPS_MAP)) {
    if (cId.includes(k)) {
      return isKn ? v.kn : v.hi;
    }
  }
  return defaultText;
};

export const getLocalizedAlert = (alert, lang) => {
  if (!alert) return alert;
  if (lang === 'English') return alert;
  const isKn = lang === 'Kannada';

  let title = alert.title || '';
  let desc = alert.description || '';

  // Direct ID match
  if (alert.id && ALERT_TRANSLATIONS[alert.id]) {
    const tr = ALERT_TRANSLATIONS[alert.id];
    title = isKn ? tr.title.kn : tr.title.hi;
    desc = isKn ? tr.desc.kn : tr.desc.hi;
  } else {
    title = translateAlertText(title, lang);
    desc = translateAlertText(desc, lang);
  }

  const localizedDistrict = getLocalizedLocation(alert.district, lang);
  const localizedTaluk = alert.taluk ? getLocalizedLocation(alert.taluk, lang) : '';
  const localizedCrop = getLocalizedCropName(alert.crop_name || alert.crop, lang);

  return {
    ...alert,
    title,
    description: desc,
    district: localizedDistrict,
    taluk: localizedTaluk,
    crop_name: localizedCrop,
    crop: localizedCrop
  };
};

export const formatLocalizedDate = (dateVal, lang) => {
  if (!dateVal) return '';
  const isKn = lang === 'Kannada';
  const isHi = lang === 'Hindi';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const day = d.getDate();
  const monthIdx = d.getMonth();

  const knMonths = ['ಜನ', 'ಫೆಬ್ರ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ', 'ಅಕ್ಟೋ', 'ನವೆಂ', 'ಡಿಸೆಂ'];
  const hiMonths = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अग', 'सितं', 'अक्तू', 'नवं', 'दिसಂ'];

  if (isKn) return `${day} ${knMonths[monthIdx]}`;
  if (isHi) return `${day} ${hiMonths[monthIdx]}`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
