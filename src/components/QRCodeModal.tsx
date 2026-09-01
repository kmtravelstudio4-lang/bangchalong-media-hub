import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Download, Share2 } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick SVG QR code visual mock generator
  const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&color=005BAC`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#005BAC] flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="font-prompt font-bold text-slate-900 text-lg mb-1">
          สแกน QR Code เพื่อเข้าถึงสื่อ
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-5 px-2">
          {title}
        </p>

        {/* QR Code Frame */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner mb-4">
          <img
            src={qrCodeDataUrl}
            alt="QR Code"
            className="w-48 h-48 mx-auto rounded-lg shadow-xs"
          />
        </div>

        <p className="text-[11px] text-slate-400 mb-4">
          สแกนด้วยกล้องมือถือหรือแอปพลิเคชัน LINE เพื่อเปิดสื่อการสอนนี้บนสมาร์ตโฟน
        </p>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition flex items-center justify-center space-x-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}</span>
          </button>

          <a
            href={qrCodeDataUrl}
            download="qrcode-media.png"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-4 bg-[#005BAC] hover:bg-[#004584] text-white rounded-xl font-semibold text-xs transition flex items-center space-x-1"
          >
            <Download className="w-4 h-4 mr-1" />
            <span>บันทึก QR</span>
          </a>
        </div>

      </div>
    </div>
  );
};
