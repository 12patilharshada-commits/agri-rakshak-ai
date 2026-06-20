import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { TranslationProvider, useTranslation } from './contexts/translationContext';
import { IndexedDbHelper } from './utils/indexedDbHelper';
import { VoiceSystem } from './utils/voiceSystem';

// Import Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Weather } from './pages/Weather';
import { CropRecommendation } from './pages/CropRecommendation';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { MarketPrices } from './pages/MarketPrices';
import { FarmerAssistant } from './pages/FarmerAssistant';
import { GovSchemes } from './pages/GovSchemes';
import { FarmMonitoring } from './pages/FarmMonitoring';
import { PremiumFeatures } from './pages/PremiumFeatures';

import { 
  Sprout, LayoutDashboard, CloudSun, TrendingUp, 
  Camera, MessageSquare, Award, Activity, ShieldCheck, 
  LogOut, PhoneCall, Globe, Volume2, VolumeX, Menu, X, ShieldAlert 
} from 'lucide-react';

const AppShell: React.FC<{
  user: any;
  token: string;
  onLogout: () => void;
  children: React.ReactNode;
  triggerSOS: () => void;
}> = ({ user, token, onLogout, children, triggerSOS }) => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [voiceActive, setVoiceActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/weather', label: t('nav.weather'), icon: CloudSun },
    { path: '/crop-recommendation', label: t('nav.crop'), icon: Sprout },
    { path: '/disease-detection', label: t('nav.disease'), icon: Camera },
    { path: '/market-prices', label: t('nav.market'), icon: TrendingUp },
    { path: '/assistant', label: t('nav.chat'), icon: MessageSquare },
    { path: '/schemes', label: t('nav.schemes'), icon: Award },
    { path: '/monitoring', label: t('nav.monitoring'), icon: Activity },
    { path: '/premium', label: t('nav.premium'), icon: ShieldCheck }
  ];

  // Start speech command listening
  const handleToggleVoice = () => {
    if (voiceActive) {
      VoiceSystem.stopListening();
      setVoiceActive(false);
    } else {
      setVoiceActive(true);
      VoiceSystem.speak(language === 'mr' ? 'मी ऐकत आहे' : language === 'hi' ? 'मैं सुन रहा हूँ' : 'Listening for command', language);
      
      const listen = () => {
        VoiceSystem.startListening(
          language,
          (transcript) => {
            const res = VoiceSystem.processCommand(transcript, navigate, (l) => setLanguage(l as any), triggerSOS);
            if (res.matched) {
              VoiceSystem.speak(res.response, language);
            } else {
              VoiceSystem.speak(language === 'mr' ? 'समजले नाही' : language === 'hi' ? 'समझ नहीं आया' : 'Command not recognized', language);
            }
            setVoiceActive(false);
          },
          () => setVoiceActive(false)
        );
      };
      // Short delay for announcement to complete
      setTimeout(listen, 1200);
    }
  };

  return (
    <div className="flex min-h-screen text-slate-100 relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 glass-panel m-4 mr-0 p-5 space-y-6 relative">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80">
          <div className="w-10 h-10 bg-farm-green-950/80 border border-farm-green-500/20 rounded-xl flex items-center justify-center">
            <Sprout className="w-6 h-6 text-farm-green-500" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide text-white">{t('app.title')}</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">{t('app.tagline')}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-farm-green-600 to-farm-green-700 text-white shadow-md shadow-farm-green-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="border-t border-slate-800/80 pt-4 flex flex-col space-y-3">
          <div className="flex items-center space-x-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white uppercase border border-slate-700">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Navbar */}
        <header className="glass-panel m-4 p-4 flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 lg:hidden bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <span className="font-extrabold text-sm md:text-base text-white block lg:hidden">
              {t('app.title')}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Voice control button */}
            <button
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all text-xs font-bold ${
                voiceActive 
                  ? 'bg-sky-600 border-sky-500 text-white animate-pulse' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {voiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-farm-green-500" />}
              <span className="hidden sm:inline">Voice Navigate</span>
            </button>

            {/* Language Switcher */}
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
              {(['en', 'hi', 'mr'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                    language === lang 
                      ? 'bg-farm-green-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <aside 
              className="w-64 h-full bg-slate-950 border-r border-slate-800 p-5 space-y-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <Sprout className="w-6 h-6 text-farm-green-500" />
                    <span className="font-extrabold text-white">{t('app.title')}</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold ${
                          location.pathname === item.path
                            ? 'bg-farm-green-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </aside>
          </div>
        )}

        {/* Page Render Viewport */}
        <main className="flex-1 px-4 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating SOS Trigger Button */}
      <button
        onClick={triggerSOS}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/35 border-2 border-red-400/20 z-40 transform active:scale-95 transition-all hover:scale-105 sos-glow"
      >
        <PhoneCall className="w-7 h-7 text-white" />
      </button>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('agri_token'));
  const [user, setUser] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [showSOSAlert, setShowSOSAlert] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAppLoading(false);
  }, [token]);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('agri_token', newToken);
    localStorage.setItem('agri_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_diary');
    localStorage.removeItem('agri_expenses');
  };

  const handleSOSActivation = () => {
    if (!token) return;
    
    const isOnline = navigator.onLine;

    // Fetch GPS coords
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await triggerSOSCall(latitude, longitude, !isOnline);
      },
      async () => {
        // Fallback Pune coordinates if browser GPS is blocked
        await triggerSOSCall(18.5204, 73.8567, !isOnline);
      }
    );
  };

  const triggerSOSCall = async (lat: number, lon: number, isOffline: boolean) => {
    setShowSOSAlert(true);
    // Announce voice assistance alerts
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance('Emergency SOS activated. Sending location details to District Agriculture Officer.')
      );
    }

    if (isOffline) {
      // Offline queue caching
      await IndexedDbHelper.queueSOS(lat, lon);
      return;
    }

    try {
      await fetch(`${API_URL}/emergency/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lat, lon, offline: false })
      });
    } catch {
      await IndexedDbHelper.queueSOS(lat, lon);
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-farm-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* SOS Alert Modal overlay */}
      {showSOSAlert && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md glass-panel p-6 border-red-500/30 text-center space-y-4 animate-float">
            <div className="w-16 h-16 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-red-500">SOS EMERGENCY SIGNAL</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your live geolocation has been verified. Alerts are queued and shared with the District Agriculture Officer, nearby emergency stations, and contacts list.
            </p>
            <button
              onClick={() => setShowSOSAlert(false)}
              className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/register" 
          element={token ? <Navigate to="/dashboard" /> : <Register onLoginSuccess={handleLoginSuccess} />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <Dashboard user={user} token={token} triggerSOS={handleSOSActivation} />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/weather" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <Weather user={user} />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/crop-recommendation" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <CropRecommendation />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/disease-detection" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <DiseaseDetection token={token} />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/market-prices" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <MarketPrices />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/assistant" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <FarmerAssistant user={user} />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/schemes" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <GovSchemes />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/monitoring" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <FarmMonitoring user={user} token={token} />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/premium" 
          element={token ? (
            <AppShell user={user} token={token} onLogout={handleLogout} triggerSOS={handleSOSActivation}>
              <PremiumFeatures user={user} token={token} />
            </AppShell>
          ) : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <TranslationProvider>
      <AppContent />
    </TranslationProvider>
  );
}
