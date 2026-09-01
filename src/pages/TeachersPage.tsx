import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TeacherCard } from '../components/TeacherCard';
import { Award, Search, Users, Sparkles } from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const { teachers, categories } = useApp();
  const [searchTeacher, setSearchTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredTeachers = teachers.filter((t) => {
    if (searchTeacher.trim()) {
      const q = searchTeacher.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchPos = (t.position || '').toLowerCase().includes(q);
      const matchStanding = (t.academicStanding || '').toLowerCase().includes(q);
      const matchSubject = (t.subjectName || '').toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchStanding && !matchSubject) return false;
    }
    if (selectedSubject !== 'all' && t.subjectId !== selectedSubject) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-[#005BAC] to-[#003875] text-white p-8 sm:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-1 rounded-full inline-block">
            คณะครูและบุคลากรทางการศึกษา
          </span>
          <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-white">
            ผลงานและโปรไฟล์คณะครู
          </h1>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">
            รวบรวมผลงาน นวัตกรรม และสื่อการเรียนการสอนของคณะครูโรงเรียนวัดบางโฉลงใน เพื่อยกย่องและส่งเสริมการแลกเปลี่ยนเรียนรู้ทางวิชาการ
          </p>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="ค้นหาชื่อครู, วิทยฐานะ หรือ สายชั้น..."
            value={searchTeacher}
            onChange={(e) => setSearchTeacher(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-800 focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 shrink-0">กลุ่มสาระฯ:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
          >
            <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher, index) => (
          <TeacherCard key={teacher.id} teacher={teacher} index={index} />
        ))}
      </div>

    </div>
  );
};
