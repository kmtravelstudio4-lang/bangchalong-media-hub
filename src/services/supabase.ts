export * from './supabaseClient';
export * from './supabaseService';

/* Full Production PostgreSQL Schema Generator for Admin Dashboard & SQL Editor */
export const SUPABASE_SQL_SCHEMA = `-- =============================================================================
-- โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)
-- Complete Production PostgreSQL Schema & RLS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'committee')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#005BAC',
  icon_name TEXT NOT NULL DEFAULT 'BookOpen',
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  academic_standing TEXT,
  subject_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  photo_url TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  facebook TEXT,
  school_year TEXT NOT NULL DEFAULT '2569',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  resources_count INT NOT NULL DEFAULT 0,
  total_downloads INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  preview_url TEXT,
  file_type TEXT NOT NULL,
  file_size TEXT,
  teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  grade_level TEXT NOT NULL DEFAULT 'ทุกระดับชั้น',
  tags TEXT[] NOT NULL DEFAULT '{}',
  downloads INT NOT NULL DEFAULT 0 CHECK (downloads >= 0),
  views INT NOT NULL DEFAULT 0 CHECK (views >= 0),
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.0),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Committee Sets
CREATE TABLE IF NOT EXISTS public.committee_sets (
  set_number INT PRIMARY KEY CHECK (set_number IN (1, 2, 3)),
  name TEXT NOT NULL,
  target_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.committee_sets (set_number, name, target_description)
VALUES
  (1, 'ชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ', 'วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ'),
  (2, 'ชุดที่ 2: ประเมินครู และครูผู้ช่วย', 'ตำแหน่งครู (ค.ศ.1) และครูผู้ช่วย'),
  (3, 'ชุดที่ 3: ประเมินครูอัตราจ้าง และบุคลากรทางการศึกษา', 'ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ/พิเศษ, ครูพี่เลี้ยง, นักการภารโรง, เจ้าหน้าที่ธุรการ')
ON CONFLICT (set_number) DO UPDATE SET
  name = EXCLUDED.name,
  target_description = EXCLUDED.target_description;

-- 6. Committee Members
CREATE TABLE IF NOT EXISTS public.committee_members (
  id TEXT PRIMARY KEY,
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  set_number INT NOT NULL REFERENCES public.committee_sets(set_number) ON DELETE CASCADE,
  member_order INT NOT NULL CHECK (member_order >= 1),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  position TEXT NOT NULL,
  login_code TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_committee_set_order UNIQUE (set_number, member_order)
);

-- 7. PA Submissions
CREATE TABLE IF NOT EXISTS public.pa_submissions (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL DEFAULT '2569',
  challenge_title TEXT NOT NULL,
  challenge_description TEXT,
  expected_outcome TEXT,
  document_url TEXT,
  sar_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'completed')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_teacher_year_pa UNIQUE (teacher_id, school_year)
);

-- 8. PA Evaluations
CREATE TABLE IF NOT EXISTS public.pa_evaluations (
  id TEXT PRIMARY KEY,
  pa_submission_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  committee_member_id TEXT NOT NULL REFERENCES public.committee_members(id) ON DELETE CASCADE,
  document_checked BOOLEAN NOT NULL DEFAULT FALSE,
  document_checked_at TIMESTAMPTZ,
  document_feedback TEXT,
  video_checked BOOLEAN NOT NULL DEFAULT FALSE,
  video_checked_at TIMESTAMPTZ,
  video_feedback TEXT,
  score NUMERIC(5, 2) CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'revision', 'excellent')),
  overall_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_submission_evaluator UNIQUE (pa_submission_id, committee_member_id)
);

-- 9. News, Documents, Videos
CREATE TABLE IF NOT EXISTS public.news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'ข่าวประชาสัมพันธ์',
  author TEXT NOT NULL DEFAULT 'ฝ่ายวิชาการ',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.school_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'แบบฟอร์มวิชาการ',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'PDF',
  file_size TEXT,
  downloads INT NOT NULL DEFAULT 0 CHECK (downloads >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.featured_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pa_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pa_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public Read Resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public Read Committee Sets" ON public.committee_sets FOR SELECT USING (true);
CREATE POLICY "Public Read Committee Members" ON public.committee_members FOR SELECT USING (true);
CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public Read School Documents" ON public.school_documents FOR SELECT USING (true);
CREATE POLICY "Public Read Featured Videos" ON public.featured_videos FOR SELECT USING (true);
CREATE POLICY "Authenticated Full Access Resources" ON public.resources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Full Access Evaluations" ON public.pa_evaluations FOR ALL USING (auth.role() = 'authenticated');
`;
