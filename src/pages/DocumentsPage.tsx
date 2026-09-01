import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, CheckCircle, FileSpreadsheet } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { documents } = useApp();

  const handleDownloadDoc = (docUrl: string) => {
    window.open(docUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="bg-[#005BAC] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-1 rounded-full inline-block">
            เอกสารแบบฟอร์มวิชาการ
          </span>
          <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-white">
            ดาวน์โหลดเอกสารสำหรับครู
          </h1>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">
            ดาวน์โหลดแบบฟอร์มแผนการจัดการเรียนรู้ แบบฟอร์ม SAR วิจัยในชั้นเรียน และเอกสารงานบริหารวิชาการ โรงเรียนวัดบางโฉลงใน
          </p>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005BAC] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-prompt">
                    {doc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                      {doc.category}
                    </span>
                    <span>{doc.fileType}</span>
                    <span>• {doc.fileSize}</span>
                    <span>• อัปเดต {doc.updatedAt}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadDoc(doc.fileUrl)}
                className="bg-[#005BAC] hover:bg-[#004584] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดเอกสาร</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
