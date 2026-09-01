import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { setIsPWAInstallModalOpen } = useApp();
  const { isInstalled, isInstallable, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
      if (isDismissed) {
        setDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Hide banner if running inside installed standalone app or user explicitly dismissed this session
  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await triggerInstall();
      if (!success) {
        setIsPWAInstallModalOpen(true);
      }
    } else {
      setIsPWAInstallModalOpen(true);
    }
  };

  return (
    <aside aria-label="ติดตั้งแอปบนมือถือ" className="fixed bottom-18 left-3 right-3 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-[#003875] via-[#005BAC] to-[#002852] text-white p-3.5 rounded-2xl shadow-2xl border-2 border-[#FFD54F]/40 backdrop-blur-md flex items-center justify-between space-x-3">
        
        {/* App Icon + Text */}
        <div 
          onClick={handleInstallClick}
          className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow shrink-0 flex items-center justify-center">
            <img 
              src="/icons/icon.svg" 
              alt="BCLN App" 
              className="w-full h-full object-contain" 
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs text-white truncate font-prompt">
                ติดตั้งแอปบนมือถือ
              </span>
              <span className="bg-[#FFD54F] text-[#003875] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                iOS / Android
              </span>
            </div>
            <p className="text-[11px] text-blue-100 truncate">
              ใช้งานเต็มจอ • ไม่ต้องพิมพ์ URL
            </p>
          </div>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-[#003875] font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md transition transform active:scale-95 flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-[#003875]" />
            <span>ติดตั้ง</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};
