import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher, PaCommitteeMember, PaEvaluationRecord } from '../types';
import { 
  Award, 
  FileText, 
  Download, 
  CheckCircle2, 
  Search, 
  UserCheck, 
  ExternalLink,
  ShieldCheck, 
  FileCheck, 
  Play, 
  Video, 
  X, 
  Filter, 
  GraduationCap, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  Folder,
  ChevronRight
} from 'lucide-react';
import { 
  getVideoEmbedUrl,
  getYouTubeEmbedUrl, 
  isTeacherAssignedToCommittee, 
  getTeacherCommitteeSetNumber, 
  getTeacherAcademicCategory,
  STANDARD_ACADEMIC_CATEGORIES,
  isTeacherDeputyDirector
} from '../data/mockData';

export const PaPage: React.FC = () => {
  const { 
    teachers, 
    documents, 
    setSelectedTeacher, 
    setIsTeacherLoginOpen, 
    currentTeacher, 
    setIsTeacherProfileOpen,
    paCommitteeMembers,
    paEvaluations,
    getTeacherEvaluations,
    setActiveTab
  } = useApp();

  const [activePaTab, setActivePaTab] = useState<'dashboard' | 'teachers' | 'forms'>('dashboard');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'committeeApproved'>('all');
  const [standingFilter, setStandingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Video Player Modal State
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    teacherName: string;
    position: string;
    academicStanding: string;
    photo: string;
    challengeTitle?: string;
  } | null>(null);

  // Committee Feedback View Modal
  const [committeeFeedbackTeacher, setCommitteeFeedbackTeacher] = useState<Teacher | null>(null);

  // Filter PA specific documents
  const paDocuments = documents.filter(doc => 
    doc.category.toLowerCase().includes('pa') || 
    doc.title.toLowerCase().includes('pa') ||
    doc.category.toLowerCase().includes('sar') ||
    doc.title.toLowerCase().includes('แผน') ||
    doc.title.toLowerCase().includes('แบบฟอร์ม')
  );

  const displayDocs = paDocuments.length > 0 ? paDocuments : documents;

  // Calculate PA Dashboard Statistics
  const totalTeachers = teachers.length;
  const completedTeachers = teachers.filter(t => t.paStatus === 'completed' || (Boolean(t.paChallengeTitle) && (Boolean(t.paVideoUrl) || Boolean(t.paDocumentUrl) || Boolean(t.paFolderUrl))));
  const pendingTeachers = teachers.filter(t => !completedTeachers.some(c => c.id === t.id));
  const completionRate = totalTeachers > 0 ? Math.round((completedTeachers.length / totalTeachers) * 100) : 0;
  const totalVideos = teachers.filter(t => Boolean(t.paVideoUrl)).length;
  const totalDocuments = teachers.filter(t => Boolean(t.paDocumentUrl)).length;
  const totalFolders = teachers.filter(t => Boolean(t.paFolderUrl)).length;

  // Committee Review Statistics
  const fullyCommitteeApprovedTeachers = teachers.filter(t => {
    const evals = getTeacherEvaluations(t.id);
    const teacherSet = getTeacherCommitteeSetNumber(t);
    const targetComm = teacherSet 
      ? paCommitteeMembers.filter(m => (m.setNumber || 1) === teacherSet && isTeacherAssignedToCommittee(t, m))
      : [];
    if (targetComm.length === 0) return false;
    const completedCount = targetComm.filter(m => {
      const e = evals.find(rec => rec.committeeId === m.id);
      return e && e.docChecked && e.videoChecked;
    }).length;
    return completedCount === targetComm.length && completedCount > 0;
  });

  // Filter teachers based on search query, submission status, and academic standing
  const filteredTeachers = teachers.filter(t => {
    const isCompleted = t.paStatus === 'completed' || (Boolean(t.paChallengeTitle) && Boolean(t.paVideoUrl));
    const evals = getTeacherEvaluations(t.id);
    const teacherSet = getTeacherCommitteeSetNumber(t);
    const targetComm = teacherSet 
      ? paCommitteeMembers.filter(m => (m.setNumber || 1) === teacherSet && isTeacherAssignedToCommittee(t, m))
      : [];
    const isFullyApproved = targetComm.length > 0 && targetComm.every(m => {
      const e = evals.find(rec => rec.committeeId === m.id);
      return e && e.docChecked && e.videoChecked;
    });
    
    // Status filter
    if (statusFilter === 'completed' && !isCompleted) return false;
    if (statusFilter === 'pending' && isCompleted) return false;
    if (statusFilter === 'committeeApproved' && !isFullyApproved) return false;

    // Academic standing filter (Exact Match via Single Source of Truth)
    if (standingFilter !== 'all') {
      const teacherCat = getTeacherAcademicCategory(t);
      if (teacherCat !== standingFilter) {
        return false;
      }
    }

    // Search query matching
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) || 
      t.position.toLowerCase().includes(q) || 
      (t.academicStanding || '').toLowerCase().includes(q) ||
      (t.subjectName || '').toLowerCase().includes(q) ||
      (t.paChallengeTitle || '').toLowerCase().includes(q)
    );
  });

  const deputyDirectors = useMemo(() => {
    return filteredTeachers.filter(t => isTeacherDeputyDirector(t));
  }, [filteredTeachers]);

  const regularTeachers = useMemo(() => {
    return filteredTeachers.filter(t => !isTeacherDeputyDirector(t));
  }, [filteredTeachers]);

  const renderTeacherPaCard = (teacher: Teacher) => {
    const isDeputy = isTeacherDeputyDirector(teacher);
    const isCompleted = teacher.paStatus === 'completed' || (Boolean(teacher.paChallengeTitle) && (Boolean(teacher.paVideoUrl) || Boolean(teacher.paDocumentUrl) || Boolean(teacher.paFolderUrl)));
    const hasVideo = Boolean(teacher.paVideoUrl);
    const hasDoc = Boolean(teacher.paDocumentUrl);
    const hasFolder = Boolean(teacher.paFolderUrl);

    return (
      <div 
        key={teacher.id}
        className={`bg-white rounded-3xl border p-6 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between ${
          isDeputy 
            ? 'border-amber-300 ring-1 ring-amber-400/30 bg-gradient-to-b from-amber-50/20 to-white' 
            : isCompleted ? 'border-emerald-200' : 'border-slate-200'
        }`}
      >
        <div className="space-y-4">
          {/* Teacher Profile & PA Status Header */}
          <div className="flex items-start space-x-3.5">
            <img 
              src={teacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'} 
              alt={teacher.name} 
              className={`w-16 h-16 rounded-2xl object-cover shrink-0 shadow-xs ${isDeputy ? 'border-2 border-amber-400' : 'border-2 border-[#005BAC]/20'}`} 
            />
            <div className="min-w-0 flex-1">
              {isCompleted ? (
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full mb-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
                  จัดทำเรียบร้อยแล้ว
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full mb-1">
                  <Clock className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                  ยังไม่จัดทำ
                </span>
              )}

              <h3 className="font-prompt font-bold text-slate-900 text-base leading-snug truncate">
                {teacher.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isDeputy ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300' : 'text-[#005BAC] bg-blue-50'}`}>
                  {teacher.academicStanding || 'ครู'}
                </span>
                {teacher.position && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isDeputy ? 'text-amber-900 bg-amber-50 border border-amber-300 font-bold' : 'text-slate-700 bg-amber-50 border border-amber-200'
                  }`}>
                    {isDeputy ? `ตำแหน่ง ${teacher.position}` : `สายชั้น ${teacher.position}`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-1">
                {teacher.subjectName || 'กลุ่มสาระการเรียนรู้'}
              </p>
            </div>
          </div>

          {/* PA Challenge Box (ประเด็นท้าทาย) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-[#005BAC]" />
                <span>ประเด็นท้าทาย PA</span>
              </span>
              <span className="text-slate-500 font-semibold">ปี 2569</span>
            </div>
            <p className="text-slate-700 italic line-clamp-2 leading-relaxed text-[11px]">
              {teacher.paChallengeTitle || '(ยังไม่ได้ระบุชื่อประเด็นท้าทาย)'}
            </p>
          </div>

          {/* Committee 3-Member Mini Roster Status */}
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1 text-[11px]">
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>การตรวจรับรองโดยคณะกรรมการ</span>
              </span>
              {(() => {
                const teacherSet = getTeacherCommitteeSetNumber(teacher);
                const targetComm = teacherSet 
                  ? paCommitteeMembers.filter(m => (m.setNumber || 1) === teacherSet && isTeacherAssignedToCommittee(teacher, m))
                  : [];
                const evals = getTeacherEvaluations(teacher.id);
                const fullyApproved = targetComm.filter(m => {
                  const rec = evals.find(e => e.committeeId === m.id);
                  return rec && rec.docChecked && rec.videoChecked;
                }).length;
                return (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    fullyApproved === targetComm.length && targetComm.length > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {fullyApproved}/{targetComm.length} ท่าน
                  </span>
                );
              })()}
            </div>

            {/* Committee Members Micro Indicators */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(() => {
                const teacherSet = getTeacherCommitteeSetNumber(teacher);
                const targetComm = teacherSet 
                  ? paCommitteeMembers.filter(m => (m.setNumber || 1) === teacherSet && isTeacherAssignedToCommittee(teacher, m))
                  : [];
                if (targetComm.length === 0) {
                  return (
                    <div className="col-span-3 text-center text-[10px] text-slate-400 py-1">
                      ยังไม่ได้รับมอบหมายคณะกรรมการ
                    </div>
                  );
                }
                return targetComm.map((member, idx) => {
                  const evals = getTeacherEvaluations(teacher.id);
                  const evalRec = evals.find(e => e.committeeId === member.id);
                  const docOk = evalRec?.docChecked ?? false;
                  const vidOk = evalRec?.videoChecked ?? false;
                  const allOk = docOk && vidOk;

                  return (
                    <div 
                      key={member.id}
                      className={`p-1.5 rounded-xl border text-center text-[10px] ${
                        allOk
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : docOk || vidOk
                          ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="font-bold block truncate text-[9px] text-slate-700">
                        ท่านที่ {member.order || idx + 1}
                      </span>
                      <div className="flex items-center justify-center space-x-1 mt-0.5 font-bold">
                        <span title={docOk ? 'ตรวจเอกสารแล้ว' : 'ยังไม่ตรวจเอกสาร'} className={docOk ? 'text-emerald-600' : 'text-slate-300'}>
                          📄{docOk ? '✓' : '×'}
                        </span>
                        <span title={vidOk ? 'ตรวจคลิปแล้ว' : 'ยังไม่ตรวจคลิป'} className={vidOk ? 'text-emerald-600' : 'text-slate-300'}>
                          🎥{vidOk ? '✓' : '×'}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* View Committee Feedback Button */}
            {(() => {
              const evals = getTeacherEvaluations(teacher.id);
              const hasAnyFeedback = evals.some(e => e.docChecked || e.videoChecked || e.overallComment);
              if (!hasAnyFeedback) return null;
              return (
                <button
                  onClick={() => setCommitteeFeedbackTeacher(teacher)}
                  className="w-full mt-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition shadow-2xs"
                >
                  <MessageSquare className="w-3 h-3 text-[#005BAC]" />
                  <span>ดูผลการตรวจ & ข้อเสนอแนะกรรมการ</span>
                </button>
              );
            })()}
          </div>

          {/* PA Video Clip Button */}
          <div>
            {hasVideo ? (
              <button
                onClick={() => handleOpenVideo(teacher)}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-xs group/vid"
              >
                <Play className="w-4 h-4 fill-white group-hover/vid:scale-110 transition-transform" />
                <span>🎬 รับชมคลิปวิดีโอ PA</span>
              </button>
            ) : (
              <div className="bg-slate-100 text-slate-400 py-2 px-3 rounded-xl text-[11px] text-center font-medium flex items-center justify-center space-x-1 border border-slate-200">
                <Video className="w-3.5 h-3.5 text-slate-400" />
                <span>⏳ ยังไม่มีคลิปวิดีโอ PA</span>
              </div>
            )}
          </div>
        </div>

        {/* PA Document / Folder Link & Profile Details */}
        <div className="pt-3 flex flex-wrap items-center justify-between border-t border-slate-100 text-xs gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {hasDoc && (
              <a
                href={teacher.paDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#005BAC] hover:text-[#003875] hover:underline font-bold text-xs flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                title="เปิดไฟล์เอกสาร PA"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>เอกสาร PA</span>
              </a>
            )}

            {hasFolder && (
              <a
                href={teacher.paFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 hover:text-amber-950 hover:underline font-bold text-xs flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200"
                title="เปิดโฟลเดอร์รวมไฟล์ผลงานทั้งหมด"
              >
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <span>โฟลเดอร์รวมไฟล์</span>
              </a>
            )}

            {!hasDoc && !hasFolder && (
              <span className="text-[11px] text-slate-400 italic">
                ยังไม่มีไฟล์เอกสาร
              </span>
            )}
          </div>

          <button
            onClick={() => setSelectedTeacher(teacher)}
            className="bg-slate-100 hover:bg-[#005BAC] hover:text-white text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 shrink-0"
          >
            <span>โปรไฟล์</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Group teachers by Academic Standing (วิทยฐานะ) - Single Source of Truth
  const academicStandingsList = STANDARD_ACADEMIC_CATEGORIES.map(cat => ({
    id: cat,
    name: cat
  }));

  const handleDownloadDoc = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleOpenVideo = (t: Teacher) => {
    if (!t.paVideoUrl) return;
    setActiveVideo({
      url: t.paVideoUrl,
      teacherName: t.name,
      position: t.position,
      academicStanding: t.academicStanding || t.position,
      photo: t.photo,
      challengeTitle: t.paChallengeTitle
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-[#005BAC] via-[#004584] to-[#002D57] text-white p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none p-6">
          <Award className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center space-x-2 bg-[#FFD54F] text-[#003875] text-xs font-bold px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>ระบบข้อตกลงในการพัฒนางาน (Performance Agreement: ว.PA)</span>
          </div>

          <h1 className="font-prompt text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            แดชบอร์ดติดตามข้อตกลง PA <br className="hidden sm:inline" />
            และคลิปวิดีโอการสอน โรงเรียนวัดบางโฉลงใน
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            สรุปสถานะการจัดทำข้อตกลงในการพัฒนางาน (PA) ประเด็นท้าทาย และคลิปวิดีโอบันทึกการสอนของคณะครูทุกท่านตามวิทยฐานะ
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            {currentTeacher ? (
              <button
                onClick={() => setIsTeacherProfileOpen(true)}
                className="bg-[#FFD54F] hover:bg-[#FFC107] text-[#003875] font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>กรอก/แก้ไขข้อตกลง PA ของฉัน</span>
              </button>
            ) : (
              <button
                onClick={() => setIsTeacherLoginOpen(true)}
                className="bg-[#FFD54F] hover:bg-[#FFC107] text-[#003875] font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>เข้าสู่ระบบครูเพื่อส่งข้อตกลง PA</span>
              </button>
            )}

            <button
              onClick={() => setActivePaTab('forms')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-xs border border-white/30 backdrop-blur-xs transition flex items-center space-x-2"
            >
              <FileCheck className="w-4 h-4 text-[#FFD54F]" />
              <span>ดาวน์โหลดแบบฟอร์ม PA / SAR</span>
            </button>

            <a
              href="/PA_SYSTEM_USER_MANUAL.txt"
              download="คู่มือการใช้งานระบบ_PA_โรงเรียนวัดบางโฉลงใน.txt"
              className="bg-emerald-500/90 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs border border-emerald-400 shadow-md backdrop-blur-xs transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4 text-white" />
              <span>ดาวน์โหลดคู่มือระบบ PA (.txt)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. PA Submission Summary Dashboard (แดชบอร์ดสรุปว่าใครส่งหรือไม่ส่ง) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#005BAC]" />
              <h2 className="font-prompt text-xl sm:text-2xl font-bold text-slate-900">
                แดชบอร์ดสรุปสถานะการส่งข้อตกลง PA
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              ภาพรวมการส่งประเด็นท้าทาย คลิปวิดีโอ และเอกสาร PA ของคณะครูทั้งหมด ประจำปีการศึกษา 2569
            </p>
          </div>

          {/* Overall Completion Rate Meter */}
          <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl flex items-center space-x-4 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-semibold">ความคืบหน้ารวม</div>
              <div className="text-2xl font-extrabold font-prompt text-[#005BAC]">
                {completionRate}%
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-emerald-500 border-r-emerald-500 flex items-center justify-center font-bold text-xs text-slate-700 bg-white">
              {completedTeachers.length}/{totalTeachers}
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Teachers */}
          <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#005BAC] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-prompt text-slate-900">{totalTeachers} ท่าน</div>
              <div className="text-xs text-blue-900 font-semibold">คณะครูทั้งหมด</div>
            </div>
          </div>

          {/* Completed (ส่งแล้ว) */}
          <div 
            onClick={() => setStatusFilter('completed')}
            className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 flex items-center space-x-4 cursor-pointer hover:bg-emerald-100/70 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-prompt text-emerald-900">
                {completedTeachers.length} ท่าน
              </div>
              <div className="text-xs text-emerald-800 font-bold flex items-center space-x-1">
                <span>✅ จัดทำเรียบร้อยแล้ว</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                  {completionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Committee 3-Approved Count */}
          <div 
            onClick={() => setStatusFilter('committeeApproved')}
            className="bg-teal-50/80 p-5 rounded-2xl border border-teal-200 flex items-center space-x-4 cursor-pointer hover:bg-teal-100/70 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-prompt text-teal-900">
                {fullyCommitteeApprovedTeachers.length} ท่าน
              </div>
              <div className="text-xs text-teal-800 font-bold flex items-center space-x-1">
                <span>⭐️ กรรมการตรวจครบ 3 ท่าน</span>
              </div>
            </div>
          </div>

          {/* Media Count */}
          <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-prompt text-slate-900">
                {totalVideos} คลิป / {totalDocuments} ไฟล์
              </div>
              <div className="text-xs text-purple-900 font-semibold">คลิปวิดีโอ & ไฟล์ PA</div>
            </div>
          </div>
        </div>

        {/* Committee Entry Shortcut Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#005BAC] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">
                ห้องคณะกรรมการผู้ประเมิน PA ประจำปีงบประมาณ 2569
              </h4>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                สำหรับคณะกรรมการ 3 ท่าน เข้าตรวจดูรายงานข้อตกลง PA และคลิปวิดีโอ พร้อมกดบันทึกผลการประเมิน
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pa-committee')}
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 shrink-0"
          >
            <span>เข้าสู่ห้องตรวจกรรมการ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>ความคืบหน้าการส่งข้อตกลง PA ทั่วทั้งโรงเรียน</span>
            <span className="text-[#005BAC]">ส่งแล้ว {completedTeachers.length} จาก {totalTeachers} ท่าน ({completionRate}%)</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 p-0.5">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. Navigation Controls, Status Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          
          {/* Status Tab Filters */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                statusFilter === 'all' 
                  ? 'bg-[#005BAC] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>ครูทั้งหมด</span>
              <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">{totalTeachers}</span>
            </button>

            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                statusFilter === 'completed' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>จัดทำเรียบร้อยแล้ว</span>
              <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">{completedTeachers.length}</span>
            </button>

            <button
              onClick={() => setStatusFilter('committeeApproved')}
              className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                statusFilter === 'committeeApproved' 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>กรรมการตรวจครบ 3 ท่าน</span>
              <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">{fullyCommitteeApprovedTeachers.length}</span>
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                statusFilter === 'pending' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>ยังไม่จัดทำ</span>
              <span className="bg-black/10 px-1.5 py-0.2 rounded-full text-[10px]">{pendingTeachers.length}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="ค้นหาชื่อครู, ประเด็นท้าทาย, วิทยฐานะ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Academic Standing (วิทยฐานะ) Sub-Filter Bar */}
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-slate-700 shrink-0 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-[#005BAC]" />
            วิทยฐานะ:
          </span>

          <button
            onClick={() => setStandingFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              standingFilter === 'all'
                ? 'bg-[#005BAC] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด ({teachers.length})
          </button>

          {academicStandingsList.map(st => {
            const count = teachers.filter(t => getTeacherAcademicCategory(t) === st.id).length;
            return (
              <button
                key={st.id}
                onClick={() => setStandingFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center space-x-1 ${
                  standingFilter === st.id
                    ? 'bg-[#005BAC] text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{st.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  standingFilter === st.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Teachers PA Cards Roster (ONLY PA Challenge, PA Video, and PA Documents - No General Resources!) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-prompt text-2xl font-bold text-slate-900">
              สถานะข้อตกลง PA และคลิปวิดีโอการสอนรายบุคคล
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              แสดงเฉพาะประเด็นท้าทาย วิดีโอบันทึกการสอน และไฟล์เอกสารข้อตกลง PA ของครูแต่ละท่าน
            </p>
          </div>
          <span className="text-xs font-bold text-[#005BAC] bg-blue-50 px-3 py-1 rounded-full shrink-0">
            แสดง {filteredTeachers.length} ท่าน
          </span>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-2">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
            <p className="text-xs text-slate-500">ลองเปลี่ยนตัวกรองสถานะ หรือค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 4A: Deputy Directors (รองผู้อำนวยการสถานศึกษา - กรรมการชุดที่ 4) */}
            {deputyDirectors.length > 0 && (
              <div className="space-y-4 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-amber-300/60 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-prompt font-extrabold text-slate-900 text-lg sm:text-xl flex items-center space-x-2">
                        <span>คณะผู้บริหารสถานศึกษา / รองผู้อำนวยการโรงเรียน</span>
                        <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                          {deputyDirectors.length} ท่าน
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        ข้อตกลงในการพัฒนางาน ว.PA ประเมินโดย: <strong>คณะกรรมการชุดที่ 4 (ประเมินรองผู้อำนวยการสถานศึกษา)</strong>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full w-fit">
                    🎯 คณะกรรมการชุดที่ 4 ประเมิน
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {deputyDirectors.map((teacher) => renderTeacherPaCard(teacher))}
                </div>
              </div>
            )}

            {/* Section 4B: Regular Teachers & Personnel */}
            {regularTeachers.length > 0 && (
              <div className="space-y-4">
                {deputyDirectors.length > 0 && (
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#005BAC] text-white flex items-center justify-center font-bold shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="font-prompt font-extrabold text-slate-900 text-lg sm:text-xl">
                        คณะครูผู้สอนและบุคลากรทางการศึกษา
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {regularTeachers.length} ท่าน
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularTeachers.map((teacher) => renderTeacherPaCard(teacher))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. PA Downloadable Forms & Documents Section */}
      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-prompt text-2xl font-bold text-slate-900">
              ดาวน์โหลดแบบฟอร์ม PA และเอกสารประเมิน
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              แบบฟอร์ม PA 1/ส, แบบประเมิน PA 2/ส, PA 3/ส และแบบสรุปผลการประเมิน SAR
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
          {displayDocs.map((doc) => (
            <div 
              key={doc.id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-prompt font-bold text-slate-900 text-sm">
                    {doc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="bg-blue-50 text-[#005BAC] font-bold px-2 py-0.5 rounded-md">
                      {doc.category}
                    </span>
                    <span>{doc.fileType}</span>
                    <span>• {doc.fileSize}</span>
                    <span>• อัปเดตล่าสุด {doc.updatedAt}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadDoc(doc.fileUrl)}
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์ PA</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 my-auto relative text-white space-y-4 p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={activeVideo.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'} 
                  alt={activeVideo.teacherName} 
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-500" 
                />
                <div>
                  <h3 className="font-prompt font-bold text-white text-base">
                    🎬 คลิปวิดีโอการสอน PA - {activeVideo.teacherName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeVideo.academicStanding} ({activeVideo.position})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PA Challenge Callout in modal */}
            {activeVideo.challengeTitle && (
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
                <span className="text-amber-400 font-bold">ประเด็นท้าทาย: </span>
                <span className="text-slate-200">{activeVideo.challengeTitle}</span>
              </div>
            )}

            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              {getVideoEmbedUrl(activeVideo.url) ? (
                <iframe
                  src={getVideoEmbedUrl(activeVideo.url)!}
                  title={`PA Video ${activeVideo.teacherName}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-900">
                  <Video className="w-16 h-16 text-rose-500 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-white">ลิงก์วิดีโอ PA อยู่ที่ภายนอก</p>
                    <p className="text-xs text-slate-400 max-w-md">
                      สามารถกดปุ่มด้านล่างเพื่อเปิดรับชมวิดีโอนี้ในแท็บใหม่ได้โดยตรง
                    </p>
                  </div>
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center space-x-2 shadow-lg"
                  >
                    <span>เปิดรับชมวิดีโอ PA ในแท็บใหม่</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
              <span>วิดีโอคลิปบันทึกการสอน ประกอบการประเมิน PA โรงเรียนวัดบางโฉลงใน</span>
              <button
                onClick={() => setActiveVideo(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Committee Review Feedback & Scoring Modal */}
      {committeeFeedbackTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto text-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={committeeFeedbackTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'} 
                  alt={committeeFeedbackTeacher.name} 
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                />
                <div>
                  <h3 className="font-prompt font-bold text-slate-900 text-base">
                    ผลการตรวจรับรองและข้อเสนอแนะโดยคณะกรรมการ PA
                  </h3>
                  <p className="text-xs text-slate-500">
                    {committeeFeedbackTeacher.name} ({committeeFeedbackTeacher.academicStanding})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCommitteeFeedbackTeacher(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PA Challenge Summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-400 block mb-1">ประเด็นท้าทาย (PA Challenge):</span>
              <p className="font-medium text-slate-800 leading-relaxed">
                {committeeFeedbackTeacher.paChallengeTitle || 'ไม่ได้ระบุ'}
              </p>
            </div>

            {/* Committee Reviews Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center">
                <ClipboardCheck className="w-4 h-4 mr-1 text-[#005BAC]" />
                บันทึกการประเมินของคณะกรรมการ
              </h4>

              {(() => {
                const teacherSet = getTeacherCommitteeSetNumber(committeeFeedbackTeacher);
                const targetComm = teacherSet 
                  ? paCommitteeMembers.filter(m => (m.setNumber || 1) === teacherSet && isTeacherAssignedToCommittee(committeeFeedbackTeacher, m))
                  : [];
                if (targetComm.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                      ยังไม่ได้รับมอบหมายคณะกรรมการสำหรับผู้รับการประเมินท่านนี้
                    </div>
                  );
                }
                return targetComm.map((member, idx) => {
                  const evals = getTeacherEvaluations(committeeFeedbackTeacher.id);
                  const evalRec = evals.find(e => e.committeeId === member.id);
                  const docOk = evalRec?.docChecked ?? false;
                  const vidOk = evalRec?.videoChecked ?? false;

                  return (
                    <div 
                      key={member.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-bold bg-[#005BAC] text-white px-1.5 py-0.2 rounded">
                                ท่านที่ {member.order || idx + 1}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900">
                                {member.name}
                              </h5>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {member.role}
                            </p>
                          </div>
                        </div>

                      {/* Status pill & score */}
                      <div className="text-right">
                        {evalRec?.overallScore ? (
                          <div className="inline-block bg-blue-50 text-[#005BAC] px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border border-blue-200 mb-1">
                            {evalRec.overallScore} / 100 คะแนน
                          </div>
                        ) : null}
                        <div>
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            docOk && vidOk 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : (docOk || vidOk)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {docOk && vidOk ? '✅ ตรวจครบถ้วน' : (docOk || vidOk) ? '⏳ ตรวจบางส่วน' : '❌ ยังไม่ตรวจ'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checklist & Timestamps */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center space-x-1.5">
                        <span className={docOk ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {docOk ? '✅' : '⏳'} เอกสารรายงาน PA:
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {docOk ? (evalRec?.docCheckedAt || 'ตรวจแล้ว') : 'ยังไม่ตรวจ'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={vidOk ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {vidOk ? '✅' : '⏳'} คลิปวิดีโอการสอน:
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {vidOk ? (evalRec?.videoCheckedAt || 'ตรวจแล้ว') : 'ยังไม่ตรวจ'}
                        </span>
                      </div>
                    </div>

                    {/* Feedback texts if present */}
                    {(evalRec?.docFeedback || evalRec?.videoFeedback || evalRec?.overallComment) && (
                      <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                        {evalRec.docFeedback && (
                          <div className="text-slate-700">
                            <span className="font-bold text-slate-500">📄 ข้อเสนอแนะเอกสาร: </span>
                            <span>{evalRec.docFeedback}</span>
                          </div>
                        )}
                        {evalRec.videoFeedback && (
                          <div className="text-slate-700">
                            <span className="font-bold text-slate-500">🎥 ข้อเสนอแนะคลิป: </span>
                            <span>{evalRec.videoFeedback}</span>
                          </div>
                        )}
                        {evalRec.overallComment && (
                          <div className="text-slate-800 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                            <span className="font-bold text-amber-900">💡 ความเห็นสรุป: </span>
                            <span>{evalRec.overallComment}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setCommitteeFeedbackTeacher(null);
                  setActiveTab('pa-committee');
                }}
                className="text-xs font-bold text-[#005BAC] hover:underline flex items-center space-x-1"
              >
                <span>ไปยังหน้าคณะกรรมการ PA</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCommitteeFeedbackTeacher(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

