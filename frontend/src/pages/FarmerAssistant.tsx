import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/translationContext';
import { VoiceSystem } from '../utils/voiceSystem';
import { Send, Mic, MicOff, RefreshCw, MessageSquare, Sprout, ShieldAlert, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface FarmerAssistantProps {
  user: any;
}

export const FarmerAssistant: React.FC<FarmerAssistantProps> = ({ user }) => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Avatar states: 'idle', 'listening', 'thinking', 'speaking'
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

  useEffect(() => {
    // Add default greeting on load
    const greeting = language === 'mr'
      ? "नमस्कार! मी आपला कृषी रक्षक एआय सहाय्यक आहे. मी तुम्हाला हवामान, बाजारभाव आणि पिकांविषयी सल्ला देऊ शकतो. तुम्हाला काय विचारायचे आहे?"
      : language === 'hi'
      ? "नमस्कार! मैं आपका कृषि रक्षक एआई सहायक हूँ। मैं आपको मौसम, मंडी भाव और फसलों के बारे में सलाह दे सकता हूँ। आप क्या पूछना चाहते हैं?"
      : "Hello! I am AgriRakshak AI, your farming assistant. Ask me anything about crops, soil testing, market rates, or disease remedies.";

    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: greeting,
        timestamp: new Date()
      }
    ]);
    
    // Voice announce greeting
    VoiceSystem.speak(greeting, language);
  }, [language]);

  useEffect(() => {
    // Scroll to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setAvatarState('thinking');

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: language,
          userId: user.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error('API failed');

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('speaking');
      
      // Speak response
      VoiceSystem.speak(data.response, language);
      
      // Go back to idle after speech completes (approximate duration)
      setTimeout(() => {
        setAvatarState('idle');
      }, Math.max(3000, data.response.length * 50));
      
    } catch (err) {
      // Local fallback on connection error
      const localResponse = "Connection offline. I am answering using my offline knowledge database. Please check your internet connectivity or ask: weather, crops, market prices, or government schemes.";
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: localResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('speaking');
      VoiceSystem.speak(localResponse, language);
      
      setTimeout(() => {
        setAvatarState('idle');
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      VoiceSystem.stopListening();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      setIsListening(true);
      setAvatarState('listening');
      VoiceSystem.startListening(
        language,
        (transcript) => {
          setIsListening(false);
          setAvatarState('thinking');
          handleSendMessage(transcript);
        },
        () => {
          setIsListening(false);
          setAvatarState('idle');
        }
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Left Column: Animated AI Avatar assistant */}
      <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Glow color changing according to avatar state */}
        <div className={`absolute w-60 h-60 rounded-full blur-3xl -z-10 transition-colors duration-500 ${
          avatarState === 'listening' ? 'bg-sky-500/10' :
          avatarState === 'thinking' ? 'bg-yellow-500/10' :
          avatarState === 'speaking' ? 'bg-farm-green-500/10' : 'bg-farm-green-600/5'
        }`}></div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">{t('chat.title')}</h2>
          <p className="text-xs text-slate-400">Localized multilingual agricultural assistant</p>
        </div>

        {/* Animated Avatar Face Representation */}
        <div className="relative w-44 h-44 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl">
          {/* Speaking/listening soundwaves overlay */}
          {avatarState === 'speaking' && (
            <div className="absolute inset-0 border-2 border-farm-green-500 rounded-full animate-ping opacity-25"></div>
          )}
          {avatarState === 'listening' && (
            <div className="absolute inset-0 border-2 border-sky-400 rounded-full animate-ping opacity-25"></div>
          )}

          {/* SVG Farmer representation */}
          <svg className={`w-32 h-32 transition-transform duration-300 ${avatarState === 'listening' ? 'scale-105' : ''}`} viewBox="0 0 100 100">
            {/* Farmer Cap */}
            <path d="M25,35 L75,35 L50,15 Z" fill="#ea580c" />
            <rect x="25" y="32" width="50" height="4" rx="2" fill="#d97706" />

            {/* Farmer Face */}
            <circle cx="50" cy="52" r="18" fill="#fbcfe8" />
            
            {/* Eyes */}
            <circle cx="43" cy="50" r="2.5" fill="#0f172a" className={avatarState === 'thinking' ? 'animate-bounce' : ''} />
            <circle cx="57" cy="50" r="2.5" fill="#0f172a" className={avatarState === 'thinking' ? 'animate-bounce' : ''} />

            {/* Smile / Mouth */}
            {avatarState === 'speaking' ? (
              <ellipse cx="50" cy="59" rx="3" ry="5" fill="#991b1b" />
            ) : (
              <path d="M45,58 Q50,62 55,58" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}

            {/* Ears */}
            <circle cx="31" cy="52" r="3.5" fill="#fbcfe8" />
            <circle cx="69" cy="52" r="3.5" fill="#fbcfe8" />
          </svg>

          {/* Indicator label */}
          <div className="absolute bottom-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold tracking-wider text-slate-300 uppercase shadow-md">
            {avatarState === 'listening' ? 'Listening' :
             avatarState === 'thinking' ? 'Thinking' :
             avatarState === 'speaking' ? 'Speaking' : 'Idle'}
          </div>
        </div>

        {/* Audio Wave Visualizer */}
        <div className="h-10 flex items-center justify-center">
          {avatarState === 'speaking' || avatarState === 'listening' ? (
            <div className="flex items-end">
              <span className="wave-bar" style={{ backgroundColor: avatarState === 'listening' ? '#38bdf8' : '#22c55e' }}></span>
              <span className="wave-bar" style={{ backgroundColor: avatarState === 'listening' ? '#38bdf8' : '#22c55e' }}></span>
              <span className="wave-bar" style={{ backgroundColor: avatarState === 'listening' ? '#38bdf8' : '#22c55e' }}></span>
              <span className="wave-bar" style={{ backgroundColor: avatarState === 'listening' ? '#38bdf8' : '#22c55e' }}></span>
              <span className="wave-bar" style={{ backgroundColor: avatarState === 'listening' ? '#38bdf8' : '#22c55e' }}></span>
            </div>
          ) : avatarState === 'thinking' ? (
            <div className="flex space-x-1.5 items-center">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">Farmer AI is ready to listen</span>
          )}
        </div>

        {/* SOS Warning Info */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-2.5 text-[10px] text-slate-400 text-left leading-relaxed">
          <Sparkles className="w-4.5 h-4.5 text-farm-green-500 shrink-0 mt-0.5" />
          <span>Support voice commands! Say "Show weather", "Check disease", or "Recommend crop" to speak commands and navigate screens verbally.</span>
        </div>
      </div>

      {/* Right Column: Chat dialogue panel */}
      <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[600px]">
        {/* Messages viewport */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-farm-green-600 text-white rounded-tr-none shadow-md shadow-farm-green-600/10'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
          className="flex items-center space-x-2 border-t border-slate-800 pt-4"
        >
          {/* Microphone trigger */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-farm-green-500" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 glass-input text-xs"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-farm-green-600 text-white rounded-xl hover:bg-farm-green-500 flex items-center justify-center transition disabled:opacity-50 shrink-0 shadow-lg shadow-farm-green-600/15"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
