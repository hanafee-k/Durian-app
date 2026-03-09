import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, CheckCircle, 
  CircleAlert, Microscope, ShieldCheck, 
  Sprout, Droplets, Scissors
} from 'lucide-react';

/* ─── Static Knowledge Data ─── */
const KNOWLEDGE_DATA = [
  {
    id: 'normal', 
    title: 'ใบปกติ', 
    en: 'Healthy / Normal Leaf', 
    theme: 'green',
    Icon: CheckCircle,
    gradient: 'from-green-50 to-emerald-100/50',
    border: 'border-green-200',
    text: 'text-green-700',
    bgIcon: 'bg-green-100',
    rows: [
      { icon: Sprout, l: 'ลักษณะทั่วไป', v: 'ใบมีสีเขียวสม่ำเสมอ ผิวมันเงา ไม่มีจุดหรือรอยไหม้ ขอบใบเรียบไม่หยักงอ' },
      { icon: ShieldCheck, l: 'การดูแล', v: 'รักษาความชุ่มชื้นในดินอย่างเหมาะสม ตัดแต่งทรงพุ่มให้โปร่งรับแสง และใส่ปุ๋ยบำรุงตามช่วงฤดูกาล' },
    ],
  },
  {
    id: 'blight', 
    title: 'โรคใบไหม้ / ใบติด', 
    en: 'Leaf Blight (Rhizoctonia)', 
    theme: 'red',
    Icon: CircleAlert,
    gradient: 'from-red-50 to-rose-100/50',
    border: 'border-red-200',
    text: 'text-red-700',
    bgIcon: 'bg-red-100',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เกิดจากเชื้อรา Rhizoctonia solani มักระบาดหนักในช่วงฤดูฝนที่มีความชื้นสูง' },
      { icon: CircleAlert, l: 'อาการ', v: 'ใบจะคล้ายถูกน้ำร้อนลวก เปลี่ยนเป็นสีน้ำตาล ขอบใบไหม้ และใบที่ป่วยจะติดกันเป็นกระจุกคล้ายรังแมงมุม ก่อนจะร่วงหล่น' },
      { icon: Scissors, l: 'การรักษา', v: 'ตัดใบและกิ่งที่ติดเชื้อไปเผาทำลาย พ่นสารกำจัดเชื้อรา เช่น คอปเปอร์ออกซีคลอไรด์ หรือ เฮกซะโคนาโซล ทุก 7–10 วัน' },
      { icon: Droplets, l: 'การป้องกัน', v: 'จัดระบบระบายน้ำในสวนให้ดี ไม่ให้ดินแฉะขัง ลดความชื้นในทรงพุ่มด้วยการตัดแต่งกิ่ง' },
    ],
  },
  {
    id: 'spot', 
    title: 'โรคใบจุด', 
    en: 'Leaf Spot / Algal Spot', 
    theme: 'amber',
    Icon: Microscope,
    gradient: 'from-amber-50 to-orange-100/50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    bgIcon: 'bg-amber-100',
    rows: [
      { icon: Microscope, l: 'สาเหตุ', v: 'เกิดจากเชื้อรา (เช่น Colletotrichum) หรือสาหร่าย แพร่กระจายได้ดีตามลมและฝน' },
      { icon: CircleAlert, l: 'อาการ', v: 'เริ่มจากจุดสีเหลืองเล็กๆ ขยายกลายเป็นจุดสีน้ำตาล/ดำตรงกลาง หากเป็นสนิมสาหร่ายจะเป็นขุยสีส้ม' },
      { icon: Scissors, l: 'การรักษา', v: 'ตัดแต่งกิ่งที่เป็นโรค พ่นสารแมนโคเซบ (Mancozeb), คาร์เบนดาซิม หรือ คอปเปอร์ไฮดรอกไซด์' },
      { icon: Droplets, l: 'การป้องกัน', v: 'เว้นระยะปลูกไม่ให้ชิดเกินไป ไม่ให้ใบเปียกชื้นเป็นเวลานาน บำรุงต้นให้แข็งแรง' },
    ],
  },
];

const KnowledgePage = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans pb-12">
      
      {/* Header */}
      <header className="sticky top-0 z-40 lg:static bg-white/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-gray-200/50 lg:border-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white lg:bg-white/50 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200/50 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">คู่มือโรคทุเรียน</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:block mt-1">คลังความรู้ อาการ และแนวทางการรักษา</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 lg:mt-4">
        
        {/* ✨ Intro Banner (สวยงาม ดูเป็นแอปเกรดพรีเมียม) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-800 rounded-3xl p-6 sm:p-8 sm:py-10 mb-8 shadow-lg shadow-green-900/20 text-white">
          {/* ลวดลายพื้นหลัง */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-emerald-400 opacity-20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0 shadow-inner">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-2">ศูนย์ข้อมูลเกษตรกรอัจฉริยะ</h2>
              <p className="text-sm sm:text-base text-green-50 leading-relaxed max-w-2xl font-medium">
                ศึกษาอาการ สาเหตุ และแนวทางการรักษาโรคใบทุเรียนที่พบบ่อย เพื่อการจัดการสวนที่มีประสิทธิภาพ แม่นยำ และลดความสูญเสียจากโรคระบาด
              </p>
            </div>
          </div>
        </div>

        {/* ✨ Knowledge Cards Grid (บนมือถือ 1 แถว, บนคอม 3 แถว) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {KNOWLEDGE_DATA.map((d) => (
            <div 
              key={d.id} 
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className={`p-6 bg-gradient-to-br ${d.gradient} border-b ${d.border}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-white/50 group-hover:scale-110 transition-transform ${d.text}`}>
                    <d.Icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{d.title}</h3>
                    <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${d.text}`}>{d.en}</p>
                  </div>
                </div>
              </div>

              {/* Card Body (ข้อมูล) */}
              <div className="p-6 flex-1 flex flex-col gap-5 bg-white">
                {d.rows.map(({ icon: RowIcon, l, v }, ri) => (
                  <div key={l} className="flex gap-4 items-start">
                    <div className={`mt-0.5 p-1.5 rounded-lg ${d.bgIcon} ${d.text} flex-shrink-0`}>
                      <RowIcon size={16} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wide mb-1 ${d.text}`}>{l}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {v}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Card Footer (ตกแต่งให้สมบูรณ์) */}
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-400 font-medium text-center">
                ข้อมูลอ้างอิงจากกรมวิชาการเกษตร
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default KnowledgePage;