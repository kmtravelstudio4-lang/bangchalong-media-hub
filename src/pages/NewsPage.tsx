import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { News } from '../types';
import { Newspaper, Calendar, User, ArrowRight, X } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const { newsList } = useApp();
  const [activeNews, setActiveNews] = useState<News | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="bg-[#005BAC] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
          ข่าวสารโรงเรียน
        </span>
        <h1 className="font-prompt text-3xl sm:text-4xl font-extrabold text-slate-900">
          ข่าวประชาสัมพันธ์วิชาการ
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          ติดตามข่าวสาร กิจกรรมวิชาการ และผลงานของโรงเรียนวัดบางโฉลงใน
        </p>
      </div>

      {/* News List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {newsList.map((news) => (
          <div
            key={news.id}
            onClick={() => setActiveNews(news)}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-lg transition duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-48 w-full overflow-hidden relative">
                <img
                  src={news.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800'}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#005BAC] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  {news.category}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-prompt font-bold text-slate-900 text-base leading-snug group-hover:text-[#005BAC] transition line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                  {news.content}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
              <span>{news.createdAt}</span>
              <span className="font-bold text-[#005BAC] flex items-center">
                อ่านเพิ่มเติม <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {activeNews && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto relative space-y-4">
            <button
              onClick={() => setActiveNews(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={activeNews.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800'}
              alt={activeNews.title}
              className="w-full h-64 rounded-2xl object-cover"
            />

            <div className="text-xs text-[#005BAC] font-bold">
              {activeNews.category} • {activeNews.createdAt} • โดย {activeNews.author}
            </div>

            <h2 className="font-prompt font-bold text-slate-900 text-2xl leading-snug">
              {activeNews.title}
            </h2>

            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {activeNews.content}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
