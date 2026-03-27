import { useState, useEffect } from 'react';
import {
  Users, ScanLine, AlertTriangle, Leaf, TrendingUp, ShieldCheck,
  Activity, Zap, ArrowUpRight, BarChart2, CheckCircle2
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://durian-app.onrender.com/api';

const diseaseConfig = {
  'Leaf Blight':         { color: '#ef4444', bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-600',     icon: '🔥', label: 'ใบไหม้' },
  'Algal Leaf Spot':     { color: '#f59e0b', bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   icon: '🍂', label: 'จุดสาหร่าย' },
  'Phomopsis Leaf Spot': { color: '#f97316', bg: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  icon: '💠', label: 'จุดเชื้อรา' },
  'Healthy Leaf':        { color: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', icon: '🍃', label: 'ใบปกติ' },
};

const severityConfig = {
  danger:  { color: '#ef4444', bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-600',     label: 'อันตราย',   ring: 'ring-red-200' },
  warning: { color: '#f59e0b', bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600',   label: 'เฝ้าระวัง', ring: 'ring-amber-200' },
  success: { color: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', label: 'ปกติ',      ring: 'ring-emerald-200' },
  normal:  { color: '#94a3b8', bg: 'bg-slate-400',   light: 'bg-slate-50',   text: 'text-slate-500',   label: 'ทั่วไป',    ring: 'ring-slate-200' },
};

const thaiDate = () => {
  const d = new Date();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
};

// Mini Donut SVG
function DonutChart({ data, size = 100 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let angle = -90;
  const r = 38, cx = 50, cy = 50, strokeW = 18;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
      {data.map((d, i) => {
        const dashArr = (d.value / total) * circumference;
        const rotation = angle;
        angle += (d.value / total) * 360;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dashArr} ${circumference - dashArr}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        );
      })}
    </svg>
  );
}

// Mini spark bar
function SparkBar({ pct, color }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const adminName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.name?.split(' ')[0] || 'Admin';
    } catch { return 'Admin'; }
  })();

  const hour = time.getHours();
  const greeting = hour < 12 ? 'อรุณสวัสดิ์' : hour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';

  const summaryCards = stats ? [
    {
      label: 'ผู้ใช้งานทั้งหมด',
      value: stats.totalUsers,
      sub: 'สมาชิกที่ลงทะเบียน',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      light: 'bg-blue-50',
      textColor: 'text-blue-600',
      glow: 'shadow-blue-500/20',
    },
    {
      label: 'สแกนทั้งหมด',
      value: stats.totalScans,
      sub: 'ครั้งที่วิเคราะห์',
      icon: ScanLine,
      gradient: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      glow: 'shadow-emerald-500/20',
    },
    {
      label: 'อาการอันตราย',
      value: stats.severityCounts?.danger || 0,
      sub: 'ต้องดูแลเร่งด่วน',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      light: 'bg-red-50',
      textColor: 'text-red-500',
      glow: 'shadow-red-500/20',
    },
    {
      label: 'ใบสุขภาพดี',
      value: stats.diseaseCounts?.['Healthy Leaf'] || 0,
      sub: 'ไม่พบการติดเชื้อ',
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-600',
      light: 'bg-green-50',
      textColor: 'text-green-600',
      glow: 'shadow-green-500/20',
    },
  ] : [];

  const donutDataDisease = stats
    ? Object.entries(stats.diseaseCounts || {}).map(([k, v]) => ({
        label: k,
        value: v,
        color: diseaseConfig[k]?.color || '#94a3b8',
      }))
    : [];

  const donutDataSeverity = stats
    ? Object.entries(stats.severityCounts || {}).map(([k, v]) => ({
        label: k,
        value: v,
        color: severityConfig[k]?.color || '#94a3b8',
      }))
    : [];

  return (
    <div className="flex min-h-screen bg-[#f8faf9] font-['IBM_Plex_Sans_Thai']">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

          {/* ── Hero Header ── */}
          <div className="relative bg-gradient-to-r from-[#0d3320] via-[#133c27] to-[#1a5c3a] rounded-[32px] p-8 overflow-hidden shadow-xl shadow-emerald-900/20">
            {/* BG blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-emerald-400/10 rounded-full translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="text-emerald-300/80 text-xs font-bold uppercase tracking-[0.2em] font-sans mb-1">{greeting} 👋</p>
                <h1 className="font-['Prompt'] font-black text-3xl text-white tracking-tight">
                  {adminName}
                </h1>
                <p className="text-emerald-200/60 text-sm mt-2 font-medium">{thaiDate()} · ภาพรวมระบบวินิจฉัยโรคทุเรียน</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-2xl text-sm font-bold font-['Prompt']">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ระบบออนไลน์
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-200 px-4 py-2.5 rounded-2xl text-sm font-bold font-sans">
                  <Activity size={15} />
                  {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-72 gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              </div>
              <span className="text-sm font-bold text-slate-400 font-['Prompt'] uppercase tracking-widest animate-pulse">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {summaryCards.map(({ label, value, sub, icon: Icon, gradient, light, textColor, glow }) => (
                  <div
                    key={label}
                    className={`bg-white rounded-[28px] p-6 shadow-lg ${glow} border border-slate-100 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
                  >
                    {/* Accent blob */}
                    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${light} flex items-center justify-center`}>
                        <Icon size={22} className={textColor} />
                      </div>
                      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>

                    <p className="text-4xl font-black text-slate-900 tracking-tighter font-sans leading-none mb-1">
                      {(value || 0).toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-slate-700 font-['Prompt'] mt-2">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Charts Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Disease Breakdown */}
                <div className="bg-white rounded-[28px] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-['Prompt'] font-black text-slate-800 text-base">การตรวจพบแยกตามโรค</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] font-sans">Disease Breakdown</p>
                    </div>
                  </div>

                  {donutDataDisease.length > 0 ? (
                    <div className="flex items-center gap-6">
                      {/* Donut */}
                      <div className="relative flex-shrink-0">
                        <DonutChart data={donutDataDisease} size={110} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-xl font-black text-slate-800 font-sans leading-none">{stats.totalScans}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                          </div>
                        </div>
                      </div>

                      {/* Legend bars */}
                      <div className="flex-1 space-y-3.5">
                        {Object.entries(stats.diseaseCounts).map(([disease, count]) => {
                          const pct = stats.totalScans > 0 ? Math.round((count / stats.totalScans) * 100) : 0;
                          const cfg = diseaseConfig[disease] || { color: '#94a3b8', text: 'text-slate-600', label: disease, icon: '❓' };
                          return (
                            <div key={disease}>
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{cfg.icon}</span>
                                  <span className="text-xs font-bold text-slate-600 font-['Prompt'] truncate max-w-[120px]">{cfg.label || disease}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-800 font-sans">{count}</span>
                                  <span className="text-[9px] font-bold text-slate-400 font-sans">{pct}%</span>
                                </div>
                              </div>
                              <SparkBar pct={pct} color={cfg.color} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <Leaf size={36} className="text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm font-['Prompt']">ยังไม่มีข้อมูลการสแกน</p>
                    </div>
                  )}
                </div>

                {/* Severity Breakdown */}
                <div className="bg-white rounded-[28px] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                      <ShieldCheck size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-['Prompt'] font-black text-slate-800 text-base">ระดับความรุนแรง</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] font-sans">Severity Overview</p>
                    </div>
                  </div>

                  {donutDataSeverity.length > 0 ? (
                    <div className="flex items-center gap-6">
                      {/* Donut */}
                      <div className="relative flex-shrink-0">
                        <DonutChart data={donutDataSeverity} size={110} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-xl font-black text-slate-800 font-sans leading-none">{stats.totalScans}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                          </div>
                        </div>
                      </div>

                      {/* Legend cards */}
                      <div className="flex-1 space-y-3">
                        {Object.entries(stats.severityCounts).map(([sev, count]) => {
                          const cfg = severityConfig[sev] || { color: '#94a3b8', text: 'text-slate-500', light: 'bg-slate-50', label: sev, ring: 'ring-slate-200' };
                          const pct = stats.totalScans > 0 ? Math.round((count / stats.totalScans) * 100) : 0;
                          return (
                            <div key={sev} className={`flex items-center gap-3 p-3 rounded-2xl ${cfg.light} ring-1 ${cfg.ring}`}>
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                              <p className={`text-sm font-bold font-['Prompt'] flex-1 ${cfg.text}`}>{cfg.label}</p>
                              <p className="text-sm font-black text-slate-800 font-sans">{count}</p>
                              <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <ShieldCheck size={36} className="text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm font-['Prompt']">ยังไม่มีข้อมูลการสแกน</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Quick Stats Banner ── */}
              {stats && stats.totalScans > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      icon: BarChart2,
                      label: 'อัตราพบโรค',
                      value: `${Math.round(((stats.totalScans - (stats.diseaseCounts?.['Healthy Leaf'] || 0)) / stats.totalScans) * 100)}%`,
                      desc: 'ของการสแกนทั้งหมด',
                      color: 'text-rose-600',
                      bg: 'bg-rose-50',
                    },
                    {
                      icon: CheckCircle2,
                      label: 'อัตราสุขภาพดี',
                      value: `${Math.round(((stats.diseaseCounts?.['Healthy Leaf'] || 0) / stats.totalScans) * 100)}%`,
                      desc: 'ใบปกติไม่มีโรค',
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                    },
                    {
                      icon: Zap,
                      label: 'เฉลี่ยต่อผู้ใช้',
                      value: `${(stats.totalScans / Math.max(stats.totalUsers, 1)).toFixed(1)}`,
                      desc: 'ครั้งสแกน/คน',
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                    },
                  ].map(({ icon: Icon, label, value, desc, color, bg }) => (
                    <div key={label} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
                      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <Icon size={22} className={color} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 font-sans tracking-tight leading-none">{value}</p>
                        <p className="text-sm font-bold text-slate-700 font-['Prompt'] mt-1">{label}</p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="text-center pb-2">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] font-sans">
                  DurianDx Admin v1.0.0 · Powered by Deep Learning AI
                </p>
              </div>

            </>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Prompt:wght@400;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
