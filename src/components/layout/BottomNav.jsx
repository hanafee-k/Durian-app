import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Camera, History, BookOpen, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const TABS = [
    { id: '/', label: 'หน้าหลัก', Icon: Home },
    { id: '/scan', label: 'สแกน', Icon: Camera },
    { id: '/history', label: 'ประวัติ', Icon: History },
    { id: '/knowledge', label: 'คู่มือ', Icon: BookOpen },
    { id: '/profile', label: 'บัญชี', Icon: User },
  ];

  return (
    // 🚀 เปลี่ยนเป็น Floating Pill (แคปซูลลอยตัว) ห่างจากขอบล่าง 6px
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-slate-200/50 flex justify-between items-center px-2 py-2 pointer-events-auto rounded-[32px]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = location.pathname === id || (id !== '/' && location.pathname.startsWith(id));

          return (
            <button 
              key={id} 
              onClick={() => navigate(id)} 
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 ease-out active:scale-95 outline-none group ${
                isActive ? 'bg-emerald-50/80' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`relative z-10 transition-all duration-300 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-500'
                  }`} 
                />
              </div>
              
              <span className={`text-[10px] font-bold mt-1 transition-all duration-300 font-['IBM_Plex_Sans_Thai'] tracking-wide ${
                isActive ? 'text-emerald-700' : 'text-slate-400'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;