import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Smartphone, 
  X, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  ExternalLink,
  QrCode,
  Layers,
  Zap,
  Globe,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export const PWAInstallModal: React.FC = () => {
  const { isPWAInstallModalOpen, setIsPWAInstallModalOpen } = useApp();
  const { isInstallable, isInstalled, isIOS, isAndroid, triggerInstall } = usePWAInstall();

  // Tab: 'auto' | 'ios' | 'android' | 'qrcode'
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'qrcode'>(
    isIOS ? 'ios' : 'android'
  );
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isPWAInstallModalOpen) return null;

  const handleNativeInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setIsPWAInstallModalOpen(false);
        setInstallSuccess(false);
      }, 2500);
    }
  };

  const copyAppUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#003875] via-[#005BAC] to-[#002852] text-white p-6 relative">
          <button
            onClick={() => setIsPWAInstallModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-lg border border-amber-300 flex-shrink-0 flex items-center justify-center">
              <img 
                src="/icons/icon.svg" 
                alt="App Icon" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-[#FFD54F]/20 text-[#FFD54F] px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#FFD54F]/30 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Web App / PWA Official</span>
              </div>
              <h2 className="text-xl font-bold font-prompt text-white">
                ติดตั้งแอปพลิเคชันบนมือถือ
              </h2>
              <p className="text-xs text-blue-100">
                โรงเรียนวัดบางโฉลงใน • สพป.สมุทรปราการ เขต 2
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner if installed */}
        {installSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1 animate-bounce" />
            <div className="font-bold text-emerald-800 text-sm">ติดตั้งสำเร็จเรียบร้อย!</div>
            <div className="text-xs text-emerald-600">ท่านสามารถเปิดแอปได้จากหน้าจอโฮมของโทรศัพท์มือถือ</div>
          </div>
        )}

        {/* Standalone already active banner */}
        {isInstalled && (
          <div className="bg-blue-50 border-b border-blue-200 p-3 px-6 flex items-center justify-between text-xs text-blue-800">
            <span className="flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>ขณะนี้กำลังใช้งานในโหมดแอปพลิเคชัน (WebApp Mode)</span>
            </span>
            <span className="bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold">
              พร้อมใช้งาน
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Quick Native Install Button for Supported Browsers (Chrome / Android / Desktop) */}
          {isInstallable && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2.5">
              <div className="text-xs text-amber-900 font-bold flex items-center justify-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>อุปกรณ์ของคุณรองรับการติดตั้งแบบ 1-คลิก</span>
              </div>
              <button
                onClick={handleNativeInstall}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#003875] to-[#005BAC] hover:from-[#002b5c] hover:to-[#004a8f] text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 text-sm transition transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5 text-[#FFD54F]" />
                <span>คลิกเพื่อติดตั้งแอปทันที (Install App)</span>
              </button>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedPlatform('ios')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                selectedPlatform === 'ios'
                  ? 'bg-white text-[#003875] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🍎 iPhone / iPad (iOS)</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('android')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                selectedPlatform === 'android'
                  ? 'bg-white text-[#003875] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🤖 Android / Samsung</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('qrcode')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                selectedPlatform === 'qrcode'
                  ? 'bg-white text-[#003875] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>สแกน QR Code</span>
            </button>
          </div>

          {/* Tab 1: iOS Instructions */}
          {selectedPlatform === 'ios' && (
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                💡 สำหรับ iPhone หรือ iPad แนะนำให้เปิดผ่านเบราว์เซอร์ <strong>Safari</strong> เพื่อติดตั้งได้สมบูรณ์ที่สุด
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#003875] font-extrabold flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      แตะปุ่ม "แชร์" (Share) ที่แถบด้านล่างของ Safari
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                      <span>มองหาไอคอนรูปสี่เหลี่ยมลูกศรชี้ขึ้น</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 font-mono">
                        <Share2 className="w-3 h-3 mr-0.5" /> แชร์
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#003875] font-extrabold flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      เลื่อนลงมาแล้วเลือก "เพิ่มไปยังหน้าจอโฮม"
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                      <span>เลือกตัวเลือก</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-300 font-medium">
                        <PlusSquare className="w-3 h-3 mr-0.5 text-blue-600" /> เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#003875] font-extrabold flex items-center justify-center shrink-0 text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      แตะ "เพิ่ม" (Add) ที่มุมบนขวา
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      ไอคอนแอปโรงเรียนวัดบางโฉลงใน จะปรากฏบนหน้าจอโฮม พร้อมเปิดใช้งานแบบ Fullscreen ได้ทันที
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Android Instructions */}
          {selectedPlatform === 'android' && (
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                💡 สำหรับอุปกรณ์ Android (Samsung, Xiaomi, Oppo, Vivo ฯลฯ) แนะนำให้เปิดผ่าน <strong>Google Chrome</strong> หรือ <strong>Samsung Internet</strong>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      แตะปุ่มจุดสามจุด (⋮) ที่มุมบนขวาของ Chrome
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      หรือสังเกตแถบแจ้งเตือน "ติดตั้งแอป" ที่ด้านล่างของหน้าจอ
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      เลือก "ติดตั้งแอป" หรือ "เพิ่มลงในหน้าจอหลัก"
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      (Install app / Add to Home screen)
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-sm">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      แตะ "ติดตั้ง" (Install) เพื่อยืนยัน
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      ระบบจะสร้างไอคอนแอปบนหน้าจอมือถือ สามารถเปิดใช้งานได้รวดเร็วทันใจ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: QR Code for other devices */}
          {selectedPlatform === 'qrcode' && (
            <div className="text-center space-y-3 py-2">
              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-200 inline-block shadow-sm">
                {/* SVG QR Code representation */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    window.location.origin
                  )}`}
                  alt="PWA QR Code"
                  className="w-40 h-40 object-contain mx-auto rounded-lg"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-slate-600">
                ใช้กล้องโทรศัพท์มือถือ หรือ LINE สแกน QR Code นี้เพื่อเปิดและติดตั้งแอปบนสมาร์ตโฟน
              </p>
              
              <div className="pt-1">
                <button
                  onClick={copyAppUrl}
                  className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition border border-slate-300"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">คัดลอกลิงก์สำเร็จแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>คัดลอกลิงก์สำหรับส่งต่อให้คณะครูและนักเรียน</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Key Advantages Bento Box */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              จุดเด่นของการติดตั้งแอป WebApp
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center space-x-2">
                <span className="text-amber-500 font-bold">⚡</span>
                <span>เปิดทันที ไม่ต้องพิมพ์ URL</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center space-x-2">
                <span className="text-blue-500 font-bold">📱</span>
                <span>เต็มจอเสมือนแอปแท้ 100%</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✨</span>
                <span>ใช้งาน AI แผนการสอนได้ทุกที่</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center space-x-2">
                <span className="text-purple-500 font-bold">🔒</span>
                <span>ปลอดภัย ประหยัดพื้นที่ในเครื่อง</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            เวอร์ชัน 1.2.0 • รองรับ iOS 14+ และ Android 8.0+
          </div>
          <button
            onClick={() => setIsPWAInstallModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
