import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, BookOpen, Download, Users, ArrowRight, Sparkles, Filter, Smartphone } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { 
    setActiveTab, 
    resources, 
    teachers, 
    setSearchQuery, 
    resetFilters,
    setIsAIPlannerOpen,
    setIsPWAInstallModalOpen
  } = useApp();

  const [inputSearch, setInputSearch] = useState('');

  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads || 0), 0);
  const totalResources = resources.length;
  const totalTeachers = teachers.length;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSearch.trim()) {
      resetFilters();
      setSearchQuery(inputSearch.trim());
      setActiveTab('repository');
    }
  };

  return (
    <section className="relative overflow-hidden hero-gradient text-white pt-12 pb-20 md:py-24">
      {/* Background Decorator Circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs sm:text-sm text-[#FFD54F] font-medium shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-[#FFD54F]" />
            <span>ศูนย์รวมนวัตกรรมสื่อการสอนออนไลน์ โรงเรียนวัดบางโฉลงใน</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-prompt">
            คลังสื่อการสอน <br className="hidden sm:inline" />
            <span className="text-[#FFD54F] drop-shadow-md">
              โรงเรียนวัดบางโฉลงใน
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed max-w-2xl mx-auto">
            "แหล่งรวมสื่อการเรียนรู้และผลงานของคณะครู เพื่อแบ่งปันองค์ความรู้และพัฒนาคุณภาพการศึกษา"
          </p>

          {/* Search Box inside Hero */}
          <form 
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto pt-4 relative flex items-center"
          >
            <div className="relative w-full shadow-2xl rounded-2xl overflow-hidden bg-white p-2 flex items-center">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อสื่อ, วิชาวิทยาศาสตร์, คณิตศาสตร์, ป.5..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                className="w-full px-3 py-3 text-slate-800 text-sm sm:text-base focus:outline-none placeholder-slate-400 font-sans"
              />
              <button
                type="submit"
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center shrink-0 shadow-md"
              >
                <span>ค้นหาสื่อ</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => setIsAIPlannerOpen(true)}
              className="bg-gradient-to-r from-amber-300 via-[#FFD54F] to-amber-400 hover:from-amber-400 hover:to-amber-500 text-[#003875] font-extrabold px-6 py-3.5 rounded-xl transition shadow-xl flex items-center space-x-2 text-base border-2 border-white/40 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-[#003875] animate-bounce" />
              <span>✨ AI ช่วยครูสร้างแผนการสอน</span>
            </button>

            <button
              onClick={() => {
                resetFilters();
                setActiveTab('repository');
              }}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg flex items-center space-x-2 text-base border border-white/30 backdrop-blur-md"
            >
              <BookOpen className="w-5 h-5" />
              <span>ดูสื่อทั้งหมด ({totalResources})</span>
            </button>

            <button
              onClick={() => {
                resetFilters();
                setActiveTab('teachers');
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3.5 rounded-xl border border-white/20 backdrop-blur-md transition flex items-center space-x-2 text-base"
            >
              <Users className="w-5 h-5" />
              <span>ผลงานคณะครู</span>
            </button>

            <button
              onClick={() => setIsPWAInstallModalOpen(true)}
              className="bg-white/10 hover:bg-white/25 text-amber-200 hover:text-white font-bold px-5 py-3.5 rounded-xl border border-amber-300/40 backdrop-blur-md transition flex items-center space-x-2 text-base shadow-sm"
              title="ติดตั้งแอปบนมือถือ iOS & Android"
            >
              <Smartphone className="w-5 h-5 text-[#FFD54F]" />
              <span>ติดตั้งแอปบนมือถือ</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FFD54F] font-prompt">
                {totalResources}+
              </div>
              <div className="text-xs sm:text-sm text-slate-200 mt-0.5">สื่อการสอนในระบบ</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FFD54F] font-prompt">
                {totalTeachers}
              </div>
              <div className="text-xs sm:text-sm text-slate-200 mt-0.5">คณะครูผู้สร้างสรรค์</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FFD54F] font-prompt">
                {totalDownloads.toLocaleString()}+
              </div>
              <div className="text-xs sm:text-sm text-slate-200 mt-0.5">จำนวนดาวน์โหลดรวม</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
