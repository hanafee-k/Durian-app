import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import {
  Camera, Upload, Leaf, AlertCircle, X, CheckCircle, 
  Shield, Scissors, Phone, Sparkles,
  ArrowLeft, Microscope, Info, Loader2,
  Image as ImageIcon, AlertTriangle, RefreshCw
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

const AI_SERVICE_URL = "http://localhost:8000"; // 🚀 URL ของ FastAPI (Python)

const mapDisease = (dbName) => {
  const mapping = {
    'Algal Leaf Spot': { 
      label: 'จุดสนิมสาหร่าย', 
      severity: 'warning',
      color: 'text-amber-600', 
      bg: 'bg-amber-100', 
      Icon: Microscope,
      border: 'border-amber-200',
      description: 'เกิดจากสาหร่าย มักพบจุดขุยสีส้มคล้ายสนิมบนหน้าใบ เกิดในสวนที่ความชื้นสูงและทรงพุ่มทึบ',
      recommendations: ['ตัดแต่งทรงพุ่มให้โปร่ง แสงแดดส่องถึง', 'พ่นสารคอปเปอร์ไฮดรอกไซด์', 'งดใส่ปุ๋ยไนโตรเจนสูงชั่วคราว']
    },
    'Healthy Leaf': { 
      label: 'ใบทุเรียนปกติ', 
      severity: 'normal',
      color: 'text-emerald-700', 
      bg: 'bg-emerald-100', 
      Icon: CheckCircle,
      border: 'border-emerald-200',
      description: 'ใบทุเรียนมีสุขภาพดี ไม่พบร่องรอยการติดเชื้อจากโรคระบาด',
      recommendations: ['ดูแลรดน้ำและใส่ปุ๋ยบำรุงตามรอบปกติ', 'หมั่นตรวจเช็คแปลงอย่างสม่ำเสมอเพื่อเฝ้าระวัง']
    },
    'Leaf Blight': { 
      label: 'โรคใบไหม้', 
      severity: 'high',
      color: 'text-red-600', 
      bg: 'bg-red-100', 
      Icon: AlertTriangle,
      border: 'border-red-200',
      description: 'เกิดจากเชื้อรา Rhizoctonia solani ระบาดหนักหน้าฝน ใบไหม้คล้ายโดนน้ำร้อนลวกและติดกันเป็นกระจุก',
      recommendations: ['ตัดใบและกิ่งที่ติดเชื้อไปเผาทำลายทิ้งนอกแปลง', 'พ่นสารคอปเปอร์ออกซีคลอไรด์ หรือ เฮกซะโคนาโซล ทุก 7–10 วัน']
    },
    'Phomopsis Leaf Spot': { 
      label: 'โรคใบจุดฟอร์มอปซิส', 
      severity: 'warning',
      color: 'text-orange-600', 
      bg: 'bg-orange-100', 
      Icon: Microscope,
      border: 'border-orange-200',
      description: 'เกิดจากเชื้อรา Phomopsis แผลจะมีลักษณะเป็นจุดสีน้ำตาลเล็กๆ ขอบแผลชัดเจน มักลุกลามเมื่อต้นทุเรียนอ่อนแอ',
      recommendations: ['บำรุงต้นให้แข็งแรงโดยการใส่ปุ๋ยตามระยะ', 'พ่นสารป้องกันกำจัดเชื้อรากลุ่ม คาร์เบนดาซิม หรือ แมนโคเซบ']
    }
  };
  return mapping[dbName] || { label: 'ไม่สามารถระบุได้', severity: 'unknown', color: 'text-slate-500', bg: 'bg-slate-100', Icon: AlertCircle, description: 'AI ไม่มีความมั่นใจเพียงพอในการระบุชนิดโรค', recommendations: ['ถ่ายรูปใหม่ให้ชัดเจนขึ้น', 'จัดตำแหน่งใบให้อยู่กลางภาพ'] };
};

const ScanPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dmgPct, setDmgPct] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  
  const fileRef = useRef(); 
  const camRef = useRef();

  const handleFile = useCallback(f => {
    setError('');
    setResult(null);
    if (!f) return;
    if (!['image/jpeg', 'image/png'].includes(f.type)) { 
      setError('รองรับเฉพาะไฟล์ JPG / PNG เท่านั้น'); 
      return; 
    }
    if (f.size > 5e6) { 
      setError('ขนาดไฟล์ต้องไม่เกิน 5 MB'); 
      return; 
    }
    setFile(f); 
    const r = new FileReader(); 
    r.onload = e => setPreview(e.target.result); 
    r.readAsDataURL(f);
  }, []);

  // ✅ 1. เพิ่ม Logic การลบรูปภาพและประวัติ
  const handleDelete = async () => {
    if (!result?.historyId) return;
    if (!window.confirm("คุณต้องการลบผลการสแกนและรูปภาพนี้ใช่หรือไม่?")) return;

    try {
      setLoading(true);
      // ยิง DELETE ไปที่ Node.js เพื่อลบทั้งใน DB และลบไฟล์ใน uploads/
      await api.delete(`/history/${result.historyId}`);
      
      setFile(null);
      setPreview(null);
      setResult(null);
      setError('');
      alert("ลบข้อมูลและไฟล์รูปภาพสำเร็จ");
    } catch (err) {
      console.error("Delete Error:", err);
      setError('ไม่สามารถลบข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. แก้ไข Logic การวิเคราะห์ (ยิงผ่านพอร์ต 5000 เพื่อให้ Multer เซฟรูป)
  const analyze = async () => {
    if (!file) return;
    setLoading(true); 
    setResult(null);
    setError('');
    
    const formData = new FormData();
    formData.append('image', file); // ⚠️ ใช้ชื่อ 'image' ให้ตรงกับ upload.single('image') ใน Node.js

    try {
      // ยิงไปที่ Node.js (5000) แทน AI (8000) เพื่อให้รูปถูกบันทึกลงเครื่อง
      const response = await api.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resData = response.data.data; // ข้อมูลจาก MongoDB
      const diseaseInfo = mapDisease(resData.diseaseName);

      setDmgPct(diseaseInfo.severity === 'normal' ? 0 : 20);
      setResult({
        ...diseaseInfo,
        confidence: Math.round(resData.confidence),
        rawName: resData.diseaseName,
        historyId: resData._id // เก็บ ID ไว้สำหรับสั่งลบ
      });

    } catch (err) {
      console.error("Analysis Error:", err);
      if (err.response?.status === 422) {
        // กรณี AI คืนค่าความมั่นใจต่ำ (low_confidence)
        setError(err.response.data.message);
      } else {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ (พอร์ต 5000)');
      }
    } finally {
      setLoading(false); 
    }
  };

  const clearImage = () => { setFile(null); setPreview(null); setResult(null); setError(''); };

  const getDmgInfo = (p) => {
    if (p === 0) return { text: 'ใบสุขภาพดีเยี่ยม', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle };
    if (p <= 30) return { text: 'เฝ้าระวัง / พ่นสารป้องกัน', color: 'text-green-700', bg: 'bg-green-100', icon: Shield };
    if (p <= 70) return { text: 'ตัดแต่งส่วนที่ติดเชื้อ', color: 'text-amber-700', bg: 'bg-amber-100', icon: Scissors };
    return { text: 'ปรึกษาเจ้าหน้าที่เกษตร', color: 'text-red-700', bg: 'bg-red-100', icon: Phone };
  };

  const DmgData = getDmgInfo(dmgPct);
  const DmgIcon = DmgData.icon;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-24 lg:pb-12 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-black text-gray-900 font-['Prompt']">ตรวจวินิจฉัยโรค</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 font-['Prompt']">
                <ImageIcon className="text-emerald-600 w-5 h-5" /> นำเข้าภาพถ่าย
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm font-black border border-red-100 font-['Prompt']">
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
                <span className="mx-4 text-gray-400 text-xs font-black uppercase font-['Prompt']">หรือ</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button onClick={() => camRef.current?.click()} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-['Prompt']">
                <Camera className="w-5 h-5" /> ถ่ายภาพใบทุเรียน
              </button>
              <input ref={camRef} type="file" accept="image/jpeg,image/png" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>
          </div>

          <div className="lg:col-span-7">
            {!preview ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 h-full flex flex-col justify-center min-h-[400px]">
                <div className="text-center">
                   <Sparkles className="text-amber-500 w-12 h-12 mx-auto mb-4 animate-pulse" />
                   <h3 className="text-xl font-black text-gray-900 mb-2 font-['Prompt']">พร้อมวิเคราะห์สุขภาพใบ</h3>
                   <p className="text-gray-500 font-bold">เลือกรูปภาพเพื่อเริ่มประมวลผลด้วย MobileNetV3</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/2 relative rounded-3xl overflow-hidden border border-gray-100 shadow-md">
                      <img src={preview} alt="preview" className="w-full aspect-square object-cover" />
                      <button onClick={clearImage} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                      <p className="text-xs font-black text-gray-400 flex items-center gap-2 font-['Prompt'] uppercase tracking-widest">
                         <Info size={16} /> สภาพไฟล์พร้อมใช้งาน
                      </p>
                      {!result && !loading ? (
                        <button onClick={analyze} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-95 font-['Prompt']">
                          <Sparkles size={20} /> วิเคราะห์ด้วย AI
                        </button>
                      ) : loading ? (
                        <div className="text-center py-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-2" />
                          <p className="text-sm font-black text-gray-700 font-['Prompt'] uppercase tracking-widest">Processing...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                           <button onClick={() => navigate(`/history/${result.historyId}`)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black font-['Prompt']">ดูรายละเอียดผลตรวจ</button>
                           <button onClick={clearImage} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black font-['Prompt']">สแกนภาพอื่น</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {result && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 opacity-30 ${result.bg}`}></div>
                      
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-1 font-['Prompt']">Result Diagnostic</p>
                          <h2 className="text-3xl font-black text-gray-900 leading-tight font-['Prompt']">{result.label}</h2>
                          <p className="text-sm text-emerald-600 font-black mt-2 font-['Prompt']">ความมั่นใจ: {result.confidence}%</p>
                        </div>
                        <div className={`p-5 rounded-2xl shadow-sm border border-white flex-shrink-0 ${result.bg} ${result.color}`}>
                          <result.Icon size={36} strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className={`p-6 rounded-3xl border bg-opacity-50 ${result.bg} ${result.border}`}>
                        <p className="text-gray-700 leading-relaxed font-black">{result.description}</p>
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