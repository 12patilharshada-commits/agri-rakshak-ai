import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/translationContext';
import { IndexedDbHelper } from '../utils/indexedDbHelper';
import { CloudSun, CloudRain, Sun, Wind, Droplets, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeatherProps {
  user: any;
}

export const Weather: React.FC<WeatherProps> = ({ user }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
  const location = user.district || 'Pune';

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    const isOnline = navigator.onLine;
    setOffline(!isOnline);

    if (!isOnline) {
      // Offline fallback: load from IndexedDB
      const cached = await IndexedDbHelper.getCachedWeather(location);
      if (cached) {
        setWeather(cached);
      } else {
        setError('You are offline, and no cached weather data is available for your region.');
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/weather?location=${location}`);
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await res.json();
      
      setWeather(data);
      // Cache data in IndexedDB for offline usage
      await IndexedDbHelper.cacheWeather(location, data);
    } catch (err: any) {
      setError('Could not connect to weather server.');
      // Attempt cache recovery on error
      const cached = await IndexedDbHelper.getCachedWeather(location);
      if (cached) setWeather(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Add online status event listeners
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Generate farming task suggestions based on weather condition
  const getFarmingRecommendation = (condition: string, rainProb: number) => {
    if (condition.includes('Rain') || rainProb > 65) {
      return {
        title: 'Protect Crops & Postpone Spraying',
        advice: 'High rain probability detected. Postpone any fertilizer or pesticide spray operations as they will be washed away. Drain excess water from fields to prevent root waterlogging, and cover harvested grains immediately.',
        warning: true
      };
    } else if (condition.includes('Sunny') || condition.includes('Hot')) {
      return {
        title: 'Irrigation & Sowing Advisory',
        advice: 'Optimal sunny weather. Excellent time for harvesting mature crops and solar drying grains. Maintain normal drip irrigation intervals. Sowing operations can proceed if soil moisture is sufficient.',
        warning: false
      };
    } else {
      return {
        title: 'General Maintenance & Spraying',
        advice: 'Mild weather. Favorable conditions for standard crop weeding, applying organic compost, and spraying herbicides or pesticides if needed. Ensure constant moisture levels.',
        warning: false
      };
    }
  };

  const chartData = weather?.forecast.map((f: any) => ({
    day: f.day.slice(0, 3),
    temp: f.temp,
    rain: f.rain_probability
  })) || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center glass-panel p-4">
        <div className="flex items-center space-x-3">
          <CloudSun className="w-8 h-8 text-sky-400" />
          <div>
            <h2 className="text-xl font-bold text-white">{t('weather.title')}</h2>
            <p className="text-xs text-slate-400">Regional climate monitor for {location}</p>
          </div>
        </div>
        <button 
          onClick={fetchWeather}
          disabled={loading}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {offline && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-bold">Offline Mode Active</span>
            <p className="mt-0.5 leading-relaxed">Displaying last cached weather information. Real-time updates will resume once internet connection is restored.</p>
          </div>
        </div>
      )}

      {error && !weather && (
        <div className="glass-panel p-8 text-center text-slate-400">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Weather Metric Column */}
          <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Glow */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Conditions</span>
              <div className="flex items-center space-x-4 mt-3">
                <div className="p-3 bg-sky-950/60 border border-sky-500/20 rounded-2xl">
                  {weather.condition.includes('Rain') ? (
                    <CloudRain className="w-12 h-12 text-sky-400" />
                  ) : weather.condition.includes('Sunny') ? (
                    <Sun className="w-12 h-12 text-yellow-400" />
                  ) : (
                    <CloudSun className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white">{weather.temperature}°C</h1>
                  <p className="text-slate-300 text-sm font-semibold mt-0.5">{weather.condition}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 border-t border-slate-800/80 pt-6">
              <div className="flex items-center space-x-3 text-slate-300">
                <Droplets className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">{t('weather.humidity')}</span>
                  <span className="text-sm font-bold text-white">{weather.humidity}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Wind className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">{t('weather.wind')}</span>
                  <span className="text-sm font-bold text-white">{weather.wind_speed} km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Trend Chart Column */}
          <div className="lg:col-span-2 glass-panel p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('weather.forecast7')}</h3>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weather Advisories Card */}
          <div className="lg:col-span-3">
            {(() => {
              const rec = getFarmingRecommendation(weather.condition, weather.forecast[0]?.rain_probability || 0);
              return (
                <div className={`p-6 rounded-2xl border ${
                  rec.warning 
                    ? 'bg-amber-500/5 border-amber-500/20' 
                    : 'bg-farm-green-950/20 border-farm-green-600/20'
                } flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4`}>
                  <div className={`p-3 rounded-xl ${rec.warning ? 'bg-amber-950 text-amber-400' : 'bg-farm-green-950 text-farm-green-500'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-base font-bold ${rec.warning ? 'text-amber-400' : 'text-farm-green-500'}`}>
                      {t('weather.advice')}: {rec.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{rec.advice}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 7-Day Forecast Grid */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast.map((f: any, idx: number) => (
                <div key={idx} className="glass-panel p-4 flex flex-col items-center justify-between text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-400">{f.day}</span>
                  <div className="p-2 bg-slate-950/60 rounded-xl">
                    {f.condition.includes('Rain') ? (
                      <CloudRain className="w-5 h-5 text-sky-400" />
                    ) : f.condition.includes('Sunny') ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <CloudSun className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">{f.temp}°C</span>
                  <div className="text-[10px] text-sky-400 flex items-center space-x-0.5">
                    <Droplets className="w-3 h-3" />
                    <span>{f.rain_probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
