import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { 
  BookOpen, 
  Search, 
  UserCheck, 
  Menu, 
  X, 
  Lock, 
  ShieldCheck, 
  Award, 
  Newspaper, 
  FileText, 
  Info, 
  Phone,
  LayoutDashboard,
  Sparkles,
  Smartphone,
  Bot,
  ClipboardCheck,
  ChevronDown,
  Layers,
  Sparkle,
  GraduationCap
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isAdmin, 
    setIsAdminLoginOpen, 
    setSearchQuery,
    logoutAdmin,
    currentTeacher,
    setIsTeacherLoginOpen,
    setIsTeacherProfileOpen,
    currentCommitteeMember,
    setIsCommitteeLoginOpen,
    logoutCommitteeMember,
    setIsAIPlannerOpen,
    setIsAIChatOpen,
    setIsPWAInstallModalOpen,
    logoutTeacher
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary Navigation items (Core frequent pages)
  const primaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'หน้าแรก', icon: <BookOpen className="w-3.5 h-3.5" /> },
    ...(currentTeacher ? [{ id: 'teacher-dashboard' as ActiveTab, label: 'ห้องทำงานครู', icon: <UserCheck className="w-3.5 h-3.5 text-amber-500" /> }] : []),
    { id: 'repository', label: 'คลังสื่อการสอน', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'exam-library', label: 'คลังข้อสอบ', icon: <GraduationCap className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'teachers', label: 'ผลงานครู', icon: <Award className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'pa', label: 'ข้อตกลง PA', icon: <Award className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'pa-committee', label: 'กรรมการ PA', icon: <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'subjects', label: 'กลุ่มสาระฯ', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> },
  ];

  // Secondary Navigation items (Under "More / เพิ่มเติม")
  const secondaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'news', label: 'ข่าวประชาสัมพันธ์', icon: <Newspaper className="w-4 h-4 text-sky-600" />, desc: 'กิจกรรมและข่าวสารโรงเรียน' },
    { id: 'documents', label: 'ดาวน์โหลดเอกสาร', icon: <FileText className="w-4 h-4 text-emerald-600" />, desc: 'แบบฟอร์มและคู่มือราชการ' },
    { id: 'about', label: 'เกี่ยวกับโรงเรียน', icon: <Info className="w-4 h-4 text-indigo-600" />, desc: 'ประวัติ วิสัยทัศน์ และข้อมูลทั่วไป' },
    { id: 'contact', label: 'ติดต่อเรา', icon: <Phone className="w-4 h-4 text-rose-600" />, desc: 'แผนที่และช่องทางการติดต่อ' },
  ];

  const isSecondaryActive = secondaryNavItems.some(item => item.id === activeTab);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setSearchQuery(headerSearch.trim());
      setActiveTab('repository');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      
      {/* 1. TOP UTILITY BAR (School branding & role entry) */}
      <div className="bg-[#003875] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Left: School Crest & Office */}
          <div className="flex items-center space-x-2">
            <span className="bg-[#FFD54F] text-[#003875] font-extrabold px-2.5 py-0.5 rounded-full text-[10px] tracking-wide shadow-xs">
              โรงเรียนวัดบางโฉลงใน
            </span>
            <span className="hidden sm:inline text-blue-100 text-[11px]">
              สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสมุทรปราการ เขต 2
            </span>
          </div>

          {/* Right: Quick Role Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-[11px]">
            
            {/* Install PWA Button */}
            <button
              onClick={() => setIsPWAInstallModalOpen(true)}
              className="flex items-center space-x-1 text-amber-200 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition font-medium cursor-pointer"
              title="ติดตั้งแอปบนมือถือ iOS & Android"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FFD54F]" />
              <span className="hidden xs:inline">ติดตั้งแอป</span>
            </button>

            <span className="text-white/20">|</span>

            {/* PA Committee Member Button / Logged-in pill */}
            {currentCommitteeMember ? (
              <div className="flex items-center space-x-1.5 bg-emerald-500/25 px-2.5 py-0.5 rounded-full border border-emerald-400/40 text-emerald-100">
                <ClipboardCheck className="w-3 h-3 text-emerald-300 shrink-0" />
                <span className="font-bold text-[11px] truncate max-w-[100px] hidden md:inline">
                  {currentCommitteeMember.name}
                </span>
                <button
                  onClick={() => setActiveTab('pa-committee')}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[10px] transition cursor-pointer"
                >
                  ห้องตรวจ
                </button>
                <button
                  onClick={logoutCommitteeMember}
                  className="text-emerald-200 hover:text-white underline text-[10px] cursor-pointer"
                  title="ออกจากระบบกรรมการ"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('pa-committee');
                  setIsCommitteeLoginOpen(true);
                }}
                className="flex items-center space-x-1 text-emerald-200 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition font-medium cursor-pointer"
                title="เข้าสู่ระบบคณะกรรมการ ว.PA"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>กรรมการ PA</span>
              </button>
            )}

            <span className="text-white/20">|</span>

            {/* Teacher Button / Logged-in pill */}
            {currentTeacher ? (
              <div className="flex items-center space-x-1.5 bg-[#FFD54F]/20 px-2.5 py-0.5 rounded-full border border-[#FFD54F]/40 text-amber-100">
                <button
                  onClick={() => setActiveTab('teacher-dashboard')}
                  className="flex items-center space-x-1 hover:underline cursor-pointer"
                  title="เปิดห้องทำงานของฉัน"
                >
                  <img 
                    src={currentTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'} 
                    alt={currentTeacher.name} 
                    className="w-3.5 h-3.5 rounded-full object-cover border border-amber-300"
                  />
                  <span className="font-bold text-amber-200 text-[11px] truncate max-w-[90px] hidden xs:inline">
                    {currentTeacher.name}
                  </span>
                </button>
                <button
                  onClick={() => setIsTeacherProfileOpen(true)}
                  className="bg-[#FFD54F] text-[#003875] hover:bg-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold transition cursor-pointer"
                  title="แก้ไขโปรไฟล์ครู"
                >
                  โปรไฟล์
                </button>
                <button
                  onClick={logoutTeacher}
                  className="text-amber-200 hover:text-white underline text-[10px] cursor-pointer"
                  title="ออกจากระบบครู"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsTeacherLoginOpen(true)}
                className="flex items-center space-x-1 text-amber-200 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition font-medium cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#FFD54F]" />
                <span>สำหรับครู</span>
              </button>
            )}

            <span className="text-white/20">|</span>

            {/* Admin State */}
            {isAdmin ? (
              <div className="flex items-center space-x-1.5 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-300/40 text-rose-100">
                <ShieldCheck className="w-3 h-3 text-rose-300" />
                <button
                  onClick={() => {
                    logoutTeacher();
                    setActiveTab('admin');
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded text-[10px] transition cursor-pointer"
                >
                  แผงควบคุม
                </button>
                <button
                  onClick={logoutAdmin}
                  className="text-rose-200 hover:text-white underline text-[10px] cursor-pointer"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  logoutTeacher();
                  setIsAdminLoginOpen(true);
                }}
                className="flex items-center space-x-1 text-blue-100 hover:text-[#FFD54F] transition font-medium px-2 py-0.5 rounded-md hover:bg-white/10 cursor-pointer"
              >
                <Lock className="w-3 h-3 text-blue-200" />
                <span>Admin</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer shrink-0 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#005BAC] to-[#003875] text-[#FFD54F] flex items-center justify-center font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform duration-200 border-2 border-[#FFD54F]">
              <span className="font-prompt">บฉ</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base sm:text-lg font-black font-prompt text-[#005BAC] leading-none group-hover:text-[#003875] transition">
                  คลังสื่อการสอน
                </h1>
                <span className="bg-blue-50 text-[#005BAC] text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-blue-200/60 hidden xl:inline">
                  ว.PA
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-tight mt-0.5">
                โรงเรียนวัดบางโฉลงใน
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleHeaderSearchSubmit}
            className="hidden lg:flex items-center relative max-w-[210px] xl:max-w-xs w-full shrink"
          >
            <input
              type="text"
              placeholder="ค้นหาสื่อ, แผนการสอน..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full bg-slate-100/90 text-xs border border-slate-200 rounded-full py-2 pl-8 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:bg-white transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          {/* Desktop Nav Items (Structured & Single-line Non-wrapping) */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const isTeacherTab = item.id === 'teacher-dashboard';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? isTeacherTab
                        ? 'bg-[#FFD54F] text-[#003875] shadow-xs'
                        : 'bg-[#005BAC] text-white shadow-xs'
                      : isTeacherTab
                      ? 'text-amber-700 bg-amber-50/80 hover:bg-amber-100 border border-amber-200'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#005BAC]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Secondary "เพิ่มเติม" Dropdown Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition flex items-center space-x-1 whitespace-nowrap cursor-pointer ${
                  isSecondaryActive
                    ? 'bg-[#005BAC]/15 text-[#005BAC] ring-1 ring-[#005BAC]/30'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#005BAC]'
                }`}
              >
                <span>เพิ่มเติม</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                    เมนูข้อมูลทั่วไป
                  </div>
                  {secondaryNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start space-x-3 cursor-pointer ${
                          isActive
                            ? 'bg-[#005BAC] text-white'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${isActive ? 'text-white' : 'text-slate-900'}`}>
                            {item.label}
                          </div>
                          <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Teacher Assistant Button */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="bg-blue-50 hover:bg-blue-100 text-[#003875] font-extrabold px-2.5 xl:px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs border border-blue-200/80 ml-1 whitespace-nowrap cursor-pointer group"
              title="ปรึกษาวิชาการและเกณฑ์ PA กับครู AI"
            >
              <Bot className="w-3.5 h-3.5 text-[#005BAC] group-hover:scale-110 transition-transform" />
              <span>ถามครู AI</span>
            </button>

            {/* AI Lesson Planner Action Button */}
            <button
              onClick={() => setIsAIPlannerOpen(true)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#003875] font-extrabold px-2.5 xl:px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs border border-amber-300 whitespace-nowrap cursor-pointer transform active:scale-95"
              title="สร้างแผนการสอนอัจฉริยะด้วย AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI สร้างแผน</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="p-2 bg-blue-50 text-[#005BAC] rounded-xl border border-blue-200"
              title="ถามครู AI"
            >
              <Bot className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[85vh] overflow-y-auto">
          
          {/* Mobile Search */}
          <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหาสื่อการสอน, ใบงาน, ว.PA..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full bg-slate-100 text-xs border border-slate-200 rounded-full py-2.5 pl-9 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          {/* Main Navigation Grid */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              เมนูหลัก
            </div>
            <div className="grid grid-cols-2 gap-2">
              {primaryNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center space-x-2 transition ${
                      isActive
                        ? 'bg-[#005BAC] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Pages Grid */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ข้อมูลเพิ่มเติม & บริการ
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center space-x-2 transition ${
                      isActive
                        ? 'bg-[#005BAC] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Tool Action Buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            
            {/* AI Chat */}
            <button
              onClick={() => {
                setIsAIChatOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-[#003875] font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-xs border border-blue-200 text-xs"
            >
              <Bot className="w-4 h-4 text-[#005BAC]" />
              <span>🤖 ห้องถาม-ตอบวิชาการ & ครูพี่เลี้ยง AI</span>
            </button>

            {/* AI Planner */}
            <button
              onClick={() => {
                setIsAIPlannerOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-[#003875] font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-xs text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ AI ช่วยครูสร้างแผนการสอน</span>
            </button>

            {/* PWA Install */}
            <button
              onClick={() => {
                setIsPWAInstallModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 text-xs"
            >
              <Smartphone className="w-4 h-4 text-[#FFD54F]" />
              <span>📱 ติดตั้งแอปพลิเคชันบนสมาร์ตโฟน</span>
            </button>

          </div>
        </div>
      )}
    </header>
  );
};
