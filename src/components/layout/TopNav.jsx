import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Home, Camera, BarChart3, BookOpen, User, ChevronDown } from 'lucide-react';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const TABS = [
    { id: '/', label: 'หน้าหลัก', Icon: Home },
    { id: '/scan', label: 'สแกนโรค', Icon: Camera },
    { id: '/history', label: 'ประวัติ', Icon: BarChart3 },
    { id: '/knowledge', label: 'คู่มือ', Icon: BookOpen },
  ];

  return (
    <nav className="hidden lg:block w-full bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300 font-['IBM_Plex_Sans_Thai']">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* โลโก้ */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[18px] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
            <Leaf size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight font-['Prompt']">
              Durian<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500"> Dx</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1 uppercase font-sans">Intelligent Diagnosis</p>
          </div>
        </div>

        {/* เมนูตรงกลาง (Pill Menu) */}
        <div className="flex items-center p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = location.pathname === id || (id !== '/' && location.pathname.startsWith(id));
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`px-5 py-2.5 rounded-[12px] flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ease-out ${
                  isActive 
                    ? 'text-emerald-700 bg-white shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/30 border border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ปุ่มด้านขวา (Scan & Profile) */}
        <div className="flex items-center gap-4">
           <button 
            onClick={() => navigate('/scan')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold font-['Prompt'] text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
           >
             <Camera size={18} /> สแกนเลย
           </button>
           
           <div className="w-px h-8 bg-slate-200 mx-1"></div> {/* เส้นคั่น */}

           <button 
             onClick={() => navigate('/profile')}
             className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group shadow-sm"
           >
            <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 overflow-hidden">
              <User size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
           </button>
        </div>

      </div>
    </nav>
  );
};

export default TopNav;