import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import {
  ArrowLeft, Leaf, Clock, ChevronRight, BarChart3, 
  CheckCircle, CircleAlert, Microscope, Loader2, Calendar, 
  Trash2, AlertTriangle
} from 'lucide-react';

const API_URL = "http://localhost:5000";

/* ─── Helpers ─── */
const thaiDate = d => {
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
};

const mapDisease = (dbName) => {
  const mapping = {
    // 1. สนิมสาหร่าย (จากโมเดล MobileNetV3)
    'Algal Leaf Spot': { label: 'จุดสนิมสาหร่าย', color: 'text-amber-600', bg: 'bg-amber-100', Icon: Microscope, badge: 'bg-amber-100 text-amber-700' },
    
    // 2. ใบปกติ (จากโมเดล MobileNetV3)
    'Healthy Leaf': { label: 'ใบทุเรียนปกติ', color: 'text-emerald-700', bg: 'bg-emerald-100', Icon: CheckCircle, badge: 'bg-emerald-100 text-emerald-700' },
    
    // 3. ใบไหม้ (จากโมเดล MobileNetV3)
    'Leaf Blight': { label: 'โรคใบไหม้', color: 'text-red-600', bg: 'bg-red-100', Icon: CircleAlert, badge: 'bg-red-100 text-red-700' },
    
    // 4. ใบจุดฟอร์มอปซิส (คลาสใหม่จาก MobileNetV3)
    'Phomopsis Leaf Spot': { label: 'โรคใบจุดฟอร์มอปซิส', color: 'text-orange-600', bg: 'bg-orange-100', Icon: Microscope, badge: 'bg-orange-100 text-orange-700' }
  };
  
  // Fallback กรณีผลลัพธ์ไม่ตรงกับคลาสที่ระบุ
  return mapping[dbName] || { label: 'ไม่ทราบชนิด', color: 'text-slate-500', bg: 'bg-slate-100', Icon: AlertTriangle, badge: 'bg-slate-100 text-slate-700' };
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, disease: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // ✅ ใช้ api.get เพื่อดึงประวัติเฉพาะของ User คนนั้นๆ ผ่าน Token
      const res = await api.get('/history'); 
      const hData = res.data;
      
      let hCount = 0;
      const formattedHistory = hData.map(item => {
        const dateObj = new Date(item.date);
        
        // นับเป็นสุขภาพดีหากตรงกับคลาส 'Healthy Leaf' หรือสถานะที่กำหนด
        const isHealthy = item.diseaseName === 'Healthy Leaf' || item.severity === 'success' || item.severity === 'normal';
        
        if (isHealthy) hCount++;
        
        const mappedInfo = mapDisease(item.diseaseName);
        const imgUrl = item.imagePath ? `${API_URL}/uploads/${item.imagePath.split('/').pop()}` : null;

        return {
          id: item._id,
          date: thaiDate(dateObj),
          time: dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          disease: mappedInfo.label,
          conf: Math.round(parseFloat(item.confidence)),
          info: mappedInfo,
          image: imgUrl
        };
      });

      setHistoryList(formattedHistory);
      setStats({
        total: hData.length,
        healthy: hCount,
        disease: hData.length - hCount,
      });

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7f0]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-emerald-900 font-black tracking-widest text-sm uppercase">กำลังโหลดประวัติส่วนตัว</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5ee] pb-20 font-['Sarabun']">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-900/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-emerald-900/10 shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-black text-emerald-950 font-['Prompt'] tracking-tight">ประวัติการตรวจทั้งหมด</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic History</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-3 gap-4 mb-8 font-['Prompt']">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/5 text-center relative overflow-hidden group">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-slate-50 rounded-full group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-slate-800 mb-1 relative z-10">{stats.total}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">สแกนทั้งหมด</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/5 text-center relative overflow-hidden group">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-emerald-600 mb-1 relative z-10">{stats.healthy}</p>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest relative z-10">สุขภาพดี</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/5 text-center relative overflow-hidden group">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-red-50 rounded-full group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-red-600 mb-1 relative z-10">{stats.disease}</p>
            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest relative z-10">พบการติดเชื้อ</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-900/5 overflow-hidden">
          {historyList.length === 0 ? (
            <div className="p-16 text-center">
              <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-base font-black text-slate-800 font-['Prompt']">ยังไม่มีประวัติการสแกน</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">No History Found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {historyList.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => navigate(`/history/${s.id}`)} 
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-4 p-5 sm:p-6 items-center hover:bg-emerald-50/50 transition-all cursor-pointer"
                >
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-900/5 overflow-hidden bg-slate-50 transition-transform group-hover:scale-105">
                      {s.image ? (
                        <img src={s.image} alt={s.disease} className="w-full h-full object-cover" />
                      ) : (
                        <s.info.Icon className={`w-6 h-6 ${s.info.color}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-black text-emerald-950 font-['Prompt'] truncate leading-tight mb-1.5 group-hover:text-emerald-700">{s.disease}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar size={12} className="text-emerald-500" /> {s.date} <span className="text-slate-200">•</span> <Clock size={12} className="text-emerald-500" /> {s.time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-6 flex items-center justify-between sm:justify-end gap-5 font-['Prompt']">
                    <div className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-sm ${s.info.badge}`}>
                      {s.conf}% Accuracy
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => handleDelete(e, s.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={20} />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all hidden sm:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;