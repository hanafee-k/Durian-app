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
    <nav className="hidden lg:block w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* โลโก้ */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20 group-hover:scale-105 transition-transform duration-300">
            <Leaf size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none tracking-tight">
              Durian<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Dx</span>
            </h1>
            <p className="text-[11px] font-bold text-gray-400 tracking-widest mt-0.5 uppercase">Inteligent Diagnosis</p>
          </div>
        </div>

        {/* เมนูตรงกลาง */}
        <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = location.pathname === id || (id !== '/' && location.pathname.startsWith(id));
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                // ✅ เอา class 'relative' ออก และลบจุดสีเขียวด้านล่างทิ้งแล้วครับ
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all duration-300 ease-out ${
                  isActive 
                    ? 'text-emerald-700 bg-white shadow-sm shadow-gray-200/50' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ปุ่มโปรไฟล์ */}
        <div className="flex items-center gap-4 pl-6">
           <button 
            onClick={() => navigate('/scan')}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
           >
             <Camera size={18} /> สแกนเลย
           </button>
           <button 
             onClick={() => navigate('/profile')}
             className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-gray-200/50 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group"
           >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
              <User size={20} className="text-gray-600 group-hover:scale-110 transition-transform" />
            </div>
            <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
           </button>
        </div>

      </div>
    </nav>
  );
};

export default TopNav;