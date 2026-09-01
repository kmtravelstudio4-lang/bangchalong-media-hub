/**
 * ============================================================================
 * FIRESTORE TO SUPABASE LIVE MIGRATOR
 * ============================================================================
 * Reads the actual live collections from the original Firestore database
 * (Read-Only without modifying Firestore) and transfers them into Supabase.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import firebaseConfig from '../firebase-applet-config.json';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('============================================================');
console.log('🔄 MIGRATING LIVE DATA FROM FIRESTORE TO SUPABASE');
console.log('============================================================');
console.log(`Firestore Project: ${firebaseConfig.projectId}`);
console.log(`Firestore Database: ${firebaseConfig.firestoreDatabaseId}`);
console.log(`Target Supabase URL: ${SUPABASE_URL}`);
console.log('------------------------------------------------------------\n');

async function migrateFromFirestore() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
  }

  // 1. Initialize Firebase (Read-only)
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  let db: any;
  try {
    db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
  } catch {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 2. Fetch from Firestore
  console.log('📥 Reading collections from Firestore...');
  
  const [
    teacherSnap,
    resourceSnap,
    categorySnap,
    newsSnap,
    docSnap,
    videoSnap,
    commSnap,
    evalSnap
  ] = await Promise.all([
    getDocs(collection(db, 'teachers')),
    getDocs(collection(db, 'resources')),
    getDocs(collection(db, 'categories')),
    getDocs(collection(db, 'news')),
    getDocs(collection(db, 'documents')),
    getDocs(collection(db, 'videos')),
    getDocs(collection(db, 'pa_committee')),
    getDocs(collection(db, 'pa_evaluations'))
  ]);

  const rawTeachers = teacherSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawResources = resourceSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawCategories = categorySnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawNews = newsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawDocs = docSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawVideos = videoSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawCommittee = commSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const rawEvaluations = evalSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`  ✓ Found in Firestore:`);
  console.log(`     - Teachers: ${rawTeachers.length} records`);
  console.log(`     - Resources: ${rawResources.length} records`);
  console.log(`     - Categories: ${rawCategories.length} records`);
  console.log(`     - News: ${rawNews.length} records`);
  console.log(`     - Documents: ${rawDocs.length} records`);
  console.log(`     - Videos: ${rawVideos.length} records`);
  console.log(`     - Committee Members: ${rawCommittee.length} records`);
  console.log(`     - PA Evaluations: ${rawEvaluations.length} records`);

  // 3. Upsert Categories to Supabase
  if (rawCategories.length > 0) {
    console.log('\n🚀 Ingesting Categories into Supabase...');
    const catPayload = rawCategories.map((c: any) => ({
      id: c.id,
      name: c.name || c.id,
      color: c.color || '#005BAC',
      icon_name: c.iconName || c.icon || 'BookOpen',
      description: c.description || ''
    }));
    await supabase.from('categories').upsert(catPayload);
    console.log(`  ✓ Synced ${catPayload.length} categories`);
  }

  // 4. Upsert Teachers to Supabase
  if (rawTeachers.length > 0) {
    console.log('🚀 Ingesting Teachers into Supabase...');
    const teacherPayload = rawTeachers.map((t: any) => ({
      id: t.id,
      full_name: t.name || t.fullName || t.full_name || 'คุณครู',
      position: t.position || 'ครู',
      academic_standing: t.academicStanding || t.academic_standing || '',
      photo_url: t.photo || t.photo_url || '',
      bio: t.bio || '',
      email: t.email || '',
      phone: t.phone || '',
      facebook: t.facebook || '',
      subject_id: t.subjectId || t.subject_id || 'cat-dash',
      resources_count: t.resourcesCount || t.resources_count || 0,
      total_downloads: t.totalDownloads || t.total_downloads || 0,
      school_year: t.paYear || t.school_year || '2569'
    }));
    await supabase.from('teachers').upsert(teacherPayload);
    console.log(`  ✓ Synced ${teacherPayload.length} teachers`);
  }

  // 5. Upsert Resources to Supabase
  if (rawResources.length > 0) {
    console.log('🚀 Ingesting Educational Resources into Supabase...');
    const resourcePayload = rawResources.map((r: any) => ({
      id: r.id,
      title: r.title || 'สื่อการสอน',
      description: r.description || '',
      cover_url: r.cover || r.cover_url || '',
      file_url: r.fileUrl || r.file_url || '',
      preview_url: r.previewUrl || r.preview_url || null,
      file_type: r.fileType || r.file_type || 'PDF',
      file_size: r.fileSize || r.file_size || '',
      teacher_id: r.teacherId || r.teacher_id,
      category_id: r.categoryId || r.category_id,
      grade_level: r.gradeLevel || r.grade_level || 'ทุกระดับชั้น',
      tags: Array.isArray(r.tags) ? r.tags : [],
      downloads: Number(r.downloads) || 0,
      views: Number(r.views) || 0,
      rating: Number(r.rating) || 5.0,
      featured: Boolean(r.featured || r.isFeatured),
      status: r.status || 'approved'
    }));
    await supabase.from('resources').upsert(resourcePayload);
    console.log(`  ✓ Synced ${resourcePayload.length} resources`);
  }

  // 6. Upsert Committee Members
  if (rawCommittee.length > 0) {
    console.log('🚀 Ingesting Committee Members into Supabase...');
    const commPayload = rawCommittee.map((m: any) => ({
      id: m.id,
      set_number: Number(m.setNumber || m.set_number) || 1,
      member_order: Number(m.order || m.member_order) || 1,
      full_name: m.name || m.full_name || 'กรรมการ',
      role: m.role || '',
      position: m.position || '',
      login_code: (m.code || m.login_code || '').trim().toLowerCase(),
      avatar_url: m.avatar || m.avatar_url || '',
      phone: m.phone || '',
      email: m.email || ''
    }));
    await supabase.from('committee_members').upsert(commPayload);
    console.log(`  ✓ Synced ${commPayload.length} committee members`);
  }

  // 7. Upsert PA Submissions
  const paTeachers = rawTeachers.filter((t: any) => t.paChallengeTitle || t.paVideoUrl || t.paDocumentUrl);
  if (paTeachers.length > 0) {
    console.log('🚀 Ingesting PA Submissions into Supabase...');
    const subPayload = paTeachers.map((t: any) => ({
      id: `pa-${t.id}-2569`,
      teacher_id: t.id,
      school_year: t.paYear || '2569',
      challenge_title: t.paChallengeTitle || 'ข้อตกลงในการพัฒนางาน ว.PA',
      video_url: t.paVideoUrl || '',
      document_url: t.paDocumentUrl || '',
      status: t.paStatus === 'completed' ? 'completed' : 'draft'
    }));
    await supabase.from('pa_submissions').upsert(subPayload);
    console.log(`  ✓ Synced ${subPayload.length} PA Submissions`);
  }

  // 8. Upsert PA Evaluations
  if (rawEvaluations.length > 0) {
    console.log('🚀 Ingesting PA Evaluations into Supabase...');
    const evalPayload = rawEvaluations.map((e: any) => ({
      id: e.id,
      pa_submission_id: `pa-${e.teacherId}-2569`,
      teacher_id: e.teacherId,
      committee_member_id: e.committeeId,
      document_checked: Boolean(e.docChecked),
      document_checked_at: e.docCheckedAt ? new Date().toISOString() : null,
      document_feedback: e.docFeedback || '',
      video_checked: Boolean(e.videoChecked),
      video_checked_at: e.videoCheckedAt ? new Date().toISOString() : null,
      video_feedback: e.videoFeedback || '',
      score: e.overallScore !== undefined ? Number(e.overallScore) : null,
      status: e.overallStatus || 'passed',
      overall_comment: e.overallComment || ''
    }));
    await supabase.from('pa_evaluations').upsert(evalPayload);
    console.log(`  ✓ Synced ${evalPayload.length} PA Evaluations`);
  }

  // 9. Upsert News, Docs, Videos
  if (rawNews.length > 0) {
    const newsPayload = rawNews.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      image_url: n.image,
      category: n.category || 'ข่าวประชาสัมพันธ์',
      author: n.author || 'ฝ่ายวิชาการ',
      pinned: Boolean(n.pinned)
    }));
    await supabase.from('news').upsert(newsPayload);
  }

  if (rawDocs.length > 0) {
    const docPayload = rawDocs.map((d: any) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      file_url: d.fileUrl,
      file_type: d.fileType || 'PDF',
      file_size: d.fileSize,
      downloads: Number(d.downloads) || 0
    }));
    await supabase.from('school_documents').upsert(docPayload);
  }

  if (rawVideos.length > 0) {
    const vidPayload = rawVideos.map((v: any) => ({
      id: v.id,
      title: v.title,
      youtube_url: v.youtubeUrl,
      youtube_id: v.youtubeId || '',
      description: v.description
    }));
    await supabase.from('featured_videos').upsert(vidPayload);
  }

  console.log('\n============================================================');
  console.log('🎉 ALL LIVE DATA TRANSFERRED FROM FIRESTORE TO SUPABASE!');
  console.log('============================================================');
}

migrateFromFirestore().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
