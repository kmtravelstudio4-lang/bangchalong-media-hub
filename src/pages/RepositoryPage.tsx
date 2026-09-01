import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCard } from '../components/ResourceCard';
import { GradeLevel, FileType } from '../types';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Grid, 
  List, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Eye,
  FileText,
  Check
} from 'lucide-react';

export const RepositoryPage: React.FC = () => {
  const { 
    approvedResources, 
    teachers, 
    categories,
    searchQuery, 
    setSearchQuery,
    categoryFilter, 
    setCategoryFilter,
    gradeFilter, 
    setGradeFilter,
    fileTypeFilter, 
    setFileTypeFilter,
    teacherFilter, 
    setTeacherFilter,
    sortBy, 
    setSortBy,
    resetFilters,
    setSelectedResource,
    incrementViews
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter and Sort Logic
  const filteredResources = useMemo(() => {
    return approvedResources.filter((res) => {
      // Search term
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesDesc = res.description.toLowerCase().includes(query);
        const matchesTeacher = (res.teacherName || '').toLowerCase().includes(query);
        const matchesTags = res.tags && res.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTeacher && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && res.categoryId !== categoryFilter) {
        return false;
      }

      // Grade filter
      if (gradeFilter !== 'all' && res.gradeLevel !== gradeFilter) {
        return false;
      }

      // File type filter
      if (fileTypeFilter !== 'all' && res.fileType !== fileTypeFilter) {
        return false;
      }

      // Teacher filter
      if (teacherFilter !== 'all') {
        const teacherObj = teachers.find(t => t.id === teacherFilter);
        const matchesId = res.teacherId === teacherFilter;
        const tName = String(teacherObj?.name || '').trim().toLowerCase();
        const rName = String(res.teacherName || '').trim().toLowerCase();
        const matchesName = Boolean(tName && rName && (
          rName === tName ||
          rName.includes(tName) ||
          tName.includes(rName)
        ));
        if (!matchesId && !matchesName) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'downloads') {
        return (b.downloads || 0) - (a.downloads || 0);
      } else if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'th');
      }
      return 0;
    });
  }, [approvedResources, searchQuery, categoryFilter, gradeFilter, fileTypeFilter, teacherFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage) || 1;
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage, itemsPerPage]);

  const activeFiltersCount = [
    categoryFilter !== 'all',
    gradeFilter !== 'all',
    fileTypeFilter !== 'all',
    teacherFilter !== 'all',
    searchQuery !== ''
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="bg-[#005BAC] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <BookOpen className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="bg-[#FFD54F] text-[#003875] text-xs font-bold px-3 py-1 rounded-full inline-block">
            ศูนย์รวมสื่อการเรียนรู้แบบดิจิทัล
          </span>
          <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-white">
            คลังสื่อการสอนทั้งหมด
          </h1>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">
            ค้นหาและดาวน์โหลดสื่อการเรียนรู้ แผนการสอน ใบงาน และนวัตกรรมจากคณะครูโรงเรียนวัดบางโฉลงใน
          </p>
        </div>
      </div>

      {/* Main Filter Control Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
        
        {/* Top Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="ค้นหาชื่อสื่อการสอน, คำสำคัญ, ชื่อครูผู้สอน..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 text-slate-800 text-sm border border-slate-300 rounded-xl py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-[#005BAC] focus:bg-white transition"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200 px-2 py-0.5 rounded-full"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Multi-Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          
          {/* Filter 1: Subject Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              กลุ่มสาระการเรียนรู้
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Grade Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ระดับชั้น
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ทุกระดับชั้น</option>
              <option value="-">- (ไม่ระบุ / สื่อทั่วไป)</option>
              <option value="อนุบาล">อนุบาล</option>
              <option value="อนุบาล 1">อนุบาล 1 (อ.1)</option>
              <option value="อนุบาล 2">อนุบาล 2 (อ.2)</option>
              <option value="อนุบาล 3">อนุบาล 3 (อ.3)</option>
              <option value="ป.1">ประถมศึกษาปีที่ 1 (ป.1)</option>
              <option value="ป.2">ประถมศึกษาปีที่ 2 (ป.2)</option>
              <option value="ป.3">ประถมศึกษาปีที่ 3 (ป.3)</option>
              <option value="ป.4">ประถมศึกษาปีที่ 4 (ป.4)</option>
              <option value="ป.5">ประถมศึกษาปีที่ 5 (ป.5)</option>
              <option value="ป.6">ประถมศึกษาปีที่ 6 (ป.6)</option>
              <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
              <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
              <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
              <option value="ทุกระดับชั้น">ทุกระดับชั้น</option>
            </select>
          </div>

          {/* Filter 3: File Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ประเภทไฟล์
            </label>
            <select
              value={fileTypeFilter}
              onChange={(e) => {
                setFileTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ทุกประเภทไฟล์</option>
              <option value="PDF">PDF</option>
              <option value="PowerPoint">PowerPoint (.ppt)</option>
              <option value="Word">Word (.doc)</option>
              <option value="ZIP">ZIP File</option>
              <option value="Video">วิดีโอ (Video)</option>
              <option value="Canva Link">Canva Presentation</option>
              <option value="Google Drive Link">Google Drive Folder</option>
            </select>
          </div>

          {/* Filter 4: Author Teacher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ครูผู้จัดทำ
            </label>
            <select
              value={teacherFilter}
              onChange={(e) => {
                setTeacherFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#005BAC]"
            >
              <option value="all">ครูทุกท่าน</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.position})</option>
              ))}
            </select>
          </div>

        </div>

        {/* Sort & Reset Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-700">เรียงลำดับตาม:</span>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  sortBy === 'latest' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ล่าสุด
              </button>
              <button
                onClick={() => setSortBy('downloads')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  sortBy === 'downloads' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ดาวน์โหลดมากสุด
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  sortBy === 'title' ? 'bg-[#005BAC] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ก-ฮ (A-Z)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตตัวกรอง ({activeFiltersCount})</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white text-[#005BAC] shadow-xs' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white text-[#005BAC] shadow-xs' : 'text-slate-500'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Results Header Info */}
      <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
        <div>
          พบสื่อการสอน <span className="font-bold text-slate-900">{filteredResources.length}</span> รายการ
        </div>
        <div>
          หน้า {currentPage} จาก {totalPages}
        </div>
      </div>

      {/* Media Cards Results */}
      {paginatedResources.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedResources.map((res, i) => (
              <ResourceCard key={res.id} resource={res} index={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedResources.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  incrementViews(res.id);
                  setSelectedResource(res);
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-[#005BAC] cursor-pointer transition flex flex-col sm:flex-row items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <img 
                    src={res.cover || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} 
                    alt={res.title} 
                    className="w-20 h-20 rounded-xl object-cover shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: res.categoryColor || '#005BAC' }}>
                        {res.categoryName}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {res.gradeLevel}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {res.fileType}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#005BAC] transition truncate">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      โดย {res.teacherName} • อัปโหลด {res.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs font-bold">
                  <div className="text-slate-600 flex items-center">
                    <Download className="w-3.5 h-3.5 mr-1 text-[#005BAC]" />
                    {res.downloads} ดาวน์โหลด
                  </div>
                  <button className="bg-[#005BAC] text-white px-4 py-2 rounded-xl text-xs font-bold">
                    ดูสื่อ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty Search State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-prompt font-bold text-slate-800 text-lg">
            ไม่พบสื่อการสอนตามเงื่อนไขที่ระบุ
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดรีเซ็ตตัวกรองเพื่อเรียกดูสื่อทั้งหมดในระบบ
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 bg-[#005BAC] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
          >
            แสดงสื่อการสอนทั้งหมด
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl font-bold text-xs transition ${
                currentPage === page ? 'bg-[#005BAC] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
};
