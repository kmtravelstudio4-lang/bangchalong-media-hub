# 🏗️ System Architecture: School Media & PA Management System
**โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)**
*Production-Ready Full Rebuild from Google AI Studio / Firebase to Supabase + Vercel*

---

## 1. Executive Summary & Architectural Vision

The rebuilt system transitions the school's digital infrastructure from a client-side Firebase prototype into an enterprise-grade, secure, multi-tenant academic portal hosted on **Vercel** with **Supabase PostgreSQL** as the Single Source of Truth.

### Core Guarantees:
1. **Preserve Exact UI/UX & Workflow**: Maintain pixel-accurate Thai school branding, responsive layouts (Mobile/Tablet/Desktop), PWA capabilities, and intuitive workflows for Teachers, Committee Evaluators, and School Administrators.
2. **Zero Firebase Runtime Dependency**: Complete elimination of client-side Firestore/Firebase Auth/Firebase Storage in production, while keeping original Firebase configurations safe as backup.
3. **Database-Enforced Integrity & Security**: Strict PostgreSQL `CHECK` constraints, foreign keys, triggers, and Row Level Security (RLS) to mathematically prevent cross-committee evaluations, invalid score ranges, or unassigned member leaks.
4. **Secure Server-Side AI Orchestration**: All Google Gemini 2.5/Flash AI calls (Lesson Planner, PA Challenge Generator, Teacher Pedagogical Q&A) routed strictly through server-side APIs—zero API key leakage on the frontend.
5. **Realtime Collaborative Evaluation**: Native Supabase Realtime WebSocket subscriptions for immediate score syncing, PA submissions, and media library updates.

---

## 2. High-Level System Architecture Diagram

```
                                  🌐 CLIENT LAYER
           ┌──────────────────────────────────────────────────────────┐
           │                   React 19 + Vite 6 + PWA                │
           │  (Responsive Desktop / Tablet / Mobile + Service Worker) │
           └──────────────┬────────────────────────────┬──────────────┘
                          │                            │
             Direct HTTPS / WSS API                    │ HTTPS /api/*
       (Anon Key + JWT / Realtime)                     │ (Serverless)
                          │                            │
                          ▼                            ▼
         ┌────────────────────────────────┐  ┌────────────────────────────────┐
         │     ⚡ SUPABASE CLOUD (BAAS)    │  │    🚀 VERCEL SERVERLESS API    │
         ├────────────────────────────────┤  ├────────────────────────────────┤
         │ • Supabase Auth (JWT & Roles)  │  │ • Node.js / Express Serverless │
         │ • PostgreSQL 16 DB Engine      │  │ • Gemini AI API Proxy          │
         │ • Row Level Security (RLS)     │  │ • Audit & Admin Server Ops     │
         │ • Supabase Storage Buckets     │  │ • Service Role Key (Protected) │
         │ • Realtime WebSocket Engine    │  └──────────────┬─────────────────┘
         └────────────────────────────────┘                 │
                                                            ▼
                                             ┌────────────────────────────────┐
                                             │     🤖 GOOGLE GEMINI API       │
                                             │  (Gemini 2.5 Flash Engine)     │
                                             └────────────────────────────────┘
```

---

## 3. Technology Stack Breakdown

| Layer | Technology | Role & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript 5.8 | Modern, type-safe reactive UI component architecture |
| **Build Tool & Bundler** | Vite 6 | Lightning-fast HMR and optimized production bundles |
| **Styling & Design System**| Tailwind CSS 4 + Lucide Icons | Responsive modern layout, custom school color palette, glassmorphism |
| **State Management** | React Context (`AppContext`) | Unified application state for Auth, Media, PA, and Committee |
| **Database & Engine** | Supabase PostgreSQL 16 | Relational data integrity, ACID compliance, Views, Triggers |
| **Authentication** | Supabase Auth + JWT Claims | Role-based access control (`admin`, `teacher`, `committee`) |
| **Storage Engine** | Supabase Storage (S3-compatible) | Secure object storage for media files, thumbnails, PDFs, and avatars |
| **Realtime Engine** | Supabase Realtime (WebSockets) | Live PA evaluation updates, committee consensus, and media feed |
| **AI Intelligence** | Google Gemini 2.5 API via Server | Generative lesson plans, PA challenge formulation, pedagogical Q&A |
| **Hosting & DevOps** | Vercel (Edge Network) | Global CDN, continuous deployment, automated SSL, Serverless API |
| **Offline & PWA** | Progressive Web App (Service Worker)| Installable mobile/desktop app, caching shell assets (excluding PII) |

---

## 4. Subsystems Architecture

### 4.1. Media Library Subsystem (คลังสื่อการสอน)
- **Cataloging & Taxonomy**: 8 core national learning subject groups (`กลุ่มสาระการเรียนรู้`) + Kindergarten (`อนุบาล`) + Support (`ทั่วไป`).
- **Media Ingestion**: Supports direct file uploads (PDF, PPTX, DOCX, ZIP, MP4) into Supabase Storage buckets, as well as external links (Canva, Google Drive, YouTube).
- **Public & Moderation Workflow**: Public discovery interface with full-text search, subject filters, grade-level filters, download/view counters, and admin approval pipeline.
- **Client-Side Image Optimization**: Pre-upload compression via Canvas/Sharp pipelines (`ImageUploadCompressor`) to reduce bandwidth and storage footprints.

### 4.2. PA Management Subsystem (ระบบการประเมิน ว.PA)
- **Teacher PA Lifecycle**:
  1. Draft PA Challenge Title, Year (e.g. 2569), Rationale, and Expected Outcomes.
  2. Upload/Attach PA Agreement Document (PA 1/ส), SAR, and Classroom Teaching Video clips.
  3. Submit for Evaluation -> Transitions status to `submitted`.
  4. Real-time feedback and score visibility once evaluated by assigned committee members.
- **Dynamic Committee Sets (ชุดกรรมการ)**:
  - **Set 1**: Strict evaluation of `ครูชำนาญการ` and `ครูชำนาญการพิเศษ` only.
  - **Set 2**: Strict evaluation of `ครู` and `ครูผู้ช่วย` only.
  - **Set 3**: Strict evaluation of `ครูอัตราจ้าง`, `พี่เลี้ยงเด็กพิเศษ/พิการ`, `ครูพี่เลี้ยง`, `นักการภารโรง`, `เจ้าหน้าที่ธุรการ` only.
  - *Zero Substring Matching*: Enforced via deterministic enum/lookup validation at both Database and application layers.
- **Dynamic Evaluator & Consensus System**:
  - Independent scorecards per committee member (0–100 score validation, document checklist, video checklist, narrative feedback).
  - Dynamic calculations for Average Score, Min, Max, Score Range, and Variance Threshold without hardcoding fixed committee counts.
  - Multi-set CSV report export aligned 100% with database metrics.

### 4.3. Gemini AI Assistant Subsystem (ระบบปัญญาประดิษฐ์ทางการศึกษา)
- **Architectural Security**: The client browser sends requests to `/api/ai/*` on the Vercel serverless backend.
- **Server-Side Key Protection**: `GEMINI_API_KEY` is loaded in Node.js runtime only. Frontend environment variables NEVER contain AI secret keys.
- **Pedagogical Fallback Engine**: If the Gemini API experiences network timeouts, a built-in pedagogical template engine synthesizes curriculum-compliant lesson plans based on the Basic Education Core Curriculum B.E. 2551 (2008).

---

## 5. Security & Authentication Model

```
                    ┌────────────────────────┐
                    │      auth.users        │
                    └───────────┬────────────┘
                                │ 1:1
                    ┌───────────▼────────────┐
                    │    public.profiles     │
                    │   (role: admin/teacher │
                    │        /committee)     │
                    └─────┬────────────┬─────┘
                          │            │
             1:1 (teacher)│            │ 1:1 (committee)
                          ▼            ▼
             ┌────────────────┐    ┌────────────────────┐
             │public.teachers │    │public.committee_   │
             │                │    │       members      │
             └───────┬────────┘    └─────────┬──────────┘
                     │                       │
                     └───────────┬───────────┘
                                 │ M:N via
                     ┌───────────▼────────────┐
                     │ committee_assignments  │
                     └────────────────────────┘
```

1. **Authentication Providers**:
   - **Admin**: Supabase Auth (Email + Secure Password).
   - **Teachers**: Supabase Auth (Email / Employee Code + Secure Password / Initial Setup).
   - **Committee Members**: Supabase Auth / Individual Member Codes with cryptographic authentication.
2. **Row Level Security (RLS)**:
   - Evaluated dynamically via `auth.uid()` and verified JWT claims.
   - Teachers can only inspect and edit their own drafts and submissions.
   - Committee members can only query teachers and evaluations explicitly assigned to them within their respective set.
   - Administrators hold system-wide audit and management privileges.
