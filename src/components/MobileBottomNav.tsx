import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  Home, 
  BookOpen, 
  Sparkles, 
  Users, 
  UserCheck, 
  Award,
  Layers, 
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const { 
    activeTab, 
    setActiveTab, 
    currentTeacher,
    setIsAIChatOpen,
    setIsTeacherLoginOpen,
    isAdmin
  } = useApp();

  // If in admin dashboard view, keep screen uncluttered
  if (activeTab === 'admin') return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[calc(env(safe-area-inset-bottom,0px)+4px)] pt-1 px-2 transition-all">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        
        {/* 1. หน้าแรก */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#005BAC] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="หน้าแรก"
        >
          <div className={`p-1 rounded-full transition ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#005BAC]' : 'text-slate-500'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 truncate">
            หน้าแรก
          </span>
        </button>

        {/* 2. คลังสื่อ */}
        <button
          onClick={() => setActiveTab('repository')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] cursor-pointer ${
            activeTab === 'repository'
              ? 'text-[#005BAC] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="คลังสื่อการสอน"
        >
          <div className={`p-1 rounded-full transition ${activeTab === 'repository' ? 'bg-blue-50' : ''}`}>
            <Layers className={`w-5 h-5 ${activeTab === 'repository' ? 'text-[#005BAC]' : 'text-slate-500'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 truncate">
            คลังสื่อ
          </span>
        </button>

        {/* 3. CENTER HERO: ครู AI อัจฉริยะ */}
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
          aria-label="ห้องถามตอบครู AI"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#003875] via-[#005BAC] to-blue-600 text-white shadow-lg border-2 border-[#FFD54F] flex items-center justify-center transform group-active:scale-95 transition">
            <Sparkles className="w-6 h-6 text-[#FFD54F] animate-pulse" />
          </div>
          <span className="text-[10px] font-extrabold text-[#005BAC] leading-tight mt-0.5">
            ครู AI
          </span>
        </button>

        {/* 4. ผลงานครู หรือ ห้องทำงานครู */}
        {currentTeacher ? (
          <button
            onClick={() => setActiveTab('teacher-dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] cursor-pointer ${
              activeTab === 'teacher-dashboard'
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-label="ห้องทำงานครู"
          >
            <div className={`p-1 rounded-full transition ${activeTab === 'teacher-dashboard' ? 'bg-amber-50' : ''}`}>
              <UserCheck className={`w-5 h-5 ${activeTab === 'teacher-dashboard' ? 'text-amber-500' : 'text-slate-500'}`} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate">
              ห้องทำงาน
            </span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] cursor-pointer ${
              activeTab === 'teachers'
                ? 'text-[#005BAC] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-label="ผลงานครู"
          >
            <div className={`p-1 rounded-full transition ${activeTab === 'teachers' ? 'bg-blue-50' : ''}`}>
              <Users className={`w-5 h-5 ${activeTab === 'teachers' ? 'text-[#005BAC]' : 'text-slate-500'}`} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate">
              ผลงานครู
            </span>
          </button>
        )}

        {/* 5. ว.PA / เมนู */}
        <button
          onClick={() => setActiveTab('pa')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] cursor-pointer ${
            activeTab === 'pa' || activeTab === 'pa-committee'
              ? 'text-[#005BAC] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="ข้อตกลง ว.PA"
        >
          <div className={`p-1 rounded-full transition ${activeTab === 'pa' || activeTab === 'pa-committee' ? 'bg-blue-50' : ''}`}>
            <Award className={`w-5 h-5 ${activeTab === 'pa' || activeTab === 'pa-committee' ? 'text-[#005BAC]' : 'text-slate-500'}`} />
          </div>
          <span className="text-[10px] leading-tight mt-0.5 truncate">
            ข้อตกลง PA
          </span>
        </button>

      </div>
    </div>
  );
};
