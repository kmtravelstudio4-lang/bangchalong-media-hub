import React from 'react';
import { School, Award, CheckCircle, Heart, Shield, BookOpen, Target, Eye } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-[#005BAC] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
          เกี่ยวกับโรงเรียน
        </span>
        <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-slate-900">
          โรงเรียนวัดบางโฉลงใน
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาสมุทรปราการ เขต 2 กระทรวงศึกษาธิการ
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005BAC] flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="font-prompt text-2xl font-bold text-slate-900">
            วิสัยทัศน์ (Vision)
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            "โรงเรียนวัดบางโฉลงใน มุ่งมั่นจัดการศึกษาให้ผู้เรียนมีความรู้คู่คุณธรรม มีทักษะการคิดวิเคราะห์ นำเทคโนโลยีดิจิทัลมาประยุกต์ใช้ในการเรียนรู้ สืบสานภูมิปัญญาท้องถิ่นบางพลี และเติบโตเป็นพลเมืองดีของสังคม"
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-prompt text-2xl font-bold text-slate-900">
            พันธกิจ (Mission)
          </h2>
          <ul className="text-slate-700 text-sm leading-relaxed space-y-2">
            <li className="flex items-start"><CheckCircle className="w-4 h-4 text-[#005BAC] mr-2 shrink-0 mt-0.5" /> พัฒนาหลักสูตรและกระบวนการเรียนรู้แบบ Active Learning</li>
            <li className="flex items-start"><CheckCircle className="w-4 h-4 text-[#005BAC] mr-2 shrink-0 mt-0.5" /> ส่งเสริมการสร้างสรรค์สื่อ นวัตกรรม และคลังเรียนรู้ออนไลน์</li>
            <li className="flex items-start"><CheckCircle className="w-4 h-4 text-[#005BAC] mr-2 shrink-0 mt-0.5" /> ส่งเสริมคุณธรรม จริยธรรม และวัฒนธรรมประเพณีท้องถิ่น</li>
          </ul>
        </div>
      </div>

      {/* History */}
      <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200/80 space-y-4">
        <h2 className="font-prompt text-2xl font-bold text-slate-900">
          ประวัติโรงเรียนวัดบางโฉลงใน
        </h2>
        <p className="text-slate-700 text-sm leading-relaxed">
          โรงเรียนวัดบางโฉลงใน ตั้งอยู่ ณ ตำบลบางโฉลง อำเภอบางพลี จังหวัดสมุทรปราการ เปิดสอนตั้งแต่ระดับชั้นอนุบาลถึงชั้นมัธยมศึกษาตอนต้น ได้รับความร่วมมืออันดีจากชุมชน คณะกรรมการสถานศึกษาขั้นพื้นฐาน และวัดบางโฉลงใน ในการส่งเสริมด้านการศึกษา พัฒนาสิ่งแวดล้อม และยกระดับคุณภาพชีวิตของผู้เรียนมาอย่างต่อเนื่อง
        </p>
      </div>

    </div>
  );
};
