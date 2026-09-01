import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Layers, ArrowRight } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const { categories, approvedResources, viewCategoryResources } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="bg-[#005BAC] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
          8 กลุ่มสาระการเรียนรู้
        </span>
        <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-slate-900">
          กลุ่มสาระการเรียนรู้ โรงเรียนวัดบางโฉลงใน
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          เลือกกลุ่มสาระการเรียนรู้เพื่อเรียกดูสื่อการสอน แผนการจัดการเรียนรู้ และใบงานกิจกรรมสำหรับนักเรียน
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const subjectResources = approvedResources.filter(r => r.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => viewCategoryResources(cat.id)}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-3"
                style={{ backgroundColor: cat.color }}
              />

              <div className="space-y-3 pt-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs" style={{ backgroundColor: cat.color }}>
                  <BookOpen className="w-6 h-6" />
                </div>

                <h3 className="font-prompt font-bold text-slate-900 text-lg group-hover:text-[#005BAC] transition">
                  {cat.name}
                </h3>

                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-slate-700">
                  {subjectResources.length} สื่อการสอน
                </span>
                <span className="text-xs font-bold text-[#005BAC] group-hover:translate-x-1 transition-transform flex items-center">
                  ดูสื่อทั้งหมด <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
