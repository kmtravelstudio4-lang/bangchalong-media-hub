import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ClipboardCheck, 
  Lock, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Users,
  Target,
  ChevronRight
} from 'lucide-react';
import { PaCommitteeMember } from '../types';

export const CommitteeLoginModal: React.FC = () => {
  const { 
    isCommitteeLoginOpen, 
    setIsCommitteeLoginOpen, 
    loginCommitteeMember,
    paCommitteeMembers,
    setActiveTab
  } = useApp();

  const [activeSetTab, setActiveSetTab] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<PaCommitteeMember | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter members by the selected set tab
  const setMembers = useMemo(() => {
    return paCommitteeMembers.filter(m => (m.setNumber || 1) === activeSetTab);
  }, [paCommitteeMembers, activeSetTab]);

  if (!isCommitteeLoginOpen) return null;

  const setDescriptions: Record<number, { title: string; target: string; color: string; badgeBg: string }> = {
    1: {
      title: 'ชุดที่ 1: ประเมินครูชำนาญการ / ชำนาญการพิเศษ',
      target: 'วิทยฐานะ: ครูชำนาญการ และ ครูชำนาญการพิเศษ เท่านั้น',
      color: 'border-blue-500 text-blue-600 bg-blue-50',
      badgeBg: 'bg-blue-600'
    },
    2: {
      title: 'ชุดที่ 2: ประเมินครู / ครูผู้ช่วย',
      target: 'วิทยฐานะ/ตำแหน่ง: ครู และ ครูผู้ช่วย',
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
      badgeBg: 'bg-emerald-600'
    },
    3: {
      title: 'ชุดที่ 3: ประเมินครูอัตราจ้าง และบุคลากร',
      target: 'ตำแหน่ง: ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ',
      color: 'border-purple-500 text-purple-600 bg-purple-50',
      badgeBg: 'bg-purple-600'
    }
  };

  const handleSelectMember = (member: PaCommitteeMember) => {
    setSelectedMember(member);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inputCode.trim()) {
      setErrorMsg('กรุณากรอกรหัสผ่านประจำตัวกรรมการ');
      return;
    }

    // Try login with code and preferred set number
    const codeToTry = selectedMember ? (selectedMember.code || inputCode) : inputCode;
    const res = loginCommitteeMember(inputCode, activeSetTab);
    
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      setInputCode('');
      setTimeout(() => {
        setIsCommitteeLoginOpen(false);
        setSuccessMsg('');
        setActiveTab('pa-committee');
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-prompt font-bold text-slate-900 text-base">
                เข้าสู่ระบบคณะกรรมการผู้ประเมิน ว.PA
              </h3>
              <p className="text-xs text-slate-500">
                โรงเรียนวัดบางโฉลงใน • แบ่งกรรมการ 3 ชุดตามกลุ่มเป้าหมาย
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCommitteeLoginOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Set Tabs Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600">
            เลือกชุดกรรมการที่ท่านสังกัด:
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            {[1, 2, 3].map((setNum) => (
              <button
                key={setNum}
                type="button"
                onClick={() => {
                  setActiveSetTab(setNum);
                  setSelectedMember(null);
                  setErrorMsg('');
                }}
                className={`py-2 px-1 text-xs font-bold rounded-xl transition flex flex-col items-center justify-center ${
                  activeSetTab === setNum
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>ชุดที่ {setNum}</span>
                <span className="text-[10px] font-normal text-slate-400 truncate max-w-full">
                  {setNum === 1 ? 'ชำนาญการ/พ.' : setNum === 2 ? 'ครู/ผู้ช่วย' : 'อัตราจ้าง/จนท.'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Set Target Info Banner */}
        <div className={`border rounded-2xl p-3 text-xs flex items-start space-x-2.5 ${setDescriptions[activeSetTab].color}`}>
          <Target className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{setDescriptions[activeSetTab].title}</span>
            <p className="text-[11px] mt-0.5 opacity-90">
              {setDescriptions[activeSetTab].target}
            </p>
          </div>
        </div>

        {/* Committee Members in Selected Set */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            คณะกรรมการชุดที่ {activeSetTab} (คลิกเลือกลำดับของท่าน):
          </span>
          <div className="space-y-2">
            {setMembers.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              return (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500' 
                      : 'border-slate-100 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img 
                      src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'} 
                      alt={member.name} 
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          ท่านที่ {member.order}
                        </span>
                        <h5 className="font-bold text-xs text-slate-800 truncate">
                          {member.name}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ เลือกแล้ว
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {selectedMember 
                ? `รหัสผ่านสำหรับ: ${selectedMember.name} (ท่านที่ ${selectedMember.order})`
                : `รหัสผ่านประจำตัวกรรมการ (ชุดที่ ${activeSetTab})`}
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="กรอกรหัสผ่านประจำตัวกรรมการ..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                autoFocus
                className="w-full bg-slate-50 text-sm border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>เข้าสู่ห้องตรวจประเมิน PA (ชุดที่ {activeSetTab})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
