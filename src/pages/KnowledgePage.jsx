import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, CheckCircle,
  CircleAlert, Microscope, ShieldCheck,
  Sprout, Droplets, Scissors, AlertTriangle, Bug, ExternalLink
} from 'lucide-react';
// ✅ BottomNav ถูกจัดการจาก App.jsx แล้ว ไม่ต้อง import ที่นี่

/* ─── THEME PALETTE FOR TAILWIND ─── */
const themeMap = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', iconBg: 'bg-white', gradient: 'from-emerald-50 to-teal-50' },
  red: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', iconBg: 'bg-white', gradient: 'from-rose-50 to-red-50' },
  rose: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', iconBg: 'bg-white', gradient: 'from-pink-50 to-rose-50' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', iconBg: 'bg-white', gradient: 'from-slate-50 to-gray-50' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', iconBg: 'bg-white', gradient: 'from-amber-50 to-yellow-50' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', iconBg: 'bg-white', gradient: 'from-orange-50 to-amber-50' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', iconBg: 'bg-white', gradient: 'from-purple-50 to-fuchsia-50' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', iconBg: 'bg-white', gradient: 'from-yellow-50 to-amber-50' },
  pink: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-100', iconBg: 'bg-white', gradient: 'from-fuchsia-50 to-pink-50' },
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
    id: 'leaf-spot', title: 'โรคใบจุด', en: 'Fungal Leaf Spot', theme: 'orange',
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
    id: 'deficiency', title: 'อาการใบเหลือง', en: 'Nutrient Deficiency', theme: 'yellow',
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
    <div className="min-h-screen bg-[#f7f9f6] pb-24 lg:pb-12 font-['Sarabun'] text-slate-700">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-emerald-900/5 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            {/* ✅ ปรับความหนาหัวข้อเป็น font-semibold */}
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 font-['Kanit'] tracking-wide leading-none">คู่มือโรคทุเรียน</h1>
            <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest mt-1.5 font-['Kanit']">Encyclopedia & Guide</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-[#1b4332] rounded-[32px] p-8 sm:p-12 mb-12 shadow-lg shadow-emerald-900/10 text-white flex flex-col sm:flex-row items-center gap-8 group">
          <div className="absolute top-[-40px] right-[-40px] w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-[-40px] left-[10%] w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl"></div>

          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/20 shadow-xl shrink-0 group-hover:rotate-3 transition-transform">
            <BookOpen size={44} className="text-white" strokeWidth={1.5} />
          </div>

          <div className="relative z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-medium uppercase tracking-widest text-emerald-100 mb-4 font-['Kanit']">
              <Microscope size={12} /> ข้อมูลวิชาการเกษตร
            </div>
            {/* ✅ ปรับความหนาจาก font-medium เป็น font-semibold ให้หัวข้อโดดเด่น */}
            <h2 className="text-3xl sm:text-4xl font-semibold font-['Kanit'] mb-3 leading-tight tracking-wide">ศูนย์วิจัยและ<br className="hidden sm:block" />วินิจฉัยโรคทุเรียน</h2>
            {/* ✅ ปรับจาก font-light เป็น font-normal ให้อ่านง่ายขึ้น */}
            <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-normal max-w-2xl font-['Sarabun']">
              รวมข้อมูลสาเหตุ อาการ และแนวทางการรักษาจากกรมวิชาการเกษตร เพื่อช่วยให้เกษตรกรจัดการสวนได้อย่างแม่นยำและยั่งยืน
            </p>
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <div className="flex items-center gap-4 mb-6">
          {/* ✅ ปรับ label ให้ชัดเจนขึ้น */}
          <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-[0.1em] font-['Kanit']">รายการโรคและภาวะทั้งหมด</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {KNOWLEDGE_DATA.map((d, idx) => {
            const t = themeMap[d.theme] || themeMap.slate;
            return (
              <div
                key={d.id}
                className="bg-white rounded-[28px] shadow-sm hover:shadow-xl shadow-slate-200/40 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col group hover:-translate-y-1.5"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Card Header */}
                <div className={`p-6 bg-gradient-to-br ${t.gradient} border-b ${t.border} relative overflow-hidden`}>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.04] transform scale-150 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                    <d.Icon size={140} />
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center bg-white shadow-sm border border-white/60 group-hover:scale-110 transition-transform ${t.text}`}>
                      <d.Icon size={26} strokeWidth={2} />
                    </div>
                    <div>
                      {/* ✅ ปรับชื่อโรคเป็น font-semibold */}
                      <h3 className="text-xl font-semibold font-['Kanit'] text-slate-800 leading-tight tracking-wide">{d.title}</h3>
                      {/* ✅ ปรับภาษาอังกฤษให้หนาขึ้นนิดนึง */}
                      <p className={`text-[10px] font-semibold uppercase tracking-widest mt-1 font-['Kanit'] ${t.text}`}>{d.en}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body (Rows) */}
                <div className="p-6 flex-1 flex flex-col gap-6 bg-white">
                  {d.rows.map(({ icon: RowIcon, l, v }, ri) => (
                    <div key={ri} className="flex gap-4 items-start group/row">
                      <div className={`mt-0.5 p-2.5 rounded-2xl ${t.bg} ${t.text} flex-shrink-0 transition-transform group-hover/row:scale-110 border border-transparent`}>
                        <RowIcon size={16} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-1.5">
                        {/* ✅ ปรับหัวข้อย่อยเป็น font-semibold */}
                        <h4 className={`text-[12px] font-semibold uppercase tracking-wider font-['Kanit'] ${t.text}`}>{l}</h4>
                        {/* ✅ ปรับรายละเอียดเป็น font-normal และสี text-slate-700 ให้อ่านชัดเจน ไม่จาง */}
                        <p className="text-[14.5px] text-slate-700 leading-[1.65] font-['Sarabun'] font-normal">
                          {v}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer (Reference) */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-center gap-2">
                  <ExternalLink size={14} className="text-slate-400" />
                  {/* ✅ ปรับเครดิตเป็น font-semibold */}
                  <span className="text-[11px] text-slate-500 font-semibold tracking-wide font-['Kanit']">อ้างอิง: {d.ref}</span>
                </div>
              </div>
            );
          })}
        </div>

      </main>


      {/* ── GLOBAL STYLES & ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Sarabun:wght@300;400;500;600&display=swap');
        
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