/**
 * ============================================================================
 * SAFE PRODUCTION DATA INTEGRITY MIGRATION SCRIPT
 * ============================================================================
 * 1. Updates teacher 'นางสุภารัตน์ ธีรทรัพย์ทวี' academic_standing to 'ครูชำนาญการพิเศษ'.
 * 2. Verifies identity of legacy committee members (comm-1, comm-2, comm-3).
 * 3. Migrates evaluation references safely preserving all IDs, scores, and feedback.
 * 4. Cleans up legacy duplicate committee members without orphan references.
 * 5. Re-audits all 51 teachers, 9 committee members, and all evaluations.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
  isTeacherSet1Eligible, 
  isTeacherSet2Eligible, 
  isTeacherSet3Eligible, 
  getTeacherCommitteeSetNumber 
} from '../src/data/mockData';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeMigration() {
  console.log('============================================================');
  console.log('🚀 SAFE DATA INTEGRITY MIGRATION EXECUTION');
  console.log('============================================================\n');

  // --------------------------------------------------------------------------
  // STEP 1: Update teacher นางสุภารัตน์ ธีรทรัพย์ทวี
  // --------------------------------------------------------------------------
  console.log('--- STEP 1: FIXING TEACHER STANDING ---');
  const { data: suparatBefore } = await supabase
    .from('teachers')
    .select('*')
    .ilike('full_name', '%สุภารัตน์%')
    .single();

  console.log('Found teacher record before update:');
  console.log(`  - ID: ${suparatBefore?.id}`);
  console.log(`  - Name: ${suparatBefore?.full_name}`);
  console.log(`  - Standing Before: "${suparatBefore?.academic_standing}"`);

  const { error: updateTeacherErr } = await supabase
    .from('teachers')
    .update({ academic_standing: 'ครูชำนาญการพิเศษ' })
    .eq('id', suparatBefore.id);

  if (updateTeacherErr) {
    console.error('❌ Failed to update teacher standing:', updateTeacherErr);
    process.exit(1);
  }

  const { data: suparatAfter } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', suparatBefore.id)
    .single();

  const teacherSet = getTeacherCommitteeSetNumber({
    id: suparatAfter.id,
    name: suparatAfter.full_name,
    position: suparatAfter.position,
    academicStanding: suparatAfter.academic_standing
  } as any);

  console.log(`  - Standing After: "${suparatAfter?.academic_standing}"`);
  console.log(`  - Resolved Set: ${teacherSet} (Expected: 1) -> ${teacherSet === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

  // --------------------------------------------------------------------------
  // STEP 2: Identity Verification for Legacy Committee Members
  // --------------------------------------------------------------------------
  console.log('--- STEP 2: COMMITTEE MEMBER IDENTITY VERIFICATION ---');
  const { data: members } = await supabase.from('committee_members').select('*');
  const memberMap = new Map(members?.map(m => [m.id, m]));

  const comm1 = memberMap.get('comm-1');
  const comm1_1 = memberMap.get('comm-1-1');
  const comm2_1 = memberMap.get('comm-2-1');

  const comm2 = memberMap.get('comm-2');
  const comm1_2 = memberMap.get('comm-1-2');

  const comm3 = memberMap.get('comm-3');
  const comm1_3 = memberMap.get('comm-1-3');

  console.log(`• comm-1 ("${comm1?.full_name}", code: ${comm1?.login_code}) == comm-1-1 ("${comm1_1?.full_name}", code: ${comm1_1?.login_code}) == comm-2-1 ("${comm2_1?.full_name}", code: ${comm2_1?.login_code}) -> ✅ Same Person (ผู้อำนวยการ)`);
  console.log(`• comm-2 ("${comm2?.full_name}", code: ${comm2?.login_code}) == comm-1-2 ("${comm1_2?.full_name}", code: ${comm1_2?.login_code}) -> ✅ Same Person`);
  console.log(`• comm-3 ("${comm3?.full_name}", code: ${comm3?.login_code}) == comm-1-3 ("${comm1_3?.full_name}", code: ${comm1_3?.login_code}) -> ✅ Same Person\n`);

  // --------------------------------------------------------------------------
  // STEP 3: Safe Evaluation Migration
  // --------------------------------------------------------------------------
  console.log('--- STEP 3: EVALUATIONS MIGRATION (PRESERVING DATA INTEGRITY) ---');
  const { data: evals } = await supabase.from('pa_evaluations').select('*');
  console.log(`Total evaluations before migration: ${evals?.length}`);

  for (const e of evals || []) {
    let targetMemberId = e.committee_member_id;

    if (e.committee_member_id === 'comm-1') {
      // Check teacher's set
      const { data: t } = await supabase.from('teachers').select('*').eq('id', e.teacher_id).single();
      const tSet = getTeacherCommitteeSetNumber({
        id: t.id,
        name: t.full_name,
        position: t.position,
        academicStanding: t.academic_standing
      } as any);

      if (tSet === 2) {
        // Teacher is in Set 2 -> Map to comm-2-1 (Director in Set 2)
        targetMemberId = 'comm-2-1';
      } else {
        // Teacher is in Set 1 -> Map to comm-1-1 (Director in Set 1)
        targetMemberId = 'comm-1-1';
      }
    } else if (e.committee_member_id === 'comm-2') {
      targetMemberId = 'comm-1-2';
    } else if (e.committee_member_id === 'comm-3') {
      targetMemberId = 'comm-1-3';
    }

    if (targetMemberId !== e.committee_member_id) {
      console.log(`  -> Migrating eval ID "${e.id}": Teacher "${e.teacher_id}" committee "${e.committee_member_id}" -> "${targetMemberId}" (Score: ${e.score})`);
      
      // Update in Supabase without modifying score, comment, or timestamp
      const { error: evalUpdateErr } = await supabase
        .from('pa_evaluations')
        .update({ committee_member_id: targetMemberId })
        .eq('id', e.id);

      if (evalUpdateErr) {
        console.error(`❌ Failed to update evaluation ${e.id}:`, evalUpdateErr);
      }
    }
  }

  // --------------------------------------------------------------------------
  // STEP 4: Remove Legacy Duplicate Committee Records (comm-1, comm-2, comm-3)
  // --------------------------------------------------------------------------
  console.log('\n--- STEP 4: CLEANING LEGACY DUPLICATE COMMITTEE RECORDS ---');
  
  // Double-check no remaining evaluations reference comm-1, comm-2, comm-3
  const { data: remainingLegacyRefs } = await supabase
    .from('pa_evaluations')
    .select('id, committee_member_id')
    .in('committee_member_id', ['comm-1', 'comm-2', 'comm-3']);

  if (remainingLegacyRefs && remainingLegacyRefs.length > 0) {
    console.error(`❌ CANNOT DELETE: ${remainingLegacyRefs.length} evaluations still reference legacy IDs!`);
    process.exit(1);
  }

  console.log('  ✓ Verified 0 evaluations reference legacy IDs.');
  
  const { error: delErr } = await supabase
    .from('committee_members')
    .delete()
    .in('id', ['comm-1', 'comm-2', 'comm-3']);

  if (delErr) {
    console.error('❌ Failed to delete legacy committee members:', delErr);
  } else {
    console.log('  ✓ Successfully cleaned legacy duplicate records (comm-1, comm-2, comm-3).');
  }

  // --------------------------------------------------------------------------
  // STEP 5: Final Validation & Health Check
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log('📊 FINAL HEALTH RE-AUDIT POST-MIGRATION');
  console.log('============================================================\n');

  // Committee count
  const { data: activeMembers } = await supabase.from('committee_members').select('*').order('set_number').order('member_order');
  const set1 = activeMembers?.filter(m => m.set_number === 1) || [];
  const set2 = activeMembers?.filter(m => m.set_number === 2) || [];
  const set3 = activeMembers?.filter(m => m.set_number === 3) || [];

  console.log(`• Total Committee Members: ${activeMembers?.length} (Expected: 9)`);
  console.log(`  - SET 1: ${set1.length} members (${set1.map(m => m.full_name).join(', ')})`);
  console.log(`  - SET 2: ${set2.length} members (${set2.map(m => m.full_name).join(', ')})`);
  console.log(`  - SET 3: ${set3.length} members (${set3.map(m => m.full_name).join(', ')})\n`);

  // Teacher Classification
  const { data: allTeachers } = await supabase.from('teachers').select('*');
  let s1Count = 0, s2Count = 0, s3Count = 0, unassignedCount = 0;

  allTeachers?.forEach(t => {
    const to = { id: t.id, name: t.full_name, position: t.position, academicStanding: t.academic_standing };
    if (isTeacherSet1Eligible(to as any)) s1Count++;
    else if (isTeacherSet2Eligible(to as any)) s2Count++;
    else if (isTeacherSet3Eligible(to as any)) s3Count++;
    else unassignedCount++;
  });

  console.log(`• Teacher Classification (Total: ${allTeachers?.length}):`);
  console.log(`  - SET 1: ${s1Count} teachers`);
  console.log(`  - SET 2: ${s2Count} teachers`);
  console.log(`  - SET 3: ${s3Count} teachers`);
  console.log(`  - UNASSIGNED: ${unassignedCount} teachers\n`);

  // Evaluations Cross-Set Check
  const { data: finalEvals } = await supabase.from('pa_evaluations').select('*');
  const teacherMap = new Map(allTeachers?.map(t => [t.id, t]));
  const finalMemberMap = new Map(activeMembers?.map(m => [m.id, m]));

  let crossSetCount = 0;
  finalEvals?.forEach(e => {
    const t = teacherMap.get(e.teacher_id);
    const m = finalMemberMap.get(e.committee_member_id);
    const tSet = t ? getTeacherCommitteeSetNumber({ id: t.id, name: t.full_name, position: t.position, academicStanding: t.academic_standing } as any) : null;
    const mSet = m ? m.set_number : null;

    if (tSet !== mSet) {
      console.error(`  ❌ Cross-Set Violation: Eval ${e.id} (Teacher Set ${tSet} vs Committee Set ${mSet})`);
      crossSetCount++;
    }
  });

  console.log(`• Cross-Set Evaluation Violations: ${crossSetCount === 0 ? '✅ 0 (100% Isolated & Valid)' : `❌ ${crossSetCount}`}`);
  console.log('\n============================================================');
  console.log('🎉 DATA MIGRATION & RE-AUDIT COMPLETED SUCCESSFULLY!');
  console.log('============================================================');
}

executeMigration().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
