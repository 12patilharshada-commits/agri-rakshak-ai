import React, { useState } from 'react';
import { useTranslation } from '../contexts/translationContext';
import { Sprout, HelpCircle, FileText, ArrowRight, DollarSign, Activity, Settings, Info } from 'lucide-react';

export const CropRecommendation: React.FC = () => {
  const { t } = useTranslation();
  const [soilType, setSoilType] = useState('Black');
  const [state, setState] = useState('Maharashtra');
  const [season, setSeason] = useState('Kharif');
  const [waterAvailability, setWaterAvailability] = useState('Medium');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/ai/recommend-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType,
          state,
          season,
          waterAvailability
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to analyze crop suitability.');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center space-x-3 glass-panel p-4">
        <Sprout className="w-8 h-8 text-farm-green-500" />
        <div>
          <h2 className="text-xl font-bold text-white">{t('crop.title')}</h2>
          <p className="text-xs text-slate-400">Scikit-learn powered ML crop suitability classifier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form Column */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Input Soil & Farm Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Soil Type */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">{t('crop.soil')}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full glass-input bg-slate-950 text-sm"
              >
                <option value="Black">Black Soil / काली मिट्टी</option>
                <option value="Red">Red Soil / लाल मिट्टी</option>
                <option value="Alluvial">Alluvial Soil / जलोढ़ मिट्टी</option>
                <option value="Laterite">Laterite Soil / लेटराइट मिट्टी</option>
                <option value="Clayey">Clayey Soil / चिकनी मिट्टी</option>
                <option value="Sandy">Sandy Soil / रेतीली मिट्टी</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">{t('crop.state')}</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full glass-input bg-slate-950 text-sm"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">{t('crop.season')}</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full glass-input bg-slate-950 text-sm"
              >
                <option value="Kharif">Kharif / खरीफ (Monsoon)</option>
                <option value="Rabi">Rabi / रबी (Winter)</option>
                <option value="Summer">Summer / जायद (Summer)</option>
              </select>
            </div>

            {/* Water Availability */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5">{t('crop.water')}</label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setWaterAvailability(level)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      waterAvailability === level
                        ? 'bg-farm-green-600 border-farm-green-500 text-white shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="text-red-400 text-xs py-1">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-farm-green-600 to-farm-green-700 hover:from-farm-green-500 hover:to-farm-green-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t('crop.btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="glass-panel p-6 relative overflow-hidden space-y-6 animate-fade-in">
              {/* Green indicator banner */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-farm-green-500"></div>

              {/* Recommended Crop Title Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('crop.recommended')}</span>
                  <h2 className="text-3xl font-black text-farm-green-500 mt-1">{result.crop}</h2>
                </div>
                <div className="w-14 h-14 bg-farm-green-950/50 border border-farm-green-500/20 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-8 h-8 text-farm-green-500" />
                </div>
              </div>

              {/* Performance / Prediction widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold">{t('crop.yield')}</span>
                  </div>
                  <div className="text-lg font-bold text-white">{result.expected_yield}</div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <DollarSign className="w-4 h-4 text-farm-green-500" />
                    <span className="text-xs font-semibold">{t('crop.profit')}</span>
                  </div>
                  <div className="text-lg font-bold text-farm-green-500">{result.profit_estimation}</div>
                </div>
              </div>

              {/* Detailed Guidelines */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{t('crop.fertilizer')}</h4>
                  <p className="text-xs text-slate-300 bg-slate-950/30 border border-slate-800/60 p-3 rounded-xl leading-relaxed">
                    {result.fertilizer_suggestion}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{t('crop.irrigation')}</h4>
                  <p className="text-xs text-slate-300 bg-slate-950/30 border border-slate-800/60 p-3 rounded-xl leading-relaxed">
                    {result.irrigation_guidance}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
              <HelpCircle className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-300">Suitability Results</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">Fill out the parameters on the left and submit to let Scikit-learn analyze your farm compatibility profiles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
