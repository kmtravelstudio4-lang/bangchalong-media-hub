# 🔥 Firebase Usage Audit & Decoupling Strategy
**โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)**

---

## 1. Firebase Source Audit Summary

| File Path | Firebase Dependencies / Methods Used | Role in Legacy Prototype | Supabase Production Replacement |
| :--- | :--- | :--- | :--- |
| `src/lib/firebase.ts` | `initializeApp`, `getFirestore`, `getAuth` | Instantiated Firebase App & Firestore Client | Replaced by `src/services/supabaseClient.ts` |
| `src/context/AppContext.tsx` | `collection`, `doc`, `onSnapshot`, `setDoc`, `updateDoc`, `deleteDoc`, `getDocs`, `getDoc`, `increment` | Central state sync, seeding, and CRUD operations on Firestore | Supabase JS Client (`supabase.from(...)`, `supabase.channel(...)`, RPCs) |
| `firebase-applet-config.json` | Project ID, API keys, Firestore database ID | Configuration file for Firebase Applet | Preserved as static backup; not referenced at runtime |
| `firebase-blueprint.json` | JSON Schema of Firestore collections | Data schema blueprint | Replaced by `DATABASE.md` PostgreSQL schema |
| `firestore.rules` | Firestore security rules definition | Legacy access rules | Replaced by `RLS.md` Supabase PostgreSQL RLS |
| `package.json` | `"firebase": "^12.17.0"` | Node package dependency | Retained during migration staging; removed post-verification |

---

## 2. Decoupling Roadmap (Zero Data Loss & Zero Breaking Changes)

```
[ PHASE A: Audit & Schema Prep ] (Current)
  ├── Map all Firestore collections -> PostgreSQL Tables
  ├── Keep Firebase intact for reference and backup
  └── Draft Supabase SQL DDL & RLS

[ PHASE B: Parallel Service Layer Setup ]
  ├── Implement `src/services/supabaseClient.ts`
  ├── Implement Supabase data adapter (`src/services/supabaseService.ts`)
  └── Wire environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

[ PHASE C: AppContext State Migration ]
  ├── Switch `AppContext.tsx` from `onSnapshot(firestore)` to `supabase.from().select()` + `supabase.channel()`
  ├── Switch CRUD methods (`addResource`, `savePaEvaluation`, etc.) to Supabase mutations
  └── Zero Firebase runtime calls during active sessions

[ PHASE D: Verification & Clean Removal ]
  ├── Test all CRUD, Auth, PA, Evaluation, and Consensus flows
  ├── Remove Firebase import from `AppContext.tsx`
  ├── Remove `src/lib/firebase.ts` or mark deprecated
  └── Clean `package.json` dependency
```

---

## 3. Strict Non-Destructive Invariants
1. **No Automated Script Deletion**: No scripts will delete the remote Firestore database or wipe existing Firebase collections.
2. **Offline Resilience**: Supabase client will gracefully handle transient connection drops with structured fallback state.
3. **Data Parity Verification**: Before sunsetting Firebase, all initial entities (80+ mock teachers, 8 core categories, resources, committee members) will be fully seeded into Supabase.
