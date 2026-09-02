export type GradeLevel = 
  | '-'
  | 'อนุบาล'
  | 'อนุบาล 1'
  | 'อนุบาล 2'
  | 'อนุบาล 3'
  | 'ป.1'
  | 'ป.2'
  | 'ป.3'
  | 'ป.4'
  | 'ป.5'
  | 'ป.6'
  | 'ม.1'
  | 'ม.2'
  | 'ม.3'
  | 'ทุกระดับชั้น';

export type FileType = 
  | 'PDF'
  | 'PowerPoint'
  | 'Word'
  | 'ZIP'
  | 'Video'
  | 'Canva Link'
  | 'Google Drive Link';

export interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string;
  description?: string;
  resourceCount?: number;
}

export interface Teacher {
  id: string;
  name: string;
  position: string;
  academicStanding?: string; // วิทยฐานะ เช่น ครูผู้ช่วย, ครู, ครูชำนาญการ, ครูชำนาญการพิเศษ, ครูเชี่ยวชาญ
  photo: string;
  bio: string;
  email: string;
  facebook?: string;
  subjectId: string;
  subjectName?: string;
  resourcesCount?: number;
  totalDownloads?: number;
  createdAt: string;
  paChallengeTitle?: string; // ชื่อประเด็นท้าทาย PA (Performance Agreement)
  paYear?: string; // ปีการศึกษา เช่น 2569
  paVideoUrl?: string; // ลิงก์วิดีโอคลิปการสอน / วิดีโอ PA
  paDocumentUrl?: string; // ลิงก์ไฟล์เอกสารข้อตกลง PA
  paFolderUrl?: string; // ลิงก์รวมโฟลเดอร์ผลงาน / เอกสารทั้งหมด (Google Drive Folder)
  paStatus?: 'completed' | 'pending'; // สถานะการจัดทำ PA (จัดทำเรียบร้อยแล้ว / ยังไม่จัดทำ)
  password?: string; // รหัสผ่านเข้าสู่ระบบของคุณครู (default: 123456)
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  cover: string;
  fileUrl: string;
  previewUrl?: string;
  fileType: FileType;
  fileSize?: string;
  teacherId: string;
  teacherName?: string;
  teacherPhoto?: string;
  teacherPosition?: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  gradeLevel: GradeLevel;
  tags: string[];
  downloads: number;
  views: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  status?: 'approved' | 'pending' | 'rejected'; // สถานะอนุมัติสื่อ (pending/approved/rejected)
}

export interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  author: string;
  pinned?: boolean;
  createdAt: string;
}

export interface SchoolDocument {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  updatedAt: string;
  downloads: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  avatar?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface FeaturedVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  description?: string;
  createdAt: string;
}

export type ExamType = 
  | 'ข้อสอบก่อนเรียน'
  | 'ข้อสอบหลังเรียน'
  | 'แบบทดสอบ'
  | 'แบบฝึกหัด'
  | 'แบบประเมิน'
  | 'ข้อสอบกลางภาค'
  | 'ข้อสอบปลายภาค'
  | 'อื่นๆ';

export type ExamStatus = 'draft' | 'published' | 'archived';

export interface ExamQuestion {
  id: string;
  title: string;
  description?: string;
  subjectGroup: string; // กลุ่มสาระการเรียนรู้
  subject: string; // วิชา
  gradeLevel: GradeLevel | string; // ระดับชั้น
  semester?: string; // ภาคเรียนที่ 1, ภาคเรียนที่ 2
  academicYear?: string; // ปีการศึกษา เช่น 2569
  examType: ExamType | string; // ประเภทข้อสอบ
  creatorName?: string; // ผู้จัดทำ
  examUrl: string; // URL ข้อสอบ (Google Forms, Drive, Canva, PDF, Web)
  coverImageUrl?: string; // รูปภาพปกข้อสอบ
  status: ExamStatus; // draft | published | archived
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 
  | 'home'
  | 'repository'
  | 'exam-library'
  | 'teachers'
  | 'pa'
  | 'pa-committee'
  | 'teacher-dashboard'
  | 'subjects'
  | 'news'
  | 'documents'
  | 'about'
  | 'contact'
  | 'admin'
  | 'ai-planner';

export interface PaCommitteeMember {
  id: string; // e.g. 'comm-1-1', 'comm-1-2', 'comm-1-3', 'comm-2-1', 'comm-2-2', 'comm-2-3', 'comm-3-1', 'comm-3-2', 'comm-3-3'
  order: number; // 1, 2, 3 (1=ประธานกรรมการ, 2=กรรมการคนที่ 2, 3=กรรมการคนที่ 3)
  setNumber: number; // 1 | 2 | 3 | number
  setName: string; // เช่น 'ชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ'
  targetDescription: string; // รายละเอียดผู้รับการประเมิน เช่น 'วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ'
  name: string;
  role: string; // เช่น 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)'
  position: string;
  code: string; // รหัสผ่านประจำตัวกรรมการ เช่น 'bch1', 'bch2', 'bch3', 'bch4', 'bch5', 'bch6', 'bch7'
  avatar?: string;
  phone?: string;
  email?: string;
  assignedTeacherIds?: string[]; // กำหนดรายชื่อครูที่ได้รับมอบหมายประเมินเฉพาะบุคคล (optional)
}

export interface PaEvaluationRecord {
  id: string; // `eval_${teacherId}_${committeeId}`
  teacherId: string;
  teacherName: string;
  committeeId: string;
  committeeName: string;
  committeeRole: string;
  docChecked: boolean; // ตรวจดูเอกสารรายงานผล PA แล้ว
  docCheckedAt?: string; // วันที่เวลาที่ตรวจเอกสาร
  docFeedback?: string; // ข้อเสนอแนะเอกสาร
  videoChecked: boolean; // ตรวจดูคลิปประเมิน PA แล้ว
  videoCheckedAt?: string; // วันที่เวลาที่ตรวจคลิป
  videoFeedback?: string; // ข้อเสนอแนะคลิป
  overallStatus: 'passed' | 'revision' | 'excellent' | 'pending'; // ผ่านเกณฑ์ / ให้ปรับปรุง / ดีเด่น / รอดำเนินการ
  overallScore?: number; // คะแนนประเมินรวม (เช่น 85/100)
  overallComment?: string; // ความเห็นสรุปของกรรมการ
  updatedAt: string;
}

export interface TeacherConsensusResult {
  teacherId: string;
  evaluations: PaEvaluationRecord[];
  memberScores: {
    member: PaCommitteeMember;
    evaluation?: PaEvaluationRecord;
    score?: number;
    status: 'passed' | 'revision' | 'excellent' | 'pending' | 'not_started';
    docChecked: boolean;
    videoChecked: boolean;
    isFullyEvaluated: boolean;
    feedbackDoc?: string;
    feedbackVideo?: string;
    comment?: string;
  }[];
  averageScore: number | null;
  minScore: number | null;
  maxScore: number | null;
  scoreRange: number; // maxScore - minScore
  isHighVariance: boolean; // scoreRange > varianceThreshold
  completedCount: number;
  totalRequired: number;
  isFullyCompleted: boolean;
}

export interface AILessonPlanRequest {
  subject: string;
  gradeLevel: string;
  topic: string;
  duration?: string;
  teachingMethod?: string;
  specificNeeds?: string;
}

export interface AILessonPlanResult {
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  timeAllocation: string;
  coreConcept: string;
  standardAndIndicator: string;
  objectives: {
    knowledge: string[];
    process: string[];
    attitude: string[];
  };
  learningSteps: {
    intro: { title: string; time: string; details: string; questions: string[] };
    teaching: { title: string; time: string; details: string; activeActivities: string[] };
    conclusion: { title: string; time: string; details: string; reflectionQuestions: string[] };
  };
  instructionalMedia: string[];
  assessment: {
    methods: string[];
    tools: string[];
    criteria: string;
  };
  worksheetActivity: string;
  postLessonReflection: string;
  paAlignmentTips: string;
}
