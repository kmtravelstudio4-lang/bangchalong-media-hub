import React from 'react';
import { Resource } from '../types';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Download, 
  Eye, 
  FileText, 
  Video, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  Star,
  FileSpreadsheet,
  FileCode,
  FolderArchive,
  Presentation
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  index?: number;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, index = 0 }) => {
  const { setSelectedResource, incrementViews } = useApp();

  const handleCardClick = () => {
    incrementViews(resource.id);
    setSelectedResource(resource);
  };

  const getFileTypeBadge = (type: string) => {
    switch (type) {
      case 'PDF':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><FileText className="w-3 h-3 mr-1" /> PDF</span>;
      case 'PowerPoint':
        return <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><Presentation className="w-3 h-3 mr-1" /> PPT</span>;
      case 'Word':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><FileSpreadsheet className="w-3 h-3 mr-1" /> Word</span>;
      case 'Video':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><Video className="w-3 h-3 mr-1" /> วิดีโอ</span>;
      case 'Canva Link':
        return <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><ExternalLink className="w-3 h-3 mr-1" /> Canva</span>;
      case 'Google Drive Link':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><ExternalLink className="w-3 h-3 mr-1" /> Drive</span>;
      default:
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center space-x-1"><FolderArchive className="w-3 h-3 mr-1" /> {type}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleCardClick}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={resource.cover || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span 
            className="text-xs font-bold text-white px-2.5 py-1 rounded-full shadow-md backdrop-blur-md"
            style={{ backgroundColor: resource.categoryColor || '#005BAC' }}
          >
            {resource.categoryName}
          </span>
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {resource.gradeLevel}
          </span>
        </div>

        {/* File Type Badge on Bottom Left of Image */}
        <div className="absolute bottom-3 left-3">
          {getFileTypeBadge(resource.fileType)}
        </div>

        {resource.featured && (
          <div className="absolute bottom-3 right-3 bg-[#FFD54F] text-[#003875] text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center shadow-md">
            <Star className="w-3 h-3 mr-1 fill-current" /> แนะนำ
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-prompt font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-[#005BAC] transition-colors mb-2">
            {resource.title}
          </h3>

          {/* Description snippet */}
          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
            {resource.description}
          </p>
        </div>

        <div>
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <img
                src={resource.teacherPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop'}
                alt={resource.teacherName}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <span className="font-medium text-slate-700 truncate text-xs">
                {resource.teacherName || 'ครูโรงเรียนวัดบางโฉลงใน'}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-500 text-[11px] shrink-0">
              <span className="flex items-center text-slate-600 font-semibold">
                <Download className="w-3 h-3 mr-1 text-[#005BAC]" />
                {resource.downloads || 0}
              </span>
              <span className="flex items-center text-slate-400">
                <Eye className="w-3 h-3 mr-1" />
                {resource.views || 0}
              </span>
            </div>
          </div>

          {/* Button */}
          <button 
            className="w-full mt-4 py-2.5 bg-slate-50 group-hover:bg-[#005BAC] text-slate-700 group-hover:text-white rounded-xl text-xs font-bold transition duration-200 flex items-center justify-center space-x-1 border border-slate-200/80 group-hover:border-[#005BAC]"
          >
            <span>ดูรายละเอียดสื่อ</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </button>

        </div>
      </div>
    </motion.div>
  );
};
