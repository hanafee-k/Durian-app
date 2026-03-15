import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Camera, Upload, AlertCircle, X, CheckCircle,
  Scissors, Phone, Sparkles, ArrowLeft, Microscope,
  Info, Loader2, Image as ImageIcon, AlertTriangle,
  Droplets, ShieldAlert
} from 'lucide-react';

// 🚀 ข้อมูลแนวทางการรักษา "แบบเต็ม 100%" 
const getTreatmentGuide = (disease, severityLevel) => {
  const guide = {
    'Algal Leaf Spot': {
      'low': [
        'ตัดใบที่เป็นโรคออกจากต้น',
        'ตัดแต่งทรงพุ่มให้โปร่งเพื่อลดความชื้น',
        'พ่นสาร คอปเปอร์ออกซีคลอไรด์ 85% WP 30–50 กรัม/น้ำ 20 ลิตร'
      ],
      'mid': [
        'ตัดกิ่งและใบที่เป็นโรคบางส่วน',
        'พ่น คอปเปอร์ออกซีคลอไรด์ หรือ คอปเปอร์ไฮดรอกไซด์',
        'พ่นซ้ำทุก 7–10 วัน จนควบคุมได้'
      ],
      'high': [
        'ตัดแต่งกิ่งหนัก เพื่อลดการสะสมของโรค',
        'พ่นสารคอปเปอร์ทั่วทรงพุ่มและลำต้น',
        'ปรับระบบสวน เช่น ระยะปลูก การระบายอากาศ และการให้น้ำ'
      ]
    },
    'Phomopsis Leaf Spot': {
      'low': [
        'ตัดใบที่เป็นโรคออก',
        'ลดความชื้นในสวน',
        'พ่น แมนโคเซบ 50–60 กรัม/น้ำ 20 ลิตร'
      ],
      'mid': [
        'ตัดกิ่งและใบที่เป็นโรคออกบางส่วน',
        'พ่นสารป้องกันเชื้อรา เช่น แมนโคเซบ อะซอกซีสโตรบิน โพรพิเนบ',
        'พ่นซ้ำทุก 7 วัน'
      ],
      'high': [
        'ตัดแต่งกิ่งหนัก',
        'พ่นสารกำจัดเชื้อราทั่วต้น เช่น อะซอกซีสโตรบิน หรือ คาร์เบนดาซิม',
        'พ่นต่อเนื่อง 2–3 ครั้ง ห่างกัน 7 วัน'
      ]
    },
    'Leaf Blight': {
      'low': [
        'ตัดใบที่เป็นโรคออก',
        'ปรับระบบระบายน้ำในสวน',
        'พ่น ฟอสเอทิล-อะลูมิเนียม 40–50 กรัม/น้ำ 20 ลิตร'
      ],
      'mid': [
        'ตัดกิ่งที่เป็นโรค',
        'พ่นสารกำจัดเชื้อรา เช่น เมทาแลกซิล หรือ ฟอสเอทิล-Al',
        'พ่นซ้ำทุก 7–10 วัน'
      ],
      'high': [
        'ตัดแต่งกิ่งที่เป็นโรครุนแรง',
        'พ่นสารทั่วต้นและบริเวณโคนต้น',
        'ปรับปรุงดินและระบบระบายน้ำ',
        'หากต้นทรุดหนักควร ฟื้นฟูต้นหรือเปลี่ยนต้นใหม่'
      ]
    }
  };

  return guide[disease]?.[severityLevel] || [];
};

// 🚀 ข้อมูลอาการหลัก "แบบเต็ม 100%"
const mapDisease = (dbName) => {
  const mapping = {
    'Algal Leaf Spot': {
      label: 'โรคใบจุดสาหร่าย (Algal Leaf Spot)',
      isDisease: true, color: 'text-amber-600', bg: 'bg-amber-50', Icon: Microscope, border: 'border-amber-200',
      symptoms: 'จุดกลมหรือปื้นสีแดง-ส้ม ผิวสาก มักพบในสวนที่มีความชื้นสูง'
    },
    'Healthy Leaf': {
      label: 'ใบทุเรียนปกติ (Healthy)',
      isDisease: false, color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: CheckCircle, border: 'border-emerald-200',
      symptoms: 'ใบมีสีเขียวสม่ำเสมอ ผิวมันเงา สุขภาพดี ไม่พบร่องรอยการติดเชื้อ',
      recommendations: ['ดูแลรดน้ำและใส่ปุ๋ยบำรุงตามรอบปกติ', 'หมั่นตรวจเช็คแปลงอย่างสม่ำเสมอ']
    },
    'Leaf Blight': {
      label: 'โรคใบไหม้ (Leaf Blight)',
      isDisease: true, color: 'text-red-600', bg: 'bg-red-50', Icon: AlertTriangle, border: 'border-red-200',
      symptoms: 'ใบมีแผลสีน้ำตาลไหม้ เริ่มจากขอบหรือปลายใบ ใบร่วงเร็ว'
    },
    'Phomopsis Leaf Spot': {
      label: 'โรคใบจุดเชื้อรา (Fungal Leaf Spot)',
      isDisease: true, color: 'text-orange-600', bg: 'bg-orange-50', Icon: Microscope, border: 'border-orange-200',
      symptoms: 'จุดสีน้ำตาลกลมหรือรี มีขอบชัด บางครั้งมีวงเหลือง'
    }
  };
  return mapping[dbName] || {
    label: 'ไม่สามารถระบุได้',
    isDisease: false, color: 'text-slate-500', bg: 'bg-slate-50', Icon: AlertCircle, border: 'border-slate-200',
    symptoms: 'AI ไม่มีความมั่นใจเพียงพอในการระบุชนิดโรค',
    recommendations: ['กรุณาถ่ายรูปใหม่ให้ชัดเจนขึ้น หรือโฟกัสที่รอยโรค']
  };
};

const ScanPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef();
  const camRef = useRef();

  const handleFile = useCallback(f => {
    setError('');
    setAiResult(null);
    setFinalResult(null);
    if (!f) return;
    if (!['image/jpeg', 'image/png'].includes(f.type)) { setError('รองรับเฉพาะไฟล์ JPG / PNG เท่านั้น'); return; }
    if (f.size > 5e6) { setError('ขนาดไฟล์ต้องไม่เกิน 5 MB'); return; }

    setFile(f);
    const r = new FileReader();
    r.onload = e => setPreview(e.target.result);
    r.readAsDataURL(f);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setAiResult(null);
    setFinalResult(null);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resData = response.data.data;
      const diseaseInfo = mapDisease(resData.diseaseName);

      const baseResult = {
        ...diseaseInfo,
        confidence: Math.round(resData.confidence),
        rawName: resData.diseaseName,
        historyId: resData._id
      };

      setAiResult(baseResult);

      if (!diseaseInfo.isDisease) {
        setFinalResult(baseResult);
      }

    } catch (err) {
      console.error("Analysis Error:", err);
      if (err.response?.status === 422) {
        setError(err.response.data.message);
      } else {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeveritySelect = async (level) => {
    setLoading(true);
    try {
      const treatments = getTreatmentGuide(aiResult.rawName, level);

      const levelLabels = {
        'low': '≤ 50% ของทรงพุ่ม',
        'mid': '50–79% ของทรงพุ่ม',
        'high': '≥ 80% ของทรงพุ่ม'
      };

      setFinalResult({
        ...aiResult,
        severityLevel: level,
        severityLabel: levelLabels[level],
        recommendations: treatments
      });
    } catch (error) {
      console.error("Error setting severity:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => { setFile(null); setPreview(null); setAiResult(null); setFinalResult(null); setError(''); };

  return (
    <div className="min-h-screen bg-[#fafaf8] font-['IBM_Plex_Sans_Thai'] pb-24 lg:pb-12 text-slate-800">

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200/60">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-xl font-black text-slate-900 font-['Prompt'] tracking-tight">ระบบตรวจวินิจฉัยโรค</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── 1. ส่วนอัปโหลดรูปภาพ (ตามภาพ Reference) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2.5 font-['Prompt']">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <ImageIcon size={20} />
                </div>
                นำเข้าภาพถ่าย
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 mb-6 text-sm font-bold border border-red-100 animate-in fade-in duration-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                className={`border-[2.5px] border-dashed rounded-[28px] p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] ${dragOver ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:bg-emerald-50/30 hover:border-emerald-400'
                  }`}
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-5 border border-slate-100">
                  <Upload className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-lg font-black text-slate-800 font-['Prompt'] mb-1">ลากไฟล์วาง หรือคลิกที่นี่</p>
                <p className="text-xs font-medium text-slate-400 font-sans">รองรับเฉพาะ JPG, PNG (สูงสุด 5MB)</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>

              <div className="relative flex py-8 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="mx-4 text-slate-300 text-xs font-black uppercase font-sans tracking-widest">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button onClick={() => camRef.current?.click()} className="w-full bg-emerald-600 text-white py-4 rounded-[20px] font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95 transition-all font-['Prompt'] text-[15px]">
                <Camera size={20} /> ถ่ายภาพใบ
              </button>
              <input ref={camRef} type="file" accept="image/jpeg,image/png" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>
          </div>

          {/* ── 2. ส่วนแสดงผลและวิเคราะห์ (ตามภาพ Reference) ── */}
          <div className="lg:col-span-7">
            {!preview ? (
              <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 h-full flex flex-col justify-center min-h-[450px]">
                <div className="text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-amber-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner">
                    <Sparkles className="text-amber-400 w-10 h-10 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 font-['Prompt'] tracking-tight">พร้อมวิเคราะห์สุขภาพใบ</h3>
                  <p className="text-slate-500 font-medium text-sm">อัปโหลดหรือถ่ายรูปภาพเพื่อเริ่มประมวลผลด้วย AI</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

                {/* พรีวิวรูปและปุ่มวิเคราะห์ */}
                <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2 relative rounded-[24px] overflow-hidden border-4 border-slate-50 shadow-md">
                      <img src={preview} alt="preview" className="w-full aspect-square object-cover" />
                      <button onClick={clearImage} className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 p-2.5 rounded-2xl shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-colors">
                        <X size={18} strokeWidth={3} />
                      </button>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                      {!aiResult && !loading ? (
                        <>
                          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2">
                            <p className="text-sm font-bold text-blue-800 font-['Prompt'] flex items-center gap-2 mb-1">
                              <Info size={16} /> ข้อแนะนำ
                            </p>
                            <p className="text-xs text-blue-600">กรุณาตรวจสอบว่าภาพมีความคมชัดและเห็นรอยโรคชัดเจน เพื่อความแม่นยำของ AI</p>
                          </div>
                          <button onClick={analyze} className="w-full bg-[#133c27] text-white py-4 rounded-[20px] font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-900 flex items-center justify-center gap-3 transition-all active:scale-95 font-['Prompt']">
                            <Sparkles size={20} className="text-emerald-300" /> เริ่มวิเคราะห์ด้วย AI
                          </button>
                        </>
                      ) : loading ? (
                        <div className="text-center py-10 bg-slate-50 rounded-[24px] border border-slate-100 flex flex-col items-center">
                          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                          <p className="text-sm font-black text-slate-700 font-['Prompt'] uppercase tracking-widest">Processing...</p>
                        </div>
                      ) : (
                        <button onClick={clearImage} className="w-full bg-slate-100 text-slate-600 py-4 rounded-[20px] font-bold font-['Prompt'] hover:bg-slate-200 transition-colors shadow-sm">
                          อัปโหลดภาพอื่น
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 2: ประเมินทรงพุ่ม (UI หรูหรา) */}
                {aiResult && aiResult.isDisease && !finalResult && !loading && (
                  <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-orange-500/10 border-2 border-orange-100 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500"></div>

                    <div className="mb-6">
                      <h3 className="text-2xl font-black font-['Prompt'] text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-xl text-orange-500"><AlertTriangle size={24} /></div>
                        AI ตรวจพบ: {aiResult.label}
                      </h3>

                      <div className="mt-4 bg-slate-50 p-5 rounded-[20px] border border-slate-100">
                        <p className="text-[13px] font-black text-slate-400 tracking-widest uppercase font-sans mb-1">Symptoms</p>
                        <p className="text-slate-700 font-medium text-[15px]">{aiResult.symptoms}</p>
                      </div>

                      <p className="text-slate-600 mt-6 font-bold text-[15px]">เพื่อความแม่นยำในการรักษา กรุณาประเมิน <span className="text-orange-600">"ระดับความรุนแรงในทรงพุ่ม"</span></p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button onClick={() => handleSeveritySelect('low')} className="w-full p-5 bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-[20px] flex items-center justify-between transition-all group text-left shadow-sm">
                        <p className="font-bold text-emerald-700 font-['Prompt'] text-lg">≤ 50% ของทรงพุ่ม (น้อย)</p>
                        <CheckCircle size={24} className="text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                      </button>

                      <button onClick={() => handleSeveritySelect('mid')} className="w-full p-5 bg-white border-2 border-amber-100 hover:border-amber-500 hover:bg-amber-50/50 rounded-[20px] flex items-center justify-between transition-all group text-left shadow-sm">
                        <p className="font-bold text-amber-700 font-['Prompt'] text-lg">50–79% ของทรงพุ่ม (ปานกลาง)</p>
                        <ShieldAlert size={24} className="text-amber-300 group-hover:text-amber-500 transition-colors" />
                      </button>

                      <button onClick={() => handleSeveritySelect('high')} className="w-full p-5 bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50/50 rounded-[20px] flex items-center justify-between transition-all group text-left shadow-sm">
                        <p className="font-bold text-rose-700 font-['Prompt'] text-lg">≥ 80% ของทรงพุ่ม (รุนแรง)</p>
                        <AlertTriangle size={24} className="text-rose-300 group-hover:text-rose-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: แสดงผลลัพธ์สุดท้ายและวิธีการรักษา */}
                {finalResult && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-48 h-48 rounded-bl-full -z-10 opacity-40 ${finalResult.bg}`}></div>

                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-2 font-sans">Diagnostic Result</p>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-['Prompt']">{finalResult.label}</h2>
                          <div className="inline-flex items-center gap-1.5 mt-3 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            <Sparkles size={14} className="text-emerald-500" />
                            <p className="text-xs text-slate-600 font-bold font-['Prompt']">ความมั่นใจ: <span className="text-emerald-600">{finalResult.confidence}%</span></p>
                          </div>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl shadow-sm border border-white flex items-center justify-center flex-shrink-0 ${finalResult.bg} ${finalResult.color}`}>
                          <finalResult.Icon size={32} strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className={`p-5 rounded-[24px] border mb-8 ${finalResult.bg} ${finalResult.border}`}>
                        <p className="text-[11px] font-black text-slate-500 font-sans uppercase tracking-widest mb-1.5">Symptoms</p>
                        <p className="text-slate-800 leading-relaxed font-medium text-[15px]">{finalResult.symptoms}</p>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 font-['Prompt'] flex items-center gap-2 mb-5 text-lg">
                          <div className="p-1.5 bg-slate-100 rounded-lg"><Scissors size={18} className="text-emerald-600" /></div>
                          {finalResult.isDisease ? `แนวทางการรักษา (${finalResult.severityLabel})` : 'คำแนะนำการดูแล'}
                        </h4>

                        <ul className="space-y-3">
                          {finalResult.recommendations?.map((rec, i) => {
                            let ListIcon = CheckCircle;
                            if (rec.includes('ตัด')) ListIcon = Scissors;
                            else if (rec.includes('พ่น')) ListIcon = Droplets;

                            return (
                              <li key={i} className="flex items-start gap-4 bg-slate-50/50 p-4 rounded-[20px] border border-slate-100 hover:border-emerald-100 transition-colors">
                                <div className="mt-0.5 bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-emerald-500 flex-shrink-0">
                                  <ListIcon size={16} strokeWidth={2.5} />
                                </div>
                                <p className="text-slate-700 font-medium leading-relaxed text-[15px] pt-1">{rec}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
                        <button onClick={() => navigate(`/history/${finalResult.historyId}`)} className="flex-1 bg-[#111827] text-white py-4.5 rounded-[20px] font-bold font-['Prompt'] hover:bg-slate-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
                          บันทึกและดูประวัติการสแกน <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>


      {/* โหลด Fonts สำหรับหน้า Scan */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;600;700;800;900&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

// Component ArrowRight ที่ไม่มีใน lucide-react list ด้านบน (เพิ่มเข้ามาเพื่อความสวยงามของปุ่ม)
const ArrowRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

export default ScanPage;