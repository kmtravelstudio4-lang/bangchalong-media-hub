import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="bg-[#005BAC] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
          ติดต่อเรา
        </span>
        <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-slate-900">
          ติดต่อโรงเรียนวัดบางโฉลงใน
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          ยินดีรับฟังข้อเสนอแนะ สอบถามข้อมูลคลังสื่อการสอน และประสานงานวิชาการ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="font-prompt font-bold text-slate-900 text-lg border-l-4 border-[#005BAC] pl-3">
              ข้อมูลสถานที่และช่องทางติดต่อ
            </h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#005BAC] shrink-0 mt-1" />
                <div>
                  <span className="font-bold text-slate-900 block">ที่อยู่โรงเรียน</span>
                  <span>38 หมู่ 2 ตำบลบางโฉลง อำเภอบางพลี จังหวัดสมุทรปราการ 10540</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#005BAC] shrink-0 mt-1" />
                <div>
                  <span className="font-bold text-slate-900 block">หมายเลขโทรศัพท์</span>
                  <span>02-312-7089</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#005BAC] shrink-0 mt-1" />
                <div>
                  <span className="font-bold text-slate-900 block">อีเมลวิชาการ</span>
                  <span>bangchalongnai@gmail.com</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#005BAC] shrink-0 mt-1" />
                <div>
                  <span className="font-bold text-slate-900 block">เวลาทำการ</span>
                  <span>วันจันทร์ - วันศุกร์ เวลา 08:00 - 16:30 น.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Placeholder Frame */}
          <div className="bg-slate-200 rounded-2xl h-64 overflow-hidden relative shadow-inner border border-slate-300 flex items-center justify-center text-center p-6">
            <div className="space-y-2">
              <MapPin className="w-10 h-10 text-[#005BAC] mx-auto animate-bounce" />
              <div className="font-bold text-slate-800 text-sm">
                โรงเรียนวัดบางโฉลงใน
              </div>
              <p className="text-xs text-slate-600">
                อ.บางพลี จ.สมุทรปราการ (ใกล้ถนนเทพรัตน / บางนา-ตราด กม.16)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
          <h2 className="font-prompt font-bold text-slate-900 text-xl">
            แบบฟอร์มส่งข้อความถึงโรงเรียน
          </h2>

          {submitted && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-2xl border border-emerald-200 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>ส่งข้อความเรียบร้อยแล้ว! เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
              <input
                type="text"
                required
                placeholder="กรอกชื่อและนามสกุลของคุณ"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">อีเมลติดต่อ *</label>
              <input
                type="email"
                required
                placeholder="example@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">หัวข้อเรื่อง *</label>
              <input
                type="text"
                required
                placeholder="เช่น สอบถามเรื่องการใช้สื่อการสอน..."
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ข้อความรายละเอียด *</label>
              <textarea
                rows={4}
                required
                placeholder="พิมพ์ข้อความของคุณที่นี่..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>ส่งข้อความ</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
