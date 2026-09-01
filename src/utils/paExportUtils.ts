import { Teacher, PaCommitteeMember, PaEvaluationRecord } from '../types';
import { isTeacherAssignedToCommittee, getTeacherCommitteeSetNumber } from '../data/mockData';

export interface PaExportFilterOptions {
  year?: string;
  academicStanding?: string;
  categoryId?: string;
  paStatus?: 'all' | 'completed' | 'pending';
}

/**
 * Clean & escape string to safely fit in a CSV cell
 */
export function escapeCsvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Remove control characters except newline
  str = str.replace(/[\r\n]+/g, ' ').trim();
  // Double-quote escaping
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Filter teachers based on export options
 */
export function filterTeachersForExport(
  teachers: Teacher[],
  options: PaExportFilterOptions
): Teacher[] {
  return teachers.filter((t) => {
    // Filter by year if specified
    if (options.year && options.year !== 'all') {
      const teacherYear = t.paYear || '2569';
      if (teacherYear !== options.year) return false;
    }

    // Filter by academic standing if specified
    if (options.academicStanding && options.academicStanding !== 'all') {
      const standing = (t.academicStanding || t.position || '').trim();
      if (standing !== options.academicStanding) return false;
    }

    // Filter by category / subject group if specified
    if (options.categoryId && options.categoryId !== 'all') {
      const matchesSubject = t.subjectName === options.categoryId || 
        (t as any).categoryId === options.categoryId ||
        (t.subjectName && t.subjectName.toLowerCase().includes(options.categoryId.toLowerCase()));
      if (!matchesSubject) {
        return false;
      }
    }

    // Filter by PA status
    if (options.paStatus && options.paStatus !== 'all') {
      const isCompleted = t.paStatus === 'completed' || Boolean(t.paChallengeTitle && t.paVideoUrl);
      if (options.paStatus === 'completed' && !isCompleted) return false;
      if (options.paStatus === 'pending' && isCompleted) return false;
    }

    return true;
  });
}

/**
 * Build CSV string for teachers PA records with UTF-8 BOM encoding
 */
export function generatePaCsvContent(
  teachersToExport: Teacher[],
  allCommitteeMembers: PaCommitteeMember[],
  allEvaluations: PaEvaluationRecord[]
): string {
  // Define columns matching specification
  const headers = [
    'ลำดับ',
    'ชื่อ-นามสกุล',
    'ตำแหน่ง',
    'วิทยฐานะ',
    'กลุ่มสาระการเรียนรู้',
    'ปีการศึกษา',
    'ประเด็นท้าทาย (PA Challenge)',
    'รายละเอียดประเด็นท้าทาย',
    'วิธีดำเนินการ',
    'ผลลัพธ์ที่คาดหวัง',
    'ลิงก์คลิปการสอน PA (Video URL)',
    'ลิงก์เอกสาร PA / SAR (Document URL)',
    'สถานะการส่ง PA',
    'วันที่ส่ง/อัปเดต',
    'ชุดกรรมการ',
    'กรรมการท่านที่ 1',
    'คะแนนกรรมการ 1',
    'กรรมการท่านที่ 2',
    'คะแนนกรรมการ 2',
    'กรรมการท่านที่ 3',
    'คะแนนกรรมการ 3',
    'จำนวนกรรมการที่ตรวจแล้ว',
    'คะแนนเฉลี่ย',
    'สถานะการประเมิน',
    'ข้อคิดเห็น/Feedback กรรมการ'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => `"${h}"`).join(','));

  teachersToExport.forEach((t, idx) => {
    // Find assigned committee members for this teacher based on central classifier
    const teacherSet = getTeacherCommitteeSetNumber(t);
    const targetMembers = teacherSet !== null
      ? allCommitteeMembers.filter(m => Number(m.setNumber) === teacherSet && isTeacherAssignedToCommittee(t, m))
      : [];

    // Evaluations
    const teacherEvals = allEvaluations.filter(e => e.teacherId === t.id);

    // Extract individual committee scores & feedbacks
    const comm1 = targetMembers[0];
    const eval1 = comm1 ? teacherEvals.find(e => e.committeeId === comm1.id) : undefined;
    const comm1Text = comm1 ? `${comm1.name} (${comm1.role.split('(')[0].trim()})` : '-';
    const score1Text = comm1 ? (eval1?.overallScore !== undefined ? `${eval1.overallScore}` : (eval1?.docChecked || eval1?.videoChecked ? 'ตรวจแล้ว (ยังไม่ลงคะแนน)' : 'ยังไม่ตรวจ')) : '-';

    const comm2 = targetMembers[1];
    const eval2 = comm2 ? teacherEvals.find(e => e.committeeId === comm2.id) : undefined;
    const comm2Text = comm2 ? `${comm2.name} (${comm2.role.split('(')[0].trim()})` : '-';
    const score2Text = comm2 ? (eval2?.overallScore !== undefined ? `${eval2.overallScore}` : (eval2?.docChecked || eval2?.videoChecked ? 'ตรวจแล้ว (ยังไม่ลงคะแนน)' : 'ยังไม่ตรวจ')) : '-';

    const comm3 = targetMembers[2];
    const eval3 = comm3 ? teacherEvals.find(e => e.committeeId === comm3.id) : undefined;
    const comm3Text = comm3 ? `${comm3.name} (${comm3.role.split('(')[0].trim()})` : '-';
    const score3Text = comm3 ? (eval3?.overallScore !== undefined ? `${eval3.overallScore}` : (eval3?.docChecked || eval3?.videoChecked ? 'ตรวจแล้ว (ยังไม่ลงคะแนน)' : 'ยังไม่ตรวจ')) : '-';

    // Count of evaluated members
    const evaluatedCount = targetMembers.filter(m => {
      const e = teacherEvals.find(rec => rec.committeeId === m.id);
      return e && (e.overallScore !== undefined || e.docChecked || e.videoChecked);
    }).length;
    const evaluatedRatio = targetMembers.length > 0 ? `${evaluatedCount}/${targetMembers.length} ท่าน` : 'ยังไม่ได้รับมอบหมายกรรมการ';

    // Calculate average score dynamically based on assigned targetMembers
    const scores = targetMembers
      .map(m => teacherEvals.find(e => e.committeeId === m.id)?.overallScore)
      .filter((s): s is number => typeof s === 'number');

    let avgScoreText = '-';
    let evalStatusText = targetMembers.length > 0 ? 'ยังไม่ได้รับการตรวจ' : 'ยังไม่ได้รับมอบหมายกรรมการ';

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      avgScoreText = avg.toFixed(2);
      
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const variance = maxScore - minScore;

      if (targetMembers.length > 0 && scores.length === targetMembers.length) {
        if (variance > 10) {
          evalStatusText = `คะแนนส่วนต่างสูง (±${variance})`;
        } else if (avg >= 80) {
          evalStatusText = 'ผ่านเกณฑ์ดีเด่น (ฉันทามติ)';
        } else if (avg >= 70) {
          evalStatusText = 'ผ่านเกณฑ์ (ฉันทามติ)';
        } else {
          evalStatusText = 'ไม่ผ่านเกณฑ์';
        }
      } else {
        evalStatusText = `อยู่ระหว่างตรวจ (${scores.length}/${targetMembers.length})`;
      }
    }

    // Consolidated Feedback
    const feedbacks: string[] = [];
    if (eval1?.overallComment) feedbacks.push(`[ก.1] ${eval1.overallComment}`);
    else if (eval1?.docFeedback || eval1?.videoFeedback) feedbacks.push(`[ก.1] ${eval1.docFeedback || ''} ${eval1.videoFeedback || ''}`.trim());

    if (eval2?.overallComment) feedbacks.push(`[ก.2] ${eval2.overallComment}`);
    else if (eval2?.docFeedback || eval2?.videoFeedback) feedbacks.push(`[ก.2] ${eval2.docFeedback || ''} ${eval2.videoFeedback || ''}`.trim());

    if (eval3?.overallComment) feedbacks.push(`[ก.3] ${eval3.overallComment}`);
    else if (eval3?.docFeedback || eval3?.videoFeedback) feedbacks.push(`[ก.3] ${eval3.docFeedback || ''} ${eval3.videoFeedback || ''}`.trim());

    const combinedFeedback = feedbacks.length > 0 ? feedbacks.join(' | ') : 'ไม่มีข้อคิดเห็นเพิ่มเติม';

    const isSubmitted = t.paStatus === 'completed' || Boolean(t.paChallengeTitle && t.paVideoUrl);
    const submissionStatusText = isSubmitted ? 'จัดทำเรียบร้อย' : 'ยังไม่จัดทำ';
    const setLabel = teacherSet ? `ชุดที่ ${teacherSet}` : 'ยังไม่ระบุชุด';

    const rowData = [
      idx + 1,
      t.name,
      t.position || 'ครู',
      t.academicStanding || t.position || 'ครู',
      t.subjectName || 'กลุ่มสาระการเรียนรู้',
      t.paYear || '2569',
      t.paChallengeTitle || 'ยังไม่ระบุประเด็นท้าทาย',
      t.bio || '-',
      '-', // Methodology
      '-', // Expected Outcome
      t.paVideoUrl || '',
      t.paDocumentUrl || '',
      submissionStatusText,
      t.paYear ? `ปีงบประมาณ ${t.paYear}` : '2569',
      setLabel,
      comm1Text,
      score1Text,
      comm2Text,
      score2Text,
      comm3Text,
      score3Text,
      evaluatedRatio,
      avgScoreText,
      evalStatusText,
      combinedFeedback
    ];

    rows.push(rowData.map(escapeCsvField).join(','));
  });

  // Prepend UTF-8 BOM \uFEFF for seamless Thai character encoding in Excel
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Triggers client-side download of CSV file
 */
export function downloadCsvBlob(csvContent: string, fileName: string): boolean {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to download CSV blob:', err);
    return false;
  }
}

/**
 * Sanitize filename to avoid invalid OS characters
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}
