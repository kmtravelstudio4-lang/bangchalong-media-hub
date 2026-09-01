import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { askAITeacherQA, ChatMessage } from '../services/aiService';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Download, 
  HelpCircle, 
  Award, 
  Lightbulb, 
  Layers, 
  BookOpen, 
  GraduationCap,
  MessageSquare,
  CornerDownLeft,
  RefreshCw,
  Share2
} from 'lucide-react';

const SUGGESTED_STARTERS = [
  {
    icon: <Award className="w-3.5 h-3.5 text-amber-500" />,
    text: 'สรุปเกณฑ์การประเมิน ว PA 8 ตัวชี้วัดการจัดการเรียนรู้',
  },
  {
    icon: <Sparkles className="w-3.5 h-3.5 text-cyan-500" />,
    text: 'ทำไมดวงอาทิตย์จึงร้อน และดวงจันทร์หมุนรอบโลกอย่างไร?',
  },
  {
    icon: <GraduationCap className="w-3.5 h-3.5 text-rose-500" />,
    text: 'ช่วยแต่งกลอนแปด 2 บทเกี่ยวกับพระคุณครูและคุณธรรม',
  },
  {
    icon: <Lightbulb className="w-3.5 h-3.5 text-blue-500" />,
    text: 'ขอตัวอย่างแผนการสอน Active Learning 5E วิชาคณิตศาสตร์',
  },
  {
    icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
    text: 'แนะนำสูตร Excel สำคัญที่ครูใช้ตัดเกรดและคิดค่าเฉลี่ย',
  },
  {
    icon: <BookOpen className="w-3.5 h-3.5 text-purple-500" />,
    text: 'เทคนิคการช่วยเหลือเด็กสมาธิสั้น (ADHD) ในห้องเรียน',
  },
];

export const TeacherQAChatModal: React.FC = () => {
  const { 
    isAIChatOpen, 
    setIsAIChatOpen, 
    aiChatInitialQuestion, 
    setAIChatInitialQuestion 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial question from context
  useEffect(() => {
    if (isAIChatOpen) {
      if (aiChatInitialQuestion && aiChatInitialQuestion.trim()) {
        handleSendMessage(aiChatInitialQuestion);
        setAIChatInitialQuestion('');
      } else if (messages.length === 0) {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `สวัสดีครับ! ยินดีต้อนรับสู่ **AI ผู้ช่วยอัจฉริยะ โรงเรียนวัดบางโฉลงใน** 🤖✨\n\nสามารถถาม-ตอบได้ **ทุกเรื่อง** ตลอด 24 ชั่วโมง:\n- 🔬 **วิทยาศาสตร์ คณิต & ความรู้รอบตัว:** ฟิสิกส์ ดาราศาสตร์ สูตรคำนวณ ปรากฏการณ์ธรรมชาติ\n- 📚 **ภาษาไทย อังกฤษ & วรรณกรรม:** แปลภาษา, หลักไวยากรณ์, แต่งกลอนแปด/โคลงสี่สุภาพ\n- 💻 **คอมพิวเตอร์ เทคโนโลยี & AI:** โค้ดดิ้ง, สูตร Excel, Canva, สื่อการสอนดิจิทัล\n- 📋 **งานครู & ว PA:** 8 ตัวชี้วัด, ประเด็นท้าทาย, แผนการสอน Active Learning, วิจัยในชั้นเรียน CAR\n- 💡 **จิตวิทยา & สารบรรณ:** การดูแลเด็กสมาธิสั้น/LD, ร่างหนังสือราชการ, บทสุนทรพจน์, การให้คำปรึกษา\n\nสามารถพิมพ์คำถามหรือเลือกหัวข้อแนะนำด้านล่างได้เลยครับ!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedFollowUps: [
              'ช่วยแต่งกลอนแปด 2 บทเกี่ยวกับคุณครู',
              'ทำไมท้องฟ้าถึงเป็นสีฟ้า และดวงอาทิตย์มีอุณหภูมิเท่าไหร่?',
              'แนวทางการเขียนประเด็นท้าทาย ว PA ให้ผ่านเกณฑ์'
            ]
          }
        ]);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isAIChatOpen]);

  // Cancel speech on close
  useEffect(() => {
    if (!isAIChatOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [isAIChatOpen]);

  if (!isAIChatOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = newHistory
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await askAITeacherQA({
        question: text,
        context: 'ผู้ใช้กำลังสนทนากับครูพี่เลี้ยง AI ประจำโรงเรียนวัดบางโฉลงใน สพป.สมุทรปราการ เขต 2',
        history: historyPayload
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAIGenerated: res.isAIGenerated,
        suggestedFollowUps: res.suggestedFollowUps || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ขออภัย ระบบเกิดข้อผิดพลาดชั่วคราว กรุณาส่งคำถามใหม่อีกครั้งครับ',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/#+/g, '')
        .replace(/\*+/g, '')
        .replace(/`+/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .slice(0, 1000);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'th-TH';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const handleClearChat = () => {
    if (confirm('คุณต้องการล้างประวัติการสนทนาทั้งหมดใช่หรือไม่?')) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setSpeakingId(null);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'เริ่มการสนทนาใหม่แล้วครับ สามารถถามคำถามได้ทุกเรื่อง ทั้งวิทยาศาสตร์ คณิตศาสตร์ ภาษาไทย ภาษาอังกฤษ แปลภาษา แต่งกลอน ว PA และงานสอนครับ 🤖✨',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleExportChat = () => {
    const chatText = messages
      .map(m => `[${m.timestamp}] ${m.role === 'user' ? 'ครู' : 'AI ผู้ช่วยครู'}:\n${m.content}\n-----------------------------------\n`)
      .join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `บันทึกคำปรึกษา_AI_ผู้ช่วยครู_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Safe Inline Markdown Styler
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-prompt font-extrabold text-base text-[#003875] pt-1.5 pb-0.5 border-b border-blue-100/60 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{trimmed.replace('### ', '')}</span>
              </h4>
            );
          }

          // Heading 2 / 1
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h3 key={idx} className="font-prompt font-extrabold text-base sm:text-lg text-[#003875] pt-2 pb-1 border-b border-blue-200">
                {trimmed.replace(/^#+\s*/, '')}
              </h3>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2">
                <span className="text-[#005BAC] font-bold mt-1 shrink-0">•</span>
                <span className="flex-1 text-slate-700">{renderInline(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered item
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                <span className="w-5 h-5 rounded-full bg-[#005BAC] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {numMatch[1]}
                </span>
                <span className="flex-1 text-slate-800 font-medium">{renderInline(numMatch[2])}</span>
              </div>
            );
          }

          // Callout / Note
          if (trimmed.includes('💡') || trimmed.includes('ข้อแนะนำ:')) {
            return (
              <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs sm:text-sm flex items-start gap-2 shadow-xs">
                <span className="text-base shrink-0">💡</span>
                <div className="flex-1">{renderInline(trimmed.replace('💡', ''))}</div>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-700">
              {renderInline(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#003875] bg-blue-50/70 px-1 py-0.2 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-4xl h-[90vh] max-h-[850px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-blue-200 animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003875] via-[#005BAC] to-[#002852] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFD54F] to-amber-300 text-[#003875] flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-prompt font-extrabold text-base sm:text-lg text-white">
                  AI ผู้ช่วยอัจฉริยะ (ถาม-ตอบได้ทุกเรื่อง)
                </h3>
                <span className="bg-[#FFD54F]/20 text-[#FFD54F] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#FFD54F]/40">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-blue-100 text-xs hidden sm:block">
                โรงเรียนวัดบางโฉลงใน • สพป.สมุทรปราการ เขต 2
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={handleExportChat}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition text-xs font-bold flex items-center space-x-1"
              title="บันทึกบทสนทนาเป็นไฟล์ .txt"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">บันทึก</span>
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-blue-100 hover:text-white transition text-xs font-bold flex items-center space-x-1"
              title="ล้างแชท"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">ล้าง</span>
            </button>

            <button
              onClick={() => setIsAIChatOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/30 text-white transition ml-1"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          
          {/* Suggested Starter Chips if message count is low */}
          {messages.length <= 1 && (
            <div className="mb-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-[#003875] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>คำถามที่ครูมักปรึกษาบ่อย (คลิกเพื่อถามได้ทันที):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_STARTERS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.text)}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-100/70 border border-blue-100 text-xs font-medium text-slate-800 hover:text-[#003875] text-left transition flex items-center space-x-2 shadow-xs group"
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1 line-clamp-1">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#003875] to-[#005BAC] text-[#FFD54F] flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-[#003875] to-[#005BAC] text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-80 pb-1 border-b border-black/5 dark:border-white/10">
                    <span className="font-bold">
                      {isUser ? 'คุณครู' : 'ครูพี่เลี้ยง AI'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Content */}
                  {isUser ? (
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  ) : (
                    <div>{renderMessageContent(msg.content)}</div>
                  )}

                  {/* Actions for Assistant messages (Copy & Speak) */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
                            speakingId === msg.id
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                          title="อ่านออกเสียง"
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">
                            {speakingId === msg.id ? 'หยุด' : 'อ่านเสียง'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition flex items-center space-x-1"
                          title="คัดลอกข้อความ"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[10px] text-emerald-600">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">คัดลอก</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-sans">
                        AI Teacher Mentor
                      </span>
                    </div>
                  )}

                  {/* Suggested Follow-ups */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-blue-100/60 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-[#005BAC]" />
                        <span>ถามต่อเนื่อง:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((fu, fuIdx) => (
                          <button
                            key={fuIdx}
                            onClick={() => handleSendMessage(fu)}
                            className="text-[11px] bg-blue-50 hover:bg-blue-100 text-[#003875] border border-blue-200 rounded-lg px-2.5 py-1 font-medium transition text-left"
                          >
                            👉 {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-1 font-bold text-xs">
                    ครู
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2.5 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#003875] to-[#005BAC] text-[#FFD54F] flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-xs text-xs text-slate-600 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#005BAC] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#005BAC] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#005BAC] animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-slate-600 ml-2">ผู้ช่วยครู AI กำลังค้นคว้าและเรียบเรียงคำตอบ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end space-x-2"
          >
            <div className="flex-1 bg-slate-50 focus-within:bg-white border-2 border-slate-200 focus-within:border-[#005BAC] rounded-2xl p-2 transition shadow-inner">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="พิมพ์คำถามได้ทุกเรื่อง... เช่น ทำไมท้องฟ้าสีฟ้า, แต่งกลอนวันครู, สูตร Excel, ว PA (กด Enter เพื่อส่ง)"
                className="w-full bg-transparent border-0 focus:outline-hidden text-sm text-slate-800 placeholder-slate-400 resize-none font-medium"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="h-12 px-5 bg-gradient-to-r from-[#003875] to-[#005BAC] hover:from-[#002852] hover:to-[#004584] text-white font-bold rounded-2xl shadow-md flex items-center justify-center space-x-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">ส่ง</span>
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            💡 ขับเคลื่อนด้วย Gemini 3.7 • สอดคล้องตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐานและเกณฑ์ ก.ค.ศ. ว PA
          </div>
        </div>

      </div>
    </div>
  );
};
