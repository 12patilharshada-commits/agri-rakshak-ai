import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../contexts/translationContext';
import { Sprout, Phone, Mail, Lock, User, MapPin, Globe, UserCheck, ShieldAlert } from 'lucide-react';

interface RegisterProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLoginSuccess }) => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [langPreference, setLangPreference] = useState<'en' | 'hi' | 'mr'>('en');
  const [role, setRole] = useState<'Farmer' | 'Officer' | 'Admin'>('Farmer');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (mobile.length < 10) {
      setError('Mobile number must be at least 10 digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          email,
          password,
          state,
          district,
          language: langPreference,
          role
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      setLanguage(langPreference);
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative py-12">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-farm-green-600/10 rounded-full blur-3xl -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-farm-orange-500/5 rounded-full blur-3xl -z-10 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-lg glass-panel p-8 relative overflow-hidden">
        {/* Top Gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-farm-green-600 via-white to-farm-orange-500"></div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-farm-green-950/80 border border-farm-green-500/30 rounded-xl flex items-center justify-center shadow-lg mb-2">
            <Sprout className="w-7 h-7 text-farm-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
          <p className="text-slate-400 text-xs">Join AgriRakshak AI Farm Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 flex items-start space-x-2 text-red-200 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">State</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full glass-input pl-10 text-sm appearance-none bg-slate-950"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">District</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Pune / Nashik / Baramati"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Language Preference</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <select
                  value={langPreference}
                  onChange={(e) => setLangPreference(e.target.value as any)}
                  className="w-full glass-input pl-10 text-sm appearance-none bg-slate-950"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>
            </div>

            {/* Role Preference */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Register As</label>
              <div className="relative">
                <UserCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full glass-input pl-10 text-sm appearance-none bg-slate-950"
                >
                  <option value="Farmer">Farmer / किसान</option>
                  <option value="Officer">Agri Officer / अधिकारी</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-farm-green-600 to-farm-green-700 hover:from-farm-green-500 hover:to-farm-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg mt-2 flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Register & Sign Up</span>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-farm-green-500 font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};
