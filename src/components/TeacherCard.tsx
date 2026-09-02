import React, { useMemo } from 'react';
import { Teacher } from '../types';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Award, BookOpen, Download, Mail, Facebook, ExternalLink, UserCheck } from 'lucide-react';

interface TeacherCardProps {
  teacher: Teacher;
  index?: number;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, index = 0 }) => {
  const { viewTeacherPublications, setSelectedTeacher, resources } = useApp();

  const teacherResources = useMemo(() => {
    return resources.filter(r => {
      const matchId = r.teacherId && r.teacherId === teacher.id;
      const matchName = Boolean(
        r.teacherName &&
        teacher.name &&
        (r.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase() ||
         r.teacherName.includes(teacher.name) ||
         teacher.name.includes(r.teacherName))
      );
      return matchId || matchName;
    });
  }, [resources, teacher.id, teacher.name]);

  const realResourcesCount = teacherResources.length;
  const realTotalDownloads = teacherResources.reduce((sum, r) => sum + (r.downloads || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 hover:-translate-y-1 relative group"
    >
      {/* Top Background Badge */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#005BAC] via-[#1A73E8] to-[#FFD54F]" />

      <div>
        {/* Header Photo & Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative shrink-0">
            <img
              src={teacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'}
              alt={teacher.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:border-[#005BAC] transition"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#FFD54F] text-[#003875] p-1 rounded-full shadow-xs" title="ครูผู้สอน">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-prompt font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-[#005BAC] transition">
              {teacher.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 my-1">
              <span className="text-[10px] font-bold text-[#005BAC] bg-blue-50 px-2 py-0.5 rounded-md">
                {teacher.academicStanding || 'ครู'}
              </span>
              {teacher.position && (
                <span className="text-[10px] font-semibold text-slate-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                  สายชั้น {teacher.position}
                </span>
              )}
            </div>
            <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200">
              {teacher.subjectName || 'กลุ่มสาระการเรียนรู้'}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-5">
          {teacher.bio || 'มุ่งมั่นพัฒนาการเรียนการสอนและสร้างสรรค์นวัตกรรมสื่อการเรียนรู้สำหรับนักเรียนโรงเรียนวัดบางโฉลงใน'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5 text-center">
          <div>
            <div className="text-lg font-bold text-[#005BAC] font-prompt">
              {realResourcesCount}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-center">
              <BookOpen className="w-3 h-3 mr-1 text-[#005BAC]" /> ผลงานสื่อการสอน
            </div>
          </div>
          <div className="border-l border-slate-200">
            <div className="text-lg font-bold text-[#005BAC] font-prompt">
              {realTotalDownloads.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-center">
              <Download className="w-3 h-3 mr-1 text-[#005BAC]" /> จำนวนดาวน์โหลดรวม
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="space-y-2">
        <button
          onClick={() => viewTeacherPublications(teacher)}
          className="w-full py-2.5 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
        >
          <span>ดูผลงานทั้งหมดของครู</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </button>

        <button
          onClick={() => setSelectedTeacher(teacher)}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
        >
          ดูโปรไฟล์และช่องทางติดต่อ
        </button>
      </div>

    </motion.div>
  );
};
