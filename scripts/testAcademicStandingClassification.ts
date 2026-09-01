/**
 * ============================================================================
 * TEACHER ACADEMIC STANDING & CLASSIFICATION INTEGRITY TEST
 * ============================================================================
 * Validates:
 * 1. Single Source of Truth: getTeacherAcademicCategory
 * 2. Exact Matching without broad substring/includes leaks
 * 3. Invariant: SUM(all exclusive categories) === TOTAL TEACHERS
 * 4. Regression tests (Test 1 - 8)
 * 5. Supabase live database verification for all 51 teachers
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { 
  getTeacherAcademicCategory, 
  getTeacherCommitteeSetNumber,
  STANDARD_ACADEMIC_CATEGORIES,
  isTeacherSet1Eligible,
  isTeacherSet2Eligible,
  isTeacherSet3Eligible,
  TeacherAcademicCategory
} from '../src/data/mockData';
import { Teacher } from '../src/types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runClassificationAudit() {
  console.log('============================================================');
  console.log('🔍 RUNNING ACADEMIC STANDING & CLASSIFICATION INTEGRITY AUDIT');
  console.log('============================================================\n');

  let allPassed = true;

  // --------------------------------------------------------------------------
  // SECTION 1: UNIT / REGRESSION TESTS
  // --------------------------------------------------------------------------
  console.log('--- 1. UNIT & REGRESSION TESTS ---');
  const unitTests: { name: string; teacher: Partial<Teacher>; expectedCat: TeacherAcademicCategory; expectedSet: 1 | 2 | 3 }[] = [
    {
      name: 'Test 1: ครูชำนาญการพิเศษ',
      teacher: { academicStanding: 'ครูชำนาญการพิเศษ', position: 'ประถมศึกษาปีที่ 5 (ป.5)' },
      expectedCat: 'ครูชำนาญการพิเศษ',
      expectedSet: 1
    },
    {
      name: 'Test 2: ครูชำนาญการ',
      teacher: { academicStanding: 'ครูชำนาญการ', position: 'ประถมศึกษาปีที่ 1 (ป.1)' },
      expectedCat: 'ครูชำนาญการ',
      expectedSet: 1
    },
    {
      name: 'Test 3: ครู (Exact match, not confused with other teacher types)',
      teacher: { academicStanding: 'ครู', position: 'ประถมศึกษาปีที่ 6 (ป.6)' },
      expectedCat: 'ครู',
      expectedSet: 2
    },
    {
      name: 'Test 4: ครูผู้ช่วย',
      teacher: { academicStanding: 'ครูผู้ช่วย', position: 'ประถมศึกษาปีที่ 5 (ป.5)' },
      expectedCat: 'ครูผู้ช่วย',
      expectedSet: 2
    },
    {
      name: 'Test 5: ครูอัตราจ้าง',
      teacher: { academicStanding: 'ครูอัตราจ้าง', position: 'อนุบาล 2' },
      expectedCat: 'ครูอัตราจ้าง',
      expectedSet: 3
    },
    {
      name: 'Test 6: ครูพี่เลี้ยง',
      teacher: { academicStanding: 'ครูพี่เลี้ยง', position: 'อนุบาล 3' },
      expectedCat: 'ครูพี่เลี้ยง',
      expectedSet: 3
    },
    {
      name: 'Test 7: นักการภารโรง',
      teacher: { academicStanding: 'นักการภารโรง', position: '-' },
      expectedCat: 'นักการภารโรง',
      expectedSet: 3
    },
    {
      name: 'Test 8: เจ้าหน้าที่ธุรการ',
      teacher: { academicStanding: 'เจ้าหน้าที่ธุรการ', position: '-' },
      expectedCat: 'เจ้าหน้าที่ธุรการ',
      expectedSet: 3
    },
    {
      name: 'Test 9: พี่เลี้ยงเด็กพิการ',
      teacher: { academicStanding: 'พี่เลี้ยงเด็กพิการ', position: '-' },
      expectedCat: 'พี่เลี้ยงเด็กพิการ',
      expectedSet: 3
    },
    {
      name: 'Test 10: ธุรการ (Variant)',
      teacher: { academicStanding: 'ธุรการ', position: '-' },
      expectedCat: 'เจ้าหน้าที่ธุรการ',
      expectedSet: 3
    },
    {
      name: 'Test 11: เจ้าหน้าที่ (Variant)',
      teacher: { academicStanding: 'เจ้าหน้าที่', position: '-' },
      expectedCat: 'เจ้าหน้าที่ธุรการ',
      expectedSet: 3
    }
  ];

  unitTests.forEach(ut => {
    const cat = getTeacherAcademicCategory(ut.teacher as Teacher);
    const set = getTeacherCommitteeSetNumber(ut.teacher as Teacher);
    const catMatch = cat === ut.expectedCat;
    const setMatch = set === ut.expectedSet;
    const passed = catMatch && setMatch;

    if (!passed) allPassed = false;
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} [${ut.name}] -> Cat: "${cat}" (Expected: "${ut.expectedCat}"), Set: ${set} (Expected: ${ut.expectedSet})`);
  });

  // --------------------------------------------------------------------------
  // SECTION 2: LIVE SUPABASE 51 TEACHERS CROSS-CHECK
  // --------------------------------------------------------------------------
  console.log('\n--- 2. LIVE DATABASE INTEGRITY CROSS-CHECK ---');
  const { data: teachers, error: tErr } = await supabase
    .from('teachers')
    .select('id, full_name, position, academic_standing')
    .order('id');

  if (tErr || !teachers) {
    console.error('❌ Failed to fetch teachers from Supabase:', tErr);
    process.exit(1);
  }

  console.log(`Fetched ${teachers.length} teachers from database.\n`);

  const categoryTally: Record<string, number> = {};
  STANDARD_ACADEMIC_CATEGORIES.forEach(c => { categoryTally[c] = 0; });

  const setTally: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  let unassignedCount = 0;
  let duplicateCount = 0;

  teachers.forEach((t, i) => {
    const teacherObj: Teacher = {
      id: t.id,
      name: t.full_name,
      position: t.position || '',
      academicStanding: t.academic_standing || '',
      photo: '',
      createdAt: '2024-01-01',
      bio: '',
      email: '',
      subjectId: 'cat-1'
    };

    const category = getTeacherAcademicCategory(teacherObj);
    const setNum = getTeacherCommitteeSetNumber(teacherObj);

    if (category in categoryTally) {
      categoryTally[category]++;
    } else {
      console.error(`❌ Unknown category "${category}" for teacher ${t.full_name}`);
      allPassed = false;
    }

    if (setNum && setNum in setTally) {
      setTally[setNum]++;
    } else {
      unassignedCount++;
      console.error(`❌ Teacher ${t.full_name} has no valid committee set!`);
      allPassed = false;
    }

    // Check Set isolation alignment
    const isSet1 = isTeacherSet1Eligible(teacherObj);
    const isSet2 = isTeacherSet2Eligible(teacherObj);
    const isSet3 = isTeacherSet3Eligible(teacherObj);

    const matchesCount = [isSet1, isSet2, isSet3].filter(Boolean).length;
    if (matchesCount > 1) {
      duplicateCount++;
      console.error(`❌ Duplicate Set match for teacher ${t.full_name} (${t.academic_standing})`);
      allPassed = false;
    }
  });

  console.log('📊 CATEGORY BREAKDOWN:');
  STANDARD_ACADEMIC_CATEGORIES.forEach(cat => {
    console.log(`   - ${cat.padEnd(25, ' ')} : ${categoryTally[cat]} ท่าน`);
  });

  const sumCategories = Object.values(categoryTally).reduce((a, b) => a + b, 0);
  console.log(`\n👉 SUM OF ALL CATEGORIES: ${sumCategories}`);
  console.log(`👉 TOTAL TEACHERS IN DB : ${teachers.length}`);

  if (sumCategories !== teachers.length) {
    console.error('\n❌ CLASSIFICATION INTEGRITY ERROR: Sum of categories does NOT match total teachers!');
    allPassed = false;
  } else {
    console.log('\n✅ INVARIANT VALIDATED: SUM(categories) === TOTAL TEACHERS (51/51, zero overlaps or leaks)');
  }

  console.log('\n📊 COMMITTEE SETS BREAKDOWN:');
  console.log(`   - Set 1 (ชำนาญการพิเศษ + ชำนาญการ) : ${setTally[1]} ท่าน`);
  console.log(`   - Set 2 (ครู + ครูผู้ช่วย)           : ${setTally[2]} ท่าน`);
  console.log(`   - Set 3 (อัตราจ้าง + บุคลากร)         : ${setTally[3]} ท่าน`);
  console.log(`👉 SUM OF COMMITTEE SETS: ${setTally[1] + setTally[2] + setTally[3]}`);

  console.log('\n============================================================');
  if (allPassed && sumCategories === 51 && unassignedCount === 0 && duplicateCount === 0) {
    console.log('🟢 ALL ACADEMIC STANDING & CLASSIFICATION TESTS PASSED (100%)');
  } else {
    console.log('🔴 CLASSIFICATION AUDIT FAILED');
    process.exit(1);
  }
  console.log('============================================================\n');
}

runClassificationAudit().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
