import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FileType, GradeLevel, Resource } from '../types';
import { 
  User, 
  Award, 
  BookOpen, 
  Download, 
  Eye, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  FileText, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Filter, 
  LogOut, 
  ShieldCheck, 
  Star, 
  Camera,
  Layers, 
  Share2, 
  Calendar, 
  Lock, 
  Key,
  X, 
  Save, 
  Bot, 
  MessageSquare,
  HelpCircle,
  TrendingUp,
  FolderPlus,
  Folder,
  PlayCircle,
  Zap,
  Check
} from 'lucide-react';
import { getYouTubeId, getVideoEmbedUrl, isTeacherAssignedToCommittee, getTeacherCommitteeSetNumber } from '../data/mockData';
import { ImageUploadCompressor } from '../components/ImageUploadCompressor';

export const TeacherDashboardPage: React.FC = () => {
  const { 
    currentTeacher, 
    teachers,
    resources, 
    categories, 
    paCommitteeMembers, 
    paEvaluations,
    setIsTeacherLoginOpen,
    setIsTeacherProfileOpen,
    logoutTeacher, 
    addResource,
    editResource, 
    deleteResource,
    setSelectedResource,
    updateCurrentTeacherProfile,
    setIsAIPlannerOpen,
    setIsAIChatOpen,
    setActiveTab
  } = useApp();

  // Active section tab in teacher dashboard: 'resources' | 'pa' | 'ai-tools' | 'profile-edit'
  const [currentSection, setCurrentSection] = useState<'resources' | 'pa' | 'ai-tools' | 'profile-edit'>('resources');

  // Resource search and filter in teacher space
  const [resourceSearch, setResourceSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedFileTypeFilter, setSelectedFileTypeFilter] = useState('all');

  // Modal / Form state for Adding or Editing Resource
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Resource Form
  const [resForm, setResForm] = useState({
    title: '',
    description: '',
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
    fileUrl: '',
    previewUrl: '',
    fileType: 'PDF' as FileType,
    fileSize: '2.5 MB',
    categoryId: categories[0]?.id || '',
    gradeLevel: 'ป.1' as GradeLevel,
    tags: 'สื่อการสอน, ใบงาน, แผนการเรียนรู้'
  });
  const [isSavingRes, setIsSavingRes] = useState(false);
  const [resSaveSuccess, setResSaveSuccess] = useState(false);

  // Inline Quick PA Edit Form
  const [isEditingPa, setIsEditingPa] = useState(false);
  const [paForm, setPaForm] = useState({
    paChallengeTitle: '',
    paYear: '2569',
    paVideoUrl: '',
    paDocumentUrl: '',
    paFolderUrl: ''
  });
  const [paFormError, setPaFormError] = useState('');
  const [isSavingPa, setIsSavingPa] = useState(false);
  const [paSaveSuccess, setPaSaveSuccess] = useState(false);

  // URL Validator Helper
  const isValidUrlString = (str: string): boolean => {
    if (!str || !str.trim()) return true; // empty allowed
    try {
      const url = new URL(str.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  // Initialize PA form when currentTeacher changes
  React.useEffect(() => {
    if (currentTeacher) {
      setPaForm({
        paChallengeTitle: currentTeacher.paChallengeTitle || '',
        paYear: currentTeacher.paYear || '2569',
        paVideoUrl: currentTeacher.paVideoUrl || '',
        paDocumentUrl: currentTeacher.paDocumentUrl || '',
        paFolderUrl: currentTeacher.paFolderUrl || ''
      });
    }
  }, [currentTeacher]);

  // If not logged in as teacher, show login gate
  if (!currentTeacher) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-[#005BAC] rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#005BAC] bg-blue-50 px-3 py-1 rounded-full">
              ห้องทำงานครู (Teacher Space)
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-prompt">
              เข้าสู่ระบบหน้าหลักของคุณครู
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              เข้าสู่ระบบเพื่อจัดการสื่อการสอนที่อัปโหลด ติดตามผลงานข้อตกลง PA และดูผลการประเมินจากคณะกรรมการ 3 ท่าน
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => setIsTeacherLoginOpen(true)}
              className="w-full bg-[#005BAC] hover:bg-[#004584] text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition shadow-md flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วยชื่อของคุณครู</span>
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl text-xs transition"
            >
              กลับสู่หน้าหลักโรงเรียน
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher's own resources
  const myResources = resources.filter(r => r.teacherId === currentTeacher.id);

  // Filtered resources for search
  const filteredMyResources = myResources.filter(res => {
    const matchQuery = 
      res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      res.description.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      (res.tags && res.tags.some(t => t.toLowerCase().includes(resourceSearch.toLowerCase())));

    if (!matchQuery) return false;
    if (selectedCategoryFilter !== 'all' && res.categoryId !== selectedCategoryFilter) return false;
    if (selectedFileTypeFilter !== 'all' && res.fileType !== selectedFileTypeFilter) return false;
    return true;
  });

  // Calculate teacher stats
  const totalDownloads = myResources.reduce((acc, r) => acc + (r.downloads || 0), 0);
  const totalViews = myResources.reduce((acc, r) => acc + (r.views || 0), 0);

  // Evaluations for this teacher from the 3 committee members
  const myEvaluations = paEvaluations.filter(e => e.teacherId === currentTeacher.id);

  // Filter only the committee members assigned to this teacher
  const assignedCommitteeMembers = (() => {
    const teacherSet = getTeacherCommitteeSetNumber(currentTeacher);
    if (!teacherSet) return [];
    return paCommitteeMembers.filter(m => (m.setNumber || 1) === teacherSet && isTeacherAssignedToCommittee(currentTeacher, m));
  })();

  // Check 3 committee statuses
  const committeeStatuses = assignedCommitteeMembers.map((member, idx) => {
    const evalRecord = myEvaluations.find(e => e.committeeId === member.id);
    return {
      member,
      orderIndex: member.order || idx + 1,
      evalRecord,
      docChecked: evalRecord?.docChecked ?? false,
      videoChecked: evalRecord?.videoChecked ?? false,
      isFullyChecked: (evalRecord?.docChecked && evalRecord?.videoChecked) ?? false
    };
  });

  const fullyApprovedCount = committeeStatuses.filter(s => s.isFullyChecked).length;

  // Open Add Resource Modal
  const handleOpenAddResource = () => {
    setEditingResource(null);
    setResForm({
      title: '',
      description: '',
      cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
      fileUrl: '',
      previewUrl: '',
      fileType: 'PDF',
      fileSize: '2.5 MB',
      categoryId: currentTeacher.subjectId || categories[0]?.id || '',
      gradeLevel: 'ป.1',
      tags: 'สื่อการสอน, ใบงาน, แผนการเรียนรู้'
    });
    setResSaveSuccess(false);
    setIsAddResourceModalOpen(true);
  };

  // Open Edit Resource Modal
  const handleOpenEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResForm({
      title: resource.title,
      description: resource.description,
      cover: resource.cover || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
      fileUrl: resource.fileUrl,
      previewUrl: resource.previewUrl || '',
      fileType: resource.fileType,
      fileSize: resource.fileSize || '2.5 MB',
      categoryId: resource.categoryId,
      gradeLevel: resource.gradeLevel,
      tags: resource.tags ? resource.tags.join(', ') : ''
    });
    setResSaveSuccess(false);
    setIsAddResourceModalOpen(true);
  };

  // Save Resource Form (Add or Edit)
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.title.trim() || !resForm.fileUrl.trim()) return;

    setIsSavingRes(true);
    const tagsArray = resForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (editingResource) {
        await editResource(editingResource.id, {
          title: resForm.title.trim(),
          description: resForm.description.trim(),
          cover: resForm.cover.trim() || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
          fileUrl: resForm.fileUrl.trim(),
          previewUrl: resForm.previewUrl.trim(),
          fileType: resForm.fileType,
          fileSize: resForm.fileSize.trim(),
          categoryId: resForm.categoryId,
          gradeLevel: resForm.gradeLevel,
          tags: tagsArray
        });
      } else {
        await addResource({
          title: resForm.title.trim(),
          description: resForm.description.trim(),
          cover: resForm.cover.trim() || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
          fileUrl: resForm.fileUrl.trim(),
          previewUrl: resForm.previewUrl.trim(),
          fileType: resForm.fileType,
          fileSize: resForm.fileSize.trim(),
          teacherId: currentTeacher.id,
          categoryId: resForm.categoryId,
          gradeLevel: resForm.gradeLevel,
          tags: tagsArray,
          status: 'approved'
        });
      }
      setIsSavingRes(false);
      setResSaveSuccess(true);
      setTimeout(() => {
        setIsAddResourceModalOpen(false);
        setResSaveSuccess(false);
      }, 1000);
    } catch (err) {
      console.error('Error saving resource:', err);
      setIsSavingRes(false);
    }
  };

  // Delete Resource Handler
  const handleDeleteResource = async (id: string, title: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสื่อ "${title}" นี้ออกจากระบบ?`)) {
      await deleteResource(id);
    }
  };

  // Save Inline PA Info
  const handleSavePa = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaFormError('');

    const videoUrlTrimmed = paForm.paVideoUrl.trim();
    const docUrlTrimmed = paForm.paDocumentUrl.trim();
    const folderUrlTrimmed = paForm.paFolderUrl.trim();

    // Validate URL formats
    if (videoUrlTrimmed && !isValidUrlString(videoUrlTrimmed)) {
      setPaFormError('กรุณาตรวจสอบลิงก์คลิปวิดีโออีกครั้ง (รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https:// หรือ http://)');
      return;
    }

    if (docUrlTrimmed && !isValidUrlString(docUrlTrimmed)) {
      setPaFormError('กรุณาตรวจสอบลิงก์เอกสารรายงานอีกครั้ง (รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https:// หรือ http://)');
      return;
    }

    if (folderUrlTrimmed && !isValidUrlString(folderUrlTrimmed)) {
      setPaFormError('กรุณาตรวจสอบลิงก์โฟลเดอร์รวมไฟล์อีกครั้ง (รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https:// หรือ http://)');
      return;
    }

    setIsSavingPa(true);
    const calculatedStatus: 'completed' | 'pending' = (paForm.paChallengeTitle.trim() && (videoUrlTrimmed || docUrlTrimmed || folderUrlTrimmed)) ? 'completed' : 'pending';

    try {
      await updateCurrentTeacherProfile({
        paChallengeTitle: paForm.paChallengeTitle.trim(),
        paYear: paForm.paYear.trim() || '2569',
        paVideoUrl: videoUrlTrimmed,
        paDocumentUrl: docUrlTrimmed,
        paFolderUrl: folderUrlTrimmed,
        paStatus: calculatedStatus
      });
      setIsSavingPa(false);
      setPaSaveSuccess(true);
      setTimeout(() => {
        setPaSaveSuccess(false);
        setIsEditingPa(false);
      }, 1200);
    } catch (err) {
      console.error('Error updating PA:', err);
      setPaFormError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      setIsSavingPa(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      
      {/* Top Hero Banner - Personal Teacher Workspace */}
      <section className="bg-gradient-to-r from-[#003875] via-[#005BAC] to-[#0A74DA] text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none p-6">
          <BookOpen className="w-[420px] h-[420px] text-white" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Teacher Identity & Bio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <div 
                onClick={() => setIsTeacherProfileOpen(true)}
                className="relative cursor-pointer group shrink-0"
                title="คลิกเพื่อแก้ไขรูปโปรไฟล์"
              >
                <img 
                  src={currentTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'} 
                  alt={currentTeacher.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/40 shadow-xl group-hover:opacity-90 transition"
                />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[11px] font-bold">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>เปลี่ยนรูป</span>
                </div>
                <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md border-2 border-white" title="สถานะ: เข้าสู่ระบบแล้ว">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-0.5 rounded-full shadow-xs">
                    {currentTeacher.academicStanding || currentTeacher.position || 'ครู'}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-0.5 rounded-full backdrop-blur-xs">
                    {currentTeacher.subjectName || 'กลุ่มสาระการเรียนรู้'}
                  </span>
                  {currentTeacher.paStatus === 'completed' ? (
                    <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ✓ จัดทำ PA 2569 แล้ว
                    </span>
                  ) : (
                    <span className="bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      ⏳ รอจัดทำข้อตกลง PA
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black font-prompt text-white">
                  {currentTeacher.name}
                </h1>
                
                <p className="text-xs sm:text-sm text-blue-100 font-light max-w-xl line-clamp-2">
                  {currentTeacher.bio || 'ครูผู้สอนโรงเรียนวัดบางโฉลงใน สพป.สมุทรปราการ เขต 2'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-200">
                  {currentTeacher.email && <span>📧 {currentTeacher.email}</span>}
                  {currentTeacher.facebook && <span>💬 {currentTeacher.facebook}</span>}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <button
                onClick={handleOpenAddResource}
                className="bg-[#FFD54F] hover:bg-amber-300 text-[#003875] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ อัปโหลดสื่อใหม่</span>
              </button>

              <button
                onClick={() => setIsTeacherProfileOpen(true)}
                className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 backdrop-blur-xs border border-white/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>แก้ไขโปรไฟล์</span>
              </button>

              <button
                onClick={() => setIsTeacherProfileOpen(true)}
                className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/30 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 backdrop-blur-xs"
                title="เปลี่ยนรหัสผ่านเข้าสู่ระบบของคุณครู"
              >
                <Key className="w-4 h-4" />
                <span>🔑 รหัสผ่าน</span>
              </button>

              <button
                onClick={logoutTeacher}
                className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-100 border border-rose-400/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1"
                title="ออกจากระบบครู"
              >
                <LogOut className="w-4 h-4" />
                <span>ออก</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 4-Bento KPI Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: My Uploaded Resources */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">สื่อที่อัปโหลดแล้ว</span>
                <span className="p-2 bg-blue-50 text-[#005BAC] rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{myResources.length}</span>
                <span className="text-xs font-bold text-slate-500">ผลงาน</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                เผยแพร่ในคลังสื่อโรงเรียนแล้ว
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">เพิ่มล่าสุด:</span>
              <span className="font-bold text-[#005BAC]">
                {myResources[0]?.title ? myResources[0].title.slice(0, 18) + '...' : 'ยังไม่มีสื่อ'}
              </span>
            </div>
          </div>

          {/* Card 2: Total Downloads */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ยอดดาวน์โหลดรวม</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Download className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-emerald-700">{totalDownloads}</span>
                <span className="text-xs font-bold text-slate-500">ครั้ง</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ครูและนักเรียนนำไปใช้ประโยชน์
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">ยอดเข้าชมสื่อ:</span>
              <span className="font-bold text-slate-700">{totalViews} ครั้ง</span>
            </div>
          </div>

          {/* Card 3: PA Committee Review Status */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  การตรวจ PA {assignedCommitteeMembers.length > 0 ? `${assignedCommitteeMembers.length} กรรมการ` : 'คณะกรรมการ'}
                </span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              {assignedCommitteeMembers.length > 0 ? (
                <>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-amber-700">{fullyApprovedCount} / {assignedCommitteeMembers.length}</span>
                    <span className="text-xs font-bold text-slate-500">ท่าน</span>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-y-1">
                    {committeeStatuses.map((s, idx) => (
                      <span 
                        key={s.member.id} 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          s.isFullyChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        ก.{idx + 1}: {s.isFullyChecked ? '✓ ตรวจแล้ว' : '⏳ รอ'}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-400 block mt-1">ยังไม่ได้รับมอบหมายคณะกรรมการ</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">สถานะข้อตกลง:</span>
              <span className={`font-bold ${
                assignedCommitteeMembers.length === 0
                  ? 'text-slate-400'
                  : fullyApprovedCount === assignedCommitteeMembers.length
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}>
                {assignedCommitteeMembers.length === 0
                  ? 'ยังไม่ได้รับมอบหมายคณะกรรมการ'
                  : fullyApprovedCount === assignedCommitteeMembers.length
                  ? `ผ่านฉันทามติครบ ${assignedCommitteeMembers.length} ท่าน`
                  : 'กำลังดำเนินการประเมิน'}
              </span>
            </div>
          </div>

          {/* Card 4: AI & Innovation Assistant */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">เครื่องมือช่วยสอน AI</span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-xl font-extrabold text-purple-900">Gemini 2.5</span>
                <span className="text-xs font-bold text-slate-500">พร้อมใช้งาน</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                สร้างแผนการสอน & ปรึกษาเกณฑ์ ว.PA
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => setIsAIPlannerOpen(true)}
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-1.5 rounded-xl text-xs transition"
              >
                เปิด AI แผนการสอน
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Workspace Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* Section Navigation Tabs Bar */}
        <div className="bg-white rounded-3xl p-2.5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            
            <button
              onClick={() => setCurrentSection('resources')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                currentSection === 'resources'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>คลังสื่อการสอนของฉัน ({myResources.length})</span>
            </button>

            <button
              onClick={() => setCurrentSection('pa')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                currentSection === 'pa'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>ข้อตกลง PA & ผลการตรวจ 3 กรรมการ</span>
            </button>

            <button
              onClick={() => setCurrentSection('ai-tools')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                currentSection === 'ai-tools'
                  ? 'bg-[#005BAC] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>เครื่องมือ AI ช่วยสอน</span>
            </button>

          </div>

          <div className="flex items-center space-x-2 px-2">
            <button
              onClick={handleOpenAddResource}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>อัปโหลดสื่อ</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: คลังสื่อการสอนของฉัน (MY TEACHING RESOURCES)                        */}
        {/* ========================================================================= */}
        {currentSection === 'resources' && (
          <div className="space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสื่อ, รายละเอียด, คำค้น..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="w-full bg-slate-50 text-sm border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                >
                  <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={selectedFileTypeFilter}
                  onChange={(e) => setSelectedFileTypeFilter(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                >
                  <option value="all">ทุกประเภทไฟล์</option>
                  <option value="PDF">PDF</option>
                  <option value="PowerPoint">PowerPoint</option>
                  <option value="Word">Word</option>
                  <option value="Canva Link">Canva Link</option>
                  <option value="Google Drive Link">Google Drive Link</option>
                  <option value="Video">Video</option>
                </select>
              </div>
            </div>

            {/* Resources List or Empty State */}
            {filteredMyResources.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-[#005BAC] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 font-prompt">
                    {myResources.length === 0 ? 'คุณครูยังไม่มีสื่อการสอนที่อัปโหลด' : 'ไม่พบสื่อตามเงื่อนไขที่ค้นหา'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {myResources.length === 0 
                      ? 'ร่วมเผยแพร่นวัตกรรม ใบงาน แผนการสอน และสื่อการเรียนรู้ เพื่อแลกเปลี่ยนกับคุณครูในโรงเรียน'
                      : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่'}
                  </p>
                </div>
                {myResources.length === 0 && (
                  <button
                    onClick={handleOpenAddResource}
                    className="mt-2 inline-flex items-center px-5 py-2.5 bg-[#005BAC] hover:bg-[#004584] text-white font-bold text-xs rounded-xl shadow-md transition space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>อัปโหลดสื่อชิ้นแรกของคุณครู</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMyResources.map((res) => (
                  <div 
                    key={res.id}
                    className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Cover Image & Badges */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        <img 
                          src={res.cover || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600'} 
                          alt={res.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {res.fileType}
                          </span>
                          <span className="bg-[#005BAC]/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {res.gradeLevel}
                          </span>
                        </div>
                        <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          ✓ เผยแพร่แล้ว
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-[#005BAC]">{res.categoryName || 'ทั่วไป'}</span>
                          <span>อัปเดต: {res.updatedAt || res.createdAt}</span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#005BAC] transition line-clamp-2 leading-snug">
                          {res.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {res.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                        </p>

                        {res.tags && res.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {res.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 text-slate-500 font-semibold">
                        <span className="flex items-center">
                          <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {res.downloads || 0}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" /> {res.views || 0}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedResource(res)}
                          className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-lg transition"
                          title="ดูตัวอย่างสื่อ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEditResource(res)}
                          className="p-1.5 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 rounded-lg transition"
                          title="แก้ไขข้อมูลสื่อ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg transition"
                          title="ลบสื่อนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={res.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#005BAC] hover:bg-[#004584] text-white rounded-lg transition"
                          title="เปิดไฟล์ต้นฉบับ"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ข้อตกลง PA & ผลการตรวจ 3 กรรมการ (MY PERFORMANCE AGREEMENT)        */}
        {/* ========================================================================= */}
        {currentSection === 'pa' && (
          <div className="space-y-6">
            
            {/* Quick 3-Step PA Guide Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-[#005BAC] rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6 pointer-events-none">
                <Award className="w-64 h-64 text-white" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ง่าย & ครบถ้วน
                  </span>
                  <span className="text-xs text-blue-100 font-semibold">
                    แนวทางจัดทำข้อตกลง ว.PA ประจำปีการศึกษา {currentTeacher.paYear || '2569'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold font-prompt">
                    ขั้นตอนการส่งผลงาน ว.PA สำหรับคุณครู (3 ขั้นตอนง่ายๆ)
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                    กรอกข้อมูลให้ครบทั้ง 3 รายการด้านล่าง ระบบจะเปลี่ยนสถานะเป็น "✅ จัดทำเรียบร้อย" และส่งต่อให้คณะกรรมการ 3 ท่านเข้าตรวจประเมินทันที
                  </p>
                </div>

                {/* 3 Step Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className={`p-3 rounded-2xl border transition ${
                    currentTeacher.paChallengeTitle ? 'bg-white/15 border-emerald-400/50' : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300">ขั้นตอนที่ 1</span>
                      {currentTeacher.paChallengeTitle ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/50" />
                      )}
                    </div>
                    <p className="text-xs font-bold">1. ประเด็นท้าทาย</p>
                    <p className="text-[11px] text-blue-200">ระบุชื่อประเด็นแก้ปัญหา/พัฒนาผู้เรียน</p>
                  </div>

                  <div className={`p-3 rounded-2xl border transition ${
                    currentTeacher.paVideoUrl ? 'bg-white/15 border-emerald-400/50' : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300">ขั้นตอนที่ 2</span>
                      {currentTeacher.paVideoUrl ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/50" />
                      )}
                    </div>
                    <p className="text-xs font-bold">2. คลิปวิดีโอบันทึกการสอน</p>
                    <p className="text-[11px] text-blue-200">แปะลิงก์ YouTube / Google Drive</p>
                  </div>

                  <div className={`p-3 rounded-2xl border transition ${
                    currentTeacher.paDocumentUrl ? 'bg-white/15 border-emerald-400/50' : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300">ขั้นตอนที่ 3</span>
                      {currentTeacher.paDocumentUrl ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/50" />
                      )}
                    </div>
                    <p className="text-xs font-bold">3. ไฟล์รายงาน PA 1/ส</p>
                    <p className="text-[11px] text-blue-200">แนบลิงก์ไฟล์เอกสารรายงานผล</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PA Challenge & Media Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#005BAC] bg-blue-50 px-3 py-1 rounded-full">
                    ข้อตกลงในการพัฒนางาน (Performance Agreement: PA)
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 font-prompt mt-2">
                    ข้อมูลข้อตกลง PA ของคุณครู (รอบปี {currentTeacher.paYear || '2569'})
                  </h3>
                </div>

                <button
                  onClick={() => setIsEditingPa(!isEditingPa)}
                  className="self-start sm:self-auto bg-[#005BAC] hover:bg-[#004584] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center space-x-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditingPa ? 'ปิดหน้าต่างแก้ไข' : '✏️ แก้ไข / อัปเดตข้อมูล PA'}</span>
                </button>
              </div>

              {/* Inline Edit Form */}
              {isEditingPa ? (
                <form onSubmit={handleSavePa} className="bg-blue-50/50 p-5 sm:p-6 rounded-2xl border border-blue-200 space-y-5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#005BAC]">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>กรอกหรืออัปเดตข้อมูลข้อตกลง PA ให้ถูกต้องและครบถ้วน</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-xs text-slate-700">
                      1. ชื่อประเด็นท้าทายในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน (PA Challenge Title) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="เช่น การพัฒนาทักษะการอ่านจับใจความของนักเรียนชั้น ป.4 โดยใช้นวัตกรรมการเรียนรู้เชิงรุก Active Learning ร่วมกับสื่อดิจิทัล..."
                      value={paForm.paChallengeTitle}
                      onChange={(e) => setPaForm({ ...paForm, paChallengeTitle: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500">💡 ระบุสภาพปัญหา วิธีแก้ปัญหา และผลลัพธ์ที่คาดหวังตามเกณฑ์ ว.PA</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-xs text-slate-700">
                          2. ลิงก์คลิปวิดีโอบันทึกการสอน PA (YouTube / Google Drive) *
                        </label>
                        {paForm.paVideoUrl && isValidUrlString(paForm.paVideoUrl) && (
                          <a
                            href={paForm.paVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md"
                            title="ทดสอบเปิดคลิป"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span>ทดสอบเปิดคลิป</span>
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
                        value={paForm.paVideoUrl}
                        onChange={(e) => {
                          setPaForm({ ...paForm, paVideoUrl: e.target.value });
                          if (paFormError) setPaFormError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500">
                        💡 แนะนำให้อัปโหลดวิดีโอขึ้น YouTube (ตั้งค่าเป็น Unlisted หรือ Public) แล้วนำลิงก์มาวาง
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-xs text-slate-700">
                          3. ลิงก์ไฟล์เอกสารรายงานผล PA 1/ส / SAR (Google Drive / PDF)
                        </label>
                        {paForm.paDocumentUrl && isValidUrlString(paForm.paDocumentUrl) && (
                          <a
                            href={paForm.paDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md"
                            title="ทดสอบเปิดเอกสาร"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span>ทดสอบเปิดเอกสาร</span>
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/.../view"
                        value={paForm.paDocumentUrl}
                        onChange={(e) => {
                          setPaForm({ ...paForm, paDocumentUrl: e.target.value });
                          if (paFormError) setPaFormError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500">
                        💡 วางลิงก์ Google Drive โดยตั้งค่าสิทธิ์ให้ "ทุกคนที่มีลิงก์สามารถดูได้"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-xs text-slate-700">
                          4. 📁 ลิงก์โฟลเดอร์รวมเอกสารและผลงานทั้งหมด (Google Drive Folder)
                        </label>
                        {paForm.paFolderUrl && isValidUrlString(paForm.paFolderUrl) && (
                          <a
                            href={paForm.paFolderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md"
                            title="ทดสอบเปิดโฟลเดอร์"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span>ทดสอบเปิดโฟลเดอร์</span>
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/... (โฟลเดอร์รวมไฟล์เอกสารและผลงานทั้งหมด)"
                        value={paForm.paFolderUrl}
                        onChange={(e) => {
                          setPaForm({ ...paForm, paFolderUrl: e.target.value });
                          if (paFormError) setPaFormError('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500">
                        💡 วางลิงก์ Google Drive Folder รวมไฟล์ทั้งหมด เพื่อให้กรรมการกดเข้าไปตรวจดูไฟล์ทุกชิ้นได้อย่างครบถ้วน
                      </p>
                    </div>
                  </div>

                  {paFormError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-bold">{paFormError}</span>
                    </div>
                  )}

                  {paSaveSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">บันทึกข้อมูลข้อตกลง PA สำเร็จเรียบร้อยแล้ว! สถานะอัปเดตทันที</span>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPa(false);
                        setPaFormError('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPa}
                      className="px-6 py-2 rounded-xl text-xs font-bold bg-[#005BAC] hover:bg-[#004584] text-white shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingPa ? 'กำลังบันทึก...' : 'บันทึกข้อมูล PA'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Display View */
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">หัวข้อประเด็นท้าทาย</span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {currentTeacher.paChallengeTitle || 'คุณครูยังไม่ได้ระบุชื่อประเด็นท้าทาย (กดปุ่มแก้ไขด้านบนเพื่อกรอก)'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Video Link & Player preview */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-xs text-slate-800">คลิปวิดีโอ PA</span>
                          </div>
                          {currentTeacher.paVideoUrl && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              ✓ มีคลิป
                            </span>
                          )}
                        </div>
                        {currentTeacher.paVideoUrl ? (
                          <div className="space-y-2">
                            {getVideoEmbedUrl(currentTeacher.paVideoUrl, false) ? (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                                <iframe
                                  src={getVideoEmbedUrl(currentTeacher.paVideoUrl, false)!}
                                  title="PA Video Preview"
                                  className="w-full h-full border-0"
                                  allowFullScreen
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">ยังไม่มีลิงก์วิดีโอคลิปการสอน</p>
                        )}
                      </div>

                      {currentTeacher.paVideoUrl && (
                        <div className="pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]" title={currentTeacher.paVideoUrl}>
                            {currentTeacher.paVideoUrl}
                          </span>
                          <a
                            href={currentTeacher.paVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs shrink-0"
                          >
                            <Video className="w-3.5 h-3.5 mr-1" />
                            <span>[เปิดคลิป]</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Document Link & PDF Viewer preview */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-xs text-slate-800">เอกสารรายงาน PA 1/ส</span>
                          </div>
                          {currentTeacher.paDocumentUrl && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              ✓ แนบไฟล์แล้ว
                            </span>
                          )}
                        </div>
                        {currentTeacher.paDocumentUrl ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 truncate flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="truncate">{currentTeacher.paDocumentUrl}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">ยังไม่มีลิงก์เอกสารรายงานผล PA</p>
                        )}
                      </div>

                      {currentTeacher.paDocumentUrl && (
                        <div className="pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]" title={currentTeacher.paDocumentUrl}>
                            {currentTeacher.paDocumentUrl}
                          </span>
                          <a
                            href={currentTeacher.paDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-[#005BAC] hover:bg-[#004584] text-white text-xs font-bold transition shadow-xs shrink-0"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            <span>[เปิดเอกสาร]</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Folder Link preview */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Folder className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-xs text-slate-800">โฟลเดอร์รวมไฟล์ผลงาน</span>
                          </div>
                          {currentTeacher.paFolderUrl && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              ✓ มีโฟลเดอร์
                            </span>
                          )}
                        </div>
                        {currentTeacher.paFolderUrl ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 truncate flex items-center space-x-2">
                              <Folder className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="truncate">{currentTeacher.paFolderUrl}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">ยังไม่มีลิงก์โฟลเดอร์รวมเอกสารและผลงาน</p>
                        )}
                      </div>

                      {currentTeacher.paFolderUrl && (
                        <div className="pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]" title={currentTeacher.paFolderUrl}>
                            {currentTeacher.paFolderUrl}
                          </span>
                          <a
                            href={currentTeacher.paFolderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs shrink-0"
                          >
                            <Folder className="w-3.5 h-3.5 mr-1" />
                            <span>[เปิดโฟลเดอร์]</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Committee Evaluation Results Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  ผลการตรวจและรับรองจากคณะกรรมการ {assignedCommitteeMembers.length > 0 ? `${assignedCommitteeMembers.length} ท่าน` : ''}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-prompt mt-2">
                  ข้อเสนอแนะและบันทึกการประเมินรายบุคคล (Real-time Committee Feedback)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  เมื่อคณะกรรมการทำการตรวจดูคลิปและเอกสาร จะแสดงผลคะแนนและข้อเสนอแนะให้คุณครูทราบทันที
                </p>
              </div>

              {/* Committee Cards Grid */}
              {assignedCommitteeMembers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">ยังไม่ได้รับมอบหมายคณะกรรมการ</p>
                  <p className="text-xs text-slate-400">กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบการจัดชุดคณะกรรมการประเมิน ว.PA</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {committeeStatuses.map(({ member, evalRecord, docChecked, videoChecked, isFullyChecked }, index) => {
                  return (
                    <div 
                      key={member.id}
                      className={`rounded-3xl p-5 border flex flex-col justify-between transition ${
                        isFullyChecked 
                          ? 'bg-emerald-50/20 border-emerald-300 ring-1 ring-emerald-300/50' 
                          : docChecked || videoChecked
                          ? 'bg-amber-50/20 border-amber-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Member Profile */}
                        <div className="flex items-center space-x-3 mb-4">
                          <img 
                            src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'} 
                            alt={member.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0" 
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-[#005BAC] bg-blue-50 px-2 py-0.5 rounded-md">
                              กรรมการท่านที่ {index + 1}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                              {member.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {member.role}
                            </p>
                          </div>
                        </div>

                        {/* Status Check Items */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/60">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center text-slate-600">
                              <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> การตรวจเอกสาร PA
                            </span>
                            {docChecked ? (
                              <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> ตรวจแล้ว
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[11px] flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> รอดำเนินการ
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center text-slate-600">
                              <Video className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> การตรวจคลิปการสอน
                            </span>
                            {videoChecked ? (
                              <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> ตรวจแล้ว
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[11px] flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> รอดำเนินการ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score & Status */}
                        {evalRecord?.overallScore ? (
                          <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">คะแนนประเมิน:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-base font-black text-[#005BAC]">
                                {evalRecord.overallScore} / 100
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                evalRecord.overallScore >= 90 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : evalRecord.overallScore >= 70 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {evalRecord.overallScore >= 90 ? 'ดีเด่น' : evalRecord.overallScore >= 70 ? 'ผ่านเกณฑ์' : 'ปรับปรุง'}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {/* Committee Feedback */}
                        {(evalRecord?.docFeedback || evalRecord?.videoFeedback || evalRecord?.overallComment) ? (
                          <div className="mt-3 space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                            <span className="font-bold text-slate-700 text-[11px] flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1 text-blue-500" /> ข้อเสนอแนะของกรรมการ:
                            </span>
                            {evalRecord.docFeedback && (
                              <p className="text-[11px] text-slate-600">
                                <strong>ด้านเอกสาร:</strong> {evalRecord.docFeedback}
                              </p>
                            )}
                            {evalRecord.videoFeedback && (
                              <p className="text-[11px] text-slate-600">
                                <strong>ด้านคลิป:</strong> {evalRecord.videoFeedback}
                              </p>
                            )}
                            {evalRecord.overallComment && (
                              <p className="text-[11px] text-slate-700 font-medium">
                                <strong>สรุป:</strong> {evalRecord.overallComment}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-[11px] text-slate-400 italic text-center py-2">
                            {isFullyChecked ? 'กรรมการไม่ได้ระบุข้อเสนอแนะเพิ่มเติม' : 'รอกรรมการตรวจและบันทึกข้อเสนอแนะ'}
                          </p>
                        )}
                      </div>

                      {/* Updated Date */}
                      <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                        <span>สถานะ: {isFullyChecked ? '✅ ตรวจครบ' : '⏳ กำลังตรวจ'}</span>
                        <span>{evalRecord?.updatedAt || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: เครื่องมือ AI ช่วยครู (AI TEACHING TOOLS)                          */}
        {/* ========================================================================= */}
        {currentSection === 'ai-tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tool 1: AI Lesson Planner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-prompt">
                  AI ช่วยออกแบบแผนการจัดการเรียนรู้ (AI Lesson Planner)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  สร้างแผนการสอน Active Learning สอดคล้องตัวชี้วัด กิจกรรมการเรียนรู้ 3 ขั้น (นำ-สอน-สรุป) ใบงาน และการวัดประเมินผล พร้อมดาวน์โหลดเป็น Word/PDF ได้ทันที
                </p>
              </div>

              <button
                onClick={() => setIsAIPlannerOpen(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>เปิดใช้งาน AI ออกแบบแผนการสอน</span>
              </button>
            </div>

            {/* Tool 2: Teacher QA Assistant */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-[#005BAC] rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-prompt">
                  AI ที่ปรึกษาการจัดการเรียนรู้และเกณฑ์ ว.PA
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ถาม-ตอบข้อสงสัยเกณฑ์การประเมินวิทยฐานะ ว.PA, เทคนิคการสอนเชิงรุก, การวัดผลประเมินผลตามสภาพจริง และการแก้ปัญหาในชั้นเรียนตลอด 24 ชม.
                </p>
              </div>

              <button
                onClick={() => setIsAIChatOpen(true)}
                className="w-full bg-[#005BAC] hover:bg-[#004584] text-white font-bold py-3 rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>เปิดแชตปรึกษาครู AI (Teacher Assistant)</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* ADD / EDIT RESOURCE MODAL                                                 */}
      {/* ========================================================================= */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative text-slate-800 p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#005BAC] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-prompt font-extrabold text-slate-900 text-lg">
                    {editingResource ? 'แก้ไขข้อมูลสื่อการสอน' : 'อัปโหลดสื่อการสอนใหม่'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ครูผู้จัดทำ: {currentTeacher.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resSaveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>บันทึกสื่อการสอนสำเร็จเรียบร้อยแล้ว!</span>
              </div>
            )}

            <form onSubmit={handleSaveResource} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-700">
                  ชื่อสื่อการสอน / นวัตกรรม *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ชุดกิจกรรมการเรียนรู้เรื่องระบบสุริยะ ป.4"
                  value={resForm.title}
                  onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-xs text-slate-700">
                    กลุ่มสาระการเรียนรู้ *
                  </label>
                  <select
                    value={resForm.categoryId}
                    onChange={(e) => setResForm({ ...resForm, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-xs text-slate-700">
                    ระดับชั้น *
                  </label>
                  <select
                    value={resForm.gradeLevel}
                    onChange={(e) => setResForm({ ...resForm, gradeLevel: e.target.value as GradeLevel })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                  >
                    <option value="-">- (ไม่ระบุ / สื่อทั่วไป)</option>
                    <option value="อนุบาล">อนุบาล</option>
                    <option value="อนุบาล 1">อนุบาล 1</option>
                    <option value="อนุบาล 2">อนุบาล 2</option>
                    <option value="อนุบาล 3">อนุบาล 3</option>
                    <option value="ป.1">ประถมศึกษาปีที่ 1 (ป.1)</option>
                    <option value="ป.2">ประถมศึกษาปีที่ 2 (ป.2)</option>
                    <option value="ป.3">ประถมศึกษาปีที่ 3 (ป.3)</option>
                    <option value="ป.4">ประถมศึกษาปีที่ 4 (ป.4)</option>
                    <option value="ป.5">ประถมศึกษาปีที่ 5 (ป.5)</option>
                    <option value="ป.6">ประถมศึกษาปีที่ 6 (ป.6)</option>
                    <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                    <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                    <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                    <option value="ทุกระดับชั้น">ทุกระดับชั้น</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-xs text-slate-700">
                    ประเภทไฟล์ *
                  </label>
                  <select
                    value={resForm.fileType}
                    onChange={(e) => setResForm({ ...resForm, fileType: e.target.value as FileType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="PowerPoint">PowerPoint (.pptx)</option>
                    <option value="Word">Word (.docx)</option>
                    <option value="Canva Link">Canva Template Link</option>
                    <option value="Google Drive Link">Google Drive Link</option>
                    <option value="Video">Video Clip</option>
                    <option value="ZIP">ZIP File</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-xs text-slate-700">
                    ขนาดไฟล์ (โดยประมาณ)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 2.5 MB, ลิงก์ออนไลน์"
                    value={resForm.fileSize}
                    onChange={(e) => setResForm({ ...resForm, fileSize: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-700">
                  ลิงก์ไฟล์สำหรับดาวน์โหลด (Google Drive / Canva / Direct URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... หรือ https://canva.com/..."
                  value={resForm.fileUrl}
                  onChange={(e) => setResForm({ ...resForm, fileUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              {/* Ultra-Light Compressed Cover Image Uploader */}
              <ImageUploadCompressor
                value={resForm.cover}
                onChange={(newCover) => setResForm({ ...resForm, cover: newCover })}
                label="รูปภาพหน้าปกสื่อการสอน (บีบอัดอัตโนมัติ ไม่กินพื้นที่ DB)"
                helpText="ระบบย่อและบีบอัดภาพเหลือ ~20-40 KB อัตโนมัติ ป้องกันฐานข้อมูลเต็ม และโหลดเปิดดูได้รวดเร็วทันใจ"
              />

              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-700">
                  รายละเอียด / คำอธิบายสื่อ
                </label>
                <textarea
                  rows={3}
                  placeholder="อธิบายจุดเด่นของสื่อการสอน วัตถุประสงค์ และวิธีนำไปใช้..."
                  value={resForm.description}
                  onChange={(e) => setResForm({ ...resForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-700">
                  คำค้นหา / แท็ก (คั่นด้วยจุลภาค)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ใบงาน, ป.4, วิทยาศาสตร์, Active Learning"
                  value={resForm.tags}
                  onChange={(e) => setResForm({ ...resForm, tags: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingRes}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#005BAC] hover:bg-[#004584] text-white shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingRes ? 'กำลังบันทึก...' : 'บันทึกและเผยแพร่สื่อ'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
