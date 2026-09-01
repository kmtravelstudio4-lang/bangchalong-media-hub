import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ExamQuestion, ExamType, ExamStatus, GradeLevel } from '../types';
import { compressImageFile, formatBytes } from '../utils/imageCompressor';
import { safeUploadAndReplaceAsset } from '../services/storageCleanupService';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  X, 
  Layers, 
  Filter, 
  BarChart3, 
  Eye, 
  FileDown, 
  Sparkles,
  Archive,
  GraduationCap
} from 'lucide-react';

export const AdminExamManagement: React.FC = () => {
  const { 
    examQuestions, 
    addExamQuestion, 
    editExamQuestion, 
    deleteExamQuestion 
  } = useApp();

  // Admin Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExamStatus>('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectGroupFilter, setSubjectGroupFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamQuestion | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubjectGroup, setFormSubjectGroup] = useState('กลุ่มสาระฯ ภาษาไทย');
  const [formSubject, setFormSubject] = useState('');
  const [formGradeLevel, setFormGradeLevel] = useState<GradeLevel | string>('ป.1');
  const [formSemester, setFormSemester] = useState('ภาคเรียนที่ 1');
  const [formAcademicYear, setFormAcademicYear] = useState('2569');
  const [formExamType, setFormExamType] = useState<ExamType | string>('แบบทดสอบ');
  const [formCreatorName, setFormCreatorName] = useState('');
  const [formExamUrl, setFormExamUrl] = useState('');
  const [formCoverImageUrl, setFormCoverImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<ExamStatus>('published');

  // Image Upload & Compression State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [compressionInfo, setCompressionInfo] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = examQuestions.length;
    const published = examQuestions.filter(e => e.status === 'published' || !e.status).length;
    const draft = examQuestions.filter(e => e.status === 'draft').length;
    const archived = examQuestions.filter(e => e.status === 'archived').length;
    const totalViews = examQuestions.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
    const totalDownloads = examQuestions.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

    // Group breakdown
    const byGrade: Record<string, number> = {};
    const byGroup: Record<string, number> = {};

    examQuestions.forEach(e => {
      byGrade[e.gradeLevel] = (byGrade[e.gradeLevel] || 0) + 1;
      byGroup[e.subjectGroup] = (byGroup[e.subjectGroup] || 0) + 1;
    });

    return { total, published, draft, archived, totalViews, totalDownloads, byGrade, byGroup };
  }, [examQuestions]);

  // Filtered Exam List
  const filteredList = useMemo(() => {
    return examQuestions.filter(e => {
      const matchSearch = search.trim() === '' || 
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase()) ||
        (e.creatorName && e.creatorName.toLowerCase().includes(search.toLowerCase())) ||
        e.subjectGroup.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || (e.status || 'published') === statusFilter;
      const matchGrade = gradeFilter === 'all' || e.gradeLevel === gradeFilter;
      const matchGroup = subjectGroupFilter === 'all' || e.subjectGroup === subjectGroupFilter;

      return matchSearch && matchStatus && matchGrade && matchGroup;
    });
  }, [examQuestions, search, statusFilter, gradeFilter, subjectGroupFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormTitle('');
    setFormDescription('');
    setFormSubjectGroup('กลุ่มสาระฯ ภาษาไทย');
    setFormSubject('');
    setFormGradeLevel('ป.1');
    setFormSemester('ภาคเรียนที่ 1');
    setFormAcademicYear('2569');
    setFormExamType('แบบทดสอบ');
    setFormCreatorName('ฝ่ายวิชาการ');
    setFormExamUrl('');
    setFormCoverImageUrl('');
    setFormStatus('published');
    setImageFile(null);
    setImagePreview('');
    setCompressionInfo('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exam: ExamQuestion) => {
    setEditingExam(exam);
    setFormTitle(exam.title);
    setFormDescription(exam.description || '');
    setFormSubjectGroup(exam.subjectGroup);
    setFormSubject(exam.subject);
    setFormGradeLevel(exam.gradeLevel);
    setFormSemester(exam.semester || 'ภาคเรียนที่ 1');
    setFormAcademicYear(exam.academicYear || '2569');
    setFormExamType(exam.examType);
    setFormCreatorName(exam.creatorName || '');
    setFormExamUrl(exam.examUrl);
    setFormCoverImageUrl(exam.coverImageUrl || '');
    setFormStatus(exam.status || 'published');
    setImageFile(null);
    setImagePreview(exam.coverImageUrl || '');
    setCompressionInfo('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Image File Selection & Compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressionInfo('กำลังบีบอัดภาพให้อยู่ในขนาด ≤ 100 KB...');
      const comp = await compressImageFile(file, {
        mode: 'exam_cover',
        targetMaxBytes: 100 * 1024
      });
      setImageFile(file);
      setImagePreview(comp.dataUrl);
      setCompressionInfo(`ลดขนาด ${comp.originalSizeFormatted} → ${comp.compressedSizeFormatted} (${comp.savingsPercentage}% เล็กลง)`);
    } catch (err: any) {
      setFormError('ไม่สามารถบีบอัดรูปภาพได้: ' + err.message);
    }
  };

  // Validate & Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('กรุณากรอกชื่อข้อสอบ');
      return;
    }
    if (!formSubject.trim()) {
      setFormError('กรุณากรอกชื่อวิชา');
      return;
    }
    if (!formExamUrl.trim()) {
      setFormError('กรุณากรอก URL ข้อสอบ');
      return;
    }

    // Strict URL Validation: Reject javascript: / data: / require https://
    const cleanUrl = formExamUrl.trim();
    if (
      cleanUrl.startsWith('javascript:') || 
      cleanUrl.startsWith('data:') || 
      (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://'))
    ) {
      setFormError('URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https:// และห้ามมี script อันตราย');
      return;
    }

    setIsSaving(true);

    try {
      let finalCoverUrl = formCoverImageUrl;

      // Handle Compressed Image Upload via Safe Storage Lifecycle
      if (imagePreview && imagePreview.startsWith('data:')) {
        const examId = editingExam ? editingExam.id : `exam-${Date.now()}`;
        const uploadRes = await safeUploadAndReplaceAsset({
          bucket: 'media-thumbnails',
          folder: 'exam-covers',
          entityId: examId,
          entityType: 'exam_cover',
          fileData: imagePreview,
          mimeType: 'image/webp',
          oldUrl: editingExam?.coverImageUrl,
          updateDatabaseFn: async (newUrl) => {
            finalCoverUrl = newUrl;
            return true;
          }
        });

        if (uploadRes.success && uploadRes.publicUrl) {
          finalCoverUrl = uploadRes.publicUrl;
        } else {
          console.warn('Storage upload fallback, keeping base64/preview');
        }
      }

      if (editingExam) {
        await editExamQuestion(editingExam.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          subjectGroup: formSubjectGroup,
          subject: formSubject.trim(),
          gradeLevel: formGradeLevel,
          semester: formSemester,
          academicYear: formAcademicYear,
          examType: formExamType,
          creatorName: formCreatorName.trim() || 'ฝ่ายวิชาการ',
          examUrl: cleanUrl,
          coverImageUrl: finalCoverUrl,
          status: formStatus
        });
      } else {
        await addExamQuestion({
          title: formTitle.trim(),
          description: formDescription.trim(),
          subjectGroup: formSubjectGroup,
          subject: formSubject.trim(),
          gradeLevel: formGradeLevel,
          semester: formSemester,
          academicYear: formAcademicYear,
          examType: formExamType,
          creatorName: formCreatorName.trim() || 'ฝ่ายวิชาการ',
          examUrl: cleanUrl,
          coverImageUrl: finalCoverUrl,
          status: formStatus
        });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'ชื่อข้อสอบ',
      'กลุ่มสาระการเรียนรู้',
      'วิชา',
      'ระดับชั้น',
      'ภาคเรียน',
      'ปีการศึกษา',
      'ประเภทข้อสอบ',
      'ผู้จัดทำ',
      'URL ข้อสอบ',
      'สถานะ',
      'ยอดเข้าชม',
      'ยอดดาวน์โหลด',
      'วันที่สร้าง',
      'วันที่แก้ไข'
    ];

    const rows = examQuestions.map(e => [
      `"${e.id}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.subjectGroup || '').replace(/"/g, '""')}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      `"${(e.gradeLevel || '').replace(/"/g, '""')}"`,
      `"${(e.semester || '').replace(/"/g, '""')}"`,
      `"${(e.academicYear || '').replace(/"/g, '""')}"`,
      `"${(e.examType || '').replace(/"/g, '""')}"`,
      `"${(e.creatorName || '').replace(/"/g, '""')}"`,
      `"${(e.examUrl || '').replace(/"/g, '""')}"`,
      `"${e.status || 'published'}"`,
      e.viewCount || 0,
      e.downloadCount || 0,
      `"${e.createdAt || ''}"`,
      `"${e.updatedAt || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bangchalong_Exam_Bank_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SECTION HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-[#005BAC] px-3 py-1 rounded-full text-xs font-bold mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>ระบบบริหารจัดการคลังข้อสอบ</span>
          </div>
          <h2 className="font-prompt text-2xl font-extrabold text-slate-900">
            คลังข้อสอบ โรงเรียนวัดบางโฉลงใน
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สร้าง แก้ไข และจัดการแบบทดสอบออนไลน์ แบบประเมิน และคลังข้อสอบทุกกลุ่มสาระ
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>ส่งออก CSV (UTF-8)</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มข้อสอบใหม่</span>
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-slate-500 font-bold">ข้อสอบทั้งหมด</div>
          <div className="text-2xl font-black text-slate-900 font-prompt mt-1">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-emerald-600 font-bold">เผยแพร่แล้ว</div>
          <div className="text-2xl font-black text-emerald-600 font-prompt mt-1">{stats.published}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-amber-600 font-bold">ฉบับร่าง</div>
          <div className="text-2xl font-black text-amber-600 font-prompt mt-1">{stats.draft}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-slate-500 font-bold">เก็บถาวร</div>
          <div className="text-2xl font-black text-slate-600 font-prompt mt-1">{stats.archived}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-sky-600 font-bold">ยอดเข้าชมรวม</div>
          <div className="text-2xl font-black text-sky-600 font-prompt mt-1">{stats.totalViews}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <div className="text-xs text-indigo-600 font-bold">ยอดดาวน์โหลด</div>
          <div className="text-2xl font-black text-indigo-600 font-prompt mt-1">{stats.totalDownloads}</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาข้อสอบ, วิชา, ผู้จัดทำ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="published">เผยแพร่แล้ว (Published)</option>
              <option value="draft">ฉบับร่าง (Draft)</option>
              <option value="archived">เก็บถาวร (Archived)</option>
            </select>
          </div>

          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ทุกระดับชั้น</option>
              {['อนุบาล', 'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={subjectGroupFilter}
              onChange={(e) => setSubjectGroupFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ทุกกลุ่มสาระฯ</option>
              {[
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
              ].map(sg => (
                <option key={sg} value={sg}>{sg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. EXAM DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">ภาพปก / ข้อสอบ</th>
                <th className="py-3.5 px-4">กลุ่มสาระ / วิชา</th>
                <th className="py-3.5 px-4">ระดับชั้น</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4">ภาคเรียน / ปี</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-center">เข้าชม</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    ไม่พบรายการข้อสอบ
                  </td>
                </tr>
              ) : (
                filteredList.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {exam.coverImageUrl ? (
                            <img src={exam.coverImageUrl} alt={exam.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#005BAC] text-[#FFD54F]">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 line-clamp-1">{exam.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {exam.creatorName || 'ฝ่ายวิชาการ'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{exam.subject}</div>
                      <div className="text-[10px] text-slate-400">{exam.subjectGroup}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {exam.gradeLevel}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {exam.examType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{exam.semester}</div>
                      <div className="text-[10px] text-slate-400">ปี {exam.academicYear}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {exam.status === 'published' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          เผยแพร่
                        </span>
                      ) : exam.status === 'draft' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ฉบับร่าง
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          เก็บถาวร
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {exam.viewCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => window.open(exam.examUrl, '_blank', 'noopener,noreferrer')}
                          className="p-1.5 text-slate-400 hover:text-[#005BAC] hover:bg-blue-50 rounded-lg transition"
                          title="เปิดข้อสอบ"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(exam)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="แก้ไขข้อสอบ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(exam.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="ลบข้อสอบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD / EDIT EXAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <h3 className="font-prompt text-xl font-extrabold text-slate-900">
                {editingExam ? 'แก้ไขข้อสอบ' : 'เพิ่มข้อสอบใหม่'}
              </h3>
              <p className="text-xs text-slate-500">
                ระบุข้อมูลและฝากลิงก์ข้อสอบ (Google Forms, Drive, Canva, PDF)
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อข้อสอบ / แบบทดสอบ *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น แบบทดสอบวัดผลสัมฤทธิ์ปลายภาคเรียนที่ 1 วิชาคณิตศาสตร์"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  required
                />
              </div>

              {/* 2. Subject Group & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    กลุ่มสาระการเรียนรู้ *
                  </label>
                  <select
                    value={formSubjectGroup}
                    onChange={(e) => setFormSubjectGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  >
                    {[
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
                    ].map(sg => (
                      <option key={sg} value={sg}>{sg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อวิชา *
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="เช่น คณิตศาสตร์, ภาษาไทย, วิทยาศาสตร์"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                    required
                  />
                </div>
              </div>

              {/* 3. Grade, Semester, Academic Year */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ระดับชั้น *</label>
                  <select
                    value={formGradeLevel}
                    onChange={(e) => setFormGradeLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  >
                    {['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ทุกระดับชั้น'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ภาคเรียน</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  >
                    <option value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</option>
                    <option value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    placeholder="2569"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
              </div>

              {/* 4. Exam Type & Creator Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทข้อสอบ</label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  >
                    {[
                      'ข้อสอบก่อนเรียน',
                      'ข้อสอบหลังเรียน',
                      'แบบทดสอบ',
                      'แบบฝึกหัด',
                      'แบบประเมิน',
                      'ข้อสอบกลางภาค',
                      'ข้อสอบปลายภาค',
                      'อื่นๆ'
                    ].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ผู้จัดทำ / สายชั้น</label>
                  <input
                    type="text"
                    value={formCreatorName}
                    onChange={(e) => setFormCreatorName(e.target.value)}
                    placeholder="เช่น ครูสมชาย / สายชั้น ป.1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
              </div>

              {/* 5. Exam URL (External Link) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL ลิงก์ข้อสอบ (Google Forms, Drive, Canva, PDF) *
                </label>
                <input
                  type="url"
                  value={formExamUrl}
                  onChange={(e) => setFormExamUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/... หรือ https://drive.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  required
                />
              </div>

              {/* 6. Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดข้อสอบ</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="คำชี้แจง วัตถุประสงค์ หรือจำนวนข้อสอบ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                />
              </div>

              {/* 7. Cover Image Upload (WebP ≤ 100KB) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ภาพปกข้อสอบ (บีบอัดอัตโนมัติ WebP ≤ 100 KB)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>เลือกรูปภาพ</span>
                  </button>

                  {imagePreview && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {compressionInfo && (
                    <span className="text-[11px] text-emerald-600 font-medium">{compressionInfo}</span>
                  )}
                </div>
              </div>

              {/* 8. Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">สถานะการเผยแพร่</label>
                <div className="flex items-center space-x-4 text-xs">
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="examStatus"
                      value="published"
                      checked={formStatus === 'published'}
                      onChange={() => setFormStatus('published')}
                      className="text-[#005BAC]"
                    />
                    <span className="font-bold text-emerald-700">เผยแพร่ทันที (Published)</span>
                  </label>

                  <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="examStatus"
                      value="draft"
                      checked={formStatus === 'draft'}
                      onChange={() => setFormStatus('draft')}
                      className="text-amber-500"
                    />
                    <span className="font-medium text-amber-700">ฉบับร่าง (Draft)</span>
                  </label>

                  <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="examStatus"
                      value="archived"
                      checked={formStatus === 'archived'}
                      onChange={() => setFormStatus('archived')}
                      className="text-slate-500"
                    />
                    <span className="font-medium text-slate-600">เก็บถาวร (Archived)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>{editingExam ? 'บันทึกการแก้ไข' : 'เพิ่มข้อสอบ'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h4 className="font-prompt text-lg font-bold text-slate-900">ยืนยันการลบข้อสอบ?</h4>
            <p className="text-xs text-slate-500">
              ข้อสอบนี้จะถูกลบออกจากระบบ และไม่สามารถกู้คืนได้
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  await deleteExamQuestion(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                ลบข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
