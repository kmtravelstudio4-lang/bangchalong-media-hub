import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ExamQuestion } from '../types';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Download, 
  Eye, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  Layers, 
  Calendar, 
  User, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

export const ExamLibraryPage: React.FC = () => {
  const { 
    examQuestions, 
    examSearchQuery, 
    setExamSearchQuery,
    examGradeFilter, 
    setExamGradeFilter,
    examSubjectGroupFilter, 
    setExamSubjectGroupFilter,
    examSemesterFilter, 
    setExamSemesterFilter,
    examTypeFilter, 
    setExamTypeFilter,
    examSortBy,
    setExamSortBy,
    resetExamFilters,
    incrementExamViews,
    incrementExamDownloads,
    categories
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  // Filter only published exams for public view (unless admin)
  const publishedExams = useMemo(() => {
    return examQuestions.filter(exam => exam.status === 'published' || !exam.status);
  }, [examQuestions]);

  // Available Filter Options
  const gradeOptions = ['all', 'อนุบาล', 'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
  
  const subjectGroupOptions = [
    'all',
    'กลุ่มสาระฯ ภาษาไทย',
    'กลุ่มสาระฯ คณิตศาสตร์',
    'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี',
    'กลุ่มสาระฯ สังคมศึกษา ศาสนา และวัฒนธรรม',
    'กลุ่มสาระฯ สุขศึกษาและพลศึกษา',
    'กลุ่มสาระฯ ศิลปะ',
    'กลุ่มสาระฯ การงานอาชีพ',
    'กลุ่มสาระฯ ภาษาต่างประเทศ',
    'ระดับปฐมวัย',
    'อื่นๆ'
  ];

  const examTypeOptions = [
    'all',
    'ข้อสอบก่อนเรียน',
    'ข้อสอบหลังเรียน',
    'แบบทดสอบ',
    'แบบฝึกหัด',
    'แบบประเมิน',
    'ข้อสอบกลางภาค',
    'ข้อสอบปลายภาค',
    'อื่นๆ'
  ];

  const semesterOptions = ['all', 'ภาคเรียนที่ 1', 'ภาคเรียนที่ 2'];

  // Filtered and Sorted Exam List
  const filteredExams = useMemo(() => {
    let list = [...publishedExams];

    // Search Query (title, subject, creator, description)
    if (examSearchQuery.trim()) {
      const q = examSearchQuery.toLowerCase().trim();
      list = list.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        (e.creatorName && e.creatorName.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        e.subjectGroup.toLowerCase().includes(q)
      );
    }

    // Grade Level
    if (examGradeFilter !== 'all') {
      list = list.filter(e => e.gradeLevel === examGradeFilter || (examGradeFilter === 'อนุบาล' && e.gradeLevel.includes('อนุบาล')));
    }

    // Subject Group
    if (examSubjectGroupFilter !== 'all') {
      list = list.filter(e => e.subjectGroup === examSubjectGroupFilter || e.subjectGroup.includes(examSubjectGroupFilter.replace('กลุ่มสาระฯ ', '')));
    }

    // Semester
    if (examSemesterFilter !== 'all') {
      list = list.filter(e => e.semester === examSemesterFilter);
    }

    // Exam Type
    if (examTypeFilter !== 'all') {
      list = list.filter(e => e.examType === examTypeFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (examSortBy === 'views') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      if (examSortBy === 'downloads') {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (examSortBy === 'title') {
        return a.title.localeCompare(b.title, 'th');
      }
      // default: latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [
    publishedExams, 
    examSearchQuery, 
    examGradeFilter, 
    examSubjectGroupFilter, 
    examSemesterFilter, 
    examTypeFilter, 
    examSortBy
  ]);

  const handleOpenExam = (exam: ExamQuestion) => {
    if (!exam.examUrl) return;

    // Reject unsafe URLs
    const cleanUrl = exam.examUrl.trim();
    if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('data:')) {
      alert('URL ไม่ปลอดภัย ไม่สามารถเปิดได้');
      return;
    }

    // Atomic View Increment
    incrementExamViews(exam.id);

    // Open safely in new tab
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadExam = (e: React.MouseEvent, exam: ExamQuestion) => {
    e.stopPropagation();
    if (!exam.examUrl) return;

    const cleanUrl = exam.examUrl.trim();
    if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('data:')) return;

    incrementExamDownloads(exam.id);
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };

  const isDownloadable = (url: string) => {
    const lower = (url || '').toLowerCase();
    return lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.zip') || lower.includes('/file/d/');
  };

  const activeFilterCount = (examGradeFilter !== 'all' ? 1 : 0) +
    (examSubjectGroupFilter !== 'all' ? 1 : 0) +
    (examSemesterFilter !== 'all' ? 1 : 0) +
    (examTypeFilter !== 'all' ? 1 : 0) +
    (examSearchQuery.trim() ? 1 : 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#002D5E] via-[#004B8F] to-[#003875] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#FFD54F]/20 text-[#FFD54F] px-3.5 py-1 rounded-full text-xs font-bold border border-[#FFD54F]/30 backdrop-blur-xs">
              <GraduationCap className="w-4 h-4" />
              <span>School Examination Bank</span>
            </div>
            
            <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
              คลังข้อสอบ โรงเรียนวัดบางโฉลงใน
            </h1>
            
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              ศูนย์รวมแบบทดสอบ ข้อสอบวัดผลสัมฤทธิ์ แบบฝึกหัด และเครื่องมือวัดประเมินผลการเรียนรู้ทุกระดับชั้น สำหรับคณะครูและบุคลากรทางการศึกษา
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center min-w-[100px] shadow-sm">
              <div className="text-2xl font-black text-[#FFD54F] font-prompt">
                {publishedExams.length}
              </div>
              <div className="text-[11px] text-blue-100 font-medium mt-0.5">
                ข้อสอบทั้งหมด
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-center min-w-[100px] shadow-sm">
              <div className="text-2xl font-black text-sky-300 font-prompt">
                {publishedExams.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)}
              </div>
              <div className="text-[11px] text-blue-100 font-medium mt-0.5">
                ยอดเปิดข้อสอบ
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 space-y-4">
          
          {/* Main Search Input */}
          <div className="relative">
            <input
              type="text"
              value={examSearchQuery}
              onChange={(e) => setExamSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อข้อสอบ, วิชา, ผู้จัดทำ, หรือเนื้อหารายละเอียด..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-10 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC] transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            {examSearchQuery && (
              <button
                onClick={() => setExamSearchQuery('')}
                className="absolute right-3.5 top-4 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
            
            {/* 1. ระดับชั้น */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">ระดับชั้น</label>
              <select
                value={examGradeFilter}
                onChange={(e) => setExamGradeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              >
                <option value="all">ทุกระดับชั้น</option>
                {gradeOptions.filter(g => g !== 'all').map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* 2. กลุ่มสาระการเรียนรู้ */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">กลุ่มสาระฯ</label>
              <select
                value={examSubjectGroupFilter}
                onChange={(e) => setExamSubjectGroupFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              >
                <option value="all">ทุกกลุ่มสาระ</option>
                {subjectGroupOptions.filter(sg => sg !== 'all').map(sg => (
                  <option key={sg} value={sg}>{sg}</option>
                ))}
              </select>
            </div>

            {/* 3. ประเภทข้อสอบ */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">ประเภทข้อสอบ</label>
              <select
                value={examTypeFilter}
                onChange={(e) => setExamTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              >
                <option value="all">ทุกประเภท</option>
                {examTypeOptions.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 4. ภาคเรียน */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">ภาคเรียน</label>
              <select
                value={examSemesterFilter}
                onChange={(e) => setExamSemesterFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              >
                <option value="all">ทุกภาคเรียน</option>
                {semesterOptions.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 5. เรียงลำดับ */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <label className="block text-slate-500 font-bold mb-1">เรียงลำดับ</label>
              <select
                value={examSortBy}
                onChange={(e) => setExamSortBy(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              >
                <option value="latest">เพิ่มล่าสุด</option>
                <option value="views">ยอดเข้าชมสูงสุด</option>
                <option value="downloads">ดาวน์โหลดสูงสุด</option>
                <option value="title">ชื่อ ก-ฮ</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-medium">ตัวกรองที่เลือก:</span>
                {examGradeFilter !== 'all' && (
                  <span className="bg-blue-50 text-[#005BAC] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    ชั้น: {examGradeFilter}
                  </span>
                )}
                {examSubjectGroupFilter !== 'all' && (
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {examSubjectGroupFilter}
                  </span>
                )}
                {examTypeFilter !== 'all' && (
                  <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                    ประเภท: {examTypeFilter}
                  </span>
                )}
                {examSemesterFilter !== 'all' && (
                  <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {examSemesterFilter}
                  </span>
                )}
              </div>

              <button
                onClick={resetExamFilters}
                className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-700 font-bold hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างตัวกรองทั้งหมด ({activeFilterCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. EXAM CARD GRID */}
        {isLoading ? (
          /* Skeleton Loading */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 animate-pulse">
                <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="font-prompt text-xl font-extrabold text-slate-800">
              ยังไม่มีข้อสอบในหมวดนี้
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ไม่พบข้อสอบที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรองที่เลือกในขณะนี้ กรุณาลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง
            </p>
            <button
              onClick={resetExamFilters}
              className="px-5 py-2.5 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => handleOpenExam(exam)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-[#005BAC]/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Card Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {exam.coverImageUrl ? (
                    <img
                      src={exam.coverImageUrl}
                      alt={exam.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#003875] to-[#005BAC] flex items-center justify-center p-6 text-white text-center">
                      <div>
                        <BookOpen className="w-12 h-12 text-[#FFD54F] mx-auto mb-2 opacity-90" />
                        <span className="text-xs font-bold tracking-wide text-blue-100 uppercase">
                          {exam.subjectGroup}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                    <span className="bg-[#003875]/90 text-[#FFD54F] text-[11px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#FFD54F]/30 shadow-xs">
                      {exam.gradeLevel}
                    </span>

                    <span className="bg-white/90 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                      {exam.examType}
                    </span>
                  </div>

                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-xs">
                    <span className="inline-flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-sky-300" />
                      <span>{exam.viewCount || 0}</span>
                    </span>
                    {exam.downloadCount > 0 && (
                      <span className="inline-flex items-center space-x-1">
                        <Download className="w-3 h-3 text-emerald-300" />
                        <span>{exam.downloadCount}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#005BAC]">
                      <span>{exam.subjectGroup}</span>
                      <span>•</span>
                      <span>{exam.subject}</span>
                    </div>

                    <h3 className="font-prompt text-base font-bold text-slate-900 group-hover:text-[#005BAC] transition line-clamp-2 leading-snug">
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata & Actions */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="inline-flex items-center space-x-1 truncate max-w-[160px]">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{exam.creatorName || 'ฝ่ายวิชาการ'}</span>
                      </span>
                      <span className="shrink-0">
                        {exam.semester} {exam.academicYear ? `(${exam.academicYear})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenExam(exam);
                        }}
                        className="flex-1 py-2.5 px-4 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 group-hover:bg-[#004584]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิดข้อสอบ</span>
                      </button>

                      {isDownloadable(exam.examUrl) && (
                        <button
                          onClick={(e) => handleDownloadExam(e, exam)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-xs"
                          title="ดาวน์โหลดไฟล์"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
