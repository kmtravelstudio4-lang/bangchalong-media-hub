import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroBanner } from '../components/HeroBanner';
import { ResourceCard } from '../components/ResourceCard';
import { TeacherCard } from '../components/TeacherCard';
import { TeacherQASection } from '../components/TeacherQASection';
import { TeacherLeaderboard } from '../components/TeacherLeaderboard';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Newspaper, 
  Layers, 
  TrendingUp, 
  Download,
  School,
  Video,
  ExternalLink,
  Play,
  Wand2,
  Zap,
  FileText,
  GraduationCap
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    approvedResources, 
    teachers, 
    categories, 
    newsList, 
    videos,
    examQuestions,
    setActiveTab, 
    viewCategoryResources,
    setIsAIPlannerOpen
  } = useApp();

  // Requirements: สื่อใหม่ล่าสุด 8 รายการ
  const latest8Resources = [...approvedResources]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Featured Teachers
  const featuredTeachers = teachers.slice(0, 6);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 1.5 🏆 มินิแดชบอร์ดอันดับครูสุดขยันทำสื่อ (Teacher Leaderboard Top 3 & Weekly Rankings) */}
      <TeacherLeaderboard />

      {/* 2. สื่อใหม่ล่าสุด 8 รายการ (Required Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#005BAC] bg-blue-50 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>อัปเดตล่าสุด</span>
            </div>
            <h2 className="font-prompt text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              สื่อใหม่ล่าสุด (8 รายการ)
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              สื่อการเรียนรู้ แผนการสอน และใบงานที่เพิ่งถูกเพิ่มเข้ามาในระบบโดยคณะครู
            </p>
          </div>

          <button
            onClick={() => setActiveTab('repository')}
            className="inline-flex items-center space-x-1 text-sm font-bold text-[#005BAC] hover:text-[#004584] hover:underline shrink-0"
          >
            <span>ดูสื่อการสอนทั้งหมด ({approvedResources.length})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latest8Resources.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} index={index} />
          ))}
        </div>
      </section>

      {/* 2.5 ✨ AI ผู้ช่วยครูสร้างแผนการสอนอัจฉริยะ (AI Smart Lesson Planner Feature) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003875] via-[#005BAC] to-[#002852] text-white p-6 sm:p-10 shadow-xl border-2 border-[#FFD54F]/30">
          
          {/* Decorative glowing backdrops */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFD54F]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-[#FFD54F]/20 text-[#FFD54F] px-3.5 py-1 rounded-full text-xs font-bold border border-[#FFD54F]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>นวัตกรรม AI สำหรับครูไทย • ขับเคลื่อนด้วย Gemini 3.7 Pro</span>
              </div>

              <h2 className="font-prompt text-2xl sm:text-4xl font-extrabold leading-tight text-white">
                ระบบ AI ช่วยครูสร้าง <br className="hidden sm:inline" />
                <span className="text-[#FFD54F] drop-shadow-sm">แผนการจัดการเรียนรู้ & ข้อตกลง PA</span>
              </h2>

              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl">
                ลดภาระงานเอกสารของคุณครู ออกแบบแผนการสอน Active Learning, 5E, BBL และ PBL พร้อมกำหนดจุดประสงค์ K-P-A, เกณฑ์การประเมิน (Rubrics) และไอเดียประเด็นท้าทาย ว PA ถูกต้องตามหลักสูตรแกนกลางฯ ภายใน 5 วินาที
              </p>

              {/* Feature Bullet Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-medium text-blue-100">
                <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>สอดคล้องเกณฑ์ ว PA</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ครบ 8 กลุ่มสาระฯ & ปฐมวัย</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ส่งออก Word & คลังสื่อ 1-คลิก</span>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="pt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsAIPlannerOpen(true)}
                  className="bg-gradient-to-r from-amber-300 via-[#FFD54F] to-amber-400 hover:from-amber-400 hover:to-amber-500 text-[#003875] font-extrabold px-6 py-3 rounded-2xl shadow-lg flex items-center space-x-2 text-sm transition transform hover:-translate-y-0.5"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>เปิดใช้งาน AI สร้างแผนการสอน</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive Mockup / Quick Preset Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#FFD54F]" /> ตัวอย่างแผนการสอนยอดนิยม
                </span>
                <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  Active Learning
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div 
                  onClick={() => setIsAIPlannerOpen(true)}
                  className="p-3 bg-white/15 hover:bg-white/25 rounded-xl cursor-pointer transition border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">วิทยาศาสตร์ ป.4: การจำแนกสิ่งมีชีวิต (5E)</div>
                    <div className="text-[11px] text-blue-200">สืบเสาะหาความรู้ • กิจกรรมกลุ่ม • ตัวชี้วัด ว 1.3</div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#FFD54F]" />
                </div>

                <div 
                  onClick={() => setIsAIPlannerOpen(true)}
                  className="p-3 bg-white/15 hover:bg-white/25 rounded-xl cursor-pointer transition border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">ภาษาไทย ป.1: มาตราตัวสะกดแม่กบ (BBL)</div>
                    <div className="text-[11px] text-blue-200">เกมตอบคำถาม • บทเพลง • บัตรคำแสนสนุก</div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#FFD54F]" />
                </div>

                <div 
                  onClick={() => setIsAIPlannerOpen(true)}
                  className="p-3 bg-white/15 hover:bg-white/25 rounded-xl cursor-pointer transition border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">คณิตศาสตร์ ป.3: การคูณในชีวิตจริง (PBL)</div>
                    <div className="text-[11px] text-blue-200">สถานการณ์ตลาดบางพลี • แก้ปัญหาจริง</div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#FFD54F]" />
                </div>
              </div>

              <button
                onClick={() => setIsAIPlannerOpen(true)}
                className="w-full text-center text-xs font-bold text-amber-200 hover:text-white pt-1 block underline"
              >
                + ลองสร้างแผนการสอนวิชาอื่นๆ ของคุณ
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2.8 🤖 ระบบ AI ถาม-ตอบสำหรับครู (Teacher AI Q&A Section) */}
      <TeacherQASection />

      {/* 3. 8 กลุ่มสาระการเรียนรู้ (Category Grid) */}
      <section className="bg-slate-100/80 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-prompt text-2xl sm:text-3xl font-extrabold text-slate-900">
              กลุ่มสาระการเรียนรู้
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              รวบรวมสื่อการเรียนการสอนครอบคลุมทั้ง 8 กลุ่มสาระการเรียนรู้ ตามหลักสูตรการศึกษาขั้นพื้นฐาน
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const count = approvedResources.filter(r => r.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => viewCategoryResources(cat.id)}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-lg transition cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div 
                    className="absolute top-0 left-0 bottom-0 w-2"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="pl-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {count} สื่อการสอน
                      </span>
                      <BookOpen className="w-5 h-5 opacity-40 group-hover:opacity-100 transition" style={{ color: cat.color }} />
                    </div>
                    <h3 className="font-prompt font-bold text-slate-900 text-base group-hover:text-[#005BAC] transition mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3.5 📚 คลังข้อสอบโรงเรียนวัดบางโฉลงใน (School Exam Bank Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#002D5E] via-[#004B8F] to-[#005BAC] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-[#FFD54F]/20 relative overflow-hidden">
          <div className="space-y-2 z-10 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#FFD54F]/20 text-[#FFD54F] px-3 py-1 rounded-full text-xs font-bold border border-[#FFD54F]/30">
              <GraduationCap className="w-4 h-4" />
              <span>ระบบคลังข้อสอบ & แบบทดสอบวัดผล</span>
            </div>
            <h3 className="font-prompt text-2xl sm:text-3xl font-extrabold text-white">
              คลังข้อสอบ โรงเรียนวัดบางโฉลงใน
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              รวมแบบทดสอบก่อนเรียน-หลังเรียน ข้อสอบกลางภาค-ปลายภาค และแบบประเมินผลสัมฤทธิ์ทางการเรียนทุกระดับชั้นและทุกกลุ่มสาระการเรียนรู้
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0">
            <button
              onClick={() => setActiveTab('exam-library')}
              className="px-6 py-3 bg-[#FFD54F] hover:bg-[#ffca28] text-slate-950 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-md flex items-center space-x-2"
            >
              <span>เข้าสู่คลังข้อสอบ ({examQuestions.length} รายการ)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. คณะครูและผลงานวิชาการ (Featured Teachers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>บุคลากรทางการศึกษา</span>
            </div>
            <h2 className="font-prompt text-2xl sm:text-3xl font-extrabold text-slate-900">
              คณะครูผู้จัดทำสื่อการสอน
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              ครูและบุคลากรโรงเรียนวัดบางโฉลงใน มุ่งมั่นพัฒนาศักยภาพการเรียนรู้ของผู้เรียน
            </p>
          </div>

          <button
            onClick={() => setActiveTab('teachers')}
            className="inline-flex items-center space-x-1 text-sm font-bold text-[#005BAC] hover:underline shrink-0"
          >
            <span>ดูโปรไฟล์ครูทั้งหมด ({teachers.length} ท่าน)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTeachers.map((teacher, index) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>
      </section>

      {/* 5. ข่าวประชาสัมพันธ์วิชาการ (News) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-[#FFD54F] uppercase tracking-wider block mb-1">
                BANGCHALONGNAI NEWS
              </span>
              <h2 className="font-prompt text-2xl sm:text-3xl font-extrabold text-white">
                ข่าวประชาสัมพันธ์วิชาการ
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('news')}
              className="text-xs font-bold text-[#FFD54F] hover:underline"
            >
              อ่านข่าวทั้งหมด →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.slice(0, 3).map((news) => (
              <div key={news.id} className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700/80 hover:border-[#FFD54F] transition group">
                <div className="h-40 w-full overflow-hidden">
                  <img 
                    src={news.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800'} 
                    alt={news.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold bg-[#005BAC] text-white px-2.5 py-0.5 rounded-full">
                    {news.category}
                  </span>
                  <h3 className="font-prompt font-bold text-white text-base leading-snug line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {news.content}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-500">
                    {news.createdAt} • {news.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5 Facebook Page Live Feed & YouTube Video Channel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Facebook Page Plugin */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold text-xl">
                  f
                </div>
                <div>
                  <h3 className="font-prompt font-extrabold text-slate-900 text-lg leading-tight">
                    Facebook เพจโรงเรียน
                  </h3>
                  <p className="text-slate-500 text-xs">@watbangchalongnai • โพสต์ล่าสุดแบบเรียลไทม์</p>
                </div>
              </div>
              
              <a
                href="https://www.facebook.com/watbangchalongnai"
                target="_blank"
                rel="noreferrer"
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center space-x-1 shadow-xs"
              >
                <span>เปิดใน FB</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Facebook Embedded Feed iFrame */}
            <div className="w-full h-[500px] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
              <iframe
                title="Facebook Page Feed"
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatbangchalongnai&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                width="100%"
                height="500"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                className="w-full h-full rounded-2xl"
              ></iframe>
            </div>

            <a
              href="https://www.facebook.com/watbangchalongnai"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>กดติดตาม Facebook เพจโรงเรียนวัดบางโฉลงใน</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column (7 cols): YouTube Videos Channel (Admin Uploaded) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-prompt font-extrabold text-slate-900 text-lg leading-tight">
                    วิดีโอสื่อการเรียนรู้ YouTube
                  </h3>
                  <p className="text-slate-500 text-xs">คลิปวิดีโอและผลงานวิชาการที่แอดมินอัปเดตล่าสุด</p>
                </div>
              </div>

              <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full">
                YouTube Channel
              </span>
            </div>

            {/* Videos List Grid */}
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {videos.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-xs">ยังไม่มีวิดีโอในระบบ</p>
                </div>
              ) : (
                videos.map((vid) => (
                  <div key={vid.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-rose-300 transition">
                    <div className="sm:w-56 shrink-0 aspect-video rounded-xl overflow-hidden bg-slate-900 relative shadow-xs">
                      {vid.youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                          title={vid.title}
                          className="w-full h-full rounded-xl"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : null}
                    </div>

                    <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mb-1">
                          {vid.createdAt}
                        </div>
                        <h4 className="font-prompt font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                          {vid.title}
                        </h4>
                        {vid.description && (
                          <p className="text-slate-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>

                      <a
                        href={vid.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 inline-flex items-center space-x-1 pt-1"
                      >
                        <span>เปิดดูบน YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 6. School Banner Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#005BAC] to-[#003875] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-1 rounded-full">
              <School className="w-4 h-4" />
              <span>โรงเรียนวัดบางโฉลงใน อ.บางพลี จ.สมุทรปราการ</span>
            </div>
            <h2 className="font-prompt text-2xl sm:text-4xl font-extrabold leading-tight">
              ร่วมแบ่งปันสื่อการเรียนรู้ เพื่ออนาคตการศึกษาไทย
            </h2>
            <p className="text-slate-200 text-sm leading-relaxed">
              คณะครูและบุคลากร สามารถอัปโหลดสื่อการสอน ใบงาน และนวัตกรรมวิชาการผ่านระบบ Admin เพื่อให้เพื่อนครูและนักเรียนเข้าถึงได้ทุกที่ทุกเวลา
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => setActiveTab('repository')}
              className="bg-[#FFD54F] hover:bg-[#FFC107] text-[#003875] font-extrabold px-8 py-4 rounded-2xl shadow-lg transition text-base"
            >
              เข้าสู่คลังสื่อการสอน →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
