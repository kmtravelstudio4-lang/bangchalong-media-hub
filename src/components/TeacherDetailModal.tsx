import React from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCard } from './ResourceCard';
import { X, Mail, Facebook, BookOpen, Download, Award, UserCheck, Calendar, Folder } from 'lucide-react';

export const TeacherDetailModal: React.FC = () => {
  const { 
    selectedTeacher, 
    setSelectedTeacher, 
    approvedResources, 
    viewTeacherPublications 
  } = useApp();

  if (!selectedTeacher) return null;

  const teacherResources = approvedResources.filter(r => r.teacherId === selectedTeacher.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 my-auto relative p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedTeacher(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Teacher Profile Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-200 text-center sm:text-left">
          <img
            src={selectedTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'}
            alt={selectedTeacher.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-100 shadow-md shrink-0"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-0.5 rounded-full">
                {selectedTeacher.academicStanding || selectedTeacher.position}
              </span>
              {selectedTeacher.position && selectedTeacher.position !== selectedTeacher.academicStanding && (
                <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                  {selectedTeacher.position}
                </span>
              )}
            </div>

            <h2 className="font-prompt text-2xl sm:text-3xl font-extrabold text-slate-900">
              {selectedTeacher.name}
            </h2>
            <p className="text-sm font-semibold text-[#005BAC]">
              {selectedTeacher.subjectName || 'กลุ่มสาระการเรียนรู้'}
            </p>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {selectedTeacher.bio || 'มุ่งมั่นพัฒนาสื่อการเรียนการสอนและพัฒนางานตามข้อตกลง PA เพื่อประโยชน์สูงสุดแก่นักเรียนโรงเรียนวัดบางโฉลงใน'}
            </p>

            {/* PA Buttons & Contacts */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3 text-xs">
              {selectedTeacher.paVideoUrl && (
                <a
                  href={selectedTeacher.paVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>🎬 รับชมคลิปวิดีโอ PA</span>
                </a>
              )}

              {selectedTeacher.paDocumentUrl && (
                <a
                  href={selectedTeacher.paDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#005BAC] hover:bg-[#004584] text-white font-bold px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4 text-sky-200" />
                  <span>📄 เอกสารข้อตกลง PA</span>
                </a>
              )}

              {selectedTeacher.paFolderUrl && (
                <a
                  href={selectedTeacher.paFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                >
                  <Folder className="w-4 h-4 text-amber-200" />
                  <span>📁 โฟลเดอร์รวมไฟล์</span>
                </a>
              )}

              {selectedTeacher.email && (
                <a 
                  href={`mailto:${selectedTeacher.email}`}
                  className="flex items-center text-slate-600 hover:text-[#005BAC] transition px-2 py-1 rounded-lg hover:bg-slate-50"
                >
                  <Mail className="w-4 h-4 mr-1 text-[#005BAC]" />
                  <span>{selectedTeacher.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-prompt font-bold text-slate-900 text-lg flex items-center">
              <BookOpen className="w-5 h-5 text-[#005BAC] mr-2" />
              ผลงานและสื่อการสอนทั้งหมด ({teacherResources.length} รายการ)
            </h3>

            <button
              onClick={() => {
                viewTeacherPublications(selectedTeacher);
                setSelectedTeacher(null);
              }}
              className="text-xs font-bold text-[#005BAC] hover:underline"
            >
              ดูทั้งหมดในคลังสื่อ →
            </button>
          </div>

          {teacherResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherResources.map((res, i) => (
                <ResourceCard key={res.id} resource={res} index={i} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">ยังไม่มีสื่อการสอนที่อัปโหลดโดยครูท่านนี้</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
