import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Trash2, 
  RefreshCw, 
  Layers, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { compressImageFile, CompressionResult } from '../utils/imageCompressor';

// Curated educational cover presets for easy one-click selection
export const EDUCATIONAL_COVER_PRESETS = [
  {
    id: 'active-learning',
    title: 'Active Learning / นวัตกรรม',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
    tag: 'ทั่วไป'
  },
  {
    id: 'thai',
    title: 'ภาษาไทย / วรรณคดี',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop',
    tag: 'ภาษาไทย'
  },
  {
    id: 'math',
    title: 'คณิตศาสตร์ / การคิดคำนวณ',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    tag: 'คณิตศาสตร์'
  },
  {
    id: 'science',
    title: 'วิทยาศาสตร์และเทคโนโลยี',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
    tag: 'วิทยาศาสตร์'
  },
  {
    id: 'english',
    title: 'ภาษาต่างประเทศ / ภาษาอังกฤษ',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop',
    tag: 'ภาษาอังกฤษ'
  },
  {
    id: 'social',
    title: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
    tag: 'สังคมศึกษา'
  },
  {
    id: 'art',
    title: 'ศิลปะ ดนตรี และนาฏศิลป์',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop',
    tag: 'ศิลปะ'
  },
  {
    id: 'coding',
    title: 'คอมพิวเตอร์และวิทยาการคำนวณ',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    tag: 'เทคโนโลยี'
  }
];

interface ImageUploadCompressorProps {
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  label?: string;
  helpText?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const ImageUploadCompressor: React.FC<ImageUploadCompressorProps> = ({
  value,
  onChange,
  label = 'รูปภาพหน้าปกสื่อการสอน (Cover Image)',
  helpText = 'ระบบจะบีบอัดภาพอัตโนมัติให้เหลือเพียง 20-40 KB ประหยัดพื้นที่ฐานข้อมูลและโหลดรวดเร็ว',
  maxWidth = 640,
  maxHeight = 640,
  quality = 0.72
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP)');
      return;
    }

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      const result = await compressImageFile(file, {
        maxWidth,
        maxHeight,
        quality,
        mimeType: 'image/webp'
      });

      setCompressionStats(result);
      onChange(result.dataUrl);
      setIsCompressing(false);
    } catch (err) {
      console.error('Compression failed:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง');
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (url: string) => {
    setCompressionStats(null);
    onChange(url);
  };

  const handleClearImage = () => {
    setCompressionStats(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-xs text-slate-700">
          {label}
        </label>
        <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
          <Zap className="w-3 h-3 mr-0.5 text-emerald-500" /> บีบอัดจิ๋ว ไม่กินพื้นที่ DB
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'upload' ? 'bg-white text-[#005BAC] shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>อัปโหลดจากเครื่อง (บีบอัดอัตโนมัติ)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'presets' ? 'bg-white text-[#005BAC] shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>เลือกภาพสำเร็จรูป</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`py-1.5 px-2.5 rounded-lg transition flex items-center justify-center space-x-1 ${
            activeTab === 'url' ? 'bg-white text-[#005BAC] shadow-xs font-bold' : 'hover:text-slate-900'
          }`}
        >
          <ExternalLink className="w-3 h-3" />
          <span>ลิงก์ URL</span>
        </button>
      </div>

      {/* Tab 1: Upload from Device with Compression */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? 'border-[#005BAC] bg-blue-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-[#005BAC] bg-slate-50/80 hover:bg-blue-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#005BAC] flex items-center justify-center">
              {isCompressing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                {isCompressing ? 'กำลังบีบอัดรูปภาพให้เล็กลง...' : 'คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่'}
              </p>
              <p className="text-[11px] text-slate-500">
                รองรับ JPG, PNG, WebP (บีบอัดอัตโนมัติเหลือ ~20-40 KB ประหยัดพื้นที่ 98%)
              </p>
            </div>
          </div>

          {/* Compression Stat Pill */}
          {compressionStats && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  บีบอัดสำเร็จ: จาก <strong className="line-through text-slate-400">{compressionStats.originalSizeFormatted}</strong> ➔{' '}
                  <strong className="text-emerald-700">{compressionStats.compressedSizeFormatted}</strong>
                </span>
              </div>
              <span className="font-extrabold bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                ลดลง -{compressionStats.savingsPercentage}%
              </span>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-600 font-medium">⚠️ {errorMessage}</p>
          )}
        </div>
      )}

      {/* Tab 2: Preset Library */}
      {activeTab === 'presets' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
            {EDUCATIONAL_COVER_PRESETS.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`group relative rounded-xl overflow-hidden border text-left transition aspect-4/3 flex flex-col justify-end p-2 ${
                    isSelected ? 'ring-2 ring-[#005BAC] border-transparent shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="relative z-10 space-y-0.5">
                    <span className="text-[9px] font-bold text-amber-300 uppercase block">{preset.tag}</span>
                    <p className="text-[10px] font-bold text-white leading-tight line-clamp-1">{preset.title}</p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 z-20 w-5 h-5 bg-[#005BAC] text-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Direct URL Input */}
      {activeTab === 'url' && (
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... หรือ ลิงก์รูปภาพอื่น"
            value={value}
            onChange={(e) => {
              setCompressionStats(null);
              onChange(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
          />
        </div>
      )}

      {/* Image Preview & Quick Actions */}
      {value && (
        <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative shadow-xs">
            <img
              src={value}
              alt="Cover Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {compressionStats ? 'ภาพปกอัปโหลด (บีบอัดเรียบร้อย)' : 'รูปภาพปกที่เลือก'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {compressionStats ? `${compressionStats.width}x${compressionStats.height} px • ${compressionStats.compressedSizeFormatted}` : value.slice(0, 45) + '...'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearImage}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
            title="ลบรูปภาพนี้"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        💡 {helpText}
      </p>
    </div>
  );
};
