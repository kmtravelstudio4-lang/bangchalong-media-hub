import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileType, GradeLevel, Teacher } from '../types';
import { 
  User, 
  X, 
  Save, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Camera,
  LogOut,
  Upload,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  FileText,
  Video,
  Play,
  ExternalLink,
  AlertCircle,
  Calendar,
  Check
} from 'lucide-react';
import { ImageUploadCompressor } from './ImageUploadCompressor';
import { getVideoEmbedUrl } from '../data/mockData';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
];



export const TeacherProfileModal: React.FC = () => {
  const { 
    currentTeacher, 
    isTeacherProfileOpen, 
    setIsTeacherProfileOpen, 
    categories, 
    resources,
    updateCurrentTeacherProfile,
    submitResourceByTeacher,
    logoutTeacher 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pa' | 'profile' | 'upload' | 'my-resources'>('pa');

  // Profile & PA Form State
  const [form, setForm] = useState({
    name: '',
    position: 'ครู',
    academicStanding: 'ครูชำนาญการ',
    photo: '',
    bio: '',
    email: '',
    facebook: '',
    subjectId: '',
    paChallengeTitle: '',
    paYear: '2569',
    paVideoUrl: '',
    paDocumentUrl: '',
    password: ''
  });

  // Resource Upload Form State
  const [resForm, setResForm] = useState({
    title: '',
    description: '',
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
    fileUrl: '',
    fileType: 'pdf' as FileType,
    fileSize: '2.5 MB',
    categoryId: categories[0]?.id || '',
    gradeLevel: 'ป.1' as GradeLevel,
    tags: 'สื่อการสอน, ใบงาน, แผนการเรียนรู้'
  });

  const [saving, setSaving] = useState(false);
  const [submittingRes, setSubmittingRes] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentTeacher) {
      setForm({
        name: currentTeacher.name || '',
        position: currentTeacher.position || 'ครู',
        academicStanding: currentTeacher.academicStanding || currentTeacher.position || 'ครูชำนาญการ',
        photo: currentTeacher.photo || AVATAR_PRESETS[0],
        bio: currentTeacher.bio || '',
        email: currentTeacher.email || '',
        facebook: currentTeacher.facebook || '',
        subjectId: currentTeacher.subjectId || (categories[0]?.id || ''),
        paChallengeTitle: currentTeacher.paChallengeTitle || '',
        paYear: currentTeacher.paYear || '2569',
        paVideoUrl: currentTeacher.paVideoUrl || '',
        paDocumentUrl: currentTeacher.paDocumentUrl || '',
        password: currentTeacher.password || '123456'
      });
      
      setResForm(prev => ({
        ...prev,
        categoryId: currentTeacher.subjectId || categories[0]?.id || ''
      }));
    }
  }, [currentTeacher, categories]);

  if (!isTeacherProfileOpen || !currentTeacher) return null;

  // Filter teacher's own submitted resources
  const myResources = resources.filter(r => r.teacherId === currentTeacher.id);

  // Determine if PA is fully submitted (Challenge Title + Video Link)
  const isPaDone = Boolean(form.paChallengeTitle.trim() && form.paVideoUrl.trim());
  const hasChallenge = Boolean(form.paChallengeTitle.trim());
  const hasVideo = Boolean(form.paVideoUrl.trim());
  const hasDocument = Boolean(form.paDocumentUrl.trim());

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    const calculatedStatus: 'completed' | 'pending' = (form.paChallengeTitle.trim() && form.paVideoUrl.trim()) ? 'completed' : 'pending';

    try {
      await updateCurrentTeacherProfile({
        name: form.name.trim(),
        position: form.position.trim(),
        academicStanding: form.academicStanding,
        photo: form.photo.trim(),
        bio: form.bio.trim(),
        email: form.email.trim(),
        facebook: form.facebook.trim(),
        subjectId: form.subjectId,
        paChallengeTitle: form.paChallengeTitle.trim(),
        paYear: form.paYear.trim() || '2569',
        paVideoUrl: form.paVideoUrl.trim(),
        paDocumentUrl: form.paDocumentUrl.trim(),
        paStatus: calculatedStatus,
        password: form.password.trim() || '123456'
      });

      if (calculatedStatus === 'completed') {
        setSuccessMsg('บันทึกข้อมูลสำเร็จ! ระบบอัปเดตสถานะเป็น "✅ จัดทำเรียบร้อยแล้ว"');
      } else {
        setSuccessMsg('บันทึกข้อมูลเรียบร้อยแล้ว! (กรอกชื่อประเด็นท้าทายและคลิปวิดีโอเพื่อเปลี่ยนเป็นสถานะจัดทำเรียบร้อย)');
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRes(true);
    setSuccessMsg(null);

    try {
      const tagArray = resForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      await submitResourceByTeacher({
        title: resForm.title.trim(),
        description: resForm.description.trim(),
        cover: resForm.cover.trim() || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
        fileUrl: resForm.fileUrl.trim(),
        fileType: resForm.fileType,
        fileSize: resForm.fileSize,
        teacherId: currentTeacher.id,
        categoryId: resForm.categoryId,
        gradeLevel: resForm.gradeLevel,
        tags: tagArray.length > 0 ? tagArray : ['สื่อการสอน']
      });

      setSuccessMsg('ส่งคำขออัปโหลดสื่อสำเร็จแล้ว! สื่อจะแสดงบนเว็บไซต์หลังจากแอดมินอนุมัติ');
      setResForm({
        title: '',
        description: '',
        cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
        fileUrl: '',
        fileType: 'pdf',
        fileSize: '2.5 MB',
        categoryId: currentTeacher.subjectId || categories[0]?.id || '',
        gradeLevel: 'ป.1',
        tags: 'สื่อการสอน, ใบงาน, แผนการเรียนรู้'
      });

      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('my-resources');
      }, 2000);
    } catch (err) {
      console.error('Error submitting resource:', err);
    } finally {
      setSubmittingRes(false);
    }
  };

  const embedUrl = getVideoEmbedUrl(form.paVideoUrl, false);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative text-slate-800 space-y-4 my-auto p-6 sm:p-8 max-h-[92vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              onClick={() => setActiveTab('profile')}
              className="relative group cursor-pointer shrink-0"
              title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
            >
              <img 
                src={form.photo || currentTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'} 
                alt={form.name} 
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#005BAC] shadow-xs group-hover:opacity-80 transition" 
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5">
                {isPaDone ? (
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>สถานะ PA: จัดทำเรียบร้อยแล้ว</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>สถานะ PA: ยังไม่จัดทำ</span>
                  </span>
                )}
              </div>
              <h3 className="font-prompt font-extrabold text-slate-900 text-lg leading-snug">
                {currentTeacher.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={logoutTeacher}
              className="text-amber-700 hover:text-rose-600 bg-amber-50 hover:bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
            <button
              onClick={() => setIsTeacherProfileOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('pa')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'pa' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ข้อตกลง PA ของฉัน</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'profile' ? 'bg-white text-[#005BAC] shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ข้อมูลโปรไฟล์</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'upload' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>+ ส่งสื่อการสอน</span>
          </button>

          <button
            onClick={() => setActiveTab('my-resources')}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'my-resources' ? 'bg-white text-[#005BAC] shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>สื่อของฉัน ({myResources.length})</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Tab 1: PA Submission Focus Tab (My PA) */}
        {activeTab === 'pa' && (
          <form id="teacher-pa-form" onSubmit={handleProfileSubmit} className="overflow-y-auto space-y-4 pr-1 text-xs max-h-[55vh]">
            {/* PA Submission Live Status Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isPaDone 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5">
                <div className="flex items-center space-x-2">
                  {isPaDone ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {isPaDone ? '✅ จัดทำเรียบร้อยแล้ว' : '⏳ ยังไม่จัดทำ / อยู่ระหว่างจัดทำ'}
                    </h4>
                    <p className="text-[11px] opacity-80">
                      {isPaDone 
                        ? 'ท่านได้กรอกชื่อประเด็นท้าทายและคลิปวิดีโอ PA ครบถ้วนแล้ว' 
                        : 'กรุณากรอก "ชื่อประเด็นท้าทาย" และ "ลิงก์วิดีโอ PA" เพื่อปรับสถานะเป็นจัดทำเรียบร้อย'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-bold">
                  <span className={`px-2.5 py-1 rounded-full ${
                    isPaDone ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    ปีการศึกษา {form.paYear || '2569'}
                  </span>
                </div>
              </div>

              {/* Real-time Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 text-[11px]">
                <div className={`p-2 rounded-xl flex items-center space-x-2 ${hasChallenge ? 'bg-emerald-100/60 text-emerald-800 font-bold' : 'bg-white/80 text-slate-500'}`}>
                  {hasChallenge ? <Check className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                  <span>1. ชื่อประเด็นท้าทาย PA</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center space-x-2 ${hasVideo ? 'bg-emerald-100/60 text-emerald-800 font-bold' : 'bg-white/80 text-slate-500'}`}>
                  {hasVideo ? <Check className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                  <span>2. ลิงก์คลิปวิดีโอ PA</span>
                </div>
                <div className={`p-2 rounded-xl flex items-center space-x-2 ${hasDocument ? 'bg-emerald-100/60 text-emerald-800 font-bold' : 'bg-white/80 text-slate-500'}`}>
                  {hasDocument ? <Check className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                  <span>3. ไฟล์เอกสาร PA (ออปชัน)</span>
                </div>
              </div>
            </div>

            {/* Field 1: PA Challenge Title */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-[#005BAC]" />
                <span>ชื่อประเด็นท้าทายในการพัฒนางาน (PA Challenge Title) *</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="เช่น การพัฒนาทักษะการคิดเชิงคำนวณด้วยกิจกรรมการเขียนโปรแกรม Scratch สำหรับนักเรียนชั้นประถมศึกษาปีที่ 5..."
                value={form.paChallengeTitle}
                onChange={(e) => setForm({ ...form, paChallengeTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                💡 ระบุหัวข้อหรือชื่อประเด็นท้าทาย ว.PA ที่คุณครูกำหนดไว้ในแบบข้อตกลงในการพัฒนางาน
              </p>
            </div>

            {/* Field 2: Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-[#005BAC]" />
                  <span>ปีการศึกษาที่จัดทำข้อตกลง PA</span>
                </label>
                <select
                  value={form.paYear}
                  onChange={(e) => setForm({ ...form, paYear: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-[#005BAC]"
                >
                  <option value="2569">ปีการศึกษา 2569</option>
                  <option value="2568">ปีการศึกษา 2568</option>
                  <option value="2567">ปีการศึกษา 2567</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#005BAC]" />
                  <span>วิทยฐานะปัจจุบันที่ใช้ประเมิน</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={form.academicStanding || form.position}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600"
                />
              </div>
            </div>

            {/* Field 3: Video URL */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 flex items-center space-x-1.5">
                <Video className="w-4 h-4 text-rose-600" />
                <span>ลิงก์คลิปวิดีโอ PA / วิดีโอบันทึกการสอน (YouTube / Google Drive) *</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=... หรือ https://drive.google.com/..."
                  value={form.paVideoUrl}
                  onChange={(e) => setForm({ ...form, paVideoUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                />
                {form.paVideoUrl && (
                  <a
                    href={form.paVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 border border-rose-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ทดสอบลิงก์</span>
                  </a>
                )}
              </div>

              {/* YouTube Preview if valid */}
              {embedUrl && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-video max-h-48 border border-slate-200 shadow-xs bg-black">
                  <iframe
                    src={embedUrl}
                    title="PA Video Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Field 4: Document URL */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#005BAC]" />
                <span>ลิงก์ไฟล์ข้อตกลง PA / SAR (PDF / Google Drive)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/... หรือ ลิงก์ดาวน์โหลดไฟล์ PDF"
                  value={form.paDocumentUrl}
                  onChange={(e) => setForm({ ...form, paDocumentUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
                />
                {form.paDocumentUrl && (
                  <a
                    href={form.paDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-50 hover:bg-blue-100 text-[#005BAC] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 border border-blue-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดดูไฟล์</span>
                  </a>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Profile Form */}
        {activeTab === 'profile' && (
          <form id="teacher-profile-form" onSubmit={handleProfileSubmit} className="overflow-y-auto space-y-4 pr-1 text-xs max-h-[55vh]">
            {/* Section 1: Profile Photo Uploader with Auto Compression */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <ImageUploadCompressor
                value={form.photo}
                onChange={(newPhoto) => setForm({ ...form, photo: newPhoto })}
                mode="profile"
                label="รูปโปรไฟล์ครู (บีบอัดจัตุรัส 1:1 อัตโนมัติ)"
                helpText="ระบบย่อรูปถ่ายเหลือ ~15-25 KB ตัดขอบจัตุรัสพอดี โหลดไวและประหยัดพื้นที่ฐานข้อมูล 99%"
              />
            </div>

            {/* General Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="นางสาวสมศรี ใจดี"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">กลุ่มสาระการเรียนรู้ *</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">วิทยฐานะ *</label>
                <select
                  value={form.academicStanding}
                  onChange={(e) => setForm({ ...form, academicStanding: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-[#005BAC]"
                >
                  <option value="ครูชำนาญการพิเศษ">ครูชำนาญการพิเศษ</option>
                  <option value="ครูชำนาญการ">ครูชำนาญการ</option>
                  <option value="ครู">ครู</option>
                  <option value="ครูผู้ช่วย">ครูผู้ช่วย</option>
                  <option value="ครูอัตราจ้าง">ครูอัตราจ้าง</option>
                  <option value="พี่เลี้ยงเด็กพิการ">พี่เลี้ยงเด็กพิการ</option>
                  <option value="ครูพี่เลี้ยง">ครูพี่เลี้ยง</option>
                  <option value="นักการภารโรง">นักการภารโรง</option>
                  <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                  <option value="ธุรการ">ธุรการ</option>
                  <option value="ครูเชี่ยวชาญ">ครูเชี่ยวชาญ</option>
                  <option value="ครูเชี่ยวชาญพิเศษ">ครูเชี่ยวชาญพิเศษ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สายชั้นที่สอน / ตำแหน่ง *</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900"
                >
                  <option value="-">- (ไม่มีสายชั้น / สายสนับสนุน)</option>
                  <option value="อนุบาล">อนุบาล</option>
                  <option value="อนุบาล 1">อนุบาล 1</option>
                  <option value="อนุบาล 2">อนุบาล 2</option>
                  <option value="อนุบาล 3">อนุบาล 3</option>
                  <option value="ประถมศึกษาปีที่ 1 (ป.1)">ประถมศึกษาปีที่ 1 (ป.1)</option>
                  <option value="ประถมศึกษาปีที่ 2 (ป.2)">ประถมศึกษาปีที่ 2 (ป.2)</option>
                  <option value="ประถมศึกษาปีที่ 3 (ป.3)">ประถมศึกษาปีที่ 3 (ป.3)</option>
                  <option value="ประถมศึกษาปีที่ 4 (ป.4)">ประถมศึกษาปีที่ 4 (ป.4)</option>
                  <option value="ประถมศึกษาปีที่ 5 (ป.5)">ประถมศึกษาปีที่ 5 (ป.5)</option>
                  <option value="ประถมศึกษาปีที่ 6 (ป.6)">ประถมศึกษาปีที่ 6 (ป.6)</option>
                  <option value="มัธยมศึกษาปีที่ 1 (ม.1)">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                  <option value="มัธยมศึกษาปีที่ 2 (ม.2)">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                  <option value="มัธยมศึกษาปีที่ 3 (ม.3)">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                  {/* Keep existing custom position if not in standard list */}
                  {form.position && ![
                    '-', 'อนุบาล', 'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 
                    'ประถมศึกษาปีที่ 1 (ป.1)', 'ประถมศึกษาปีที่ 2 (ป.2)', 
                    'ประถมศึกษาปีที่ 3 (ป.3)', 'ประถมศึกษาปีที่ 4 (ป.4)', 
                    'ประถมศึกษาปีที่ 5 (ป.5)', 'ประถมศึกษาปีที่ 6 (ป.6)',
                    'มัธยมศึกษาปีที่ 1 (ม.1)', 'มัธยมศึกษาปีที่ 2 (ม.2)', 'มัธยมศึกษาปีที่ 3 (ม.3)'
                  ].includes(form.position) && (
                    <option value={form.position}>{form.position}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Email & Facebook */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">อีเมลติดต่อ</label>
                <input
                  type="email"
                  placeholder="teacher@bangchalong.ac.th"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เพจ Facebook หรือ ช่องทางติดต่อ</label>
                <input
                  type="text"
                  placeholder="ครูสมศรี สอนศิลปะ"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">คติประจำใจ / คำแนะนำตัวสั้นๆ</label>
              <textarea
                rows={2}
                placeholder="มุ่งมั่นพัฒนาการเรียนการสอน..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">🔑 รหัสผ่านเข้าสู่ระบบของคุณครู</label>
              <input
                type="text"
                placeholder="เปลี่ยนรหัสผ่านส่วนตัว"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
              />
            </div>
          </form>
        )}

        {/* Tab 3: Upload Resource Form */}
        {activeTab === 'upload' && (
          <form id="teacher-resource-form" onSubmit={handleResourceSubmit} className="overflow-y-auto space-y-4 pr-1 text-xs max-h-[55vh]">
            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-2xl text-slate-700 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-[#005BAC] shrink-0 mt-0.5" />
              <p className="text-xs">
                สื่อการสอนที่ครูส่งจะเข้าสู่สถานะ <strong className="text-amber-700">"รอการตรวจสอบ"</strong> และจะแสดงบนคลังสื่อการสอนของโรงเรียนทันทีเมื่อ <strong className="text-[#005BAC]">แอดมินกดรับอนุมัติ</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อสื่อการเรียนรู้ / ชื่อใบงาน *</label>
              <input
                type="text"
                required
                placeholder="เช่น ชุดกิจกรรมการเรียนรู้ เรื่อง สมการเชิงเส้นตัวแปรเดียว"
                value={resForm.title}
                onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">กลุ่มสาระการเรียนรู้ *</label>
                <select
                  value={resForm.categoryId}
                  onChange={(e) => setResForm({ ...resForm, categoryId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ระดับชั้น *</label>
                <select
                  value={resForm.gradeLevel}
                  onChange={(e) => setResForm({ ...resForm, gradeLevel: e.target.value as GradeLevel })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">ประเภทไฟล์สื่อ *</label>
                <select
                  value={resForm.fileType}
                  onChange={(e) => setResForm({ ...resForm, fileType: e.target.value as FileType })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900"
                >
                  <option value="pdf">📄 PDF Document</option>
                  <option value="powerpoint">📊 PowerPoint (PPTX)</option>
                  <option value="word">📝 Word (DOCX)</option>
                  <option value="excel">📈 Excel (XLSX)</option>
                  <option value="vdo">🎬 Video Clip</option>
                  <option value="link">🔗 External Link / Drive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ลิงก์ดาวน์โหลดสื่อ / Google Drive / Canva *</label>
              <input
                type="text"
                required
                placeholder="https://drive.google.com/file/d/... หรือ https://canva.com/..."
                value={resForm.fileUrl}
                onChange={(e) => setResForm({ ...resForm, fileUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">คำอธิบายรายละเอียดสื่อการเรียนรู้</label>
              <textarea
                rows={3}
                placeholder="ระบุวัตถุประสงค์ของสื่อ วิธีการใช้งาน หรือรายละเอียดสั้นๆ..."
                value={resForm.description}
                onChange={(e) => setResForm({ ...resForm, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white"
              />
            </div>

            {/* Compressed Image Cover Uploader */}
            <ImageUploadCompressor
              value={resForm.cover}
              onChange={(newCover) => setResForm({ ...resForm, cover: newCover })}
              label="รูปภาพหน้าปกสื่อ (บีบอัดอัตโนมัติ เหลือ ~20-40 KB)"
            />

            <div>
              <label className="block font-bold text-slate-700 mb-1">คำค้นหา / แท็ก (คั่นด้วยจุลภาค)</label>
              <input
                type="text"
                placeholder="สื่อการสอน, ใบงาน, คณิตศาสตร์"
                value={resForm.tags}
                onChange={(e) => setResForm({ ...resForm, tags: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900"
              />
            </div>
          </form>
        )}

        {/* Tab 4: My Resources List */}
        {activeTab === 'my-resources' && (
          <div className="overflow-y-auto space-y-3 pr-1 text-xs max-h-[55vh]">
            {myResources.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-600">ยังไม่มีสื่อการสอนที่ท่านส่งในระบบ</p>
                <p className="text-[11px] text-slate-400 mt-1">คลิกที่ปุ่ม "+ ส่งคำขออัปโหลดสื่อ" เพื่อเริ่มเพิ่มสื่อการเรียนรู้</p>
              </div>
            ) : (
              myResources.map((res) => {
                const isPending = res.status === 'pending';
                const isApproved = !res.status || res.status === 'approved';
                const isRejected = res.status === 'rejected';

                return (
                  <div key={res.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img 
                        src={res.cover || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'} 
                        alt={res.title} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0" 
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{res.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {res.categoryName} • {res.gradeLevel} • {res.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPending && (
                        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>รอแอดมินอนุมัติ</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>อนุมัติแล้ว (แสดงบนเว็บ)</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>ไม่อนุมัติ</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal Footer Buttons */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setIsTeacherProfileOpen(false)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            ปิด
          </button>

          {activeTab === 'pa' && (
            <button
              type="submit"
              form="teacher-pa-form"
              disabled={saving}
              className="bg-[#005BAC] hover:bg-[#004584] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อตกลง PA'}</span>
            </button>
          )}

          {activeTab === 'profile' && (
            <button
              type="submit"
              form="teacher-profile-form"
              disabled={saving}
              className="bg-[#005BAC] hover:bg-[#004584] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกโปรไฟล์'}</span>
            </button>
          )}

          {activeTab === 'upload' && (
            <button
              type="submit"
              form="teacher-resource-form"
              disabled={submittingRes}
              className="bg-[#005BAC] hover:bg-[#004584] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{submittingRes ? 'กำลังส่งคำขอ...' : 'ส่งคำขออนุมัติสื่อ'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

