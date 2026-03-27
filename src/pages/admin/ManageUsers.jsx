import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldCheck, ShieldOff, Trash2, ScanLine, Users, AlertTriangle } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://durian-app.onrender.com/api';
const AVATAR_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/uploads/` : 'https://durian-app.onrender.com/uploads/';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleAdmin = async (userId) => {
    setActionLoading(userId + '_admin');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin: data.isAdmin } : u));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId + '_del');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
      setConfirmDelete(null);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#fafaf8]">
      <AdminSidebar />

      <main className="flex-1 overflow-auto relative">
        {/* Decorative Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 p-8 lg:p-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Users size={24} />
              </div>
              <div>
                <h1 className="font-['Prompt'] text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">จัดการผู้ใช้</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mt-0.5">
                  User Management · {users.length} users
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรืออีเมล..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 placeholder:text-slate-400"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-56 gap-3">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-bold text-emerald-700 font-['Prompt']">กำลังโหลด...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['ผู้ใช้', 'สิทธิ์', 'จังหวัด', 'สแกน', 'วันที่สมัคร', 'จัดการ'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-14">
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                              <Users size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-['Prompt'] font-semibold">ไม่พบข้อมูล</p>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.map(user => (
                      <tr key={user._id} className="hover:bg-slate-50/70 transition-colors duration-200 group">
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={AVATAR_BASE + user.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 font-['Prompt'] text-[13px]">{user.name}</p>
                              <p className="text-[10px] text-slate-400 font-sans">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role/Admin Badge */}
                        <td className="px-6 py-4">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-xl border border-emerald-100">
                              <ShieldCheck size={12} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 text-[11px] font-medium rounded-xl border border-slate-100">
                              {user.role || 'User'}
                            </span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 text-slate-500 text-[13px]">{user.location || '—'}</td>

                        {/* Scan Count */}
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
                            <ScanLine size={14} className="text-emerald-500" />
                            <span className="font-black font-sans text-emerald-700 text-sm">{user.totalScans}</span>
                          </div>
                        </td>

                        {/* Join Date */}
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-[12px] font-medium">
                          {new Date(user.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleAdmin(user._id)}
                              disabled={actionLoading === user._id + '_admin'}
                              title={user.isAdmin ? 'ยกเลิกสิทธิ์ Admin' : 'ให้สิทธิ์ Admin'}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                user.isAdmin
                                  ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 border border-amber-100 hover:shadow-md hover:shadow-amber-500/10'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 hover:shadow-md hover:shadow-emerald-500/10'
                              } disabled:opacity-50`}
                            >
                              {user.isAdmin ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(user)}
                              disabled={actionLoading === user._id + '_del'}
                              title="ลบผู้ใช้"
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-all duration-300 disabled:opacity-50 hover:shadow-md hover:shadow-red-500/10"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] shadow-2xl max-w-sm w-full p-8 relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-['Prompt'] font-extrabold text-center text-slate-800 mb-2">ยืนยันการลบ</h3>
              <p className="text-slate-500 text-sm text-center mb-7 font-medium leading-relaxed">
                ลบบัญชี <strong className="text-slate-800">{confirmDelete.name}</strong> และประวัติสแกนทั้งหมดของผู้ใช้นี้หรือไม่?
                <br />
                <span className="text-xs text-red-400 font-semibold">ไม่สามารถกู้คืนได้</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-300 font-semibold font-['Prompt']"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete._id)}
                  disabled={actionLoading === confirmDelete._id + '_del'}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all duration-300 font-bold font-['Prompt'] shadow-lg shadow-red-500/25 disabled:opacity-60"
                >
                  {actionLoading === confirmDelete._id + '_del' ? 'กำลังลบ...' : 'ลบผู้ใช้'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
