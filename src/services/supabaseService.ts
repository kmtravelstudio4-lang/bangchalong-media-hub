import { getSupabaseClient } from './supabaseClient';
import { 
  Resource, 
  Teacher, 
  Category, 
  News, 
  SchoolDocument, 
  FeaturedVideo,
  PaCommitteeMember,
  PaEvaluationRecord,
  ExamQuestion
} from '../types';
import { broadcastMutation, subscribeToTableRealtime } from './supabaseRealtimeService';

/**
 * ----------------------------------------------------------------------
 * 1. RESOURCES DATA SERVICE
 * ----------------------------------------------------------------------
 */

export async function fetchResourcesFromSupabase(): Promise<Resource[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      cover: r.cover_url || r.cover || '',
      fileUrl: r.file_url || r.fileUrl || '',
      previewUrl: r.preview_url || r.previewUrl,
      fileType: r.file_type || r.fileType || 'PDF',
      fileSize: r.file_size || r.fileSize,
      teacherId: r.teacher_id || r.teacherId,
      teacherName: r.teacher_name || r.teacherName,
      teacherPhoto: r.teacher_photo || r.teacherPhoto,
      teacherPosition: r.teacher_position || r.teacherPosition,
      categoryId: r.category_id || r.categoryId,
      categoryName: r.category_name || r.categoryName,
      categoryColor: r.category_color || r.categoryColor,
      gradeLevel: r.grade_level || r.gradeLevel || 'ทุกระดับชั้น',
      tags: Array.isArray(r.tags) ? r.tags : [],
      downloads: Number(r.downloads) || 0,
      views: Number(r.views) || 0,
      rating: Number(r.rating) || 5.0,
      featured: Boolean(r.featured),
      status: r.status || 'approved',
      createdAt: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      updatedAt: r.updated_at ? r.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    console.warn('Supabase fetch resources error:', err);
    return null;
  }
}

export async function upsertResourceToSupabase(resource: Resource): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      cover_url: resource.cover,
      file_url: resource.fileUrl,
      preview_url: resource.previewUrl,
      file_type: resource.fileType,
      file_size: resource.fileSize,
      teacher_id: resource.teacherId,
      category_id: resource.categoryId,
      grade_level: resource.gradeLevel,
      tags: resource.tags,
      downloads: resource.downloads,
      views: resource.views,
      rating: resource.rating || 5.0,
      featured: Boolean(resource.featured),
      status: resource.status || 'approved',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('resources').upsert(payload);
    if (error) throw error;
    broadcastMutation('resources', 'UPDATE', resource, resource.id);
    return true;
  } catch (err) {
    console.error('Supabase upsert resource error:', err);
    return false;
  }
}

export async function deleteResourceFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
    broadcastMutation('resources', 'DELETE', undefined, id);
    return true;
  } catch (err) {
    console.error('Supabase delete resource error:', err);
    return false;
  }
}

export async function incrementResourceCountersInSupabase(id: string, field: 'downloads' | 'views'): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data } = await supabase.from('resources').select(field).eq('id', id).single();
    if (data) {
      const currentVal = Number(data[field]) || 0;
      await supabase.from('resources').update({ [field]: currentVal + 1 }).eq('id', id);
      broadcastMutation('resources', 'UPDATE', { id, [field]: currentVal + 1 }, id);
    }
  } catch (err) {
    console.warn(`Supabase increment ${field} error:`, err);
  }
}

/**
 * ----------------------------------------------------------------------
 * 2. TEACHERS DATA SERVICE
 * ----------------------------------------------------------------------
 */

export async function fetchTeachersFromSupabase(): Promise<Teacher[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [teachersRes, paRes] = await Promise.all([
      supabase.from('teachers').select('*').order('id', { ascending: true }),
      supabase.from('pa_submissions').select('*')
    ]);

    if (teachersRes.error) throw teachersRes.error;
    const teachersData = teachersRes.data || [];
    const paData = paRes.data || [];

    // Map PA Submissions by teacher_id
    const paMap = new Map<string, any>();
    paData.forEach((p: any) => {
      if (p.teacher_id) paMap.set(p.teacher_id, p);
    });

    return teachersData.map((t: any) => {
      const pa = paMap.get(t.id);
      const paChallenge = pa?.challenge_title || pa?.challenge_description || t.pa_challenge_title || t.paChallengeTitle || '';
      const paVideo = pa?.video_url || t.pa_video_url || t.paVideoUrl || '';
      const paDoc = pa?.document_url || t.pa_document_url || t.paDocumentUrl || '';
      const paYear = pa?.school_year || t.school_year || t.paYear || '2569';
      const isCompleted = Boolean(paChallenge && paVideo);
      const paStatus: 'completed' | 'pending' = isCompleted 
        ? 'completed' 
        : (pa?.status === 'completed' ? 'completed' : ((t.pa_status || t.paStatus) === 'completed' ? 'completed' : 'pending'));

      return {
        id: t.id,
        name: t.full_name || t.name,
        position: t.position || '',
        academicStanding: t.academic_standing || t.academicStanding || '',
        photo: t.photo_url || t.photo || '',
        bio: t.bio || '',
        email: t.email || '',
        facebook: t.facebook || '',
        subjectId: t.subject_id || t.subjectId || 'cat-dash',
        subjectName: t.subject_name || t.subjectName || '',
        resourcesCount: Number(t.resources_count) || 0,
        totalDownloads: Number(t.total_downloads) || 0,
        createdAt: t.created_at ? t.created_at.split('T')[0] : '2024-01-01',
        paChallengeTitle: paChallenge,
        paYear: paYear,
        paVideoUrl: paVideo,
        paDocumentUrl: paDoc,
        paStatus: paStatus,
        password: t.phone || t.employee_code || t.password || '123456',
      };
    });
  } catch (err) {
    console.warn('Supabase fetch teachers error:', err);
    return null;
  }
}

export async function upsertTeacherToSupabase(teacher: Teacher): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: teacher.id,
      full_name: teacher.name,
      position: teacher.position,
      academic_standing: teacher.academicStanding || '',
      photo_url: teacher.photo,
      bio: teacher.bio,
      email: teacher.email,
      phone: teacher.password || '123456',
      facebook: teacher.facebook,
      subject_id: teacher.subjectId,
      resources_count: teacher.resourcesCount || 0,
      total_downloads: teacher.totalDownloads || 0,
      school_year: teacher.paYear || '2569',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('teachers').upsert(payload);
    if (error) throw error;

    // Synchronize PA Submission to pa_submissions table in Supabase
    const schoolYear = teacher.paYear || '2569';
    const submissionId = `pa-${teacher.id}-${schoolYear}`;
    const hasPA = Boolean(teacher.paChallengeTitle || teacher.paVideoUrl || teacher.paDocumentUrl);

    if (hasPA) {
      const isCompleted = Boolean(teacher.paChallengeTitle && teacher.paVideoUrl);
      const paPayload = {
        id: submissionId,
        teacher_id: teacher.id,
        school_year: schoolYear,
        challenge_title: teacher.paChallengeTitle || '',
        challenge_description: teacher.paChallengeTitle || '',
        video_url: teacher.paVideoUrl || '',
        document_url: teacher.paDocumentUrl || '',
        status: isCompleted || teacher.paStatus === 'completed' ? 'completed' : 'draft',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error: paErr } = await supabase.from('pa_submissions').upsert(paPayload);
      if (paErr) console.warn('Supabase upsert pa_submission warn:', paErr.message);
    } else {
      await supabase.from('pa_submissions').delete().eq('teacher_id', teacher.id).eq('school_year', schoolYear);
    }

    broadcastMutation('teachers', 'UPDATE', teacher, teacher.id);
    broadcastMutation('pa_submissions', 'UPDATE', teacher, submissionId);
    return true;
  } catch (err) {
    console.error('Supabase upsert teacher error:', err);
    return false;
  }
}

export async function deleteTeacherFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw error;
    broadcastMutation('teachers', 'DELETE', undefined, id);
    return true;
  } catch (err) {
    console.error('Supabase delete teacher error:', err);
    return false;
  }
}

/**
 * ----------------------------------------------------------------------
 * 3. CATEGORIES DATA SERVICE
 * ----------------------------------------------------------------------
 */

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      color: c.color || '#005BAC',
      iconName: c.icon_name || c.iconName || 'BookOpen',
      description: c.description || '',
      resourceCount: Number(c.resource_count) || 0,
    }));
  } catch (err) {
    console.warn('Supabase fetch categories error:', err);
    return null;
  }
}

export async function upsertCategoryToSupabase(cat: Category): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon_name: cat.iconName,
      description: cat.description,
    };
    const { error } = await supabase.from('categories').upsert(payload);
    if (error) throw error;
    broadcastMutation('categories', 'UPDATE', cat, cat.id);
    return true;
  } catch (err) {
    console.error('Supabase upsert category error:', err);
    return false;
  }
}

export async function deleteCategoryFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    broadcastMutation('categories', 'DELETE', undefined, id);
    return true;
  } catch (err) {
    console.error('Supabase delete category error:', err);
    return false;
  }
}

/**
 * ----------------------------------------------------------------------
 * 4. NEWS, DOCUMENTS, VIDEOS DATA SERVICE
 * ----------------------------------------------------------------------
 */

export async function fetchNewsFromSupabase(): Promise<News[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      image: n.image_url || n.image || '',
      category: n.category || 'ข่าวประชาสัมพันธ์',
      author: n.author || 'ฝ่ายวิชาการ',
      pinned: Boolean(n.pinned),
      createdAt: n.created_at ? n.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertNewsToSupabase(item: News): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: item.id,
      title: item.title,
      content: item.content,
      image_url: item.image,
      category: item.category,
      author: item.author,
      pinned: Boolean(item.pinned),
    };
    const { error } = await supabase.from('news').upsert(payload);
    if (!error) {
      broadcastMutation('news', 'UPDATE', item, item.id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function deleteNewsFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (!error) {
      broadcastMutation('news', 'DELETE', undefined, id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function fetchDocumentsFromSupabase(): Promise<SchoolDocument[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('school_documents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      category: d.category || 'แบบฟอร์มวิชาการ',
      fileUrl: d.file_url || d.fileUrl || '',
      fileType: d.file_type || d.fileType || 'PDF',
      fileSize: d.file_size || d.fileSize || '',
      downloads: Number(d.downloads) || 0,
      updatedAt: d.updated_at ? d.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch {
    return null;
  }
}

export async function upsertDocumentToSupabase(docItem: SchoolDocument): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: docItem.id,
      title: docItem.title,
      category: docItem.category,
      file_url: docItem.fileUrl,
      file_type: docItem.fileType,
      file_size: docItem.fileSize,
      downloads: docItem.downloads,
    };
    const { error } = await supabase.from('school_documents').upsert(payload);
    if (!error) {
      broadcastMutation('school_documents', 'UPDATE', docItem, docItem.id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function deleteDocumentFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('school_documents').delete().eq('id', id);
    if (!error) {
      broadcastMutation('school_documents', 'DELETE', undefined, id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function fetchVideosFromSupabase(): Promise<FeaturedVideo[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('featured_videos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      youtubeUrl: v.youtube_url || v.youtubeUrl || '',
      youtubeId: v.youtube_id || v.youtubeId || '',
      description: v.description || '',
      createdAt: v.created_at ? v.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch {
    return null;
  }
}

export async function upsertVideoToSupabase(video: FeaturedVideo): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: video.id,
      title: video.title,
      youtube_url: video.youtubeUrl,
      youtube_id: video.youtubeId,
      description: video.description,
    };
    const { error } = await supabase.from('featured_videos').upsert(payload);
    if (!error) {
      broadcastMutation('featured_videos', 'UPDATE', video, video.id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function deleteVideoFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('featured_videos').delete().eq('id', id);
    if (!error) {
      broadcastMutation('featured_videos', 'DELETE', undefined, id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * ----------------------------------------------------------------------
 * 5. PA COMMITTEE & EVALUATIONS DATA SERVICE
 * ----------------------------------------------------------------------
 */

export async function fetchCommitteeMembersFromSupabase(): Promise<PaCommitteeMember[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('committee_members')
      .select('*')
      .order('set_number', { ascending: true })
      .order('member_order', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((m: any) => ({
      id: m.id,
      order: Number(m.member_order || m.order) || 1,
      setNumber: Number(m.set_number || m.setNumber) || 1,
      setName: m.set_name || `ชุดที่ ${m.set_number || 1}: คณะกรรมการประเมินชุดที่ ${m.set_number || 1}`,
      targetDescription: m.target_description || 'ผู้รับการประเมินตามเกณฑ์',
      name: m.full_name || m.name,
      role: m.role || '',
      position: m.position || '',
      code: (m.login_code || m.code || '').trim().toLowerCase(),
      avatar: m.avatar_url || m.avatar || '',
      phone: m.phone || '',
      email: m.email || '',
      assignedTeacherIds: Array.isArray(m.assigned_teacher_ids) ? m.assigned_teacher_ids : undefined,
    }));
  } catch (err) {
    console.warn('Supabase fetch committee members error:', err);
    return null;
  }
}

export async function upsertCommitteeMemberToSupabase(member: PaCommitteeMember): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: member.id,
      set_number: member.setNumber,
      member_order: member.order,
      full_name: member.name,
      role: member.role,
      position: member.position,
      login_code: member.code.trim().toLowerCase(),
      avatar_url: member.avatar,
      phone: member.phone,
      email: member.email,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('committee_members').upsert(payload);
    if (error) throw error;
    broadcastMutation('committee_members', 'UPDATE', member, member.id);
    return true;
  } catch (err) {
    console.error('Supabase upsert committee member error:', err);
    return false;
  }
}

export async function deleteCommitteeMemberFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('committee_members').delete().eq('id', id);
    if (error) throw error;
    broadcastMutation('committee_members', 'DELETE', undefined, id);
    return true;
  } catch (err) {
    console.error('Supabase delete committee member error:', err);
    return false;
  }
}

export async function fetchPaEvaluationsFromSupabase(): Promise<PaEvaluationRecord[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('pa_evaluations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((e: any) => ({
      id: e.id,
      teacherId: e.teacher_id || e.teacherId,
      teacherName: e.teacher_name || e.teacherName || 'คุณครู',
      committeeId: e.committee_member_id || e.committeeId,
      committeeName: e.committee_name || e.committeeName || '',
      committeeRole: e.committee_role || e.committeeRole || '',
      docChecked: Boolean(e.document_checked),
      docCheckedAt: e.document_checked_at || undefined,
      docFeedback: e.document_feedback || '',
      videoChecked: Boolean(e.video_checked),
      videoCheckedAt: e.video_checked_at || undefined,
      videoFeedback: e.video_feedback || '',
      overallStatus: e.status || e.overallStatus || 'pending',
      overallScore: e.score !== null && e.score !== undefined ? Number(e.score) : undefined,
      overallComment: e.overall_comment || '',
      updatedAt: e.updated_at ? new Date(e.updated_at).toLocaleString('th-TH') : new Date().toLocaleString('th-TH'),
    }));
  } catch (err) {
    console.warn('Supabase fetch PA evaluations error:', err);
    return null;
  }
}

export async function upsertPaEvaluationToSupabase(evalRecord: PaEvaluationRecord): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: evalRecord.id,
      pa_submission_id: `pa-${evalRecord.teacherId}-2569`,
      teacher_id: evalRecord.teacherId,
      committee_member_id: evalRecord.committeeId,
      document_checked: Boolean(evalRecord.docChecked),
      document_checked_at: evalRecord.docCheckedAt || null,
      document_feedback: evalRecord.docFeedback || '',
      video_checked: Boolean(evalRecord.videoChecked),
      video_checked_at: evalRecord.videoCheckedAt || null,
      video_feedback: evalRecord.videoFeedback || '',
      score: evalRecord.overallScore !== undefined && evalRecord.overallScore !== null ? Math.min(100, Math.max(0, Math.round(Number(evalRecord.overallScore)))) : null,
      status: evalRecord.overallStatus || 'pending',
      overall_comment: evalRecord.overallComment || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('pa_evaluations').upsert(payload);
    if (error) throw error;
    broadcastMutation('pa_evaluations', 'UPDATE', evalRecord, evalRecord.id);
    return true;
  } catch (err) {
    console.error('Supabase upsert PA evaluation error:', err);
    return false;
  }
}

/**
 * ----------------------------------------------------------------------
 * 6. EXAM QUESTIONS DATA SERVICE (คลังข้อสอบ)
 * ----------------------------------------------------------------------
 */

export async function fetchExamQuestionsFromSupabase(): Promise<ExamQuestion[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch exam_questions info:', error.message);
      return null;
    }
    if (!data) return [];

    return data.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      subjectGroup: e.subject_group || e.subjectGroup || 'ทั่วไป',
      subject: e.subject || '',
      gradeLevel: e.grade_level || e.gradeLevel || 'ทุกระดับชั้น',
      semester: e.semester || 'ภาคเรียนที่ 1',
      academicYear: e.academic_year || e.academicYear || '2569',
      examType: e.exam_type || e.examType || 'แบบทดสอบ',
      creatorName: e.creator_name || e.creatorName || 'ฝ่ายวิชาการ',
      examUrl: e.exam_url || e.examUrl || '',
      coverImageUrl: e.cover_image_url || e.coverImageUrl || '',
      status: e.status || 'published',
      viewCount: Number(e.view_count) || 0,
      downloadCount: Number(e.download_count) || 0,
      createdAt: e.created_at ? e.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      updatedAt: e.updated_at ? e.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    console.warn('Supabase fetch exam questions error:', err);
    return null;
  }
}

export async function upsertExamQuestionToSupabase(exam: ExamQuestion): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: exam.id,
      title: exam.title,
      description: exam.description || '',
      subject_group: exam.subjectGroup,
      subject: exam.subject,
      grade_level: exam.gradeLevel,
      semester: exam.semester || 'ภาคเรียนที่ 1',
      academic_year: exam.academicYear || '2569',
      exam_type: exam.examType,
      creator_name: exam.creatorName || 'ฝ่ายวิชาการ',
      exam_url: exam.examUrl,
      cover_image_url: exam.coverImageUrl || '',
      status: exam.status || 'published',
      view_count: exam.viewCount || 0,
      download_count: exam.downloadCount || 0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('exam_questions').upsert(payload);
    if (error) {
      console.warn('Supabase upsert exam_questions error:', error.message);
      // Still broadcast optimistic state
      broadcastMutation('exam_questions', 'UPDATE', exam, exam.id);
      return true;
    }
    broadcastMutation('exam_questions', 'UPDATE', exam, exam.id);
    return true;
  } catch (err) {
    console.error('Supabase upsert exam question error:', err);
    return false;
  }
}

export async function deleteExamQuestionFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('exam_questions').delete().eq('id', id);
    broadcastMutation('exam_questions', 'DELETE', undefined, id);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function incrementExamCounterInSupabase(id: string, field: 'views' | 'downloads'): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const dbField = field === 'views' ? 'view_count' : 'download_count';
  try {
    const { data } = await supabase.from('exam_questions').select(dbField).eq('id', id).single();
    if (data) {
      const currentVal = Number(data[dbField]) || 0;
      await supabase.from('exam_questions').update({ [dbField]: currentVal + 1 }).eq('id', id);
      broadcastMutation('exam_questions', 'UPDATE', { id, [field === 'views' ? 'viewCount' : 'downloadCount']: currentVal + 1 }, id);
    }
  } catch (err) {
    console.warn(`Supabase increment exam ${field} error:`, err);
  }
}

/**
 * ----------------------------------------------------------------------
 * 7. SUPABASE REALTIME SUBSCRIPTION HELPER
 * ----------------------------------------------------------------------
 */

export function subscribeToSupabaseRealtime(
  table: string, 
  onUpdate: (payload: any) => void
): () => void {
  return subscribeToTableRealtime(table, onUpdate);
}

