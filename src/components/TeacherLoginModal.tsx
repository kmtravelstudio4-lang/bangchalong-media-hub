import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Lock, X, AlertCircle, Sparkles, Key, CheckCircle2, Filter, Search, Award, ShieldCheck, GraduationCap } from 'lucide-react';
import { getTeacherAcademicCategory, STANDARD_ACADEMIC_CATEGORIES, isTeacherDeputyDirector } from '../data/mockData';

const ACADEMIC_STANDINGS_LIST = [
  { id: 'all', name: 'ทุกวิทยฐานะ (แสดงทั้งหมด)' },
  ...STANDARD_ACADEMIC_CATEGORIES.map(cat => ({ id: cat, name: cat }))
];

export const TeacherLoginModal: React.FC = () => {
  const { 
    isTeacherLoginOpen, 
    setIsTeacherLoginOpen, 
    teachers, 
    loginTeacher,
    setIsTeacherProfileOpen,
    setActiveTab
  } = useApp();

  const [roleType, setRoleType] = useState<'teacher' | 'deputy'>('teacher');
  const [selectedStanding, setSelectedStanding] = useState<string>('all');
  const [teacherSearchFilter, setTeacherSearchFilter] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // List of Deputy Directors (รองผู้อำนวยการ 2 ท่าน)
  const deputyDirectors = useMemo(() => {
    return teachers.filter(t => isTeacherDeputyDirector(t));
  }, [teachers]);

  // Handle switching role tabs
  const handleSwitchRole = (type: 'teacher' | 'deputy') => {
    setRoleType(type);
    setErrorMsg(null);
    setSuccessMsg(null);
    setTeacherSearchFilter('');
    if (type === 'deputy') {
      setSelectedStanding('รองผู้อำนวยการ');
      if (deputyDirectors.length > 0) {
        setSelectedTeacherId(deputyDirectors[0].id);
        setPasswordInput(deputyDirectors[0].password || '123456');
      }
    } else {
      setSelectedStanding('all');
      setSelectedTeacherId('');
      setPasswordInput('123456');
    }
  };

  // Filter teachers based on chosen role, academic standing and quick search
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const isDeputy = isTeacherDeputyDirector(t);

      // Role type filter
      if (roleType === 'deputy' && !isDeputy) return false;
      if (roleType === 'teacher' && isDeputy) return false;

      // Standing match
      if (selectedStanding !== 'all') {
        const teacherCat = getTeacherAcademicCategory(t);
        if (teacherCat !== selectedStanding) {
          return false;
        }
      }

      // Search text match
      if (teacherSearchFilter.trim()) {
        const q = teacherSearchFilter.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchPos = (t.position || '').toLowerCase().includes(q);
        const matchStanding = (t.academicStanding || '').toLowerCase().includes(q);
        if (!matchName && !matchPos && !matchStanding) return false;
      }
      return true;
    });
  }, [teachers, roleType, selectedStanding, teacherSearchFilter]);

  if (!isTeacherLoginOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedTeacherId) {
      setErrorMsg(roleType === 'deputy' ? 'กรุณาเลือกรองผู้อำนวยการผู้ใช้งาน' : 'กรุณาเลือกชื่อคุณครูผู้ใช้งาน');
      return;
    }

    const teacherObj = teachers.find(t => t.id === selectedTeacherId);
    const identifier = teacherObj ? teacherObj.id : selectedTeacherId;

    const result = loginTeacher(identifier, passwordInput);

    if (result.success) {
      setSuccessMsg(result.message || 'เข้าสู่ระบบสำเร็จ');
      setTimeout(() => {
        setIsTeacherLoginOpen(false);
        setActiveTab('teacher-dashboard');
      }, 500);
    } else {
      setErrorMsg(result.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const isSelectedDeputy = isTeacherDeputyDirector(selectedTeacher);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative text-slate-800 space-y-5 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#005BAC] to-[#003875] text-[#FFD54F] flex items-center justify-center shadow-md shrink-0 font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-prompt font-extrabold text-slate-900 text-lg">
                เข้าสู่ระบบครูและฝ่ายบริหาร
              </h3>
              <p className="text-xs text-slate-500">
                โรงเรียนวัดบางโฉลงใน • จัดการข้อมูลส่วนตัวและข้อตกลง PA
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTeacherLoginOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleSwitchRole('teacher')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              roleType === 'teacher'
                ? 'bg-white text-[#005BAC] shadow-sm border border-blue-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>คุณครูผู้สอน ({teachers.filter(t => !isTeacherDeputyDirector(t)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchRole('deputy')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              roleType === 'deputy'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>รองผู้อำนวยการ ({deputyDirectors.length} ท่าน)</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Deputy Director Quick Selection Cards */}
        {roleType === 'deputy' ? (
          <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
            <label className="block font-bold text-xs text-amber-900 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>1. เลือกรองผู้อำนวยการผู้ใช้งาน *</span>
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full font-bold">
                ฝ่ายบริหารสถานศึกษา
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {deputyDirectors.map((deputy) => {
                const isSelected = selectedTeacherId === deputy.id;
                return (
                  <div
                    key={deputy.id}
                    onClick={() => {
                      setSelectedTeacherId(deputy.id);
                      setPasswordInput(deputy.password || '123456');
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-white border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                        : 'bg-white/80 border-amber-200 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <img
                      src={deputy.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200'}
                      alt={deputy.name}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {deputy.name}
                      </h4>
                      <p className="text-[10px] text-amber-800 font-bold truncate">
                        ตำแหน่ง {deputy.position || 'รองผู้อำนวยการโรงเรียน'}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        {deputy.academicStanding}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Regular Teacher Selection (Filter + Dropdown) */
          <div className="space-y-4">
            {/* Step 1: Select Academic Standing (วิทยฐานะ) */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1.5">
              <label className="block font-bold text-xs text-[#003875] flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Filter className="w-3.5 h-3.5 text-[#005BAC]" />
                  <span>1. เลือกวิทยฐานะของคุณครู *</span>
                </span>
                <span className="text-[10px] text-blue-600 font-normal">
                  (กรองรายชื่อครู)
                </span>
              </label>
              <select
                value={selectedStanding}
                onChange={(e) => {
                  const newStanding = e.target.value;
                  setSelectedStanding(newStanding);
                  setSelectedTeacherId(''); // Reset selected teacher on standing change
                }}
                className="w-full bg-white border border-blue-200 rounded-xl py-2.5 px-3 text-xs font-bold text-[#005BAC] focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
              >
                {ACADEMIC_STANDINGS_LIST.filter(s => !s.id.includes('รองผู้อำนวยการ')).map((standing) => {
                  const count = standing.id === 'all' 
                    ? teachers.filter(t => !isTeacherDeputyDirector(t)).length 
                    : teachers.filter(t => !isTeacherDeputyDirector(t) && getTeacherAcademicCategory(t) === standing.id).length;
                  return (
                    <option key={standing.id} value={standing.id}>
                      {standing.name} {count > 0 ? `(${count} ท่าน)` : '(0 ท่าน)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Step 2: Select Teacher Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-xs text-slate-700">
                  2. เลือกชื่อคุณครูผู้ใช้งาน *
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  พบ {filteredTeachers.length} ท่าน
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-1.5">
                <input
                  type="text"
                  placeholder="พิมพ์ค้นหาชื่อครู หรือสายชั้น..."
                  value={teacherSearchFilter}
                  onChange={(e) => setTeacherSearchFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-8 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                {teacherSearchFilter && (
                  <button
                    type="button"
                    onClick={() => setTeacherSearchFilter('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
                    title="ล้างข้อความค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                required
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(e.target.value);
                  const t = teachers.find(item => item.id === e.target.value);
                  if (t && t.password) {
                    setPasswordInput(t.password);
                  } else {
                    setPasswordInput('123456');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
              >
                <option value="">-- กรุณาเลือกรายชื่อครู ({filteredTeachers.length} ท่าน) --</option>
                {filteredTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.academicStanding || 'ครู'}{t.position ? ` (${isTeacherDeputyDirector(t) ? 'ตำแหน่ง ' : 'สายชั้น '}${t.position})` : ''}
                  </option>
                ))}
              </select>

              {filteredTeachers.length === 0 && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span>ไม่พบรายชื่อครูที่ตรงกับการค้นหา</span>
                  {teacherSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setTeacherSearchFilter('')}
                      className="text-xs font-bold text-amber-900 underline hover:text-amber-950 ml-2"
                    >
                      ล้างการค้นหา
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Input & Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-xs text-slate-700 mb-1.5">
              {roleType === 'deputy' ? '2. รหัสผ่านลับ (Password) *' : '3. รหัสผ่าน (Password) *'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่าน (เริ่มต้นคือ 123456)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/80 p-2 rounded-xl mt-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>รหัสผ่านเริ่มต้นสำหรับผู้ใช้งานคือ <strong>123456</strong> (สามารถเปลี่ยนได้หลังเข้าสู่ระบบ)</span>
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!selectedTeacherId}
              className={`w-full text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelectedDeputy
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                  : 'bg-[#005BAC] hover:bg-[#004584]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSelectedDeputy 
                  ? `เข้าสู่ระบบโปรไฟล์: ${selectedTeacher?.name || 'รองผู้อำนวยการ'}`
                  : 'เข้าสู่ระบบจัดการโปรไฟล์ครู'}
              </span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          หากลืมรหัสผ่านหรือไม่มีรายชื่อในระบบ กรุณาติดต่อแอดมินโรงเรียน
        </div>

      </div>
    </div>
  );
};

