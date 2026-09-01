import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginOpen, setIsAdminLoginOpen, loginAdmin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAdminLoginOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('กรุณากรอกชื่อผู้ใช้งานหรืออีเมล');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    const success = loginAdmin(email, password);
    if (success) {
      setError('');
      setEmail('');
      setPassword('');
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto">
        
        <button
          onClick={() => setIsAdminLoginOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#005BAC] text-[#FFD54F] flex items-center justify-center mx-auto shadow-md border-2 border-[#FFD54F]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-prompt text-2xl font-extrabold text-slate-900">
            ระบบบริหารจัดการ Admin
          </h2>
          <p className="text-xs text-slate-500">
            เข้าสู่ระบบผู้ดูแลระบบ คลังสื่อการสอน โรงเรียนวัดบางโฉลงใน
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่อผู้ใช้งาน / อีเมล (Username)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="nasdking123"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-4 h-4 mr-1" />
            <span>เข้าสู่ระบบ Admin</span>
          </button>
        </form>

      </div>
    </div>
  );
};
