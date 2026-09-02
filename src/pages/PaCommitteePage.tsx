import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher, PaCommitteeMember, PaEvaluationRecord } from '../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Video, 
  ExternalLink, 
  Search, 
  Filter, 
  UserCheck, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  ChevronLeft, 
  Eye, 
  Check, 
  Award, 
  X, 
  AlertCircle,
  HelpCircle,
  BarChart3, 
  TrendingUp, 
  RefreshCw,
  RotateCcw, 
  LogOut, 
  SlidersHorizontal, 
  ThumbsUp, 
  Send, 
  MessageSquare, 
  Maximize2, 
  Minimize2, 
  Tv, 
  BookOpen, 
  Split, 
  Download, 
  Share2, 
  CheckSquare,
  GraduationCap,
  Layers,
  LayoutGrid,
  Table,
  ListOrdered,
  Percent,
  PlayCircle,
  Star,
  Users,
  Folder,
  CheckCircle,
  XCircle,
  Volume2,
  Target,
  Key,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  getYouTubeId,
  getVideoEmbedUrl,
  isTeacherAssignedToCommittee,
  getTeacherAcademicCategory,
  STANDARD_ACADEMIC_CATEGORIES 
} from '../data/mockData';

const DOC_FEEDBACK_PRESETS = [
  'แผนการจัดการเรียนรู้สอดคล้องประเด็นท้าทายครบถ้วน',
  'มีการกำหนดเครื่องมือและเกณฑ์ประเมินผลชัดเจน',
  'เอกสารรายงาน PA 1/ส มีความสมบูรณ์เชิงประจักษ์',
  'ควรเพิ่มเติมร่องรอยชิ้นงานของผู้เรียนให้ชัดเจนยิ่งขึ้น'
];

const VIDEO_FEEDBACK_PRESETS = [
  'จัดการเรียนรู้เชิงรุก Active Learning ได้อย่างโดดเด่น',
  'ผู้เรียนมีส่วนร่วมและมีปฏิสัมพันธ์ในชั้นเรียนสูง',
  'ใช้สื่อนวัตกรรมเทคโนโลยีกระตุ้นความสนใจได้ดีเยี่ยม',
  'ควบคุมเวลาและสรุปบทเรียนได้ตามแผนการจัดการเรียนรู้'
];

const OVERALL_COMMENT_PRESETS = [
  'ผ่านเกณฑ์การประเมิน ว.PA ในระดับดีเด่น ขอชื่นชมในความมุ่งมั่น',
  'ผ่านเกณฑ์ข้อตกลงในการพัฒนางานตามมาตรฐานตำแหน่ง',
  'ผลงานมีความโดดเด่น สมควรนำเป็นแบบอย่างขยายผลให้เพื่อนครู',
  'ผ่านเกณฑ์ข้อตกลง PA ประจำปีการศึกษา 2569 เรียบร้อย'
];

const SCORE_PRESETS = [75, 80, 85, 90, 95, 100];

export const PaCommitteePage: React.FC = () => {
  const { 
    teachers, 
    paCommitteeMembers, 
    paEvaluations,
    currentCommitteeMember, 
    isCommitteeLoginOpen,
    setIsCommitteeLoginOpen,
    loginCommitteeMember, 
    logoutCommitteeMember,
    toggleTeacherDocChecked,
    toggleTeacherVideoChecked,
    savePaEvaluation,
    clearTeacherEvaluation,
    getTeacherEvaluations,
    getCommitteeProgress,
    setActiveTab
  } = useApp();

  // Login Gate State (when not authenticated)
  const [activeSetTab, setActiveSetTab] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<PaCommitteeMember | null>(null);
  const [selectedSeatOrder, setSelectedSeatOrder] = useState<number | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  // Dashboard Workspace Tab for the logged-in evaluator: 'queue' | 'completed' | 'all' | 'consensus'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'queue' | 'completed' | 'all' | 'consensus'>('queue');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [academicFilter, setAcademicFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Big Screen Evaluation Workbench Modal (ตรวจดูคลิป + เอกสารจอใหญ่)
  const [bigInspectTeacher, setBigInspectTeacher] = useState<Teacher | null>(null);
  const [inspectViewMode, setInspectViewMode] = useState<'split' | 'video' | 'doc'>('split');

  // Evaluation Form State inside Workbench / Modal
  const [evalDocFeedback, setEvalDocFeedback] = useState('');
  const [evalVideoFeedback, setEvalVideoFeedback] = useState('');
  const [evalOverallStatus, setEvalOverallStatus] = useState<'passed' | 'revision' | 'excellent' | 'pending'>('passed');
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalOverallComment, setEvalOverallComment] = useState('');
  const [isSavingEval, setIsSavingEval] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [clearingTeacherId, setClearingTeacherId] = useState<string | null>(null);
  const [clearSuccessToast, setClearSuccessToast] = useState<string | null>(null);
  const [isReloadingClear, setIsReloadingClear] = useState<boolean>(false);
  const [clearReloadMessage, setClearReloadMessage] = useState<string>('');

  // Quick evaluation modal for single teacher
  const [evalModalTeacher, setEvalModalTeacher] = useState<Teacher | null>(null);

  // List of academic standings in Thai educational system (Single Source of Truth)
  const academicStandings = [
    'ทั้งหมด',
    ...STANDARD_ACADEMIC_CATEGORIES
  ];

  // Helper for formatting Document Embed / View URL
  const getDocEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    if (url.toLowerCase().endsWith('.pdf') || url.includes('pdf')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!inputCode.trim()) {
      setLoginError('กรุณากรอกรหัสผ่านประจำตัวกรรมการ');
      return;
    }
    const res = loginCommitteeMember(inputCode, activeSetTab);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginSuccessMessage(res.message);
      setInputCode('');
      setTimeout(() => setLoginSuccessMessage(''), 2500);
    }
  };

  // Select Seat helper
  const handleSelectSeat = (member: PaCommitteeMember) => {
    setSelectedMember(member);
    setSelectedSeatOrder(member.order);
    setLoginError('');
  };

  // Open Big Screen Evaluation Workbench
  const handleOpenBigInspect = (teacher: Teacher, mode: 'split' | 'video' | 'doc' = 'split') => {
    setInspectViewMode(mode);
    setBigInspectTeacher(teacher);
    setSaveSuccessNotice(false);

    if (currentCommitteeMember) {
      const existing = paEvaluations.find(
        e => e.teacherId === teacher.id && e.committeeId === currentCommitteeMember.id
      );
      setEvalDocFeedback(existing?.docFeedback || '');
      setEvalVideoFeedback(existing?.videoFeedback || '');
      setEvalOverallStatus(existing?.overallStatus || 'passed');
      setEvalScore(existing?.overallScore || 85);
      setEvalOverallComment(existing?.overallComment || '');
    }
  };

  // Switch to next or previous teacher inside Big Screen modal
  const handleNavigateTeacher = (direction: 'prev' | 'next') => {
    if (!bigInspectTeacher) return;
    const currentList = filteredTeachers;
    const currentIndex = currentList.findIndex(t => t.id === bigInspectTeacher.id);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0) targetIndex = currentList.length - 1;
    if (targetIndex >= currentList.length) targetIndex = 0;

    const nextTeacher = currentList[targetIndex];
    handleOpenBigInspect(nextTeacher, inspectViewMode);
  };

  // Save Evaluation directly inside Big Screen Workbench
  const handleSaveEvaluationInBigModal = async () => {
    if (!currentCommitteeMember || !bigInspectTeacher) return;
    setIsSavingEval(true);

    const existing = paEvaluations.find(
      e => e.teacherId === bigInspectTeacher.id && e.committeeId === currentCommitteeMember.id
    );

    const now = new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    await savePaEvaluation({
      teacherId: bigInspectTeacher.id,
      teacherName: bigInspectTeacher.name,
      committeeId: currentCommitteeMember.id,
      committeeName: currentCommitteeMember.name,
      committeeRole: currentCommitteeMember.role,
      docChecked: existing?.docChecked ?? true,
      docCheckedAt: existing?.docCheckedAt || now,
      docFeedback: evalDocFeedback,
      videoChecked: existing?.videoChecked ?? true,
      videoCheckedAt: existing?.videoCheckedAt || now,
      videoFeedback: evalVideoFeedback,
      overallStatus: evalOverallStatus,
      overallScore: evalScore,
      overallComment: evalOverallComment,
    });

    setIsSavingEval(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Save & Next Teacher in Big Screen Workbench (Batch Reviewing)
  const handleSaveAndNextInBigModal = async () => {
    await handleSaveEvaluationInBigModal();
    // Navigate to next unreviewed teacher if possible
    if (!bigInspectTeacher) return;
    const currentList = filteredTeachers;
    const currentIndex = currentList.findIndex(t => t.id === bigInspectTeacher.id);
    if (currentIndex !== -1 && currentIndex + 1 < currentList.length) {
      const nextTeacher = currentList[currentIndex + 1];
      setTimeout(() => {
        handleOpenBigInspect(nextTeacher, inspectViewMode);
      }, 400);
    }
  };

  // Quick 1-Click Approve Both (Doc + Video + Score 88)
  const handleQuickApproveBoth = async (teacher: Teacher) => {
    if (!currentCommitteeMember) return;
    const existing = paEvaluations.find(
      e => e.teacherId === teacher.id && e.committeeId === currentCommitteeMember.id
    );

    const now = new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    await savePaEvaluation({
      teacherId: teacher.id,
      teacherName: teacher.name,
      committeeId: currentCommitteeMember.id,
      committeeName: currentCommitteeMember.name,
      committeeRole: currentCommitteeMember.role,
      docChecked: true,
      docCheckedAt: existing?.docCheckedAt || now,
      docFeedback: existing?.docFeedback || 'แผนการจัดการเรียนรู้และเอกสารรายงาน PA 1/ส ถูกต้องครบถ้วน',
      videoChecked: true,
      videoCheckedAt: existing?.videoCheckedAt || now,
      videoFeedback: existing?.videoFeedback || 'การจัดกิจกรรมการเรียนรู้แบบ Active Learning มีความเหมาะสม',
      overallStatus: existing?.overallStatus || 'passed',
      overallScore: existing?.overallScore || 88,
      overallComment: existing?.overallComment || 'ผ่านเกณฑ์ข้อตกลงในการพัฒนางาน (ว.PA) ประจำปีการศึกษา 2569',
    });
  };

  // Clear / Reset evaluation for a teacher by active committee member
  const handleClearTeacherEvaluation = async (teacher: Teacher) => {
    if (!currentCommitteeMember) return;

    setClearingTeacherId(teacher.id);
    setIsReloadingClear(true);
    setClearReloadMessage(`กำลังล้างคะแนนและผลการตรวจของ "${teacher.name}"...`);

    try {
      await clearTeacherEvaluation(teacher.id, currentCommitteeMember.id);
      
      // Smooth visual feedback delay for reload feeling
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Reset big inspect modal state if open
      if (bigInspectTeacher?.id === teacher.id) {
        setEvalDocFeedback('');
        setEvalVideoFeedback('');
        setEvalOverallStatus('passed');
        setEvalScore(85);
        setEvalOverallComment('');
        setSaveSuccessNotice(false);
      }
      
      // Reset quick modal state if open
      if (evalModalTeacher?.id === teacher.id) {
        setEvalModalTeacher(null);
      }

      setClearSuccessToast(`✓ ล้างคะแนนและผลการตรวจของ "${teacher.name}" เรียบร้อยแล้ว (สถานะกลับเป็นรอตรวจ)`);
      setTimeout(() => setClearSuccessToast(null), 4000);
    } catch (err) {
      console.error('Error clearing evaluation:', err);
    } finally {
      setIsReloadingClear(false);
      setClearingTeacherId(null);
    }
  };

  // Clear all evaluations completed by current committee member in this set
  const handleClearAllMyEvaluations = async () => {
    if (!currentCommitteeMember) return;
    
    const assignedTeachers = teachers.filter(t => isTeacherAssignedToCommittee(t, currentCommitteeMember));
    const myEvalsCount = paEvaluations.filter(e => e.committeeId === currentCommitteeMember.id).length;

    if (myEvalsCount === 0) {
      alert('ท่านยังไม่มีคะแนนหรือผลการตรวจที่บันทึกไว้ในระบบ');
      return;
    }

    if (!window.confirm(`⚠️ ยืนยันการล้างคะแนนและผลการตรวจของครูทั้งหมด (${myEvalsCount} รายการ) ที่ท่านได้ตรวจไว้?\n\nเมื่อยืนยัน ระบบจะรีเซ็ตสถานะของครูทุกคนในชุดของท่านกลับเป็น "รอตรวจ" ทั้งหมด`)) {
      return;
    }

    setIsReloadingClear(true);
    setClearReloadMessage(`กำลังล้างผลการตรวจทั้งหมดของท่าน (${myEvalsCount} รายการ) และรีโหลดระบบ...`);

    try {
      for (const t of assignedTeachers) {
        await clearTeacherEvaluation(t.id, currentCommitteeMember.id);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setBigInspectTeacher(null);
      setEvalModalTeacher(null);
      setClearSuccessToast(`✓ ล้างคะแนนและผลการตรวจทั้งหมดของท่านเรียบร้อยแล้ว (${myEvalsCount} รายการ)`);
      setTimeout(() => setClearSuccessToast(null), 4000);
    } catch (err) {
      console.error('Error clearing all my evaluations:', err);
    } finally {
      setIsReloadingClear(false);
    }
  };

  // Open Full Evaluation modal
  const handleOpenEvalModal = (teacher: Teacher) => {
    if (!currentCommitteeMember) return;
    const existing = paEvaluations.find(
      e => e.teacherId === teacher.id && e.committeeId === currentCommitteeMember.id
    );
    setEvalDocFeedback(existing?.docFeedback || '');
    setEvalVideoFeedback(existing?.videoFeedback || '');
    setEvalOverallStatus(existing?.overallStatus || 'passed');
    setEvalScore(existing?.overallScore || 85);
    setEvalOverallComment(existing?.overallComment || '');
    setEvalModalTeacher(teacher);
  };

  // Save Full Evaluation from quick modal
  const handleSaveEvaluationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommitteeMember || !evalModalTeacher) return;
    setIsSavingEval(true);

    const existing = paEvaluations.find(
      e => e.teacherId === evalModalTeacher.id && e.committeeId === currentCommitteeMember.id
    );

    const now = new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    await savePaEvaluation({
      teacherId: evalModalTeacher.id,
      teacherName: evalModalTeacher.name,
      committeeId: currentCommitteeMember.id,
      committeeName: currentCommitteeMember.name,
      committeeRole: currentCommitteeMember.role,
      docChecked: true,
      docCheckedAt: existing?.docCheckedAt || now,
      docFeedback: evalDocFeedback || 'แผนการจัดการเรียนรู้สอดคล้องประเด็นท้าทายครบถ้วน',
      videoChecked: true,
      videoCheckedAt: existing?.videoCheckedAt || now,
      videoFeedback: evalVideoFeedback || 'จัดการเรียนรู้เชิงรุก Active Learning ได้อย่างโดดเด่น',
      overallStatus: evalOverallStatus,
      overallScore: evalScore,
      overallComment: evalOverallComment || 'ผ่านเกณฑ์การประเมิน ว.PA ในระดับดีเด่น',
    });

    setIsSavingEval(false);
    setEvalModalTeacher(null);
  };

  // Personal Progress Stats for the ACTIVE committee member
  const myProgress = useMemo(() => {
    if (!currentCommitteeMember) {
      return { totalTeachers: 0, docCheckedCount: 0, videoCheckedCount: 0, fullyCheckedCount: 0, percentage: 0 };
    }
    return getCommitteeProgress(currentCommitteeMember.id);
  }, [currentCommitteeMember, teachers, paEvaluations, getCommitteeProgress]);

  // Scores given by the active committee member
  const myScoreStats = useMemo(() => {
    if (!currentCommitteeMember) {
      return { average: 85, excellentCount: 0, passCount: 0, revisionCount: 0 };
    }
    const myEvals = paEvaluations.filter(e => e.committeeId === currentCommitteeMember.id && e.overallScore !== undefined);
    if (myEvals.length === 0) {
      return { average: 85, excellentCount: 0, passCount: 0, revisionCount: 0 };
    }
    const sum = myEvals.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    const avg = Math.round((sum / myEvals.length) * 10) / 10;
    const excellent = myEvals.filter(e => (e.overallScore || 0) >= 90).length;
    const pass = myEvals.filter(e => (e.overallScore || 0) >= 70 && (e.overallScore || 0) < 90).length;
    const revision = myEvals.filter(e => (e.overallScore || 0) < 70).length;
    return { average: avg, excellentCount: excellent, passCount: pass, revisionCount: revision };
  }, [currentCommitteeMember, paEvaluations]);

  // Overall 3-Committee Consensus Stats (used in consensus matrix tab)
  const consensusStats = useMemo(() => {
    const relevantTeachers = currentCommitteeMember
      ? teachers.filter(t => isTeacherAssignedToCommittee(t, currentCommitteeMember))
      : [];
    const total = relevantTeachers.length;
    let fullConsensusCount = 0;
    let partial2Count = 0;
    let partial1Count = 0;
    let zeroCount = 0;

    relevantTeachers.forEach(t => {
      const assignedMembers = paCommitteeMembers.filter(m => isTeacherAssignedToCommittee(t, m));
      const evals = paEvaluations.filter(e => e.teacherId === t.id);
      const fullyApprovedMembers = assignedMembers.filter(m => {
        const rec = evals.find(e => e.committeeId === m.id);
        return rec && rec.docChecked && rec.videoChecked;
      }).length;

      if (assignedMembers.length > 0 && fullyApprovedMembers === assignedMembers.length) fullConsensusCount++;
      else if (fullyApprovedMembers === 2) partial2Count++;
      else if (fullyApprovedMembers === 1) partial1Count++;
      else zeroCount++;
    });

    return {
      total,
      fullConsensusCount,
      partial2Count,
      partial1Count,
      zeroCount,
      fullPercentage: total > 0 ? Math.round((fullConsensusCount / total) * 100) : 0,
    };
  }, [teachers, paEvaluations, paCommitteeMembers, currentCommitteeMember]);

  // Filtered teachers list based on active tab and search
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // 0. Strict Set Assignment Filter: Committee member ONLY sees teachers in their assigned set
      if (currentCommitteeMember && !isTeacherAssignedToCommittee(teacher, currentCommitteeMember)) {
        return false;
      }

      // 1. Text Search
      const matchesSearch = 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.academicStanding?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.position && teacher.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.subjectName && teacher.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.paChallengeTitle && teacher.paChallengeTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Academic Standing Filter (Exact Match via Single Source of Truth)
      if (academicFilter !== 'all') {
        const cat = getTeacherAcademicCategory(teacher);
        if (cat !== academicFilter) return false;
      }

      // 3. Subject Filter
      if (selectedSubjectFilter !== 'all' && teacher.subjectName !== selectedSubjectFilter) {
        return false;
      }

      // 4. Workspace Tab Filter for current evaluator
      if (currentCommitteeMember) {
        const evalRec = paEvaluations.find(
          e => e.teacherId === teacher.id && e.committeeId === currentCommitteeMember.id
        );
        const isFullyCheckedByMe = Boolean(evalRec?.docChecked && evalRec?.videoChecked);

        if (activeWorkspaceTab === 'queue' && isFullyCheckedByMe) {
          return false; // Show only pending
        }
        if (activeWorkspaceTab === 'completed' && !isFullyCheckedByMe) {
          return false; // Show only completed
        }
      }

      return true;
    });
  }, [teachers, searchQuery, academicFilter, selectedSubjectFilter, activeWorkspaceTab, currentCommitteeMember, paEvaluations]);

  // Group filtered teachers by academic standing via Single Source of Truth
  const groupedTeachersByStanding = useMemo(() => {
    const map = new Map<string, Teacher[]>();
    STANDARD_ACADEMIC_CATEGORIES.forEach(key => {
      map.set(key, []);
    });

    filteredTeachers.forEach(t => {
      const standing = getTeacherAcademicCategory(t);
      if (!map.has(standing)) {
        map.set(standing, []);
      }
      map.get(standing)!.push(t);
    });

    const result: { standing: string; teachers: Teacher[] }[] = [];
    map.forEach((tList, standing) => {
      if (tList.length > 0) {
        result.push({ standing, teachers: tList });
      }
    });
    return result;
  }, [filteredTeachers]);

  // Find first pending teacher for Quick Auto-Review Flow
  const handleStartAutoReview = () => {
    if (!currentCommitteeMember) return;
    const assignedTeachers = teachers.filter(t => isTeacherAssignedToCommittee(t, currentCommitteeMember));
    const pendingTeacher = assignedTeachers.find(t => {
      const e = paEvaluations.find(rec => rec.teacherId === t.id && rec.committeeId === currentCommitteeMember.id);
      return !e || !e.docChecked || !e.videoChecked;
    });
    if (pendingTeacher) {
      handleOpenBigInspect(pendingTeacher, 'split');
    } else if (assignedTeachers.length > 0) {
      handleOpenBigInspect(assignedTeachers[0], 'split');
    }
  };

  // =========================================================================
  // 1. AUTHENTICATION GATE (When NO committee member is logged in)
  // =========================================================================
  if (!currentCommitteeMember) {
    return (
      <div className="min-h-screen bg-slate-900/95 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full relative z-10 space-y-8">
          
          {/* Header & Emblem */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl mb-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            
            <div className="inline-block">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                ระบบประเมินข้อตกลงพัฒนางาน (ว.PA) • ปีงบประมาณ 2569
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-prompt text-white tracking-tight">
              ห้องตรวจประเมินสำหรับคณะกรรมการ
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              โรงเรียนวัดบางโฉลงใน • ระบบแยกแดชบอร์ดเฉพาะบุคคลตามระเบียบ ก.ค.ศ. กรุณาเลือกลำดับกรรมการของท่านและกรอกรหัสผ่านลับเพื่อเข้าสู่ห้องตรวจ
            </p>
          </div>

          {/* 3 Sets Selection Tabs */}
          <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-3 border border-slate-700 max-w-2xl mx-auto space-y-2">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300">
                เลือกชุดคณะกรรมการผู้ประเมินตามคำสั่งโรงเรียน
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { 
                  num: 1, 
                  label: 'ชุดที่ 1', 
                  desc: 'ครูชำนาญการ / ชำนาญการพิเศษ',
                  badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                },
                { 
                  num: 2, 
                  label: 'ชุดที่ 2', 
                  desc: 'ครู / ครูผู้ช่วย',
                  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                },
                { 
                  num: 3, 
                  label: 'ชุดที่ 3', 
                  desc: 'ครูอัตราจ้าง / บุคลากร',
                  badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                },
                { 
                  num: 4, 
                  label: 'ชุดที่ 4', 
                  desc: 'รองผู้อำนวยการ (2 ท่าน)',
                  badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }
              ].map(tab => (
                <button
                  key={tab.num}
                  type="button"
                  onClick={() => {
                    setActiveSetTab(tab.num);
                    setSelectedMember(null);
                    setSelectedSeatOrder(null);
                    setLoginError('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    activeSetTab === tab.num
                      ? 'bg-slate-700/90 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400/40'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-prompt text-white">
                      {tab.label}
                    </span>
                    {activeSetTab === tab.num && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 leading-snug truncate">
                    {tab.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Set Target Information Banner */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-4 max-w-2xl mx-auto flex items-start space-x-3 text-xs">
            <Target className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">
                {activeSetTab === 1 && 'คณะกรรมการชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ'}
                {activeSetTab === 2 && 'คณะกรรมการชุดที่ 2: ประเมินครู และครูผู้ช่วย'}
                {activeSetTab === 3 && 'คณะกรรมการชุดที่ 3: ประเมินครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ'}
                {activeSetTab === 4 && 'คณะกรรมการชุดที่ 4: ประเมินรองผู้อำนวยการสถานศึกษา'}
              </h4>
              <p className="text-slate-300 text-xs mt-1">
                {activeSetTab === 1 && '🎯 ประเมินเฉพาะ: วิทยฐานะ ครูชำนาญการ และ ครูชำนาญการพิเศษ (ไม่รวมรองผู้อำนวยการ)'}
                {activeSetTab === 2 && '🎯 ประเมินเฉพาะ: วิทยฐานะ ครู และ ครูผู้ช่วย'}
                {activeSetTab === 3 && '🎯 ประเมินเฉพาะ: ตำแหน่ง ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง และเจ้าหน้าที่ธุรการ'}
                {activeSetTab === 4 && '🎯 ประเมินเฉพาะ: ตำแหน่ง รองผู้อำนวยการสถานศึกษา (2 ท่าน: นางสาวอำพา ยะไม และ นางสาวศรีจันทร์ สามงามพุ่ม)'}
              </p>
            </div>
          </div>

          {/* 3 Committee Seats Cards Grid for Selected Set */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paCommitteeMembers
              .filter(m => (m.setNumber || 1) === activeSetTab)
              .map((member) => {
                const isSelected = selectedMember?.id === member.id || selectedSeatOrder === member.order;
                return (
                  <div 
                    key={member.id}
                    onClick={() => handleSelectSeat(member)}
                    className={`bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 border transition duration-200 cursor-pointer text-left flex flex-col justify-between group relative overflow-hidden ${
                      isSelected 
                        ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-slate-800 shadow-xl' 
                        : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-300/20 px-2.5 py-0.5 rounded-full">
                          ท่านที่ {member.order}: {member.role.split('(')[0].trim()}
                        </span>
                        <Lock className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      </div>

                      <div className="flex items-center space-x-3 pt-1">
                        <img 
                          src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'} 
                          alt={member.name}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0" 
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition truncate">
                            {member.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        ชุดที่ {member.setNumber || activeSetTab} • ท่านที่ <strong className="text-slate-300">{member.order}</strong>
                      </span>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-400' : 'text-blue-400 group-hover:underline'}`}>
                        {isSelected ? '✓ เลือกแล้ว' : 'เลือกลำดับนี้'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Secure PIN / Code Input Card */}
          <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl max-w-lg mx-auto space-y-5">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-white flex items-center justify-center space-x-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>กรอกรหัสผ่านประจำตัวกรรมการ</span>
              </h3>
              <p className="text-xs text-slate-400">
                {selectedMember 
                  ? `ท่านเลือกลำดับ: ${selectedMember.name} (กรรมการท่านที่ ${selectedMember.order} ชุดที่ ${activeSetTab})` 
                  : `กรุณาเลือกลำดับกรรมการชุดที่ ${activeSetTab} แล้วกรอกรหัสผ่าน`}
              </p>
            </div>

            {loginError && (
              <div className="bg-rose-500/20 border border-rose-400/30 text-rose-200 p-3 rounded-2xl text-xs flex items-center space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccessMessage && (
              <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 p-3 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{loginSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="พิมพ์รหัสผ่านประจำตัวกรรมการ..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition text-center"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-3.5 rounded-2xl text-sm transition shadow-lg flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>เข้าสู่แดชบอร์ดประเมิน PA ส่วนบุคคล</span>
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition underline"
              >
                ← กลับสู่หน้าหลักโรงเรียน
              </button>
            </div>
          </div>

        </div>

        <div className="text-center text-[11px] text-slate-500 pt-6">
          โรงเรียนวัดบางโฉลงใน • สพป.สมุทรปราการ เขต 2 • ระบบประเมินวิทยฐานะและข้อตกลง ว.PA ดิจิทัล
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PERSONAL EVALUATOR WORKSPACE (When authenticated as a committee member)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      
      {/* Executive Hero Banner - Dedicated for Active Committee Member */}
      <section className="relative bg-gradient-to-r from-[#002752] via-[#004B8F] to-[#0A74DA] text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 shadow-lg overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none p-6">
          <Award className="w-[450px] h-[450px] text-white" />
        </div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title & Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>กรรมการชุดที่ {currentCommitteeMember.setNumber || 1} • ท่านที่ {currentCommitteeMember.order}</span>
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
                  {currentCommitteeMember.setName || 'ชุดประเมิน'}
                </span>
                <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
                  รอบปีงบประมาณ 2569
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-prompt text-white">
                ห้องตรวจและบันทึกคะแนน ว.PA
              </h1>
              
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 max-w-2xl text-xs text-blue-100 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-300">
                  <Target className="w-4 h-4" />
                  <span>ขอบเขตกลุ่มเป้าหมายที่ท่านประเมิน:</span>
                </div>
                <p className="leading-relaxed text-slate-200">
                  {currentCommitteeMember.targetDescription || 'บุคลากรที่ได้รับมอบหมายตามคำสั่งโรงเรียนวัดบางโฉลงใน'}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={handleStartAutoReview}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 transform active:scale-95"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>🚀 เริ่มตรวจคิวถัดไปอัตโนมัติ (Auto Next Review)</span>
                </button>

                <button
                  onClick={() => setActiveTab('pa')}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 backdrop-blur-xs border border-white/20"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>ดูหน้าข้อตกลง PA รวม (Public View)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAllMyEvaluations}
                  className="bg-rose-500/20 hover:bg-rose-500/35 text-rose-100 border border-rose-400/40 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 backdrop-blur-xs"
                  title="ล้างคะแนนและผลการตรวจทั้งหมดของท่านในชุดนี้"
                >
                  <RotateCcw className="w-4 h-4 text-rose-300" />
                  <span>ล้างคะแนนทั้งหมดของฉัน</span>
                </button>
              </div>
            </div>

            {/* Current Evaluator Profile & Logout Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl max-w-md w-full">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> กรรมการท่านที่ {currentCommitteeMember.order} (กำลังปฏิบัติหน้าที่)
                  </span>
                  <button
                    onClick={logoutCommitteeMember}
                    className="text-xs text-rose-200 hover:text-white flex items-center bg-rose-500/20 hover:bg-rose-500/40 px-2.5 py-1 rounded-xl transition font-medium border border-rose-400/30"
                    title="ออกจากระบบกรรมการ"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" /> ออกจากระบบ
                  </button>
                </div>

                <div className="flex items-center space-x-3.5">
                  <img 
                    src={currentCommitteeMember.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'} 
                    alt={currentCommitteeMember.name} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-white truncate">
                      {currentCommitteeMember.name}
                    </h3>
                    <p className="text-xs text-blue-100 truncate mt-0.5">
                      {currentCommitteeMember.role}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                        รหัส: {currentCommitteeMember.code}
                      </span>
                      <span className="bg-blue-500/30 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        ตรวจแล้ว {myProgress.fullyCheckedCount}/{myProgress.totalTeachers} ({myProgress.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Bento KPI Counters - Specific to Current Evaluator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: My Personal Velocity */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ความก้าวหน้าของท่าน</span>
                <span className="p-2 bg-blue-50 text-[#005BAC] rounded-xl">
                  <Percent className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{myProgress.percentage}%</span>
                <span className="text-xs font-bold text-slate-500">({myProgress.fullyCheckedCount}/{myProgress.totalTeachers} ท่าน)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ตรวจรับรองครบทั้งเอกสารและคลิป
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">เอกสาร: <strong>{myProgress.docCheckedCount}</strong></span>
              <span className="text-slate-500 font-medium">คลิป: <strong>{myProgress.videoCheckedCount}</strong></span>
            </div>
          </div>

          {/* Card 2: My Pending Queue */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">คิวรอการตรวจของท่าน</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-amber-700">{myProgress.totalTeachers - myProgress.fullyCheckedCount}</span>
                <span className="text-xs font-bold text-slate-500">ท่านที่เหลือ</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                รายชื่อที่ยังรอการตรวจจากท่าน
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">สถานะคิว:</span>
              <span className="font-bold text-amber-600">
                {myProgress.totalTeachers - myProgress.fullyCheckedCount > 0 ? 'กำลังดำเนินการตรวจ' : 'ตรวจครบถ้วนแล้ว'}
              </span>
            </div>
          </div>

          {/* Card 3: Average Score Given by Current Evaluator */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">คะแนนเฉลี่ยที่ท่านให้</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Star className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-emerald-700">{myScoreStats.average}</span>
                <span className="text-xs font-bold text-slate-500">/ 100 คะแนน</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  ดีเด่น: {myScoreStats.excellentCount}
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  ผ่าน: {myScoreStats.passCount}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">เกณฑ์ขั้นต่ำ:</span>
              <span className="font-bold text-slate-700">70.0 คะแนน</span>
            </div>
          </div>

          {/* Card 4: School-Wide 3-Member Consensus */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ฉันทามติครบ 3 ท่าน</span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-purple-900">{consensusStats.fullConsensusCount}</span>
                <span className="text-xs font-bold text-slate-500">/ {consensusStats.total} ({consensusStats.fullPercentage}%)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ครูที่ผ่านการตรวจครบ 3/3 กรรมการ
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">รอฉันทามติ:</span>
              <span className="font-bold text-purple-700">{consensusStats.total - consensusStats.fullConsensusCount} ท่าน</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Evaluator Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {clearSuccessToast && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{clearSuccessToast}</span>
            </div>
            <button onClick={() => setClearSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workspace Tab Switcher */}
        <div className="bg-white rounded-3xl p-2.5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            <button
              onClick={() => setActiveWorkspaceTab('queue')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeWorkspaceTab === 'queue'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>คิวรอตรวจของฉัน ({myProgress.totalTeachers - myProgress.fullyCheckedCount})</span>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('completed')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeWorkspaceTab === 'completed'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ตรวจเสร็จแล้วของฉัน ({myProgress.fullyCheckedCount})</span>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('all')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeWorkspaceTab === 'all'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>รายชื่อครูทั้งหมด ({teachers.length})</span>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('consensus')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeWorkspaceTab === 'consensus'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Table className="w-4 h-4 text-purple-400" />
              <span>ตารางฉันทามติ 3 กรรมการ</span>
            </button>

          </div>

          <div className="flex items-center space-x-2 px-2">
            <span className="text-xs text-slate-500 font-medium">
              แสดง {filteredTeachers.length} ท่าน
            </span>
          </div>
        </div>

        {/* Search & Filter Bar (For teacher lists) */}
        {activeWorkspaceTab !== 'consensus' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="ค้นหาชื่อคุณครู, วิทยฐานะ, ประเด็นท้าทาย, กลุ่มสาระฯ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-sm border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={academicFilter}
                onChange={(e) => setAcademicFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              >
                <option value="all">ทุกวิทยฐานะ</option>
                {academicStandings.filter(s => s !== 'ทั้งหมด').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 1: CARDS / QUEUE LIST FOR THIS EVALUATOR                          */}
        {/* ===================================================================== */}
        {activeWorkspaceTab !== 'consensus' && (
          <div className="space-y-8">
            {filteredTeachers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-prompt">
                  {activeWorkspaceTab === 'queue' ? 'ยอดเยี่ยม! ท่านได้ตรวจครบทุกรายชื่อในคิวแล้ว' : 'ไม่พบรายชื่อครูตามเงื่อนไขที่ค้นหา'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {activeWorkspaceTab === 'queue' 
                    ? 'ไม่มีคุณครูที่รอการตรวจจากท่านในขณะนี้ ท่านสามารถคลิกดูผลงานที่ตรวจเสร็จแล้วหรือสลับไปดูตารางฉันทามติได้'
                    : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองวิทยฐานะ'}
                </p>
              </div>
            ) : (
              groupedTeachersByStanding.map(({ standing, teachers: tList }) => (
                <div key={standing} className="space-y-4">
                  
                  {/* Academic Standing Section Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-[#005BAC]" />
                      <h3 className="font-bold text-base text-slate-900 font-prompt">
                        วิทยฐานะ: {standing}
                      </h3>
                      <span className="bg-blue-100 text-[#005BAC] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                        {tList.length} ท่าน
                      </span>
                    </div>
                  </div>

                  {/* Teacher Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tList.map((teacher) => {
                      const evalRec = paEvaluations.find(
                        e => e.teacherId === teacher.id && e.committeeId === currentCommitteeMember.id
                      );
                      const docOk = evalRec?.docChecked ?? false;
                      const vidOk = evalRec?.videoChecked ?? false;
                      const isComplete = docOk && vidOk;

                      return (
                        <div 
                          key={teacher.id}
                          className={`bg-white rounded-3xl border transition duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group ${
                            isComplete 
                              ? 'border-emerald-300 ring-1 ring-emerald-300/40 bg-emerald-50/10' 
                              : (docOk || vidOk)
                              ? 'border-amber-300' 
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {/* Card Top & Profile */}
                          <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={teacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'} 
                                  alt={teacher.name}
                                  className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0" 
                                />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-[#005BAC] bg-blue-50 px-2 py-0.5 rounded-md">
                                    {teacher.academicStanding || teacher.position || 'ครู'}
                                  </span>
                                  <h4 className="font-bold text-sm text-slate-900 leading-tight mt-1 truncate">
                                    {teacher.name}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {teacher.subjectName || 'กลุ่มสาระการเรียนรู้'}
                                  </p>
                                </div>
                              </div>

                              {isComplete ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shrink-0">
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> ตรวจครบแล้ว
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shrink-0">
                                  <Clock className="w-3 h-3 mr-1 text-amber-600" /> รอท่านตรวจ
                                </span>
                              )}
                            </div>

                            {/* Challenge Title */}
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                ประเด็นท้าทาย PA 2569:
                              </span>
                              <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                                {teacher.paChallengeTitle || 'ยังไม่ระบุชื่อประเด็นท้าทาย'}
                              </p>
                            </div>

                            {/* Inspection Controls for THIS evaluator */}
                            <div className="space-y-2 pt-1 border-t border-slate-100">
                              
                              {/* 1. Document Toggle */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                                <div className="flex items-center space-x-2 truncate">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-bold text-slate-700">1. เอกสารรายงาน PA</span>
                                </div>
                                
                                <div className="flex items-center space-x-1.5">
                                  {teacher.paDocumentUrl && (
                                    <a
                                      href={teacher.paDocumentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-slate-400 hover:text-blue-600"
                                      title="เปิดเอกสารฉบับเต็ม"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => toggleTeacherDocChecked(teacher.id, currentCommitteeMember)}
                                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center space-x-1 ${
                                      docOk 
                                        ? 'bg-emerald-600 text-white shadow-xs' 
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {docOk ? <Check className="w-3 h-3" /> : null}
                                    <span>{docOk ? 'ตรวจแล้ว' : 'กดตรวจ'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* 2. Video Toggle */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                                <div className="flex items-center space-x-2 truncate">
                                  <Video className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="font-bold text-slate-700">2. คลิปบันทึกการสอน</span>
                                </div>
                                
                                <div className="flex items-center space-x-1.5">
                                  {teacher.paVideoUrl && (
                                    <a
                                      href={teacher.paVideoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-slate-400 hover:text-amber-600"
                                      title="เปิดดูคลิปใน YouTube / Drive"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => toggleTeacherVideoChecked(teacher.id, currentCommitteeMember)}
                                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center space-x-1 ${
                                      vidOk 
                                        ? 'bg-emerald-600 text-white shadow-xs' 
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {vidOk ? <Check className="w-3 h-3" /> : null}
                                    <span>{vidOk ? 'ตรวจแล้ว' : 'กดตรวจ'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* 3. Folder Link */}
                              {teacher.paFolderUrl && (
                                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs">
                                  <div className="flex items-center space-x-2 truncate">
                                    <Folder className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span className="font-bold text-amber-900">3. โฟลเดอร์รวมไฟล์</span>
                                  </div>
                                  
                                  <a
                                    href={teacher.paFolderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition flex items-center space-x-1 shadow-xs"
                                    title="เปิดโฟลเดอร์ Google Drive รวมไฟล์เอกสารทั้งหมด"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>เปิดดูโฟลเดอร์</span>
                                  </a>
                                </div>
                              )}

                              {/* 1-Click Fast Approve Option if not yet complete */}
                              {(!docOk || !vidOk) && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApproveBoth(teacher)}
                                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold transition flex items-center justify-center space-x-1.5"
                                  title="ตรวจผ่านเอกสารและคลิปทันที (ให้คะแนน 88 คะแนน)"
                                >
                                  <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                                  <span>⚡ ตรวจผ่านด่วน 2 รายการทันที (1-Click)</span>
                                </button>
                              )}

                              {/* Score & Feedback snapshot */}
                              {evalRec?.overallScore ? (
                                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-blue-50/70 rounded-xl text-slate-700 border border-blue-100">
                                  <span className="font-medium">คะแนนที่ท่านให้:</span>
                                  <span className="font-black text-[#005BAC]">{evalRec.overallScore} / 100 ({evalRec.overallStatus === 'excellent' ? 'ดีเด่น' : 'ผ่าน'})</span>
                                </div>
                              ) : null}

                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => handleOpenBigInspect(teacher, 'split')}
                              className="flex-1 bg-[#005BAC] hover:bg-[#004584] text-white font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                            >
                              <Tv className="w-3.5 h-3.5" />
                              <span>ตรวจจอใหญ่ (Split View)</span>
                            </button>

                            <button
                              onClick={() => handleOpenEvalModal(teacher)}
                              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center space-x-1 shadow-2xs"
                              title="ให้คะแนนและพิมพ์ข้อเสนอแนะ"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500" />
                              <span>{evalRec?.overallScore ? 'แก้ไขคะแนน' : 'ให้คะแนน'}</span>
                            </button>

                            {(evalRec && (evalRec.overallScore !== undefined || evalRec.docChecked || evalRec.videoChecked || (evalRec.overallStatus && evalRec.overallStatus !== 'pending') || evalRec.overallComment)) && (
                              <button
                                type="button"
                                disabled={clearingTeacherId === teacher.id}
                                onClick={(e) => { e.stopPropagation(); handleClearTeacherEvaluation(teacher); }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2 px-2.5 rounded-xl transition flex items-center space-x-1 shadow-2xs"
                                title="ล้างคะแนนและผลการตรวจของครูท่านนี้"
                              >
                                <RotateCcw className={`w-3.5 h-3.5 text-rose-500 ${clearingTeacherId === teacher.id ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">ล้างคะแนน</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: 3-COMMITTEE CONSENSUS MATRIX TABLE VIEW                        */}
        {/* ===================================================================== */}
        {activeWorkspaceTab === 'consensus' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  ตารางสรุปผลการประเมินฉันทามติ 3 กรรมการ
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-prompt mt-2">
                  การเปรียบเทียบผลการตรวจและคะแนนของกรรมการทั้ง 3 ท่าน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ใช้สำหรับสรุปผลการประเมินวิทยฐานะและข้อตกลง ว.PA ในการประชุมคณะกรรมการโรงเรียน
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-300">
                  ผ่านครบ 3 ท่าน: {consensusStats.fullConsensusCount} / {consensusStats.total}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">ลำดับ</th>
                    <th className="py-3.5 px-4">คุณครูผู้รับการประเมิน</th>
                    <th className="py-3.5 px-4">วิทยฐานะ</th>
                    <th className="py-3.5 px-4 text-center">กรรมการ 1 (ผอ.)</th>
                    <th className="py-3.5 px-4 text-center">กรรมการ 2 (ศน.)</th>
                    <th className="py-3.5 px-4 text-center">กรรมการ 3 (ผู้แทนครู)</th>
                    <th className="py-3.5 px-4 text-center">มติฉันทามติ</th>
                    <th className="py-3.5 px-4 text-right">การตรวจ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((teacher, idx) => {
                    const evals = paEvaluations.filter(e => e.teacherId === teacher.id);
                    
                    const m1 = paCommitteeMembers[0];
                    const m2 = paCommitteeMembers[1];
                    const m3 = paCommitteeMembers[2];

                    const e1 = evals.find(e => e.committeeId === m1?.id);
                    const e2 = evals.find(e => e.committeeId === m2?.id);
                    const e3 = evals.find(e => e.committeeId === m3?.id);

                    const ok1 = Boolean(e1?.docChecked && e1?.videoChecked);
                    const ok2 = Boolean(e2?.docChecked && e2?.videoChecked);
                    const ok3 = Boolean(e3?.docChecked && e3?.videoChecked);

                    const passCount = [ok1, ok2, ok3].filter(Boolean).length;

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <img 
                              src={teacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'} 
                              alt={teacher.name}
                              className="w-8 h-8 rounded-full object-cover border" 
                            />
                            <span>{teacher.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{teacher.academicStanding || teacher.position || 'ครู'}</td>
                        
                        {/* Member 1 */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            ok1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {ok1 ? `✓ ตรวจ (${e1?.overallScore ? e1.overallScore : 'ผ่าน'})` : '⏳ รอ'}
                          </span>
                        </td>

                        {/* Member 2 */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            ok2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {ok2 ? `✓ ตรวจ (${e2?.overallScore ? e2.overallScore : 'ผ่าน'})` : '⏳ รอ'}
                          </span>
                        </td>

                        {/* Member 3 */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            ok3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {ok3 ? `✓ ตรวจ (${e3?.overallScore ? e3.overallScore : 'ผ่าน'})` : '⏳ รอ'}
                          </span>
                        </td>

                        {/* Consensus */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            passCount === 3 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : passCount > 0 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {passCount === 3 ? '🌟 3/3 ผ่านครบ' : passCount > 0 ? `⏳ ${passCount}/3 ท่าน` : 'ยังไม่ตรวจ'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenBigInspect(teacher, 'split')}
                              className="bg-[#005BAC] hover:bg-[#004584] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition shadow-xs"
                            >
                              ตรวจจอใหญ่
                            </button>
                            {evals.some(e => e.committeeId === currentCommitteeMember?.id && (e.overallScore !== undefined || e.docChecked || e.videoChecked)) && (
                              <button
                                type="button"
                                disabled={clearingTeacherId === teacher.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearTeacherEvaluation(teacher);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1.5 rounded-lg font-bold text-[10px] transition shadow-2xs flex items-center space-x-1"
                                title="ล้างคะแนนของครูท่านนี้"
                              >
                                <RotateCcw className={`w-3 h-3 text-rose-500 ${clearingTeacherId === teacher.id ? 'animate-spin' : ''}`} />
                                <span>ล้าง</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. BIG SCREEN WORKBENCH MODAL (ตรวจดูคลิป + เอกสารจอใหญ่)                 */}
      {/* ========================================================================= */}
      {bigInspectTeacher && currentCommitteeMember && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          
          {/* Workbench Top Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <img 
                src={bigInspectTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'} 
                alt={bigInspectTeacher.name} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm sm:text-base text-white truncate">
                    {bigInspectTeacher.name}
                  </h3>
                  <span className="bg-[#005BAC] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {bigInspectTeacher.academicStanding || bigInspectTeacher.position || 'ครู'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {bigInspectTeacher.paChallengeTitle || 'ประเด็นท้าทาย PA 2569'}
                </p>
              </div>
            </div>

            {/* View Mode Switcher + Next/Prev */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setInspectViewMode('split')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    inspectViewMode === 'split' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>จอคู่ (Split)</span>
                </button>
                <button
                  onClick={() => setInspectViewMode('video')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    inspectViewMode === 'video' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>คลิปเดี่ยว</span>
                </button>
                <button
                  onClick={() => setInspectViewMode('doc')}
                  className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    inspectViewMode === 'doc' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>เอกสารเดี่ยว</span>
                </button>
              </div>

              {/* Folder Link Quick Action */}
              {bigInspectTeacher.paFolderUrl && (
                <a
                  href={bigInspectTeacher.paFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs"
                  title="เปิดโฟลเดอร์ Google Drive รวมไฟล์ทั้งหมด"
                >
                  <Folder className="w-3.5 h-3.5 mr-1.5" />
                  <span>เปิดโฟลเดอร์รวมไฟล์</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-75" />
                </a>
              )}

              {/* Prev / Next buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleNavigateTeacher('prev')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition border border-slate-700"
                  title="ตรวจครูท่านก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNavigateTeacher('next')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition border border-slate-700"
                  title="ตรวจครูท่านถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setBigInspectTeacher(null)}
                className="p-2 bg-slate-800 hover:bg-rose-600 rounded-xl text-slate-400 hover:text-white transition border border-slate-700"
                title="ปิดห้องตรวจจอใหญ่"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workbench Middle: Split Screen or Single View */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-950">
            
            {/* Left: Video Player */}
            {(inspectViewMode === 'split' || inspectViewMode === 'video') && (
              <div className={`h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 ${
                inspectViewMode === 'video' ? 'col-span-2' : ''
              }`}>
                <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-700">
                  <span className="flex items-center">
                    <Video className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> คลิปวิดีโอบันทึกการสอน ว.PA
                  </span>
                  {bigInspectTeacher.paVideoUrl && (
                    <a 
                      href={bigInspectTeacher.paVideoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center"
                    >
                      <span>เปิด YouTube</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>

                <div className="flex-1 bg-black flex items-center justify-center relative">
                  {bigInspectTeacher.paVideoUrl && getVideoEmbedUrl(bigInspectTeacher.paVideoUrl, false) ? (
                    <iframe
                      src={getVideoEmbedUrl(bigInspectTeacher.paVideoUrl, false)!}
                      title="PA Video Player"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Video className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">คุณครูท่านนี้ยังไม่ได้แนบลิงก์คลิปวิดีโอการสอน</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right: Document Viewer */}
            {(inspectViewMode === 'split' || inspectViewMode === 'doc') && (
              <div className={`h-full bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 ${
                inspectViewMode === 'doc' ? 'col-span-2' : ''
              }`}>
                <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-700">
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> เอกสารรายงานผล PA 1/ส
                  </span>
                  {bigInspectTeacher.paDocumentUrl && (
                    <a 
                      href={bigInspectTeacher.paDocumentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center"
                    >
                      <span>เปิดไฟล์เต็ม</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>

                <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
                  {bigInspectTeacher.paDocumentUrl ? (
                    <iframe
                      src={getDocEmbedUrl(bigInspectTeacher.paDocumentUrl)}
                      title="PA Document Viewer"
                      className="w-full h-full border-0 bg-white"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">คุณครูท่านนี้ยังไม่ได้แนบไฟล์เอกสารรายงาน PA</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Workbench Bottom: Evaluator Scoring & Feedback Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 text-white">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Checkboxes & Score */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Doc Check */}
                <button
                  type="button"
                  onClick={() => toggleTeacherDocChecked(bigInspectTeacher.id, currentCommitteeMember)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    paEvaluations.find(e => e.teacherId === bigInspectTeacher.id && e.committeeId === currentCommitteeMember.id)?.docChecked
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>รับรองเอกสาร PA แล้ว</span>
                </button>

                {/* Video Check */}
                <button
                  type="button"
                  onClick={() => toggleTeacherVideoChecked(bigInspectTeacher.id, currentCommitteeMember)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                    paEvaluations.find(e => e.teacherId === bigInspectTeacher.id && e.committeeId === currentCommitteeMember.id)?.videoChecked
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>รับรองคลิปการสอนแล้ว</span>
                </button>

                {/* Score Input & Quick Presets */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-300">คะแนน:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={evalScore}
                      onChange={(e) => setEvalScore(Number(e.target.value))}
                      className="w-14 bg-slate-900 border border-slate-600 rounded-lg py-1 px-1.5 text-center text-emerald-400 font-bold text-sm focus:outline-none"
                    />
                    <span className="text-slate-400 font-bold">/100</span>
                  </div>

                  {/* Score Preset Buttons */}
                  <div className="flex items-center space-x-1">
                    {SCORE_PRESETS.map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setEvalScore(sc)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                          evalScore === sc ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Dropdown */}
                <select
                  value={evalOverallStatus}
                  onChange={(e) => setEvalOverallStatus(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
                >
                  <option value="passed">✓ ผ่านเกณฑ์การประเมิน</option>
                  <option value="excellent">🌟 ผลการประเมินดีเด่น</option>
                  <option value="revision">⚠ ให้ปรับปรุงแก้ไข</option>
                </select>
              </div>

              {/* Remarks, Save, and Save & Next Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:max-w-xl">
                <input
                  type="text"
                  placeholder="พิมพ์หรือเลือกข้อเสนอแนะ..."
                  value={evalOverallComment}
                  onChange={(e) => setEvalOverallComment(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl py-2 px-3 focus:outline-none flex-1 placeholder-slate-500"
                />

                <div className="flex items-center space-x-2 shrink-0">
                  {paEvaluations.some(e => e.teacherId === bigInspectTeacher.id && e.committeeId === currentCommitteeMember.id && (e.overallScore !== undefined || e.docChecked || e.videoChecked || (e.overallStatus && e.overallStatus !== 'pending') || e.overallComment)) && (
                    <button
                      type="button"
                      disabled={clearingTeacherId === bigInspectTeacher.id}
                      onClick={() => handleClearTeacherEvaluation(bigInspectTeacher)}
                      className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5"
                      title="ล้างคะแนนและผลการตรวจของครูท่านนี้"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${clearingTeacherId === bigInspectTeacher.id ? 'animate-spin' : ''}`} />
                      <span>ล้างคะแนน</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveEvaluationInBigModal}
                    disabled={isSavingEval}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingEval ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                  </button>

                  <button
                    onClick={handleSaveAndNextInBigModal}
                    disabled={isSavingEval}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md flex items-center space-x-1.5"
                    title="บันทึกและเลื่อนไปตรวจครูท่านถัดไปในคิว"
                  >
                    <span>บันทึก & ถัดไป</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Comment Preset Chips */}
            <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 text-[10px] font-bold shrink-0">ข้อเสนอแนะด่วน:</span>
              {OVERALL_COMMENT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEvalOverallComment(preset)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg shrink-0 transition text-[10px] truncate max-w-[280px]"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {saveSuccessNotice && (
              <div className="mt-2 text-center text-xs text-emerald-400 font-bold animate-in fade-in">
                ✓ บันทึกผลการประเมินในนาม {currentCommitteeMember.name} เรียบร้อยแล้ว
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUICK EVALUATION FORM MODAL                                            */}
      {/* ========================================================================= */}
      {evalModalTeacher && currentCommitteeMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative text-slate-800 p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-prompt font-extrabold text-slate-900 text-lg">
                    บันทึกคะแนนและข้อเสนอแนะ PA
                  </h3>
                  <p className="text-xs text-slate-500">
                    ครู: {evalModalTeacher.name} • ผู้ประเมิน: {currentCommitteeMember.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEvalModalTeacher(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluationForm} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-xs text-slate-700">
                      คะแนนประเมิน (0-100) *
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalScore}
                    onChange={(e) => setEvalScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                  />
                  {/* Preset Score Pills */}
                  <div className="flex items-center space-x-1 pt-1 overflow-x-auto">
                    {SCORE_PRESETS.map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setEvalScore(sc)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition shrink-0 ${
                          evalScore === sc ? 'bg-[#005BAC] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-xs text-slate-700">
                    สถานะมติรวม *
                  </label>
                  <select
                    value={evalOverallStatus}
                    onChange={(e) => setEvalOverallStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                  >
                    <option value="passed">✓ ผ่านเกณฑ์การประเมิน</option>
                    <option value="excellent">🌟 ผลการประเมินดีเด่น</option>
                    <option value="revision">⚠ ให้ปรับปรุงแก้ไข</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-xs text-slate-700">
                    ข้อเสนอแนะด้านเอกสารรายงาน PA
                  </label>
                </div>
                <textarea
                  rows={2}
                  placeholder="ข้อคิดเห็นและคำแนะนำเกี่ยวกับรายงานข้อตกลง PA..."
                  value={evalDocFeedback}
                  onChange={(e) => setEvalDocFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                />
                {/* Doc presets */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {DOC_FEEDBACK_PRESETS.slice(0, 2).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEvalDocFeedback(p)}
                      className="bg-blue-50 hover:bg-blue-100 text-[#005BAC] text-[10px] px-2 py-0.5 rounded-md font-semibold truncate shrink-0 max-w-[220px]"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-xs text-slate-700">
                    ข้อเสนอแนะด้านคลิปวิดีโอบันทึกการสอน
                  </label>
                </div>
                <textarea
                  rows={2}
                  placeholder="ข้อคิดเห็นและเทคนิคการสอนเชิงรุกในคลิป..."
                  value={evalVideoFeedback}
                  onChange={(e) => setEvalVideoFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                />
                {/* Video presets */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {VIDEO_FEEDBACK_PRESETS.slice(0, 2).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEvalVideoFeedback(p)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-semibold truncate shrink-0 max-w-[220px]"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-700">
                  ความเห็นสรุปของคณะกรรมการ
                </label>
                <textarea
                  rows={2}
                  placeholder="ความเห็นสรุปเพื่อนำไปพัฒนางานในปีการศึกษาถัดไป..."
                  value={evalOverallComment}
                  onChange={(e) => setEvalOverallComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                />
                {/* Overall presets */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                  {OVERALL_COMMENT_PRESETS.slice(0, 2).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEvalOverallComment(p)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-md font-semibold truncate shrink-0 max-w-[220px]"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {paEvaluations.some(e => e.teacherId === evalModalTeacher.id && e.committeeId === currentCommitteeMember.id && (e.overallScore !== undefined || e.docChecked || e.videoChecked || (e.overallStatus && e.overallStatus !== 'pending') || e.overallComment)) ? (
                  <button
                    type="button"
                    disabled={clearingTeacherId === evalModalTeacher.id}
                    onClick={() => handleClearTeacherEvaluation(evalModalTeacher)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition flex items-center space-x-1.5"
                    title="ล้างคะแนนและผลการตรวจของครูท่านนี้"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-rose-600 ${clearingTeacherId === evalModalTeacher.id ? 'animate-spin' : ''}`} />
                    <span>ล้างคะแนน</span>
                  </button>
                ) : <div />}

                <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEvalModalTeacher(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingEval}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingEval ? 'กำลังบันทึก...' : 'บันทึกการประเมิน'}</span>
                </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Fullscreen Reload / Clearing Overlay Modal */}
      {isReloadingClear && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin flex items-center justify-center" />
              <RotateCcw className="w-7 h-7 text-rose-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base font-prompt">
                กำลังล้างข้อมูลและรีโหลด...
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                {clearReloadMessage || 'กำลังล้างคะแนนและรีโหลดสถานะห้องตรวจ...'}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>กำลังซิงค์ฐานข้อมูลและอัปเดตสถานะรอตรวจ...</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
