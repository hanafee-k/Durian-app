import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import {
  ArrowLeft, Leaf, Clock, ChevronRight, BarChart3, 
  CheckCircle, CircleAlert, Microscope, Loader2, Calendar, 
  Trash2, AlertTriangle, Search, Filter, ScanLine, User, XCircle, MapPin
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─── Helpers ─── */
const thaiDate = d => {
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
};

const mapDisease = (dbName) => {
  const mapping = {
    'Algal Leaf Spot': { label: 'จุดสนิมสาหร่าย', color: 'text-amber-600', bg: 'bg-amber-50', Icon: Microscope, badge: 'bg-amber-50 text-amber-700 border-amber-100', isDisease: true },
    'Healthy Leaf': { label: 'ใบทุเรียนปกติ', color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: CheckCircle, badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', isDisease: false },
    'Leaf Blight': { label: 'โรคใบไหม้', color: 'text-rose-600', bg: 'bg-rose-50', Icon: CircleAlert, badge: 'bg-rose-50 text-rose-700 border-rose-100', isDisease: true },
    'Phomopsis Leaf Spot': { label: 'โรคใบจุดฟอร์มอปซิส', color: 'text-orange-600', bg: 'bg-orange-50', Icon: Microscope, badge: 'bg-orange-50 text-orange-700 border-orange-100', isDisease: true }
  };
  return mapping[dbName] || { label: 'ไม่ทราบชนิด', color: 'text-slate-500', bg: 'bg-slate-50', Icon: AlertTriangle, badge: 'bg-slate-50 text-slate-700 border-slate-200', isDisease: false };
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [userData, setUserData] = useState({ name: 'กำลังโหลด...', farm: 'กำลังโหลด...', avatar: '' });
  const [stats, setStats] = useState({ total: 0, healthy: 0, disease: 0 });
  const [loading, setLoading] = useState(true);
  
  // ⏱️ State สำหรับเวลาปัจจุบันแบบ Real-time
  const [currentTime, setCurrentTime] = useState(new Date());

  // อัปเดตเวลาทุกๆ 1 วินาที
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchHistory = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [userRes, histRes] = await Promise.all([
        api.get('/user'),
        api.get('/history')
      ]);
      
      const u = userRes.data;
      const hData = histRes.data || [];
      
      setUserData({
        name: u.name || 'เกษตรกร',
        farm: u.variety ? `สวนพันธุ์ ${u.variety}` : 'สวนทุเรียน',
        avatar: u.avatar || ''
      });
      
      let hCount = 0;
      let dCount = 0;

      const formattedHistory = hData.map(item => {
        const dateObj = new Date(item.date);
        const mappedInfo = mapDisease(item.diseaseName);
        
        if (mappedInfo.isDisease) dCount++; else hCount++;
        
        const imgUrl = item.imagePath ? `${API_URL}/uploads/${item.imagePath.split('/').pop()}` : null;

        return {
          id: item._id,
          fullDate: dateObj, // เก็บไว้สำหรับ Sort
          date: thaiDate(dateObj),
          time: dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          disease: mappedInfo.label,
          conf: Math.round(parseFloat(item.confidence)) || 0,
          info: mappedInfo,
          image: imgUrl
        };
      });

      // 🔄 เรียงข้อมูลเอาเวลาล่าสุดขึ้นบนเสมอ
      const sortedHistory = formattedHistory.sort((a, b) => b.fullDate - a.fullDate);

      setHistoryList(sortedHistory);
      setStats({ total: hData.length, healthy: hCount, disease: dCount });

    } catch (err) {
      console.error('Error fetching history:', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('คุณต้องการลบประวัติการตรวจนี้ใช่หรือไม่?')) {
      try {
        await api.delete(`/history/${id}`);
        fetchHistory(false);
      } catch (err) {
        alert('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf8]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-emerald-900 font-['Prompt'] font-bold tracking-widest text-sm uppercase animate-pulse">Loading Archive...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-24 font-['IBM_Plex_Sans_Thai'] text-slate-700">
      
      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm active:scale-95 group">
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Prompt'] tracking-tight leading-none">ประวัติการตรวจ</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 font-sans">Diagnostic Archive</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-colors"><Search size={20}/></button>
            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-colors hidden sm:block"><Filter size={20}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

        {/* ── STATS DASHBOARD ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 font-['Prompt']">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-sans mb-1">Total Scans</p>
              <p className="text-4xl font-black font-sans text-slate-800 tracking-tighter">{stats.total}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">สแกนทั้งหมด</p>
            </div>
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
              <BarChart3 size={28} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[32px] p-6 shadow-sm border border-emerald-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-widest font-sans mb-1">Healthy Leaf</p>
              <p className="text-4xl font-black font-sans text-emerald-700 tracking-tighter">{stats.healthy}</p>
              <p className="text-sm font-medium text-emerald-800 mt-1">สุขภาพดี</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
              <CheckCircle size={28} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-[32px] p-6 shadow-sm border border-rose-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[11px] font-bold text-rose-600/70 uppercase tracking-widest font-sans mb-1">Infected Risk</p>
              <p className="text-4xl font-black font-sans text-rose-700 tracking-tighter">{stats.disease}</p>
              <p className="text-sm font-medium text-rose-800 mt-1">พบอาการโรค</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
              <CircleAlert size={28} />
            </div>
          </div>
        </div>

        {/* ── HISTORY LIST ── */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-900 font-['Prompt']">รายการวิเคราะห์ล่าสุด</h2>
             <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest font-sans border border-emerald-100">Live Data</span>
          </div>

          {historyList.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <ScanLine size={32} className="text-slate-300" />
              </div>
              <p className="text-xl font-bold text-slate-800 font-['Prompt'] mb-2">ยังไม่มีประวัติการสแกน</p>
              <p className="text-sm text-slate-500">เริ่มสแกนใบทุเรียนของคุณเพื่อสร้างฐานข้อมูลสุขภาพสวน</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {historyList.map((s, idx) => (
                <div 
                  key={s.id} 
                  onClick={() => navigate(`/history/${s.id}`)} 
                  className="group flex flex-col sm:flex-row gap-5 p-6 sm:p-8 items-start sm:items-center hover:bg-slate-50/50 transition-all cursor-pointer relative"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-emerald-400 rounded-r-lg opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block"></div>

                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] flex items-center justify-center shrink-0 shadow-sm border border-slate-100 overflow-hidden bg-slate-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                    {s.image ? (
                      <img src={s.image} alt={s.disease} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${s.info.bg}`}>
                         <s.info.Icon className={`w-8 h-8 ${s.info.color}`} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mb-1.5">
                      <Clock size={12} className="text-emerald-500" />
                      <span>{s.date} <span className="mx-1 text-slate-200">|</span> {s.time}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <p className="text-xl font-bold text-slate-900 font-['Prompt'] leading-tight group-hover:text-emerald-700 transition-colors truncate">
                        {s.disease}
                      </p>
                      {s.info.isDisease ? <CircleAlert size={16} className="text-red-400" /> : <CheckCircle size={16} className="text-emerald-500" />}
                    </div>

                    <div className={`w-fit px-3 py-1 rounded-xl text-[10px] font-black uppercase font-sans border ${s.info.badge}`}>
                      {s.conf}% Accuracy
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-none">
                    <button 
                      onClick={(e) => handleDelete(e, s.id)} 
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                      title="ลบข้อมูล"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
                      <ChevronRight size={22} />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
        .animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;