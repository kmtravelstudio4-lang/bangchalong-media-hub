import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Crown, 
  Medal, 
  ArrowRight, 
  BookOpen, 
  Download, 
  TrendingUp, 
  Star,
  Award,
  Zap,
  Calendar,
  Layers,
  UserCheck
} from 'lucide-react';

type LeaderboardPeriod = 'week' | 'all' | 'month';

export const TeacherLeaderboard: React.FC = () => {
  const { 
    teachers, 
    approvedResources, 
    viewTeacherPublications, 
    setIsTeacherLoginOpen,
    currentTeacher,
    setActiveTab
  } = useApp();

  const [period, setPeriod] = useState<LeaderboardPeriod>('week');

  // Compute authentic real data for each teacher based on approved resources
  const rankedTeachers = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const list = teachers.map(teacher => {
      const teacherRes = approvedResources.filter(r => {
        const matchesId = r.teacherId && r.teacherId === teacher.id;
        const matchesName = Boolean(
          r.teacherName && 
          teacher.name && 
          (r.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase() ||
           r.teacherName.includes(teacher.name) ||
           teacher.name.includes(r.teacherName))
        );
        return matchesId || matchesName;
      });
      
      const allTimeCount = teacherRes.length;
      const totalDownloads = teacherRes.reduce((sum, r) => sum + (r.downloads || 0), 0) || teacher.totalDownloads || 0;
      const totalViews = teacherRes.reduce((sum, r) => sum + (r.views || 0), 0);

      const realWeeklyRes = teacherRes.filter(r => {
        if (!r.createdAt) return false;
        const d = new Date(r.createdAt);
        return !isNaN(d.getTime()) && d >= oneWeekAgo;
      });
      const weeklyCount = realWeeklyRes.length;

      const realMonthlyRes = teacherRes.filter(r => {
        if (!r.createdAt) return false;
        const d = new Date(r.createdAt);
        return !isNaN(d.getTime()) && d >= oneMonthAgo;
      });
      const monthlyCount = realMonthlyRes.length;

      let score = allTimeCount;
      if (period === 'week') score = weeklyCount;
      if (period === 'month') score = monthlyCount;

      return {
        teacher,
        score,
        allTimeCount,
        weeklyCount,
        monthlyCount,
        totalDownloads,
        totalViews,
        resources: teacherRes
      };
    });

    const activeContributors = list.filter(item => item.allTimeCount > 0);

    return activeContributors.sort((a, b) => {
      if (period === 'week') {
        if (b.weeklyCount !== a.weeklyCount) return b.weeklyCount - a.weeklyCount;
        if (b.allTimeCount !== a.allTimeCount) return b.allTimeCount - a.allTimeCount;
        return b.totalDownloads - a.totalDownloads;
      }
      if (period === 'month') {
        if (b.monthlyCount !== a.monthlyCount) return b.monthlyCount - a.monthlyCount;
        if (b.allTimeCount !== a.allTimeCount) return b.allTimeCount - a.allTimeCount;
        return b.totalDownloads - a.totalDownloads;
      }
      if (b.allTimeCount !== a.allTimeCount) return b.allTimeCount - a.allTimeCount;
      if (b.totalDownloads !== a.totalDownloads) return b.totalDownloads - a.totalDownloads;
      return b.totalViews - a.totalViews;
    });
  }, [teachers, approvedResources, period]);

  const top3 = rankedTeachers.slice(0, 3);
  const runnerUps = rankedTeachers.slice(3, 7);

  // Desktop podium order: 2 (Silver left), 1 (Gold center), 3 (Bronze right)
  const podiumOrder = top3.length >= 3 
    ? [top3[1], top3[0], top3[2]] 
    : top3;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Container with Royal Navy & Gold Theme - Optimized for iOS & Android screen ratios */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#002244] via-[#002f5a] to-[#001c38] text-white p-3.5 sm:p-6 shadow-xl border border-amber-400/30">
        
        {/* Ambient Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Compact Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#FFD54F] flex items-center justify-center shrink-0 border border-amber-400/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h2 className="font-prompt text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                  อันดับครูสุดขยันแบ่งปันสื่อ
                </h2>
                <span className="hidden xs:inline-flex items-center space-x-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.2 rounded-full text-[9px] font-semibold">
                  <Flame className="w-2.5 h-2.5 text-amber-400" />
                  <span>Leaderboard</span>
                </span>
              </div>
              <p className="text-slate-300 text-[10px] sm:text-[11px] leading-tight truncate">
                จัดอันดับตามจำนวนสื่อการสอนจริงในระบบ
              </p>
            </div>
          </div>

          {/* Period Toggle Buttons - Mobile Touch Friendly */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-white/15 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <button
              onClick={() => setPeriod('week')}
              className={`flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer min-h-[36px] sm:min-h-[32px] ${
                period === 'week'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300 shrink-0" />
              <span>สัปดาห์นี้ 🔥</span>
            </button>

            <button
              onClick={() => setPeriod('month')}
              className={`flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer min-h-[36px] sm:min-h-[32px] ${
                period === 'month'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3 h-3 text-amber-300 shrink-0" />
              <span>เดือนนี้</span>
            </button>

            <button
              onClick={() => setPeriod('all')}
              className={`flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer min-h-[36px] sm:min-h-[32px] ${
                period === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-amber-300 shrink-0" />
              <span>สะสมทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* 🏆 TOP 3 PODIUM - RESPONSIVE FOR ALL SCREEN RATIOS */}
        {top3.length > 0 ? (
          <div className="relative z-10 mb-3.5">
            {/* Grid: 3 columns on tablet/desktop, Clean 3-column micro-podium on mobile or stacked with proper hierarchy */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end max-w-3xl mx-auto">
              {podiumOrder.map((item, idx) => {
                if (!item) return null;
                const isFirst = item.teacher.id === top3[0]?.teacher.id;
                const isSecond = item.teacher.id === top3[1]?.teacher.id;
                const rankNumber = isFirst ? 1 : isSecond ? 2 : 3;

                const config = isFirst
                  ? {
                      medalBg: 'bg-amber-400 text-slate-950 font-black',
                      ringColor: 'ring-2 ring-amber-400 shadow-sm',
                      cardBg: 'bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-900 border-2 border-amber-400/90 shadow-md',
                      badgeBg: 'bg-amber-400 text-slate-950 font-black',
                    }
                  : isSecond
                  ? {
                      medalBg: 'bg-slate-200 text-slate-950 font-black',
                      ringColor: 'ring-2 ring-slate-300 shadow-sm',
                      cardBg: 'bg-gradient-to-b from-slate-700/25 via-slate-900/90 to-slate-900 border border-slate-400/50 shadow-xs',
                      badgeBg: 'bg-slate-300 text-slate-950 font-black',
                    }
                  : {
                      medalBg: 'bg-amber-700 text-white font-black',
                      ringColor: 'ring-2 ring-amber-600 shadow-sm',
                      cardBg: 'bg-gradient-to-b from-amber-800/20 via-slate-900/90 to-slate-900 border border-amber-700/50 shadow-xs',
                      badgeBg: 'bg-amber-700 text-white font-black',
                    };

                return (
                  <motion.div
                    key={item.teacher.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className={`flex flex-col items-center text-center rounded-xl sm:rounded-2xl p-2 sm:p-3.5 transition-all relative group ${config.cardBg} ${
                      isFirst ? 'scale-102 sm:scale-104 z-20 -order-none' : 'z-10'
                    }`}
                  >
                    {/* Top Rank Badge */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className={`text-[9px] sm:text-[10px] px-2 py-0.2 rounded-full shadow-xs flex items-center space-x-1 tracking-tight ${config.badgeBg}`}>
                        {isFirst && <Crown className="w-2.5 h-2.5 fill-current" />}
                        {!isFirst && <Medal className="w-2.5 h-2.5" />}
                        <span>#{rankNumber}</span>
                      </span>
                    </div>

                    {/* Compact Avatar with aspect ratio 1:1 */}
                    <div 
                      className="relative mt-1 mb-1.5 cursor-pointer" 
                      onClick={() => viewTeacherPublications(item.teacher)}
                      title={`คลิกเพื่อดูคลังสื่อของ ${item.teacher.name}`}
                    >
                      <div className={`w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105 aspect-square ${config.ringColor}`}>
                        <img
                          src={item.teacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'}
                          alt={item.teacher.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[8px] sm:text-[10px] shadow-xs border border-slate-900 ${config.medalBg}`}>
                        #{rankNumber}
                      </div>
                    </div>

                    {/* Teacher Name */}
                    <h3 
                      onClick={() => viewTeacherPublications(item.teacher)}
                      className="font-prompt font-bold text-white text-[11px] sm:text-xs md:text-sm leading-tight hover:text-[#FFD54F] transition cursor-pointer truncate max-w-full px-0.5"
                      title={item.teacher.name}
                    >
                      {item.teacher.name}
                    </h3>

                    <p className="text-[9px] sm:text-[10px] text-slate-300 truncate max-w-full mt-0.5">
                      {item.teacher.subjectName ? item.teacher.subjectName.replace('กลุ่มสาระการเรียนรู้', '') : 'ครูผู้สอน'}
                    </p>

                    {/* Compact Metric Box */}
                    <div className="w-full bg-slate-950/70 border border-white/10 rounded-lg sm:rounded-xl p-1.5 sm:p-2 my-1.5">
                      <div className="flex items-baseline justify-center space-x-0.5">
                        <span className="font-prompt font-black text-base xs:text-lg sm:text-xl text-[#FFD54F]">
                          {item.score}
                        </span>
                        <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-slate-300 font-bold">
                          {period === 'week' ? 'สื่อสัปดาห์นี้' : period === 'month' ? 'สื่อเดือนนี้' : 'สื่อสะสม'}
                        </span>
                      </div>

                      <div className="flex items-center justify-around pt-1 mt-1 border-t border-white/10 text-[8px] sm:text-[10px] text-slate-300">
                        <span className="flex items-center space-x-0.5 truncate" title="ยอดดาวน์โหลดสะสม">
                          <Download className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span>{item.totalDownloads.toLocaleString()}</span>
                        </span>
                        <span className="text-white/20 hidden xs:inline">|</span>
                        <span className="hidden xs:flex items-center space-x-0.5 truncate" title="สื่อจริงทั้งหมด">
                          <Layers className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span>{item.allTimeCount} รวม</span>
                        </span>
                      </div>
                    </div>

                    {/* View Media Button (Minimum 40px touch friendly on mobile) */}
                    <button
                      onClick={() => viewTeacherPublications(item.teacher)}
                      className="w-full py-1.5 px-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-[9px] xs:text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center space-x-0.5 sm:space-x-1 border border-white/15 cursor-pointer min-h-[32px] sm:min-h-[36px]"
                    >
                      <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
                      <span className="truncate">คลังสื่อ ({item.allTimeCount})</span>
                      <ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0 hidden xs:inline" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs">
            ยังไม่มีข้อมูลสื่อที่ผ่านการอนุมัติในระบบ
          </div>
        )}

        {/* 🏅 RUNNER-UPS (Horizontally scrollable on mobile without taking vertical height) */}
        {runnerUps.length > 0 && (
          <div className="relative z-10 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-300 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <span className="font-bold text-amber-300 shrink-0 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>อันดับ 4-{3 + runnerUps.length}:</span>
              </span>
              {runnerUps.map((item, idx) => (
                <button
                  key={item.teacher.id}
                  onClick={() => viewTeacherPublications(item.teacher)}
                  className="bg-white/5 hover:bg-white/15 active:bg-white/20 border border-white/10 px-2 py-1 rounded-lg text-[10px] text-slate-200 shrink-0 flex items-center space-x-1.5 transition cursor-pointer min-h-[30px]"
                  title={`ชมคลังสื่อของ ${item.teacher.name} (${item.allTimeCount} รายการ)`}
                >
                  <span className="font-bold text-amber-400">#{idx + 4}</span>
                  <span className="font-medium truncate max-w-[85px]">{item.teacher.name.replace('ครู', '')}</span>
                  <span className="bg-white/10 px-1 rounded text-[9px] text-slate-300 font-bold">{item.score}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 pt-1 sm:pt-0">
              <button
                onClick={() => setActiveTab('teachers')}
                className="text-[10px] sm:text-[11px] text-[#FFD54F] hover:underline font-bold flex items-center gap-1 cursor-pointer min-h-[32px]"
              >
                <span>ดูครูทั้งหมด ({teachers.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {currentTeacher ? (
                <button
                  onClick={() => setActiveTab('teacher-dashboard')}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 active:from-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] transition shadow-xs flex items-center space-x-1 cursor-pointer min-h-[32px]"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>ห้องทำงานครู</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsTeacherLoginOpen(true)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 active:from-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] transition shadow-xs flex items-center space-x-1 cursor-pointer min-h-[32px]"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>เข้าสู่ระบบครู</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
