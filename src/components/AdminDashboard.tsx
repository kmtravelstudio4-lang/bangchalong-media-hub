import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Resource, 
  Teacher, 
  Category, 
  News, 
  SchoolDocument, 
  FileType, 
  GradeLevel,
  PaCommitteeMember 
} from '../types';
import { 
  isTeacherAssignedToCommittee, 
  getTeacherCommitteeSetNumber,
  getTeacherAcademicCategory,
  STANDARD_ACADEMIC_CATEGORIES
} from '../data/mockData';
import { SUPABASE_SQL_SCHEMA } from '../services/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Tag, 
  Newspaper, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  Copy, 
  Database, 
  Upload, 
  ExternalLink, 
  Sparkles, 
  X,
  FileCode,
  ShieldCheck,
  TrendingUp,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Video,
  Youtube,
  Play,
  Award,
  CheckCircle2,
  RotateCcw,
  HelpCircle,
  Filter,
  GraduationCap,
  XCircle,
  Clock,
  ClipboardCheck,
  Key,
  ChevronRight,
  Sliders,
  Scale,
  AlertTriangle,
  Layers,
  UserCheck,
  MessageSquare,
  CheckSquare,
  Info,
  ListOrdered,
  FileSpreadsheet,
  DownloadCloud
} from 'lucide-react';
import { ImageUploadCompressor } from './ImageUploadCompressor';
import { 
  generatePaCsvContent, 
  downloadCsvBlob, 
  filterTeachersForExport, 
  sanitizeFileName,
  PaExportFilterOptions
} from '../utils/paExportUtils';

type AdminTab = 'dashboard' | 'approvals' | 'resources' | 'teachers' | 'pa-management' | 'categories' | 'news' | 'videos' | 'documents' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { 
    resources, 
    teachers, 
    categories, 
    newsList, 
    documents,
    videos,
    paCommitteeMembers,
    paEvaluations,
    addCommitteeMember,
    updateCommitteeMember,
    deleteCommitteeMember,
    getCommitteeProgress,
    varianceThreshold,
    setVarianceThreshold,
    getTeacherConsensus,
    setActiveTab,
    addResource, 
    editResource, 
    deleteResource,
    approveResource,
    rejectResource,
    addTeacher, 
    editTeacher, 
    deleteTeacher,
    resetTeacherPa,
    addCategory, 
    editCategory, 
    deleteCategory,
    addNews, 
    editNews, 
    deleteNews,
    addDocument,
    deleteDocument,
    addVideo,
    deleteVideo,
    logoutAdmin,
    currentTeacher,
    logoutTeacher,
    supabaseConfig,
    updateSupabaseConfig
  } = useApp();

  // Force log out teacher session when admin dashboard is active
  useEffect(() => {
    if (currentTeacher) {
      logoutTeacher();
    }
  }, [currentTeacher, logoutTeacher]);

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPaFilter, setTeacherPaFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState<string>('all');

  // Modals state
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // PA Management subtabs & filters
  const [paSubTab, setPaSubTab] = useState<'consensus-matrix' | 'committee-sets' | 'overview' | 'export-csv'>('consensus-matrix');
  const [selectedSetFilter, setSelectedSetFilter] = useState<number>(0); // 0 = all sets, 1, 2, 3, etc.
  const [inspectConsensusTeacher, setInspectConsensusTeacher] = useState<Teacher | null>(null);

  // PA CSV Export State
  const [exportYearFilter, setExportYearFilter] = useState<string>('2569');
  const [exportStandingFilter, setExportStandingFilter] = useState<string>('all');
  const [exportCategoryFilter, setExportCategoryFilter] = useState<string>('all');
  const [exportPaStatusFilter, setExportPaStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Committee Member editing modal state
  const [isCommitteeMemberModalOpen, setIsCommitteeMemberModalOpen] = useState(false);
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<PaCommitteeMember | null>(null);
  const [committeeFormData, setCommitteeFormData] = useState({
    id: '',
    name: '',
    role: '',
    position: '',
    code: '',
    setNumber: 1,
    setName: '',
    targetDescription: '',
    order: 1,
    avatar: '',
    phone: '',
    email: ''
  });
  const [vidForm, setVidForm] = useState({
    title: '',
    youtubeUrl: '',
    description: ''
  });

  // Copy feedback
  const [copiedSql, setCopiedSql] = useState(false);

  // Supabase input fields
  const [spUrl, setSpUrl] = useState(supabaseConfig.url);
  const [spKey, setSpKey] = useState(supabaseConfig.anonKey);
  const [spSaved, setSpSaved] = useState(false);

  // Resource Form State
  const [resForm, setResForm] = useState({
    title: '',
    description: '',
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    fileUrl: '',
    previewUrl: '',
    fileType: 'PDF' as FileType,
    fileSize: '3.5 MB',
    teacherId: teachers[0]?.id || '',
    categoryId: categories[0]?.id || '',
    gradeLevel: 'ป.5' as GradeLevel,
    tags: 'วิทยาการคำนวณ, โค้ดดิ้ง, ป.5',
    featured: false
  });

  // Teacher Form State
  const [tForm, setTForm] = useState({
    name: '',
    position: 'ประถมศึกษาปีที่ 1 (ป.1)',
    academicStanding: 'ครูชำนาญการ',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
    bio: '',
    email: '',
    facebook: '',
    subjectId: categories[0]?.id || '',
    paChallengeTitle: '',
    paYear: '2569',
    paStatus: 'pending' as 'completed' | 'pending',
    paVideoUrl: '',
    paDocumentUrl: '',
    password: '123456'
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    color: '#005BAC',
    iconName: 'BookOpen',
    description: ''
  });

  // News Form State
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    category: 'ข่าวประชาสัมพันธ์',
    author: 'ฝ่ายวิชาการ',
    pinned: false
  });

  // Doc Form State
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'แบบฟอร์มโรงเรียน',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF (.pdf)',
    fileSize: '1.2 MB'
  });

  // Analytics Metrics
  const totalResources = resources.length;
  const totalTeachers = teachers.length;
  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads || 0), 0);
  const totalViews = resources.reduce((acc, r) => acc + (r.views || 0), 0);

  // Prepare chart data for Recharts
  const categoryChartData = categories.map(cat => {
    const count = resources.filter(r => r.categoryId === cat.id).length;
    return { name: cat.name.replace('กลุ่มสาระฯ ', ''), count, color: cat.color };
  });

  const monthTrendData = [
    { name: 'ม.ค.', downloads: 320, views: 890 },
    { name: 'ก.พ.', downloads: 480, views: 1200 },
    { name: 'มี.ค.', downloads: 650, views: 1540 },
    { name: 'เม.ย.', downloads: 410, views: 1100 },
    { name: 'พ.ค.', downloads: 780, views: 1980 },
    { name: 'มิ.ย.', downloads: 920, views: 2400 },
    { name: 'ก.ค.', downloads: 1250, views: 3100 },
  ];

  // Resource Save Action
  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = resForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingResource) {
      editResource(editingResource.id, {
        title: resForm.title,
        description: resForm.description,
        cover: resForm.cover,
        fileUrl: resForm.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewUrl: resForm.previewUrl || resForm.fileUrl,
        fileType: resForm.fileType,
        fileSize: resForm.fileSize,
        teacherId: resForm.teacherId,
        categoryId: resForm.categoryId,
        gradeLevel: resForm.gradeLevel,
        tags: tagArray,
        featured: resForm.featured
      });
    } else {
      addResource({
        title: resForm.title,
        description: resForm.description,
        cover: resForm.cover,
        fileUrl: resForm.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewUrl: resForm.previewUrl || resForm.fileUrl,
        fileType: resForm.fileType,
        fileSize: resForm.fileSize,
        teacherId: resForm.teacherId || teachers[0]?.id || '',
        categoryId: resForm.categoryId || categories[0]?.id || '',
        gradeLevel: resForm.gradeLevel,
        tags: tagArray,
        featured: resForm.featured
      });
    }

    setIsResourceModalOpen(false);
    setEditingResource(null);
  };

  const openAddResource = () => {
    setEditingResource(null);
    setResForm({
      title: '',
      description: '',
      cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
      fileUrl: '',
      previewUrl: '',
      fileType: 'PDF',
      fileSize: '3.5 MB',
      teacherId: teachers[0]?.id || '',
      categoryId: categories[0]?.id || '',
      gradeLevel: 'ป.5',
      tags: 'วิทยาการคำนวณ, โค้ดดิ้ง',
      featured: false
    });
    setIsResourceModalOpen(true);
  };

  const openEditResource = (res: Resource) => {
    setEditingResource(res);
    setResForm({
      title: res.title,
      description: res.description,
      cover: res.cover,
      fileUrl: res.fileUrl,
      previewUrl: res.previewUrl || '',
      fileType: res.fileType,
      fileSize: res.fileSize || '3.5 MB',
      teacherId: res.teacherId,
      categoryId: res.categoryId,
      gradeLevel: res.gradeLevel,
      tags: res.tags ? res.tags.join(', ') : '',
      featured: Boolean(res.featured)
    });
    setIsResourceModalOpen(true);
  };

  // Teacher Save Action
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      editTeacher(editingTeacher.id, tForm);
    } else {
      addTeacher(tForm);
    }
    setIsTeacherModalOpen(false);
    setEditingTeacher(null);
  };

  const openAddTeacher = () => {
    setEditingTeacher(null);
    setTForm({
      name: '',
      position: 'ประถมศึกษาปีที่ 1 (ป.1)',
      academicStanding: 'ครูชำนาญการ',
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
      bio: '',
      email: '',
      facebook: '',
      subjectId: categories[0]?.id || '',
      paChallengeTitle: '',
      paYear: '2569',
      paStatus: 'pending',
      paVideoUrl: '',
      paDocumentUrl: '',
      password: '123456'
    });
    setIsTeacherModalOpen(true);
  };

  const openEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTForm({
      name: t.name,
      position: t.position,
      academicStanding: t.academicStanding || t.position || 'ครูชำนาญการ',
      photo: t.photo,
      bio: t.bio || '',
      email: t.email || '',
      facebook: t.facebook || '',
      subjectId: t.subjectId,
      paChallengeTitle: t.paChallengeTitle || '',
      paYear: t.paYear || '2569',
      paStatus: (t.paStatus || (t.paChallengeTitle && t.paVideoUrl ? 'completed' : 'pending')) as 'completed' | 'pending',
      paVideoUrl: t.paVideoUrl || '',
      paDocumentUrl: t.paDocumentUrl || '',
      password: t.password || '123456'
    });
    setIsTeacherModalOpen(true);
  };

  const handleResetTeacherPa = async (id: string, name: string) => {
    if (window.confirm(`คุณต้องการลบ / ล้างข้อมูลข้อตกลง PA (ประเด็นท้าทาย, วิดีโอ, ไฟล์เอกสาร) ของคุณครู "${name}" หรือไม่?\n\n*หมายเหตุ: บัญชีครูจะยังคงอยู่ในระบบ แต่สถานะ PA จะถูกรีเซ็ตเป็น "ยังไม่จัดทำ"`)) {
      await resetTeacherPa(id);
    }
  };

  // Category Save Action
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      editCategory(editingCategory.id, catForm);
    } else {
      addCategory(catForm);
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // News Save Action
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews) {
      editNews(editingNews.id, newsForm);
    } else {
      addNews(newsForm);
    }
    setIsNewsModalOpen(false);
    setEditingNews(null);
  };

  // Doc Save Action
  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument(docForm);
    setIsDocModalOpen(false);
  };

  // Video Save Action
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    addVideo(vidForm);
    setIsVideoModalOpen(false);
    setVidForm({
      title: '',
      youtubeUrl: '',
      description: ''
    });
  };

  // Supabase Save Action
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig({ url: spUrl, anonKey: spKey });
    setSpSaved(true);
    setTimeout(() => setSpSaved(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Admin Header Branding */}
          <div className="flex items-center space-x-3 mb-8 pb-5 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-[#005BAC] text-[#FFD54F] font-bold text-xl flex items-center justify-center border-2 border-[#FFD54F]">
              บฉ
            </div>
            <div>
              <h2 className="font-prompt font-bold text-white text-sm">ผู้ดูแลระบบ (Admin)</h2>
              <p className="text-[11px] text-slate-400">โรงเรียนวัดบางโฉลงใน</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'dashboard' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ภาพรวมระบบ (Dashboard)</span>
            </button>

            {/* คำขออนุมัติสื่อ */}
            <button
              onClick={() => setActiveAdminTab('approvals')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'approvals' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>คำขออนุมัติสื่อ</span>
              </div>
              {resources.filter(r => r.status === 'pending').length > 0 ? (
                <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                  {resources.filter(r => r.status === 'pending').length}
                </span>
              ) : (
                <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono text-slate-400">0</span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('resources')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'resources' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-4 h-4" />
                <span>จัดการสื่อการสอน</span>
              </div>
              <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono">{resources.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('teachers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'teachers' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>จัดการข้อมูลครู</span>
              </div>
              <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono">{teachers.length}</span>
            </button>

            {/* จัดการข้อตกลง PA */}
            <button
              onClick={() => setActiveAdminTab('pa-management')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'pa-management' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Award className="w-4 h-4 text-[#FFD54F]" />
                <span>จัดการข้อตกลง PA</span>
              </div>
              <span className="bg-amber-500/20 text-[#FFD54F] border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {teachers.filter(t => t.paStatus === 'completed' || (t.paChallengeTitle && t.paVideoUrl)).length}/{teachers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'categories' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Tag className="w-4 h-4" />
                <span>กลุ่มสาระการเรียนรู้</span>
              </div>
              <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono">{categories.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('news')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'news' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Newspaper className="w-4 h-4" />
                <span>ข่าวประชาสัมพันธ์</span>
              </div>
              <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono">{newsList.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('videos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'videos' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Video className="w-4 h-4 text-rose-400" />
                <span>วิดีโอ YouTube</span>
              </div>
              <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono">{videos.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('documents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'documents' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4" />
                <span>เอกสารดาวน์โหลด</span>
              </div>
              <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full font-mono">{documents.length}</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                activeAdminTab === 'settings' ? 'bg-[#005BAC] text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 text-[#FFD54F]" />
              <span>สถานะฐานข้อมูลคลาวด์</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-6 border-t border-slate-800 mt-6">
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-300 transition text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-prompt text-2xl sm:text-3xl font-extrabold text-slate-900">
                  แผงควบคุมระบบ (Dashboard)
                </h1>
                <p className="text-slate-500 text-xs">
                  ภาพรวมสื่อการสอน จำนวนการใช้งาน และสถิติการดาวน์โหลด คลังสื่อการสอน โรงเรียนวัดบางโฉลงใน
                </p>
              </div>

              <button
                onClick={openAddResource}
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มสื่อการสอนใหม่</span>
              </button>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">จำนวนสื่อทั้งหมด</div>
                  <div className="text-3xl font-extrabold text-slate-900 font-prompt">{totalResources}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> +3 สื่อใหม่ในสัปดาห์นี้
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005BAC] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">จำนวนครูในระบบ</div>
                  <div className="text-3xl font-extrabold text-slate-900 font-prompt">{totalTeachers}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    ครอบคลุม 8 กลุ่มสาระฯ
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">จำนวนดาวน์โหลดรวม</div>
                  <div className="text-3xl font-extrabold text-slate-900 font-prompt">{totalDownloads.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> มีการใช้งานต่อเนื่อง
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Download className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">จำนวนผู้เข้าชมสื่อ</div>
                  <div className="text-3xl font-extrabold text-slate-900 font-prompt">{totalViews.toLocaleString()}</div>
                  <div className="text-[11px] text-blue-600 font-medium mt-1">
                    ยอดเข้าชมจากผู้เรียนและครู
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recharts Data Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Chart 1: Download & Views Monthly Trend */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="font-prompt font-bold text-slate-900 text-base mb-1">
                  สถิติการใช้งานคลังสื่อการสอน (รายเดือน)
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  เปรียบเทียบยอดการเข้าชมและยอดการดาวน์โหลดสื่อการสอน
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthTrendData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" name="ยอดเข้าชม" stroke="#005BAC" strokeWidth={3} />
                      <Line type="monotone" dataKey="downloads" name="ยอดดาวน์โหลด" stroke="#FFD54F" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Category Bar Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="font-prompt font-bold text-slate-900 text-base mb-1">
                  จำนวนสื่อแยกตามกลุ่มสาระฯ
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  สัดส่วนสื่อการสอนที่อัปโหลดในระบบ
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={90} />
                      <Tooltip />
                      <Bar dataKey="count" name="จำนวนสื่อ" fill="#005BAC" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Recent Uploaded Resources Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-prompt font-bold text-slate-900 text-base">
                  สื่อการสอนอัปโหลดล่าสุด
                </h3>
                <button 
                  onClick={() => setActiveAdminTab('resources')}
                  className="text-xs font-bold text-[#005BAC] hover:underline"
                >
                  จัดการสื่อทั้งหมด →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ชื่อสื่อการสอน</th>
                      <th className="py-3 px-4">กลุ่มสาระฯ</th>
                      <th className="py-3 px-4">ระดับชั้น</th>
                      <th className="py-3 px-4">ประเภท</th>
                      <th className="py-3 px-4">ครูผู้จัดทำ</th>
                      <th className="py-3 px-4 text-center">ดาวน์โหลด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.slice(0, 5).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{r.title}</td>
                        <td className="py-3 px-4">{r.categoryName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.gradeLevel}</td>
                        <td className="py-3 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono">{r.fileType}</span></td>
                        <td className="py-3 px-4">{r.teacherName}</td>
                        <td className="py-3 px-4 text-center font-bold text-[#005BAC]">{r.downloads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: APPROVALS MANAGER */}
        {activeAdminTab === 'approvals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-1 border border-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>ระบบอนุมัติสื่อการสอนสำหรับผู้ดูแลระบบ</span>
                </div>
                <h1 className="font-prompt text-2xl font-extrabold text-slate-900">
                  คำขออนุมัติสื่อการสอนจากคณะครู
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  ตรวจสอบและกดอนุญาตสื่อการสอนที่ส่งมาจากครูเพื่อให้แสดงบนเว็บไซต์โรงเรียน
                </p>
              </div>
            </div>

            {/* Pending Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span>รายการสื่อที่รอการอนุมัติ ({resources.filter(r => r.status === 'pending').length} รายการ)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {resources.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="font-bold text-slate-800 text-sm">ไม่มีคำขออนุมัติสื่อค้างอยู่ในระบบ</p>
                    <p className="text-xs text-slate-400 mt-1">สื่อการสอนทั้งหมดที่คณะครูส่งได้รับการอนุมัติเรียบร้อยแล้ว</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">ชื่อสื่อ / รายละเอียด</th>
                        <th className="py-3.5 px-4">กลุ่มสาระฯ</th>
                        <th className="py-3.5 px-4">ระดับชั้น</th>
                        <th className="py-3.5 px-4">ครูผู้จัดทำ</th>
                        <th className="py-3.5 px-4">ไฟล์สื่อ</th>
                        <th className="py-3.5 px-4 text-center">จัดการคำขอ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resources.filter(r => r.status === 'pending').map((r) => (
                        <tr key={r.id} className="hover:bg-amber-50/30 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{r.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{r.description}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">ส่งเมื่อ: {r.createdAt}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                              {r.categoryName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{r.gradeLevel}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              {r.teacherPhoto && (
                                <img 
                                  src={r.teacherPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200'} 
                                  alt={r.teacherName} 
                                  className="w-6 h-6 rounded-full object-cover shrink-0" 
                                />
                              )}
                              <span className="font-bold text-slate-800">{r.teacherName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-[#005BAC] hover:underline font-bold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>เปิดไฟล์ ({r.fileType})</span>
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => approveResource(r.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>อนุมัติสื่อ</span>
                              </button>
                              <button
                                onClick={() => rejectResource(r.id)}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>ไม่อนุมัติ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Approved / Rejected History Section */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="font-prompt font-bold text-slate-900 text-base">
                ประวัติสื่อการสอนที่ดำเนินการแล้ว
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">ชื่อสื่อ</th>
                        <th className="py-3 px-4">ครูผู้จัดทำ</th>
                        <th className="py-3 px-4">กลุ่มสาระฯ</th>
                        <th className="py-3 px-4">สถานะปัจจุบัน</th>
                        <th className="py-3 px-4 text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resources.filter(r => r.status !== 'pending').slice(0, 10).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{r.title}</td>
                          <td className="py-3 px-4">{r.teacherName}</td>
                          <td className="py-3 px-4">{r.categoryName}</td>
                          <td className="py-3 px-4">
                            {(!r.status || r.status === 'approved') ? (
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                อนุมัติแล้ว (แสดงบนเว็บ)
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                ไม่อนุมัติ
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {r.status === 'rejected' && (
                              <button
                                onClick={() => approveResource(r.id)}
                                className="text-emerald-700 hover:underline font-bold text-xs"
                              >
                                เปลี่ยนเป็นอนุมัติ
                              </button>
                            )}
                            {(!r.status || r.status === 'approved') && (
                              <button
                                onClick={() => rejectResource(r.id)}
                                className="text-rose-600 hover:underline font-bold text-xs"
                              >
                                ยกเลิกการอนุญาต
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RESOURCES MANAGER */}
        {activeAdminTab === 'resources' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-prompt text-2xl font-extrabold text-slate-900">
                  จัดการคลังสื่อการสอน
                </h1>
                <p className="text-slate-500 text-xs">
                  เพิ่ม แก้ไข และลบสื่อการสอน ใบงาน สไลด์บรรยาย และนวัตกรรมครู
                </p>
              </div>

              <button
                onClick={openAddResource}
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสื่อการสอนใหม่</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสื่อในตาราง..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white text-xs border border-slate-300 rounded-lg py-2 pl-8 pr-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  รวมทั้งสิ้น {resources.length} รายการ
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">รูปปก & สื่อ</th>
                      <th className="p-4">กลุ่มสาระ</th>
                      <th className="p-4">ระดับชั้น</th>
                      <th className="p-4">ประเภทไฟล์</th>
                      <th className="p-4">ผู้จัดทำ</th>
                      <th className="p-4 text-center">ดาวน์โหลด</th>
                      <th className="p-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources
                      .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={res.cover || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'} 
                                alt={res.title} 
                                className="w-12 h-12 rounded-lg object-cover shrink-0" 
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-xs line-clamp-1">{res.title}</div>
                                <div className="text-[11px] text-slate-400">{res.createdAt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">{res.categoryName}</td>
                          <td className="p-4"><span className="bg-blue-50 text-[#005BAC] font-bold px-2 py-0.5 rounded-md">{res.gradeLevel}</span></td>
                          <td className="p-4"><span className="bg-slate-100 text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded-md">{res.fileType}</span></td>
                          <td className="p-4 font-medium text-slate-800">{res.teacherName}</td>
                          <td className="p-4 text-center font-bold text-[#005BAC]">{res.downloads}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openEditResource(res)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="แก้ไข"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('คุณยืนยันที่จะลบสื่อการเรียนรู้นี้หรือไม่?')) {
                                    deleteResource(res.id);
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEACHERS MANAGER */}
        {activeAdminTab === 'teachers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-prompt text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-7 h-7 text-[#005BAC]" />
                  <span>จัดการข้อมูลคณะครู</span>
                </h1>
                <p className="text-slate-500 text-xs">
                  เพิ่ม แก้ไข จัดการข้อมูลครูผู้สอน บัญชีผู้ใช้งาน และข้อตกลงในการพัฒนางาน (PA)
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveAdminTab('pa-management')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center space-x-1.5 shrink-0 transition"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>ไปที่หน้าจัดการ PA</span>
                </button>
                <button
                  onClick={openAddTeacher}
                  className="bg-[#005BAC] hover:bg-[#004584] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 shrink-0 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มครูใหม่</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อครู, ตำแหน่ง, ประเด็นท้าทาย PA..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={teacherSubjectFilter}
                  onChange={(e) => setTeacherSubjectFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-hidden"
                >
                  <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={teacherPaFilter}
                  onChange={(e) => setTeacherPaFilter(e.target.value as 'all' | 'completed' | 'pending')}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-hidden"
                >
                  <option value="all">สถานะ PA ทั้งหมด</option>
                  <option value="completed">จัดทำ PA เรียบร้อย</option>
                  <option value="pending">ยังไม่จัดทำ PA</option>
                </select>
              </div>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers
                .filter((t) => {
                  const isCompleted = t.paStatus === 'completed' || (Boolean(t.paChallengeTitle) && Boolean(t.paVideoUrl));
                  if (teacherPaFilter === 'completed' && !isCompleted) return false;
                  if (teacherPaFilter === 'pending' && isCompleted) return false;
                  if (teacherSubjectFilter !== 'all' && t.subjectName !== teacherSubjectFilter) return false;
                  if (!teacherSearch.trim()) return true;
                  const q = teacherSearch.toLowerCase();
                  return (
                    t.name.toLowerCase().includes(q) ||
                    (t.academicStanding || '').toLowerCase().includes(q) ||
                    (t.position || '').toLowerCase().includes(q) ||
                    (t.subjectName || '').toLowerCase().includes(q) ||
                    (t.paChallengeTitle || '').toLowerCase().includes(q)
                  );
                })
                .map((t) => {
                  const isCompleted = t.paStatus === 'completed' || (Boolean(t.paChallengeTitle) && Boolean(t.paVideoUrl));
                  return (
                    <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:shadow-md transition">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400'} 
                          alt={t.name} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{t.name}</h3>
                          <div className="flex flex-wrap gap-1 my-0.5">
                            <span className="text-[10px] font-bold text-[#005BAC] bg-blue-50 px-2 py-0.5 rounded-md">
                              {t.academicStanding || t.position || 'ครู'}
                            </span>
                            {t.position && t.position !== t.academicStanding && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {t.position}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">{t.subjectName}</span>
                        </div>
                      </div>

                      {/* PA Details Box */}
                      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-[11px]">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>ข้อตกลง PA ปี {t.paYear || '2569'}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>จัดทำเรียบร้อย</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>ยังไม่จัดทำ</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* PA Challenge Title */}
                        <div>
                          <div className="text-[10px] font-semibold text-slate-500">ชื่อประเด็นท้าทาย:</div>
                          <div className="text-slate-800 font-medium text-[11px] line-clamp-2 mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                            {t.paChallengeTitle ? (
                              <span className="text-slate-900">{t.paChallengeTitle}</span>
                            ) : (
                              <span className="text-slate-400 italic">(ยังไม่ได้ระบุประเด็นท้าทาย)</span>
                            )}
                          </div>
                        </div>

                        {/* Video & Document links */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {t.paVideoUrl ? (
                            <a
                              href={t.paVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100 transition"
                            >
                              <Video className="w-3 h-3 mr-1 text-rose-600" />
                              <span>ดูคลิปวิดีโอ PA</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-1" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center text-[10px] text-slate-400 bg-slate-200/60 px-2 py-1 rounded-lg">
                              ไม่มีคลิปวิดีโอ PA
                            </span>
                          )}

                          {t.paDocumentUrl ? (
                            <a
                              href={t.paDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-[10px] font-bold text-[#005BAC] bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition"
                            >
                              <FileText className="w-3 h-3 mr-1 text-[#005BAC]" />
                              <span>ดูไฟล์เอกสาร PA</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-1" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center text-[10px] text-slate-400 bg-slate-200/60 px-2 py-1 rounded-lg">
                              ไม่มีไฟล์เอกสาร PA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className="font-bold text-[#005BAC] text-[11px]">{t.resourcesCount || 0} สื่อการสอน</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => openEditTeacher(t)}
                            className="px-2.5 py-1.5 bg-[#005BAC]/10 hover:bg-[#005BAC]/20 text-[#005BAC] rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                            title="แก้ไขข้อมูลครูและข้อตกลง PA"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>

                          {(t.paChallengeTitle || t.paVideoUrl || t.paDocumentUrl || t.paStatus === 'completed') && (
                            <button
                              onClick={() => handleResetTeacherPa(t.id, t.name)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center transition"
                              title="ล้าง/ลบเฉพาะข้อตกลง PA ของครูท่านนี้"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`คุณยืนยันที่จะลบข้อมูลครู "${t.name}" หรือไม่?`)) {
                                deleteTeacher(t.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition"
                            title="ลบข้อมูลครู"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3.5: PA MANAGEMENT DASHBOARD */}
        {activeAdminTab === 'pa-management' && (() => {
          // Dynamic Set grouping
          const committeeSets = (() => {
            const setMap = new Map<number, { setNumber: number; setName: string; targetDescription: string; members: PaCommitteeMember[] }>();
            paCommitteeMembers.forEach(m => {
              const setNum = m.setNumber || 1;
              if (!setMap.has(setNum)) {
                setMap.set(setNum, {
                  setNumber: setNum,
                  setName: m.setName || `ชุดที่ ${setNum}: คณะกรรมการประเมินชุดที่ ${setNum}`,
                  targetDescription: m.targetDescription || 'ผู้รับการประเมินตามเกณฑ์',
                  members: []
                });
              }
              setMap.get(setNum)!.members.push(m);
            });
            return Array.from(setMap.values()).sort((a, b) => a.setNumber - b.setNumber);
          })();

          // Filter teachers based on active set and search/filter
          const paFilteredTeachers = teachers.filter((t) => {
            if (selectedSetFilter > 0) {
              const teacherSet = getTeacherCommitteeSetNumber(t);
              if (teacherSet !== selectedSetFilter) return false;
            }
            const isCompleted = t.paStatus === 'completed' || (Boolean(t.paChallengeTitle) && Boolean(t.paVideoUrl));
            if (teacherPaFilter === 'completed' && !isCompleted) return false;
            if (teacherPaFilter === 'pending' && isCompleted) return false;
            if (teacherSubjectFilter !== 'all' && t.subjectName !== teacherSubjectFilter) return false;
            if (!teacherSearch.trim()) return true;
            const q = teacherSearch.toLowerCase();
            return (
              t.name.toLowerCase().includes(q) ||
              (t.academicStanding || '').toLowerCase().includes(q) ||
              (t.position || '').toLowerCase().includes(q) ||
              (t.subjectName || '').toLowerCase().includes(q) ||
              (t.paChallengeTitle || '').toLowerCase().includes(q)
            );
          });

          // Compute consensus stats for filtered teachers
          let fullyEvaluatedCount = 0;
          let highVarianceCount = 0;
          let partialEvaluatedCount = 0;

          paFilteredTeachers.forEach(t => {
            const consensus = getTeacherConsensus(t.id);
            if (consensus.isFullyEvaluated) {
              fullyEvaluatedCount++;
              if (consensus.isHighVariance) {
                highVarianceCount++;
              }
            } else if (consensus.evaluationsCount > 0) {
              partialEvaluatedCount++;
            }
          });

          // Helper to open Add Committee Modal
          const openAddCommitteeModal = (setNum?: number) => {
            const targetSet = setNum || (selectedSetFilter > 0 ? selectedSetFilter : 1);
            const existingInSet = paCommitteeMembers.filter(m => (m.setNumber || 1) === targetSet);
            const nextOrder = existingInSet.length + 1;
            const existingSet = committeeSets.find(s => s.setNumber === targetSet);

            setEditingCommitteeMember(null);
            setCommitteeFormData({
              id: '',
              name: '',
              role: nextOrder === 1 ? 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)' : `กรรมการผู้ทรงคุณวุฒิท่านที่ ${nextOrder}`,
              position: 'ข้าราชการครูและบุคลากรทางการศึกษา',
              code: `bch${paCommitteeMembers.length + 1}`,
              setNumber: targetSet,
              setName: existingSet?.setName || `ชุดที่ ${targetSet}: คณะกรรมการประเมินชุดที่ ${targetSet}`,
              targetDescription: existingSet?.targetDescription || 'ผู้รับการประเมินตามคำสั่งโรงเรียน',
              order: nextOrder,
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
              phone: '',
              email: ''
            });
            setIsCommitteeMemberModalOpen(true);
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Award className="w-6 h-6" />
                    </span>
                    <h1 className="font-prompt text-2xl font-black text-slate-900">
                      ศูนย์จัดการระบบประเมิน ว.PA และฉันทามติ
                    </h1>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    ระบบบริหารจัดการคณะกรรมการประเมินแบบหลายชุด (Dynamic Sets), ตรวจสอบคะแนนส่วนต่าง (Variance Consistency Check) และตรวจทานมติฉันทามติ
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => openAddCommitteeModal()}
                    className="bg-[#005BAC] hover:bg-[#004584] text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มกรรมการ / เพิ่มชุดใหม่</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pa-committee')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center space-x-1.5 transition"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>ระบบตรวจกรรมการ (Portal)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaSubTab('consensus-matrix')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                    paSubTab === 'consensus-matrix'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>มติฉันทามติ & ตรวจสอบคะแนนส่วนต่าง (Consensus Matrix)</span>
                  {highVarianceCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                      {highVarianceCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaSubTab('committee-sets')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                    paSubTab === 'committee-sets'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#005BAC]" />
                  <span>โครงสร้างชุดคณะกรรมการ PA ({paCommitteeMembers.length} ท่าน / {committeeSets.length} ชุด)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaSubTab('overview')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                    paSubTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>รายชื่อและสถานะเอกสาร/คลิป PA ทั้งหมด ({teachers.length} ท่าน)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaSubTab('export-csv')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                    paSubTab === 'export-csv'
                      ? 'bg-[#005BAC] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <FileSpreadsheet className={`w-4 h-4 ${paSubTab === 'export-csv' ? 'text-amber-300' : 'text-emerald-600'}`} />
                  <span>ส่งออกข้อมูล ว.PA (Export CSV)</span>
                </button>
              </div>

              {/* Set Filter Pill Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-slate-500" />
                      <span>เลือกชุดกรรมการ:</span>
                    </span>
                  </div>

                  {/* Variance Threshold setting */}
                  {paSubTab === 'consensus-matrix' && (
                    <div className="flex items-center gap-2.5 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl text-xs">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-bold text-amber-900">เกณฑ์เตือนคะแนนส่วนต่าง (Variance Threshold):</span>
                      <div className="flex items-center gap-1">
                        {[5, 10, 15, 20].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setVarianceThreshold(val)}
                            className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold transition ${
                              varianceThreshold === val
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            ±{val}
                          </button>
                        ))}
                        <span className="text-amber-800 text-[11px] font-medium ml-1">คะแนน</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSetFilter(0)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                      selectedSetFilter === 0
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>ทุกชุดกรรมการ</span>
                    <span className="text-[10px] opacity-80 font-mono">({teachers.length} ครู)</span>
                  </button>

                  {committeeSets.map((s) => {
                    const setTeachersCount = teachers.filter(t => getTeacherCommitteeSetNumber(t) === s.setNumber).length;
                    return (
                      <button
                        key={s.setNumber}
                        type="button"
                        onClick={() => setSelectedSetFilter(s.setNumber)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                          selectedSetFilter === s.setNumber
                            ? 'bg-[#005BAC] text-white shadow-2xs'
                            : 'bg-blue-50 text-[#005BAC] hover:bg-blue-100 border border-blue-200/60'
                        }`}
                      >
                        <span>ชุดที่ {s.setNumber}</span>
                        <span className="text-[10px] opacity-90 truncate max-w-[140px]">
                          ({s.setName.replace(`ชุดที่ ${s.setNumber}: `, '')})
                        </span>
                        <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-mono">
                          {setTeachersCount} ครู
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VIEW 1: CONSENSUS & SCORE VARIANCE MATRIX */}
              {paSubTab === 'consensus-matrix' && (
                <div className="space-y-6">
                  {/* KPI Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="text-slate-400 text-xs font-semibold">ครูในชุดที่เลือก</div>
                      <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{paFilteredTeachers.length}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">ผู้รับการประเมิน ว.PA</div>
                    </div>

                    <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                      <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ตรวจครบทุกกรรมการ</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                        {fullyEvaluatedCount}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                        {paFilteredTeachers.length > 0 ? Math.round((fullyEvaluatedCount / paFilteredTeachers.length) * 100) : 0}% ของครูที่เลือก
                      </div>
                    </div>

                    <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 shadow-2xs">
                      <div className="text-rose-700 text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>พบส่วนต่างคะแนนสูง</span>
                      </div>
                      <div className="text-2xl font-black text-rose-800 mt-1 font-mono">
                        {highVarianceCount}
                      </div>
                      <div className="text-[11px] text-rose-600 font-bold mt-0.5">
                        ส่วนต่าง &gt; {varianceThreshold} คะแนน (ต้องพิจารณา)
                      </div>
                    </div>

                    <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200 shadow-2xs">
                      <div className="text-sky-700 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>อยู่ระหว่างตรวจ</span>
                      </div>
                      <div className="text-2xl font-black text-sky-800 mt-1 font-mono">
                        {partialEvaluatedCount}
                      </div>
                      <div className="text-[11px] text-sky-600 mt-0.5">
                        มีกรรมการตรวจแล้วบางท่าน
                      </div>
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <h3 className="font-prompt font-bold text-slate-900 text-base flex items-center gap-2">
                          <span>ตารางสรุปฉันทามติและคะแนนเปรียบเทียบ (Consensus Score Matrix)</span>
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-normal">
                            แสดง {paFilteredTeachers.length} รายชื่อ
                          </span>
                        </h3>
                        <p className="text-slate-500 text-xs">
                          ระบบจะตรวจสอบความสอดคล้องของคะแนนกรรมการทุกคน หากคะแนนห่างกันเกิน ±{varianceThreshold} คะแนน จะขึ้นแถบเตือนสีแดง/ส้ม
                        </p>
                      </div>

                      <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อครู, กลุ่มสาระ..."
                          value={teacherSearch}
                          onChange={(e) => setTeacherSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                            <th className="p-4 w-12 text-center">ลำดับ</th>
                            <th className="p-4">ผู้รับการประเมิน (ครู)</th>
                            <th className="p-4">กลุ่มสาระ / วิทยฐานะ</th>
                            <th className="p-4 min-w-[280px]">ผลการตรวจรายกรรมการ (คะแนน & สื่อ)</th>
                            <th className="p-4 text-center">คะแนนเฉลี่ย</th>
                            <th className="p-4 text-center">ส่วนต่าง (Max-Min)</th>
                            <th className="p-4 text-center">สถานะฉันทามติ</th>
                            <th className="p-4 text-center">การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paFilteredTeachers.map((t, idx) => {
                            const consensus = getTeacherConsensus(t.id);
                            const assignedMembers = paCommitteeMembers.filter(m => isTeacherAssignedToCommittee(t, m));

                            return (
                              <tr 
                                key={t.id} 
                                className={`transition ${
                                  consensus.isHighVariance 
                                    ? 'bg-rose-50/40 hover:bg-rose-50/70' 
                                    : 'hover:bg-slate-50/80'
                                }`}
                              >
                                <td className="p-4 text-center font-mono text-slate-400 font-bold">
                                  {idx + 1}
                                </td>

                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400'} 
                                      alt={t.name} 
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                                    />
                                    <div>
                                      <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                                      <div className="text-[10px] text-slate-500">{t.position}</div>
                                      {t.paChallengeTitle && (
                                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px] mt-0.5" title={t.paChallengeTitle}>
                                          📌 {t.paChallengeTitle}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4">
                                  <span className="font-semibold text-slate-800 block text-xs">{t.subjectName}</span>
                                  <span className="inline-block bg-blue-50 text-[#005BAC] text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5">
                                    {t.academicStanding || t.position || 'ครู'}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <div className="space-y-1.5">
                                    {assignedMembers.map((member) => {
                                      const evalRec = paEvaluations.find(e => e.teacherId === t.id && e.committeeId === member.id);
                                      const hasEvaluated = evalRec && (evalRec.overallScore !== undefined || evalRec.docChecked || evalRec.videoChecked);

                                      return (
                                        <div 
                                          key={member.id}
                                          className="flex items-center justify-between bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-[11px] shadow-2xs"
                                        >
                                          <div className="flex items-center space-x-1.5 truncate max-w-[160px]">
                                            <span className="text-[9px] font-extrabold bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-mono">
                                              #{member.order}
                                            </span>
                                            <span className="font-medium text-slate-800 truncate" title={member.name}>
                                              {member.name.replace('นาย', '').replace('นางสาว', '').replace('นาง', '')}
                                            </span>
                                          </div>

                                          <div className="flex items-center space-x-2 shrink-0">
                                            {/* Media check badges */}
                                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                                              evalRec?.docChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                                            }`} title="สถานะตรวจเอกสาร">
                                              📄 {evalRec?.docChecked ? '✓' : '-'}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                                              evalRec?.videoChecked ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-400'
                                            }`} title="สถานะตรวจคลิปวิดีโอ">
                                              🎥 {evalRec?.videoChecked ? '✓' : '-'}
                                            </span>

                                            {/* Score */}
                                            {evalRec?.overallScore !== undefined ? (
                                              <span className="font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                                                {evalRec.overallScore}/100
                                              </span>
                                            ) : (
                                              <span className="text-slate-400 text-[10px] italic">
                                                รอตรวจ
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>

                                <td className="p-4 text-center">
                                  {consensus.averageScore !== null ? (
                                    <div className="inline-block bg-slate-900 text-white font-mono font-black text-sm px-2.5 py-1 rounded-xl shadow-2xs">
                                      {consensus.averageScore.toFixed(1)}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-mono">-</span>
                                  )}
                                </td>

                                <td className="p-4 text-center">
                                  {consensus.scoreRange !== null ? (
                                    <div className={`inline-flex items-center space-x-1 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border ${
                                      consensus.isHighVariance
                                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {consensus.isHighVariance && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                                      <span>±{consensus.scoreRange}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-mono">-</span>
                                  )}
                                </td>

                                <td className="p-4 text-center">
                                  {consensus.isFullyEvaluated ? (
                                    consensus.isHighVariance ? (
                                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        <span>คะแนนต่างสูง</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>มติสอดคล้อง ({consensus.evaluationsCount}/{consensus.totalAssignedMembers})</span>
                                      </span>
                                    )
                                  ) : consensus.evaluationsCount > 0 ? (
                                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                                      <Clock className="w-3 h-3 text-sky-600" />
                                      <span>ตรวจ {consensus.evaluationsCount}/{consensus.totalAssignedMembers} ท่าน</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] italic">
                                      ยังไม่ได้รับการตรวจ
                                    </span>
                                  )}
                                </td>

                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setInspectConsensusTeacher(t)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center space-x-1 transition shadow-2xs"
                                      title="ดูเปรียบเทียบผลการตรวจและข้อคิดเห็นของกรรมการทุกท่าน"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-[#005BAC]" />
                                      <span>ดูความเห็น</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: COMMITTEE SETS MANAGEMENT */}
              {paSubTab === 'committee-sets' && (
                <div className="space-y-6">
                  {committeeSets
                    .filter(s => selectedSetFilter === 0 || s.setNumber === selectedSetFilter)
                    .map((s) => {
                      const setTeachers = teachers.filter(t => getTeacherCommitteeSetNumber(t) === s.setNumber);

                      return (
                        <div key={s.setNumber} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-[#005BAC] text-white text-xs font-black px-2.5 py-0.5 rounded-lg">
                                  ชุดที่ {s.setNumber}
                                </span>
                                <h3 className="font-prompt font-bold text-slate-900 text-base">
                                  {s.setName}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                🎯 <strong>กลุ่มเป้าหมายผู้รับการประเมิน:</strong> {s.targetDescription} ({setTeachers.length} ท่าน)
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => openAddCommitteeModal(s.setNumber)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>เพิ่มกรรมการในชุดที่ {s.setNumber}</span>
                            </button>
                          </div>

                          {/* Committee Members in this Set */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {s.members.map((member) => {
                              const progress = getCommitteeProgress(member.id);
                              return (
                                <div
                                  key={member.id}
                                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between space-y-3"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-3">
                                        <img
                                          src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'}
                                          alt={member.name}
                                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                                        />
                                        <div>
                                          <span className="text-[10px] font-extrabold bg-[#005BAC] text-white px-2 py-0.5 rounded-md">
                                            กรรมการท่านที่ {member.order}
                                          </span>
                                          <h4 className="font-bold text-sm text-slate-900 leading-snug mt-1">
                                            {member.name}
                                          </h4>
                                          <p className="text-[11px] text-slate-500 font-medium">
                                            {member.role}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Secret Code Card */}
                                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                      <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">รหัสประจำตัวกรรมการ:</span>
                                        <span className="font-mono font-extrabold text-emerald-700 text-sm tracking-wider">
                                          {member.code}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(member.code);
                                          alert(`คัดลอกรหัส "${member.code}" สำหรับ ${member.name} เรียบร้อยแล้ว`);
                                        }}
                                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                                        title="คัดลอกรหัส"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Progress Stats */}
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium">ความคืบหน้าการตรวจ</span>
                                        <span className="font-bold text-slate-800">{progress.percentage}%</span>
                                      </div>
                                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                          style={{ width: `${progress.percentage}%` }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                                        <span>📄 เอกสาร: {progress.docCheckedCount}/{progress.totalTeachers}</span>
                                        <span>🎥 คลิป: {progress.videoCheckedCount}/{progress.totalTeachers}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="pt-2 border-t border-slate-200/60 flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommitteeMember(member);
                                        setCommitteeFormData({
                                          id: member.id,
                                          name: member.name,
                                          role: member.role,
                                          position: member.position || '',
                                          code: member.code,
                                          setNumber: member.setNumber || s.setNumber,
                                          setName: member.setName || s.setName,
                                          targetDescription: member.targetDescription || s.targetDescription,
                                          order: member.order,
                                          avatar: member.avatar,
                                          phone: member.phone || '',
                                          email: member.email || ''
                                        });
                                        setIsCommitteeMemberModalOpen(true);
                                      }}
                                      className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-2xs"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-[#005BAC]" />
                                      <span>แก้ไขรหัส/ข้อมูล</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm(`คุณยืนยันที่จะลบกรรมการ "${member.name}" จากชุดที่ ${member.setNumber || s.setNumber} หรือไม่?`)) {
                                          try {
                                            await deleteCommitteeMember(member.id);
                                          } catch (err: any) {
                                            alert('เกิดข้อผิดพลาดในการลบกรรมการ: ' + (err?.message || 'โปรดลองใหม่'));
                                          }
                                        }
                                      }}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition"
                                      title="ลบกรรมการท่านนี้"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* VIEW 3: TEACHER PA MEDIA & RAW OVERVIEW */}
              {paSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* PA Statistics Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="text-slate-400 text-xs font-semibold">ครูทั้งหมด</div>
                      <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{teachers.length}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">คณะครูในระบบ</div>
                    </div>

                    <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                      <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>จัดทำ PA เรียบร้อย</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                        {teachers.filter(t => t.paStatus === 'completed' || (t.paChallengeTitle && t.paVideoUrl)).length}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                        {teachers.length > 0 
                          ? Math.round((teachers.filter(t => t.paStatus === 'completed' || (t.paChallengeTitle && t.paVideoUrl)).length / teachers.length) * 100) 
                          : 0}% ของครูทั้งหมด
                      </div>
                    </div>

                    <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs">
                      <div className="text-amber-700 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ยังไม่จัดทำ PA</span>
                      </div>
                      <div className="text-2xl font-black text-amber-800 mt-1 font-mono">
                        {teachers.filter(t => t.paStatus !== 'completed' && (!t.paChallengeTitle || !t.paVideoUrl)).length}
                      </div>
                      <div className="text-[11px] text-amber-600 mt-0.5">รอส่งประเด็นท้าทาย/วิดีโอ</div>
                    </div>

                    <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 shadow-2xs">
                      <div className="text-rose-700 text-xs font-semibold flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />
                        <span>มีคลิปวิดีโอ PA</span>
                      </div>
                      <div className="text-2xl font-black text-rose-800 mt-1 font-mono">
                        {teachers.filter(t => Boolean(t.paVideoUrl)).length}
                      </div>
                      <div className="text-[11px] text-rose-600 mt-0.5">คลิปการสอน/ประเด็นท้าทาย</div>
                    </div>

                    <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 shadow-2xs col-span-2 sm:col-span-1">
                      <div className="text-[#005BAC] text-xs font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>มีเอกสาร PA (PDF)</span>
                      </div>
                      <div className="text-2xl font-black text-[#003875] mt-1 font-mono">
                        {teachers.filter(t => Boolean(t.paDocumentUrl)).length}
                      </div>
                      <div className="text-[11px] text-[#005BAC] mt-0.5">ไฟล์ข้อตกลง / SAR</div>
                    </div>
                  </div>

                  {/* Filters & Search */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อครู, ประเด็นท้าทาย PA, กลุ่มสาระ..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <select
                        value={teacherSubjectFilter}
                        onChange={(e) => setTeacherSubjectFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-hidden"
                      >
                        <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>

                      <select
                        value={teacherPaFilter}
                        onChange={(e) => setTeacherPaFilter(e.target.value as 'all' | 'completed' | 'pending')}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-hidden"
                      >
                        <option value="all">สถานะ PA ทั้งหมด</option>
                        <option value="completed">เฉพาะจัดทำ PA เรียบร้อย</option>
                        <option value="pending">เฉพาะยังไม่จัดทำ PA</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const csv = generatePaCsvContent(paFilteredTeachers, paCommitteeMembers, paEvaluations);
                          const fileName = `PA_รายชื่อที่กรอง_${new Date().toISOString().slice(0, 10)}.csv`;
                          downloadCsvBlob(csv, fileName);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                        title="ดาวน์โหลดไฟล์ CSV ตามที่กรองไว้"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV ({paFilteredTeachers.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                            <th className="p-4">ครูผู้จัดทำ PA</th>
                            <th className="p-4">กลุ่มสาระ / วิทยฐานะ</th>
                            <th className="p-4">ชื่อประเด็นท้าทาย (PA Challenge)</th>
                            <th className="p-4 text-center">สถานะ PA</th>
                            <th className="p-4 text-center">สื่อ PA (วิดีโอ/ไฟล์)</th>
                            <th className="p-4 text-center">การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paFilteredTeachers.map((t) => {
                            const isCompleted = t.paStatus === 'completed' || (Boolean(t.paChallengeTitle) && Boolean(t.paVideoUrl));
                            return (
                              <tr key={t.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400'} 
                                      alt={t.name} 
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                                    />
                                    <div>
                                      <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                                      <div className="text-[10px] text-slate-500">{t.position}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-slate-800 block text-xs">{t.subjectName}</span>
                                  <span className="inline-block bg-blue-50 text-[#005BAC] text-[10px] font-bold px-2 py-0.5 rounded-md mt-0.5">
                                    {t.academicStanding || t.position || 'ครู'}
                                  </span>
                                </td>
                                <td className="p-4 max-w-xs">
                                  {t.paChallengeTitle ? (
                                    <div>
                                      <div className="font-semibold text-slate-900 text-xs line-clamp-2 leading-relaxed">
                                        {t.paChallengeTitle}
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">ปีงบประมาณ/การศึกษา {t.paYear || '2569'}</div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">(ยังไม่ระบุประเด็นท้าทาย)</span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                    isCompleted 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}>
                                    {isCompleted ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>จัดทำเรียบร้อย</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3 h-3 text-amber-600" />
                                        <span>ยังไม่จัดทำ</span>
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {t.paVideoUrl ? (
                                      <a
                                        href={t.paVideoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold inline-flex items-center space-x-1 transition"
                                        title="เปิดดูคลิปวิดีโอ PA"
                                      >
                                        <Video className="w-3.5 h-3.5 text-rose-600" />
                                        <span>วิดีโอ</span>
                                      </a>
                                    ) : (
                                      <span className="text-slate-300 text-[10px] font-mono">-</span>
                                    )}

                                    {t.paDocumentUrl ? (
                                      <a
                                        href={t.paDocumentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#005BAC] border border-blue-200 rounded-lg text-[10px] font-bold inline-flex items-center space-x-1 transition"
                                        title="เปิดดูเอกสาร PA"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-[#005BAC]" />
                                        <span>เอกสาร</span>
                                      </a>
                                    ) : (
                                      <span className="text-slate-300 text-[10px] font-mono">-</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center space-x-1.5">
                                    <button
                                      onClick={() => openEditTeacher(t)}
                                      className="px-2.5 py-1.5 bg-[#005BAC] hover:bg-[#004584] text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition shadow-2xs"
                                      title="แก้ไขข้อมูล PA และครู"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      <span>แก้ไข PA</span>
                                    </button>

                                    {(t.paChallengeTitle || t.paVideoUrl || t.paDocumentUrl || t.paStatus === 'completed') && (
                                      <button
                                        onClick={() => handleResetTeacherPa(t.id, t.name)}
                                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-lg text-xs font-bold inline-flex items-center transition"
                                        title="ล้าง / ลบข้อตกลง PA ของครูท่านนี้"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        if (window.confirm(`คุณยืนยันที่จะลบข้อมูลครู "${t.name}" หรือไม่?`)) {
                                          deleteTeacher(t.id);
                                        }
                                      }}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition"
                                      title="ลบข้อมูลครู"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4: EXPORT CSV FOR ADMIN */}
              {paSubTab === 'export-csv' && (() => {
                // Determine distinct standings via Single Source of Truth
                const allAvailableStandings = [...STANDARD_ACADEMIC_CATEGORIES];

                // Filter for custom export preview
                const customFilteredTeachers = filterTeachersForExport(teachers, {
                  year: exportYearFilter,
                  academicStanding: exportStandingFilter,
                  categoryId: exportCategoryFilter,
                  paStatus: exportPaStatusFilter
                });

                const totalCompleted = teachers.filter(t => t.paStatus === 'completed' || Boolean(t.paChallengeTitle && t.paVideoUrl)).length;

                return (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-[#003875] via-[#005BAC] to-[#0A74DA] text-white p-6 sm:p-7 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="relative z-10 space-y-1">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-6 h-6 text-amber-300" />
                          <h2 className="text-xl font-black">ศูนย์ส่งออกข้อมูลข้อตกลงในการพัฒนางาน (ว.PA Export CSV)</h2>
                        </div>
                        <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                          รองรับการเปิดใน Microsoft Excel, Google Sheets และ LibreOffice โดยสมบูรณ์ เข้ารหัสภาษาไทยแบบ UTF-8 with BOM ไม่เป็นภาษาต่างดาว พร้อมคัดแยกคะแนนกรรมการ 3 ท่าน และลิงก์จริงของวิดีโอและเอกสาร
                        </p>
                      </div>

                      <div className="relative z-10 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const csv = generatePaCsvContent(teachers, paCommitteeMembers, paEvaluations);
                            const fileName = `PA_ทั้งโรงเรียน_${exportYearFilter || '2569'}_${new Date().toISOString().slice(0, 10)}.csv`;
                            downloadCsvBlob(csv, fileName);
                            setExportNotification(`ส่งออกข้อมูล PA ทั้งโรงเรียน (${teachers.length} ท่าน) สำเร็จแล้ว`);
                            setTimeout(() => setExportNotification(null), 4000);
                          }}
                          className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-[#003875] font-black text-xs rounded-2xl transition shadow-md flex items-center space-x-2"
                        >
                          <DownloadCloud className="w-4 h-4" />
                          <span>ดาวน์โหลดทั้งโรงเรียนทันที ({teachers.length} ท่าน)</span>
                        </button>
                      </div>
                    </div>

                    {/* Export Notification Toast */}
                    {exportNotification && (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
                        <div className="flex items-center space-x-2 font-bold">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>{exportNotification}</span>
                        </div>
                        <span className="text-[11px] text-emerald-600">ไฟล์ CSV พร้อมเปิดใช้งานใน Excel / Sheets</span>
                      </div>
                    )}

                    {/* SECTION 1: EXPORT ALL & STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold mb-1">
                            <Users className="w-4 h-4 text-[#005BAC]" />
                            <span>1. ส่งออกข้อมูลทั้งโรงเรียน</span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900">คณะครูทั้งหมดในระบบ</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            ส่งออกข้อมูลครูทุกท่าน ทุกวิทยฐานะ และทุกกลุ่มสาระการเรียนรู้ รวม {teachers.length} ท่าน (จัดทำแล้ว {totalCompleted} ท่าน)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const csv = generatePaCsvContent(teachers, paCommitteeMembers, paEvaluations);
                            const fileName = `PA_ทั้งโรงเรียน_${exportYearFilter || '2569'}_${new Date().toISOString().slice(0, 10)}.csv`;
                            downloadCsvBlob(csv, fileName);
                            setExportNotification(`ส่งออกข้อมูล PA ทั้งโรงเรียน (${teachers.length} ท่าน) สำเร็จแล้ว`);
                            setTimeout(() => setExportNotification(null), 4000);
                          }}
                          className="w-full py-2.5 px-4 bg-[#005BAC] hover:bg-[#004584] text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-2xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>ดาวน์โหลด CSV ทั้งโรงเรียน ({teachers.length} ท่าน)</span>
                        </button>
                      </div>

                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold mb-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>เฉพาะที่จัดทำแล้ว</span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900">ครูที่ส่งประเด็นท้าทาย & คลิป</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            ส่งออกเฉพาะครูที่มีความพร้อมในการประเมิน ({totalCompleted} ท่าน จาก {teachers.length} ท่าน)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const completedTeachers = teachers.filter(t => t.paStatus === 'completed' || Boolean(t.paChallengeTitle && t.paVideoUrl));
                            if (completedTeachers.length === 0) {
                              alert('ยังไม่มีข้อมูลครูที่จัดทำ PA เรียบร้อย');
                              return;
                            }
                            const csv = generatePaCsvContent(completedTeachers, paCommitteeMembers, paEvaluations);
                            const fileName = `PA_เฉพาะที่จัดทำแล้ว_${exportYearFilter || '2569'}_${new Date().toISOString().slice(0, 10)}.csv`;
                            downloadCsvBlob(csv, fileName);
                            setExportNotification(`ส่งออกข้อมูลครูที่จัดทำแล้ว (${completedTeachers.length} ท่าน) สำเร็จแล้ว`);
                            setTimeout(() => setExportNotification(null), 4000);
                          }}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-2xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>ดาวน์โหลดเฉพาะที่จัดทำแล้ว ({totalCompleted} ท่าน)</span>
                        </button>
                      </div>

                      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold mb-1">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>เฉพาะที่ยังไม่จัดทำ</span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900">ครูที่รอติดตามการส่ง PA</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            ส่งออกรายชื่อครูที่ยังไม่กรอกประเด็นท้าทายหรือคลิป เพื่อใช้ในการติดตาม ({teachers.length - totalCompleted} ท่าน)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const pendingTeachers = teachers.filter(t => t.paStatus !== 'completed' && (!t.paChallengeTitle || !t.paVideoUrl));
                            if (pendingTeachers.length === 0) {
                              alert('ครูทุกท่านจัดทำ PA เรียบร้อยแล้ว');
                              return;
                            }
                            const csv = generatePaCsvContent(pendingTeachers, paCommitteeMembers, paEvaluations);
                            const fileName = `PA_รายชื่อรอติดตาม_${exportYearFilter || '2569'}_${new Date().toISOString().slice(0, 10)}.csv`;
                            downloadCsvBlob(csv, fileName);
                            setExportNotification(`ส่งออกรายชื่อรอติดตาม (${pendingTeachers.length} ท่าน) สำเร็จแล้ว`);
                            setTimeout(() => setExportNotification(null), 4000);
                          }}
                          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-2xs"
                        >
                          <Download className="w-4 h-4" />
                          <span>ดาวน์โหลดรายชื่อรอติดตาม ({teachers.length - totalCompleted} ท่าน)</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION 2: EXPORT BY ACADEMIC STANDING */}
                    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-5 h-5 text-[#005BAC]" />
                            <h3 className="text-base font-extrabold text-slate-900">
                              2. ส่งออกแยกตามวิทยฐานะ (Export by Academic Standing)
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            คลิกเพื่อดาวน์โหลดไฟล์ CSV แยกแต่ละกลุ่มวิทยฐานะตามเกณฑ์ ว.PA ก.ค.ศ.
                          </p>
                        </div>

                        {/* Batch Download Button */}
                        <button
                          type="button"
                          onClick={() => {
                            let exportedCount = 0;
                            allAvailableStandings.forEach((standing, index) => {
                              const groupTeachers = teachers.filter(t => getTeacherAcademicCategory(t) === standing);
                              if (groupTeachers.length > 0) {
                                exportedCount++;
                                setTimeout(() => {
                                  const csv = generatePaCsvContent(groupTeachers, paCommitteeMembers, paEvaluations);
                                  const safeName = sanitizeFileName(standing);
                                  const fileName = `PA_วิทยฐานะ_${safeName}_${exportYearFilter || '2569'}.csv`;
                                  downloadCsvBlob(csv, fileName);
                                }, index * 300); // Stagger downloads slightly
                              }
                            });
                            setExportNotification(`กำลังดาวน์โหลดไฟล์แยกตามวิทยฐานะจำนวน ${exportedCount} ไฟล์`);
                            setTimeout(() => setExportNotification(null), 5000);
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>📦 ดาวน์โหลดทุกวิทยฐานะแยกไฟล์อัตโนมัติ</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allAvailableStandings.map((standing) => {
                          const groupTeachers = teachers.filter(t => getTeacherAcademicCategory(t) === standing);
                          const count = groupTeachers.length;
                          const submittedCount = groupTeachers.filter(t => t.paStatus === 'completed' || Boolean(t.paChallengeTitle && t.paVideoUrl)).length;

                          return (
                            <div
                              key={standing}
                              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                                count > 0 
                                  ? 'bg-slate-50/70 border-slate-200 hover:border-blue-300' 
                                  : 'bg-slate-50/30 border-dashed border-slate-200 opacity-60'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-extrabold text-sm text-slate-900">{standing}</span>
                                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                    count > 0 ? 'bg-blue-100 text-[#005BAC]' : 'bg-slate-200 text-slate-500'
                                  }`}>
                                    {count} ท่าน
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {count > 0 ? `จัดทำ PA แล้ว ${submittedCount}/${count} ท่าน` : 'ยังไม่มีครูในวิทยฐานะนี้'}
                                </div>
                              </div>

                              <div className="pt-3 mt-3 border-t border-slate-200/60">
                                <button
                                  type="button"
                                  disabled={count === 0}
                                  onClick={() => {
                                    if (count === 0) return;
                                    const csv = generatePaCsvContent(groupTeachers, paCommitteeMembers, paEvaluations);
                                    const safeName = sanitizeFileName(standing);
                                    const fileName = `PA_วิทยฐานะ_${safeName}_${exportYearFilter || '2569'}_${new Date().toISOString().slice(0, 10)}.csv`;
                                    downloadCsvBlob(csv, fileName);
                                    setExportNotification(`ส่งออกข้อมูลวิทยฐานะ "${standing}" (${count} ท่าน) สำเร็จแล้ว`);
                                    setTimeout(() => setExportNotification(null), 4000);
                                  }}
                                  className="w-full py-2 px-3 bg-white hover:bg-blue-50 text-[#005BAC] border border-blue-200 hover:border-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>ส่งออก CSV ({standing})</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 3: CUSTOM FILTERED EXPORT */}
                    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Filter className="w-5 h-5 text-amber-500" />
                          <h3 className="text-base font-extrabold text-slate-900">
                            3. กำหนดเงื่อนไขส่งออกข้อมูลแบบกำหนดเอง (Custom Filtered Export)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          กรองข้อมูลตามปีการศึกษา วิทยฐานะ กลุ่มสาระการเรียนรู้ และสถานะการส่งเพื่อสร้างรายงานเฉพาะส่วน
                        </p>
                      </div>

                      {/* Filter Selectors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">ปีการศึกษา / ปีงบประมาณ</label>
                          <select
                            value={exportYearFilter}
                            onChange={(e) => setExportYearFilter(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                          >
                            <option value="2569">ปีงบประมาณ 2569</option>
                            <option value="2568">ปีงบประมาณ 2568</option>
                            <option value="2567">ปีงบประมาณ 2567</option>
                            <option value="all">ทุกปีงบประมาณ</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">วิทยฐานะ</label>
                          <select
                            value={exportStandingFilter}
                            onChange={(e) => setExportStandingFilter(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                          >
                            <option value="all">ทุกวิทยฐานะ</option>
                            {allAvailableStandings.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">กลุ่มสาระการเรียนรู้</label>
                          <select
                            value={exportCategoryFilter}
                            onChange={(e) => setExportCategoryFilter(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                          >
                            <option value="all">ทุกกลุ่มสาระการเรียนรู้ (8 กลุ่มสาระฯ)</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">สถานะการจัดทำ PA</label>
                          <select
                            value={exportPaStatusFilter}
                            onChange={(e) => setExportPaStatusFilter(e.target.value as any)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                          >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="completed">เฉพาะจัดทำ PA เรียบร้อย</option>
                            <option value="pending">เฉพาะยังไม่จัดทำ PA</option>
                          </select>
                        </div>
                      </div>

                      {/* Filter Results Bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/60 border border-blue-200 p-4 rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-xl bg-[#005BAC] text-white font-mono font-black text-sm flex items-center justify-center">
                            {customFilteredTeachers.length}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              พบข้อมูลครูที่ตรงตามเงื่อนไข: <span className="text-[#005BAC]">{customFilteredTeachers.length} ท่าน</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              (จากทั้งหมด {teachers.length} ท่านในระบบ)
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={customFilteredTeachers.length === 0}
                          onClick={() => {
                            if (customFilteredTeachers.length === 0) return;
                            const csv = generatePaCsvContent(customFilteredTeachers, paCommitteeMembers, paEvaluations);
                            const standingTag = exportStandingFilter !== 'all' ? `_${sanitizeFileName(exportStandingFilter)}` : '';
                            const fileName = `PA_รายงานตัวกรอง${standingTag}_${exportYearFilter || '2569'}_${new Date().toISOString().slice(0, 10)}.csv`;
                            downloadCsvBlob(csv, fileName);
                            setExportNotification(`ส่งออกข้อมูลตามตัวกรอง (${customFilteredTeachers.length} ท่าน) สำเร็จแล้ว`);
                            setTimeout(() => setExportNotification(null), 4000);
                          }}
                          className="px-5 py-2.5 bg-[#005BAC] hover:bg-[#004584] text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Download className="w-4 h-4" />
                          <span>ดาวน์โหลด CSV ชุดนี้ ({customFilteredTeachers.length} รายการ)</span>
                        </button>
                      </div>

                      {/* Preview Table of Custom Filtered Result (Top 5 rows) */}
                      {customFilteredTeachers.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                            <span>ตัวอย่างแถวข้อมูลที่จะถูก Export (แสดงตัวอย่าง 5 ท่านแรก):</span>
                            <span>รวมทั้งหมด {customFilteredTeachers.length} แถว</span>
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                                  <th className="p-3">ลำดับ</th>
                                  <th className="p-3">ชื่อครู</th>
                                  <th className="p-3">วิทยฐานะ</th>
                                  <th className="p-3">กลุ่มสาระ</th>
                                  <th className="p-3">ประเด็นท้าทาย</th>
                                  <th className="p-3 text-center">ลิงก์คลิป</th>
                                  <th className="p-3 text-center">ลิงก์เอกสาร</th>
                                  <th className="p-3 text-center">สถานะ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {customFilteredTeachers.slice(0, 5).map((t, idx) => {
                                  const isComp = t.paStatus === 'completed' || Boolean(t.paChallengeTitle && t.paVideoUrl);
                                  return (
                                    <tr key={t.id} className="hover:bg-slate-50/80">
                                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                                      <td className="p-3 font-bold text-slate-900">{t.name}</td>
                                      <td className="p-3">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                          {t.academicStanding || t.position || 'ครู'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-slate-600">{t.subjectName}</td>
                                      <td className="p-3 max-w-xs truncate text-slate-700 font-medium">
                                        {t.paChallengeTitle || '-'}
                                      </td>
                                      <td className="p-3 text-center">
                                        {t.paVideoUrl ? (
                                          <a href={t.paVideoUrl} target="_blank" rel="noreferrer" className="text-amber-600 font-bold hover:underline inline-flex items-center text-[10px]">
                                            [คลิป] <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                          </a>
                                        ) : (
                                          <span className="text-slate-300">-</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">
                                        {t.paDocumentUrl ? (
                                          <a href={t.paDocumentUrl} target="_blank" rel="noreferrer" className="text-[#005BAC] font-bold hover:underline inline-flex items-center text-[10px]">
                                            [เอกสาร] <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                          </a>
                                        ) : (
                                          <span className="text-slate-300">-</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          isComp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {isComp ? 'จัดทำแล้ว' : 'ยังไม่จัดทำ'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: SECURITY & SPECIFICATION GUARANTEE */}
                    <div className="bg-slate-100/80 p-5 rounded-3xl border border-slate-200 text-xs space-y-3">
                      <div className="flex items-center space-x-2 font-bold text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>ข้อกำหนดด้านความปลอดภัยและโครงสร้างไฟล์ CSV</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-slate-600">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-0.5">✓ เข้ารหัส UTF-8 with BOM</span>
                          <span>เปิดใน Microsoft Excel และ Google Sheets ภาษาไทยไม่เป็นภาษาต่างดาว 100%</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-0.5">✓ ปลอดภัยจากข้อมูล Sensitive</span>
                          <span>ไม่ Export รหัสผ่าน, PIN หรือข้อมูลส่วนบุคคลที่ไม่เกี่ยวข้องกับการประเมิน</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-0.5">✓ ลิงก์จริงเปิดตรวจได้ทันที</span>
                          <span>ลิงก์ YouTube และ Google Drive ถูกส่งออกเป็น URL เต็ม สามารถกดเปิดหรือ copy ได้</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-0.5">✓ เก็บคะแนนกรรมการแยก 3 ท่าน</span>
                          <span>ระบุชื่อกรรมการ คะแนนรายท่าน คะแนนเฉลี่ย และสถานะมติฉันทามติชัดเจน</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* TAB 4: CATEGORIES MANAGER */}
        {activeAdminTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h1 className="font-prompt text-2xl font-extrabold text-slate-900">
              กลุ่มสาระการเรียนรู้ (8 กลุ่มสาระฯ)
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                      ID: {c.id}
                    </span>
                  </div>
                  <h3 className="font-prompt font-bold text-slate-900 text-base">{c.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NEWS MANAGER */}
        {activeAdminTab === 'news' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h1 className="font-prompt text-2xl font-extrabold text-slate-900">
                จัดการข่าวประชาสัมพันธ์
              </h1>
              <button
                onClick={() => {
                  setEditingNews(null);
                  setNewsForm({
                    title: '',
                    content: '',
                    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
                    category: 'ข่าวประชาสัมพันธ์',
                    author: 'ฝ่ายวิชาการ',
                    pinned: false
                  });
                  setIsNewsModalOpen(true);
                }}
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-4 py-2.5 rounded-xl font-bold text-xs"
              >
                + เพิ่มข่าวใหม่
              </button>
            </div>

            <div className="space-y-4">
              {newsList.map((news) => (
                <div key={news.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={news.image || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600'} 
                      alt={news.title} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0" 
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{news.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{news.content}</p>
                      <span className="text-[10px] text-slate-400">{news.createdAt} • โดย {news.author}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('คุณยืนยันที่จะลบข่าวนี้หรือไม่?')) {
                        deleteNews(news.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5.5: YOUTUBE VIDEOS MANAGER */}
        {activeAdminTab === 'videos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-prompt text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <Video className="w-6 h-6 text-rose-600" />
                  <span>จัดการวิดีโอ YouTube หน้าเว็บไซต์</span>
                </h1>
                <p className="text-slate-500 text-xs mt-1">
                  เพิ่มวิดีโอสื่อการเรียนรู้ หรือคลิปแนะนำโรงเรียนจาก YouTube เพื่อแสดงบนหน้าแรกของเว็บ
                </p>
              </div>

              <button
                onClick={() => {
                  setVidForm({ title: '', youtubeUrl: '', description: '' });
                  setIsVideoModalOpen(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
              >
                <Video className="w-4 h-4" />
                <span>+ เพิ่มวิดีโอ YouTube ใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.length === 0 ? (
                <div className="col-span-2 bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-40 text-rose-500" />
                  <p className="font-bold text-sm">ยังไม่มีวิดีโอในระบบ</p>
                  <p className="text-xs text-slate-400">กดปุ่ม "+ เพิ่มวิดีโอ YouTube ใหม่" ด้านบนเพื่อเริ่มอัปเดตวิดีโอ</p>
                </div>
              ) : (
                videos.map((v) => (
                  <div key={v.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900">
                        {v.youtubeId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${v.youtubeId}`}
                            title={v.title}
                            className="w-full h-full"
                            allowFullScreen
                          ></iframe>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                          {v.createdAt}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {v.youtubeId}</span>
                      </div>
                      <h3 className="font-prompt font-bold text-slate-900 text-sm line-clamp-2">{v.title}</h3>
                      {v.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{v.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={v.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-rose-600 font-bold hover:underline inline-flex items-center space-x-1"
                      >
                        <span>เปิดใน YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => {
                          if (window.confirm(`คุณยืนยันที่จะลบวิดีโอ "${v.title}" หรือไม่?`)) {
                            deleteVideo(v.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ลบวิดีโอ</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: DOCUMENTS MANAGER */}
        {activeAdminTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h1 className="font-prompt text-2xl font-extrabold text-slate-900">
                จัดการแบบฟอร์ม & เอกสารดาวน์โหลด
              </h1>
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-4 py-2.5 rounded-xl font-bold text-xs"
              >
                + เพิ่มเอกสารใหม่
              </button>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-[#005BAC]" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                      <p className="text-xs text-slate-400">{doc.category} • {doc.fileType} • {doc.fileSize}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('คุณยืนยันที่จะลบเอกสารนี้หรือไม่?')) {
                        deleteDocument(doc.id);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: DATABASE STATUS & SETTINGS */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
            <div>
              <h1 className="font-prompt text-2xl font-extrabold text-slate-900 flex items-center">
                <Database className="w-6 h-6 text-[#005BAC] mr-2" />
                สถานะระบบฐานข้อมูลคลาวด์ (Cloud Firestore Database)
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                ระบบจัดเก็บข้อมูลสื่อการเรียนรู้ ข่าวสาร เอกสาร และรายชื่อครู ทั้งหมดบันทึกไปยัง Firebase Cloud Firestore แบบเรียลไทม์
              </p>
            </div>

            {/* Active Cloud Firestore Status Box */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-xs text-slate-800">
                    สถานะ: เชื่อมต่อ Firebase Cloud Firestore สำเร็จ (ออนไลน์เรียลไทม์)
                  </span>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">Live Production DB</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold mb-1">สื่อการเรียนรู้</div>
                  <div className="text-xl font-extrabold text-[#005BAC] font-mono">{resources.length} <span className="text-xs font-normal text-slate-400">รายการ</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold mb-1">รายชื่อครู</div>
                  <div className="text-xl font-extrabold text-emerald-600 font-mono">{teachers.length} <span className="text-xs font-normal text-slate-400">คน</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold mb-1">ข่าวประชาสัมพันธ์</div>
                  <div className="text-xl font-extrabold text-amber-600 font-mono">{newsList.length} <span className="text-xs font-normal text-slate-400">ข่าว</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold mb-1">เอกสารดาวน์โหลด</div>
                  <div className="text-xl font-extrabold text-indigo-600 font-mono">{documents.length} <span className="text-xs font-normal text-slate-400">ฉบับ</span></div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-800 space-y-1">
                <p className="font-bold">✨ ข้อมูลทุกอย่างที่คุณ เพิ่ม/แก้ไข/ลบ ในเมนูจัดการผู้ดูแลระบบจะถูกบันทึกจริงลงคลาวด์ทันที</p>
                <p className="text-blue-600">ข้อมูลจะไม่สูญหายแม้นำไปเปิดบนเครื่องอื่นหรือเบราว์เซอร์อื่น</p>
              </div>
            </div>

            {/* Optional Supabase Credential Form */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
              <div>
                <h3 className="font-prompt font-bold text-slate-800 text-sm flex items-center">
                  <Database className="w-4 h-4 text-slate-500 mr-2" />
                  ตัวเลือกเสริม: เชื่อมต่อ Supabase เพิ่มเติม (Optional)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  (ระบบปัจจุบันใช้ Firebase Firestore เป็นฐานข้อมูลหลักเรียบร้อยแล้ว ไม่จำเป็นต้องกรอก Supabase หากไม่ต้องการใช้)
                </p>
              </div>

              {spSaved && (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>บันทึกการตั้งค่า Supabase เรียบร้อยแล้ว!</span>
                </div>
              )}

              <form onSubmit={handleSaveSupabase} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project-id.supabase.co"
                    value={spUrl}
                    onChange={(e) => setSpUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={spKey}
                    onChange={(e) => setSpKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-6 rounded-xl font-bold text-xs shadow-xs transition"
                >
                  บันทึกการตั้งค่า Supabase
                </button>
              </form>
            </div>

            {/* SQL Script Exporter Box */}
            <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5 text-[#FFD54F]" />
                  <h3 className="font-prompt font-bold text-white text-base">
                    โค้ด SQL สร้างตารางฐานข้อมูล (Supabase SQL Schema)
                  </h3>
                </div>
                <button
                  onClick={handleCopySql}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอก SQL'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400">
                นำโค้ด SQL ด้านล่างนี้ไปวางในหน้า <strong>SQL Editor</strong> บน Supabase Dashboard ของคุณเพื่อสร้างโครงสร้างตารางโดยอัตโนมัติ
              </p>

              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-64 border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* RESOURCE MODAL (ADD / EDIT) */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsResourceModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-prompt font-bold text-slate-900 text-xl mb-6">
              {editingResource ? 'แก้ไขสื่อการสอน' : 'เพิ่มสื่อการสอนใหม่'}
            </h2>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อสื่อการสอน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ชุดกิจกรรมการเรียนรู้ วิทยาการคำนวณ..."
                  value={resForm.title}
                  onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กลุ่มสาระการเรียนรู้ *</label>
                  <select
                    value={resForm.categoryId}
                    onChange={(e) => setResForm({ ...resForm, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                  >
                    <option value="-">- (ไม่ระบุ / สายสนับสนุน)</option>
                    <option value="อนุบาล">อนุบาล</option>
                    <option value="อนุบาล 1">อนุบาล 1</option>
                    <option value="อนุบาล 2">อนุบาล 2</option>
                    <option value="อนุบาล 3">อนุบาล 3</option>
                    <option value="ป.1">ป.1</option>
                    <option value="ป.2">ป.2</option>
                    <option value="ป.3">ป.3</option>
                    <option value="ป.4">ป.4</option>
                    <option value="ป.5">ป.5</option>
                    <option value="ป.6">ป.6</option>
                    <option value="ม.1">ม.1</option>
                    <option value="ม.2">ม.2</option>
                    <option value="ม.3">ม.3</option>
                    <option value="ทุกระดับชั้น">ทุกระดับชั้น</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ประเภทไฟล์ *</label>
                  <select
                    value={resForm.fileType}
                    onChange={(e) => setResForm({ ...resForm, fileType: e.target.value as FileType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                  >
                    <option value="PDF">PDF</option>
                    <option value="PowerPoint">PowerPoint</option>
                    <option value="Word">Word</option>
                    <option value="ZIP">ZIP</option>
                    <option value="Video">Video</option>
                    <option value="Canva Link">Canva Link</option>
                    <option value="Google Drive Link">Google Drive Link</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ครูผู้จัดทำ *</label>
                  <select
                    value={resForm.teacherId}
                    onChange={(e) => setResForm({ ...resForm, teacherId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ลิงก์ดาวน์โหลดสื่อ / ไฟล์ URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://drive.google.com/... หรือ ลิงก์สื่อ"
                  value={resForm.fileUrl}
                  onChange={(e) => setResForm({ ...resForm, fileUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              {/* Resource Cover with ImageUploadCompressor */}
              <ImageUploadCompressor
                value={resForm.cover}
                onChange={(newCover) => setResForm({ ...resForm, cover: newCover })}
                label="รูปภาพหน้าปกสื่อ (บีบอัดอัตโนมัติ ~20-40 KB)"
                helpText="ระบบย่อภาพอัตโนมัติ ไม่เปลืองโควตาฐานข้อมูล"
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">รายละเอียดสื่อ</label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดวัตถุประสงค์ คำแนะนำการใช้งาน..."
                  value={resForm.description}
                  onChange={(e) => setResForm({ ...resForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำค้นหา / แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                <input
                  type="text"
                  placeholder="วิทยาศาสตร์, โค้ดดิ้ง, ป.5"
                  value={resForm.tags}
                  onChange={(e) => setResForm({ ...resForm, tags: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={resForm.featured}
                  onChange={(e) => setResForm({ ...resForm, featured: e.target.checked })}
                  className="w-4 h-4 text-[#005BAC] rounded"
                />
                <label htmlFor="featuredCheck" className="font-bold text-slate-700">
                  แสดงเป็นสื่อแนะนำพิเศษ (Featured Resource)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl font-bold shadow-sm"
                >
                  บันทึกข้อมูลสื่อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL (ADD / EDIT) */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative">
            <button
              onClick={() => setIsTeacherModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-prompt font-bold text-slate-900 text-xl mb-6">
              {editingTeacher ? 'แก้ไขข้อมูลครู' : 'เพิ่มข้อมูลครูผู้สอน'}
            </h2>

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="ครูสมชาย ใจดี"
                  value={tForm.name}
                  onChange={(e) => setTForm({ ...tForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วิทยฐานะ *</label>
                  <select
                    value={tForm.academicStanding}
                    onChange={(e) => setTForm({ ...tForm, academicStanding: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-[#005BAC]"
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
                  <label className="block font-bold text-slate-700 mb-1">สายชั้น / ตำแหน่ง *</label>
                  <select
                    value={tForm.position}
                    onChange={(e) => setTForm({ ...tForm, position: e.target.value })}
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
                    {tForm.position && ![
                      '-', 'อนุบาล', 'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 
                      'ประถมศึกษาปีที่ 1 (ป.1)', 'ประถมศึกษาปีที่ 2 (ป.2)', 
                      'ประถมศึกษาปีที่ 3 (ป.3)', 'ประถมศึกษาปีที่ 4 (ป.4)', 
                      'ประถมศึกษาปีที่ 5 (ป.5)', 'ประถมศึกษาปีที่ 6 (ป.6)',
                      'มัธยมศึกษาปีที่ 1 (ม.1)', 'มัธยมศึกษาปีที่ 2 (ม.2)', 'มัธยมศึกษาปีที่ 3 (ม.3)'
                    ].includes(tForm.position) && (
                      <option value={tForm.position}>{tForm.position}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* PA Section inside Teacher Modal */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#003875] flex items-center space-x-1.5 text-xs">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>ข้อตกลงในการพัฒนางาน (PA)</span>
                  </div>
                  {editingTeacher && (tForm.paChallengeTitle || tForm.paVideoUrl || tForm.paDocumentUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('คุณต้องการล้างข้อมูลข้อตกลง PA ทั้งหมดของครูท่านนี้ในแบบฟอร์มหรือไม่?')) {
                          setTForm(prev => ({
                            ...prev,
                            paChallengeTitle: '',
                            paVideoUrl: '',
                            paDocumentUrl: '',
                            paStatus: 'pending'
                          }));
                        }
                      }}
                      className="text-[10px] text-amber-800 hover:text-rose-600 bg-amber-100/80 hover:bg-rose-50 px-2 py-0.5 rounded-md font-bold transition flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ล้างข้อมูล PA</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    🎯 ชื่อประเด็นท้าทายในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน (PA)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น การพัฒนาทักษะการคิดคำนวณ โดยใช้ชุดกิจกรรมการเรียนรู้แบบ Active Learning..."
                    value={tForm.paChallengeTitle}
                    onChange={(e) => setTForm({ 
                      ...tForm, 
                      paChallengeTitle: e.target.value,
                      paStatus: (e.target.value && tForm.paVideoUrl) ? 'completed' : tForm.paStatus
                    })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ปีการศึกษา / งบประมาณ</label>
                    <input
                      type="text"
                      placeholder="2569"
                      value={tForm.paYear}
                      onChange={(e) => setTForm({ ...tForm, paYear: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">สถานะการจัดทำ PA</label>
                    <select
                      value={tForm.paStatus}
                      onChange={(e) => setTForm({ ...tForm, paStatus: e.target.value as 'completed' | 'pending' })}
                      className={`w-full border rounded-xl py-2 px-3 text-xs font-bold ${
                        tForm.paStatus === 'completed' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="pending">ยังไม่จัดทำ / กำลังดำเนินการ</option>
                      <option value="completed">จัดทำเรียบร้อยแล้ว</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    🎬 ลิงก์คลิปวิดีโอ PA / การสอน (YouTube / Google Drive)
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=... หรือ ลิงก์คลิปวิดีโอ"
                    value={tForm.paVideoUrl}
                    onChange={(e) => setTForm({ 
                      ...tForm, 
                      paVideoUrl: e.target.value,
                      paStatus: (tForm.paChallengeTitle && e.target.value) ? 'completed' : tForm.paStatus
                    })}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    📄 ลิงก์ไฟล์เอกสารข้อตกลง PA / SAR (PDF / Google Drive)
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/..."
                    value={tForm.paDocumentUrl}
                    onChange={(e) => setTForm({ ...tForm, paDocumentUrl: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:ring-2 focus:ring-[#005BAC]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">กลุ่มสาระการเรียนรู้ *</label>
                <select
                  value={tForm.subjectId}
                  onChange={(e) => setTForm({ ...tForm, subjectId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Teacher Photo with ImageUploadCompressor */}
              <ImageUploadCompressor
                value={tForm.photo}
                onChange={(newPhoto) => setTForm({ ...tForm, photo: newPhoto })}
                label="รูปโปรไฟล์ครู (บีบอัดอัตโนมัติ ~15-30 KB)"
                helpText="ระบบย่อภาพอัตโนมัติ ประหยัดเนื้อที่ฐานข้อมูล"
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">อีเมลติดต่อ</label>
                <input
                  type="email"
                  placeholder="teacher@bangchalong.ac.th"
                  value={tForm.email}
                  onChange={(e) => setTForm({ ...tForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">🔑 รหัสผ่านเข้าสู่ระบบของคุณครู (Default: 123456)</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={tForm.password}
                  onChange={(e) => setTForm({ ...tForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-[#005BAC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ประวัติโดยย่อ / คติประจำใจ</label>
                <textarea
                  rows={2}
                  value={tForm.bio}
                  onChange={(e) => setTForm({ ...tForm, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#005BAC] text-white rounded-xl font-bold"
                >
                  บันทึกข้อมูลครู
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEWS MODAL */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative">
            <button
              onClick={() => setIsNewsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-prompt font-bold text-slate-900 text-xl mb-6">
              {editingNews ? 'แก้ไขข่าวประชาสัมพันธ์' : 'เพิ่มข่าวประชาสัมพันธ์ใหม่'}
            </h2>

            <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">หัวข้อข่าว *</label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เนื้อหาข่าว *</label>
                <textarea
                  rows={4}
                  required
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>

              {/* News Cover with ImageUploadCompressor */}
              <ImageUploadCompressor
                value={newsForm.image}
                onChange={(newImg) => setNewsForm({ ...newsForm, image: newImg })}
                label="รูปภาพประกอบข่าว (บีบอัดอัตโนมัติ ~25-45 KB)"
                helpText="ระบบย่อภาพอัตโนมัติ ประหยัดเนื้อที่ฐานข้อมูล"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinnedCheck"
                  checked={newsForm.pinned}
                  onChange={(e) => setNewsForm({ ...newsForm, pinned: e.target.checked })}
                  className="w-4 h-4 text-[#005BAC]"
                />
                <label htmlFor="pinnedCheck" className="font-bold text-slate-700">ปักหมุดไว้ที่หน้าแรก</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#005BAC] text-white rounded-xl font-bold"
                >
                  บันทึกข่าว
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOC MODAL */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative">
            <button
              onClick={() => setIsDocModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-prompt font-bold text-slate-900 text-xl mb-6">
              เพิ่มเอกสารดาวน์โหลดใหม่
            </h2>

            <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อเอกสาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แบบฟอร์มแผนการจัดการเรียนรู้..."
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">หมวดหมู่เอกสาร *</label>
                <select
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                >
                  <option value="แบบฟอร์มโรงเรียน">แบบฟอร์มโรงเรียน</option>
                  <option value="แผนการจัดการเรียนรู้">แผนการจัดการเรียนรู้</option>
                  <option value="เอกสาร SAR">เอกสาร SAR</option>
                  <option value="วิจัยในชั้นเรียน">วิจัยในชั้นเรียน</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ลิงก์ดาวน์โหลดเอกสาร (URL) *</label>
                <input
                  type="text"
                  required
                  value={docForm.fileUrl}
                  onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#005BAC] text-white rounded-xl font-bold"
                >
                  บันทึกเอกสาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-prompt font-bold text-slate-900 text-xl leading-tight">
                  เพิ่มวิดีโอ YouTube ใหม่
                </h2>
                <p className="text-slate-500 text-xs">ระบุลิงก์วิดีโอ YouTube เพื่อนำเสนอสื่อการสอนบนหน้าแรก</p>
              </div>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อวิดีโอ / กิจกรรมวิชาการ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น กิจกรรมเปิดบ้านวิชาการ Open House 2569..."
                  value={vidForm.title}
                  onChange={(e) => setVidForm({ ...vidForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ลิงก์วิดีโอ YouTube (URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น https://www.youtube.com/watch?v=ScMzIvxBSi4 หรือ https://youtu.be/..."
                  value={vidForm.youtubeUrl}
                  onChange={(e) => setVidForm({ ...vidForm, youtubeUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * รองรับรูปแบบลิงก์ youtube.com/watch?v=... หรือ youtu.be/...
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายย่อ (รายละเอียดวิดีโอ)</label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดโดยย่อเกี่ยวกับวิดีโอสื่อการสอนนี้..."
                  value={vidForm.description}
                  onChange={(e) => setVidForm({ ...vidForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  บันทึกวิดีโอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMMITTEE MEMBER (ADD / EDIT) MODAL */}
      {isCommitteeMemberModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative text-slate-900">
            <button
              onClick={() => {
                setIsCommitteeMemberModalOpen(false);
                setEditingCommitteeMember(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold bg-[#005BAC] text-white px-2 py-0.5 rounded-md">
                  {editingCommitteeMember ? `แก้ไขกรรมการท่านที่ ${committeeFormData.order || editingCommitteeMember.order}` : 'เพิ่มกรรมการประเมิน PA ใหม่'}
                </span>
                <h2 className="font-prompt font-bold text-slate-900 text-lg leading-tight mt-0.5">
                  {editingCommitteeMember ? 'แก้ไขรหัส & ข้อมูลคณะกรรมการ PA' : 'เพิ่มคณะกรรมการประเมิน ว.PA'}
                </h2>
                <p className="text-slate-500 text-xs">กำหนดรหัสผ่านประจำตัวและชุดคณะกรรมการสำหรับเข้าตรวจ PA</p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const cleanedCode = committeeFormData.code.trim().toLowerCase();
                  if (editingCommitteeMember) {
                    await updateCommitteeMember(editingCommitteeMember.id, {
                      name: committeeFormData.name,
                      role: committeeFormData.role,
                      position: committeeFormData.position,
                      code: cleanedCode,
                      setNumber: Number(committeeFormData.setNumber) || 1,
                      setName: committeeFormData.setName,
                      targetDescription: committeeFormData.targetDescription,
                      order: Number(committeeFormData.order) || 1,
                      avatar: committeeFormData.avatar,
                      phone: committeeFormData.phone,
                      email: committeeFormData.email
                    });
                    alert('บันทึกข้อมูลคณะกรรมการและรหัสประจำตัวเรียบร้อยแล้ว');
                  } else {
                    await addCommitteeMember({
                      name: committeeFormData.name,
                      role: committeeFormData.role,
                      position: committeeFormData.position,
                      code: cleanedCode,
                      setNumber: Number(committeeFormData.setNumber) || 1,
                      setName: committeeFormData.setName || `ชุดที่ ${committeeFormData.setNumber}: คณะกรรมการประเมินชุดที่ ${committeeFormData.setNumber}`,
                      targetDescription: committeeFormData.targetDescription || 'ผู้รับการประเมินตามคำสั่งโรงเรียน',
                      order: Number(committeeFormData.order) || 1,
                      avatar: committeeFormData.avatar,
                      phone: committeeFormData.phone,
                      email: committeeFormData.email
                    });
                    alert('เพิ่มคณะกรรมการประเมิน ว.PA ใหม่เรียบร้อยแล้ว');
                  }
                  setIsCommitteeMemberModalOpen(false);
                  setEditingCommitteeMember(null);
                } catch (err: any) {
                  alert('เกิดข้อผิดพลาดในการบันทึก: ' + (err?.message || 'โปรดลองใหม่'));
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สังกัดชุดกรรมการ *</label>
                  <select
                    value={committeeFormData.setNumber}
                    onChange={(e) => {
                      const setNum = Number(e.target.value);
                      const defaultNames: Record<number, string> = {
                        1: 'ชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ',
                        2: 'ชุดที่ 2: ประเมินครู และครูผู้ช่วย',
                        3: 'ชุดที่ 3: ประเมินครูอัตราจ้าง และบุคลากรทางการศึกษา'
                      };
                      const defaultTargets: Record<number, string> = {
                        1: 'วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ',
                        2: 'ตำแหน่งครู และครูผู้ช่วย',
                        3: 'ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ'
                      };
                      setCommitteeFormData(prev => ({
                        ...prev,
                        setNumber: setNum,
                        setName: defaultNames[setNum] || `ชุดที่ ${setNum}: คณะกรรมการประเมินชุดที่ ${setNum}`,
                        targetDescription: defaultTargets[setNum] || 'ผู้รับการประเมินตามเกณฑ์'
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-[#005BAC]"
                  >
                    <option value={1}>ชุดที่ 1 (ชำนาญการ / ชำนาญการพิเศษ)</option>
                    <option value={2}>ชุดที่ 2 (ครู / ครูผู้ช่วย)</option>
                    <option value={3}>ชุดที่ 3 (อัตราจ้าง / บุคลากร)</option>
                    <option value={4}>ชุดที่ 4 (ชุดเพิ่มเติม)</option>
                    <option value={5}>ชุดที่ 5 (ชุดเพิ่มเติม)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ลำดับกรรมการในชุด *</label>
                  <select
                    value={committeeFormData.order}
                    onChange={(e) => setCommitteeFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
                  >
                    <option value={1}>ลำดับ 1 (ประธานกรรมการ)</option>
                    <option value={2}>ลำดับ 2 (กรรมการคนที่ 2)</option>
                    <option value={3}>ลำดับ 3 (กรรมการคนที่ 3)</option>
                    <option value={4}>ลำดับ 4 (กรรมการคนที่ 4)</option>
                    <option value={5}>ลำดับ 5 (กรรมการคนที่ 5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รหัสประจำตัวกรรมการ (Committee Secret Code) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="เช่น bch1, bch2, comm-1"
                    value={committeeFormData.code}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, code: e.target.value })}
                    className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  <Key className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * รหัสนี้ใช้สำหรับกรรมการล็อกอินเข้าสู่ระบบตรวจประเมิน PA
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล คณะกรรมการ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายประเสริฐ สุขสมบูรณ์"
                  value={committeeFormData.name}
                  onChange={(e) => setCommitteeFormData({ ...committeeFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">บทบาทในกรรมการ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)"
                    value={committeeFormData.role}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่งทางวิชาการ/สังกัด</label>
                  <input
                    type="text"
                    placeholder="เช่น ผู้อำนวยการชำนาญการพิเศษ โรงเรียน..."
                    value={committeeFormData.position}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">กลุ่มเป้าหมายผู้รับการประเมินของชุดนี้</label>
                <input
                  type="text"
                  placeholder="เช่น วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ"
                  value={committeeFormData.targetDescription}
                  onChange={(e) => setCommitteeFormData({ ...committeeFormData, targetDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              {/* Committee Avatar with ImageUploadCompressor */}
              <ImageUploadCompressor
                value={committeeFormData.avatar}
                onChange={(newAvatar) => setCommitteeFormData({ ...committeeFormData, avatar: newAvatar })}
                label="รูปภาพประจำตัวกรรมการ (บีบอัดอัตโนมัติ ~15-30 KB)"
                helpText="ระบบย่อภาพอัตโนมัติ ประหยัดเนื้อที่ฐานข้อมูล"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="08X-XXX-XXXX"
                    value={committeeFormData.phone}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">อีเมล (ถ้ามี)</label>
                  <input
                    type="email"
                    placeholder="committee@school.ac.th"
                    value={committeeFormData.email}
                    onChange={(e) => setCommitteeFormData({ ...committeeFormData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCommitteeMemberModalOpen(false);
                    setEditingCommitteeMember(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs text-xs flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCommitteeMember ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มกรรมการ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT CONSENSUS MODAL */}
      {inspectConsensusTeacher && (() => {
        const t = inspectConsensusTeacher;
        const consensus = getTeacherConsensus(t.id);
        const assignedMembers = paCommitteeMembers.filter(m => isTeacherAssignedToCommittee(t, m));

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative text-slate-900 space-y-6">
              <button
                onClick={() => setInspectConsensusTeacher(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Teacher Info Header */}
              <div className="flex items-start space-x-4 border-b border-slate-100 pb-4">
                <img
                  src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400'}
                  alt={t.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#005BAC] text-white px-2 py-0.5 rounded-md">
                      {t.academicStanding || t.position || 'ครู'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {t.subjectName}
                    </span>
                  </div>
                  <h2 className="font-prompt font-extrabold text-slate-900 text-xl mt-1">
                    {t.name}
                  </h2>
                  {t.paChallengeTitle && (
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      📌 <strong>ประเด็นท้าทาย PA:</strong> {t.paChallengeTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Consensus Summary Banner */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">คะแนนเฉลี่ย</div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {consensus.averageScore !== null ? `${consensus.averageScore.toFixed(1)} / 100` : '-'}
                  </div>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">คะแนน สูงสุด / ต่ำสุด</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-1">
                    {consensus.maxScore !== null ? `${consensus.maxScore} / ${consensus.minScore}` : '-'}
                  </div>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">ส่วนต่างคะแนน (Range)</div>
                  <div className={`text-sm font-bold font-mono mt-1 ${
                    consensus.isHighVariance ? 'text-rose-600 font-black' : 'text-slate-800'
                  }`}>
                    {consensus.scoreRange !== null ? `±${consensus.scoreRange} คะแนน` : '-'}
                  </div>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200 flex flex-col justify-center items-center">
                  <div className="text-[11px] text-slate-500 font-medium">สถานะฉันทามติ</div>
                  <div className="mt-1">
                    {consensus.isHighVariance ? (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                        ⚠️ ส่วนต่างสูงผิดปกติ
                      </span>
                    ) : consensus.isFullyEvaluated ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ มติสอดคล้องกัน
                      </span>
                    ) : (
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                        ⏳ รอตรวจครบทุกท่าน
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Committee Individual Evaluation Cards */}
              <div className="space-y-3">
                <h3 className="font-prompt font-bold text-sm text-slate-800">
                  ผลการประเมินและข้อเสนอแนะรายบุคคลจากกรรมการ ({assignedMembers.length} ท่าน)
                </h3>

                <div className="grid grid-cols-1 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {assignedMembers.map((m) => {
                    const evalRec = paEvaluations.find(e => e.teacherId === t.id && e.committeeId === m.id);

                    return (
                      <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={m.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'}
                              alt={m.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold bg-[#005BAC] text-white px-1.5 py-0.2 rounded">
                                  ท่านที่ {m.order}
                                </span>
                                <h4 className="font-bold text-slate-900 text-xs">{m.name}</h4>
                              </div>
                              <p className="text-[11px] text-slate-500">{m.role}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            {evalRec?.overallScore !== undefined ? (
                              <div className="font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-sm inline-block">
                                {evalRec.overallScore} / 100 คะแนน
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">ยังไม่ส่งคะแนน</span>
                            )}
                          </div>
                        </div>

                        {/* Media Check Badges & Comments */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-700 flex items-center gap-1">
                                📄 ตรวจเอกสาร PA 1/ส
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                evalRec?.docChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {evalRec?.docChecked ? '✓ ตรวจแล้ว' : 'ยังไม่ตรวจ'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 italic">
                              {evalRec?.docFeedback || 'ไม่มีข้อเสนอแนะเพิ่มเติม'}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-700 flex items-center gap-1">
                                🎥 ตรวจคลิปวิดีโอ PA
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                evalRec?.videoChecked ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {evalRec?.videoChecked ? '✓ ตรวจแล้ว' : 'ยังไม่ตรวจ'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 italic">
                              {evalRec?.videoFeedback || 'ไม่มีข้อเสนอแนะเพิ่มเติม'}
                            </p>
                          </div>
                        </div>

                        {/* Overall Comment */}
                        {evalRec?.overallComment && (
                          <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs">
                            <span className="font-bold text-[#005BAC] block mb-0.5">💬 สรุปข้อคิดเห็นภาพรวม:</span>
                            <p className="text-slate-700 text-[11px] leading-relaxed">{evalRec.overallComment}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectConsensusTeacher(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
