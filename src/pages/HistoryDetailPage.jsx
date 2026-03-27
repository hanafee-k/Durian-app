import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { 
  ArrowLeft, Calendar, AlertTriangle, CheckCircle, 
  Leaf, Thermometer, Microscope, Loader2, Image as ImageIcon,
  Scissors, Droplets, ShieldAlert, ChevronRight, Activity
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─── Helpers ─── */
const thaiDate = d => {
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
};

// 🚀 ฐานข้อมูลการรักษาฉบับเต็ม (แบ่ง 3 ระดับ)
const treatmentDatabase = {
  'Algal Leaf Spot': {
    low: { label: 'เริ่มเป็น (≤ 50% ของทรงพุ่ม)', color: 'emerald', items: ['ตัดใบที่เป็นโรคออกจากต้น', 'ตัดแต่งทรงพุ่มให้โปร่งเพื่อลดความชื้น', 'พ่นสาร คอปเปอร์ออกซีคลอไรด์ 85% WP 30–50 กรัม/น้ำ 20 ลิตร'] },
    mid: { label: 'ปานกลาง (50–79% ของทรงพุ่ม)', color: 'amber', items: ['ตัดกิ่งและใบที่เป็นโรคบางส่วน', 'พ่น คอปเปอร์ออกซีคลอไรด์ หรือ คอปเปอร์ไฮดรอกไซด์', 'พ่นซ้ำทุก 7–10 วัน จนควบคุมได้'] },
    high: { label: 'รุนแรง (≥ 80% ของทรงพุ่ม)', color: 'rose', items: ['ตัดแต่งกิ่งหนัก เพื่อลดแหล่งสะสมโรค', 'พ่นสารคอปเปอร์ทั่วทรงพุ่มและลำต้น', 'ปรับการระบายอากาศในสวน และระบบให้น้ำ'] }
  },
  'Phomopsis Leaf Spot': { // ใช้ข้อมูลของใบจุดเชื้อรา/แอนแทรคโนส
    low: { label: 'เริ่มเป็น (≤ 50% ของทรงพุ่ม)', color: 'emerald', items: ['ตัดใบที่เป็นโรคออก', 'ลดความชื้นในสวน', 'พ่น แมนโคเซบ 50–60 กรัม/น้ำ 20 ลิตร'] },
    mid: { label: 'ปานกลาง (50–79% ของทรงพุ่ม)', color: 'amber', items: ['ตัดกิ่งและใบที่เป็นโรคออกบางส่วน', 'พ่นสารป้องกันเชื้อรา เช่น แมนโคเซบ อะซอกซีสโตรบิน โพรพิเนบ', 'พ่นซ้ำทุก 7 วัน'] },
    high: { label: 'รุนแรง (≥ 80% ของทรงพุ่ม)', color: 'rose', items: ['ตัดแต่งกิ่งหนัก เพื่อลดการสะสมของโรค', 'พ่นสารกำจัดเชื้อราทั่วต้น เช่น อะซอกซีสโตรบิน หรือ คาร์เบนดาซิม', 'พ่นต่อเนื่อง 2–3 ครั้ง ห่างกัน 7 วัน'] }
  },
  'Leaf Blight': {
    low: { label: 'เริ่มเป็น (≤ 50% ของทรงพุ่ม)', color: 'emerald', items: ['ตัดใบที่เป็นโรคออก', 'ปรับระบบระบายน้ำในสวน', 'พ่น ฟอสเอทิล-อะลูมิเนียม 40–50 กรัม/น้ำ 20 ลิตร'] },
    mid: { label: 'ปานกลาง (50–79% ของทรงพุ่ม)', color: 'amber', items: ['ตัดกิ่งที่เป็นโรคออก', 'พ่นสารกำจัดเชื้อรา เช่น เมทาแลกซิล หรือ ฟอสเอทิล-Al', 'พ่นซ้ำทุก 7–10 วัน'] },
    high: { label: 'รุนแรง (≥ 80% ของทรงพุ่ม)', color: 'rose', items: ['ตัดแต่งกิ่งที่เป็นโรครุนแรง', 'พ่นสารทั่วต้นและบริเวณโคนต้น', 'ปรับปรุงดินและระบบระบายน้ำ', 'หากต้นทรุดหนักควร ฟื้นฟูต้นหรือเปลี่ยนต้นใหม่'] }
  }
};

// 🚀 ข้อมูลอาการหลัก
const mapDiseaseInfo = (dbName) => {
  const mapping = {
    'Healthy Leaf': { 
      label: 'ใบทุเรียนปกติ (Healthy)', isDisease: false, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', Icon: CheckCircle, 
      symptoms: 'ใบมีสีเขียวสม่ำเสมอ ผิวมันเงา สุขภาพดี ไม่พบร่องรอยการติดเชื้อ', 
      healthyTips: ['ดูแลรดน้ำและใส่ปุ๋ยบำรุงตามรอบปกติ', 'หมั่นตรวจเช็คแปลงอย่างสม่ำเสมอเพื่อเฝ้าระวัง'] 
    },
    'Algal Leaf Spot': { 
      label: 'โรคใบจุดสาหร่าย (Algal Leaf Spot)', isDisease: true, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', Icon: Microscope, 
      symptoms: 'จุดกลมหรือปื้นสีแดง-ส้ม ผิวสาก มักพบในสวนที่มีความชื้นสูง'
    },
    'Leaf Blight': { 
      label: 'โรคใบไหม้ (Leaf Blight)', isDisease: true, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', Icon: AlertTriangle, 
      symptoms: 'ใบมีแผลสีน้ำตาลไหม้ เริ่มจากขอบหรือปลายใบ ใบร่วงเร็ว'
    },
    'Phomopsis Leaf Spot': { 
      label: 'โรคใบจุดเชื้อรา (Fungal Leaf Spot)', isDisease: true, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200', Icon: Microscope, 
      symptoms: 'จุดสีน้ำตาลกลมหรือรี มีขอบชัด บางครั้งมีวงเหลือง'
    }
  };
  return mapping[dbName] || mapping['Healthy Leaf']; 
};

// 🎨 ตัวช่วยกำหนดสี Card ตามระดับความรุนแรง
const severityStyles = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900'
};
const iconStyles = {
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600'
};

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/history/${id}`); 
        const data = res.data;
        const dateObj = new Date(data.date);
        const diseaseInfo = mapDiseaseInfo(data.diseaseName);
        const treatments = treatmentDatabase[data.diseaseName] || null;

        setDetail({
          id: data._id,
          rawDisease: data.diseaseName,
          confidence: Math.round(parseFloat(data.confidence)),
          dateStr: thaiDate(dateObj),
          timeStr: dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          imagePath: data.imagePath ? `${API_URL}/uploads/${data.imagePath.split('/').pop()}` : null,
          treatments,
          ...diseaseInfo
        });
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        setError("ไม่พบข้อมูลประวัติ หรือคุณไม่มีสิทธิ์เข้าถึง");
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf8]">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
      <p className="text-emerald-900 font-['Prompt'] font-bold tracking-widest text-sm uppercase">Loading Record...</p>
    </div>
  );

  if (error || !detail) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-[#fafaf8]">
      <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
      <p className="text-slate-800 font-['Prompt'] font-black text-xl mb-6">{error}</p>
      <button onClick={() => navigate(-1)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg font-['Prompt']">กลับไปหน้าประวัติ</button>
    </div>
  );

  const StatusIcon = detail.Icon;

  return (
    <div className="min-h-screen bg-[#fafaf8] font-['IBM_Plex_Sans_Thai'] pb-24">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm active:scale-95 group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Prompt'] tracking-tight leading-none">รายละเอียดผลวิเคราะห์</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-sans">Record ID: {detail.id.substring(18)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── COLUMN 1: IMAGE & METADATA ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                {detail.imagePath ? (
                  <img src={detail.imagePath} alt="Scanned Leaf" className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <ImageIcon size={48} className="mb-2 opacity-50" />
                    <p className="text-sm font-black uppercase font-sans tracking-widest">No Image</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-['Prompt']">
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-[1rem] flex items-center justify-center text-slate-500 shrink-0"><Calendar size={22} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">วันที่ตรวจ</p>
                  <p className="text-sm font-black text-slate-800 leading-none">{detail.dateStr}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-[1rem] flex items-center justify-center text-emerald-600 shrink-0"><Thermometer size={22} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ความมั่นใจ</p>
                  <p className="text-sm font-black text-emerald-600 leading-none">{detail.confidence}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── COLUMN 2: DIAGNOSIS & TREATMENT ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* DIAGNOSIS CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden font-['Prompt']">
              <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full -z-10 opacity-30 ${detail.bg}`}></div>
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 font-sans">Diagnostic Result</p>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{detail.label}</h2>
                  <p className="text-sm text-emerald-600 font-bold mt-2 flex items-center gap-2">
                    <Activity size={16} /> AI ประมวลผลด้วยความมั่นใจ {detail.confidence}%
                  </p>
                </div>
                <div className={`p-5 rounded-[1.5rem] ${detail.bg} ${detail.color} shadow-sm border border-white shrink-0`}>
                  <StatusIcon size={40} strokeWidth={2.5} />
                </div>
              </div>

              {/* อาการหลัก (Symptoms) */}
              <div className={`p-6 rounded-3xl border bg-opacity-50 font-['IBM_Plex_Sans_Thai'] ${detail.bg} ${detail.border}`}>
                <p className="text-sm font-bold text-slate-800 font-['Prompt'] mb-1">ลักษณะอาการหลัก:</p>
                <p className="text-slate-700 leading-relaxed font-medium">{detail.symptoms}</p>
              </div>
            </div>

            {/* TREATMENT CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="font-black text-xl text-slate-900 font-['Prompt'] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Leaf size={22} /></div>
                แนวทางการรักษาและจัดการสวน
              </h3>

              {!detail.isDisease ? (
                // กรณีใบปกติ
                <ul className="space-y-4">
                  {detail.healthyTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-slate-700 font-medium leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                // กรณีเป็นโรค -> แสดงแนวทางตาม 3 ระดับความรุนแรง (Stacked View)
                <div className="space-y-6">
                  <p className="text-sm font-bold text-slate-500 font-['Prompt'] mb-2">
                    เลือกวิธีปฏิบัติตาม <span className="text-orange-600">"ระดับความรุนแรงของอาการในทรงพุ่ม"</span> ที่ท่านพบจริงในสวน
                  </p>

                  {Object.entries(detail.treatments).map(([level, data]) => (
                    <div key={level} className={`p-5 rounded-3xl border ${severityStyles[data.color]}`}>
                      <h4 className="font-bold font-['Prompt'] text-lg flex items-center gap-2 mb-4">
                        {level === 'high' ? <AlertTriangle size={20} /> : <ShieldAlert size={20} />} 
                        {data.label}
                      </h4>
                      <ul className="space-y-3">
                        {data.items.map((rec, i) => {
                          let ListIcon = CheckCircle;
                          if(rec.includes('ตัด')) ListIcon = Scissors;
                          else if(rec.includes('พ่น')) ListIcon = Droplets;

                          return (
                            <li key={i} className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${iconStyles[data.color]}`}>
                                <ListIcon size={14} strokeWidth={3} />
                              </div>
                              <p className="font-medium leading-relaxed">{rec}</p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* ปรึกษาผู้เชี่ยวชาญ */}
              {detail.isDisease && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between p-5 bg-slate-900 rounded-[2rem]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-400">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold font-['Prompt']">อาการไม่ดีขึ้น?</p>
                      <p className="text-slate-400 text-xs font-medium">นำผลวิเคราะห์นี้ปรึกษานักวิชาการเกษตร</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-500" />
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      
      {/* ── CSS ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;500;600;700;800&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
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

export default HistoryDetailPage;