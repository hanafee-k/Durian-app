import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Camera, Leaf, History, BookOpen, ChevronRight,
  MapPin, Droplets, Wind, Zap, AlertTriangle, User,
  Loader2, Clock, CheckCircle2, TrendingUp, TrendingDown,
  Sun, CloudRain, Cloud, CloudSun, Sparkles, Shield, ArrowRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const WEATHER_API_KEY = "bd3ba81430e030e1ad484bc79cd7b181";

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

const getWeatherIcon = (desc) => {
  if (!desc) return <CloudSun size={80} className="text-slate-200" />;
  if (desc.includes('ฝน')) return <CloudRain size={80} className="text-blue-400" />;
  if (desc.includes('เมฆ')) return <Cloud size={80} className="text-slate-400" />;
  if (desc.includes('แดด') || desc.includes('ใส')) return <Sun size={80} className="text-amber-400" />;
  return <CloudSun size={80} className="text-sky-400" />;
};

/* ─── Sparkline Graph ─── */
const Sparkline = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 120; const height = 44;
  const min = Math.max(0, Math.min(...data) - 10); const max = 100;
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  const isTrendingUp = data[data.length - 1] >= data[0];
  const color = isTrendingUp ? '#10b981' : '#f43f5e';
  const fillId = isTrendingUp ? 'grad-up' : 'grad-down';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-1.5 mb-2">
        {isTrendingUp
          ? <TrendingUp size={14} className="text-emerald-500" strokeWidth={3} />
          : <TrendingDown size={14} className="text-rose-500" strokeWidth={3} />}
        <span className={`text-[10px] font-bold font-['Prompt'] tracking-wide ${isTrendingUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          แนวโน้ม 7 วัน
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-28 h-10 overflow-visible drop-shadow-md">
        <defs>
          <linearGradient id="grad-up" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad-down" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${fillId})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="4" fill="white" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );
};

/* ════════════ MAIN COMPONENT ════════════ */
const HomePage = () => {
  const navigate = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: 'กำลังโหลด...', farm: 'ข้อมูลสวน', location: '-', avatar: '' });
  const [historyList, setHistoryList] = useState([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, disease: 0, thisMonth: 0 });
  const [weatherData, setWeatherData] = useState({ temp: '--', humidity: '--', wind: '--', condition: 'กำลังโหลด...', risk: 'รอข้อมูล' });
  const [trendData, setTrendData] = useState([]);

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

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(now.getDate() - (6 - i));
          const offset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() - offset).toISOString().split('T')[0];
        });

        const dailyStats = {};
        last7Days.forEach(d => dailyStats[d] = { total: 0, healthy: 0 });

        const formattedHistory = hData.map(item => {
          const dateObj = new Date(item.date);
          const diseaseInfo = mapDisease(item.diseaseName);

          if (diseaseInfo.isDisease) dCount++; else hCount++;
          if (dateObj.getMonth() === now.getMonth()) mCount++;

          const offset = dateObj.getTimezoneOffset() * 60000;
          const dStr = new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
          if (dailyStats[dStr]) {
            dailyStats[dStr].total++;
            if (!diseaseInfo.isDisease) dailyStats[dStr].healthy++;
          }

          return {
            id: item._id,
            date: thaiDate(dateObj),
            time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            disease: diseaseInfo.label,
            conf: Math.round(parseFloat(item.confidence)) || 0,
            info: diseaseInfo,
            imageUrl: item.imagePath ? `${API_URL}/uploads/${item.imagePath.split('/').pop()}` : null
          };
        });

        let currentScore = 100;
        const computedTrend = last7Days.map(d => {
          if (dailyStats[d].total > 0) {
            currentScore = Math.round((dailyStats[d].healthy / dailyStats[d].total) * 100);
          }
          return currentScore;
        });

        setTrendData(computedTrend);
        setHistoryList(formattedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setStats({ total: hData.length, healthy: hCount, disease: dCount, thisMonth: mCount });

      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf8] font-['IBM_Plex_Sans_Thai']">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
      <span className="font-bold text-emerald-900 tracking-wider text-sm uppercase font-['Prompt']">กำลังเตรียมข้อมูลสวนของคุณ...</span>
    </div>
  );

  const healthPct = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0;

  /* ─── Risk Tip ─── */
  const getTip = () => {
    if (weatherData.humidity > 80) return { text: 'ความชื้นสูงมาก — เสี่ยงต่อโรคเชื้อรา ควรพ่นสารป้องกันภายใน 24 ชม.', color: 'bg-red-50 border-red-100 text-red-700', icon: <AlertTriangle size={16} className="text-red-500 shrink-0" /> };
    if (stats.disease > stats.healthy) return { text: 'พบใบติดโรคมากกว่าปกติ — ลองตรวจสอบสวนและพ่นสารตามคำแนะนำในคู่มือ', color: 'bg-amber-50 border-amber-100 text-amber-700', icon: <AlertTriangle size={16} className="text-amber-500 shrink-0" /> };
    return { text: 'สวนของคุณอยู่ในสภาพดี — หมั่นตรวจเช็คสม่ำเสมอเพื่อรักษาคุณภาพ', color: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> };
  };
  const tip = getTip();

  return (
    <div className="min-h-screen bg-[#fafaf8] font-['IBM_Plex_Sans_Thai'] text-slate-700">

      {/* ── Decorative Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-100/40 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 p-5 md:p-10">
        <main className="max-w-6xl mx-auto space-y-6">

          {/* ══ TIP BANNER ══ */}
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold ${tip.color}`}>
            {tip.icon}
            <span>{tip.text}</span>
          </div>

          {/* ══ HERO SECTION ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Hero Card */}
            <div className="lg:col-span-8 relative group overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1a5c3a] via-[#155e3d] to-[#0f4a35] text-white p-8 md:p-10 min-h-[340px] flex flex-col justify-between shadow-xl shadow-emerald-900/25">
              {/* Blobs */}
              <div className="absolute top-[-60px] right-[-60px] w-72 h-72 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute bottom-[-40px] left-[-40px] w-56 h-56 bg-emerald-400/15 rounded-full blur-3xl" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 border border-white/25 text-white text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                    {thaiDate(new Date())}
                  </span>
                  <h1 className="font-['Prompt'] text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                    สวัสดี, <span className="text-yellow-300">{userData.name.split(' ')[0]}</span> 👋
                  </h1>
                  <p className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                    <MapPin size={14} className="text-emerald-300" /> {userData.farm}
                  </p>
                </div>

                <button onClick={() => navigate('/profile')} className="relative w-16 h-16 md:w-20 md:h-20 rounded-[22px] border-[3px] border-white/30 shadow-xl overflow-hidden bg-white/10 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shrink-0">
                  {userData.avatar ? (
                    <img src={`${API_URL}/uploads/${userData.avatar}`} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60"><User size={32} strokeWidth={1.5} /></div>
                  )}
                </button>
              </div>

              <div className="relative z-10 mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <button onClick={() => navigate('/scan')} className="w-fit px-7 py-3.5 bg-white text-emerald-700 rounded-2xl font-['Prompt'] font-bold text-[15px] flex items-center gap-2.5 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                  <Camera size={18} /> เริ่มตรวจวินิจฉัย
                </button>

                {/* Mini stats row */}
                <div className="flex items-center gap-5 sm:gap-6">
                  <div className="text-center">
                    <p className={`text-3xl font-black font-sans tracking-tighter ${healthPct >= 50 ? 'text-white' : 'text-rose-300'}`}>{healthPct}<span className="text-lg">%</span></p>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Health</p>
                  </div>
                  <div className="w-px h-10 bg-white/15" />
                  <div className="text-center">
                    <p className="text-3xl font-black font-sans tracking-tighter text-white">{stats.total}</p>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Scans</p>
                  </div>
                  <div className="w-px h-10 bg-white/15" />
                  <Sparkline data={trendData} />
                </div>
              </div>
            </div>

            {/* Weather Card */}
            <div className="lg:col-span-4 bg-white rounded-[36px] p-7 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden border border-slate-100 min-h-[340px]">
              <div className="flex justify-between items-center mb-5 relative z-10">
                <span className="font-['Prompt'] font-extrabold text-slate-800 text-base">สภาพอากาศ</span>
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-sans tracking-widest ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {online ? 'LIVE' : 'OFF'}
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between mb-6 mt-auto">
                <div className="flex flex-col">
                  <span className="font-sans font-black text-6xl lg:text-7xl text-slate-900 tracking-tighter leading-none">
                    {weatherData.temp}°
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="font-['Prompt'] font-bold text-sm text-slate-700 capitalize">{weatherData.condition}</p>
                    <span className={`text-[8px] font-black font-sans uppercase px-2 py-0.5 rounded-md border ${weatherData.humidity > 80 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {weatherData.risk}
                    </span>
                  </div>
                </div>
                <div className="opacity-80 drop-shadow-sm hover:scale-110 transition-transform duration-500">
                  {getWeatherIcon(weatherData.condition)}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-[20px] flex items-center gap-3 hover:bg-slate-100 transition-colors">
                  <Droplets size={22} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="font-sans font-black text-xl text-slate-900 leading-none">{weatherData.humidity}%</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Humidity</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-[20px] flex items-center gap-3 hover:bg-slate-100 transition-colors">
                  <Wind size={22} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-sans font-black text-xl text-slate-900 leading-none">{weatherData.wind}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">KM/H</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ QUICK ACTIONS ══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'สแกนใบ', sub: 'ตรวจจับโรค', Icon: Camera, colors: 'bg-emerald-50 text-emerald-600', to: '/scan' },
              { label: 'ประวัติ', sub: 'ผลการสแกน', Icon: History, colors: 'bg-blue-50 text-blue-600', to: '/history' },
              { label: 'คู่มือโรค', sub: 'วิธีรักษา', Icon: BookOpen, colors: 'bg-amber-50 text-amber-600', to: '/knowledge' },
              { label: 'โปรไฟล์', sub: 'ข้อมูลบัญชี', Icon: User, colors: 'bg-purple-50 text-purple-600', to: '/profile' },
            ].map(({ label, sub, Icon, colors, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="bg-white p-5 rounded-[28px] shadow-sm hover:shadow-lg border border-slate-100 flex items-center gap-4 group transition-all hover:-translate-y-0.5 active:scale-[.98]"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors} group-hover:scale-110 transition-transform shrink-0`}>
                  <Icon size={22} />
                </div>
                <div className="text-left">
                  <p className="font-['Prompt'] font-bold text-sm text-slate-900">{label}</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-sans mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* ══ BOTTOM GRID: HISTORY + HEALTH ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── History ── */}
            <div className="lg:col-span-7 bg-white rounded-[36px] p-7 border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex justify-between items-center mb-7">
                <h3 className="font-['Prompt'] font-extrabold text-slate-800 text-lg flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><History size={18} /></div>
                  ประวัติการสแกนล่าสุด
                </h3>
                <button onClick={() => navigate('/history')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors font-sans flex items-center gap-1">
                  ดูทั้งหมด <ArrowRight size={12} />
                </button>
              </div>

              <div className="space-y-3">
                {historyList.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center bg-slate-50/50 rounded-[28px] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-emerald-50 rounded-[20px] flex items-center justify-center mb-4">
                      <Leaf size={28} className="text-emerald-400" />
                    </div>
                    <span className="font-['Prompt'] font-bold text-base text-slate-600">ยังไม่มีประวัติการสแกน</span>
                    <span className="text-xs text-slate-400 mt-1">เริ่มสแกนใบแรกของคุณเลย</span>
                    <button onClick={() => navigate('/scan')} className="mt-4 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                      <Camera size={14} /> เริ่มสแกน
                    </button>
                  </div>
                ) : (
                  historyList.slice(0, 4).map((item, idx) => (
                    <div key={idx} onClick={() => navigate(`/history/${item.id}`)} className="group flex items-center gap-5 p-4 rounded-[24px] hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                      <div className="w-16 h-16 rounded-[18px] overflow-hidden bg-slate-100 border-[3px] border-white shadow-md shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="leaf" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-emerald-50">{item.info.icon}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className={`font-['Prompt'] font-bold text-sm truncate ${item.info.color}`}>{item.disease}</p>
                          {item.info.isDisease ? <AlertTriangle size={14} className="text-red-400 shrink-0" /> : <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                          <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400" /> {item.date}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">{item.conf}%</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-all shrink-0">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Health summary */}
              <div className="bg-gradient-to-br from-[#1a5c3a] to-[#134a38] rounded-[36px] p-7 shadow-xl shadow-emerald-900/20 relative overflow-hidden text-white">
                <div className="absolute top-[-50px] right-[-50px] w-56 h-56 bg-white/10 rounded-full blur-3xl" />

                <h3 className="font-['Prompt'] font-extrabold text-lg mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/15 backdrop-blur-sm rounded-xl"><Zap size={18} className="text-amber-300" /></div>
                  สรุปสุขภาพสวน
                </h3>

                {/* Health bar */}
                <div className="relative z-10 mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-white/90">ปกติ {stats.healthy}</span>
                    <span className="text-white/90">ติดโรค {stats.disease}</span>
                  </div>
                  <div className="h-3 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-300 to-emerald-100 rounded-full transition-all duration-700"
                      style={{ width: stats.total > 0 ? `${healthPct}%` : '0%' }}
                    />
                  </div>
                  <p className="text-center mt-2 text-white/80 text-xs font-bold">
                    {stats.total > 0 ? `${healthPct}% ปกติจากทั้งหมด ${stats.total} ครั้ง` : 'ยังไม่มีข้อมูลการสแกน'}
                  </p>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between p-4 bg-white/15 backdrop-blur-md rounded-[20px] border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 size={20} /></div>
                      <div>
                        <p className="font-['Prompt'] font-bold text-sm text-white">ปกติ (Healthy)</p>
                        <p className="text-[9px] text-white/70 uppercase font-sans font-bold tracking-widest mt-0.5">Good Condition</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black font-sans">{stats.healthy}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/15 backdrop-blur-md rounded-[20px] border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm"><AlertTriangle size={20} /></div>
                      <div>
                        <p className="font-['Prompt'] font-bold text-sm text-white">ติดโรค (Infected)</p>
                        <p className="text-[9px] text-white/70 uppercase font-sans font-bold tracking-widest mt-0.5">Needs Attention</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black font-sans">{stats.disease}</p>
                  </div>
                </div>
              </div>

              {/* Monthly + Knowledge cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-3">
                    <Sparkles size={22} />
                  </div>
                  <p className="font-sans font-black text-3xl text-slate-800 tracking-tighter">{stats.thisMonth}</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">เดือนนี้</p>
                </div>

                <button onClick={() => navigate('/knowledge')} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition-transform">
                    <Shield size={22} />
                  </div>
                  <p className="font-['Prompt'] font-bold text-sm text-slate-800">คู่มือป้องกัน</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">เรียนรู้เพิ่ม →</p>
                </button>
              </div>
            </div>
          </div>

          {/* ══ FOOTER ══ */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
              DurianDx v1.0.0 · Powered by Deep Learning AI
            </p>
          </div>

        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;600;700;800;900&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default HomePage;