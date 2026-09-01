import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AILessonPlanResult, GradeLevel } from '../types';
import { generateAILessonPlan } from '../services/aiService';
import { 
  Sparkles, 
  X, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Printer, 
  Share2, 
  Layers, 
  Clock, 
  Target, 
  Lightbulb, 
  FolderPlus,
  HelpCircle,
  Wand2,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface PresetPrompt {
  label: string;
  subject: string;
  gradeLevel: string;
  topic: string;
  teachingMethod: string;
  specificNeeds: string;
}

const PRESET_PROMPTS: PresetPrompt[] = [
  {
    label: '🔬 วิทย์ ป.4: การจำแนกสิ่งมีชีวิต (5E)',
    subject: 'วิทยาศาสตร์และเทคโนโลยี',
    gradeLevel: 'ประถมศึกษาปีที่ 4 (ป.4)',
    topic: 'การจำแนกสิ่งมีชีวิต (พืช สัตว์ และกลุ่มที่ไม่ใช่พืชและสัตว์)',
    teachingMethod: 'Active Learning (5E Instructional Model)',
    specificNeeds: 'เน้นให้นักเรียนได้สำรวจตัวอย่างสิ่งมีชีวิตรอบโรงเรียน และทำกิจกรรมกลุ่มจัดหมวดหมู่',
  },
  {
    label: '📖 ไทย ป.1: มาตราตัวสะกดแม่กบ (BBL)',
    subject: 'ภาษาไทย',
    gradeLevel: 'ประถมศึกษาปีที่ 1 (ป.1)',
    topic: 'มาตราตัวสะกดแม่กบ (ตรงตามมาตราและไม่ตรงตามมาตรา)',
    teachingMethod: 'Brain-Based Learning (BBL) & การเรียนรู้ผ่านเกม',
    specificNeeds: 'ใช้บทเพลง ปริศนาคำทาย และเกมบัตรคำสีสันสดใส เหมาะสำหรับเด็ก ป.1',
  },
  {
    label: '📐 คณิต ป.3: การคูณในชีวิตจริง (PBL)',
    subject: 'คณิตศาสตร์',
    gradeLevel: 'ประถมศึกษาปีที่ 3 (ป.3)',
    topic: 'โจทย์ปัญหาการคูณจำนวนไม่เกิน 100,000 ในชีวิตประจำวัน',
    teachingMethod: 'Problem-Based Learning (PBL) สถานการณ์จำลอง',
    specificNeeds: 'จำลองสถานการณ์ตลาดนัดซื้อขายสินค้าในชุมชนบางพลี เพื่อให้เห็นประโยชน์จริง',
  },
  {
    label: '🎨 ปฐมวัย อ.2: ประสาทสัมผัสทั้งห้า',
    subject: 'การศึกษาปฐมวัย',
    gradeLevel: 'อนุบาล 2',
    topic: 'การรับรู้และการใช้ประโยชน์จากประสาทสัมผัสทั้ง 5',
    teachingMethod: 'การจัดประสบการณ์ผ่านการเล่นและการลงมือกระทำ (Learning by Doing)',
    specificNeeds: 'เน้นเกมทายรสชาติ กลิ่น เสียง และงานศิลปะปั้นดินน้ำมันฝึกกล้ามเนื้อมัดเล็ก',
  },
  {
    label: '🌍 สังคม ป.5: ประวัติศาสตร์ท้องถิ่นบางพลี',
    subject: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    gradeLevel: 'ประถมศึกษาปีที่ 5 (ป.5)',
    topic: 'ประวัติศาสตร์ท้องถิ่นอำเภอบางพลีและประเพณีรับบัว',
    teachingMethod: 'Storytelling & แหล่งเรียนรู้ชุมชน',
    specificNeeds: 'สอดแทรกประเพณีรับบัวอันเป็นเอกลักษณ์ของชาวบางพลี สมุทรปราการ',
  },
  {
    label: '🗣️ อังกฤษ ป.6: My Daily Routine',
    subject: 'ภาษาต่างประเทศ (ภาษาอังกฤษ)',
    gradeLevel: 'ประถมศึกษาปีที่ 6 (ป.6)',
    topic: 'Talking about Daily Routines and Free Time Activities',
    teachingMethod: 'Communicative Language Teaching (CLT) & Role-play',
    specificNeeds: 'เน้นการสื่อสารจริง สนทนาคู่ และสร้าง Mind Map กิจกรรมประจำวัน',
  },
];

export const AILessonPlannerModal: React.FC = () => {
  const { isAIPlannerOpen, setIsAIPlannerOpen, currentTeacher, addResource, categories } = useApp();

  const [subject, setSubject] = useState('วิทยาศาสตร์และเทคโนโลยี');
  const [gradeLevel, setGradeLevel] = useState('ประถมศึกษาปีที่ 4 (ป.4)');
  const [topic, setTopic] = useState('การจำแนกสิ่งมีชีวิต');
  const [duration, setDuration] = useState('1 ชั่วโมง (60 นาที)');
  const [teachingMethod, setTeachingMethod] = useState('Active Learning (5E Instructional Model)');
  const [specificNeeds, setSpecificNeeds] = useState('เน้นกิจกรรมกลุ่ม การลงมือปฏิบัติจริง และสื่อภาพสีสันสดใส');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [planResult, setPlanResult] = useState<AILessonPlanResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'steps' | 'assessment' | 'worksheet' | 'reflection'>('overview');
  const [copied, setCopied] = useState(false);
  const [savedToRepo, setSavedToRepo] = useState(false);

  if (!isAIPlannerOpen) return null;

  const handleApplyPreset = (preset: PresetPrompt) => {
    setSubject(preset.subject);
    setGradeLevel(preset.gradeLevel);
    setTopic(preset.topic);
    setTeachingMethod(preset.teachingMethod);
    setSpecificNeeds(preset.specificNeeds);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setPlanResult(null);
    setSavedToRepo(false);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 900);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2000);

    try {
      const res = await generateAILessonPlan({
        subject,
        gradeLevel,
        topic,
        duration,
        teachingMethod,
        specificNeeds,
      });

      if (res.success && res.plan) {
        setPlanResult(res.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!planResult) return;

    const textToCopy = `
=========================================
${planResult.lessonTitle}
กลุ่มสาระการเรียนรู้: ${planResult.subject} | ระดับชั้น: ${planResult.gradeLevel}
เวลาที่ใช้: ${planResult.timeAllocation}
=========================================

1. สาระสำคัญ / ความคิดรวบยอด:
${planResult.coreConcept}

2. มาตรฐานการเรียนรู้และตัวชี้วัด:
${planResult.standardAndIndicator}

3. จุดประสงค์การเรียนรู้:
- ด้านความรู้ (K):
${planResult.objectives.knowledge.map(k => `  • ${k}`).join('\n')}
- ด้านทักษะ/กระบวนการ (P):
${planResult.objectives.process.map(p => `  • ${p}`).join('\n')}
- ด้านคุณลักษณะอันพึงประสงค์ (A):
${planResult.objectives.attitude.map(a => `  • ${a}`).join('\n')}

4. กิจกรรมการเรียนรู้:
[${planResult.learningSteps.intro.title}] (${planResult.learningSteps.intro.time})
${planResult.learningSteps.intro.details}
คำถามกระตุ้นคิด:
${planResult.learningSteps.intro.questions.map(q => `  ? ${q}`).join('\n')}

[${planResult.learningSteps.teaching.title}] (${planResult.learningSteps.teaching.time})
${planResult.learningSteps.teaching.details}
กิจกรรมหลัก:
${planResult.learningSteps.teaching.activeActivities.map(act => `  - ${act}`).join('\n')}

[${planResult.learningSteps.conclusion.title}] (${planResult.learningSteps.conclusion.time})
${planResult.learningSteps.conclusion.details}
คำถามสะท้อนคิด:
${planResult.learningSteps.conclusion.reflectionQuestions.map(rq => `  ? ${rq}`).join('\n')}

5. สื่อและแหล่งการเรียนรู้:
${planResult.instructionalMedia.map(m => `  • ${m}`).join('\n')}

6. การวัดและประเมินผล:
- วิธีการ: ${planResult.assessment.methods.join(', ')}
- เครื่องมือ: ${planResult.assessment.tools.join(', ')}
- เกณฑ์การประเมิน: ${planResult.assessment.criteria}

7. ข้อเสนอแนะใบงาน/ชิ้นงาน:
${planResult.worksheetActivity}

8. บันทึกผลหลังการจัดการเรียนรู้:
${planResult.postLessonReflection}

9. การเชื่อมโยงข้อตกลง PA (ประเด็นท้าทาย):
${planResult.paAlignmentTips}

(จัดทำโดย AI Smart Lesson Planner โรงเรียนวัดบางโฉลงใน)
`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToMediaRepo = () => {
    if (!planResult) return;

    // Find suitable category
    const cat = categories.find(c => c.name.includes(planResult.subject) || planResult.subject.includes(c.name)) || categories[0];

    // Map grade level safely to GradeLevel union
    let mappedGrade: GradeLevel = 'ทุกระดับชั้น';
    if (gradeLevel.includes('ป.1')) mappedGrade = 'ป.1';
    else if (gradeLevel.includes('ป.2')) mappedGrade = 'ป.2';
    else if (gradeLevel.includes('ป.3')) mappedGrade = 'ป.3';
    else if (gradeLevel.includes('ป.4')) mappedGrade = 'ป.4';
    else if (gradeLevel.includes('ป.5')) mappedGrade = 'ป.5';
    else if (gradeLevel.includes('ป.6')) mappedGrade = 'ป.6';

    addResource({
      title: planResult.lessonTitle,
      description: `แผนการจัดการเรียนรู้ ${planResult.subject} เรื่อง ${topic} รูปแบบ ${teachingMethod} พร้อมใบกิจกรรมและเกณฑ์ประเมิน KPA สอดคล้องเกณฑ์ ว PA`,
      cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
      fileUrl: 'https://docs.google.com',
      fileType: 'Word',
      fileSize: '1.2 MB',
      teacherId: currentTeacher?.id || 't-1',
      teacherName: currentTeacher?.name || 'ครูผู้สอนโรงเรียนวัดบางโฉลงใน',
      teacherPhoto: currentTeacher?.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
      teacherPosition: currentTeacher?.position || gradeLevel,
      categoryId: cat ? cat.id : 'cat-1',
      categoryName: cat ? cat.name : planResult.subject,
      categoryColor: cat ? cat.color : '#005BAC',
      gradeLevel: mappedGrade,
      tags: ['แผนการสอน', 'Active Learning', 'ว PA', planResult.subject, 'AI Generated'],
      status: 'approved'
    });

    setSavedToRepo(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#005BAC] via-[#004382] to-[#002f5c] text-white p-5 sm:p-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 w-48 h-48 bg-[#FFD54F]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-[#FFD54F] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-prompt font-bold tracking-tight">
                  AI ช่วยครูสร้างแผนการสอน
                </h2>
                <span className="bg-[#FFD54F] text-[#003875] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Gemini 3.7 Pro
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                ออกแบบแผนการจัดการเรียนรู้ Active Learning, มาตรฐานตัวชี้วัด, จุดประสงค์ KPA และเกณฑ์ประเมิน ว PA อัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAIPlannerOpen(false)}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Preset Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-[#005BAC]" />
                ตัวอย่างคำสั่งด่วน (1-Click Preset Template)
              </span>
              <span className="text-[11px] text-slate-400">คลิกเพื่อกรอกอัตโนมัติ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-[#005BAC] hover:border-[#005BAC]/30 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-medium transition duration-150 text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  กลุ่มสาระการเรียนรู้ / สาขาวิชา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                >
                  <option value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</option>
                  <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                  <option value="ภาษาไทย">ภาษาไทย</option>
                  <option value="ภาษาต่างประเทศ (ภาษาอังกฤษ)">ภาษาต่างประเทศ (ภาษาอังกฤษ)</option>
                  <option value="สังคมศึกษา ศาสนา และวัฒนธรรม">สังคมศึกษา ศาสนา และวัฒนธรรม</option>
                  <option value="สุขศึกษาและพลศึกษา">สุขศึกษาและพลศึกษา</option>
                  <option value="ศิลปะ ดนตรี และนาฏศิลป์">ศิลปะ ดนตรี และนาฏศิลป์</option>
                  <option value="การงานอาชีพ">การงานอาชีพ</option>
                  <option value="การศึกษาปฐมวัย">การศึกษาปฐมวัย</option>
                  <option value="กิจกรรมพัฒนาผู้เรียน / แนะแนว">กิจกรรมพัฒนาผู้เรียน / แนะแนว</option>
                </select>
              </div>

              {/* Grade Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระดับชั้น / สายชั้น <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                >
                  <option value="อนุบาล 2">อนุบาล 2</option>
                  <option value="อนุบาล 3">อนุบาล 3</option>
                  <option value="ประถมศึกษาปีที่ 1 (ป.1)">ประถมศึกษาปีที่ 1 (ป.1)</option>
                  <option value="ประถมศึกษาปีที่ 2 (ป.2)">ประถมศึกษาปีที่ 2 (ป.2)</option>
                  <option value="ประถมศึกษาปีที่ 3 (ป.3)">ประถมศึกษาปีที่ 3 (ป.3)</option>
                  <option value="ประถมศึกษาปีที่ 4 (ป.4)">ประถมศึกษาปีที่ 4 (ป.4)</option>
                  <option value="ประถมศึกษาปีที่ 5 (ป.5)">ประถมศึกษาปีที่ 5 (ป.5)</option>
                  <option value="ประถมศึกษาปีที่ 6 (ป.6)">ประถมศึกษาปีที่ 6 (ป.6)</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระยะเวลาในการจัดการเรียนรู้
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                >
                  <option value="1 ชั่วโมง (60 นาที)">1 ชั่วโมง (60 นาที)</option>
                  <option value="2 ชั่วโมง (120 นาที)">2 ชั่วโมง (120 นาที)</option>
                  <option value="3 ชั่วโมง (หน่วยย่อยบูรณาการ)">3 ชั่วโมง (หน่วยย่อยบูรณาการ)</option>
                  <option value="40 นาที (คาบสั้น/ปฐมวัย)">40 นาที (คาบสั้น/ปฐมวัย)</option>
                </select>
              </div>

              {/* Topic */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หัวข้อ / ชื่อหน่วยการเรียนรู้ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น การจำแนกสิ่งมีชีวิต, มาตราตัวสะกด, แรงและพลังงาน..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                />
              </div>

              {/* Teaching Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รูปแบบการจัดการเรียนรู้
                </label>
                <select
                  value={teachingMethod}
                  onChange={(e) => setTeachingMethod(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                >
                  <option value="Active Learning (5E Instructional Model)">Active Learning (5E สืบเสาะหาความรู้)</option>
                  <option value="Brain-Based Learning (BBL) บูรณาการสมอง">Brain-Based Learning (BBL บูรณาการสมอง)</option>
                  <option value="Problem-Based Learning (PBL) ใช้ปัญหาเป็นฐาน">Problem-Based Learning (PBL ใช้ปัญหาเป็นฐาน)</option>
                  <option value="STEAM Education สะตีมศึกษาบูรณาการ">STEAM Education สะตีมศึกษาบูรณาการ</option>
                  <option value="Gamification & Game-Based Learning">Gamification & การเรียนรู้ผ่านเกม</option>
                  <option value="Cooperative Learning กระบวนการกลุ่ม">Cooperative Learning กระบวนการกลุ่ม</option>
                  <option value="Storytelling & Role-Play แสดงบทบาทสมมติ">Storytelling & Role-Play แสดงบทบาทสมมติ</option>
                </select>
              </div>

              {/* Specific Needs / Context */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ความต้องการพิเศษ / บริบทนักเรียน (ตัวเลือกเพิ่มเติม)
                </label>
                <input
                  type="text"
                  placeholder="เช่น เน้นเด็กเรียนช้า, เสริมทักษะการคิดขั้นสูง, มีสื่อคลิปวิดีโอ, กิจกรรมกลุ่ม 4 คน..."
                  value={specificNeeds}
                  onChange={(e) => setSpecificNeeds(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC]"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-[#005BAC] to-[#00407a] hover:from-[#004b8f] hover:to-[#003366] text-white font-prompt font-bold text-sm px-6 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 transition duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI กำลังออกแบบแผนการสอน...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFD54F]" />
                    <span>สร้างแผนการสอนด้วย AI</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading Animation Card */}
          {isLoading && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-8 text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 bg-white rounded-full shadow-md mx-auto flex items-center justify-center border border-blue-100">
                <Sparkles className="w-8 h-8 text-[#005BAC] animate-bounce" />
              </div>
              <h3 className="font-prompt font-bold text-slate-800 text-lg">
                ระบบ AI กำลังประมวลผลแผนการจัดการเรียนรู้มาตรฐาน...
              </h3>
              <div className="max-w-md mx-auto space-y-2 text-xs text-slate-600 font-medium">
                <div className={`flex items-center space-x-2 justify-center transition duration-200 ${loadingStep >= 1 ? 'text-[#005BAC] font-bold' : 'opacity-40'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>วิเคราะห์มาตรฐานหลักสูตรแกนกลาง และกำหนดจุดประสงค์ K-P-A</span>
                </div>
                <div className={`flex items-center space-x-2 justify-center transition duration-200 ${loadingStep >= 2 ? 'text-[#005BAC] font-bold' : 'opacity-40'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>ออกแบบกิจกรรมการเรียนรู้เชิงรุก (Active Learning 3 ขั้นตอน)</span>
                </div>
                <div className={`flex items-center space-x-2 justify-center transition duration-200 ${loadingStep >= 3 ? 'text-[#005BAC] font-bold' : 'opacity-40'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>สร้างเกณฑ์การวัดและประเมินผล (Rubric) และแนวทางข้อตกลง ว PA</span>
                </div>
              </div>
            </div>
          )}

          {/* Generated Result Container */}
          {planResult && !isLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              
              {/* Result Header & Action Toolbar */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-md">
                      สำเร็จ (พร้อมใช้งาน)
                    </span>
                    <span className="text-xs text-slate-400">
                      {planResult.gradeLevel} • {planResult.subject}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-prompt font-bold text-white mt-1">
                    {planResult.lessonTitle}
                  </h3>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition border border-white/15"
                    title="คัดลอกข้อความทั้งหมด"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกทั้งหมด</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition border border-white/15"
                    title="พิมพ์เอกสาร"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์</span>
                  </button>

                  <button
                    onClick={handleSaveToMediaRepo}
                    disabled={savedToRepo}
                    className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs ${
                      savedToRepo
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#FFD54F] text-[#003875] hover:bg-amber-300'
                    }`}
                  >
                    {savedToRepo ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>บันทึกลงคลังสื่อแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>บันทึกลงคลังสื่อโรงเรียน</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Result Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 overflow-x-auto">
                <button
                  onClick={() => setActiveResultTab('overview')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    activeResultTab === 'overview'
                      ? 'border-[#005BAC] text-[#005BAC]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. สาระสำคัญ & จุดประสงค์ KPA
                </button>
                <button
                  onClick={() => setActiveResultTab('steps')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    activeResultTab === 'steps'
                      ? 'border-[#005BAC] text-[#005BAC]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. กิจกรรมการเรียนรู้ (นำ-สอน-สรุป)
                </button>
                <button
                  onClick={() => setActiveResultTab('assessment')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    activeResultTab === 'assessment'
                      ? 'border-[#005BAC] text-[#005BAC]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3. สื่อ & การวัดและประเมินผล
                </button>
                <button
                  onClick={() => setActiveResultTab('worksheet')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    activeResultTab === 'worksheet'
                      ? 'border-[#005BAC] text-[#005BAC]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  4. ใบงาน & กิจกรรมฝึกทักษะ
                </button>
                <button
                  onClick={() => setActiveResultTab('reflection')}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                    activeResultTab === 'reflection'
                      ? 'border-[#005BAC] text-[#005BAC]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  5. บันทึกหลังสอน & ว PA
                </button>
              </div>

              {/* Result Content Area */}
              <div className="p-5 sm:p-6 text-slate-800 text-xs sm:text-sm leading-relaxed space-y-6">
                
                {/* Tab 1: Overview & Objectives */}
                {activeResultTab === 'overview' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                      <h4 className="font-bold text-[#005BAC] text-sm flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-4 h-4" /> สาระสำคัญ / ความคิดรวบยอด (Core Concept)
                      </h4>
                      <p className="text-slate-700 leading-normal">{planResult.coreConcept}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-1.5">
                        <Target className="w-4 h-4 text-amber-500" /> มาตรฐานการเรียนรู้และตัวชี้วัด
                      </h4>
                      <p className="text-slate-700">{planResult.standardAndIndicator}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" /> จุดประสงค์การเรียนรู้ (Objectives K-P-A)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                          <span className="font-bold text-emerald-800 block mb-1">
                            ความรู้ (Knowledge - K)
                          </span>
                          <ul className="space-y-1 text-slate-700 text-xs">
                            {planResult.objectives.knowledge.map((k, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{k}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5">
                          <span className="font-bold text-blue-800 block mb-1">
                            ทักษะกระบวนการ (Process - P)
                          </span>
                          <ul className="space-y-1 text-slate-700 text-xs">
                            {planResult.objectives.process.map((p, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5">
                          <span className="font-bold text-amber-800 block mb-1">
                            คุณลักษณะ (Attitude - A)
                          </span>
                          <ul className="space-y-1 text-slate-700 text-xs">
                            {planResult.objectives.attitude.map((a, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Learning Steps */}
                {activeResultTab === 'steps' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    
                    {/* Step 1: Intro */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#005BAC] text-white flex items-center justify-center text-[10px]">1</span>
                          {planResult.learningSteps.intro.title}
                        </h4>
                        <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {planResult.learningSteps.intro.time}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{planResult.learningSteps.intro.details}</p>
                      {planResult.learningSteps.intro.questions.length > 0 && (
                        <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 text-xs">
                          <span className="font-bold text-[#005BAC] block mb-1">คำถามกระตุ้นการคิด / ตั้งประเด็น:</span>
                          <ul className="space-y-0.5 text-slate-600">
                            {planResult.learningSteps.intro.questions.map((q, idx) => (
                              <li key={idx}>❓ {q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Step 2: Teaching */}
                    <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-[#005BAC] text-sm flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#005BAC] text-white flex items-center justify-center text-[10px]">2</span>
                          {planResult.learningSteps.teaching.title}
                        </h4>
                        <span className="bg-blue-100 text-[#005BAC] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {planResult.learningSteps.teaching.time}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{planResult.learningSteps.teaching.details}</p>
                      {planResult.learningSteps.teaching.activeActivities.length > 0 && (
                        <div className="bg-white border border-blue-200/80 rounded-lg p-2.5 text-xs">
                          <span className="font-bold text-slate-800 block mb-1">กิจกรรมการเรียนรู้เชิงรุก (Active Activities):</span>
                          <ul className="space-y-1 text-slate-700">
                            {planResult.learningSteps.teaching.activeActivities.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <ChevronRight className="w-3.5 h-3.5 text-[#005BAC] shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Conclusion */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#005BAC] text-white flex items-center justify-center text-[10px]">3</span>
                          {planResult.learningSteps.conclusion.title}
                        </h4>
                        <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {planResult.learningSteps.conclusion.time}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{planResult.learningSteps.conclusion.details}</p>
                      {planResult.learningSteps.conclusion.reflectionQuestions.length > 0 && (
                        <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 text-xs">
                          <span className="font-bold text-emerald-700 block mb-1">คำถามสะท้อนคิด (Reflection Questions):</span>
                          <ul className="space-y-0.5 text-slate-600">
                            {planResult.learningSteps.conclusion.reflectionQuestions.map((rq, idx) => (
                              <li key={idx}>💡 {rq}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Tab 3: Assessment & Media */}
                {activeResultTab === 'assessment' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#005BAC]" /> สื่อและแหล่งการเรียนรู้แนะนำ (Instructional Media)
                      </h4>
                      <ul className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
                        {planResult.instructionalMedia.map((media, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#005BAC]" />
                            <span>{media}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> การวัดและประเมินผล (Assessment Plan)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <span className="font-bold text-slate-800 block text-xs mb-1">วิธีการประเมิน:</span>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {planResult.assessment.methods.map((m, i) => (
                              <li key={i}>• {m}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <span className="font-bold text-slate-800 block text-xs mb-1">เครื่องมือวัดผล:</span>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {planResult.assessment.tools.map((t, i) => (
                              <li key={i}>• {t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                        <span className="font-bold text-emerald-800">เกณฑ์การผ่านการประเมิน:</span> {planResult.assessment.criteria}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Worksheet */}
                {activeResultTab === 'worksheet' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#005BAC]" /> โครงร่างใบงานและกิจกรรมฝึกทักษะ
                      </h4>
                      <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {planResult.worksheetActivity}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Reflection & PA */}
                {activeResultTab === 'reflection' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" /> แนวทางการบันทึกหลังการจัดการเรียนรู้
                      </h4>
                      <p className="text-slate-700 text-xs leading-normal">{planResult.postLessonReflection}</p>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                      <h4 className="font-bold text-amber-900 text-sm mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" /> เคล็ดลับการเชื่อมโยงกับข้อตกลงในการพัฒนางาน (ว PA)
                      </h4>
                      <p className="text-amber-950 text-xs leading-normal">{planResult.paAlignmentTips}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center text-xs text-slate-500">
          <span>ระบบสร้างแผนการสอนอัจฉริยะ โรงเรียนวัดบางโฉลงใน สพป.สมุทรปราการ เขต 2</span>
          <button
            onClick={() => setIsAIPlannerOpen(false)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-1.5 rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
