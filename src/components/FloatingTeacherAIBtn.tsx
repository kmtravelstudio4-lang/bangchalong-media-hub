import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Sparkles, MessageSquare, X } from 'lucide-react';

export const FloatingTeacherAIBtn: React.FC = () => {
  const { isAIChatOpen, setIsAIChatOpen, activeTab } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  // If chat is open or in admin full panel, hide floating button
  if (isAIChatOpen || activeTab === 'admin') return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Tooltip speech bubble on desktop */}
      <div 
        className={`hidden sm:flex items-center space-x-2 bg-[#003875] text-white text-xs font-bold py-1.5 px-3.5 rounded-full shadow-lg border border-amber-300/40 mb-2 transition-all duration-200 transform ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-1'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#FFD54F] animate-pulse" />
        <span>ถาม-ตอบครู AI 24 ชม.</span>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#003875] via-[#005BAC] to-blue-600 hover:from-[#002852] hover:to-[#004584] text-white shadow-2xl flex items-center justify-center border-2 border-[#FFD54F] transition-all duration-300 transform hover:scale-108 active:scale-95 group cursor-pointer relative"
        title="เปิดห้องปรึกษาและถามตอบครู AI"
        aria-label="เปิดห้องถามตอบครู AI"
      >
        {/* Glow pulsing effect */}
        <span className="absolute inset-0 rounded-full bg-[#FFD54F]/20 animate-ping pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center">
          <Bot className="w-7 h-7 text-[#FFD54F] group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-[9px] font-extrabold text-white tracking-tighter mt-0.5">
            AI ครู
          </span>
        </div>

        {/* Online Indicator Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
      </button>
    </div>
  );
};
