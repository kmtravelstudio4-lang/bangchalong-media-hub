import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TeacherCard } from '../components/TeacherCard';
import { Award, Search, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { isTeacherDeputyDirector } from '../data/mockData';

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

  const deputyDirectors = useMemo(() => {
    return filteredTeachers.filter(t => isTeacherDeputyDirector(t));
  }, [filteredTeachers]);

  const regularTeachers = useMemo(() => {
    return filteredTeachers.filter(t => !isTeacherDeputyDirector(t));
  }, [filteredTeachers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-[#005BAC] to-[#003875] text-white p-8 sm:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-1 rounded-full inline-block">
            คณะผู้บริหาร คณะครู และบุคลากรทางการศึกษา
          </span>
          <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-white">
            ผลงานและโปรไฟล์คณะครูและผู้บริหาร
          </h1>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">
            รวบรวมผลงาน นวัตกรรม และสื่อการเรียนการสอนของคณะผู้บริหารและคณะครูโรงเรียนวัดบางโฉลงใน เพื่อยกย่องและส่งเสริมการแลกเปลี่ยนเรียนรู้ทางวิชาการ
          </p>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="ค้นหาชื่อครู/ผู้บริหาร, วิทยฐานะ หรือ สายชั้น..."
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

      {/* Section 1: Deputy Directors (คณะผู้บริหาร / รองผู้อำนวยการโรงเรียน) */}
      {deputyDirectors.length > 0 && (
        <div className="space-y-4 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-transparent p-6 sm:p-8 rounded-3xl border border-amber-300/50 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-prompt font-extrabold text-slate-900 text-lg sm:text-xl flex items-center space-x-2">
                  <span>คณะผู้บริหารสถานศึกษา / รองผู้อำนวยการโรงเรียน</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                    {deputyDirectors.length} ท่าน
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  สายบริหารงานสถานศึกษา โรงเรียนวัดบางโฉลงใน
                </p>
              </div>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-600" />
              ฝ่ายบริหารสถานศึกษา
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deputyDirectors.map((teacher, index) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Regular Teachers & Personnel (คณะครูและบุคลากรทางการศึกษา) */}
      {regularTeachers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#005BAC] text-white flex items-center justify-center font-bold shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="font-prompt font-extrabold text-slate-900 text-lg sm:text-xl">
                คณะครูผู้สอนและบุคลากรทางการศึกษา
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {regularTeachers.length} ท่าน
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularTeachers.map((teacher, index) => (
              <TeacherCard key={teacher.id} teacher={teacher} index={index} />
            ))}
          </div>
        </div>
      )}

      {filteredTeachers.length === 0 && (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-2">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">ไม่พบรายชื่อครูหรือผู้บริหารตามเงื่อนไขที่เลือก</p>
          <p className="text-xs text-slate-500">ลองเปลี่ยนกลุ่มสาระการเรียนรู้ หรือค้นหาด้วยคำอื่น</p>
        </div>
      )}

    </div>
  );
};
