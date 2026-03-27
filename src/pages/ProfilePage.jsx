import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  User, MapPin, Leaf, Settings, Bell,
  Shield, HelpCircle, LogOut, Camera,
  ChevronRight, Loader2, Edit3, Check, X, Phone
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePage = () => {
  const navigate = useNavigate();

  // ─── STATE สำหรับดึงข้อมูล ───
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'กำลังโหลด...',
    farm: 'กำลังโหลด...',
    location: '-',
    phone: '-',
    avatar: ''
  });

  // ─── STATE สำหรับแก้ไขข้อมูล ───
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // ─── STATE สำหรับอัปโหลดรูป ───
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user');
      const u = res.data?.data || res.data || {};

      const loadedData = {
        name: u.name || 'เกษตรกร',
        farm: u.farmName || u.variety ? `สวนพันธุ์ ${u.variety || ''}` : 'สวนทุเรียน',
        location: u.location || 'ไม่ระบุพิกัด',
        phone: u.phone || 'ไม่ระบุเบอร์โทร',
        avatar: u.avatar || ''
      };

      setUserData(loadedData);
      setEditForm(loadedData);
    } catch (err) {
      console.error('Fetch user failed', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const res = await api.post('/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAvatar = res.data?.filename || file.name;
      setUserData(prev => ({ ...prev, avatar: newAvatar }));
      fetchUser();
    } catch (err) {
      console.error('Avatar upload error:', err.response?.data || err.message);
      const errMsg = err.response?.data?.message || err.message || 'ไม่ทราบสาเหตุ';
      alert(`อัปโหลดไม่สำเร็จ: ${errMsg}`);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await api.put('/user', editForm);
      setUserData(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
      alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf8] font-['IBM_Plex_Sans_Thai']">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
      <span className="font-bold text-emerald-900 tracking-wider text-sm uppercase font-['Prompt']">กำลังเตรียมข้อมูลบัญชี...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-24 font-['IBM_Plex_Sans_Thai'] text-slate-700 relative">



      <div className="relative z-10 p-5 md:p-10 max-w-4xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-900 font-['Prompt'] tracking-tight">บัญชีของฉัน</h1>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-emerald-700 font-bold bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95">
              <Edit3 size={16} /> แก้ไขข้อมูล
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => { setIsEditing(false); setEditForm(userData); }} className="w-10 h-10 flex items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                <X size={20} />
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'บันทึก' : 'บันทึก'}
              </button>
            </div>
          )}
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-[36px] p-6 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">

          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Avatar Section */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              <div className={`w-36 h-36 rounded-[32px] border-[5px] border-white shadow-xl overflow-hidden bg-emerald-50 transition-transform duration-500 group-hover:scale-[1.03] group-hover:rotate-2 ${uploadingAvatar ? 'opacity-50' : ''}`}>
                {userData.avatar ? (
                  <img src={`${API_URL}/uploads/${userData.avatar}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-emerald-300">
                    <User size={64} strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white text-slate-600 rounded-2xl border border-slate-100 flex items-center justify-center shadow-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 z-10">
                {uploadingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg, image/png"
                className="hidden"
              />
            </div>

            {/* User Info / Edit Form */}
            <div className="flex-1 w-full text-center md:text-left">
              {!isEditing ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md mb-3 font-sans">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> สมาชิกทั่วไป
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-['Prompt'] tracking-tight mb-6">
                    {userData.name}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-[20px] border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0"><Leaf size={18} /></div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mb-0.5">Farm Name</p>
                        <p className="font-semibold text-slate-800 truncate">{userData.farm}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-[20px] border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0"><Phone size={18} /></div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mb-0.5">Phone</p>
                        <p className="font-semibold text-slate-800 truncate">{userData.phone}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50/80 rounded-[20px] border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-rose-100/50 flex items-center justify-center text-rose-600 shrink-0"><MapPin size={18} /></div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mb-0.5">Location</p>
                        <p className="font-semibold text-slate-800 truncate">{userData.location}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-['Prompt']">ชื่อ-นามสกุล</label>
                    <input type="text" name="name" value={editForm.name} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 transition-all font-sans hover:border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-['Prompt']">ชื่อสวน</label>
                    <input type="text" name="farm" value={editForm.farm} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 transition-all font-sans hover:border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-['Prompt']">เบอร์โทรศัพท์</label>
                    <input type="tel" name="phone" value={editForm.phone} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 transition-all font-sans hover:border-slate-300" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-['Prompt']">พิกัด / ที่อยู่สวน</label>
                    <input type="text" name="location" value={editForm.location} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[20px] text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 transition-all font-sans hover:border-slate-300" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SETTINGS MENU ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

          <div className="bg-white rounded-[32px] p-2 border border-slate-100 shadow-lg shadow-slate-200/30">
            <h3 className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">การตั้งค่า</h3>

            <button className="w-full flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-500 group-hover:border-amber-100 transition-all shrink-0">
                <Bell size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 font-['Prompt'] text-sm">การแจ้งเตือน</p>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">เปิดรับเตือนอากาศและพ่นยา</p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
            </button>

            <button className="w-full flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all shrink-0">
                <Settings size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 font-['Prompt'] text-sm">ตั้งค่าบัญชี</p>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">เปลี่ยนรหัสผ่าน, ภาษา</p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-2 border border-slate-100 shadow-lg shadow-slate-200/30">
            <h3 className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">ช่วยเหลือ</h3>

            <button className="w-full flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all shrink-0">
                <Shield size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 font-['Prompt'] text-sm">นโยบายความเป็นส่วนตัว</p>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">การเก็บรักษาข้อมูล</p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button className="w-full flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 group-hover:bg-purple-50 group-hover:text-purple-500 group-hover:border-purple-100 transition-all shrink-0">
                <HelpCircle size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 font-['Prompt'] text-sm">ติดต่อทีมงาน</p>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">ปัญหาการใช้งานและอื่นๆ</p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
            </button>
          </div>

        </div>

        {/* ── LOGOUT ── */}
        <div className="pt-8 mb-8 pb-4">
          <button
            onClick={handleLogout}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 p-4 md:p-5 bg-white border border-rose-100 rounded-[24px] text-rose-500 font-bold font-['Prompt'] hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition-all shadow-sm"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
          <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-6">
            DurianDx v1.0.0 · Powered by Deep Learning AI
          </p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Prompt:wght@400;600;700;800;900&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default ProfilePage;