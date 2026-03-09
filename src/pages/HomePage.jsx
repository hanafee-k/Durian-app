import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Camera, Leaf, History, BookOpen, ChevronRight, 
  MapPin, Bell, Droplets, Wind, Eye, Zap, 
  AlertTriangle, User, Loader2, Clock, CheckCircle2, XCircle
} from 'lucide-react';

const API_URL = "http://localhost:5000";
const WEATHER_API_KEY = "b36413de9f08b502efdfa58f32be0f0c";

/* ─── Helpers ─── */
const thaiDate = d => {
  const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const mapDisease = (dbName) => {
  const mapping = {
    'Algal Leaf Spot': { label: 'จุดสนิมสาหร่าย', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🍂', isDisease: true },
    'Healthy Leaf': { label: 'ใบทุเรียนปกติ', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '🍃', isDisease: false },
    'Leaf Blight': { label: 'โรคใบไหม้', color: 'text-red-600', bg: 'bg-red-50', icon: '🔥', isDisease: true },
    'Phomopsis Leaf Spot': { label: 'โรคใบจุดฟอร์มอปซิส', color: 'text-orange-600', bg: 'bg-orange-50', icon: '💠', isDisease: true }
  };
  return mapping[dbName] || { label: 'ไม่ระบุชนิด', color: 'text-slate-500', bg: 'bg-slate-100', icon: '❓', isDisease: false };
};

const HomePage = () => {
  const navigate = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: 'กำลังโหลด...', farm: 'ข้อมูลสวน', location: '-', avatar: '' });
  const [historyList, setHistoryList] = useState([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, disease: 0, thisMonth: 0 });
  const [weatherData, setWeatherData] = useState({ temp: '--', humidity: '--', wind: '--', condition: 'กำลังโหลด...', risk: 'รอข้อมูล' });

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const fetchRealWeather = async (lat, lon) => {
    try {
      const response = await api.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}&lang=th`);
      const d = response.data;
      setWeatherData({
        temp: Math.round(d.main.temp), humidity: d.main.humidity, wind: Math.round(d.wind.speed * 3.6),
        condition: d.weather[0].description, risk: d.main.humidity > 80 ? 'ความเสี่ยงสูง' : 'สภาวะปกติ'
      });
    } catch (err) {
      setWeatherData({ temp: 0, humidity: 0, wind: 0, condition: 'ดึงข้อมูลไม่สำเร็จ', risk: 'เช็ค API' });
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchRealWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchRealWeather(13.75, 100.5)
    );

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, histRes] = await Promise.all([api.get('/user'), api.get('/history')]);
        const u = userRes.data;
        const hData = histRes.data || [];
        
        setUserData({ name: u.name || 'เกษตรกร', farm: u.variety ? `สวนพันธุ์ ${u.variety}` : 'สวนทุเรียน', location: u.location || 'ไม่ระบุพิกัด', avatar: u.avatar || '' });

        const now = new Date();
        let hCount = 0; let dCount = 0; let mCount = 0;
        
        const formattedHistory = hData.map(item => {
          const dateObj = new Date(item.date);
          const diseaseInfo = mapDisease(item.diseaseName);
          
          if (diseaseInfo.isDisease) dCount++; else hCount++;
          if (dateObj.getMonth() === now.getMonth()) mCount++;

          return { 
            id: item._id, 
            date: thaiDate(dateObj), 
            time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
            disease: diseaseInfo.label, 
            conf: Math.round(parseFloat(item.confidence)) || 0, 
            info: diseaseInfo,
            imageUrl: item.imagePath ? `${API_URL}/uploads/${item.imagePath}` : null
          };
        });

        setHistoryList(formattedHistory);
        setStats({ total: hData.length, healthy: hCount, disease: dCount, thisMonth: mCount });
      } catch (err) { if (err.response?.status === 401) navigate('/login'); } finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-['IBMPlexSansThai']">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mr-3" />
      <span className="font-semibold text-emerald-900 tracking-tight">กำลังประมวลผลข้อมูลสวน...</span>
    </div>
  );

  const healthPct = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fafaf8] p-5 md:p-10 font-['IBMPlexSansThai'] text-slate-700">
      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* ── TOP SECTION: WELCOME & WEATHER (BIGGER AVATAR VERSION) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Hero Card */}
          <div className="lg:col-span-8 relative group overflow-hidden bg-white rounded-[40px] p-8 md:p-10 flex flex-col justify-between shadow-2xl shadow-emerald-900/5 border border-slate-100 min-h-[340px]">
            <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10 flex justify-between items-center"> {/* ปรับเป็น items-center เพื่อความสมดุล */}
              <div className="space-y-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider rounded-full font-sans border border-emerald-100 inline-block">
                  {thaiDate(new Date())}
                </span>
                <h1 className="font-['Prompt'] text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  สวัสดี, {userData.name.split(' ')[0]} 👋
                </h1>
                <p className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                  <MapPin size={14} className="text-emerald-500" /> {userData.farm}
                </p>
              </div>

              {/* 📸 ปรับรูปโปรไฟล์ให้ใหญ่และเด่นขึ้น (w-24 h-24) พร้อมขอบพรีเมียม */}
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-[30px] border-4 border-white shadow-2xl overflow-hidden bg-slate-50 transition-all hover:scale-105 active:scale-95 group-hover:rotate-3"
                >
                  {userData.avatar ? (
                    <img src={`${API_URL}/uploads/${userData.avatar}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-200 bg-emerald-50">
                      <User size={40} />
                    </div>
                  )}
                  {/* Decorative Glass Overlay */}
                  <div className="absolute inset-0 rounded-[30px] border border-emerald-100/30 pointer-events-none"></div>
                </button>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 font-sans shadow-sm">Farmer ID</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mt-10">
              <button onClick={() => navigate('/scan')} className="w-full md:w-auto px-10 py-4 bg-[#1b4332] text-white rounded-[20px] font-['Prompt'] font-bold text-base flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-900 transition-all hover:-translate-y-0.5 active:scale-95">
                <Camera size={20} /> เริ่มตรวจวินิจฉัย
              </button>
              
              <div className="flex items-center gap-6 bg-[#fcfcfc] border border-slate-100 p-4 px-8 rounded-[24px] shadow-inner">
                <div className="text-center">
                  <p className="text-3xl font-black font-sans text-emerald-700 leading-none mb-1">{healthPct}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Health Score</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl font-black font-sans text-slate-800 leading-none mb-1">{stats.total}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Total Scans</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="lg:col-span-4 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-8">
              <span className="font-['Prompt'] font-bold text-slate-900 text-sm">สภาพอากาศวันนี้</span>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-sans ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                {online ? 'Online' : 'Offline'}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-sans font-black text-6xl text-slate-900 tracking-tighter">{weatherData.temp}°</span>
                <div className="text-left">
                  <p className="font-['Prompt'] font-bold text-sm text-emerald-800 leading-none">{weatherData.condition}</p>
                  <p className={`text-[9px] font-black font-sans uppercase mt-1.5 px-2 py-0.5 rounded-full ${weatherData.humidity > 80 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{weatherData.risk}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                  <Droplets size={18} className="text-blue-500" />
                  <div>
                    <p className="font-sans font-black text-sm text-slate-800 leading-none">{weatherData.humidity}%</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Humidity</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                  <Wind size={18} className="text-emerald-500" />
                  <div>
                    <p className="font-sans font-black text-sm text-slate-800 leading-none">{weatherData.wind}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-1 font-sans">KM/H</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: HISTORY & STATS BREAKDOWN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-['Prompt'] font-bold text-slate-900 flex items-center gap-2"><History size={18} className="text-emerald-600" /> ประวัติการสแกนล่าสุด</h3>
              <button onClick={() => navigate('/history')} className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em] hover:underline">ดูทั้งหมด</button>
            </div>
            
            <div className="space-y-4">
              {historyList.length === 0 ? (
                <div className="text-center py-16 text-slate-300 text-xs font-medium border-2 border-dashed border-slate-50 rounded-[32px] uppercase tracking-widest">No history yet</div>
              ) : (
                historyList.slice(0, 3).map((item, idx) => (
                  <div key={idx} onClick={() => navigate(`/history/${item.id}`)} className="group flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-slate-100 border-2 border-white shadow-sm shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-emerald-50">{item.info.icon}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-['Prompt'] font-bold text-sm ${item.info.color}`}>{item.disease}</p>
                        {item.info.isDisease ? <AlertTriangle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                        <span className="flex items-center gap-1"><Clock size={10} /> {item.date}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-emerald-600">{item.conf}% Confident</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-['Prompt'] font-bold text-slate-900 mb-6 text-sm">รายงานสุขภาพใบ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 size={20} /></div>
                    <div><p className="font-['Prompt'] font-bold text-sm text-emerald-900">ปกติ (Healthy)</p><p className="text-[10px] text-emerald-600 uppercase font-sans font-bold">Good Condition</p></div>
                  </div>
                  <p className="text-2xl font-black font-sans text-emerald-700">{stats.healthy}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm"><AlertTriangle size={20} /></div>
                    <div><p className="font-['Prompt'] font-bold text-sm text-red-900">ติดโรค (Infected)</p><p className="text-[10px] text-red-600 uppercase font-sans font-bold">Needs Attention</p></div>
                  </div>
                  <p className="text-2xl font-black font-sans text-red-700">{stats.disease}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => navigate('/knowledge')} className="bg-white p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col gap-4 group">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
                 <div className="text-left"><p className="font-['Prompt'] font-bold text-sm text-slate-800">คู่มือโรค</p><p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest font-sans">Knowledge</p></div>
               </button>
               <button onClick={() => navigate('/profile')} className="bg-white p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col gap-4 group">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform"><User size={24} /></div>
                 <div className="text-left"><p className="font-['Prompt'] font-bold text-sm text-slate-800">โปรไฟล์</p><p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest font-sans">Account</p></div>
               </button>
            </div>
          </div>

        </div>
      </main>
      
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;600;700;800&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default HomePage;