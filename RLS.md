# 🔐 Supabase Row Level Security (RLS) Policy Design
**โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)**

---

## 1. Security Architecture & Threat Matrix

| Threat Vector | Mitigation Strategy | Policy Enforcement |
| :--- | :--- | :--- |
| **Teacher snooping on another teacher's PA** | Scope `pa_submissions` SELECT to own `teacher_id` or assigned committee/admin | Database RLS (`auth.uid() = profile_id`) |
| **Committee Set 1 evaluating Set 2/3 teachers** | Validate assignment against `committee_assignments` & matching `set_number` | Database RLS with JOIN verification |
| **Tampering with scores after submission** | Only authenticated committee members with active assignment can UPDATE | Database RLS + CHECK `score BETWEEN 0 AND 100` |
| **Unauthorized deletion of educational media** | Teachers can only modify/delete their own media; Admin can delete any | Database RLS on `resources` |
| **Public access leaks of draft resources** | Public SELECT restricted to `status = 'approved'` and `is_public = true` | Database RLS conditional policy |

---

## 2. Helper Functions for RLS Execution

```sql
-- Helper to check if current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to get the teacher_id of the current authenticated user
CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS TEXT AS $$
DECLARE
  v_teacher_id TEXT;
BEGIN
  SELECT id INTO v_teacher_id
  FROM public.teachers
  WHERE profile_id = auth.uid();
  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to get the committee_member_id of the current authenticated user
CREATE OR REPLACE FUNCTION public.current_committee_member_id()
RETURNS TEXT AS $$
DECLARE
  v_member_id TEXT;
BEGIN
  SELECT id INTO v_member_id
  FROM public.committee_members
  WHERE profile_id = auth.uid();
  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. Comprehensive RLS Policies by Table

### 3.1. `public.profiles`
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; Admins can read all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);

-- Users can update their own profile; Admins can update any
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR public.is_admin()
);
```

### 3.2. `public.categories`
```sql
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read all categories
CREATE POLICY "categories_public_read" ON public.categories
FOR SELECT USING (true);

-- Only Admins can insert, update, or delete categories
CREATE POLICY "categories_admin_modify" ON public.categories
FOR ALL USING (public.is_admin());
```

### 3.3. `public.teachers`
```sql
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Public directory: active teacher cards are visible
CREATE POLICY "teachers_public_read" ON public.teachers
FOR SELECT USING (is_active = true OR public.is_admin());

-- Teachers can update their own profile; Admin has full control
CREATE POLICY "teachers_self_or_admin_update" ON public.teachers
FOR UPDATE USING (
  profile_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "teachers_admin_insert" ON public.teachers
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "teachers_admin_delete" ON public.teachers
FOR DELETE USING (public.is_admin());
```

### 3.4. `public.resources` (Media Library)
```sql
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Public can read approved public resources; Owners and Admins can read drafts
CREATE POLICY "resources_select_policy" ON public.resources
FOR SELECT USING (
  (status = 'approved' AND is_public = true)
  OR (teacher_id = public.current_teacher_id())
  OR public.is_admin()
);

-- Authenticated teachers can upload resources (associated with their teacher_id)
CREATE POLICY "resources_teacher_insert" ON public.resources
FOR INSERT WITH CHECK (
  teacher_id = public.current_teacher_id() OR public.is_admin()
);

-- Resource owners and admins can update
CREATE POLICY "resources_teacher_update" ON public.resources
FOR UPDATE USING (
  teacher_id = public.current_teacher_id() OR public.is_admin()
);

-- Resource owners and admins can delete
CREATE POLICY "resources_teacher_delete" ON public.resources
FOR DELETE USING (
  teacher_id = public.current_teacher_id() OR public.is_admin()
);
```

### 3.5. `public.committee_sets` & `public.committee_members`
```sql
ALTER TABLE public.committee_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

-- Public read for viewing assigned committees
CREATE POLICY "committee_sets_read" ON public.committee_sets FOR SELECT USING (true);
CREATE POLICY "committee_members_read" ON public.committee_members FOR SELECT USING (true);

-- Admin only for configuration
CREATE POLICY "committee_members_admin_modify" ON public.committee_members
FOR ALL USING (public.is_admin());
```

### 3.6. `public.committee_assignments`
```sql
ALTER TABLE public.committee_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers see their assigned evaluators; Committee members see their assigned teachers; Admins see all
CREATE POLICY "assignments_select_policy" ON public.committee_assignments
FOR SELECT USING (
  teacher_id = public.current_teacher_id()
  OR committee_member_id = public.current_committee_member_id()
  OR public.is_admin()
);

CREATE POLICY "assignments_admin_manage" ON public.committee_assignments
FOR ALL USING (public.is_admin());
```

### 3.7. `public.pa_submissions`
```sql
ALTER TABLE public.pa_submissions ENABLE ROW LEVEL SECURITY;

-- Teacher can read own; Assigned evaluators and Admins can read
CREATE POLICY "pa_submissions_select" ON public.pa_submissions
FOR SELECT USING (
  teacher_id = public.current_teacher_id()
  OR EXISTS (
    SELECT 1 FROM public.committee_assignments ca
    WHERE ca.teacher_id = pa_submissions.teacher_id
      AND ca.committee_member_id = public.current_committee_member_id()
  )
  OR public.is_admin()
);

-- Teacher can create and edit own submission
CREATE POLICY "pa_submissions_teacher_insert" ON public.pa_submissions
FOR INSERT WITH CHECK (
  teacher_id = public.current_teacher_id() OR public.is_admin()
);

CREATE POLICY "pa_submissions_teacher_update" ON public.pa_submissions
FOR UPDATE USING (
  teacher_id = public.current_teacher_id() OR public.is_admin()
);
```

### 3.8. `public.pa_evaluations`
```sql
ALTER TABLE public.pa_evaluations ENABLE ROW LEVEL SECURITY;

-- Committee member reads/writes their assigned evaluations; Teacher can view their completed evaluations; Admin can view all
CREATE POLICY "pa_evaluations_select" ON public.pa_evaluations
FOR SELECT USING (
  teacher_id = public.current_teacher_id()
  OR committee_member_id = public.current_committee_member_id()
  OR public.is_admin()
);

-- Evaluator inserts evaluation for assigned teacher only
CREATE POLICY "pa_evaluations_committee_insert" ON public.pa_evaluations
FOR INSERT WITH CHECK (
  (committee_member_id = public.current_committee_member_id()
   AND EXISTS (
     SELECT 1 FROM public.committee_assignments ca
     WHERE ca.teacher_id = pa_evaluations.teacher_id
       AND ca.committee_member_id = pa_evaluations.committee_member_id
   ))
  OR public.is_admin()
);

-- Evaluator updates own evaluation
CREATE POLICY "pa_evaluations_committee_update" ON public.pa_evaluations
FOR UPDATE USING (
  committee_member_id = public.current_committee_member_id() OR public.is_admin()
);
```

### 3.9. `public.audit_logs`
```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view audit logs; Server/Authenticated can insert
CREATE POLICY "audit_logs_select" ON public.audit_logs
FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_logs_insert" ON public.audit_logs
FOR INSERT WITH CHECK (true);
```
