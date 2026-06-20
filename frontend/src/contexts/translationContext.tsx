import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'AgriRakshak AI',
    'app.tagline': 'Smart Farming Assistant',
    'nav.dashboard': 'Dashboard',
    'nav.weather': 'Weather Forecast',
    'nav.crop': 'Crop Advisor',
    'nav.disease': 'Disease Scan',
    'nav.market': 'Market Prices',
    'nav.chat': 'AI Assistant',
    'nav.schemes': 'Gov Schemes',
    'nav.monitoring': 'Smart Monitoring',
    'nav.premium': 'Farm Tools',
    'logout': 'Logout',
    'sos.button': 'SOS',
    'sos.activated': 'SOS Activated! Alert sent to Agronomist Officer & emergency contacts.',
    'weather.title': 'Weather Forecast',
    'weather.humidity': 'Humidity',
    'weather.wind': 'Wind Speed',
    'weather.rain': 'Rain Probability',
    'weather.forecast7': '7-Day Forecast',
    'weather.advice': 'Farming Recommendation',
    'crop.title': 'AI Crop Recommendation',
    'crop.soil': 'Soil Type',
    'crop.state': 'State',
    'crop.season': 'Season',
    'crop.water': 'Water Availability',
    'crop.btn': 'Get Recommendation',
    'crop.recommended': 'Recommended Crop',
    'crop.yield': 'Expected Yield',
    'crop.fertilizer': 'Fertilizer Suggestion',
    'crop.irrigation': 'Irrigation Guidance',
    'crop.profit': 'Estimated Profit',
    'disease.title': 'AI Disease Scanner',
    'disease.select': 'Select Crop Type',
    'disease.upload': 'Upload Leaf Photo',
    'disease.camera': 'Use Live Camera',
    'disease.capture': 'Capture Leaf',
    'disease.btn': 'Analyze Leaf Image',
    'disease.name': 'Detected Disease',
    'disease.confidence': 'Confidence Score',
    'disease.treatment': 'Recommended Treatment',
    'disease.prevention': 'Prevention Tips',
    'market.title': 'Live Market Prices',
    'market.crop': 'Crop Name',
    'market.mandi': 'Mandi / Market',
    'market.current': 'Current Price',
    'market.predicted': 'Predicted (Next Month)',
    'market.trend': 'Price Trend Graph',
    'chat.title': 'AI Farmer Assistant',
    'chat.placeholder': 'Ask me about crops, weather, diseases or schemes...',
    'chat.send': 'Send',
    'chat.voice': 'Hold to Speak',
    'chat.listening': 'Listening...',
    'schemes.title': 'Government Schemes Finder',
    'schemes.search': 'Search schemes...',
    'schemes.eligibility': 'Check Eligibility',
    'schemes.subsidy': 'Subsidy Percentage',
    'schemes.documents': 'Required Documents',
    'schemes.apply': 'Apply Online',
    'monitoring.title': 'Smart Farm Monitoring',
    'monitoring.health': 'Farm Health Score',
    'monitoring.ndvi': 'NDVI Index Heatmap',
    'monitoring.irrigation': 'Smart Irrigation Schedule',
    'monitoring.water': 'Suggested Watering Amount',
    'premium.title': 'Premium Farm Utilities',
    'premium.diary': 'Digital Farm Diary',
    'premium.diary.placeholder': 'Record today\'s activities (e.g. Sowed wheat, watered north field)...',
    'premium.diary.save': 'Log Activity',
    'premium.id': 'QR Farmer ID Card',
    'premium.insurance': 'Crop Insurance Calculator',
    'premium.expense': 'Expense Tracker',
    'dashboard.welcome': 'Welcome back,',
    'dashboard.status': 'Farm Overview Status',
    'dashboard.alerts': 'Smart Advisories',
    'dashboard.news': 'Agricultural News Feed'
  },
  hi: {
    'app.title': 'कृषि रक्षक AI',
    'app.tagline': 'स्मार्ट खेती सहायक',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.weather': 'मौसम पूर्वानुमान',
    'nav.crop': 'फसल सलाहकार',
    'nav.disease': 'रोग पहचान',
    'nav.market': 'मंडी भाव',
    'nav.chat': 'कृषि मित्र',
    'nav.schemes': 'सरकारी योजनाएं',
    'nav.monitoring': 'स्मार्ट निगरानी',
    'nav.premium': 'कृषि उपकरण',
    'logout': 'लॉगआउट',
    'sos.button': 'SOS',
    'sos.activated': 'आपातकालीन अलर्ट सक्रिय! कृषि अधिकारी और आपातकालीन संपर्कों को सूचना भेज दी गई है।',
    'weather.title': 'मौसम पूर्वानुमान',
    'weather.humidity': 'नमी / आर्द्रता',
    'weather.wind': 'हवा की गति',
    'weather.rain': 'बारिश की संभावना',
    'weather.forecast7': '7-दिवसीय पूर्वानुमान',
    'weather.advice': 'कृषि परामर्श',
    'crop.title': 'एआई फसल अनुशंसा',
    'crop.soil': 'मिट्टी का प्रकार',
    'crop.state': 'राज्य',
    'crop.season': 'सत्र / मौसम',
    'crop.water': 'पानी की उपलब्धता',
    'crop.btn': 'अनुशंसा प्राप्त करें',
    'crop.recommended': 'अनुशंसित फसल',
    'crop.yield': 'अनुमानित उपज',
    'crop.fertilizer': 'खाद / उर्वरक सुझाव',
    'crop.irrigation': 'सिंचाई मार्गदर्शन',
    'crop.profit': 'अनुमानित लाभ',
    'disease.title': 'एआई रोग स्कैनर',
    'disease.select': 'फसल प्रकार चुनें',
    'disease.upload': 'पत्ती का फोटो अपलोड करें',
    'disease.camera': 'लाइव कैमरा का उपयोग करें',
    'disease.capture': 'पत्ती का फोटो लें',
    'disease.btn': 'पत्ती का विश्लेषण करें',
    'disease.name': 'पहचाना गया रोग',
    'disease.confidence': 'सटीकता स्तर',
    'disease.treatment': 'अनुशंसित उपचार',
    'disease.prevention': 'बचाव के उपाय',
    'market.title': 'दैनिक मंडी भाव',
    'market.crop': 'फसल का नाम',
    'market.mandi': 'मंडी / बाजार',
    'market.current': 'वर्तमान मूल्य',
    'market.predicted': 'पूर्वानुमान (अगले महीने)',
    'market.trend': 'मूल्य रुझान ग्राफ',
    'chat.title': 'एआई किसान सहायक',
    'chat.placeholder': 'मुझसे फसलों, मौसम, रोग या योजनाओं के बारे में पूछें...',
    'chat.send': 'भेजें',
    'chat.voice': 'बोलने के लिए दबाएं',
    'chat.listening': 'सुन रहा हूँ...',
    'schemes.title': 'सरकारी योजनाएं खोजें',
    'schemes.search': 'योजनाएं खोजें...',
    'schemes.eligibility': 'पात्रता जांचें',
    'schemes.subsidy': 'सब्सिडी प्रतिशत',
    'schemes.documents': 'आवश्यक दस्तावेज',
    'schemes.apply': 'ऑनलाइन आवेदन करें',
    'monitoring.title': 'स्मार्ट खेत निगरानी',
    'monitoring.health': 'खेत स्वास्थ्य स्कोर',
    'monitoring.ndvi': 'एनडीवीआई सूचकांक हीटमैप',
    'monitoring.irrigation': 'स्मार्ट सिंचाई कार्यक्रम',
    'monitoring.water': 'सुझाया गया पानी की मात्रा',
    'premium.title': 'प्रीमियम कृषि साधन',
    'premium.diary': 'डिजिटल कृषि डायरी',
    'premium.diary.placeholder': 'आज के काम दर्ज करें (जैसे- गेहूं बोया, उत्तर खेत को सींचा)...',
    'premium.diary.save': 'काम दर्ज करें',
    'premium.id': 'क्यूआर किसान आईडी कार्ड',
    'premium.insurance': 'फसल बीमा कैलकुलेटर',
    'premium.expense': 'खर्च लेखा जोखा',
    'dashboard.welcome': 'स्वागत है,',
    'dashboard.status': 'खेत की वर्तमान स्थिति',
    'dashboard.alerts': 'स्मार्ट कृषि सलाह',
    'dashboard.news': 'कृषि समाचार फीड'
  },
  mr: {
    'app.title': 'कृषी रक्षक AI',
    'app.tagline': 'स्मार्ट शेती सहाय्यक',
    'nav.dashboard': 'मुख्यपृष्ठ',
    'nav.weather': 'हवामान अंदाज',
    'nav.crop': 'पीक सल्लागार',
    'nav.disease': 'रोग ओळख',
    'nav.market': 'बाजार भाव',
    'nav.chat': 'कृषी मित्र',
    'nav.schemes': 'शासकीय योजना',
    'nav.monitoring': 'स्मार्ट देखरेख',
    'nav.premium': 'शेती साधने',
    'logout': 'बाहेर पडा',
    'sos.button': 'SOS',
    'sos.activated': 'आपत्कालीन इशारा पाठवला आहे! कृषी अधिकारी आणि जवळच्या केंद्रांना अलर्ट पाठवला गेला आहे.',
    'weather.title': 'हवामान अंदाज',
    'weather.humidity': 'हवेतील ओलसरपणा (आर्द्रता)',
    'weather.wind': 'वाऱ्याचा वेग',
    'weather.rain': 'पावसाची शक्यता',
    'weather.forecast7': '७ दिवसांचा अंदाज',
    'weather.advice': 'कृषी सल्ला शिफारस',
    'crop.title': 'कृत्रिम बुद्धिमत्ता पीक शिफारस',
    'crop.soil': 'मातीचा प्रकार',
    'crop.state': 'राज्य',
    'crop.season': 'हंगाम',
    'crop.water': 'पाण्याची उपलब्धता',
    'crop.btn': 'योग्य पीक सुचवा',
    'crop.recommended': 'शिफारस केलेले पीक',
    'crop.yield': 'अपेक्षित उत्पादन',
    'crop.fertilizer': 'खत व्यवस्थापन सल्ला',
    'crop.irrigation': 'पाणी व्यवस्थापन सल्ला',
    'crop.profit': 'अंदाजे नफा / उत्पन्न',
    'disease.title': 'एआय रोग ओळख',
    'disease.select': 'पिकाचा प्रकार निवडा',
    'disease.upload': 'पानाचा फोटो अपलोड करा',
    'disease.camera': 'लाइव कॅमेरा वापरा',
    'disease.capture': 'पानाचा फोटो घ्या',
    'disease.btn': 'पानाचे विश्लेषण करा',
    'disease.name': 'पिकावरील रोग',
    'disease.confidence': 'विश्वासार्हता टक्केवारी',
    'disease.treatment': 'उपचार व औषध फवारणी',
    'disease.prevention': 'प्रतिबंधात्मक उपाय',
    'market.title': 'रोजचे बाजार भाव',
    'market.crop': 'पिकाचे नाव',
    'market.mandi': 'बाजार समिती / एपीएमसी',
    'market.current': 'चालू बाजार भाव',
    'market.predicted': 'पुढील महिन्याचा अंदाज',
    'market.trend': 'बाजार भाव कल आलेख',
    'chat.title': 'एआय शेती सल्लागार',
    'chat.placeholder': 'मला पिके, हवामान, रोग किंवा योजनांविषयी विचारा...',
    'chat.send': 'पाठवा',
    'chat.voice': 'बोलण्यासाठी दाबा',
    'chat.listening': 'ऐकत आहे...',
    'schemes.title': 'शासकीय योजना शोधक',
    'schemes.search': 'योजना शोधा...',
    'schemes.eligibility': 'पात्रता तपासा',
    'schemes.subsidy': 'अनुदान टक्केवारी',
    'schemes.documents': 'लागणारी कागदपत्रे',
    'schemes.apply': 'ऑनलाईन अर्ज करा',
    'monitoring.title': 'स्मार्ट शेती देखरेख',
    'monitoring.health': 'शेती आरोग्य गुणवत्ता',
    'monitoring.ndvi': 'एनडीव्हीआय आलेख रंग नकाशा',
    'monitoring.irrigation': 'स्मार्ट पाणी सिंचन वेळापत्रक',
    'monitoring.water': 'पाण्याची शिफारस केलेली मात्रा',
    'premium.title': 'प्रीमियम कृषी साधने',
    'premium.diary': 'डिजिटल शेती नोंदवही',
    'premium.diary.placeholder': 'आज शेतात काय केले ते नोंदवा (उदा. गव्हाची पेरणी केली, विहिरीचे पाणी दिले)...',
    'premium.diary.save': 'नोंद जतन करा',
    'premium.id': 'क्यूआर शेतकरी ओळखपत्र',
    'premium.insurance': 'पीक विमा गणना',
    'premium.expense': 'खर्च नोंदणी पुस्तक',
    'dashboard.welcome': 'स्वागत आहे,',
    'dashboard.status': 'शेतातील सध्याची स्थिती',
    'dashboard.alerts': 'महत्त्वाचे कृषी सल्ले',
    'dashboard.news': 'कृषी घडामोडी वृत्त'
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>('en');

  // Load language preference from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('agri_language');
    if (saved === 'en' || saved === 'hi' || saved === 'mr') {
      setLang(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem('agri_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
