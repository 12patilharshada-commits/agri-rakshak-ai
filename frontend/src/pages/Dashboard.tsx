import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/translationContext';
import { 
  CloudSun, Sprout, TrendingUp, AlertTriangle, FileText, 
  Map, Activity, Droplets, BookOpen, AlertCircle, ArrowUpRight, 
  Settings, User, PhoneCall, Bell, ShieldAlert
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: any;
  token: string;
  triggerSOS: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, token, triggerSOS }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [farm, setFarm] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  useEffect(() => {
    // Fetch Weather Summary
    fetch(`${API_URL}/weather?location=${user.district || 'Pune'}`)
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(err => console.error(err));

    // Fetch Notifications
    fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNotifications(data.slice(0, 3)))
      .catch(err => console.error(err));

    // Fetch Market Prices Ticker
    fetch(`${API_URL}/market-prices`)
      .then(res => res.json())
      .then(data => {
        // Filter some major crops for dashboard
        const filtered = data.filter((p: any) => p.market_name.includes('Pune') || p.market_name.includes('Mumbai'));
        setPrices(filtered.slice(0, 4));
      })
      .catch(err => console.error(err));

    // Fetch Farm monitoring status
    fetch(`${API_URL}/farms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setFarm(data[0]);
      })
      .catch(err => console.error(err));
  }, [user, token]);

  // Mock analytics yield trend
  const yieldAnalytics = [
    { year: '2021', Wheat: 2.8, Rice: 2.4, Cotton: 1.0 },
    { year: '2022', Wheat: 2.9, Rice: 2.6, Cotton: 1.1 },
    { year: '2023', Wheat: 3.1, Rice: 2.5, Cotton: 1.0 },
    { year: '2024', Wheat: 3.0, Rice: 2.7, Cotton: 1.2 },
    { year: '2025', Wheat: 3.2, Rice: 2.8, Cotton: 1.2 },
    { year: '2026', Wheat: 3.3, Rice: 2.9, Cotton: 1.3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-farm-green-600/10 rounded-full blur-2xl"></div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            {t('dashboard.welcome')} <span className="text-farm-green-500">{user.name}</span>!
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            📍 {user.district}, {user.state} | Role: <span className="font-semibold text-farm-orange-500">{user.role}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => navigate('/premium')}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-farm-green-600/40 text-slate-200 hover:text-white rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 text-farm-green-500" />
            <span>{t('premium.diary')}</span>
          </button>
          <button 
            onClick={triggerSOS}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-red-600/35 transform active:scale-95 animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* Grid: 4 Quick Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather card */}
        <div onClick={() => navigate('/weather')} className="glass-panel glass-panel-hover p-5 cursor-pointer flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase">{t('nav.weather')}</span>
            <div className="text-2xl font-black text-white">{weather ? `${weather.temperature}°C` : 'Loading...'}</div>
            <p className="text-farm-green-500 text-xs font-medium">{weather ? weather.condition : 'Checking...'}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-500/20 flex items-center justify-center">
            <CloudSun className="w-6 h-6 text-sky-400" />
          </div>
        </div>

        {/* Health Score Card */}
        <div onClick={() => navigate('/monitoring')} className="glass-panel glass-panel-hover p-5 cursor-pointer flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase">{t('monitoring.health')}</span>
            <div className="text-2xl font-black text-white">{farm ? `${farm.health_score}/100` : '88/100'}</div>
            <p className="text-farm-green-500 text-xs font-medium">Optimal Conditions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-farm-green-950/60 border border-farm-green-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-farm-green-500" />
          </div>
        </div>

        {/* Market prices card */}
        <div onClick={() => navigate('/market-prices')} className="glass-panel glass-panel-hover p-5 cursor-pointer flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase">{t('nav.market')}</span>
            <div className="text-2xl font-black text-white">₹2,450</div>
            <p className="text-farm-green-500 text-xs font-medium">Wheat up 5.4% 📈</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Government Schemes Card */}
        <div onClick={() => navigate('/schemes')} className="glass-panel glass-panel-hover p-5 cursor-pointer flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase">{t('nav.schemes')}</span>
            <div className="text-2xl font-black text-white">3 Active</div>
            <p className="text-farm-orange-500 text-xs font-medium">Eligible Subsidies</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-950/60 border border-orange-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-farm-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Charts & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analytics Chart */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Yield Productivity History</h3>
              <p className="text-xs text-slate-400">Historical performance trends for major regional crops (tonnes/acre)</p>
            </div>
            <Sprout className="w-5 h-5 text-farm-green-500" />
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldAnalytics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="Wheat" stroke="#eab308" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Rice" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="Cotton" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Advisories, Alerts & Feed */}
        <div className="space-y-6">
          {/* Advisories & Alerts Widget */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-farm-orange-500" />
              <span>{t('dashboard.alerts')}</span>
            </h3>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((n: any) => (
                  <div key={n.id} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-start space-x-3 hover:border-slate-700 transition-colors">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      n.category === 'Weather' ? 'bg-sky-950 text-sky-400 border border-sky-500/20' : 
                      n.category === 'Market' ? 'bg-amber-950 text-amber-500 border border-amber-500/20' : 
                      'bg-orange-950 text-farm-orange-500 border border-orange-500/20'
                    }`}>
                      {n.category === 'Weather' ? <CloudSun className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">No new advisories today.</div>
              )}
            </div>
          </div>

          {/* Local Market Prices Summary */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-farm-green-500" />
              <span>Nearby Mandi Prices</span>
            </h3>
            <div className="divide-y divide-slate-800">
              {prices.map((p: any) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{p.crop_name}</span>
                    <p className="text-[10px] text-slate-500">{p.market_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">₹{p.current_price}</span>
                    <span className="text-[10px] block text-farm-green-500">Pred: ₹{p.predicted_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 3 Premium Links Shortcut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crop Recommendation Advisor */}
        <div onClick={() => navigate('/crop-recommendation')} className="glass-panel p-6 glass-panel-hover cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-farm-green-600/10 rounded-full blur-xl group-hover:bg-farm-green-600/20 transition-all duration-300"></div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-farm-green-950/60 border border-farm-green-500/20 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-farm-green-500" />
            </div>
            <h4 className="text-base font-extrabold text-white">{t('crop.title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Enter your soil type and water conditions to get AI-driven crop suggestions, fertilizer checklists, and profit forecasting.</p>
          </div>
          <div className="text-xs font-bold text-farm-green-500 flex items-center space-x-1 hover:underline">
            <span>Get Advisory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* AI Plant Disease Scanner */}
        <div onClick={() => navigate('/disease-detection')} className="glass-panel p-6 glass-panel-hover cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-600/10 rounded-full blur-xl group-hover:bg-emerald-600/20 transition-all duration-300"></div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">{t('disease.title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Analyze leaf spots or damaged crops by taking a photo. AI identifies diseases and provides treatment formulas instantly.</p>
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1 hover:underline">
            <span>Scan Leaf</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Smart Farm Monitoring */}
        <div onClick={() => navigate('/monitoring')} className="glass-panel p-6 glass-panel-hover cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-600/10 rounded-full blur-xl group-hover:bg-sky-600/20 transition-all duration-300"></div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-500/20 flex items-center justify-center">
              <Map className="w-5 h-5 text-sky-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">{t('monitoring.title')}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Visualize crop health trends using mock satellite NDVI maps, compute water evaporation indices, and schedule irrigation.</p>
          </div>
          <div className="text-xs font-bold text-sky-400 flex items-center space-x-1 hover:underline">
            <span>Open Monitor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
