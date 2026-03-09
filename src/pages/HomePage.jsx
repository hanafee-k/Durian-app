import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Camera, Leaf, History, BookOpen, ChevronRight, 
  MapPin, Droplets, Wind, Zap, AlertTriangle, User, 
  Loader2, Clock, CheckCircle2, TrendingUp, TrendingDown,
  Sun, CloudRain, Cloud, CloudSun 
} from 'lucide-react';

const API_URL = "http://localhost:5000";
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
  if (!desc) return <CloudSun size={100} className="text-slate-200" />;
  if (desc.includes('ฝน')) return <CloudRain size={100} className="text-blue-400" />;
  if (desc.includes('เมฆ')) return <Cloud size={100} className="text-slate-400" />;
  if (desc.includes('แดด') || desc.includes('ใส')) return <Sun size={100} className="text-amber-400" />;
  return <CloudSun size={100} className="text-sky-400" />;
};

/* ─── 📈 COMPONENT: Sparkline Graph ─── */
const Sparkline = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const width = 140; 
  const height = 50; 
  const min = Math.max(0, Math.min(...data) - 10); 
  const max = 100;
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
        {isTrendingUp ? (
          <TrendingUp size={16} className="text-emerald-500" strokeWidth={3} />
        ) : (
          <TrendingDown size={16} className="text-rose-500" strokeWidth={3} />
        )}
        <span className={`text-xs font-bold font-['Prompt'] tracking-wide ${isTrendingUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          แนวโน้ม 7 วัน
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-32 h-12 overflow-visible drop-shadow-md">
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
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="4.5" fill="white" stroke={color} strokeWidth="2.5" />
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
        
        const last7Days = Array.from({length: 7}, (_, i) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-['IBM_Plex_Sans_Thai']">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
      <span className="font-bold text-emerald-900 tracking-wider text-sm uppercase font-['Prompt']">กำลังเตรียมข้อมูลสวนของคุณ...</span>
    </div>
  );

  const healthPct = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fafaf8] p-5 md:p-10 font-['IBM_Plex_Sans_Thai'] text-slate-700">
      
      <main className="max-w-6xl mx-auto space-y-8">
        
        {/* ── TOP SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Hero Card */}
          <div className="lg:col-span-8 relative group overflow-hidden bg-white rounded-[40px] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[380px] flex flex-col justify-between">
            {/* วงกลมตกแต่งให้สว่างใสขึ้น */}
            <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125"></div>
            
            <div className="relative z-10 flex justify-between items-start md:items-center">
              <div className="space-y-4">
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full font-sans border border-emerald-100 inline-block">
                  {thaiDate(new Date())}
                </span>
                <h1 className="font-['Prompt'] text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  สวัสดี, <span className="text-emerald-600">{userData.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mt-2">
                  <MapPin size={16} className="text-emerald-500" /> {userData.farm}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 shrink-0">
                <button onClick={() => navigate('/profile')} className="relative w-20 h-20 md:w-24 md:h-24 rounded-[30px] border-[4px] border-white shadow-xl overflow-hidden bg-emerald-50 transition-all hover:scale-105 active:scale-95 group-hover:rotate-3">
                  {userData.avatar ? (
                    <img src={`${API_URL}/uploads/${userData.avatar}`} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-400"><User size={40} strokeWidth={2} /></div>
                  )}
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-8 space-y-6">
              {/* ปรับสีปุ่มสแกนให้เป็นเขียวสว่าง (emerald-600) */}
              <button onClick={() => navigate('/scan')} className="w-fit px-8 py-4 bg-emerald-600 text-white rounded-2xl font-['Prompt'] font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all hover:-translate-y-0.5 active:scale-95">
                <Camera size={20} /> เริ่มตรวจวินิจฉัย
              </button>
              
              {/* Widget สถิติ */}
              <div className="w-full bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-lg shadow-slate-200/50 flex flex-row items-center justify-between gap-4">
                
                {/* Health Score */}
                <div className="flex flex-col items-center justify-center w-1/3">
                  <div className="flex items-baseline justify-center gap-0.5">
                    {/* ปรับสีเขียวตรงเปอร์เซ็นต์ให้สว่างขึ้น */}
                    <p className={`text-5xl md:text-6xl font-black font-sans tracking-tighter ${healthPct >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {healthPct}
                    </p>
                    <span className={`text-2xl font-bold font-sans ${healthPct >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>%</span>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 font-['Prompt'] uppercase tracking-widest">
                    Health Score
                  </p>
                </div>

                <div className="w-px h-16 bg-slate-100"></div>

                {/* Sparkline */}
                <div className="flex flex-col items-center justify-center w-1/3">
                  <Sparkline data={trendData} />
                </div>

                <div className="w-px h-16 bg-slate-100"></div>

                {/* Total Scans */}
                <div className="flex flex-col items-center justify-center w-1/3">
                  <p className="text-5xl md:text-6xl font-black font-sans text-slate-800 tracking-tighter">
                    {stats.total}
                  </p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 font-['Prompt'] uppercase tracking-widest">
                    Total Scans
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* 🌤️ Weather Card */}
          <div className="lg:col-span-4 bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden border border-slate-100 min-h-[380px]">
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <span className="font-['Prompt'] font-extrabold text-slate-800 text-lg">
                สภาพอากาศวันนี้
              </span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase font-sans tracking-widest ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {online ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between mb-8 mt-auto">
              <div className="flex flex-col">
                <span className="font-sans font-black text-[5rem] lg:text-8xl text-slate-800 tracking-tighter leading-none -ml-1">
                  {weatherData.temp}°
                </span>
                <div className="mt-3 flex items-center gap-3">
                  <p className="font-['Prompt'] font-bold text-lg text-emerald-600 leading-none capitalize">{weatherData.condition}</p>
                  <span className={`text-[9px] font-black font-sans uppercase px-2.5 py-0.5 rounded-md border ${weatherData.humidity > 80 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {weatherData.risk}
                  </span>
                </div>
              </div>
              
              <div className="opacity-90 drop-shadow-sm transform hover:scale-110 transition-transform duration-500">
                {getWeatherIcon(weatherData.condition)}
              </div>
            </div>
            
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-[24px] flex items-center gap-4 hover:bg-slate-100 transition-colors cursor-default">
                <Droplets size={26} className="text-blue-500 shrink-0" />
                <div>
                  <p className="font-sans font-black text-2xl text-slate-800 leading-none">{weatherData.humidity}%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Humidity</p>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-[24px] flex items-center gap-4 hover:bg-slate-100 transition-colors cursor-default">
                <Wind size={26} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="font-sans font-black text-2xl text-slate-800 leading-none">{weatherData.wind}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-sans">KM/H</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: HISTORY & STATS BREAKDOWN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-['Prompt'] font-black text-slate-800 text-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><History size={20} /></div>
                ประวัติการสแกนล่าสุด
              </h3>
              <button onClick={() => navigate('/history')} className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-full transition-colors font-sans">View All</button>
            </div>
            
            <div className="space-y-4">
              {historyList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                  <Leaf size={40} className="mb-4 opacity-50 text-emerald-600" />
                  <span className="font-['Prompt'] font-bold text-lg text-slate-600">ยังไม่มีประวัติการสแกน</span>
                  <span className="text-xs mt-1">เริ่มสแกนใบแรกของคุณเลย</span>
                </div>
              ) : (
                historyList.slice(0, 3).map((item, idx) => (
                  <div key={idx} onClick={() => navigate(`/history/${item.id}`)} className="group flex items-center gap-6 p-5 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-slate-100 border-4 border-white shadow-md shrink-0 relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="leaf result" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-emerald-50">{item.info.icon}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className={`font-['Prompt'] font-extrabold text-base ${item.info.color}`}>{item.disease}</p>
                        {item.info.isDisease ? <AlertTriangle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-300" /> {item.date}</span>
                        <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{item.conf}% Confident</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 🌿 ปรับสีการ์ดสรุปให้สดใส (สว่าง) ขึ้น เลิกใช้สีทึบมืด */}
            <div className="bg-emerald-600 rounded-[40px] p-8 shadow-xl shadow-emerald-600/20 relative overflow-hidden text-white">
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-400/30 rounded-full blur-3xl"></div>
              
              <h3 className="font-['Prompt'] font-black text-xl mb-8 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"><Zap size={20} className="text-amber-300" /></div>
                สรุปสุขภาพสวน
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-5 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><CheckCircle2 size={24} /></div>
                    <div>
                      <p className="font-['Prompt'] font-bold text-base text-white">ปกติ (Healthy)</p>
                      <p className="text-[10px] text-emerald-100 uppercase font-sans font-bold tracking-widest mt-1">Good Condition</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black font-sans text-white">{stats.healthy}</p>
                </div>
                
                <div className="flex items-center justify-between p-5 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm"><AlertTriangle size={24} /></div>
                    <div>
                      <p className="font-['Prompt'] font-bold text-base text-white">ติดโรค (Infected)</p>
                      <p className="text-[10px] text-emerald-100 uppercase font-sans font-bold tracking-widest mt-1">Needs Attention</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black font-sans text-white">{stats.disease}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => navigate('/knowledge')} className="bg-white p-6 rounded-[32px] shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col gap-5 group items-start">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform"><BookOpen size={28} /></div>
                 <div className="text-left">
                   <p className="font-['Prompt'] font-black text-base text-slate-800">คู่มือโรค</p>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans mt-1">Knowledge</p>
                 </div>
               </button>
               
               <button onClick={() => navigate('/profile')} className="bg-white p-6 rounded-[32px] shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col gap-5 group items-start">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-50 text-purple-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform"><User size={28} /></div>
                 <div className="text-left">
                   <p className="font-['Prompt'] font-black text-base text-slate-800">โปรไฟล์</p>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-sans mt-1">Account</p>
                 </div>
               </button>
            </div>
          </div>

        </div>
      </main>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;600;700;800;900&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default HomePage;