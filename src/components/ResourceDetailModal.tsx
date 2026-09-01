import React, { useState } from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import { QRCodeModal } from './QRCodeModal';
import { 
  X, 
  Download, 
  Eye, 
  Share2, 
  QrCode, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  Star, 
  FileText, 
  BookOpen, 
  CheckCircle,
  Building,
  Check
} from 'lucide-react';

export const ResourceDetailModal: React.FC = () => {
  const { 
    selectedResource, 
    setSelectedResource, 
    resources, 
    incrementDownloads,
    viewTeacherPublications,
    setSelectedTeacher,
    teachers
  } = useApp();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!selectedResource) return null;

  const currentTeacher = teachers.find(t => t.id === selectedResource.teacherId);

  // Filter related resources (same category or grade)
  const relatedResources = resources.filter(
    r => r.id !== selectedResource.id && 
    (r.categoryId === selectedResource.categoryId || r.gradeLevel === selectedResource.gradeLevel)
  ).slice(0, 3);

  const handleDownload = () => {
    incrementDownloads(selectedResource.id);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);

    // Trigger browser download simulation
    if (selectedResource.fileUrl.startsWith('http')) {
      window.open(selectedResource.fileUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = selectedResource.fileUrl || '#';
      link.download = `${selectedResource.title}.${selectedResource.fileType.toLowerCase()}`;
      link.click();
    }
  };

  const handleShare = () => {
    const pageUrl = window.location.href;
    navigator.clipboard.writeText(pageUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const currentShareUrl = window.location.href;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 my-auto relative">
          
          {/* Close Floating Button */}
          <button
            onClick={() => setSelectedResource(null)}
            className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-md backdrop-blur-md transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Large Cover Hero */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={selectedResource.cover || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
              alt={selectedResource.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Overlaid Badges */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              <span 
                className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-md"
                style={{ backgroundColor: selectedResource.categoryColor || '#005BAC' }}
              >
                {selectedResource.categoryName}
              </span>
              <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                ระดับชั้น {selectedResource.gradeLevel}
              </span>
              <span className="bg-[#FFD54F] text-[#003875] text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                ประเภท {selectedResource.fileType}
              </span>
            </div>

            {/* Overlaid Title on Cover */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="font-prompt text-xl sm:text-3xl font-extrabold leading-tight text-white mb-2 drop-shadow-md">
                {selectedResource.title}
              </h2>
              <div className="flex items-center space-x-4 text-xs text-slate-200">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-[#FFD54F]" />
                  อัปโหลดเมื่อ {selectedResource.createdAt}
                </span>
                <span className="flex items-center">
                  <Download className="w-3.5 h-3.5 mr-1 text-[#FFD54F]" />
                  ดาวน์โหลด {selectedResource.downloads} ครั้ง
                </span>
                <span className="flex items-center">
                  <Eye className="w-3.5 h-3.5 mr-1 text-[#FFD54F]" />
                  เข้าชม {selectedResource.views} ครั้ง
                </span>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Primary Action Button Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <button
                onClick={handleDownload}
                className="flex-1 min-w-[180px] bg-[#005BAC] hover:bg-[#004584] text-white py-3 px-5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-[#FFD54F]" />
                    <span>กำลังดาวน์โหลดไฟล์...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>ดาวน์โหลดสื่อ ({selectedResource.fileSize || 'ไฟล์สื่อ'})</span>
                  </>
                )}
              </button>

              <a
                href={selectedResource.previewUrl || selectedResource.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 py-3 px-4 rounded-xl font-bold text-sm transition flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4 text-[#005BAC]" />
                <span>ดูไฟล์ออนไลน์</span>
              </a>

              <button
                onClick={() => setIsQrOpen(true)}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 py-3 px-3.5 rounded-xl font-bold text-sm transition flex items-center space-x-1.5"
                title="สร้าง QR Code"
              >
                <QrCode className="w-4 h-4 text-[#005BAC]" />
                <span className="hidden sm:inline">QR Code</span>
              </button>

              <button
                onClick={handleShare}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 py-3 px-3.5 rounded-xl font-bold text-sm transition flex items-center space-x-1.5"
                title="แชร์สื่อนี้"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#005BAC]" />}
                <span>{copiedShare ? 'คัดลอกลิงก์แล้ว' : 'แชร์'}</span>
              </button>
            </div>

            {/* Description & Metadata Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Description & Tags */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 font-prompt border-l-4 border-[#005BAC] pl-3">
                    รายละเอียดสื่อการสอน
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {selectedResource.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับสื่อการสอนนี้'}
                  </p>
                </div>

                {/* Tags */}
                {selectedResource.tags && selectedResource.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                      <Tag className="w-3.5 h-3.5 mr-1" /> คำค้นหา / แท็ก
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedResource.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="bg-blue-50 text-[#005BAC] border border-blue-100 text-xs px-3 py-1 rounded-lg font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Author Teacher Info Box */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    ครูผู้จัดทำสื่อ
                  </h4>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={selectedResource.teacherPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop'}
                      alt={selectedResource.teacherName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {selectedResource.teacherName || 'ครูผู้สอน'}
                      </h5>
                      <p className="text-xs text-[#005BAC] font-medium">
                        {selectedResource.teacherPosition || 'ครูประจำการ'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 line-clamp-3">
                    {currentTeacher?.bio || 'มุ่งมั่นสร้างสรรค์สื่อการเรียนรู้ที่มีคุณภาพเพื่อนักเรียนโรงเรียนวัดบางโฉลงใน'}
                  </p>

                  <button
                    onClick={() => {
                      if (currentTeacher) {
                        viewTeacherPublications(currentTeacher);
                        setSelectedResource(null);
                      }
                    }}
                    className="w-full py-2 bg-white hover:bg-slate-100 text-[#005BAC] border border-slate-300 rounded-xl text-xs font-bold transition text-center block"
                  >
                    ดูผลงานทั้งหมดของครูท่านนี้
                  </button>
                </div>
              </div>

            </div>

            {/* Related Media Section */}
            {relatedResources.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4 font-prompt">
                  สื่อการสอนที่เกี่ยวข้อง
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedResources.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedResource(rel)}
                      className="bg-slate-50 hover:bg-white rounded-xl p-3 border border-slate-200/80 hover:border-[#005BAC] cursor-pointer transition shadow-2xs group flex space-x-3 items-center"
                    >
                      <img
                        src={rel.cover}
                        alt={rel.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#005BAC] block">
                          {rel.gradeLevel}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#005BAC]">
                          {rel.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {rel.fileType} • {rel.downloads} ดาวน์โหลด
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* QR Code Generator Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentShareUrl}
        title={selectedResource.title}
      />
    </>
  );
};
