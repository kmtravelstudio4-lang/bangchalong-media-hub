import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { askAITeacherQA, ChatMessage } from '../services/aiService';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  MessageSquare, 
  HelpCircle, 
  BookOpen, 
  Award, 
  Lightbulb, 
  Layers, 
  RotateCcw,
  Maximize2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

interface QuickTopic {
  category: string;
  icon: React.ReactNode;
  questions: string[];
}

const QUICK_TOPICS: QuickTopic[] = [
  {
    category: '📋 เกณฑ์ ว PA & วิทยฐานะ',
    icon: <Award className="w-3.5 h-3.5 text-amber-500" />,
    questions: [
      'เกณฑ์การประเมิน 8 ตัวชี้วัดคลิปการสอน ว PA มีอะไรบ้าง?',
      'ตัวอย่างการเขียนประเด็นท้าทาย ว PA สำหรับครูชำนาญการพิเศษ',
      'ข้อแตกต่างระหว่างการเขียน PA ระดับชำนาญการ และ ชำนาญการพิเศษ',
      'ขั้นตอนการเตรียมคลิปการสอน 60 นาทีและคลิปแรงบันดาลใจตามเกณฑ์ ก.ค.ศ.'
    ]
  },
  {
    category: '🎯 Active Learning & นวัตกรรมการสอน',
    icon: <Lightbulb className="w-3.5 h-3.5 text-blue-500" />,
    questions: [
      'ขอไอเดียจัดกิจกรรมการเรียนรู้แบบ 5E ให้นักเรียนมีส่วนร่วม 100%',
      'วิธีจัดกิจกรรม GPAS 5 Steps ในกลุ่มสาระวิทยาศาสตร์และคณิตศาสตร์',
      'แนะนำเกมและกิจกรรม Ice Breaking ก่อนเริ่มบทเรียน 3-5 นาที',
      'แนวทางการบูรณาการสะเต็มศึกษา (STEM Education) ในระดับประถม'
    ]
  },
  {
    category: '🔬 วิทยาศาสตร์ คณิต & ความรู้รอบตัว',
    icon: <Sparkles className="w-3.5 h-3.5 text-cyan-500" />,
    questions: [
      'ทำไมท้องฟ้าและน้ำทะเลจึงเป็นสีฟ้า และดวงอาทิตย์มีอุณหภูมิเท่าไหร่?',
      'อธิบายสูตรและวิธีคำนวณพื้นที่วงกลม ปริมาตรทรงกระบอก พร้อมตัวอย่าง',
      'กฎแรงโน้มถ่วงของนิวตันและทฤษฎีบทพีทาโกรัสอธิบายให้เด็กเข้าใจง่ายๆ',
      'แนะนำสถานที่ท่องเที่ยวและประเพณีรับบัว อำเภอบางพลี สมุทรปราการ'
    ]
  },
  {
    category: '📚 ภาษาไทย อังกฤษ & แต่งกลอน',
    icon: <GraduationCap className="w-3.5 h-3.5 text-rose-500" />,
    questions: [
      'ช่วยแต่งกลอนแปด 2 บทเกี่ยวกับพระคุณครูและการศึกษา',
      'แปลประโยคนี้เป็นภาษาอังกฤษแบบสุภาพ: "ยินดีต้อนรับสู่โรงเรียนของเรา"',
      'ประโยคภาษาอังกฤษที่ครูใช้สั่งในห้องเรียนบ่อยๆ (Classroom English)',
      'หลักการจำคำราชาศัพท์หมวดร่างกายและเครื่องใช้'
    ]
  },
  {
    category: '💻 เทคโนโลยี คอมพิวเตอร์ & AI',
    icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
    questions: [
      'แนะนำแนวทางการสอน Unplugged Coding สำหรับนักเรียนประถม',
      'สูตร Excel สำคัญที่ครูใช้ตัดเกรด คำนวณค่าเฉลี่ย (Mean, S.D.)',
      'เทคนิคการใช้ Canva for Education ออกแบบใบงานและสไลด์สอน',
      'การใช้ AI ช่วยสรุปเนื้อหาและออกแบบแบบฝึกหัดอย่างมีประสิทธิภาพ'
    ]
  },
  {
    category: '💡 จิตวิทยา & การดูแลชั้นเรียน',
    icon: <BookOpen className="w-3.5 h-3.5 text-purple-500" />,
    questions: [
      'เทคนิคการรับมือและช่วยเหลือเด็กสมาธิสั้น (ADHD) ในห้องเรียนรวม',
      'วิธีสร้างแรงจูงใจเชิงบวกแก่นักเรียนที่ไม่ชอบทำงานส่ง',
      'แนวทางการจัดทำแผน IEP สำหรับเด็กที่มีความบกพร่องทางการเรียนรู้ (LD)',
      'ขั้นตอนการทำวิจัยในชั้นเรียน (CAR) 5 บทแบบกระชับและเข้าใจง่าย'
    ]
  }
];

export const TeacherQASection: React.FC = () => {
  const { openAIChatWithQuestion, setIsAIChatOpen } = useApp();
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  // Stop speech if unmounted
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAsk = async (qText?: string) => {
    const query = (qText || questionInput).trim();
    if (!query) return;

    setIsLoading(true);
    setCurrentQuestion(query);
    setCurrentAnswer(null);
    setFollowUps([]);
    setIsCopied(false);

    try {
      const res = await askAITeacherQA({
        question: query,
        context: 'ผู้ใช้กำลังใช้งานระบบถามตอบสำหรับคณะครู โรงเรียนวัดบางโฉลงใน สพป.สมุทรปราการ เขต 2'
      });

      setCurrentAnswer(res.answer);
      setFollowUps(res.suggestedFollowUps || []);
      if (!qText) setQuestionInput('');
    } catch (err) {
      console.error(err);
      setCurrentAnswer('ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentAnswer) return;
    navigator.clipboard.writeText(`คำถาม: ${currentQuestion}\n\nคำตอบจาก AI ผู้ช่วยครู โรงเรียนวัดบางโฉลงใน:\n${currentAnswer}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!currentAnswer) return;
      window.speechSynthesis.cancel();

      // Clean markdown tags for natural speech
      const cleanText = currentAnswer
        .replace(/#+/g, '')
        .replace(/\*+/g, '')
        .replace(/`+/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .slice(0, 1000);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'th-TH';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Helper to render markdown-like text smoothly
  const renderFormattedAnswer = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-slate-800 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-prompt font-extrabold text-base sm:text-lg text-[#003875] pt-2 pb-1 border-b border-blue-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{trimmed.replace('### ', '')}</span>
              </h4>
            );
          }

          // Heading 2 / 1
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h3 key={idx} className="font-prompt font-extrabold text-lg text-[#003875] pt-3 pb-1 border-b border-blue-200">
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            );
          }

          // Bullet list items
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-[#005BAC] font-bold mt-1 shrink-0">•</span>
                <span className="flex-1 text-slate-700">
                  {renderInlineStyles(content)}
                </span>
              </div>
            );
          }

          // Numbered lists (1. 2. 3.)
          const numberedMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start space-x-2.5 pl-1 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                <span className="w-6 h-6 rounded-full bg-[#005BAC] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {numberedMatch[1]}
                </span>
                <span className="flex-1 text-slate-800 font-medium">
                  {renderInlineStyles(numberedMatch[2])}
                </span>
              </div>
            );
          }

          // Callout / Note (💡, 📌, ⚠️)
          if (trimmed.includes('💡') || trimmed.includes('ข้อแนะนำ') || trimmed.includes('คำแนะนำ:')) {
            return (
              <div key={idx} className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-amber-950 font-medium text-xs sm:text-sm flex items-start gap-2 shadow-xs">
                <span className="text-base shrink-0">💡</span>
                <div className="flex-1 leading-normal">{renderInlineStyles(trimmed.replace('💡', ''))}</div>
              </div>
            );
          }

          // Standard paragraph
          return (
            <p key={idx} className="text-slate-700">
              {renderInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for inline bold tags **text**
  const renderInlineStyles = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#003875] bg-blue-50/80 px-1 py-0.5 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <section id="ai-teacher-qa-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#003875] via-[#005BAC] to-[#002852] text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-[#FFD54F]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-blue-300/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-[#FFD54F]/20 text-[#FFD54F] px-3.5 py-1 rounded-full text-xs font-bold border border-[#FFD54F]/30 backdrop-blur-sm">
                <Bot className="w-4 h-4 text-[#FFD54F]" />
                <span>AI ผู้ช่วยอัจฉริยะ • ถาม-ตอบได้ทุกเรื่อง 24 ชม.</span>
              </div>
              <h2 className="font-prompt text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ห้องถาม-ตอบ &amp; ผู้ช่วย AI อัจฉริยะ
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                ถามได้ทุกเรื่อง ทั้งความรู้รอบตัว วิทยาศาสตร์ คณิตศาสตร์ ภาษาไทย ภาษาอังกฤษ แปลภาษา แต่งกลอน เกณฑ์ ว PA การจัดการเรียนการสอน และข้อมูลทั่วไป
              </p>
            </div>

            {/* Open Full Chat Modal Button */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="self-start md:self-center bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shrink-0 backdrop-blur-sm hover:border-white/50 shadow-sm group"
            >
              <MessageSquare className="w-4 h-4 text-[#FFD54F] group-hover:scale-110 transition-transform" />
              <span>เปิดห้องสนทนาเต็มจอ</span>
              <Maximize2 className="w-3.5 h-3.5 text-blue-200" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Category Tabs for Quick Inspiration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#005BAC]" />
                <span>คำถามยอดนิยมที่ครูมักปรึกษา:</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">คลิกคำถามเพื่อดูคำตอบทันที</span>
            </div>

            {/* Category selection buttons */}
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategoryIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                    selectedCategoryIdx === idx
                      ? 'bg-[#003875] text-white border-[#003875] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-[#003875]'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.category}</span>
                </button>
              ))}
            </div>

            {/* Quick question pill chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {QUICK_TOPICS[selectedCategoryIdx].questions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => {
                    setQuestionInput(q);
                    handleAsk(q);
                  }}
                  disabled={isLoading}
                  className="text-left p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-100 text-xs text-slate-800 hover:text-[#003875] font-medium transition flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="flex-1 pr-2 line-clamp-2">💬 {q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-[#005BAC] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Ask Input Box */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="relative"
            >
              <div className="flex items-center bg-slate-50 border-2 border-slate-200 focus-within:border-[#005BAC] focus-within:bg-white rounded-2xl p-1.5 transition shadow-inner">
                <div className="pl-3 text-slate-400">
                  <Bot className="w-5 h-5 text-[#005BAC]" />
                </div>
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="พิมพ์คำถามได้ทุกเรื่อง... เช่น ทำไมท้องฟ้าสีฟ้า, แต่งกลอนวันครู, สูตรพื้นที่วงกลม, ว PA ชำนาญการพิเศษ"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !questionInput.trim()}
                  className="bg-gradient-to-r from-[#003875] to-[#005BAC] hover:from-[#002852] hover:to-[#004584] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-md shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังคิด...</span>
                    </>
                  ) : (
                    <>
                      <span>ส่งคำถาม</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center space-y-3 text-center animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003875] to-[#005BAC] text-[#FFD54F] flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#003875]">ผู้ช่วยครู AI กำลังวิเคราะห์และเรียบเรียงคำตอบ...</h4>
                <p className="text-xs text-slate-500 mt-0.5">ค้นหาข้อมูลตามหลักสูตรแกนกลางฯ และเกณฑ์ ก.ค.ศ. ว PA</p>
              </div>
            </div>
          )}

          {/* Live Answer Box */}
          {currentAnswer && !isLoading && (
            <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-white to-blue-50/30 p-5 sm:p-6 shadow-md space-y-4 animate-fadeIn">
              
              {/* Answer Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#003875] to-[#005BAC] text-[#FFD54F] flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#003875] flex items-center gap-1.5">
                      <span>คำตอบจากครูพี่เลี้ยง AI</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.2 rounded-full font-bold">
                        พร้อมใช้งาน
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      คำถาม: &ldquo;{currentQuestion}&rdquo;
                    </div>
                  </div>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleSpeak}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 border ${
                      isSpeaking
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                    title={isSpeaking ? 'หยุดอ่าน' : 'อ่านออกเสียงคำตอบ'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-slate-500" />}
                    <span className="hidden sm:inline">{isSpeaking ? 'หยุดเสียง' : 'อ่านเสียง'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold transition flex items-center space-x-1"
                    title="คัดลอกคำตอบ"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 hidden sm:inline">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">คัดลอก</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openAIChatWithQuestion(currentQuestion || '')}
                    className="px-3 py-2 rounded-xl bg-[#003875] hover:bg-[#002852] text-white text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                    title="ถามคำถามเจาะลึกต่อในหน้าต่างเต็มจอ"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FFD54F]" />
                    <span>คุยต่อ</span>
                  </button>
                </div>
              </div>

              {/* Formatted Answer Output */}
              <div className="pt-1">
                {renderFormattedAnswer(currentAnswer)}
              </div>

              {/* Follow-up Question Suggestions */}
              {followUps.length > 0 && (
                <div className="pt-4 border-t border-blue-100/80 space-y-2">
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#005BAC]" />
                    <span>คำถามที่แนะนำให้ศึกษาเพิ่มเติม:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {followUps.map((item, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => {
                          setQuestionInput(item);
                          handleAsk(item);
                        }}
                        className="text-xs bg-white hover:bg-blue-50 text-[#003875] border border-blue-200/80 rounded-xl px-3 py-1.5 font-medium transition text-left flex items-center gap-1 hover:border-[#005BAC]"
                      >
                        <span>👉 {item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
