import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { 
  ArrowLeft, Calendar, Clock, AlertTriangle, 
  CheckCircle, Leaf, Thermometer, Microscope, 
  Loader2, Image as ImageIcon
} from 'lucide-react';

const API_URL = "http://localhost:5000";

/* ─── Helpers (คงเดิม) ─── */
const thaiDate = d => {
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`;
};

const mapDiseaseInfo = (dbName) => {
  const mapping = {
    'Healthy Leaf': { label: 'ใบทุเรียนปกติ', severity: 'normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', Icon: CheckCircle, description: 'ใบทุเรียนมีสุขภาพดี ไม่พบร่องรอยการติดเชื้อของโรคระบาดในภาพนี้', recommendations: ['ดูแลรดน้ำและใส่ปุ๋ยบำรุงตามรอบปกติ', 'หมั่นตรวจเช็คสวนอย่างสม่ำเสมอ'] },
    'Algal Leaf Spot': { label: 'โรคจุดสนิมสาหร่าย', severity: 'warning', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', Icon: Microscope, description: 'เกิดจากสาห่ราย มักพบในช่วงความชื้นสูงหรือทรงพุ่มทึบเกินไป', recommendations: ['ตัดแต่งทรงพุ่มให้โปร่งเพื่อให้แสงแดดส่องถึง', 'พ่นสารกลุ่มคอปเปอร์ (Copper) หากระบาดรุนแรง'] },
    'Leaf Blight': { label: 'โรคใบไหม้', severity: 'high', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', Icon: AlertTriangle, description: 'เกิดจากเชื้อรา Rhizoctonia solani ใบจะไหม้แห้งคล้ายถูกน้ำร้อนลวก', recommendations: ['เก็บกวาดใบที่เป็นโรคไปเผาทำลายทิ้ง', 'พ่นสารป้องกันกำจัดเชื้อรา เช่น เฮกซะโคนาโซล'] },
    'Phomopsis Leaf Spot': { label: 'โรคใบจุดฟอร์มอปซิส', severity: 'warning', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', Icon: Microscope, description: 'เกิดจากเชื้อรา Phomopsis sp. แผลจะมีลักษณะเป็นจุดสีน้ำตาลเล็กๆ ขอบชัดเจน', recommendations: ['บำรุงต้นให้แข็งแรงโดยการใส่ปุ๋ยตามระยะ', 'พ่นสารกำจัดเชื้อรากลุ่ม แมนโคเซบ'] }
  };
  return mapping[dbName] || mapping['Healthy Leaf']; 
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

        setDetail({
          id: data._id,
          rawDisease: data.diseaseName,
          confidence: Math.round(parseFloat(data.confidence)),
          dateStr: thaiDate(dateObj),
          timeStr: dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          imagePath: data.imagePath ? `${API_URL}/uploads/${data.imagePath.split('/').pop()}` : null,
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
      <p className="text-emerald-900 font-black tracking-widest text-sm uppercase">Loading analysis...</p>
    </div>
  );

  if (error || !detail) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
      <p className="text-slate-800 font-black text-lg mb-6">{error}</p>
      <button onClick={() => navigate(-1)} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">กลับไปหน้าประวัติ</button>
    </div>
  );

  const StatusIcon = detail.Icon;

  return (
    <div className="min-h-screen bg-[#f2f5ee] font-['Sarabun'] pb-12">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-900/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-emerald-50 rounded-xl transition-all border border-emerald-900/10 shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-black text-emerald-950 font-['Prompt'] tracking-tight">รายละเอียดผลวิเคราะห์</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {detail.id.substring(18)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-emerald-900/5">
              <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                {detail.imagePath ? (
                  <img src={detail.imagePath} alt="Leaf" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300"><ImageIcon size={48} className="mb-2 opacity-50" /><p className="text-sm font-black uppercase">No Image</p></div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-['Prompt']">
              <div className="bg-white p-5 rounded-[2rem] border border-emerald-900/5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500"><Calendar size={20} /></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">วันที่ตรวจ</p><p className="text-sm font-black text-slate-800 leading-none">{detail.dateStr}</p></div>
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-emerald-900/5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Thermometer size={20} /></div>
                <div><p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">ความมั่นใจ</p><p className="text-sm font-black text-emerald-600 leading-none">{detail.confidence}%</p></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-emerald-900/5 relative overflow-hidden font-['Prompt']">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 opacity-30 ${detail.bg}`}></div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Analysis Results</p>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{detail.label}</h2>
                  <p className="text-sm text-emerald-600 font-black mt-2">AI Confidence: {detail.confidence}%</p>
                </div>
                <div className={`p-5 rounded-[1.5rem] ${detail.bg} ${detail.color} shadow-sm border border-white flex-shrink-0`}>
                  <StatusIcon size={36} strokeWidth={2.5} />
                </div>
              </div>
              <div className={`p-6 rounded-3xl border bg-opacity-50 font-['Sarabun'] ${detail.bg} ${detail.border}`}>
                <p className="text-slate-700 leading-relaxed font-bold">{detail.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-emerald-900/5">
              <h3 className="font-black text-xl text-emerald-950 font-['Prompt'] mb-8 flex items-center gap-3 leading-none">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Leaf size={22} /></div>
                แนวทางจัดการสวน
              </h3>
              <ul className="space-y-4">
                {detail.recommendations.map((item, index) => (
                  <li key={index} className="flex gap-5 items-start p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black shrink-0 border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">{index + 1}</div>
                    <p className="text-slate-700 font-bold leading-relaxed pt-1">{item}</p>
                  </li>
                ))}
              </ul>
              {detail.severity !== 'normal' && (
                <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 font-['Prompt']">
                  <AlertTriangle size={20} className="text-amber-400" /> ส่งข้อมูลปรึกษาผู้เชี่ยวชาญ
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HistoryDetailPage;