import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Resource, 
  Teacher, 
  Category, 
  News, 
  SchoolDocument, 
  FeaturedVideo,
  ActiveTab, 
  AdminUser, 
  SupabaseConfig,
  PaCommitteeMember,
  PaEvaluationRecord,
  TeacherConsensusResult,
  ExamQuestion
} from '../types';
import { 
  INITIAL_RESOURCES, 
  INITIAL_TEACHERS, 
  INITIAL_CATEGORIES, 
  INITIAL_NEWS, 
  INITIAL_DOCUMENTS, 
  INITIAL_VIDEOS, 
  INITIAL_PA_COMMITTEE, 
  INITIAL_PA_EVALUATIONS,
  INITIAL_EXAM_QUESTIONS,
  getYouTubeId,
  isTeacherAssignedToCommittee,
  getTeacherCommitteeSetNumber
} from '../data/mockData';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig as saveSupabaseConfigToStorage,
  getSupabaseClient
} from '../services/supabaseClient';
import {
  fetchResourcesFromSupabase,
  upsertResourceToSupabase,
  deleteResourceFromSupabase,
  incrementResourceCountersInSupabase,
  fetchTeachersFromSupabase,
  upsertTeacherToSupabase,
  deleteTeacherFromSupabase,
  fetchCategoriesFromSupabase,
  upsertCategoryToSupabase,
  deleteCategoryFromSupabase,
  fetchNewsFromSupabase,
  upsertNewsToSupabase,
  deleteNewsFromSupabase,
  fetchDocumentsFromSupabase,
  upsertDocumentToSupabase,
  deleteDocumentFromSupabase,
  fetchVideosFromSupabase,
  upsertVideoToSupabase,
  deleteVideoFromSupabase,
  fetchCommitteeMembersFromSupabase,
  upsertCommitteeMemberToSupabase,
  deleteCommitteeMemberFromSupabase,
  fetchPaEvaluationsFromSupabase,
  upsertPaEvaluationToSupabase,
  deletePaEvaluationFromSupabase,
  clearAllPaEvaluationsFromSupabase,
  fetchExamQuestionsFromSupabase,
  upsertExamQuestionToSupabase,
  deleteExamQuestionFromSupabase,
  incrementExamCounterInSupabase
} from '../services/supabaseService';
import { subscribeToAllRealtime } from '../services/supabaseRealtimeService';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  resources: Resource[];
  teachers: Teacher[];
  categories: Category[];
  newsList: News[];
  documents: SchoolDocument[];
  
  selectedResource: Resource | null;
  setSelectedResource: (resource: Resource | null) => void;
  
  selectedTeacher: Teacher | null;
  setSelectedTeacher: (teacher: Teacher | null) => void;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  gradeFilter: string;
  setGradeFilter: (grade: string) => void;
  fileTypeFilter: string;
  setFileTypeFilter: (type: string) => void;
  teacherFilter: string;
  setTeacherFilter: (teacherId: string) => void;
  sortBy: 'latest' | 'downloads' | 'title' | 'views';
  setSortBy: (sort: 'latest' | 'downloads' | 'title' | 'views') => void;
  resetFilters: () => void;

  // Exam Bank (คลังข้อสอบ)
  examQuestions: ExamQuestion[];
  selectedExamQuestion: ExamQuestion | null;
  setSelectedExamQuestion: (exam: ExamQuestion | null) => void;
  examSearchQuery: string;
  setExamSearchQuery: (query: string) => void;
  examGradeFilter: string;
  setExamGradeFilter: (grade: string) => void;
  examSubjectGroupFilter: string;
  setExamSubjectGroupFilter: (group: string) => void;
  examSubjectFilter: string;
  setExamSubjectFilter: (subject: string) => void;
  examSemesterFilter: string;
  setExamSemesterFilter: (sem: string) => void;
  examYearFilter: string;
  setExamYearFilter: (year: string) => void;
  examTypeFilter: string;
  setExamTypeFilter: (type: string) => void;
  examSortBy: 'latest' | 'views' | 'downloads' | 'title';
  setExamSortBy: (sort: 'latest' | 'views' | 'downloads' | 'title') => void;
  resetExamFilters: () => void;
  addExamQuestion: (exam: Omit<ExamQuestion, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'downloadCount'>) => Promise<void>;
  editExamQuestion: (id: string, updated: Partial<ExamQuestion>) => Promise<void>;
  deleteExamQuestion: (id: string) => Promise<void>;
  incrementExamViews: (id: string) => void;
  incrementExamDownloads: (id: string) => void;
  
  // Admin & Auth
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  loginAdmin: (usernameOrEmail: string, passwordInput?: string) => boolean;
  logoutAdmin: () => void;

  // Teacher Auth & Profile
  currentTeacher: Teacher | null;
  isTeacherLoginOpen: boolean;
  setIsTeacherLoginOpen: (open: boolean) => void;
  isTeacherProfileOpen: boolean;
  setIsTeacherProfileOpen: (open: boolean) => void;
  isAIPlannerOpen: boolean;
  setIsAIPlannerOpen: (open: boolean) => void;
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;
  aiChatInitialQuestion: string;
  setAIChatInitialQuestion: (q: string) => void;
  openAIChatWithQuestion: (question: string) => void;
  isPWAInstallModalOpen: boolean;
  setIsPWAInstallModalOpen: (open: boolean) => void;
  loginTeacher: (teacherIdOrEmail: string, passwordInput: string) => { success: boolean; message: string };
  logoutTeacher: () => void;
  updateCurrentTeacherProfile: (updated: Partial<Teacher>) => Promise<void>;
  
  // Supabase Settings
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: { url: string; anonKey: string }) => void;
  
  // CRUD Actions
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'views'>) => Promise<void>;
  submitResourceByTeacher: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'views'>) => Promise<void>;
  approveResource: (id: string) => Promise<void>;
  rejectResource: (id: string) => Promise<void>;
  approvedResources: Resource[];
  editResource: (id: string, updated: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  incrementDownloads: (id: string) => void;
  incrementViews: (id: string) => void;
  
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt' | 'resourcesCount' | 'totalDownloads'>) => Promise<void>;
  editTeacher: (id: string, updated: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  resetTeacherPa: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  editCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addNews: (news: Omit<News, 'id' | 'createdAt'>) => Promise<void>;
  editNews: (id: string, updated: Partial<News>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;

  addDocument: (doc: Omit<SchoolDocument, 'id' | 'updatedAt' | 'downloads'>) => Promise<void>;
  editDocument: (id: string, updated: Partial<SchoolDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  videos: FeaturedVideo[];
  addVideo: (video: Omit<FeaturedVideo, 'id' | 'createdAt' | 'youtubeId'>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  
  // PA Committee & Evaluator Portal
  paCommitteeMembers: PaCommitteeMember[];
  paEvaluations: PaEvaluationRecord[];
  currentCommitteeMember: PaCommitteeMember | null;
  isCommitteeLoginOpen: boolean;
  setIsCommitteeLoginOpen: (open: boolean) => void;
  loginCommitteeMember: (codeOrId: string, preferredSetNumber?: number) => { success: boolean; message: string; member?: PaCommitteeMember };
  logoutCommitteeMember: () => void;
  addCommitteeMember: (member: Omit<PaCommitteeMember, 'id'> & { id?: string }) => Promise<void>;
  updateCommitteeMember: (id: string, updated: Partial<PaCommitteeMember>) => Promise<void>;
  deleteCommitteeMember: (id: string) => Promise<void>;
  savePaEvaluation: (evaluation: Omit<PaEvaluationRecord, 'id' | 'updatedAt'>) => Promise<void>;
  clearTeacherEvaluation: (teacherId: string, committeeId?: string) => Promise<void>;
  clearAllTeacherEvaluations: () => Promise<void>;
  toggleTeacherDocChecked: (teacherId: string, committeeMember: PaCommitteeMember, feedback?: string) => Promise<void>;
  toggleTeacherVideoChecked: (teacherId: string, committeeMember: PaCommitteeMember, feedback?: string) => Promise<void>;
  getTeacherEvaluations: (teacherId: string) => PaEvaluationRecord[];
  getCommitteeProgress: (committeeId: string) => {
    totalTeachers: number;
    docCheckedCount: number;
    videoCheckedCount: number;
    fullyCheckedCount: number;
    percentage: number;
  };
  varianceThreshold: number;
  setVarianceThreshold: (threshold: number) => void;
  getTeacherConsensus: (teacherId: string, setNumber?: number) => TeacherConsensusResult;
  
  // Quick navigation helpers
  viewTeacherPublications: (teacher: Teacher) => void;
  viewCategoryResources: (categoryId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RESOURCES: 'bangchalong_resources_v2',
  TEACHERS: 'bangchalong_teachers_v2',
  CATEGORIES: 'bangchalong_categories_v2',
  NEWS: 'bangchalong_news_v2',
  DOCUMENTS: 'bangchalong_documents_v2',
  ADMIN_USER: 'bangchalong_admin_v2',
  TEACHER_USER: 'bangchalong_teacher_user_v2',
  COMMITTEE_USER: 'bangchalong_committee_user_v2',
  EVALUATIONS: 'bangchalong_evaluations_v2',
  COMMITTEE: 'bangchalong_committee_v2',
  EXAM_QUESTIONS: 'bangchalong_exam_questions_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  
  // Initialize state with cached local storage or fallback mock data
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (!saved) return INITIAL_RESOURCES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (!saved) return INITIAL_TEACHERS;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const existingIds = new Set(parsed.map((t: any) => t.id));
        const missing = INITIAL_TEACHERS.filter(t => !existingIds.has(t.id));
        const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
        return merged.map(t => {
          const initial = INITIAL_TEACHERS.find(i => i.id === t.id);
          if (initial && (t.id === 't-deputy-1' || t.id === 't-deputy-2')) {
            return { ...initial, ...t, position: initial.position, academicStanding: initial.academicStanding };
          }
          return t;
        });
      }
      return INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!saved) return INITIAL_CATEGORIES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [newsList, setNewsList] = useState<News[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NEWS);
      if (!saved) return INITIAL_NEWS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_NEWS;
    } catch {
      return INITIAL_NEWS;
    }
  });

  const [documents, setDocuments] = useState<SchoolDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!saved) return INITIAL_DOCUMENTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [videos, setVideos] = useState<FeaturedVideo[]>(INITIAL_VIDEOS);
  
  const [paCommitteeMembers, setPaCommitteeMembers] = useState<PaCommitteeMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMITTEE);
      if (!saved) return INITIAL_PA_COMMITTEE;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const existingIds = new Set(parsed.map((m: any) => m.id));
        const missing = INITIAL_PA_COMMITTEE.filter(m => !existingIds.has(m.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      return INITIAL_PA_COMMITTEE;
    } catch {
      return INITIAL_PA_COMMITTEE;
    }
  });

  const [paEvaluations, setPaEvaluations] = useState<PaEvaluationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (!saved) return INITIAL_PA_EVALUATIONS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_PA_EVALUATIONS;
      // Filter out old mock evaluations
      return parsed.filter((e: any) => !e.id?.startsWith("eval_t-1_") && !e.id?.startsWith("eval_t-2_") && !e.id?.startsWith("eval_t-3_") && !e.id?.startsWith("eval_t-7_"));
    } catch {
      return INITIAL_PA_EVALUATIONS;
    }
  });

  // Exam Questions (School Examination Bank)
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_QUESTIONS);
      if (!saved) return INITIAL_EXAM_QUESTIONS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_EXAM_QUESTIONS;
    } catch {
      return INITIAL_EXAM_QUESTIONS;
    }
  });

  const [selectedExamQuestion, setSelectedExamQuestion] = useState<ExamQuestion | null>(null);

  // Exam Filters State
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examGradeFilter, setExamGradeFilter] = useState('all');
  const [examSubjectGroupFilter, setExamSubjectGroupFilter] = useState('all');
  const [examSubjectFilter, setExamSubjectFilter] = useState('all');
  const [examSemesterFilter, setExamSemesterFilter] = useState('all');
  const [examYearFilter, setExamYearFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [examSortBy, setExamSortBy] = useState<'latest' | 'views' | 'downloads' | 'title'>('latest');

  const resetExamFilters = () => {
    setExamSearchQuery('');
    setExamGradeFilter('all');
    setExamSubjectGroupFilter('all');
    setExamSubjectFilter('all');
    setExamSemesterFilter('all');
    setExamYearFilter('all');
    setExamTypeFilter('all');
    setExamSortBy('latest');
  };

  // Selected Detail Modals
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'title' | 'views'>('latest');

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_USER) !== null;
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Teacher Auth State
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState(false);
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState(false);
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiChatInitialQuestion, setAIChatInitialQuestion] = useState('');
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);

  // PA Committee Member Auth State
  const [currentCommitteeMember, setCurrentCommitteeMember] = useState<PaCommitteeMember | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMITTEE_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCommitteeLoginOpen, setIsCommitteeLoginOpen] = useState(false);
  const [varianceThreshold, setVarianceThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bangchalong_pa_variance_threshold');
      return saved ? Number(saved) || 10 : 10;
    } catch {
      return 10;
    }
  });

  const handleSetVarianceThreshold = (val: number) => {
    const safe = Math.max(1, Math.min(50, Math.round(val)));
    setVarianceThreshold(safe);
    try {
      localStorage.setItem('bangchalong_pa_variance_threshold', String(safe));
    } catch {
      // ignore
    }
  };

  const openAIChatWithQuestion = (question: string) => {
    setAIChatInitialQuestion(question);
    setIsAIChatOpen(true);
  };

  // Supabase Config State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());

  // --- Sync with Supabase PostgreSQL & Central Realtime Engine ---
  useEffect(() => {
    let isMounted = true;

    const syncFromSupabase = async () => {
      const client = getSupabaseClient();
      if (!client) return;

      try {
        const [
          remoteResources,
          remoteTeachers,
          remoteCategories,
          remoteNews,
          remoteDocs,
          remoteVideos,
          remoteCommittee,
          remoteEvaluations,
          remoteExams
        ] = await Promise.all([
          fetchResourcesFromSupabase(),
          fetchTeachersFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchNewsFromSupabase(),
          fetchDocumentsFromSupabase(),
          fetchVideosFromSupabase(),
          fetchCommitteeMembersFromSupabase(),
          fetchPaEvaluationsFromSupabase(),
          fetchExamQuestionsFromSupabase()
        ]);

        if (!isMounted) return;

        if (remoteResources && remoteResources.length > 0) {
          setResources(remoteResources);
          localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(remoteResources));
        }

        if (remoteTeachers && remoteTeachers.length > 0) {
          const existingIds = new Set(remoteTeachers.map((t) => t.id));
          const missing = INITIAL_TEACHERS.filter(t => !existingIds.has(t.id));
          const fullTeachers = missing.length > 0 ? [...remoteTeachers, ...missing] : remoteTeachers;
          setTeachers(fullTeachers);
          localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(fullTeachers));
        }

        if (remoteCategories && remoteCategories.length > 0) {
          setCategories(remoteCategories);
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteCategories));
        }

        if (remoteNews && remoteNews.length > 0) {
          setNewsList(remoteNews);
          localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(remoteNews));
        }

        if (remoteDocs && remoteDocs.length > 0) {
          setDocuments(remoteDocs);
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(remoteDocs));
        }

        if (remoteVideos && remoteVideos.length > 0) {
          setVideos(remoteVideos);
        }

        if (remoteCommittee && remoteCommittee.length > 0) {
          const existingIds = new Set(remoteCommittee.map((m) => m.id));
          const missing = INITIAL_PA_COMMITTEE.filter(m => !existingIds.has(m.id));
          const fullCommittee = missing.length > 0 ? [...remoteCommittee, ...missing] : remoteCommittee;
          fullCommittee.sort((a, b) => (a.setNumber || 1) - (b.setNumber || 1) || a.order - b.order);
          setPaCommitteeMembers(fullCommittee);
          localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(fullCommittee));
        }

        if (remoteEvaluations !== null && remoteEvaluations !== undefined) {
          setPaEvaluations(remoteEvaluations);
          localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(remoteEvaluations));
        }

        if (remoteExams && remoteExams.length > 0) {
          setExamQuestions(remoteExams);
          localStorage.setItem(STORAGE_KEYS.EXAM_QUESTIONS, JSON.stringify(remoteExams));
        }
      } catch (err) {
        console.info('Supabase initial sync active with local fallback.');
      }
    };

    syncFromSupabase();

    // Central Realtime listener across ALL tables
    const unsubRealtime = subscribeToAllRealtime((table) => {
      if (!isMounted) return;

      if (table === 'resources') {
        fetchResourcesFromSupabase().then(res => {
          if (res && isMounted) {
            setResources(res);
            localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(res));
          }
        });
      } else if (table === 'teachers' || table === 'pa_submissions') {
        fetchTeachersFromSupabase().then(t => {
          if (t && isMounted) {
            setTeachers(t);
            localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(t));
          }
        });
      } else if (table === 'categories') {
        fetchCategoriesFromSupabase().then(cats => {
          if (cats && isMounted) {
            setCategories(cats);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
          }
        });
      } else if (table === 'news') {
        fetchNewsFromSupabase().then(news => {
          if (news && isMounted) {
            setNewsList(news);
            localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
          }
        });
      } else if (table === 'school_documents' || table === 'documents') {
        fetchDocumentsFromSupabase().then(docs => {
          if (docs && isMounted) {
            setDocuments(docs);
            localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
          }
        });
      } else if (table === 'featured_videos' || table === 'videos') {
        fetchVideosFromSupabase().then(vids => {
          if (vids && isMounted) {
            setVideos(vids);
          }
        });
      } else if (table === 'committee_members') {
        fetchCommitteeMembersFromSupabase().then(cm => {
          if (cm && isMounted) {
            setPaCommitteeMembers(cm);
            localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(cm));
          }
        });
      } else if (table === 'pa_evaluations') {
        if (eventType === 'DELETE') {
          const deleteTargetId = newRecord?.id || oldRecord?.id;
          const deleteTeacherId = newRecord?.teacherId || oldRecord?.teacherId;
          const deleteCommitteeId = newRecord?.committeeId || oldRecord?.committeeId;

          setPaEvaluations(prev => {
            let next: PaEvaluationRecord[];
            if (deleteTargetId === 'all') {
              next = [];
            } else if (deleteTeacherId && deleteCommitteeId) {
              next = prev.filter(e => !(e.teacherId === deleteTeacherId && e.committeeId === deleteCommitteeId) && e.id !== deleteTargetId);
            } else if (deleteTeacherId) {
              next = prev.filter(e => e.teacherId !== deleteTeacherId && e.id !== deleteTargetId);
            } else if (deleteTargetId) {
              next = prev.filter(e => e.id !== deleteTargetId);
            } else {
              next = prev;
            }
            try {
              localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(next));
            } catch (err) {
              console.warn("Failed to update evaluations in local storage on delete:", err);
            }
            return next;
          });
        } else {
          fetchPaEvaluationsFromSupabase().then(ev => {
            if (ev && isMounted) {
              setPaEvaluations(ev);
              localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(ev));
            }
          });
        }
      } else if (table === 'exam_questions') {
        fetchExamQuestionsFromSupabase().then(exams => {
          if (exams && isMounted) {
            setExamQuestions(exams);
            localStorage.setItem(STORAGE_KEYS.EXAM_QUESTIONS, JSON.stringify(exams));
          }
        });
      }
    });

    return () => {
      isMounted = false;
      unsubRealtime();
    };
  }, [supabaseConfig]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setGradeFilter('all');
    setFileTypeFilter('all');
    setTeacherFilter('all');
    setSortBy('latest');
  };

  // Admin Login logic
  const loginAdmin = (usernameOrEmail: string, passwordInput?: string) => {
    const cleanUser = (usernameOrEmail || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    const isValidUsername = cleanUser === 'kmtravelstudio4-lang' || 
                            cleanUser === 'kmtravelstudio4@gmail.com' || 
                            cleanUser === 'kmtravelstudio4@bangchalong.ac.th' || 
                            cleanUser === 'admin' ||
                            cleanUser === 'admin@bangchalong.ac.th';
    const isValidPassword = cleanPass === '0911351744a';

    if (isValidUsername && isValidPassword) {
      setCurrentTeacher(null);
      localStorage.removeItem(STORAGE_KEYS.TEACHER_USER);

      const user: AdminUser = {
        id: 'admin-kmtravelstudio4-lang',
        email: 'kmtravelstudio4@gmail.com',
        name: 'ผู้ดูแลระบบ (Admin: kmtravelstudio4-lang)',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      };
      setIsAdmin(true);
      setAdminUser(user);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
      setIsAdminLoginOpen(false);
      return true;
    }
    
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Force logout teacher if admin mode is active
  useEffect(() => {
    if (isAdmin || activeTab === 'admin') {
      if (currentTeacher) {
        setCurrentTeacher(null);
        localStorage.removeItem(STORAGE_KEYS.TEACHER_USER);
      }
    }
  }, [isAdmin, activeTab, currentTeacher]);

  // Keep currentTeacher synced with teachers array
  useEffect(() => {
    if (currentTeacher) {
      const updated = teachers.find(t => t.id === currentTeacher.id);
      if (updated) {
        setCurrentTeacher(updated);
        localStorage.setItem(STORAGE_KEYS.TEACHER_USER, JSON.stringify(updated));
      }
    }
  }, [teachers]);

  // Teacher Login logic
  const loginTeacher = (teacherIdOrEmail: string, passwordInput: string) => {
    const q = (teacherIdOrEmail || '').trim().toLowerCase();
    const pass = (passwordInput || '').trim();

    if (!q) {
      return { success: false, message: 'กรุณากรอกชื่อ หรือ อีเมล ของท่าน' };
    }

    const found = teachers.find(t => 
      t.id.toLowerCase() === q || 
      (t.email && t.email.toLowerCase() === q) ||
      t.name.toLowerCase().includes(q)
    );

    if (!found) {
      return { success: false, message: 'ไม่พบชื่อหรืออีเมลคุณครูในระบบ กรุณาตรวจสอบหรือแจ้งแอดมิน' };
    }

    const expectedPassword = found.password || '123456';
    if (pass !== expectedPassword) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นสำหรับครูทุกคนคือ 123456)' };
    }

    setCurrentTeacher(found);
    localStorage.setItem(STORAGE_KEYS.TEACHER_USER, JSON.stringify(found));
    setIsTeacherLoginOpen(false);
    return { success: true, message: `ยินดีต้อนรับ ${found.name}` };
  };

  const logoutTeacher = () => {
    setCurrentTeacher(null);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_USER);
    setIsTeacherProfileOpen(false);
  };

  const updateCurrentTeacherProfile = async (updated: Partial<Teacher>) => {
    if (!currentTeacher) return;
    const cat = updated.subjectId ? categories.find(c => c.id === updated.subjectId) : null;

    const newTeacherData: Teacher = {
      ...currentTeacher,
      ...updated,
      ...(cat && { subjectName: cat.name })
    };

    // Calculate PA status reliably (if challenge title + any supporting url provided or marked completed)
    const isPaCompleted = Boolean(newTeacherData.paChallengeTitle && (newTeacherData.paVideoUrl || newTeacherData.paDocumentUrl || newTeacherData.paFolderUrl));
    newTeacherData.paStatus = isPaCompleted ? 'completed' : (updated.paStatus || newTeacherData.paStatus || 'pending');

    setTeachers(prev => {
      const updatedList = prev.map(t => t.id === currentTeacher.id ? newTeacherData : t);
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updatedList));
      return updatedList;
    });
    setCurrentTeacher(newTeacherData);
    localStorage.setItem(STORAGE_KEYS.TEACHER_USER, JSON.stringify(newTeacherData));

    await upsertTeacherToSupabase(newTeacherData);
  };

  const updateSupabaseConfig = (config: { url: string; anonKey: string }) => {
    const newConf = saveSupabaseConfigToStorage(config);
    setSupabaseConfig(newConf);
  };

  // Live resources with teacher & category join (guarantees teacherName, teacherPhoto, categoryName match main site)
  const liveResources = useMemo(() => {
    if (!Array.isArray(resources)) return [];
    return resources.map(r => {
      if (!r) return r;
      const teacher = (teachers || []).find(t => {
        if (!t) return false;
        if (r.teacherId && t.id === r.teacherId) return true;
        const tName = String(t.name || (t as any).full_name || '').trim().toLowerCase();
        const rName = String(r.teacherName || '').trim().toLowerCase();
        return Boolean(tName && rName && tName === rName);
      });

      const category = (categories || []).find(c => {
        if (!c) return false;
        if (r.categoryId && c.id === r.categoryId) return true;
        const cName = String(c.name || '').trim().toLowerCase();
        const rCatName = String(r.categoryName || '').trim().toLowerCase();
        return Boolean(cName && rCatName && cName === rCatName);
      });

      return {
        ...r,
        teacherId: r.teacherId || teacher?.id || '',
        teacherName: teacher?.name || (teacher as any)?.full_name || r.teacherName || 'ครูโรงเรียนวัดบางโฉลงใน',
        teacherPhoto: teacher?.photo || (teacher as any)?.photo_url || r.teacherPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop',
        teacherPosition: teacher?.position || r.teacherPosition || 'ครูผู้สอน',
        categoryId: r.categoryId || category?.id || '',
        categoryName: category?.name || r.categoryName || 'ทั่วไป',
        categoryColor: category?.color || r.categoryColor || '#005BAC',
      };
    });
  }, [resources, teachers, categories]);

  const approvedResources = useMemo(() => {
    return liveResources.filter(r => r.status !== 'rejected');
  }, [liveResources]);

  // CRUD for Resources
  const addResource = async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'views'>) => {
    const teacher = teachers.find(t => t.id === data.teacherId);
    const category = categories.find(c => c.id === data.categoryId);
    const today = new Date().toISOString().split('T')[0];
    const newId = `res-${Date.now()}`;

    const newRes: Resource = {
      ...data,
      id: newId,
      teacherName: teacher?.name || 'ครูผู้จัดทำ',
      teacherPhoto: teacher?.photo,
      teacherPosition: teacher?.position,
      categoryName: category?.name || 'ทั่วไป',
      categoryColor: category?.color || '#005BAC',
      downloads: 0,
      views: 1,
      createdAt: today,
      updatedAt: today,
      status: 'approved'
    };

    setResources(prev => [newRes, ...prev]);
    await upsertResourceToSupabase(newRes);

    if (data.teacherId && teacher) {
      const updatedTeacher = { ...teacher, resourcesCount: (teacher.resourcesCount || 0) + 1 };
      setTeachers(prev => prev.map(t => t.id === data.teacherId ? updatedTeacher : t));
      await upsertTeacherToSupabase(updatedTeacher);
    }
  };

  const submitResourceByTeacher = async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'views'>) => {
    await addResource(data);
  };

  const approveResource = async (id: string) => {
    const res = resources.find(r => r.id === id);
    if (!res) return;

    const updated: Resource = { ...res, status: 'approved' };
    setResources(prev => prev.map(r => r.id === id ? updated : r));
    await upsertResourceToSupabase(updated);
  };

  const rejectResource = async (id: string) => {
    const res = resources.find(r => r.id === id);
    if (!res) return;

    const updated: Resource = { ...res, status: 'rejected' };
    setResources(prev => prev.map(r => r.id === id ? updated : r));
    await upsertResourceToSupabase(updated);
  };

  const editResource = async (id: string, updated: Partial<Resource>) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = resources.find(r => r.id === id);
    if (!existing) return;

    const teacher = updated.teacherId ? teachers.find(t => t.id === updated.teacherId) : null;
    const category = updated.categoryId ? categories.find(c => c.id === updated.categoryId) : null;

    const updatedRes: Resource = {
      ...existing,
      ...updated,
      ...(teacher && {
        teacherName: teacher.name,
        teacherPhoto: teacher.photo,
        teacherPosition: teacher.position,
      }),
      ...(category && {
        categoryName: category.name,
        categoryColor: category.color,
      }),
      updatedAt: today
    };

    setResources(prev => prev.map(r => r.id === id ? updatedRes : r));
    await upsertResourceToSupabase(updatedRes);
  };

  const deleteResource = async (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    await deleteResourceFromSupabase(id);
  };

  const incrementDownloads = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r));
    incrementResourceCountersInSupabase(id, 'downloads');
  };

  const incrementViews = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, views: r.views + 1 } : r));
    incrementResourceCountersInSupabase(id, 'views');
  };

  // CRUD for Teachers
  const addTeacher = async (data: Omit<Teacher, 'id' | 'createdAt' | 'resourcesCount' | 'totalDownloads'>) => {
    const cat = categories.find(c => c.id === data.subjectId);
    const newId = `t-${Date.now()}`;
    const newT: Teacher = {
      ...data,
      id: newId,
      subjectName: cat?.name || 'กลุ่มสาระทั่วไป',
      resourcesCount: 0,
      totalDownloads: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTeachers(prev => [...prev, newT]);
    await upsertTeacherToSupabase(newT);
  };

  const editTeacher = async (id: string, updated: Partial<Teacher>) => {
    const existing = teachers.find(t => t.id === id);
    if (!existing) return;
    const cat = updated.subjectId ? categories.find(c => c.id === updated.subjectId) : null;

    const updatedT: Teacher = {
      ...existing,
      ...updated,
      ...(cat && { subjectName: cat.name })
    };

    if (updatedT.paChallengeTitle && (updatedT.paVideoUrl || updatedT.paDocumentUrl || updatedT.paFolderUrl)) {
      updatedT.paStatus = 'completed';
    }

    setTeachers(prev => {
      const next = prev.map(t => t.id === id ? updatedT : t);
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(next));
      return next;
    });

    if (currentTeacher && currentTeacher.id === id) {
      setCurrentTeacher(updatedT);
      localStorage.setItem(STORAGE_KEYS.TEACHER_USER, JSON.stringify(updatedT));
    }

    await upsertTeacherToSupabase(updatedT);
  };

  const deleteTeacher = async (id: string) => {
    setTeachers(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(next));
      return next;
    });
    await deleteTeacherFromSupabase(id);
  };

  const resetTeacherPa = async (id: string) => {
    const existing = teachers.find(t => t.id === id);
    if (!existing) return;
    const updatedT: Teacher = {
      ...existing,
      paChallengeTitle: '',
      paVideoUrl: '',
      paDocumentUrl: '',
      paStatus: 'pending'
    };
    setTeachers(prev => {
      const next = prev.map(t => t.id === id ? updatedT : t);
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(next));
      return next;
    });
    if (currentTeacher && currentTeacher.id === id) {
      setCurrentTeacher(updatedT);
      localStorage.setItem(STORAGE_KEYS.TEACHER_USER, JSON.stringify(updatedT));
    }
    await upsertTeacherToSupabase(updatedT);
  };

  // CRUD for Categories
  const addCategory = async (data: Omit<Category, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    const newC: Category = {
      ...data,
      id: newId,
      resourceCount: 0
    };
    setCategories(prev => [...prev, newC]);
    await upsertCategoryToSupabase(newC);
  };

  const editCategory = async (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    const target = categories.find(c => c.id === id);
    if (target) {
      await upsertCategoryToSupabase({ ...target, ...updated });
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await deleteCategoryFromSupabase(id);
  };

  // CRUD for News
  const addNews = async (data: Omit<News, 'id' | 'createdAt'>) => {
    const newId = `news-${Date.now()}`;
    const newN: News = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setNewsList(prev => [newN, ...prev]);
    await upsertNewsToSupabase(newN);
  };

  const editNews = async (id: string, updated: Partial<News>) => {
    setNewsList(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n));
    const target = newsList.find(n => n.id === id);
    if (target) {
      await upsertNewsToSupabase({ ...target, ...updated });
    }
  };

  const deleteNews = async (id: string) => {
    setNewsList(prev => prev.filter(n => n.id !== id));
    await deleteNewsFromSupabase(id);
  };

  // CRUD for Documents
  const addDocument = async (data: Omit<SchoolDocument, 'id' | 'updatedAt' | 'downloads'>) => {
    const newId = `doc-${Date.now()}`;
    const newD: SchoolDocument = {
      ...data,
      id: newId,
      updatedAt: new Date().toISOString().split('T')[0],
      downloads: 0
    };
    setDocuments(prev => [newD, ...prev]);
    await upsertDocumentToSupabase(newD);
  };

  const editDocument = async (id: string, updated: Partial<SchoolDocument>) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = documents.find(d => d.id === id);
    if (!existing) return;

    const merged: SchoolDocument = {
      ...existing,
      ...updated,
      updatedAt: today
    };

    setDocuments(prev => {
      const next = prev.map(d => d.id === id ? merged : d);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(next));
      return next;
    });
    await upsertDocumentToSupabase(merged);
  };

  const deleteDocument = async (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    await deleteDocumentFromSupabase(id);
  };

  // CRUD for Videos
  const addVideo = async (data: Omit<FeaturedVideo, 'id' | 'createdAt' | 'youtubeId'>) => {
    const newId = `vid-${Date.now()}`;
    const ytId = getYouTubeId(data.youtubeUrl);
    const newV: FeaturedVideo = {
      ...data,
      id: newId,
      youtubeId: ytId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setVideos(prev => [newV, ...prev]);
    await upsertVideoToSupabase(newV);
  };

  const deleteVideo = async (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    await deleteVideoFromSupabase(id);
  };

  // CRUD for Exam Questions (คลังข้อสอบ)
  const addExamQuestion = async (data: Omit<ExamQuestion, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'downloadCount'>) => {
    const newId = `exam-${Date.now()}`;
    const newExam: ExamQuestion = {
      ...data,
      id: newId,
      viewCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setExamQuestions(prev => [newExam, ...prev]);
    localStorage.setItem(STORAGE_KEYS.EXAM_QUESTIONS, JSON.stringify([newExam, ...examQuestions]));
    await upsertExamQuestionToSupabase(newExam);
  };

  const editExamQuestion = async (id: string, updated: Partial<ExamQuestion>) => {
    const today = new Date().toISOString().split('T')[0];
    setExamQuestions(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updated, updatedAt: today } : e);
      localStorage.setItem(STORAGE_KEYS.EXAM_QUESTIONS, JSON.stringify(next));
      return next;
    });
    const target = examQuestions.find(e => e.id === id);
    if (target) {
      const merged: ExamQuestion = { ...target, ...updated, updatedAt: today };
      await upsertExamQuestionToSupabase(merged);
    }
  };

  const deleteExamQuestion = async (id: string) => {
    setExamQuestions(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EXAM_QUESTIONS, JSON.stringify(next));
      return next;
    });
    await deleteExamQuestionFromSupabase(id);
  };

  const incrementExamViews = (id: string) => {
    setExamQuestions(prev => prev.map(e => e.id === id ? { ...e, viewCount: (e.viewCount || 0) + 1 } : e));
    incrementExamCounterInSupabase(id, 'views');
  };

  const incrementExamDownloads = (id: string) => {
    setExamQuestions(prev => prev.map(e => e.id === id ? { ...e, downloadCount: (e.downloadCount || 0) + 1 } : e));
    incrementExamCounterInSupabase(id, 'downloads');
  };

  // PA Committee Authentication & Portal
  const loginCommitteeMember = (codeOrId: string, preferredSetNumber?: number) => {
    const clean = codeOrId.trim().toLowerCase();
    
    let found = paCommitteeMembers.find(m => m.id.toLowerCase() === clean);

    if (!found && preferredSetNumber) {
      found = paCommitteeMembers.find(m => 
        m.setNumber === preferredSetNumber && 
        (m.code.trim().toLowerCase() === clean || `comm-${preferredSetNumber}-${m.order}` === clean)
      );
    }

    if (!found) {
      found = paCommitteeMembers.find(m => m.code.trim().toLowerCase() === clean);
    }
    
    if (!found) {
      const setNum = preferredSetNumber || 1;
      if (clean === 'bch1' || clean === 'ผอ' || clean === 'director') {
        found = paCommitteeMembers.find(m => m.setNumber === setNum && m.order === 1) || paCommitteeMembers.find(m => m.order === 1);
      } else if (clean === 'bch2') {
        found = paCommitteeMembers.find(m => (m.setNumber === setNum && m.order === 2) || m.id === `comm-${setNum}-2` || (m.setNumber === 1 && m.order === 2));
      } else if (clean === 'bch3') {
        found = paCommitteeMembers.find(m => (m.setNumber === setNum && m.order === 3) || m.id === `comm-${setNum}-3` || (m.setNumber === 1 && m.order === 3));
      } else if (clean === 'bch4') {
        found = paCommitteeMembers.find(m => m.id === 'comm-2-2' || (m.setNumber === 2 && m.order === 2));
      } else if (clean === 'bch5') {
        found = paCommitteeMembers.find(m => m.id === 'comm-2-3' || (m.setNumber === 2 && m.order === 3));
      } else if (clean === 'bch6') {
        found = paCommitteeMembers.find(m => m.id === 'comm-3-2' || (m.setNumber === 3 && m.order === 2));
      } else if (clean === 'bch7') {
        found = paCommitteeMembers.find(m => m.id === 'comm-3-3' || (m.setNumber === 3 && m.order === 3));
      }
    }

    if (!found) {
      return { success: false, message: 'รหัสประจำตัวกรรมการไม่ถูกต้อง กรุณาพิมพ์รหัสผ่านประจำตัวของท่าน' };
    }
    setCurrentCommitteeMember(found);
    localStorage.setItem(STORAGE_KEYS.COMMITTEE_USER, JSON.stringify(found));
    setIsCommitteeLoginOpen(false);
    return { success: true, message: `ยินดีต้อนรับ ${found.name} (${found.role})`, member: found };
  };

  const logoutCommitteeMember = () => {
    setCurrentCommitteeMember(null);
    localStorage.removeItem(STORAGE_KEYS.COMMITTEE_USER);
  };

  const addCommitteeMember = async (member: Omit<PaCommitteeMember, 'id'> & { id?: string }) => {
    const setNum = member.setNumber || 1;
    const sameSetMembers = paCommitteeMembers.filter(m => m.setNumber === setNum);
    const nextOrder = member.order || (sameSetMembers.length + 1);
    const memberId = member.id || `comm-${setNum}-${Date.now().toString().slice(-4)}`;
    
    const newMember: PaCommitteeMember = {
      ...member,
      id: memberId,
      order: nextOrder,
      setNumber: setNum,
      setName: member.setName || `ชุดที่ ${setNum}: คณะกรรมการประเมินชุดที่ ${setNum}`,
      targetDescription: member.targetDescription || 'ผู้รับการประเมินตามเกณฑ์',
      code: (member.code || `comm${setNum}${nextOrder}`).trim().toLowerCase(),
      avatar: member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'
    };

    setPaCommitteeMembers(prev => [...prev, newMember]);
    await upsertCommitteeMemberToSupabase(newMember);
  };

  const updateCommitteeMember = async (id: string, updated: Partial<PaCommitteeMember>) => {
    const target = paCommitteeMembers.find(m => m.id === id);
    if (!target) return;
    const merged: PaCommitteeMember = { ...target, ...updated };
    
    setPaCommitteeMembers(prev => prev.map(m => m.id === id ? merged : m));
    if (currentCommitteeMember?.id === id) {
      setCurrentCommitteeMember(merged);
      localStorage.setItem(STORAGE_KEYS.COMMITTEE_USER, JSON.stringify(merged));
    }
    
    await upsertCommitteeMemberToSupabase(merged);
  };

  const deleteCommitteeMember = async (id: string) => {
    setPaCommitteeMembers(prev => prev.filter(m => m.id !== id));
    if (currentCommitteeMember?.id === id) {
      setCurrentCommitteeMember(null);
      localStorage.removeItem(STORAGE_KEYS.COMMITTEE_USER);
    }
    await deleteCommitteeMemberFromSupabase(id);
  };

  const savePaEvaluation = async (evaluation: Omit<PaEvaluationRecord, 'id' | 'updatedAt'>) => {
    const evalId = `eval_${evaluation.teacherId}_${evaluation.committeeId}`;
    const now = new Date().toLocaleString('th-TH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const safeScore = evaluation.overallScore !== undefined && evaluation.overallScore !== null
      ? (isNaN(Number(evaluation.overallScore)) ? 80 : Math.min(100, Math.max(0, Math.round(Number(evaluation.overallScore)))))
      : undefined;
    
    const record: PaEvaluationRecord = {
      ...evaluation,
      ...(safeScore !== undefined ? { overallScore: safeScore } : {}),
      id: evalId,
      updatedAt: now
    };

    setPaEvaluations(prev => {
      const idx = prev.findIndex(e => e.id === evalId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });

    await upsertPaEvaluationToSupabase(record);
  };

  const clearTeacherEvaluation = async (teacherId: string, committeeId?: string) => {
    const targetEvalId = committeeId ? `eval_${teacherId}_${committeeId}` : undefined;

    setPaEvaluations(prev => {
      const next = prev.filter(e => {
        const matchTeacher = e.teacherId === teacherId;
        const matchComm = committeeId ? (e.committeeId === committeeId || e.id === targetEvalId) : true;
        return !(matchTeacher && matchComm);
      });
      try {
        localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to save evaluations to local storage:", err);
      }
      return next;
    });

    await deletePaEvaluationFromSupabase(teacherId, committeeId);
  };

  const clearAllTeacherEvaluations = async () => {
    setPaEvaluations([]);
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify([]));
    } catch (err) {
      console.warn("Failed to clear evaluations in local storage:", err);
    }
    await clearAllPaEvaluationsFromSupabase();
  };

  const toggleTeacherDocChecked = async (teacherId: string, committeeMember: PaCommitteeMember, feedback?: string) => {
    const evalId = `eval_${teacherId}_${committeeMember.id}`;
    const existing = paEvaluations.find(e => e.id === evalId);
    const teacher = teachers.find(t => t.id === teacherId);
    const now = new Date().toLocaleString('th-TH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newDocChecked = !(existing?.docChecked ?? false);

    const record: PaEvaluationRecord = {
      id: evalId,
      teacherId,
      teacherName: teacher?.name || 'คุณครู',
      committeeId: committeeMember.id,
      committeeName: committeeMember.name,
      committeeRole: committeeMember.role,
      docChecked: newDocChecked,
      docCheckedAt: newDocChecked ? now : undefined,
      docFeedback: feedback !== undefined ? feedback : (existing?.docFeedback || ''),
      videoChecked: existing?.videoChecked || false,
      videoCheckedAt: existing?.videoCheckedAt,
      videoFeedback: existing?.videoFeedback || '',
      overallStatus: existing?.overallStatus || (newDocChecked && existing?.videoChecked ? 'passed' : 'pending'),
      overallScore: existing?.overallScore,
      overallComment: existing?.overallComment,
      updatedAt: now
    };

    setPaEvaluations(prev => {
      const idx = prev.findIndex(e => e.id === evalId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });

    await upsertPaEvaluationToSupabase(record);
  };

  const toggleTeacherVideoChecked = async (teacherId: string, committeeMember: PaCommitteeMember, feedback?: string) => {
    const evalId = `eval_${teacherId}_${committeeMember.id}`;
    const existing = paEvaluations.find(e => e.id === evalId);
    const teacher = teachers.find(t => t.id === teacherId);
    const now = new Date().toLocaleString('th-TH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newVideoChecked = !(existing?.videoChecked ?? false);

    const record: PaEvaluationRecord = {
      id: evalId,
      teacherId,
      teacherName: teacher?.name || 'คุณครู',
      committeeId: committeeMember.id,
      committeeName: committeeMember.name,
      committeeRole: committeeMember.role,
      docChecked: existing?.docChecked || false,
      docCheckedAt: existing?.docCheckedAt,
      docFeedback: existing?.docFeedback || '',
      videoChecked: newVideoChecked,
      videoCheckedAt: newVideoChecked ? now : undefined,
      videoFeedback: feedback !== undefined ? feedback : (existing?.videoFeedback || ''),
      overallStatus: existing?.overallStatus || (existing?.docChecked && newVideoChecked ? 'passed' : 'pending'),
      overallScore: existing?.overallScore,
      overallComment: existing?.overallComment,
      updatedAt: now
    };

    setPaEvaluations(prev => {
      const idx = prev.findIndex(e => e.id === evalId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });

    await upsertPaEvaluationToSupabase(record);
  };

  const getTeacherEvaluations = (teacherId: string): PaEvaluationRecord[] => {
    return paEvaluations.filter(e => e.teacherId === teacherId);
  };

  const getCommitteeProgress = (committeeId: string) => {
    const member = paCommitteeMembers.find(m => m.id === committeeId);
    const assignedTeachers = member 
      ? teachers.filter(t => isTeacherAssignedToCommittee(t, member))
      : [];
    const assignedTeacherIds = new Set(assignedTeachers.map(t => t.id));
    
    const commEvals = paEvaluations.filter(e => e.committeeId === committeeId && assignedTeacherIds.has(e.teacherId));
    const totalTeachers = assignedTeachers.length;
    const docCheckedCount = commEvals.filter(e => e.docChecked).length;
    const videoCheckedCount = commEvals.filter(e => e.videoChecked).length;
    const fullyCheckedCount = commEvals.filter(e => e.docChecked && e.videoChecked).length;
    const percentage = totalTeachers > 0 ? Math.round((fullyCheckedCount / totalTeachers) * 100) : 0;
    
    return {
      totalTeachers,
      docCheckedCount,
      videoCheckedCount,
      fullyCheckedCount,
      percentage
    };
  };

  const getTeacherConsensus = (teacherId: string, setNumber?: number): TeacherConsensusResult => {
    const teacher = teachers.find(t => t.id === teacherId);
    const resolvedSet = setNumber ?? (teacher ? getTeacherCommitteeSetNumber(teacher) : null);
    
    const targetMembers = resolvedSet !== null
      ? paCommitteeMembers.filter(m => {
          if (Number(m.setNumber) !== resolvedSet) return false;
          if (teacher) return isTeacherAssignedToCommittee(teacher, m);
          return true;
        })
      : [];

    const evals = paEvaluations.filter(e => e.teacherId === teacherId);

    const memberScores = targetMembers.map(m => {
      const evaluation = evals.find(e => e.committeeId === m.id);
      const docChecked = Boolean(evaluation?.docChecked);
      const videoChecked = Boolean(evaluation?.videoChecked);
      const score = evaluation?.overallScore;
      const isFullyEvaluated = Boolean(docChecked && videoChecked && score !== undefined);
      
      let status: 'passed' | 'revision' | 'excellent' | 'pending' | 'not_started' = 'not_started';
      if (evaluation) {
        status = evaluation.overallStatus || (isFullyEvaluated ? 'passed' : 'pending');
      }

      return {
        member: m,
        evaluation,
        score,
        status,
        docChecked,
        videoChecked,
        isFullyEvaluated,
        feedbackDoc: evaluation?.docFeedback,
        feedbackVideo: evaluation?.videoFeedback,
        comment: evaluation?.overallComment
      };
    });

    const validScores = memberScores
      .map(ms => ms.score)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));

    const totalRequired = targetMembers.length;
    const completedCount = memberScores.filter(ms => ms.isFullyEvaluated).length;
    const isFullyCompleted = totalRequired > 0 && completedCount === totalRequired;

    let averageScore: number | null = null;
    let minScore: number | null = null;
    let maxScore: number | null = null;
    let scoreRange = 0;

    if (validScores.length > 0) {
      const sum = validScores.reduce((acc, curr) => acc + curr, 0);
      averageScore = Math.round((sum / validScores.length) * 10) / 10;
      minScore = Math.min(...validScores);
      maxScore = Math.max(...validScores);
      scoreRange = maxScore - minScore;
    }

    const isHighVariance = validScores.length >= 2 && scoreRange > varianceThreshold;

    return {
      teacherId,
      evaluations: evals,
      memberScores,
      averageScore,
      minScore,
      maxScore,
      scoreRange,
      isHighVariance,
      completedCount,
      totalRequired,
      isFullyCompleted
    };
  };

  const viewTeacherPublications = (teacher: Teacher) => {
    setTeacherFilter(teacher.id);
    setActiveTab('repository');
  };

  const viewCategoryResources = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setActiveTab('repository');
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      resources: liveResources,
      teachers,
      categories,
      newsList,
      documents,
      selectedResource,
      setSelectedResource,
      selectedTeacher,
      setSelectedTeacher,
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
      gradeFilter,
      setGradeFilter,
      fileTypeFilter,
      setFileTypeFilter,
      teacherFilter,
      setTeacherFilter,
      sortBy,
      setSortBy,
      resetFilters,
      examQuestions,
      selectedExamQuestion,
      setSelectedExamQuestion,
      examSearchQuery,
      setExamSearchQuery,
      examGradeFilter,
      setExamGradeFilter,
      examSubjectGroupFilter,
      setExamSubjectGroupFilter,
      examSubjectFilter,
      setExamSubjectFilter,
      examSemesterFilter,
      setExamSemesterFilter,
      examYearFilter,
      setExamYearFilter,
      examTypeFilter,
      setExamTypeFilter,
      examSortBy,
      setExamSortBy,
      resetExamFilters,
      addExamQuestion,
      editExamQuestion,
      deleteExamQuestion,
      incrementExamViews,
      incrementExamDownloads,
      isAdmin,
      adminUser,
      isAdminLoginOpen,
      setIsAdminLoginOpen,
      loginAdmin,
      logoutAdmin,
      currentTeacher,
      isTeacherLoginOpen,
      setIsTeacherLoginOpen,
      isTeacherProfileOpen,
      setIsTeacherProfileOpen,
      isAIPlannerOpen,
      setIsAIPlannerOpen,
      isAIChatOpen,
      setIsAIChatOpen,
      aiChatInitialQuestion,
      setAIChatInitialQuestion,
      openAIChatWithQuestion,
      isPWAInstallModalOpen,
      setIsPWAInstallModalOpen,
      loginTeacher,
      logoutTeacher,
      updateCurrentTeacherProfile,
      supabaseConfig,
      updateSupabaseConfig,
      addResource,
      submitResourceByTeacher,
      approveResource,
      rejectResource,
      approvedResources,
      editResource,
      deleteResource,
      incrementDownloads,
      incrementViews,
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
      editDocument,
      deleteDocument,
      videos,
      addVideo,
      deleteVideo,
      paCommitteeMembers,
      paEvaluations,
      currentCommitteeMember,
      isCommitteeLoginOpen,
      setIsCommitteeLoginOpen,
      loginCommitteeMember,
      logoutCommitteeMember,
      addCommitteeMember,
      updateCommitteeMember,
      deleteCommitteeMember,
      savePaEvaluation,
      clearTeacherEvaluation,
      clearAllTeacherEvaluations,
      toggleTeacherDocChecked,
      toggleTeacherVideoChecked,
      getTeacherEvaluations,
      getCommitteeProgress,
      varianceThreshold,
      setVarianceThreshold: handleSetVarianceThreshold,
      getTeacherConsensus,
      viewTeacherPublications,
      viewCategoryResources
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
