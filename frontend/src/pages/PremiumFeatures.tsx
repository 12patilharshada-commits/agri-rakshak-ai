import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/translationContext';
import { 
  BookOpen, Calculator, DollarSign, QrCode, Newspaper, 
  Plus, Check, Trash2, Calendar, ShieldCheck, ArrowRight 
} from 'lucide-react';

interface PremiumFeaturesProps {
  user: any;
  token: string;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ user, token }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'diary' | 'qr' | 'expense' | 'insurance' | 'news'>('diary');

  // Farm Diary States
  const [diaryLogs, setDiaryLogs] = useState<any[]>([]);
  const [diaryText, setDiaryText] = useState('');

  // Expense Tracker States
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  const [expenseCat, setExpenseCat] = useState('Seeds');

  // Insurance Calculator States
  const [cropArea, setCropArea] = useState(2.5); // acres
  const [insuranceCrop, setInsuranceCrop] = useState('Wheat');
  const [sumInsured, setSumInsured] = useState(0);
  const [premiumPayable, setPremiumPayable] = useState(0);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load local state data
  useEffect(() => {
    const savedDiary = localStorage.getItem('agri_diary');
    if (savedDiary) setDiaryLogs(JSON.parse(savedDiary));

    const savedExpenses = localStorage.getItem('agri_expenses');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  // Save diary log
  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim()) return;
    const newLog = {
      id: Date.now(),
      text: diaryText,
      date: new Date().toLocaleDateString()
    };
    const updated = [newLog, ...diaryLogs];
    setDiaryLogs(updated);
    localStorage.setItem('agri_diary', JSON.stringify(updated));
    setDiaryText('');
  };

  const handleDeleteDiary = (id: number) => {
    const updated = diaryLogs.filter(log => log.id !== id);
    setDiaryLogs(updated);
    localStorage.setItem('agri_diary', JSON.stringify(updated));
  };

  // Save expense log
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim() || !expenseCost.trim()) return;
    const newExpense = {
      id: Date.now(),
      name: expenseName,
      cost: parseFloat(expenseCost) || 0,
      category: expenseCat,
      date: new Date().toLocaleDateString()
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem('agri_expenses', JSON.stringify(updated));
    setExpenseName('');
    setExpenseCost('');
  };

  const handleDeleteExpense = (id: number) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    localStorage.setItem('agri_expenses', JSON.stringify(updated));
  };

  // Draw programmatic QR code layout on Canvas
  useEffect(() => {
    if (activeTab === 'qr' && qrCanvasRef.current) {
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 180;
        canvas.height = 180;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw outer QR corner squares
        const drawSquare = (x: number, y: number, size: number) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 5, y + 5, size - 10, size - 10);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
        };

        drawSquare(10, 10, 45); // Top Left
        drawSquare(125, 10, 45); // Top Right
        drawSquare(10, 125, 45); // Bottom Left

        // Draw mock QR pixels patterns
        ctx.fillStyle = '#0f172a';
        for (let i = 0; i < 28; i++) {
          for (let j = 0; j < 28; j++) {
            // Avoid corners
            if ((i < 8 && j < 8) || (i > 19 && j < 8) || (i < 8 && j > 19)) {
              continue;
            }
            // Random deterministic fill to look like QR code
            const seed = (i * 13 + j * 37) % 2;
            if (seed === 0) {
              ctx.fillRect(10 + i * 5.7, 10 + j * 5.7, 5, 5);
            }
          }
        }
      }
    }
  }, [activeTab, user]);

  // Compute Crop Insurance Premium values
  const handleCalcInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    let sumPerAcre = 35000; // Wheat base sum
    let premiumPct = 0.02; // 2% Rabi crop premium

    if (insuranceCrop === 'Rice') {
      sumPerAcre = 40000;
      premiumPct = 0.02;
    } else if (insuranceCrop === 'Sugarcane') {
      sumPerAcre = 80000;
      premiumPct = 0.05; // Cash crop
    } else if (insuranceCrop === 'Cotton') {
      sumPerAcre = 45000;
      premiumPct = 0.05;
    }

    const totalSum = Math.round(cropArea * sumPerAcre);
    setSumInsured(totalSum);
    setPremiumPayable(Math.round(totalSum * premiumPct));
  };

  // Mock Agricultural News RSS Feed
  const newsList = [
    {
      title: 'Monsoon Arrivals Forecasted Early in Maharashtra',
      desc: 'IMD reports early monsoons likely to hit Southern Maharashtra districts next week. Sowing advisories issued.',
      src: 'AgriNews Network',
      date: 'Today'
    },
    {
      title: 'Government Extends 3% Subsidy on Farm Solar Pumps',
      desc: 'Subsidies under PM-KUSUM extended. Farmers in Maharashtra and Gujarat can apply online through DBT portals.',
      src: 'Krishi Patrika',
      date: 'Yesterday'
    },
    {
      title: 'Wheat Procurement Target Reached at APMC Mandis',
      desc: 'Purchasing boards report 34 lakh tonnes of wheat procured under MSP operations this Rabi season.',
      src: 'Mandi Gazette',
      date: '3 days ago'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Tabs Header */}
      <div className="glass-panel p-2 flex flex-wrap gap-2">
        {[
          { id: 'diary', icon: BookOpen, label: t('premium.diary') },
          { id: 'qr', icon: QrCode, label: t('premium.id') },
          { id: 'expense', icon: DollarSign, label: 'Expense Tracker' },
          { id: 'insurance', icon: Calculator, label: 'Insurance Calc' },
          { id: 'news', icon: Newspaper, label: 'Agri News' }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-farm-green-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="glass-panel p-6 min-h-[420px]">
        {/* --- Tab 1: Digital Farm Diary --- */}
        {activeTab === 'diary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">{t('premium.diary')}</h3>
                <p className="text-xs text-slate-400">Keep safe logs of daily field actions and sowing events</p>
              </div>

              <form onSubmit={handleSaveDiary} className="space-y-3">
                <textarea
                  required
                  rows={4}
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  placeholder={t('premium.diary.placeholder')}
                  className="w-full glass-input text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-farm-green-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('premium.diary.save')}</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Log Entries</h4>
              <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                {diaryLogs.length > 0 ? (
                  diaryLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-start">
                      <div className="space-y-1 pr-4">
                        <span className="text-[10px] text-slate-500 font-semibold">{log.date}</span>
                        <p className="text-xs text-slate-200 leading-relaxed">{log.text}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDiary(log.id)}
                        className="p-1.5 text-slate-500 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-600 text-xs">No entries logged. Add one on the left to start!</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 2: Farmer QR ID Card --- */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
              {/* Header stripes representing India flag theme */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-farm-green-600 via-white to-farm-orange-500"></div>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-farm-green-950/80 border border-farm-green-500/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-farm-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">AgriRakshak Digital ID</h4>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Government verified profile</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 items-center">
                {/* Farmer Info */}
                <div className="col-span-3 space-y-3 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Name</span>
                    <p className="font-extrabold text-slate-200">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Mobile</span>
                    <p className="font-semibold text-slate-300">{user.mobile}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase">Region</span>
                    <p className="font-medium text-slate-400">{user.district}, {user.state}</p>
                  </div>
                </div>

                {/* QR Code Canvas */}
                <div className="col-span-2 bg-white p-2 rounded-xl flex items-center justify-center border border-slate-800 shadow-lg">
                  <canvas ref={qrCanvasRef} className="w-full max-w-[110px] aspect-square" />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm text-center leading-relaxed">
              Show this QR card to Agricultural Officers at local procurement centers to instantly load your verification records and landholdings profiles.
            </p>
          </div>
        )}

        {/* --- Tab 3: Farm Expense Tracker --- */}
        {activeTab === 'expense' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Add Cost Log</h3>
                <p className="text-xs text-slate-400">Track seasonal costs to compute farm net profit</p>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Expense Detail</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. NPK Fertilizer bags, Tractor Rent"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Cost (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="4500"
                      value={expenseCost}
                      onChange={(e) => setExpenseCost(e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Category</label>
                    <select
                      value={expenseCat}
                      onChange={(e) => setExpenseCat(e.target.value)}
                      className="w-full glass-input bg-slate-950"
                    >
                      <option value="Seeds">Seeds</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Irrigation">Irrigation</option>
                      <option value="Labor">Labor</option>
                      <option value="Machinery">Machinery</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-farm-green-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Expense</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Costs Directory</h4>
                <div className="text-xs text-farm-green-500 font-bold">
                  Total logged: ₹{expenses.reduce((sum, e) => sum + e.cost, 0).toLocaleString()}
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                {expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <div key={exp.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-200">{exp.name}</h4>
                        <div className="flex space-x-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">{exp.date}</span>
                          <span className="text-[10px] text-farm-orange-500">({exp.category})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white">₹{exp.cost.toLocaleString()}</span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-500 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-600 text-xs">No expenses logged. Add one on the left to start!</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 4: Crop Insurance Calculator --- */}
        {activeTab === 'insurance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Insurance Estimator</h3>
                <p className="text-xs text-slate-400">Pradhan Mantri Fasal Bima Yojana premium advisor</p>
              </div>

              <form onSubmit={handleCalcInsurance} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Crop Type</label>
                  <select
                    value={insuranceCrop}
                    onChange={(e) => setInsuranceCrop(e.target.value)}
                    className="w-full glass-input bg-slate-950"
                  >
                    <option value="Wheat">Wheat / गेहूं (Rabi - 2% Premium)</option>
                    <option value="Rice">Rice / धान (Kharif - 2% Premium)</option>
                    <option value="Sugarcane">Sugarcane / गन्ना (Commercial - 5% Premium)</option>
                    <option value="Cotton">Cotton / कपास (Commercial - 5% Premium)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sowing Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={cropArea}
                    onChange={(e) => setCropArea(parseFloat(e.target.value) || 0)}
                    className="w-full glass-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-farm-green-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center"
                >
                  Calculate Estimate
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {sumInsured > 0 ? (
                <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl relative overflow-hidden space-y-5">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-farm-orange-500"></div>

                  <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                    <ShieldCheck className="w-7 h-7 text-farm-green-500" />
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Estimated PMFBY Coverage</h4>
                      <p className="text-[10px] text-slate-500">Based on standard regional limits</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Sum Insured Limit (Max coverage)</span>
                      <div className="text-xl font-black text-white">₹{sumInsured.toLocaleString()}</div>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Premium Payable by Farmer</span>
                      <div className="text-xl font-black text-farm-orange-500">₹{premiumPayable.toLocaleString()}</div>
                      <p className="text-[9px] text-slate-400">Balance subsidised by Central & State gov.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-600 text-xs">
                  Input crop details and press calculate to view sum insured coverage and premium breakdown.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab 5: Agricultural News RSS Feed --- */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Krishi News Bulletin</h3>
              <p className="text-xs text-slate-400">Latest policy updates, weather alerts, and crop market reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newsList.map((n, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>{n.src}</span>
                      <span>{n.date}</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-200 leading-snug">{n.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{n.desc}</p>
                  </div>
                  
                  <div className="text-[10px] text-farm-green-500 font-bold flex items-center space-x-0.5 mt-4 cursor-pointer hover:underline">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
