import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Users, LogOut, Leaf } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', sub: 'ภาพรวมระบบ', end: true },
    { to: '/admin/history', icon: History, label: 'ประวัติทั้งหมด', sub: 'Scan Records' },
    { to: '/admin/users', icon: Users, label: 'จัดการผู้ใช้', sub: 'User Management' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 text-gray-800 flex flex-col">
      {/* Logo Area */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a5c3a] rounded-xl flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <p className="font-['Prompt'] font-bold text-base text-gray-900 leading-tight">DurianDoc</p>
            <p className="text-[10px] font-semibold text-[#1a5c3a] uppercase tracking-widest font-sans">Admin Panel</p>
          </div>
        </div>
        <div className="mt-5 h-px bg-gray-100" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2 font-sans">เมนูหลัก</p>
        {navItems.map(({ to, icon: Icon, label, sub, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-[#1a5c3a] text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-['Prompt'] font-semibold text-[13px] leading-tight ${isActive ? 'text-white' : 'text-gray-700'}`}>{label}</p>
                  <p className={`text-[9px] font-semibold uppercase tracking-widest font-sans mt-0.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{sub}</p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 mb-2">
        <div className="h-px bg-gray-100 mb-3" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-500 transition-all duration-200">
            <LogOut size={15} />
          </div>
          <span className="font-['Prompt'] text-[13px]">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
