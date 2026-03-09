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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="w-full max-w-[480px] bg-white/90 backdrop-blur-xl border-t border-gray-200/50 flex justify-around items-center px-4 py-3 pb-safe pointer-events-auto shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = location.pathname === id || (id !== '/' && location.pathname.startsWith(id));

          // ✅ แก้ไข: ลบเงื่อนไขพิเศษของปุ่ม '/scan' ออก เพื่อให้ทุกปุ่มใช้รูปแบบเดียวกัน
          return (
            <button 
              key={id} 
              onClick={() => navigate(id)} 
              className="flex-1 flex flex-col items-center justify-center gap-1.5 py-1 transition-all active:scale-95 outline-none group relative"
            >
              {/* ไอคอนพร้อมแสงฟุ้งเมื่อเลือก */}
              <div className="relative">
                <div className={`absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-30 scale-150' : ''}`}></div>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 transition-all duration-300 ${isActive ? 'text-emerald-600 scale-110' : 'text-gray-400 group-hover:text-gray-500'}`} />
              </div>
              
              <span className={`text-[10px] font-bold transition-all duration-300 ${
                isActive ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                {label}
              </span>
              {/* ✅ แก้ไข: ลบจุดสีเขียว (div) ที่เคยอยู่ตรงนี้ออกแล้วครับ */}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;