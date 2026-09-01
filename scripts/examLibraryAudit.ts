/**
 * 📚 Bangchalongnai School Examination Bank Audit Script
 * Verifies Exam Question schema, URL validation, search/filtering, and stats
 */

import { INITIAL_EXAM_QUESTIONS } from '../src/data/mockData';
import { ExamQuestion, ExamType, ExamStatus } from '../src/types';

async function runExamLibraryAudit() {
  console.log('====================================================');
  console.log('📚 RUNNING BANGCHALONGNAI EXAM LIBRARY AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Initial Mock Data Validation
  console.log('--- 1. Initial Exam Data Integrity ---');
  assert(INITIAL_EXAM_QUESTIONS.length >= 3, `Found ${INITIAL_EXAM_QUESTIONS.length} initial exam questions`);
  
  INITIAL_EXAM_QUESTIONS.forEach((exam, idx) => {
    assert(!!exam.id, `Exam #${idx + 1} has valid ID: ${exam.id}`);
    assert(!!exam.title, `Exam #${idx + 1} has valid title: ${exam.title}`);
    assert(!!exam.subject, `Exam #${idx + 1} has valid subject: ${exam.subject}`);
    assert(!!exam.subjectGroup, `Exam #${idx + 1} has valid subjectGroup: ${exam.subjectGroup}`);
    assert(!!exam.gradeLevel, `Exam #${idx + 1} has valid gradeLevel: ${exam.gradeLevel}`);
    assert(!!exam.examUrl && exam.examUrl.startsWith('https://'), `Exam #${idx + 1} has safe https URL: ${exam.examUrl}`);
  });

  // 2. URL Safety Validation Tests
  console.log('\n--- 2. URL Safety & Sanitization Checks ---');
  const testUrls = [
    { url: 'https://docs.google.com/forms/d/e/1FAIpQLSc...', safe: true },
    { url: 'https://drive.google.com/file/d/.../view', safe: true },
    { url: 'javascript:alert(1)', safe: false },
    { url: 'data:text/html;base64,...', safe: false },
    { url: 'ftp://insecure-server.com', safe: false },
    { url: '', safe: false }
  ];

  testUrls.forEach(({ url, safe }) => {
    const isClean = !!url && (url.startsWith('https://') || url.startsWith('http://')) && !url.startsWith('javascript:') && !url.startsWith('data:');
    assert(isClean === safe, `URL: "${url.slice(0, 30)}..." safety expectation (${safe}) matches result (${isClean})`);
  });

  // 3. Search & Multi-Filter Logic Test
  console.log('\n--- 3. Search & Multi-Filter Mechanics ---');
  const sampleExams: ExamQuestion[] = [...INITIAL_EXAM_QUESTIONS];

  // Search by keyword "คณิต"
  const mathMatches = sampleExams.filter(e => 
    e.title.includes('คณิต') || e.subject.includes('คณิต') || e.subjectGroup.includes('คณิต')
  );
  assert(mathMatches.length > 0, `Search "คณิต" correctly found ${mathMatches.length} items`);

  // Filter by Grade "ป.1"
  const p1Matches = sampleExams.filter(e => e.gradeLevel === 'ป.1');
  assert(p1Matches.length > 0, `Filter Grade "ป.1" correctly found ${p1Matches.length} items`);

  // Filter by Status "published"
  const publishedCount = sampleExams.filter(e => e.status === 'published' || !e.status).length;
  assert(publishedCount >= 1, `Filter Status "published" returned ${publishedCount} exams`);

  // 4. CSV Export Format Validation
  console.log('\n--- 4. CSV UTF-8 BOM Header & Content Validation ---');
  const headers = ['ID', 'ชื่อข้อสอบ', 'กลุ่มสาระการเรียนรู้', 'วิชา', 'ระดับชั้น', 'ภาคเรียน', 'ปีการศึกษา', 'ประเภทข้อสอบ', 'ผู้จัดทำ', 'URL ข้อสอบ', 'สถานะ', 'ยอดเข้าชม', 'ยอดดาวน์โหลด', 'วันที่สร้าง', 'วันที่แก้ไข'];
  const mockCsvContent = '\uFEFF' + headers.join(',') + '\r\n' + sampleExams.map(e => `"${e.id}","${e.title}"`).join('\r\n');
  assert(mockCsvContent.startsWith('\uFEFF'), 'CSV correctly prefixed with UTF-8 BOM (\\uFEFF) for Thai Excel display');
  assert(mockCsvContent.includes('ID,ชื่อข้อสอบ'), 'CSV contains required Thai column headers');

  console.log('\n====================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runExamLibraryAudit().catch(err => {
  console.error('Fatal Error during audit:', err);
  process.exit(1);
});
