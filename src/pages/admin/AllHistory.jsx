import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, History, ScanLine, Trash2, AlertTriangle, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const API = 'http://localhost:5000/api';
const AVATAR_BASE = 'http://localhost:5000/uploads/';

const severityBadge = {
  danger: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'อันตราย' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'เฝ้าระวัง' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'ปกติ' },
  normal: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: 'ทั่วไป' },
};

// ── Confirm Delete Dialog ──
function DeleteConfirmDialog({ scan, onConfirm, onCancel, loading }) {
  if (!scan) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-50 rounded-[20px] flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 font-['Prompt'] text-center mb-2">ยืนยันการลบ?</h3>
        <p className="text-sm text-slate-500 text-center mb-1">ประวัติการสแกนของ <span className="font-bold text-slate-700">{scan.user?.name}</span></p>
        <p className="text-sm text-slate-400 text-center mb-6">โรค: <span className="font-semibold text-slate-600">{scan.diseaseName}</span></p>
        <p className="text-xs text-red-500 text-center mb-6 bg-red-50 py-2.5 rounded-2xl border border-red-100">ไฟล์รูปภาพจะถูกลบถาวรและไม่สามารถกู้คืนได้</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-3 rounded-[16px] border border-slate-200 text-slate-600 font-bold font-['Prompt'] hover:bg-slate-50 transition-colors disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-[16px] bg-red-500 text-white font-bold font-['Prompt'] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
            {loading ? 'กำลังลบ...' : 'ลบเลย'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/history?page=${p}&limit=15`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(page); }, [page, fetchHistory]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/history/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteTarget(null);
      showToast('ลบประวัติสำเร็จแล้ว');
      fetchHistory(page);
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = history.filter(h =>
    h.user.name.toLowerCase().includes(search.toLowerCase()) ||
    h.diseaseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#fafaf8]">
      <AdminSidebar />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        scan={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl font-['Prompt'] font-bold text-sm animate-in slide-in-from-bottom-4 duration-300">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

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
                <History size={24} />
              </div>
              <div>
                <h1 className="font-['Prompt'] text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">ประวัติการสแกนทั้งหมด</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mt-0.5">All Scan Records</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้หรือโรค..."
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
                      {['ผู้ใช้', 'โรคที่ตรวจพบ', 'ความมั่นใจ', 'ระดับ', 'รูปภาพ', 'วันที่', ''].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-14">
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                              <ScanLine size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-['Prompt'] font-semibold">ไม่พบข้อมูล</p>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.map(scan => {
                      const badge = severityBadge[scan.severity] || severityBadge.normal;
                      return (
                        <tr key={scan._id} className="hover:bg-slate-50/70 transition-colors duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {scan.user.avatar ? (
                                <img src={AVATAR_BASE + scan.user.avatar} className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                  {scan.user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 font-['Prompt'] text-[13px]">{scan.user.name}</p>
                                <p className="text-[10px] text-slate-400 font-sans">{scan.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700 font-['Prompt'] text-[13px]">{scan.diseaseName}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-black font-sans text-slate-800">{parseFloat(scan.confidence).toFixed(1)}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {scan.imagePath ? (
                              <img
                                src={AVATAR_BASE + scan.imagePath}
                                alt="scan"
                                className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform duration-300 cursor-pointer"
                              />
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-[12px] font-medium">
                            {new Date(scan.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          {/* Delete Button */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setDeleteTarget(scan)}
                              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-95"
                              title="ลบรายการนี้"
                            >
                              <Trash2 size={17} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!search && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                      page === pageNum
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
