import { AILessonPlanRequest, AILessonPlanResult } from '../types';

export interface GeneratePlanResponse {
  success: boolean;
  isAIGenerated: boolean;
  model: string;
  plan: AILessonPlanResult;
  error?: string;
}

export interface GeneratePAIdeaResponse {
  success: boolean;
  isAIGenerated: boolean;
  challengeTitle: string;
  rationale: string;
  expectedOutcome?: string;
  error?: string;
}

/**
 * Call server-side Gemini API to generate lesson plan
 */
export async function generateAILessonPlan(params: AILessonPlanRequest): Promise<GeneratePlanResponse> {
  try {
    const response = await fetch('/api/ai/lesson-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.warn('AI Lesson plan generation error, falling back to local synthesis:', err);
    
    // Client-side fallback if network or endpoint has temporary disconnect
    return {
      success: true,
      isAIGenerated: false,
      model: 'fallback-offline-template',
      plan: {
        lessonTitle: `แผนการจัดการเรียนรู้เรื่อง ${params.topic}`,
        subject: params.subject,
        gradeLevel: params.gradeLevel,
        timeAllocation: params.duration || '1 ชั่วโมง (60 นาที)',
        coreConcept: `การเรียนรู้เรื่อง ${params.topic} เป็นพื้นฐานสำคัญในการพัฒนาทักษะกระบวนการคิด การลงมือปฏิบัติ และการเชื่อมโยงความรู้สู่ชีวิตจริง`,
        standardAndIndicator: `มาตรฐานและตัวชี้วัดกลุ่มสาระการเรียนรู้ ${params.subject} ชั้น ${params.gradeLevel}`,
        objectives: {
          knowledge: [
            `1. อธิบายความรู้ความเข้าใจเรื่อง ${params.topic} ได้อย่างถูกต้อง (K)`,
            `2. สรุปประเด็นสำคัญและยกตัวอย่างประกอบได้ (K)`
          ],
          process: [
            `1. ปฏิบัติกิจกรรมกลุ่มและการสืบค้นข้อมูลตามกระบวนการ ${params.teachingMethod || 'Active Learning'} (P)`,
            `2. สร้างสรรค์ผลงาน / ใบงานตามที่ได้รับมอบหมายได้สำเร็จ (P)`
          ],
          attitude: [
            `1. มีความกระตือรือร้นและมุ่งมั่นในการทำงาน (A)`,
            `2. มีวินัยและความร่วมมือในการทำงานร่วมกับผู้อื่น (A)`
          ]
        },
        learningSteps: {
          intro: {
            title: '1. ขั้นนำเข้าสู่บทเรียน (Engagement)',
            time: '10 นาที',
            details: `ครูเปิดประเด็นด้วยภาพตัวอย่างหรือคำถามชวนคิดเกี่ยวกับ ${params.topic} เพื่อกระตุ้นความสนใจและเชื่อมโยงประสบการณ์เดิม`,
            questions: [
              `นักเรียนเคยพบเห็นสิ่งที่เกี่ยวข้องกับ ${params.topic} ในชีวิตประจำวันบ้างหรือไม่?`,
              `สิ่งนี้มีความสำคัญต่อนักเรียนและสิ่งแวดล้อมอย่างไร?`
            ]
          },
          teaching: {
            title: `2. ขั้นจัดกิจกรรมการเรียนรู้แบบ ${params.teachingMethod || 'Active Learning'}`,
            time: '35 นาที',
            details: `นักเรียนปฏิบัติกิจกรรมตามกลุ่มย่อย มีการลงมือทดลอง/สร้างสรรค์ชิ้นงาน โดยครูทำหน้าที่คอยแนะนำและกระตุ้นการคิดอย่างต่อเนื่อง`,
            activeActivities: [
              `การศึกษาข้อมูลและใบความรู้เรื่อง ${params.topic}`,
              `การระดมสมองและลงมือปฏิบัติกิจกรรมกลุ่ม`,
              `การนำเสนอผลงานและร่วมกันอภิปรายสรุปความรู้`
            ]
          },
          conclusion: {
            title: '3. ขั้นสรุปและการสะท้อนคิด (Reflection & Evaluation)',
            time: '15 นาที',
            details: `ครูและนักเรียนร่วมกันสรุปสิ่งที่ได้เรียนรู้ นักเรียนประเมินตนเองและทำใบงานทบทวนความรู้`,
            reflectionQuestions: [
              `สิ่งสำคัญที่สุดที่นักเรียนได้เรียนรู้ในวันนี้คืออะไร?`,
              `นักเรียนจะนำความรู้ไปประยุกต์ใช้อย่างไรต่อไป?`
            ]
          }
        },
        instructionalMedia: [
          `1. สไลด์การสอน Interactive / วิดีโอสั้น`,
          `2. ใบงานและใบกิจกรรมฝึกทักษะเรื่อง ${params.topic}`,
          `3. แหล่งเรียนรู้ดิจิทัลโรงเรียนวัดบางโฉลงใน`
        ],
        assessment: {
          methods: [
            'การประเมินผลงานจากใบงานและชิ้นงาน',
            'การสังเกตพฤติกรรมการทำงานกลุ่มและการมีส่วนร่วม'
          ],
          tools: [
            'แบบประเมินใบงาน (Rubric)',
            'แบบประเมินคุณลักษณะอันพึงประสงค์ (K-P-A)'
          ],
          criteria: 'ผ่านเกณฑ์ระดับดีขึ้นไป (ร้อยละ 70)'
        },
        worksheetActivity: `ให้นักเรียนสรุปใจความสำคัญของ ${params.topic} ในรูปแบบผังความคิด (Mind Map) หรือภาพประกอบคำอธิบาย`,
        postLessonReflection: `นักเรียนทุกคนสามารถร่วมกิจกรรมได้ครบถ้วน และมีส่วนร่วมในการอภิปรายอย่างสร้างสรรค์`,
        paAlignmentTips: `สามารถนำกระบวนการสอนนี้ไปใช้เป็นประเด็นท้าทายในข้อตกลง PA เพื่อพัฒนาทักษะการเรียนรู้เชิงรุก (Active Learning) ของผู้เรียนได้`
      }
    };
  }
}

/**
 * Generate PA challenge idea for teacher performance agreement
 */
export async function generateAIPAIdea(params: {
  subject: string;
  gradeLevel: string;
  targetStanding: string;
  issueDescription?: string;
}): Promise<GeneratePAIdeaResponse> {
  try {
    const response = await fetch('/api/ai/pa-idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    return {
      success: true,
      isAIGenerated: false,
      challengeTitle: `การพัฒนากระบวนการจัดการเรียนรู้เชิงรุก (Active Learning) ในวิชา${params.subject} ชั้น ${params.gradeLevel} เพื่อยกระดับผลสัมฤทธิ์ทางการเรียนและทักษะแห่งศตวรรษที่ 21`,
      rationale: `มุ่งเน้นการแก้ปัญหาสภาพการจัดการเรียนรู้เพื่อให้นักเรียนสามารถคิดวิเคราะห์และลงมือปฏิบัติจริงได้อย่างมีความหมาย สอดคล้องกับมาตรฐานตำแหน่งและวิทยฐานะ ${params.targetStanding}`,
      expectedOutcome: `นักเรียนไม่น้อยกว่าร้อยละ 75 มีผลสัมฤทธิ์และการประเมินทักษะอยู่ในระดับดีขึ้นไป`,
    };
  }
}

export interface TeacherQAResponse {
  success: boolean;
  isAIGenerated: boolean;
  model: string;
  answer: string;
  suggestedFollowUps: string[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAIGenerated?: boolean;
  suggestedFollowUps?: string[];
}

/**
 * Ask teacher Q&A AI assistant
 */
export async function askAITeacherQA(params: {
  question: string;
  context?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<TeacherQAResponse> {
  try {
    const response = await fetch('/api/ai/teacher-qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.warn('Teacher Q&A AI error, providing rich local pedagogical fallback:', err);
    return {
      success: true,
      isAIGenerated: false,
      model: 'local-pedagogic-engine',
      answer: `### 👩‍🏫 คำแนะนำจากผู้ช่วยครู โรงเรียนวัดบางโฉลงใน

เกี่ยวกับประเด็น: **${params.question}**

1. **แนวทางปฏิบัติการจัดการเรียนรู้:**
   - มุ่งเน้นการจัดการเรียนรู้เชิงรุก (Active Learning) ให้ผู้เรียนได้ลงมือคิดและปฏิบัติจริง
   - ออกแบบกิจกรรมที่สอดคล้องกับตัวชี้วัด K-P-A (ความรู้ ทักษะ คุณลักษณะ)
   - จัดบรรยากาศเชิงบวกและการเสริมแรงเพื่อกระตุ้นแรงจูงใจในการเรียนรู้

2. **การเชื่อมโยงสู่เกณฑ์ ว PA:**
   - นำผลการจัดการเรียนรู้และชิ้นงานของผู้เรียนมาสะท้อนคิด (Reflection)
   - บันทึกข้อมูลเพื่อใช้เป็นหลักฐานเชิงประจักษ์ในการประเมินผลการพัฒนางาน

💡 *คำแนะนำเพิ่มเติม:* สามารถใช้เครื่องมือดิจิทัล เช่น Canva, Quizizz หรือแหล่งเรียนรู้ดิจิทัลของโรงเรียนเพื่อเพิ่มความน่าสนใจในการสอน`,
      suggestedFollowUps: [
        'เทคนิคการวัดและประเมินผลตามสภาพจริงด้วย Rubrics',
        'การจัดทำข้อตกลง PA ด้านการจัดการเรียนรู้ 8 ตัวชี้วัด',
        'แนวทางการแก้ปัญหานักเรียนที่มีความต้องการจำเป็นพิเศษ',
      ],
    };
  }
}

