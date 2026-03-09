import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  User, MapPin, Leaf, Settings, Bell, 
  Shield, HelpCircle, LogOut, Camera, 
  ChevronRight, Loader2, Edit3, Check, X, Phone 
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';

const API_URL = "http://localhost:5000";

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
        name: u.name || 'เกษตรกร ทุเรียนไทย',
        farm: u.farmName || u.variety ? `สวน ${u.variety || ''}` : 'สวนทุเรียนสุขใจ',
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

  // 🚀 LOGIC ที่แก้ใหม่ให้ตรงกับ Backend (server/index.js) เป๊ะๆ
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // เช็คขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      e.target.value = ''; 
      return;
    }

    const formData = new FormData();
    // ⚠️ แก้ตรงนี้! Backend ของพี่ใช้ upload.single('avatar') 
    formData.append('avatar', file); 

    try {
      setUploadingAvatar(true);
      
      // ⚠️ แก้ตรงนี้! Backend ของพี่เปิด Route รับที่ '/user/upload-avatar'
      const res = await api.post('/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // ดึงชื่อไฟล์จาก res.data.filename (ตามที่ Backend ของพี่เขียนตอบกลับมา)
      const newAvatar = res.data?.filename || file.name;
      
      setUserData(prev => ({ ...prev, avatar: newAvatar }));
      alert('อัปโหลดรูปโปรไฟล์สำเร็จ!');
      
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
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9f6] font-['Sarabun']">
      <div className="flex flex-col items-center text-emerald-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-['Kanit'] tracking-wide">กำลังเตรียมข้อมูลบัญชี...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9f6] pb-24 lg:pb-12 font-['Sarabun'] text-slate-700">
      
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-emerald-900/5 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between relative">
          <h1 className="text-2xl font-medium text-slate-800 font-['Kanit'] tracking-wide">บัญชีของฉัน</h1>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-['Kanit'] font-medium bg-emerald-50 px-3 py-1.5 rounded-full transition-colors">
              <Edit3 size={16} /> แก้ไข
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setIsEditing(false); setEditForm(userData); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 font-['Kanit'] font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
                {saving ? 'กำลังบันทึก' : 'บันทึก'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="relative mt-12 mb-8">
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-[#2a9d8f] to-[#1e6056] rounded-[32px] shadow-md overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0C13.431 0 0 13.431 0 30s13.431 30 30 30 30-13.431 30-30S46.569 0 30 0zm0 58C14.536 58 2 45.464 2 30S14.536 2 30 2s28 12.536 28 28-12.536 28-28 28z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'nonzero\'/%3E%3C/svg%3E')]"></div>
          </div>

          <div className="relative pt-20 px-6 pb-10 bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100/50 mt-16 text-center">
            
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className={`w-32 h-32 rounded-[36px] border-[6px] border-white shadow-xl overflow-hidden bg-slate-50 transition-transform duration-300 group-hover:scale-105 ${uploadingAvatar ? 'opacity-50' : ''}`}>
                  {userData.avatar ? (
                    <img src={`${API_URL}/uploads/${userData.avatar}`} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-200 bg-emerald-50">
                      <User size={56} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-800 text-white rounded-xl border-[3px] border-white flex items-center justify-center shadow-lg group-hover:bg-emerald-500 transition-colors">
                  {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/jpeg, image/png" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="mt-2">
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-medium text-slate-800 font-['Kanit']">{userData.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-emerald-50/50 text-emerald-600 text-[11px] font-medium tracking-wide rounded-lg border border-emerald-100 font-['Kanit']">
                      สมาชิกทั่วไป
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center gap-3 mt-6 text-[15px] text-slate-500">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500"><Leaf size={16} /></div>
                      <span>{userData.farm}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><Phone size={16} /></div>
                      <span>{userData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500"><MapPin size={16} /></div>
                      <span>{userData.location}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 mt-4 text-left max-w-sm mx-auto animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1 ml-1 font-['Kanit']">ชื่อ-นามสกุล</label>
                    <input type="text" name="name" value={editForm.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all font-['Sarabun']" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1 ml-1 font-['Kanit']">ชื่อสวน</label>
                    <input type="text" name="farm" value={editForm.farm} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all font-['Sarabun']" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1 ml-1 font-['Kanit']">เบอร์โทรศัพท์</label>
                    <input type="tel" name="phone" value={editForm.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all font-['Sarabun']" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1 ml-1 font-['Kanit']">พิกัด / ที่อยู่สวน</label>
                    <input type="text" name="location" value={editForm.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all font-['Sarabun']" />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── SETTINGS MENU ── */}
        <div className="space-y-6 mt-10">
          <div>
            <h3 className="px-4 text-xs font-medium text-slate-400 tracking-wider font-['Kanit'] mb-3">การตั้งค่า</h3>
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm shadow-slate-200/30 overflow-hidden">
              <button className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                <div className="w-10 h-10 rounded-[14px] bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-500 group-hover:border-amber-100 transition-all"><Bell size={20} /></div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-800 font-['Kanit'] text-[15px]">การแจ้งเตือน</p>
                  <p className="text-[13px] text-slate-400 mt-0.5">เปิดรับการเตือนพ่นยา และสภาพอากาศ</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
              </button>
              
              <button className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-[14px] bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all"><Settings size={20} /></div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-800 font-['Kanit'] text-[15px]">ตั้งค่าบัญชี</p>
                  <p className="text-[13px] text-slate-400 mt-0.5">เปลี่ยนรหัสผ่าน, ภาษา</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="px-4 text-xs font-medium text-slate-400 tracking-wider font-['Kanit'] mb-3">ช่วยเหลือ</h3>
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm shadow-slate-200/30 overflow-hidden">
              <button className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                <div className="w-10 h-10 rounded-[14px] bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all"><Shield size={20} /></div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-800 font-['Kanit'] text-[15px]">นโยบายความเป็นส่วนตัว</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>
              
              <button className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-[14px] bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 group-hover:bg-purple-50 group-hover:text-purple-500 group-hover:border-purple-100 transition-all"><HelpCircle size={20} /></div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-800 font-['Kanit'] text-[15px]">ติดต่อทีมงาน (Support)</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 md:p-5 bg-white border border-rose-100 rounded-[28px] text-rose-500 font-medium font-['Kanit'] hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition-all shadow-sm"
            >
              <LogOut size={18} /> ออกจากระบบ
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-6 font-['Kanit'] font-light tracking-widest">
              DurianDx App v1.0.0
            </p>
          </div>

        </div>
      </main>
      
      <div className="lg:hidden"><BottomNav /></div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Sarabun:wght@300;400;500;600&display=swap');
        input::placeholder { color: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default ProfilePage;