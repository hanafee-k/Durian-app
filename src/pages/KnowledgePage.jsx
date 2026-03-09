import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, CheckCircle,
  CircleAlert, Microscope, ShieldCheck,
  Sprout, Droplets, Scissors, AlertTriangle, Bug, ExternalLink
} from 'lucide-react';

/* ─── THEME PALETTE FOR TAILWIND ─── */
const themeMap = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', iconBg: 'bg-white', gradient: 'from-emerald-50 to-teal-50/50' },
  red: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', iconBg: 'bg-white', gradient: 'from-rose-50 to-red-50/50' },
  rose: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', iconBg: 'bg-white', gradient: 'from-pink-50 to-rose-50/50' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', iconBg: 'bg-white', gradient: 'from-slate-50 to-gray-100/50' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', iconBg: 'bg-white', gradient: 'from-amber-50 to-yellow-50/50' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', iconBg: 'bg-white', gradient: 'from-orange-50 to-amber-50/50' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', iconBg: 'bg-white', gradient: 'from-purple-50 to-fuchsia-50/50' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', iconBg: 'bg-white', gradient: 'from-yellow-50 to-amber-50/50' },
  pink: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-100', iconBg: 'bg-white', gradient: 'from-fuchsia-50 to-pink-50/50' },
};

/* ─── DATA (ดึงจากกรมวิชาการเกษตร) ─── */
const KNOWLEDGE_DATA = [
  {
    id: 'normal', title: 'ใบทุเรียนปกติ', en: 'Healthy Leaf', theme: 'green',
    Icon: CheckCircle, ref: 'การดูแลพื้นฐาน',
    rows: [
      { icon: Sprout, l: 'ลักษณะทั่วไป', v: 'ใบมีสีเขียวสม่ำเสมอ ผิวมันเงา ไม่มีจุดหรือรอยไหม้ ขอบใบเรียบไม่หยักงอ' },
      { icon: ShieldCheck, l: 'การดูแล', v: 'รักษาความชื้นในดินให้เหมาะสม ตัดแต่งทรงพุ่มให้โปร่งรับแสง และบำรุงด้วยปุ๋ยตามรอบปกติ' },
    ],
  },
  {
    id: 'blight', title: 'โรคใบไหม้ / ไฟทอปธอรา', en: 'Phytophthora Leaf Blight', theme: 'red',
    Icon: AlertTriangle, ref: 'บริษัท แอ็กโกร (ประเทศไทย) จำกัด',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เชื้อรา Phytophthora palmivora มักระบาดหนักในช่วงฤดูฝนที่มีฝนตกชุกต่อเนื่อง' },
      { icon: CircleAlert, l: 'อาการ', v: 'มีจุดคล้ายแผลไหม้ ช้ำ ฉ่ำน้ำ แผลมีสีดำ ส่วนใหญ่เข้าทำลายในช่วงใบเพสลาด' },
      { icon: Scissors, l: 'การรักษา', v: 'พ่น อะซอกซีสโตรบิน 25% SC (100–150 มล.) + แมนโคเซบ 64% WP (500 ก.) ต่อน้ำ 200 ลิตร' },
    ],
  },
  {
    id: 'anthracnose', title: 'โรคใบติด / แอนแทรคโนส', en: 'Anthracnose', theme: 'rose',
    Icon: AlertTriangle, ref: 'Kasetnumchok / CGD 5',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เชื้อรา Colletotrichum zibethinum เข้าทำลายช่อดอกในระยะช่อบาน' },
      { icon: CircleAlert, l: 'อาการ', v: 'ดอกมีสีคล้ำ เน่าดำก่อนบาน มีราสีเทาดำปกคลุมเกสร ทำให้ดอกแห้งร่วงหล่น' },
      { icon: Scissors, l: 'การรักษา', v: 'ฉีดพ่น คีโตแม็กซ์ (20–40 ซีซี/น้ำ 20 ล.) ทุก 7 วัน หรือ Mancozeb สลับ Carbendazim' },
    ],
  },
  {
    id: 'powdery-mildew', title: 'โรคราแป้ง', en: 'Powdery Mildew', theme: 'slate',
    Icon: Microscope, ref: 'Erysiphe quercicola Study',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เชื้อรา Oidium sp. แพร่ระบาดทางลมในช่วงอากาศแห้งและเย็น' },
      { icon: CircleAlert, l: 'อาการ', v: 'มีเส้นใยและสปอร์สีขาวคล้ายฝุ่นแป้งปกคลุมผิวพืช ผลชะงักการโต ผิวหยาบกร้าน' },
      { icon: Scissors, l: 'การรักษา', v: 'พ่นสารป้องกันกำจัดเชื้อรา เช่น เบนโนมิล หรือ กำมะถันผงชนิดละลายน้ำ' },
    ],
  },
  {
    id: 'algal-spot', title: 'โรคใบจุดสาหร่าย', en: 'Algal Leaf Spot', theme: 'amber',
    Icon: Sprout, ref: 'สำนักงานเกษตรจังหวัดตราด',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'สาหร่ายสีเขียว Cephaleuros virescens Kunze ระบาดมากในช่วงฤดูฝน' },
      { icon: CircleAlert, l: 'อาการ', v: 'จุดสีเทาอ่อนปนเขียว นูนขึ้นเล็กน้อย เมื่อแก่เปลี่ยนเป็นสีแดงสนิมเหล็กคล้ายกำมะหยี่' },
      { icon: Scissors, l: 'การรักษา', v: 'พบใบถูกทำลายเกิน 30% พ่น คอปเปอร์ออกซีคลอไรด์ 85% WP (50 ก./น้ำ 20 ล.)' },
    ],
  },
  {
    id: 'leaf-spot', title: 'โรคใบจุด (เชื้อราหลายชนิด)', en: 'Fungal Leaf Spot', theme: 'orange',
    Icon: Microscope, ref: 'Kasetnumchok',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เชื้อรา Colletotrichum sp., Phomopsis sp. หรือ Phyllosticta sp.' },
      { icon: CircleAlert, l: 'อาการ', v: 'ใบอ่อนซีดคล้ายโดนน้ำร้อนลวก ใบแก่เป็นจุดกลมขอบแผลสีเข้ม ขยายขนาดได้' },
      { icon: Scissors, l: 'การรักษา', v: 'ฉีดพ่น คีโตแม็กซ์ (20–40 ซีซี/น้ำ 20 ล.) หรือสาร Mancozeb + Carbendazim' },
    ],
  },
  {
    id: 'virus', title: 'โรคใบด่างจากไวรัส', en: 'Viral Mosaic', theme: 'purple',
    Icon: Bug, ref: 'เกษตรกล้า',
    rows: [
      { icon: Bug, l: 'สาเหตุ', v: 'เชื้อไวรัสโดยมีเพลี้ยไฟเป็นพาหะหลัก หรือการขาดธาตุอาหาร (Zn, Mg)' },
      { icon: CircleAlert, l: 'อาการ', v: 'ใบลายด่างเขียว-เหลือง โตช้า ใบด่างเหลืองเป็นจุดๆ ไม่สม่ำเสมอ' },
      { icon: Scissors, l: 'การจัดการ', v: 'ไม่มีสารรักษาโดยตรง ถอนต้นที่อาการรุนแรง ควบคุมแมลงพาหะ ใช้พันธุ์ปลอดโรค' },
    ],
  },
  {
    id: 'deficiency', title: 'อาการใบเหลือง (ขาดธาตุ)', en: 'Nutrient Deficiency', theme: 'yellow',
    Icon: Droplets, ref: 'Academic Report',
    rows: [
      { icon: Droplets, l: 'อาการเด่น', v: 'ขาด N: เหลืองซีดทั้งใบ — ขาด Mg: เหลืองระหว่างเส้นใบ แต่เส้นกลางใบยังเขียว' },
      { icon: Sprout, l: 'สาเหตุอื่นๆ', v: 'ดินมี pH ไม่เหมาะสม (ควรอยู่ที่ 5.5–6.5) ทำให้รากดูดซึมธาตุอาหารได้ไม่ดี' },
      { icon: Scissors, l: 'การแก้ไข', v: 'ใส่ปุ๋ยยูเรีย (46-0-0) หรือฉีดพ่นแมกนีเซียมซัลเฟต/ธาตุอาหารรวมทางใบ' },
    ],
  },
  {
    id: 'pink-disease', title: 'โรคราสีชมพู', en: 'Pink Disease', theme: 'pink',
    Icon: AlertTriangle, ref: 'กรมวิชาการเกษตร',
    rows: [
      { icon: Microscope, l: 'ลักษณะ', v: 'พบเส้นใยสีขาวปกคลุมกิ่ง ต่อมาเปลี่ยนเป็นสีชมพู เนื้อไม้เป็นแผลสีน้ำตาล' },
      { icon: CircleAlert, l: 'อาการรุนแรง', v: 'ใบเหลืองร่วงเป็นหย่อม กิ่งเหี่ยว แห้ง และตายในที่สุด ระบาดหนักในฤดูฝน' },
      { icon: Scissors, l: 'การรักษา', v: 'ถากเปลือกที่เป็นโรคออก ทาหรือพ่น คอปเปอร์ออกซีคลอไรด์ 85% WP (45–60 ก./น้ำ 20 ล.)' },
    ],
  },
  {
    id: 'root-rot', title: 'โรคโคนเน่า / รากเน่า', en: 'Root and Foot Rot', theme: 'red',
    Icon: AlertTriangle, ref: 'Kasetnumchok',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เชื้อรา Phytophthora palmivora เข้าทำลายระบบรากและโคนต้น' },
      { icon: CircleAlert, l: 'อาการ', v: 'ปรากฎจุดฉ่ำน้ำมีน้ำเยิ้ม เนื้อไม้เปลี่ยนเป็นสีน้ำตาลเข้ม ใบร่วงจากปลายกิ่ง' },
      { icon: Scissors, l: 'การรักษา', v: 'ลอกเปลือกแผลออก ทาสารซุปเปอร์ซิลิคอนโวก้า หรือ คีโตพลัส ผสมน้ำเป็นโคลนทาแผล' },
    ],
  },
  {
    id: 'sooty-mold', title: 'โรคราดำ', en: 'Sooty Mold', theme: 'slate',
    Icon: Bug, ref: 'Kasetnumchok',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เชื้อรา Meliola durionis Hans S. ระบาดโดยมีเพลี้ยหอยหรือเพลี้ยแป้งเป็นพาหะ' },
      { icon: CircleAlert, l: 'อาการ', v: 'ใบหรือผลมีสีดำเป็นปื้น โดยเฉพาะไหล่ผลและร่องผล ทำให้ราคาผลผลิตตก' },
      { icon: Scissors, l: 'การรักษา', v: 'ฉีดพ่น คีโตแม็กซ์ + ไบโอการ์ด (20–40 ซีซี/น้ำ 20 ล.) ทุก 7 วัน' },
    ],
  },
];

const KnowledgePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-24 font-['IBM_Plex_Sans_Thai'] text-slate-700">
      
      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Prompt'] tracking-tight leading-none">คู่มือโรคทุเรียน</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 font-sans">Encyclopedia & Guide</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden bg-[#1b4332] rounded-[40px] p-8 sm:p-12 mb-12 shadow-2xl shadow-emerald-900/10 text-white flex flex-col sm:flex-row items-center gap-8 group">
          <div className="absolute top-[-40px] right-[-40px] w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-[-40px] left-[10%] w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl"></div>
          
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-xl shrink-0 group-hover:rotate-6 transition-transform">
            <BookOpen size={48} className="text-emerald-300" />
          </div>
          
          <div className="relative z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-200 mb-4 font-sans">
              <Microscope size={12} /> ข้อมูลวิชาการเกษตร
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-['Prompt'] mb-3 leading-tight">ศูนย์วิจัยและ<br className="hidden sm:block" />วินิจฉัยโรคทุเรียน</h2>
            <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed font-medium max-w-2xl">
              รวมข้อมูลสาเหตุ อาการ และแนวทางการรักษาจากกรมวิชาการเกษตร เพื่อช่วยให้เกษตรกรจัดการสวนได้อย่างแม่นยำและยั่งยืน
            </p>
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] font-sans">รายการโรคและภาวะทั้งหมด</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {KNOWLEDGE_DATA.map((d, idx) => {
            const t = themeMap[d.theme] || themeMap.slate;
            return (
              <div 
                key={d.id} 
                className="bg-white rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col group hover:-translate-y-2"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Card Header (Gradient) */}
                <div className={`p-6 bg-gradient-to-br ${t.gradient} border-b ${t.border} relative overflow-hidden`}>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] transform scale-150 group-hover:scale-110 transition-transform duration-700">
                    <d.Icon size={120} />
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-white/60 group-hover:scale-110 transition-transform ${t.text}`}>
                      <d.Icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-['Prompt'] text-slate-900 leading-tight">{d.title}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 font-sans ${t.text}`}>{d.en}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body (Rows) */}
                <div className="p-6 flex-1 flex flex-col gap-5 bg-white">
                  {d.rows.map(({ icon: RowIcon, l, v }, ri) => (
                    <div key={ri} className="flex gap-4 items-start group/row">
                      <div className={`mt-1 p-2 rounded-xl ${t.bg} ${t.text} flex-shrink-0 transition-transform group-hover/row:scale-110`}>
                        <RowIcon size={16} />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest ${t.text}`}>{l}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {v}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Card Footer (Reference) */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-2">
                  <ExternalLink size={12} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">อ้างอิง: {d.ref}</span>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* ── GLOBAL STYLES & ANIMATIONS ── */}
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

export default KnowledgePage;