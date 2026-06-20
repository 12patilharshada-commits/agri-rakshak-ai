import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/translationContext';
import { Search, Award, FileText, CheckCircle, ExternalLink, RefreshCw, ClipboardList, Check } from 'lucide-react';

export const GovSchemes: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Eligibility filter values
  const [landholding, setLandholding] = useState<number>(2.5); // acres
  const [farmerCategory, setFarmerCategory] = useState<'Small' | 'Marginal' | 'Large'>('Marginal');
  
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  const fetchSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/gov-schemes`);
      if (!res.ok) throw new Error('Failed to fetch schemes');
      const data = await res.json();
      setSchemes(data);
      if (data.length > 0) setSelectedScheme(data[0]);
    } catch (err: any) {
      setError('Could not connect to schemes database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simple eligibility check algorithm
  const checkEligibility = (schemeTitle: string) => {
    if (schemeTitle.includes('Kisan Samman')) {
      // Small & Marginal (< 5 acres)
      return landholding <= 5.0;
    }
    if (schemeTitle.includes('Fasal Bima')) {
      return true; // All farmers
    }
    if (schemeTitle.includes('Drip')) {
      // Landowner category check
      return farmerCategory !== 'Large';
    }
    return true;
  };

  // PDF report downloader simulated
  const downloadChecklist = (scheme: any) => {
    const documents = scheme.document_checklist.split(',');
    
    let content = `AGRIRAKSHAK AI - OFFICIAL SUBSIDY DOCUMENT CHECKLIST\n`;
    content += `====================================================\n\n`;
    content += `Scheme Name: ${scheme.title}\n`;
    content += `Subsidy Level: ${scheme.subsidy_percentage}%\n\n`;
    content += `DOCUMENTS CHECKLIST REQUIRED FOR REGISTRATION:\n`;
    documents.forEach((doc: string, idx: number) => {
      content += `[ ] ${idx + 1}. ${doc.trim()}\n`;
    });
    content += `\nGuidelines: Print this checklist, gather documents, and visit: ${scheme.application_link}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${scheme.title.toLowerCase().replace(/ /g, '_')}_checklist.txt`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center glass-panel p-4">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-farm-orange-500" />
          <div>
            <h2 className="text-xl font-bold text-white">{t('schemes.title')}</h2>
            <p className="text-xs text-slate-400">Search government agricultural subsidies and support grants</p>
          </div>
        </div>
        <button
          onClick={fetchSchemes}
          disabled={loading}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schemes Directory list & Filters */}
        <div className="space-y-6">
          {/* Eligibility Filter card */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('schemes.eligibility')}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Landholding Size (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={landholding}
                  onChange={(e) => setLandholding(parseFloat(e.target.value) || 0)}
                  className="w-full glass-input text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Farmer Category</label>
                <select
                  value={farmerCategory}
                  onChange={(e) => setFarmerCategory(e.target.value as any)}
                  className="w-full glass-input text-xs py-2 bg-slate-950"
                >
                  <option value="Marginal">Marginal (under 2.5 acres)</option>
                  <option value="Small">Small (2.5 - 5 acres)</option>
                  <option value="Large">Large (above 5 acres)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schemes search list */}
          <div className="glass-panel p-6 flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Schemes</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={t('schemes.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input pl-9 text-xs py-2"
              />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {filteredSchemes.map((s) => {
                const eligible = checkEligibility(s.title);
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScheme(s)}
                    className={`p-3 border rounded-xl cursor-pointer text-xs transition flex justify-between items-center ${
                      selectedScheme?.id === s.id
                        ? 'bg-slate-900 border-farm-green-600/40'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-slate-200">{s.title}</h4>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Subsidy: {s.subsidy_percentage}%</span>
                    </div>
                    
                    {/* Eligibility Badge */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      eligible 
                        ? 'bg-farm-green-950 text-farm-green-500' 
                        : 'bg-red-950 text-red-400'
                    }`}>
                      {eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Scheme View */}
        <div className="lg:col-span-2">
          {selectedScheme ? (
            <div className="glass-panel p-6 relative overflow-hidden space-y-5 min-h-[480px]">
              {/* Bottom Orange Glow */}
              <div className="absolute right-0 bottom-0 w-36 h-36 bg-farm-orange-500/5 rounded-full blur-2xl"></div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">{selectedScheme.title}</h3>
                  <span className="text-xs text-slate-400">Scheme ID: #{selectedScheme.id}</span>
                </div>

                <div className="px-3.5 py-2 bg-orange-950/60 border border-orange-500/20 text-farm-orange-500 rounded-xl text-xs font-black self-start sm:self-center">
                  {t('schemes.subsidy')}: {selectedScheme.subsidy_percentage}%
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Description / विवरण</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 border border-slate-800/40 p-3.5 rounded-xl">
                  {selectedScheme.description}
                </p>
              </div>

              {/* Eligibility Description details */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Eligibility Requirements</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 border border-slate-800/40 p-3.5 rounded-xl">
                  {selectedScheme.eligibility_criteria}
                </p>
              </div>

              {/* Documents check list */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('schemes.documents')}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedScheme.document_checklist.split(',').map((doc: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center space-x-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-farm-green-500 shrink-0" />
                      <span>{doc.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t border-slate-800/80">
                <button
                  onClick={() => downloadChecklist(selectedScheme)}
                  className="px-5 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition"
                >
                  <ClipboardList className="w-4 h-4 text-farm-orange-500" />
                  <span>Download doc Checklist (.txt)</span>
                </button>
                <a
                  href={selectedScheme.application_link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-farm-green-600 hover:bg-farm-green-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-farm-green-600/15"
                >
                  <span>{t('schemes.apply')}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[480px]">
              <ClipboardList className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-300">Scheme Information</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Select an active scheme from the menu to analyze eligibility requirements, required documentation, and apply online.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
