import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import {
  Camera, Upload, AlertCircle, X, CheckCircle, 
  Scissors, Phone, Sparkles, ArrowLeft, Microscope, 
  Info, Loader2, Image as ImageIcon, AlertTriangle,
  Droplets, ShieldAlert
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

// 🚀 ข้อมูลแนวทางการรักษา "แบบเต็ม 100%" ตามที่บรีฟมา
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
    'Phomopsis Leaf Spot': { // ใช้ข้อมูลของโรคใบจุดเชื้อรา (Fungal Leaf Spot)
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
      isDisease: true, color: 'text-amber-600', bg: 'bg-amber-100', Icon: Microscope, border: 'border-amber-200', 
      symptoms: 'จุดกลมหรือปื้นสีแดง-ส้ม ผิวสาก มักพบในสวนที่มีความชื้นสูง' 
    },
    'Healthy Leaf': { 
      label: 'ใบทุเรียนปกติ (Healthy)', 
      isDisease: false, color: 'text-emerald-700', bg: 'bg-emerald-100', Icon: CheckCircle, border: 'border-emerald-200', 
      symptoms: 'ใบมีสีเขียวสม่ำเสมอ ผิวมันเงา สุขภาพดี ไม่พบร่องรอยการติดเชื้อ', 
      recommendations: ['ดูแลรดน้ำและใส่ปุ๋ยบำรุงตามรอบปกติ', 'หมั่นตรวจเช็คแปลงอย่างสม่ำเสมอ'] 
    },
    'Leaf Blight': { 
      label: 'โรคใบไหม้ (Leaf Blight)', 
      isDisease: true, color: 'text-red-600', bg: 'bg-red-100', Icon: AlertTriangle, border: 'border-red-200', 
      symptoms: 'ใบมีแผลสีน้ำตาลไหม้ เริ่มจากขอบหรือปลายใบ ใบร่วงเร็ว' 
    },
    'Phomopsis Leaf Spot': { 
      label: 'โรคใบจุดเชื้อรา (Fungal Leaf Spot)', 
      isDisease: true, color: 'text-orange-600', bg: 'bg-orange-100', Icon: Microscope, border: 'border-orange-200', 
      symptoms: 'จุดสีน้ำตาลกลมหรือรี มีขอบชัด บางครั้งมีวงเหลือง' 
    }
  };
  return mapping[dbName] || { 
    label: 'ไม่สามารถระบุได้', 
    isDisease: false, color: 'text-slate-500', bg: 'bg-slate-100', Icon: AlertCircle, border: 'border-slate-200',
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

      // ถ้าเป็นใบปกติ ข้ามการประเมินทรงพุ่มได้เลย
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
    <div className="min-h-screen bg-gray-50/50 font-['IBM_Plex_Sans_Thai'] pb-24 lg:pb-12 text-slate-800">
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-black text-gray-900 font-['Prompt']">ระบบตรวจวินิจฉัยโรค</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── 1. ส่วนอัปโหลดรูปภาพ ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 font-['Prompt']">
                <ImageIcon className="text-emerald-600 w-5 h-5" /> นำเข้าภาพถ่าย
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm font-bold border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${
                  dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-emerald-400'
                }`}
              >
                <Upload className="w-12 h-12 text-emerald-600 mb-4" />
                <p className="text-lg font-black text-gray-800 font-['Prompt']">ลากไฟล์วาง หรือคลิกที่นี่</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>

              <div className="relative flex py-6 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 text-gray-400 text-xs font-black uppercase font-sans">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button onClick={() => camRef.current?.click()} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-['Prompt']">
                <Camera className="w-5 h-5" /> ถ่ายภาพใบ
              </button>
              <input ref={camRef} type="file" accept="image/jpeg,image/png" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>
          </div>

          {/* ── 2. ส่วนแสดงผลและวิเคราะห์ ── */}
          <div className="lg:col-span-7">
            {!preview ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 h-full flex flex-col justify-center min-h-[400px]">
                <div className="text-center">
                   <Sparkles className="text-amber-500 w-12 h-12 mx-auto mb-4 animate-pulse" />
                   <h3 className="text-xl font-black text-gray-900 mb-2 font-['Prompt']">พร้อมวิเคราะห์สุขภาพใบ</h3>
                   <p className="text-gray-500 font-medium">เลือกรูปภาพเพื่อเริ่มประมวลผลด้วย AI</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* พรีวิวรูปและปุ่มวิเคราะห์ */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 relative rounded-3xl overflow-hidden border border-gray-100 shadow-md">
                      <img src={preview} alt="preview" className="w-full aspect-square object-cover" />
                      <button onClick={clearImage} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                      {!aiResult && !loading ? (
                        <button onClick={analyze} className="w-full bg-[#1b4332] text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-900 flex items-center justify-center gap-3 transition-all active:scale-95 font-['Prompt']">
                          <Sparkles size={20} /> วิเคราะห์ด้วย AI
                        </button>
                      ) : loading ? (
                        <div className="text-center py-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-black text-gray-700 font-['Prompt'] uppercase tracking-widest">Processing...</p>
                        </div>
                      ) : (
                        <button onClick={clearImage} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold font-['Prompt'] hover:bg-slate-200">
                          สแกนภาพอื่น
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 2: ประเมินทรงพุ่ม (แสดงเมื่อ AI ตรวจพบว่าเป็นโรค และยังไม่ได้เลือกระดับ) */}
                {aiResult && aiResult.isDisease && !finalResult && !loading && (
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-2 border-orange-200 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
                    
                    <div className="mb-6">
                      <h3 className="text-2xl font-black font-['Prompt'] text-slate-900 flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" /> AI ตรวจพบ: {aiResult.label}
                      </h3>
                      
                      {/* อาการหลักแบบเต็ม */}
                      <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <p className="text-sm font-bold text-slate-800 font-['Prompt'] mb-1">อาการหลัก:</p>
                        <p className="text-slate-600 font-medium">{aiResult.symptoms}</p>
                      </div>
                      
                      <p className="text-slate-600 mt-5 font-bold">เพื่อความแม่นยำ กรุณาประเมิน <span className="text-orange-600">"ระดับความรุนแรงของอาการในทรงพุ่ม"</span></p>
                    </div>
                    
                    {/* ปุ่มเลือกระดับความรุนแรงแบบเต็ม */}
                    <div className="flex flex-col gap-3">
                      <button onClick={() => handleSeveritySelect('low')} className="w-full p-4 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-between transition-all group text-left">
                        <div>
                          <p className="font-bold text-emerald-700 font-['Prompt'] text-lg">≤ 50% ของทรงพุ่ม</p>
                        </div>
                        <CheckCircle className="text-emerald-300 group-hover:text-emerald-500" />
                      </button>
                      
                      <button onClick={() => handleSeveritySelect('mid')} className="w-full p-4 border-2 border-amber-100 hover:border-amber-500 hover:bg-amber-50 rounded-2xl flex items-center justify-between transition-all group text-left">
                        <div>
                          <p className="font-bold text-amber-700 font-['Prompt'] text-lg">50–79% ของทรงพุ่ม</p>
                        </div>
                        <ShieldAlert className="text-amber-300 group-hover:text-amber-500" />
                      </button>
                      
                      <button onClick={() => handleSeveritySelect('high')} className="w-full p-4 border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 rounded-2xl flex items-center justify-between transition-all group text-left">
                        <div>
                          <p className="font-bold text-rose-700 font-['Prompt'] text-lg">≥ 80% ของทรงพุ่ม</p>
                        </div>
                        <X className="text-rose-300 group-hover:text-rose-500" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: แสดงผลลัพธ์สุดท้ายและวิธีการรักษาแบบเต็ม */}
                {finalResult && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 opacity-30 ${finalResult.bg}`}></div>
                      
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-1 font-['Prompt']">Diagnostic Result</p>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight font-['Prompt']">{finalResult.label}</h2>
                          <p className="text-sm text-emerald-600 font-black mt-2 font-['Prompt']">ความมั่นใจจาก AI: {finalResult.confidence}%</p>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm border border-white flex-shrink-0 ${finalResult.bg} ${finalResult.color}`}>
                          <finalResult.Icon size={32} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* แสดงอาการหลัก */}
                      <div className={`p-5 rounded-3xl border bg-opacity-50 mb-6 ${finalResult.bg} ${finalResult.border}`}>
                        <p className="text-sm font-bold text-gray-800 font-['Prompt'] mb-1">อาการหลัก:</p>
                        <p className="text-gray-700 leading-relaxed font-medium">{finalResult.symptoms}</p>
                      </div>

                      {/* แนวทางการรักษา (Treatment Guide) */}
                      <div>
                        <h4 className="font-bold text-slate-900 font-['Prompt'] flex items-center gap-2 mb-4 text-lg">
                          <Scissors size={20} className="text-emerald-600" /> 
                          {finalResult.isDisease ? `การรักษา (${finalResult.severityLabel})` : 'คำแนะนำการดูแล'}
                        </h4>
                        
                        <ul className="space-y-3">
                          {finalResult.recommendations?.map((rec, i) => {
                            // เช็คเพื่อใส่ Icon ให้เข้ากับบริบทข้อความ
                            let ListIcon = CheckCircle;
                            if(rec.includes('ตัด')) ListIcon = Scissors;
                            else if(rec.includes('พ่น')) ListIcon = Droplets;

                            return (
                              <li key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="mt-0.5 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 text-emerald-600 flex-shrink-0">
                                  <ListIcon size={16} />
                                </div>
                                <p className="text-slate-700 font-medium leading-relaxed">{rec}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                        <button onClick={() => navigate(`/history/${finalResult.historyId}`)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold font-['Prompt'] hover:bg-slate-800 transition-colors">
                          บันทึกและดูประวัติ
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
      <div className="lg:hidden"><BottomNav /></div>
    </div>
  );
};

export default ScanPage;