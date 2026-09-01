# 🚀 Production Deployment Plan: Vercel + Supabase
**โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)**

---

## 1. Production Topology

```
                  ┌─────────────────────────────────────┐
                  │          DNS / CUSTOM DOMAIN        │
                  │   e.g. media.bangchalong.ac.th      │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │             VERCEL CDN              │
                  ├──────────────────┬──────────────────┤
                  │ Static Frontend  │ Serverless APIs  │
                  │ (React Vite SPA) │ (/api/ai/*, etc) │
                  └────────┬─────────┴────────┬─────────┘
                           │                  │
        HTTPS (Public Anon Key)         HTTPS (Protected Service Role Key)
                           │                  │
                           ▼                  ▼
                  ┌─────────────────────────────────────┐
                  │           SUPABASE CLOUD            │
                  │ • PostgreSQL 16 DB & RLS            │
                  │ • Auth Engine & JWT                 │
                  │ • S3 Storage Buckets                │
                  │ • Realtime WebSocket Engine         │
                  └─────────────────────────────────────┘
```

---

## 2. Environment Variables Configuration

### 2.1. Client-Side Variables (Vite Frontend Build)
*Safe to expose in client bundle; restricted by Supabase RLS*
- `VITE_SUPABASE_URL`: The Supabase project API endpoint URL (e.g. `https://xyzcompany.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: The Supabase public anonymous API key (enforces RLS on every query).

### 2.2. Server-Side Variables (Vercel Serverless Functions)
*CRITICAL: Never exposed in client code or Git repository*
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase administrative key for server-side verification and migration scripts.
- `GEMINI_API_KEY`: Google Gemini Generative AI API Key for server-side lesson planning, PA generation, and Q&A.
- `PORT`: Default `3000` (Node runtime / Express local development).

---

## 3. Storage Buckets Configuration

| Bucket Name | Public Access | MIME Types Allowed | Size Limit | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `media` | Public (Read) | PDF, PPTX, DOCX, ZIP, MP4, WebP, PNG, JPEG | 50 MB | Primary instructional files |
| `media-thumbnails` | Public (Read) | JPEG, PNG, WebP, SVG | 5 MB | Cover thumbnails for media items |
| `documents` | Public (Read) | PDF, DOCX, XLSX | 25 MB | Official school forms and templates |
| `avatars` | Public (Read) | JPEG, PNG, WebP | 5 MB | Teacher and committee profile photos |
| `pa-documents` | Restricted (RLS) | PDF, DOCX, ZIP | 50 MB | PA submission files and SAR reports |

---

## 4. Build & Production Verification Steps

1. **Local Build Check**:
   ```bash
   npm run build
   ```
2. **Typecheck & Linting**:
   ```bash
   npm run lint
   ```
3. **PWA Shell Caching & Service Worker**:
   - Verify `registerServiceWorker.ts` registers without caching authenticated PII.
4. **Vercel Deployment**:
   - Connect Git repository to Vercel.
   - Configure Environment Variables in Vercel Project Settings.
   - Automatic branch previews and zero-downtime production rollouts.
