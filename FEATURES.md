# 📋 Comprehensive Feature Inventory
**โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)**

---

## 1. Feature Mapping Matrix

| Feature | Source File | Current Implementation (Firebase/Local) | Target Implementation (Supabase Production) | Supabase Tables Involved | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Media Library Catalog** | `src/pages/RepositoryPage.tsx`, `src/components/ResourceCard.tsx` | Firestore `resources` collection | Supabase `public.resources` query with filter, pagination & realtime | `resources`, `categories`, `teachers` | ⏳ Planned |
| **Media Search & Filters** | `src/pages/RepositoryPage.tsx`, `src/context/AppContext.tsx` | Client-side array filtering | Supabase full-text search (`ilike` / `tsvector`) + category/grade indexes | `resources`, `categories` | ⏳ Planned |
| **Media Submission (Teacher)** | `src/pages/TeacherDashboardPage.tsx`, `src/components/ResourceDetailModal.tsx` | Firestore `setDoc('resources')` + client image upload | Supabase Storage upload (`media`, `media-thumbnails`) + `INSERT public.resources` | `resources`, `teachers`, Supabase Storage | ⏳ Planned |
| **Media Moderation (Admin)** | `src/components/AdminDashboard.tsx` | Firestore `updateDoc` (`approved`/`rejected`) | Supabase `UPDATE public.resources SET status = ...` via RLS Admin Policy | `resources`, `audit_logs` | ⏳ Planned |
| **Download & View Counters** | `src/components/ResourceDetailModal.tsx` | Firestore `increment(1)` on doc | Supabase RPC / SQL atomic increment function (`fn_increment_resource_counter`) | `resources`, `teachers` | ⏳ Planned |
| **Teacher Directory** | `src/pages/TeachersPage.tsx`, `src/components/TeacherCard.tsx` | Firestore `teachers` collection | Supabase `SELECT * FROM public.teachers WHERE is_active = true` | `teachers`, `categories` | ⏳ Planned |
| **Teacher Authentication** | `src/components/TeacherLoginModal.tsx`, `src/context/AppContext.tsx` | Plaintext check against `t.password` or `123456` | Supabase Auth (`signInWithPassword`) linked to `profiles` & `teachers` | `auth.users`, `profiles`, `teachers` | ⏳ Planned |
| **Teacher Dashboard & PA Edit** | `src/pages/TeacherDashboardPage.tsx` | Firestore `setDoc('teachers')` merge | Supabase `INSERT / UPDATE public.pa_submissions` with storage uploads for documents | `teachers`, `pa_submissions` | ⏳ Planned |
| **PA Committee Set 1 (ชำนาญการ/พิเศษ)** | `src/pages/PaCommitteePage.tsx`, `src/data/mockData.ts` | Exact matching helper `isTeacherSet1Eligible` | Supabase `fn_get_teacher_set_number()` + `committee_assignments` | `committee_sets`, `committee_members`, `committee_assignments` | ⏳ Planned |
| **PA Committee Set 2 (ครู/ครูผู้ช่วย)** | `src/pages/PaCommitteePage.tsx`, `src/data/mockData.ts` | Exact matching helper `isTeacherSet2Eligible` | Supabase `fn_get_teacher_set_number()` + `committee_assignments` | `committee_sets`, `committee_members`, `committee_assignments` | ⏳ Planned |
| **PA Committee Set 3 (อัตราจ้าง/สนับสนุน)**| `src/pages/PaCommitteePage.tsx`, `src/data/mockData.ts` | Exact matching helper `isTeacherSet3Eligible` | Supabase `fn_get_teacher_set_number()` + `committee_assignments` | `committee_sets`, `committee_members`, `committee_assignments` | ⏳ Planned |
| **Committee Portal & Login** | `src/components/CommitteeLoginModal.tsx`, `src/pages/PaCommitteePage.tsx` | Member Code match (`bch1`-`bch7`) in localStorage | Supabase Auth / Signed Evaluator Token with dynamic assignment | `committee_members`, `committee_assignments` | ⏳ Planned |
| **Scorecard Evaluation (0-100)** | `src/pages/PaCommitteePage.tsx` | Firestore `pa_evaluations` + local state | Supabase `INSERT / UPDATE public.pa_evaluations` with DB `CHECK (score >= 0 AND score <= 100)` | `pa_evaluations`, `pa_submissions` | ⏳ Planned |
| **Dynamic Consensus Calculation**| `src/context/AppContext.tsx`, `src/pages/PaCommitteePage.tsx` | Dynamic client computation (Avg, Min, Max, Range) | PostgreSQL View `v_teacher_pa_consensus` + client reactive sync | `pa_evaluations`, `teachers`, `committee_members` | ⏳ Planned |
| **Admin PA Management & Sets** | `src/components/AdminDashboard.tsx` | Client-filtered tables + dynamic committee controls | Supabase SQL aggregations per set + dynamic committee member CRUD | `committee_members`, `committee_assignments`, `teachers` | ⏳ Planned |
| **PA CSV Export** | `src/utils/paExportUtils.ts`, `src/components/AdminDashboard.tsx` | Client memory CSV builder | Supabase data export aligned with `v_teacher_pa_consensus` | `teachers`, `pa_submissions`, `pa_evaluations` | ⏳ Planned |
| **AI Lesson Planner Modal** | `src/components/AILessonPlannerModal.tsx` | Node Express `/api/ai/lesson-plan` (Gemini) | Serverless `/api/ai/lesson-plan` (Gemini 2.5 Flash via Server-Side API) | None (Stateless / Optional Log) | ⏳ Planned |
| **AI PA Idea Generator** | `src/pages/TeacherDashboardPage.tsx` | Node Express `/api/ai/pa-idea` | Serverless `/api/ai/pa-idea` (Gemini 2.5 Flash) | None (Stateless / Optional Log) | ⏳ Planned |
| **AI Teacher Q&A Assistant** | `src/components/TeacherQAChatModal.tsx`, `src/components/TeacherQASection.tsx` | Node Express `/api/ai/teacher-qa` | Serverless `/api/ai/teacher-qa` | None (Stateless / Optional Log) | ⏳ Planned |
| **News & Announcements** | `src/pages/NewsPage.tsx`, `src/components/AdminDashboard.tsx` | Firestore `news` collection | Supabase `public.news` with admin CRUD | `news`, Supabase Storage | ⏳ Planned |
| **School Documents** | `src/pages/DocumentsPage.tsx`, `src/components/AdminDashboard.tsx` | Firestore `documents` collection | Supabase `public.school_documents` with storage file uploads | `school_documents`, Supabase Storage | ⏳ Planned |
| **Featured Videos Gallery** | `src/pages/HomePage.tsx`, `src/components/AdminDashboard.tsx` | Firestore `videos` collection | Supabase `public.featured_videos` | `featured_videos` | ⏳ Planned |
| **PWA Installation & Offline** | `src/components/PWAInstallBanner.tsx`, `src/components/PWAInstallModal.tsx` | `usePWAInstall.ts` + `public/manifest.json` | Modern Service Worker with secure shell caching (no PII caching) | Browser Cache Storage | ⏳ Planned |
| **Image Compression Tool** | `src/components/ImageUploadCompressor.tsx`, `src/utils/imageCompressor.ts` | Browser HTML5 Canvas compression | Client-side compression pipeline before Supabase Storage upload | Supabase Storage (`media-thumbnails`) | ⏳ Planned |
| **Audit Logging** | N/A (Newly added) | Not tracked in original prototype | Supabase `public.audit_logs` triggered on key mutations | `audit_logs` | ⏳ Planned |
