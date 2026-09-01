# 🔄 Non-Destructive Data Migration Plan
**โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)**

---

## 1. Migration Principles
1. **Zero Impact on Source**: The legacy Firebase project and Firestore collections remain 100% read-only and untouched.
2. **Four-Stage Ingestion Pipeline**:
   - **Stage 1 (Preview)**: Scan and inspect candidate records from seed sources or Firebase exports.
   - **Stage 2 (Validate)**: Enforce strict data types, foreign key referential integrity, and exact committee classification.
   - **Stage 3 (Import)**: Transactional batch upsert into Supabase PostgreSQL using Supabase Service Role / Admin Client.
   - **Stage 4 (Report)**: Generate verification metrics and audit logs.

---

## 2. Entity Mapping & Data Normalization

| Firestore / Mock Field | Supabase Target Table.Column | Transformation / Validation Rule |
| :--- | :--- | :--- |
| `teachers.academicStanding` | `public.teachers.academic_standing` | Trim & normalize spaces; deterministic set classifier |
| `teachers.position` | `public.teachers.position` | Required non-empty string |
| `teachers.subjectId` | `public.teachers.subject_id` | Foreign key referencing `public.categories(id)` |
| `teachers.paChallengeTitle` | `public.pa_submissions.challenge_title` | Extracted into separate `pa_submissions` relational table |
| `teachers.paVideoUrl` | `public.pa_submissions.video_url` | Normalized video URL |
| `teachers.paDocumentUrl` | `public.pa_submissions.document_url` | Normalized document link |
| `resources.cover` | `public.resources.cover_url` | Valid URL string or Supabase Storage path |
| `resources.fileUrl` | `public.resources.file_url` | Valid file URL / Storage link |
| `pa_evaluations.overallScore` | `public.pa_evaluations.score` | Clamped to integer / decimal `[0, 100]` |
| `pa_committee.setNumber` | `public.committee_members.set_number` | Integer `1`, `2`, or `3` referencing `committee_sets` |

---

## 3. Dedicated Migration Tooling Architecture

A dedicated standalone migration script (`scripts/migrateToSupabase.ts`) will be provided:
- **Dry-run mode**: `npm run migrate -- --dry-run` to output full validation reports without writing to Supabase.
- **Execute mode**: `npm run migrate -- --execute` to perform transactional upserts.
- **Rollback safety**: All operations use `ON CONFLICT (id) DO UPDATE` to prevent duplicate primary key collisions.
