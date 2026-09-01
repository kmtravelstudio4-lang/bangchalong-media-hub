import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Phone, Mail, Globe, Facebook, BookOpen, ShieldCheck, Heart, Smartphone, Download, Sparkles, Bot } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsPWAInstallModalOpen, setIsAIChatOpen, setIsAIPlannerOpen } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-[#005BAC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-[#005BAC] text-[#FFD54F] flex items-center justify-center font-extrabold text-2xl border-2 border-[#FFD54F]">
                บฉ
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">คลังสื่อการสอน</h3>
                <p className="text-xs text-slate-400">โรงเรียนวัดบางโฉลงใน</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              ศูนย์กลางรวบรวมและเผยแพร่สื่อการเรียนการสอน แผนการจัดการเรียนรู้ และนวัตกรรมทางการศึกษา คณะครูโรงเรียนวัดบางโฉลงใน เพื่อส่งเสริมคุณภาพการเรียนรู้ของนักเรียนทุกคน
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#005BAC] text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-[#005BAC] text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-4 border-[#FFD54F] pl-3">
              เมนูหลัก
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-[#FFD54F] transition">
                  หน้าแรก
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('repository')} className="hover:text-[#FFD54F] transition">
                  คลังสื่อการสอนทั้งหมด
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('exam-library')} className="hover:text-[#FFD54F] text-[#FFD54F] font-bold transition flex items-center gap-1.5">
                  <span>📚 คลังข้อสอบวัดผล (Exam Bank)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('teachers')} className="hover:text-[#FFD54F] transition">
                  ผลงานและโปรไฟล์ครู
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pa')} className="hover:text-[#FFD54F] text-[#FFD54F] font-bold transition">
                  ข้อตกลง PA (Performance Agreement)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('subjects')} className="hover:text-[#FFD54F] transition">
                  กลุ่มสาระการเรียนรู้ (8 กลุ่มสาระ)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('news')} className="hover:text-[#FFD54F] transition">
                  ข่าวประชาสัมพันธ์วิชาการ
                </button>
              </li>
              <li>
                <button onClick={() => setIsAIChatOpen(true)} className="text-[#FFD54F] hover:text-amber-300 font-bold transition flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#FFD54F]" />
                  <span>🤖 ถาม-ตอบครู AI (Teacher Q&A)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsAIPlannerOpen(true)} className="text-amber-300 hover:text-white font-medium transition flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FFD54F]" />
                  <span>✨ AI ช่วยสร้างแผนการสอน</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('documents')} className="hover:text-[#FFD54F] transition">
                  ดาวน์โหลดเอกสารสำหรับครู
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Subject Groups */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-4 border-[#FFD54F] pl-3">
              กลุ่มสาระการเรียนรู้
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• กลุ่มสาระฯ ภาษาไทย</li>
              <li>• กลุ่มสาระฯ คณิตศาสตร์</li>
              <li>• กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี</li>
              <li>• กลุ่มสาระฯ สังคมศึกษา ศาสนา และวัฒนธรรม</li>
              <li>• กลุ่มสาระฯ สุขศึกษาและพลศึกษา</li>
              <li>• กลุ่มสาระฯ ศิลปะ</li>
              <li>• กลุ่มสาระฯ การงานอาชีพ</li>
              <li>• กลุ่มสาระฯ ภาษาต่างประเทศ</li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base mb-4 border-l-4 border-[#FFD54F] pl-3">
              ติดต่อโรงเรียน
            </h4>
            <div className="flex items-start space-x-3 text-sm text-slate-400">
              <MapPin className="w-5 h-5 text-[#FFD54F] shrink-0 mt-0.5" />
              <span>38 หมู่ 2 ตำบลบางโฉลง อำเภอบางพลี จังหวัดสมุทรปราการ 10540</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <Phone className="w-4 h-4 text-[#FFD54F] shrink-0" />
              <span>02-312-7089</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400">
              <Mail className="w-4 h-4 text-[#FFD54F] shrink-0" />
              <span>bangchalongnai@gmail.com</span>
            </div>
            <div className="pt-2 text-xs text-slate-500">
              สพป. สมุทรปราการ เขต 2
            </div>

            {/* PWA Mobile App Card in Footer */}
            <div className="pt-2">
              <button
                onClick={() => setIsPWAInstallModalOpen(true)}
                className="w-full p-3 bg-gradient-to-r from-[#003875] to-[#005BAC] hover:from-[#002852] hover:to-[#004a8f] rounded-2xl border border-amber-300/40 text-left transition flex items-center space-x-3 shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                  <img src="/icons/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#FFD54F]" />
                    <span>ติดตั้งแอปบนมือถือ</span>
                  </div>
                  <div className="text-[10px] text-blue-200 truncate">
                    รองรับทั้ง iOS (iPhone) &amp; Android
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 space-y-3 md:space-y-0">
          <div>
            © {new Date().getFullYear()} นายจักรพงษ์ สำรองพันธ์ คลังสื่อการสอน โรงเรียนวัดบางโฉลงใน. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>พัฒนาขึ้นสำหรับคณะครูและนักเรียน โรงเรียนวัดบางโฉลงใน</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
