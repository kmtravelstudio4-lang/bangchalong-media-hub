import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper for clean promise timeout with timer clearance
async function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Helper to safely initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.log("Gemini client initialization:", err);
    return null;
  }
}

/**
 * Built-in pedagogical curriculum plan generator for Thai Basic Education Core Curriculum (B.E. 2551 & revisions)
 * Provides comprehensive, high-quality lesson plans when AI key is missing or when network timeout occurs.
 */
function buildDynamicPedagogicLessonPlan(params: {
  subject: string;
  gradeLevel: string;
  topic: string;
  duration?: string;
  teachingMethod?: string;
  specificNeeds?: string;
}) {
  const {
    subject = "วิทยาศาสตร์และเทคโนโลยี",
    gradeLevel = "ประถมศึกษาปีที่ 4 (ป.4)",
    topic = "การเรียนรู้เชิงรุก",
    duration = "1 ชั่วโมง (60 นาที)",
    teachingMethod = "Active Learning (5E Instructional Model)",
    specificNeeds = "เน้นการทดลอง สื่อประกอบภาพ และเกมการเรียนรู้สำหรับเด็กประถม",
  } = params;

  return {
    lessonTitle: `แผนการจัดการเรียนรู้เรื่อง ${topic}`,
    subject: subject,
    gradeLevel: gradeLevel,
    timeAllocation: duration || "1 ชั่วโมง (60 นาที)",
    coreConcept: `การเรียนรู้เกี่ยวกับ ${topic} ช่วยให้นักเรียนพัฒนาองค์ความรู้พื้นฐาน ฝึกทักษะกระบวนการคิดวิเคราะห์ การสังเกต การทำงานร่วมกันเป็นทีม และสามารถนำความรู้ไปเชื่อมโยงประยุกต์ใช้ในชีวิตประจำวันได้อย่างถูกต้องและสร้างสรรค์`,
    standardAndIndicator: `มาตรฐานการเรียนรู้ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 (ฉบับปรับปรุง 2560) กลุ่มสาระการเรียนรู้ ${subject} สอดคล้องกับตัวชี้วัดชั้น ${gradeLevel}`,
    objectives: {
      knowledge: [
        `1. อธิบายความหมาย ความสำคัญ และหลักการสำคัญของ ${topic} ได้อย่างถูกต้อง (K)`,
        `2. ระบุ จำแนก และยกตัวอย่างที่เกี่ยวข้องกับ ${topic} ในบริบทชีวิตประจำวันได้ (K)`,
      ],
      process: [
        `1. ปฏิบัติกิจกรรมกลุ่มและการสืบค้น/ทดลองตามกระบวนการ ${teachingMethod} ได้อย่างมีประสิทธิภาพ (P)`,
        `2. บันทึกผล อภิปราย และสร้างสรรค์ผลงานหรือใบกิจกรรมเรื่อง ${topic} ได้ถูกต้องตามเกณฑ์ (P)`,
      ],
      attitude: [
        `1. มีความกระตือรือร้น ใฝ่เรียนรู้ และร่วมกิจกรรมด้วยความมุ่งมั่นและตั้งใจ (A)`,
        `2. มีวินัย มีความรับผิดชอบ และเคารพความคิดเห็นของเพื่อนร่วมชั้นเรียน (A)`,
      ],
    },
    learningSteps: {
      intro: {
        title: "ขั้นที่ 1: ขั้นนำเข้าสู่บทเรียนและกระตุ้นความสนใจ (Engagement)",
        time: "10 นาที",
        details: `ครูกล่าวทักทายนักเรียน จากนั้นเปิดประเด็นด้วยคำถามชวนคิด ภาพปริศนา หรือคลิปวิดีโอสั้นเกี่ยวกับ ${topic} เพื่อกระตุ้นความสนใจและเชื่อมโยงกับประสบการณ์เดิมของผู้เรียน`,
        questions: [
          `นักเรียนเคยพบเห็นหรือมีประสบการณ์เกี่ยวกับ ${topic} ในชีวิตประจำวันบ้างหรือไม่?`,
          `ถ้าหากเราสังเกตสิ่งรอบตัว นักเรียนคิดว่า ${topic} มีประโยชน์หรือเกี่ยวข้องกับตัวเราอย่างไร?`,
        ],
      },
      teaching: {
        title: `ขั้นที่ 2: ขั้นจัดกิจกรรมการเรียนรู้แบบ ${teachingMethod}`,
        time: "35 นาที",
        details: `นักเรียนร่วมกันศึกษาใบความรู้และแบ่งกลุ่มย่อยเพื่อลงมือปฏิบัติกิจกรรมการเรียนรู้เรื่อง ${topic} โดยครูทำหน้าที่เป็น Facilitator คอยให้คำแนะนำ กระตุ้นการคิด และดูแลความร่วมมือในกลุ่ม (${specificNeeds})`,
        activeActivities: [
          `กิจกรรมกลุ่มย่อย: สำรวจ สืบค้น และจัดระเบียบข้อมูลเรื่อง ${topic}`,
          `กิจกรรมฝึกทักษะ/เกมการเรียนรู้ Interactive เพื่อเสริมความเข้าใจอย่างสนุกสนาน`,
          `การแลกเปลี่ยนเรียนรู้และตัวแทนกลุ่มนำเสนอผลการปฏิบัติหน้าชั้นเรียน`,
        ],
      },
      conclusion: {
        title: "ขั้นที่ 3: ขั้นสรุปองค์ความรู้และสะท้อนคิด (Reflection & Evaluation)",
        time: "15 นาที",
        details: `ครูและนักเรียนร่วมกันอภิปรายและสรุปประเด็นสำคัญเรื่อง ${topic} นักเรียนทำแบบฝึกหัดทบทวนและสะท้อนคิด (AAR) ถึงสิ่งที่ได้เรียนรู้ในคาบนี้`,
        reflectionQuestions: [
          `สิ่งที่นักเรียนประทับใจหรือเข้าใจชัดเจนที่สุดในบทเรียนวันนี้คืออะไร?`,
          `นักเรียนจะสามารถนำความรู้เรื่อง ${topic} ไปปรับใช้ในการดำเนินชีวิตหรือการเรียนต่อยอดได้อย่างไร?`,
        ],
      },
    },
    instructionalMedia: [
      `1. สื่อสไลด์มัลติมีเดีย (Canva / PowerPoint) เรื่อง ${topic}`,
      `2. ใบงานและใบกิจกรรมเสริมทักษะความคิดสร้างสรรค์`,
      `3. สื่อของจริง บัตรภาพ หรือแบบจำลองประกอบการเรียนรู้`,
      `4. แหล่งเรียนรู้ดิจิทัลและคลังสื่อการสอนโรงเรียนวัดบางโฉลงใน`,
    ],
    assessment: {
      methods: [
        "การประเมินความถูกต้องของใบงานและผลงานนักเรียน",
        "การสังเกตพฤติกรรมการมีส่วนร่วมและการทำงานกลุ่ม",
        "การตอบคำถามและการนำเสนอสะท้อนคิดหน้าชั้นเรียน",
      ],
      tools: [
        "แบบประเมินผลงานและใบกิจกรรม (Rubric Score)",
        "แบบสังเกตพฤติกรรมการทำงานกลุ่ม",
        "แบบประเมินคุณลักษณะอันพึงประสงค์ (K-P-A)",
      ],
      criteria: "ผ่านเกณฑ์การประเมินในระดับดี (ร้อยละ 70 ขึ้นไป)",
    },
    worksheetActivity: `ใบงานกิจกรรมท้าทายความคิด: ให้นักเรียนสรุปใจความสำคัญเรื่อง ${topic} ในรูปแบบผังความคิด (Mind Mapping) พร้อมวาดภาพประกอบและอธิบายแนวคิดหลัก 3-5 บรรทัด`,
    postLessonReflection: `บันทึกหลังแผน: นักเรียนส่วนใหญ่ให้ความสนใจและมีส่วนร่วมในกิจกรรมกลุ่มเป็นอย่างดี สามารถสรุปความรู้ได้ตรงตามจุดประสงค์ สำหรับนักเรียนที่ยังต้องการคำแนะนำเพิ่มเติม ครูได้จัดกิจกรรมเพื่อนช่วยเพื่อน (Buddy System) และให้คำปรึกษาเพิ่มเติม`,
    paAlignmentTips: `การจัดการเรียนรู้นี้สอดคล้องกับข้อตกลงในการพัฒนางาน (PA) ด้านการจัดการเรียนรู้เชิงรุก (Active Learning) การพัฒนาทักษะการคิดวิเคราะห์ และการวัดประเมินผลตามสภาพจริงของผู้เรียน`,
  };
}

// Helper to safely extract JSON or structured answer from model responses
function safeExtractJson(text: string): { answer: string; suggestedFollowUps: string[] } {
  if (!text) return { answer: "", suggestedFollowUps: [] };
  try {
    const direct = JSON.parse(text);
    if (direct && typeof direct === "object") {
      return {
        answer: direct.answer || text,
        suggestedFollowUps: Array.isArray(direct.suggestedFollowUps) ? direct.suggestedFollowUps : [],
      };
    }
  } catch {}

  // Try extracting from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      if (parsed && typeof parsed === "object") {
        return {
          answer: parsed.answer || codeBlockMatch[1],
          suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
        };
      }
    } catch {}
  }

  // Try extracting from outermost curly braces
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
      if (parsed && typeof parsed === "object") {
        return {
          answer: parsed.answer || text,
          suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
        };
      }
    } catch {}
  }

  return {
    answer: text,
    suggestedFollowUps: [
      "ขอคำอธิบายเพิ่มเติมในประเด็นนี้",
      "มีตัวอย่างประกอบเพิ่มเติมไหม?",
      "แนวทางการนำไปประยุกต์ใช้",
    ],
  };
}

/**
 * Multi-domain Built-in Knowledge Base for Q&A (Answers questions across education, science, math, language, tech, daily life, and more)
 */
function buildPedagogicQAFallback(question: string): {
  answer: string;
  suggestedFollowUps: string[];
} {
  const q = question.toLowerCase().trim();

  // 1. Math & Calculations
  if (q.includes("คณิต") || q.includes("คำนวณ") || q.includes("สมการ") || q.includes("พื้นที่") || q.includes("สูตร") || q.includes("ร้อยละ") || q.includes("เปอร์เซ็นต์") || q.includes("math") || q.includes("บวก") || q.includes("คูณ")) {
    return {
      answer: `### 📐 สรุปคำตอบและการแก้ปัญหาทางคณิตศาสตร์

**ประเด็นที่ถาม:** ${question}

1. **หลักการและวิธีคิด:**
   - **การวิเคราะห์โจทย์:** กำหนดสิ่งที่โจทย์กำหนดให้ และสิ่งที่โจทย์ต้องการทราบ
   - **การเลือกใช้สูตร/ทฤษฎีบท:** เช่น การหาพื้นที่วงกลม $A = \\pi r^2$, ปริมาตรทรงกระบอก $V = \\pi r^2 h$, ทฤษฎีบทพีทาโกรัส $a^2 + b^2 = c^2$
   - **ขั้นตอนการคำนวณ:** ดำเนินการตามลำดับการคำนวณ (Order of Operations: PEMDAS - วงเล็บ, ยกกำลัง, คูณ/หาร, บวก/ลบ)

2. **ตัวอย่างและการนำไปใช้:**
   - ในการสอนหรือการแก้โจทย์จริง ควรเขียนขั้นตอนแสดงวิธีทำอย่างเป็นระเบียบ เพื่อตรวจสอบความถูกต้องได้ง่าย
   - แนะนำการใช้สื่อภาพหรือแบบจำลอง (Concrete-Pictorial-Abstract: CPA) เพื่อให้เข้าใจที่มาของตัวเลขได้ชัดเจนยิ่งขึ้น

💡 *ข้อแนะนำ:* สามารถถามโจทย์ตัวเลขที่เจาะจงหรือขอวิธีทำทีละขั้นตอนเพิ่มเติมได้ครับ`,
      suggestedFollowUps: [
        "ขอขั้นตอนวิธีทำอย่างละเอียดของโจทย์นี้",
        "เทคนิคการสอนคณิตศาสตร์แบบเห็นภาพ (CPA Model)",
        "สูตรคำนวณพื้นที่และปริมาตรรูปทรงเรขาคณิตพื้นฐาน",
      ],
    };
  }

  // 2. Science, Physics, Space & Environment
  if (q.includes("วิทย์") || q.includes("ฟิสิกส์") || q.includes("เคมี") || q.includes("ชีวะ") || q.includes("ดวงอาทิตย์") || q.includes("โลก") || q.includes("อุณหภูมิ") || q.includes("ดวงดาว") || q.includes("แรง") || q.includes("พลังงาน") || q.includes("พืช") || q.includes("สัตว์") || q.includes("เซลล์")) {
    return {
      answer: `### 🔬 สรุปองค์ความรู้ทางวิทยาศาสตร์และธรรมชาติ

**ประเด็นที่ถาม:** ${question}

1. **หลักการทางวิทยาศาสตร์:**
   - ปรากฏการณ์ดังกล่าวเกิดขึ้นจากกฎธรรมชาติและความสัมพันธ์ทางกายภาพ/เคมี/ชีววิทยา
   - ยกตัวอย่างเช่น ดวงอาทิตย์มีอุณหภูมิที่พื้นผิวประมาณ 5,500 °C และใจกลางสูงถึง 15 ล้าน °C จากปฏิกิริยานิวเคลียร์ฟิวชัน
   - การสังเกต การตั้งสมมติฐาน และการทดลอง คือหัวใจสำคัญในการค้นหาความจริง

2. **การเชื่อมโยงกับชีวิตประจำวัน:**
   - พลังงานและสสารรอบตัวเรามีการเปลี่ยนแปลงรูปอยู่เสมอ เช่น พลังงานแสง พลังงานความร้อน
   - การเข้าใจหลักการวิทยาศาสตร์ช่วยให้เราสามารถคิดอย่างมีเหตุผลและแก้ไขปัญหาได้อย่างเป็นระบบ

💡 *ข้อแนะนำ:* สามารถนำประเด็นนี้ไปจัดกิจกรรมสืบเสาะหาความรู้ 5E หรือการทดลองง่ายๆ ในห้องเรียนได้ครับ`,
      suggestedFollowUps: [
        "ขอตัวอย่างการทดลองวิทยาศาสตร์ง่ายๆ ที่เกี่ยวกับหัวข้อนี้",
        "อธิบายปรากฏการณ์นี้ในระดับที่เด็กประถมเข้าใจง่าย",
        "การจัดกิจกรรมสะเต็มศึกษา (STEM) เชื่อมโยงกับวิทยาศาสตร์",
      ],
    };
  }

  // 3. Thai Language, Grammar & Poetry
  if (q.includes("ภาษาไทย") || q.includes("กลอน") || q.includes("แต่งกลอน") || q.includes("คำราชาศัพท์") || q.includes("สำนวน") || q.includes("สุภาษิต") || q.includes("ไวยากรณ์") || q.includes("คำประพันธ์") || q.includes("วรรณคดี")) {
    return {
      answer: `### 📚 องค์ความรู้ภาษาไทยและการประพันธ์

**ประเด็นที่ถาม:** ${question}

1. **หลักภาษาและการประพันธ์:**
   - **ฉันทลักษณ์กลอนแปด (กลอนสุภาพ):** วรรคละ 7-9 คำ มีสัมผัสนอก-สัมผัสใน และการบังคับเสียงวรรณยุกต์ท้ายวรรค (วรรคสดับ, รับ, รอง, ส่ง)
   - **ตัวอย่างบทร้อยกรองไพเราะ:**
     > *ความรู้คู่คุณธรรมนำชีวิต*
     > *เป็นเข็มทิศส่องทางสว่างไสว*
     > *เพียรศึกษาพัฒนาทั้งกายใจ*
     > *เพื่อก้าวไกลสู่อนาคตที่งดงาม*

2. **หลักการใช้ภาษาไทยที่ถูกต้อง:**
   - การเลือกใช้คำให้เหมาะสมกับกาลเทศะ ระดับภาษา (ทางการ, กึ่งทางการ, ปาก)
   - การใช้คำเชื่อมและโครงสร้างประโยคเพื่อการสื่อสารที่กระชับและตรงประเด็น

💡 *ข้อแนะนำ:* หากต้องการให้แต่งกลอนในโอกาสใดเป็นพิเศษ (เช่น วันครู, วันแม่, วันสุนทรภู่) ระบุหัวข้อได้เลยครับ`,
      suggestedFollowUps: [
        "ช่วยแต่งกลอนแปด 2 บทเกี่ยวกับคุณครูและความรู้",
        "หลักการจำคำราชาศัพท์หมวดร่างกายและเครือญาติ",
        "เทคนิคการสอนอ่านออกเขียนได้สำหรับเด็กประถม",
      ],
    };
  }

  // 4. English & Foreign Languages & Translation
  if (q.includes("ภาษาอังกฤษ") || q.includes("แปล") || q.includes("english") || q.includes("translate") || q.includes("grammar") || q.includes("vocabulary") || q.includes("สนทนา")) {
    return {
      answer: `### 🌐 การใช้ภาษาอังกฤษและการแปลภาษา (English & Communication)

**ประเด็นที่ถาม:** ${question}

1. **คำแปลและประโยคตัวอย่าง (Translations & Key Phrases):**
   - **คำศัพท์สำคัญ:** สามารถนำไปใช้ในการสื่อสารในห้องเรียนและชีวิตประจำวัน
   - **โครงสร้างประโยค:** เน้นการใช้ Tense ที่ถูกต้องและสอดคล้องกับบริบท (Subject-Verb Agreement)
   - **การออกเสียง (Pronunciation):** เน้นการลงเสียงหนักเบา (Stress) และการเชื่อมเสียง (Linking sounds)

2. **เทคนิคการฝึกฝนภาษาอังกฤษอย่างเป็นธรรมชาติ:**
   - ฝึกฟังและพูดตามจากบทสนทนาสั้นๆ ทุกวัน
   - ใช้เทคนิค TPR (Total Physical Response) ในการสอนเด็กเพื่อจดจำคำศัพท์ผ่านท่าทาง

💡 *ข้อแนะนำ:* สามารถพิมพ์ประโยคภาษาไทยหรืออังกฤษมาให้แปลหรือช่วยเกลาสำนวนได้ทันทีครับ`,
      suggestedFollowUps: [
        "แปลประโยคนี้เป็นภาษาอังกฤษแบบทางการและไม่เป็นทางการ",
        "ประโยคภาษาอังกฤษที่ครูใช้พูดในห้องเรียนบ่อยๆ (Classroom English)",
        "เทคนิคการจำคำศัพท์ภาษาอังกฤษด้วย Flashcards และเกม",
      ],
    };
  }

  // 5. Technology, Computers, Coding & AI
  if (q.includes("คอม") || q.includes("เขียนโค้ด") || q.includes("code") || q.includes("programming") || q.includes("python") || q.includes("javascript") || q.includes("ai") || q.includes("canva") || q.includes("excel") || q.includes("เทคโนโลยี") || q.includes("วิทยาการคำนวณ")) {
    return {
      answer: `### 💻 เทคโนโลยีสารสนเทศ วิทยาการคำนวณ & AI

**ประเด็นที่ถาม:** ${question}

1. **หลักการและเครื่องมือดิจิทัล:**
   - **Computational Thinking (แนวคิดเชิงคำนวณ):** การแบ่งย่อยปัญหา (Decomposition), การหารูปแบบ (Pattern Recognition), การคิดเชิงนามธรรม (Abstraction), และการออกแบบอัลกอริทึม (Algorithms)
   - **เครื่องมือดิจิทัลสำหรับการศึกษา:** Canva for Education, Google Workspace for Education, Scratch, Micro:bit
   - **การประยุกต์ใช้ AI ในการทำงาน:** ช่วยร่างแผนการสอน ออกแบบใบงาน สรุปเอกสาร และสร้างสื่อการสอนมัลติมีเดีย

2. **แนวทางการจัดการเรียนรู้:**
   - สอน Unplugged Coding ให้เด็กเข้าใจตรรกะก่อนลงมือเขียนโค้ดบนคอมพิวเตอร์
   - ปลูกฝังเรื่อง Digital Literacy และความปลอดภัยบนโลกไซเบอร์

💡 *ข้อแนะนำ:* หากต้องการโค้ดตัวอย่าง หรือสูตร Excel สามารถระบุรายละเอียดได้เลยครับ`,
      suggestedFollowUps: [
        "ขอไอเดียกิจกรรม Unplugged Coding สำหรับเด็กประถม",
        "สูตร Excel ยอดนิยมสำหรับครูคำนวณเกรดและสถิติ",
        "เทคนิคการใช้ AI ช่วยออกแบบสื่อการสอนอย่างมีประสิทธิภาพ",
      ],
    };
  }

  // 6. School Info & Wat Bang Chalong Nai
  if (q.includes("โรงเรียน") || q.includes("บางโฉลง") || q.includes("สมุทรปราการ") || q.includes("สพป") || q.includes("ผอ") || q.includes("ประวัติ")) {
    return {
      answer: `### 🏫 ข้อมูลโรงเรียนวัดบางโฉลงใน (บางพลีวิทยาคาร)

1. **ข้อมูลทั่วไปของสถานศึกษา:**
   - **ชื่อสถานศึกษา:** โรงเรียนวัดบางโฉลงใน (บางพลีวิทยาคาร)
   - **สังกัด:** สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสมุทรปราการ เขต 2 (สพป.สมุทรปราการ เขต 2)
   - **ที่ตั้ง:** ตำบลบางโฉลง อำเภอบางพลี จังหวัดสมุทรปราการ
   - **การจัดการศึกษา:** ระดับปฐมวัย (อนุบาล 1-3) ถึงระดับประถมศึกษา (ป.1 - ป.6)

2. **วิสัยทัศน์และจุดเน้น:**
   - มุ่งพัฒนาผู้เรียนให้มีความรู้คู่คุณธรรม มีทักษะในศตวรรษที่ 21 
   - น้อมนำหลักปรัชญาของเศรษฐกิจพอเพียง และส่งเสริมการใช้เทคโนโลยีดิจิทัลในการเรียนรู้
   - พัฒนาครูสู่มืออาชีพตามมาตรฐาน ว PA

💡 *ข้อแนะนำ:* สามารถค้นหาแผนการสอน คลังสื่อ และแบบฟอร์มเอกสารของโรงเรียนได้ในระบบนี้ครับ`,
      suggestedFollowUps: [
        "ดาวน์โหลดแบบฟอร์มเอกสารทางการศึกษาของโรงเรียน",
        "คลังสื่อการสอน 8 กลุ่มสาระการเรียนรู้",
        "ข้อตกลงในการพัฒนางาน ว PA ของครูโรงเรียนวัดบางโฉลงใน",
      ],
    };
  }

  // 7. Performance Agreement (PA)
  if (q.includes("pa") || q.includes("วิทยฐานะ") || q.includes("ประเด็นท้าทาย") || q.includes("ว9") || q.includes("ว pa")) {
    return {
      answer: `### 📋 คำแนะนำเกี่ยวกับข้อตกลงในการพัฒนางาน (ว PA / ก.ค.ศ. ว9/2564)

1. **โครงสร้างข้อตกลง PA (PA1/ส):**
   - **ส่วนที่ 1:** ข้อตกลงในการพัฒนางานตามมาตรฐานตำแหน่ง (3 ด้าน 15 ตัวชี้วัด: ด้านการจัดการเรียนรู้ 8 ตัวชี้วัด, ด้านการส่งเสริมและสนับสนุน 4 ตัวชี้วัด, ด้านการพัฒนาตนเองและวิชาชีพ 3 ตัวชี้วัด)
   - **ส่วนที่ 2:** ข้อตกลงในการพัฒนางานที่เป็น **ประเด็นท้าทาย (Challenge)** ในการพัฒนาผลลัพธ์การเรียนรู้ของผู้เรียน

2. **เกณฑ์วิทยฐานะเป้าหมาย:**
   - **ครูชำนาญการ:** เน้น "แก้ไขปัญหา" (Solve Problem)
   - **ครูชำนาญการพิเศษ:** เน้น "ริเริ่ม พัฒนา" (Initiate & Develop)
   - **ครูเชี่ยวชาญ:** เน้น "คิดค้น ปรับเปลี่ยน" (Innovate & Transform)

3. **คลิปการสอน (Video Recording 60 นาที):**
   - ต้องเป็นการสอนจริง ไม่ตัดต่อ มีมุมกล้องเห็นครูและนักเรียนชัดเจน
   - เน้นผู้เรียนมีส่วนร่วม (Active Learning) สะท้อน 8 ตัวชี้วัดการจัดการเรียนรู้

💡 *ข้อแนะนำ:* เขียนประเด็นท้าทายให้ระบุปัญหาชัดเจน ระบุนวัตกรรมหรือวิธีแก้ปัญหา และระบุตัวชี้วัดความสำเร็จเชิงปริมาณ (เช่น ร้อยละ 75) และเชิงคุณภาพ`,
      suggestedFollowUps: [
        "เกณฑ์การประเมิน 8 ตัวชี้วัดคลิปการสอน ว PA มีอะไรบ้าง?",
        "ตัวอย่างการเขียนประเด็นท้าทาย ครูชำนาญการพิเศษ",
        "การจัดทำคลิปแรงบันดาลใจและคลิปการสอนให้ผ่านเกณฑ์",
      ],
    };
  }

  // 8. Active Learning & Pedagogy
  if (q.includes("active learning") || q.includes("5e") || q.includes("gpas") || q.includes("pbl") || q.includes("กิจกรรมการสอน") || q.includes("เทคนิคการสอน")) {
    return {
      answer: `### 🎯 เทคนิคการจัดการเรียนรู้เชิงรุก (Active Learning)

1. **โมเดลการสอนยอดนิยมที่แนะนำ:**
   - **5E Inquiry Model:** กระตุ้นความสนใจ (Engagement) ➔ สำรวจและค้นหา (Exploration) ➔ อธิบาย (Explanation) ➔ ขยายความรู้ (Elaboration) ➔ ประเมินผล (Evaluation)
   - **GPAS 5 Steps:** Gathering ➔ Processing ➔ Applying 1 (Constructing) ➔ Applying 2 (Sharing) ➔ Self-Regulating
   - **Project-Based Learning (PBL):** กำหนดโจทย์ปัญหาในชุมชน/ชีวิตจริง ➔ วางแผน ➔ ลงมือปฏิบัติ ➔ สร้างชิ้นงาน/นวัตกรรม ➔ นำเสนอและสะท้อนคิด

2. **บทบาทของคุณครูในห้องเรียน Active Learning:**
   - เปลี่ยนจากผู้บรรยาย (Lecturer) มาเป็น **ผู้อำนวยความสะดวก (Facilitator/Coach)**
   - ตั้งคำถามกระตุ้นการคิดขั้นสูง (Open-ended Questions / Higher-order Thinking)
   - จัดกิจกรรมแบบกลุ่มร่วมมือ (Collaborative Learning)

3. **เครื่องมือดิจิทัลเสริมแรง:** Quizizz, Wordwall, Padlet, Canva for Education เพื่อสร้างความตื่นเต้นและเห็นผลงานแบบ Real-time`,
      suggestedFollowUps: [
        "ขอตัวอย่างกิจกรรมขั้นนำ 5E ที่ดึงดูดใจนักเรียน",
        "วิธีจัดกิจกรรมกลุ่มแบบเพื่อนช่วยเพื่อน (Buddy System)",
        "เทคนิคการตั้งคำถามกระตุ้นทักษะการคิดวิเคราะห์ (Higher-Order Thinking)",
      ],
    };
  }

  // 9. Classroom Action Research (CAR) & PLC
  if (q.includes("วิจัย") || q.includes("car") || q.includes("วิจัยในชั้นเรียน") || q.includes("plc")) {
    return {
      answer: `### 🔬 แนวทางการทำวิจัยในชั้นเรียนอย่างง่าย (Classroom Action Research: CAR)

1. **ขั้นตอนกระบวนการ 5 ขั้น (PAOR Model):**
   - **Plan (วางแผน):** ระบุปัญหานักเรียนในชั้นเรียน (เช่น อ่านไม่ออก, คิดเลขช้า, ขาดสมาธิ) และเลือกนวัตกรรมมาแก้ปัญหา
   - **Act (ปฏิบัติ):** นำนวัตกรรม/แบบฝึก/กิจกรรม Active Learning ไปใช้สอนในห้องเรียน
   - **Observe (สังเกตและเก็บข้อมูล):** บันทึกผลการทดสอบ พฤติกรรม และแบบสังเกต
   - **Reflect (สะท้อนคิดและปรับปรุง):** วิเคราะห์ผลสัมฤทธิ์ สรุปผลว่านักเรียนมีพัฒนาการขึ้นหรือไม่

2. **โครงร่างรายงานวิจัยในชั้นเรียนแบบกระชับ (3-5 หน้า):**
   - ความเป็นมาและวัตถุประสงค์
   - นวัตกรรม/เครื่องมือที่ใช้
   - กลุ่มเป้าหมายและระยะเวลา
   - ผลการวิจัย (ก่อนเรียน-หลังเรียน)
   - ข้อเสนอแนะและการนำไปใช้ต่อ`,
      suggestedFollowUps: [
        "ตัวอย่างชื่อเรื่องวิจัยในชั้นเรียนเพื่อแก้ปัญหาการอ่าน",
        "เครื่องมือวิจัยสำหรับวัดคุณลักษณะอันพึงประสงค์",
        "การนำผลวิจัยในชั้นเรียนไปต่อยอดเป็นประเด็นท้าทาย PA",
      ],
    };
  }

  // 10. Student Psychology & Behavioral Care
  if (q.includes("เด็ก") || q.includes("พฤติกรรม") || q.includes("สมาธิสั้น") || q.includes("ld") || q.includes("พิเศษ") || q.includes("ควบคุมชั้นเรียน") || q.includes("จิตวิทยา")) {
    return {
      answer: `### 💡 เทคนิคการจัดการชั้นเรียนเชิงบวกและการดูแลนักเรียน

1. **การควบคุมชั้นเรียนเชิงบวก (Positive Classroom Management):**
   - **สร้างกติการ่วมกันตั้งแต่วันแรก:** กำหนดข้อตกลงที่เรียบง่ายและเป็นไปได้
   - **ชื่นชมแบบเจาะจง (Specific Praise):** ชมที่ความพยายามและกระบวนการทำงาน ไม่ใช่ผลลัพธ์เพียงอย่างเดียว
   - **ใช้สัญญาณเสียงหรือภาษากาย (Non-verbal cues):** เช่น ปรบมือเป็นจังหวะ หรือใช้นับถอยหลังแทนการตะโกน

2. **การช่วยเหลือนักเรียนสมาธิสั้น (ADHD) และเรียนรู้ช้า (LD):**
   - ซอยย่อยคำสั่งเป็นขั้นตอนสั้นๆ ทีละ 1 ขั้น
   - ให้นั่งใกล้ครูหรือนั่งคู่กับเพื่อนจิตอาสา (Buddy)
   - มอบหมายบทบาทหน้าที่ในการช่วยครู (เช่น แจกใบงาน, ลบกระดาน) เพื่อให้ได้เคลื่อนไหวอย่างเหมาะสม
   - ให้เวลาทำกิจกรรมมากกว่าปกติ และใช้ภาพ/กราฟิกช่วยจดจำ`,
      suggestedFollowUps: [
        "วิธีจัดทำแผนการจัดการศึกษาเฉพาะบุคคล (IEP) เบื้องต้น",
        "กิจกรรม Warm-up 3 นาที ละลายพฤติกรรมก่อนเริ่มเรียน",
        "เทคนิคการรับมือกับนักเรียนที่ไม่ส่งการบ้านหรือขาดสมาธิ",
      ],
    };
  }

  // 11. General Intelligent Synthesizer for Any Topic
  return {
    answer: `### 💡 คำตอบและคำแนะนำจาก AI ผู้ช่วยอัจฉริยะ

เกี่ยวกับเรื่อง: **"${question}"**

1. **สรุปสาระสำคัญ:**
   - เรื่องดังกล่าวเป็นหัวข้อที่มีความสำคัญและสามารถมองได้หลากหลายมิติ
   - การทำความเข้าใจอย่างเป็นระบบจะช่วยให้สามารถนำไปปฏิบัติ นำไปสอน หรือนำไปประยุกต์ใช้ในชีวิตประจำวันได้อย่างถูกต้อง

2. **แนวทางและข้อเสนอแนะในการดำเนินการ:**
   - **ศึกษาข้อมูลและข้อเท็จจริง:** ทำความเข้าใจหลักการพื้นฐานหรือสาเหตุของประเด็นดังกล่าว
   - **การวางแผนและลงมือปฏิบัติ:** กำหนดเป้าหมายที่ชัดเจน แบ่งขั้นตอนการทำงานเป็นส่วนย่อยๆ
   - **การประเมินและปรับปรุง:** ติดตามผลลัพธ์เพื่อนำมาปรับใช้ให้เหมาะสมกับบริบท

💡 *คำแนะนำเพิ่มเติม:* คุณครูและผู้ใช้งานสามารถสอบถามข้อมูลเชิงลึก ตัวอย่างเพิ่มเติม หรือหัวข้ออื่นๆ ได้ทุกเรื่องตลอด 24 ชั่วโมงครับ`,
    suggestedFollowUps: [
      "ขอตัวอย่างและรายละเอียดเพิ่มเติมในเรื่องนี้",
      "แนวทางการนำไปประยุกต์ใช้ในการเรียนการสอนหรือชีวิตจริง",
      "สรุปเป็นขั้นตอน 1-2-3 ให้เข้าใจง่ายยิ่งขึ้น",
    ],
  };
}
function buildDynamicPAIdea(params: {
  subject?: string;
  gradeLevel?: string;
  targetStanding?: string;
  issueDescription?: string;
}) {
  const subject = params.subject || "การจัดการเรียนรู้";
  const gradeLevel = params.gradeLevel || "ประถมศึกษา";
  const targetStanding = params.targetStanding || "ครูชำนาญการ";
  const issueDescription = params.issueDescription || "พัฒนาผลสัมฤทธิ์และทักษะการคิดของผู้เรียน";

  return {
    challengeTitle: `การพัฒนาทักษะการเรียนรู้เชิงรุก (Active Learning) ร่วมกับนวัตกรรมสื่อดิจิทัลเพื่อแก้ไขปัญหา${issueDescription} ในกลุ่มสาระการเรียนรู้${subject} ระดับชั้น ${gradeLevel}`,
    rationale: `เพื่อยกระดับผลสัมฤทธิ์ทางการเรียน กระตุ้นการมีส่วนร่วม และส่งเสริมสมรรถนะสำคัญของผู้เรียนตามเกณฑ์ ก.ค.ศ. ว9/2564 สำหรับการขอมี/เลื่อนวิทยฐานะ ${targetStanding}`,
    expectedOutcome: `ผู้เรียนร้อยละ 75 ขึ้นไปมีผลสัมฤทธิ์ทางการเรียนและทักษะกระบวนการคิดอยู่ในระดับดีขึ้นไป และมีเจตคติที่ดีต่อการเรียนรู้`,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3300;

  app.use(express.json({ limit: "10mb" }));

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Lesson Plan Generator Endpoint
  app.post("/api/ai/lesson-plan", async (req, res) => {
    const {
      subject = "วิทยาศาสตร์และเทคโนโลยี",
      gradeLevel = "ประถมศึกษาปีที่ 4 (ป.4)",
      topic = "การจำแนกสิ่งมีชีวิต",
      duration = "1 ชั่วโมง (60 นาที)",
      teachingMethod = "Active Learning (5E Instructional Model)",
      specificNeeds = "เน้นการทดลอง สื่อประกอบภาพ และเกมการเรียนรู้สำหรับเด็กประถม",
    } = req.body || {};

    const ai = getGeminiClient();

    if (!ai) {
      const fallbackPlan = buildDynamicPedagogicLessonPlan({
        subject,
        gradeLevel,
        topic,
        duration,
        teachingMethod,
        specificNeeds,
      });

      return res.json({
        success: true,
        isAIGenerated: false,
        model: "pedagogic-curriculum-engine",
        plan: fallbackPlan,
      });
    }

    try {
      const prompt = `คุณคือผู้เชี่ยวชาญด้านการจัดทำแผนการจัดการเรียนรู้ของไทย (Master Teacher & Educational Pedagogy Specialist)
กรุณาจัดทำ "แผนการจัดการเรียนรู้แบบสมบูรณ์และได้มาตรฐานวิชาชีพครูไทย (สอดคล้องกับเกณฑ์ ว PA และ Active Learning)" ตามข้อมูลต่อไปนี้:

- กลุ่มสาระการเรียนรู้: ${subject}
- ระดับชั้น: ${gradeLevel}
- หัวข้อ / หน่วยการเรียนรู้: ${topic}
- ระยะเวลา: ${duration}
- รูปแบบการสอน: ${teachingMethod}
- จุดเน้น / บริบทเพิ่มเติม: ${specificNeeds}
- บริบทโรงเรียน: โรงเรียนระดับประถมศึกษา (โรงเรียนวัดบางโฉลงใน สพป.สมุทรปราการ เขต 2)

โปรดตอบในรูปแบบ JSON ตามโครงสร้างที่กำหนด เพื่อให้ครูสามารถนำไปพิมพ์ ปรับใช้ หรือแนบในแฟ้มผลงาน PA ได้ทันที`;

      // Set a race promise with timeout to prevent hanging or undici HeadersTimeoutError
      const generatePromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "คุณคือผู้เชี่ยวชาญการออกแบบการจัดการเรียนรู้ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 (ปรับปรุง 2560) และหลักสูตรการศึกษาปฐมวัย ให้ข้อมูลเป็นภาษาไทยที่สละสลวย ถูกต้องตามแบบแผนครูมืออาชีพ",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lessonTitle: { type: Type.STRING },
              subject: { type: Type.STRING },
              gradeLevel: { type: Type.STRING },
              timeAllocation: { type: Type.STRING },
              coreConcept: { type: Type.STRING },
              standardAndIndicator: { type: Type.STRING },
              objectives: {
                type: Type.OBJECT,
                properties: {
                  knowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
                  process: { type: Type.ARRAY, items: { type: Type.STRING } },
                  attitude: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["knowledge", "process", "attitude"],
              },
              learningSteps: {
                type: Type.OBJECT,
                properties: {
                  intro: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      details: { type: Type.STRING },
                      questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "time", "details", "questions"],
                  },
                  teaching: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      details: { type: Type.STRING },
                      activeActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "time", "details", "activeActivities"],
                  },
                  conclusion: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      time: { type: Type.STRING },
                      details: { type: Type.STRING },
                      reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "time", "details", "reflectionQuestions"],
                  },
                },
                required: ["intro", "teaching", "conclusion"],
              },
              instructionalMedia: { type: Type.ARRAY, items: { type: Type.STRING } },
              assessment: {
                type: Type.OBJECT,
                properties: {
                  methods: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                  criteria: { type: Type.STRING },
                },
                required: ["methods", "tools", "criteria"],
              },
              worksheetActivity: { type: Type.STRING },
              postLessonReflection: { type: Type.STRING },
              paAlignmentTips: { type: Type.STRING },
            },
            required: [
              "lessonTitle",
              "subject",
              "gradeLevel",
              "timeAllocation",
              "coreConcept",
              "standardAndIndicator",
              "objectives",
              "learningSteps",
              "instructionalMedia",
              "assessment",
              "worksheetActivity",
              "postLessonReflection",
              "paAlignmentTips",
            ],
          },
        },
      });

      const generatePlan = async () => {
        return ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction: `คุณคือผู้เชี่ยวชาญด้านหลักสูตรและการจัดการเรียนรู้ โรงเรียนวัดบางโฉลงใน ออกแบบแผนการจัดการเรียนรู้ Active Learning ตามหลักสูตรแกนกลางฯ 2551 (ฉบับปรับปรุง 2560)`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                lessonTitle: { type: Type.STRING },
                subject: { type: Type.STRING },
                gradeLevel: { type: Type.STRING },
                timeAllocation: { type: Type.STRING },
                coreConcept: { type: Type.STRING },
                standardAndIndicator: { type: Type.STRING },
                objectives: {
                  type: Type.OBJECT,
                  properties: {
                    knowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
                    process: { type: Type.ARRAY, items: { type: Type.STRING } },
                    attitude: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["knowledge", "process", "attitude"],
                },
                learningSteps: {
                  type: Type.OBJECT,
                  properties: {
                    intro: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        time: { type: Type.STRING },
                        details: { type: Type.STRING },
                        questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["title", "time", "details", "questions"],
                    },
                    teaching: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        time: { type: Type.STRING },
                        details: { type: Type.STRING },
                        activeActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["title", "time", "details", "activeActivities"],
                    },
                    conclusion: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        time: { type: Type.STRING },
                        details: { type: Type.STRING },
                        reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["title", "time", "details", "reflectionQuestions"],
                    },
                  },
                  required: ["intro", "teaching", "conclusion"],
                },
                instructionalMedia: { type: Type.ARRAY, items: { type: Type.STRING } },
                assessment: {
                  type: Type.OBJECT,
                  properties: {
                    methods: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                    criteria: { type: Type.STRING },
                  },
                  required: ["methods", "tools", "criteria"],
                },
                worksheetActivity: { type: Type.STRING },
                postLessonReflection: { type: Type.STRING },
                paAlignmentTips: { type: Type.STRING },
              },
              required: [
                "lessonTitle",
                "subject",
                "gradeLevel",
                "timeAllocation",
                "coreConcept",
                "standardAndIndicator",
                "objectives",
                "learningSteps",
                "instructionalMedia",
                "assessment",
                "worksheetActivity",
                "postLessonReflection",
                "paAlignmentTips",
              ],
            },
          },
        });
      };

      const response = await withTimeout(generatePlan(), 15000, "Lesson Plan generation timeout");
      const responseText = response.text || "{}";
      const plan = JSON.parse(responseText);

      return res.json({
        success: true,
        isAIGenerated: true,
        model: "gemini-3.7-flash",
        plan,
      });
    } catch (error: any) {
      console.log("Lesson Plan fallback activated:", error?.message || "Fallback");
      
      const plan = buildDynamicPedagogicLessonPlan({
        subject,
        gradeLevel,
        topic,
        duration,
        teachingMethod,
        specificNeeds,
      });

      return res.json({
        success: true,
        isAIGenerated: false,
        model: "pedagogic-curriculum-engine",
        fallbackReason: error?.message || "Fallback engine",
        plan,
      });
    }
  });

  // AI PA Challenge Idea Generator Endpoint
  app.post("/api/ai/pa-idea", async (req, res) => {
    const { subject, gradeLevel, targetStanding, issueDescription } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackIdea = buildDynamicPAIdea({
        subject,
        gradeLevel,
        targetStanding,
        issueDescription,
      });
      return res.json({ success: true, isAIGenerated: false, ...fallbackIdea });
    }

    try {
      const prompt = `กรุณาคิด "ชื่อประเด็นท้าทาย (PA Challenge) และเหตุผลความเป็นมา" สำหรับการจัดทำข้อตกลงในการพัฒนางาน (PA) ตามเกณฑ์ ก.ค.ศ. ว9/2564
- วิชา: ${subject}
- สายชั้น: ${gradeLevel}
- วิทยฐานะเป้าหมาย: ${targetStanding}
- สภาพปัญหาหรือสิ่งที่ต้องการพัฒนา: ${issueDescription || "พัฒนาทักษะการคิดและการเรียนรู้ของนักเรียน"}

ให้ตอบเป็น JSON ที่มี challengeTitle (ชื่อประเด็นท้าทายที่กระชับ ตรงหลักวิชาการ), rationale (ความเป็นมาและแนวทางแก้ปัญหา 2-3 บรรทัด) และ expectedOutcome`;

      const generateIdea = async () => {
        return ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                challengeTitle: { type: Type.STRING },
                rationale: { type: Type.STRING },
                expectedOutcome: { type: Type.STRING },
              },
              required: ["challengeTitle", "rationale", "expectedOutcome"],
            },
          },
        });
      };

      const response = await withTimeout(generateIdea(), 12000, "PA Idea timeout");
      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, isAIGenerated: true, ...parsed });
    } catch (error: any) {
      console.log("PA Idea fallback activated:", error?.message || "Fallback");
      const fallbackIdea = buildDynamicPAIdea({
        subject,
        gradeLevel,
        targetStanding,
        issueDescription,
      });
      return res.json({ success: true, isAIGenerated: false, ...fallbackIdea });
    }
  });

  // AI Teacher & General Q&A Endpoint (Answers all topics)
  app.post("/api/ai/teacher-qa", async (req, res) => {
    const { question = "", context = "", history = [] } = req.body || {};
    
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุคำถามที่ต้องการถามผู้ช่วย AI",
      });
    }

    const ai = getGeminiClient();

    if (!ai) {
      const fallback = buildPedagogicQAFallback(question);
      return res.json({
        success: true,
        isAIGenerated: false,
        model: "built-in-intelligent-knowledge-base",
        answer: fallback.answer,
        suggestedFollowUps: fallback.suggestedFollowUps,
      });
    }

    try {
      const systemInstruction = `คุณคือ "AI ผู้ช่วยอัจฉริยะ โรงเรียนวัดบางโฉลงใน" (Wat Bang Chalong Nai School AI Assistant & Teacher Mentor)
คุณมีความรู้รอบตัวที่กว้างขวาง ลึกซึ้ง และรอบด้าน สามารถตอบคำถามและช่วยเหลือได้ทุกเรื่อง ทุกสาขาวิชา และทุกสถานการณ์:

1. 📚 งานครูและการศึกษา: การจัดทำ ว PA (เกณฑ์ ก.ค.ศ. ว9/2564, 8 ตัวชี้วัด, ประเด็นท้าทาย, คลิปการสอน 60 นาที), หลักสูตรแกนกลางฯ 2551 (ปรับปรุง 2560), การออกแบบแผนการสอน Active Learning (5E, GPAS 5 Steps, PBL, STEM, BBL, Gamification), การวัดและประเมินผล (Rubrics, K-P-A), วิจัยในชั้นเรียน (CAR), PLC, การดูแลนักเรียนพิเศษ/LD/ADHD
2. 🔬 วิทยาศาสตร์ คณิตศาสตร์ & ธรรมชาติ: อธิบายกฎฟิสิกส์ เคมี ชีววิทยา ดาราศาสตร์ จักรวาล ปรากฏการณ์ธรรมชาติ การแก้โจทย์คณิตศาสตร์ การคิดคำนวณ สูตรเรขาคณิต สถิติ
3. 📖 ภาษาไทย ภาษาต่างประเทศ & วรรณกรรม: แปลภาษาอังกฤษ-ไทยและภาษาอื่นๆ, หลักไวยากรณ์, การเขียนบทความ, การแต่งคำประพันธ์ (กลอนแปด, กาพย์ยานี 11, โคลงสี่สุภาพ), คำราชาศัพท์, สำนวนไทย
4. 💻 คอมพิวเตอร์ เทคโนโลยี & วิทยาการคำนวณ: การเขียนโปรแกรม (Python, JavaScript, Scratch, HTML/CSS), การใช้งานซอฟต์แวร์และ AI (Canva, Excel, Word, Google Workspace), Unplugged Coding, ความปลอดภัยไซเบอร์
5. 🏫 ข้อมูลโรงเรียน & ท้องถิ่น: โรงเรียนวัดบางโฉลงใน (บางพลีวิทยาคาร), สพป.สมุทรปราการ เขต 2, ประเพณีและสถานที่สำคัญในอำเภอบางพลีและสมุทรปราการ
6. 💡 งานสารบรรณ ร่างเอกสาร & คำแนะนำชีวิต: ร่างหนังสือราชการ, ร่างคำกล่าวเปิดงาน, บทสุนทรพจน์, จิตวิทยาการสื่อสาร, การดูแลสุขภาพ, และคำถามในชีวิตประจำวันทุกเรื่อง

แนวทางการตอบ:
- สามารถตอบได้ทุกคำถามอย่างชาญฉลาด ตรงไปตรงมา มีสาระ ละเอียด และเข้าใจง่าย
- ใช้ภาษาไทยที่สุภาพ เป็นมิตร และสร้างสรรค์
- จัดรูปแบบข้อความด้วย Markdown อย่างสวยงาม (ใช้หัวข้อ #, ##, ###, bullet points, ตัวหนา ** เพื่อเน้นคำสำคัญ)
- ให้ตอบเป็น JSON โครงสร้าง:
  {
    "answer": "ข้อความคำตอบแบบ Markdown ที่ละเอียด มีโครงสร้างชัดเจน และยกตัวอย่างประกอบ",
    "suggestedFollowUps": ["คำถามต่อเนื่องที่น่าสนใจ 1", "คำถามต่อเนื่องที่น่าสนใจ 2", "คำถามต่อเนื่องที่น่าสนใจ 3"]
  }`;

      const historyFormatted = Array.isArray(history)
        ? history
            .slice(-8)
            .map((h: any) => `${h.role === "user" ? "ผู้ถาม" : "AI ผู้ช่วย"}: ${h.content}`)
            .join("\n")
        : "";

      const prompt = `${historyFormatted ? `ประวัติการสนทนาก่อนหน้า:\n${historyFormatted}\n\n` : ""}${context ? `บริบทเพิ่มเติม: ${context}\n\n` : ""}คำถาม: "${question}"

กรุณาตอบคำถามนี้อย่างละเอียด ถูกต้อง และชัดเจนที่สุดในรูปแบบ JSON ตาม Schema ที่กำหนด`;

      // Helper to generate with primary or fallback model
      const executeGenerate = async (modelName: string) => {
        return ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer: { type: Type.STRING },
                suggestedFollowUps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["answer", "suggestedFollowUps"],
            },
          },
        });
      };

      let response: any;
      let usedModel = "gemini-3.7-flash";

      try {
        response = await withTimeout(executeGenerate("gemini-3.7-flash"), 15000, "gemini-3.7-flash timeout");
      } catch (err: any) {
        usedModel = "gemini-flash-latest";
        response = await withTimeout(executeGenerate("gemini-flash-latest"), 15000, "gemini-flash-latest timeout");
      }

      const responseText = response?.text || "{}";
      const parsed = safeExtractJson(responseText);

      return res.json({
        success: true,
        isAIGenerated: true,
        model: usedModel,
        answer: parsed.answer || responseText,
        suggestedFollowUps: parsed.suggestedFollowUps && parsed.suggestedFollowUps.length > 0
          ? parsed.suggestedFollowUps
          : ["ขอคำอธิบายเพิ่มเติมในหัวข้อนี้", "มีตัวอย่างการประยุกต์ใช้เพิ่มเติมไหม?", "ขอสรุปประเด็นสำคัญเป็นข้อๆ"],
      });
    } catch (error: any) {
      console.log("Q&A synthesized fallback activated:", error?.message || "Fallback");
      const fallback = buildPedagogicQAFallback(question);
      return res.json({
        success: true,
        isAIGenerated: false,
        model: "built-in-intelligent-knowledge-base",
        fallbackReason: error?.message || "Local knowledge engine",
        answer: fallback.answer,
        suggestedFollowUps: fallback.suggestedFollowUps,
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Wat Bang Chalong Nai School Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

