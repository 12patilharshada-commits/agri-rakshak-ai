import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../contexts/translationContext';
import { Sprout, Phone, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setOtpSent(true);
    // Simulating sending SMS OTP
    VoiceSystemSpeak('Your OTP is 1 2 3 4');
  };

  const VoiceSystemSpeak = (msg: string) => {
    // Speak verification message if supported
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') {
      setError('Invalid OTP. Use demo OTP: 1234');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate API registering/logging in via OTP
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: `${mobile}@agrirakshak.com`, 
          name: `Farmer ${mobile.slice(-4)}`,
          googleId: mobile
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo.farmer@agrirakshak.com',
          name: 'Demo Farmer',
          googleId: 'google-demo-123456789'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onLoginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-farm-green-600/10 rounded-full blur-3xl -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-farm-orange-500/5 rounded-full blur-3xl -z-10 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 flex space-x-2 glass-panel p-1 rounded-xl">
        {(['en', 'hi', 'mr'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-200 ${
              language === lang 
                ? 'bg-farm-green-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-farm-green-600 via-white to-farm-orange-500"></div>
        
        {/* App Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-farm-green-950/80 border border-farm-green-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-farm-green-600/10 mb-3 animate-float">
            <Sprout className="w-9 h-9 text-farm-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">{t('app.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('app.tagline')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-5 flex items-start space-x-2 text-red-200 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => { setLoginMethod('email'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
              loginMethod === 'email' ? 'border-farm-green-500 text-farm-green-500' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t('nav.chat') === 'कृषी मित्र' ? 'ईमेल लॉगिन' : 'Email Login'}
          </button>
          <button
            onClick={() => { setLoginMethod('otp'); setError(''); }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${
              loginMethod === 'otp' ? 'border-farm-green-500 text-farm-green-500' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t('nav.chat') === 'कृषी मित्र' ? 'मोबाईल OTP' : 'Mobile OTP'}
          </button>
        </div>

        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5 tracking-wider">Email or Mobile</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="name@example.com / 9876543210"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-11"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5 tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-11"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" className="rounded border-slate-800 bg-slate-950 text-farm-green-600 focus:ring-farm-green-600" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="hover:text-farm-green-500 transition-colors duration-200">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-farm-green-600 to-farm-green-700 hover:from-farm-green-500 hover:to-farm-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-farm-green-600/10 hover:shadow-farm-green-600/25 flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5 tracking-wider">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  required
                  disabled={otpSent}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full glass-input pl-11"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase mb-1.5 tracking-wider">Verification OTP (demo: 1234)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full glass-input pl-11 text-center font-bold tracking-widest text-lg"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-farm-green-600 to-farm-green-700 hover:from-farm-green-500 hover:to-farm-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-farm-green-600/10 flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{otpSent ? 'Verify OTP & Log In' : 'Send One-Time OTP'}</span>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <span className="relative bg-slate-950 px-3 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
        </div>

        {/* Third-Party Login Options */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200"
        >
          {/* Custom Google SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.29 1.83 15.54 1 12.24 1 5.48 1 0 6.48 0 13.2s5.48 12.2 12.24 12.2c7.055 0 11.75-4.966 11.75-11.95 0-.8-.086-1.416-.188-2.165H12.24z"/>
          </svg>
          <span className="text-sm">Sign in with Google</span>
        </button>

        <p className="text-center text-slate-400 text-xs mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-farm-green-500 font-bold hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
};
