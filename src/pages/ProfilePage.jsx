import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ ใช้ api service เพื่อให้แนบ Token อัตโนมัติ
import api from '../services/api'; 
import { 
  ArrowLeft, Camera, MapPin, Trees, Sprout, 
  Bell, Globe, Cloud, LogOut, Edit2, Check,
  User, ShieldCheck, Loader2, ChevronRight, Mail
} from 'lucide-react';

const API_URL = "http://localhost:5000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "",
    email: "", // เพิ่ม email เพื่อแสดงผล
    role: "สมาชิกทั่วไป",
    location: "",
    treeCount: 0,
    variety: "",
    avatar: "",
    notification: true
  });

  // ─── 1. Fetch Data (ดึงข้อมูลล่าสุดจาก Token) ───
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // ✅ ดึงข้อมูลผู้ใช้รายบุคคลผ่าน API ที่รองรับ Token
      const res = await api.get('/user'); 
      if (res.data) {
        setUserData(prev => ({ ...prev, ...res.data }));
        // อัปเดต localStorage ให้ตรงกับ DB เสมอ
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2. Avatar Upload ───
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์รูปต้องไม่เกิน 5 MB");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const res = await api.post('/user/upload-avatar', formData);
      // อัปเดต State ทันทีเพื่อให้รูปเปลี่ยนบนหน้าจอ
      setUserData(prev => ({ ...prev, avatar: res.data.filename }));
      await fetchUserData(); // โหลดใหม่เพื่อความชัวร์
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ─── 3. Save Profile Data ───
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put('/user', {
        name: userData.name,
        location: userData.location,
        treeCount: userData.treeCount,
        variety: userData.variety
      });
      
      // บันทึกข้อมูลใหม่ลง localStorage เพื่อให้หน้า Home เห็นผลทันที
      localStorage.setItem('user', JSON.stringify(res.data));
      
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  // ─── 4. Logout (วิธีล้างข้อมูลแบบถอนรากถอนโคน) ───
  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.clear(); // ✅ ล้างค่าทั้งหมดในเบราว์เซอร์
      window.location.href = "/login"; // ✅ บังคับ Refresh แอปใหม่หมด
    }
  };

  const toggleNotification = () => {
    setUserData(prev => ({ ...prev, notification: !prev.notification }));
  };

  if (loading && !userData.name) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold tracking-wide text-center">กำลังโหลดข้อมูลบัญชีส่วนตัวของคุณ...</p>
      </div>
    );
  }

  return (
    <div className="font-sans pb-24 bg-gray-50/50">
      
      {/* ✨ Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200/50 shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">ตั้งค่าโปรไฟล์</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 🔴 ส่วนการ์ดโปรไฟล์ (ฝั่งซ้าย) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="h-32 bg-gradient-to-br from-emerald-500 to-green-800"></div>
              
              <div className="px-6 pb-8 text-center relative z-10 -mt-16">
                <div className="relative inline-block mb-4 group">
                  <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl mx-auto ring-4 ring-emerald-50">
                    <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden relative border border-gray-100">
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20">
                          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                        </div>
                      )}
                      {userData.avatar ? (
                        <img 
                          src={`${API_URL}/uploads/${userData.avatar}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                        />
                      ) : (
                        <User size={48} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-600 text-white rounded-full border-4 border-white flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Camera size={16} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/jpeg,image/png" />
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-1">{userData.name || 'ยังไม่ระบุชื่อ'}</h2>
                <p className="text-gray-500 mb-6 font-bold flex items-center justify-center gap-1.5">
                   <Mail size={14} className="text-gray-400" /> {userData.email}
                </p>

                <div className="space-y-3">
                  <button 
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} 
                    disabled={saving}
                    className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-sm ${
                      saveSuccess ? 'bg-green-100 text-green-700' :
                      isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 
                      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {saveSuccess ? <Check size={18} /> : isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                    <span>{saveSuccess ? 'บันทึกสำเร็จ' : isEditing ? 'ยืนยันการบันทึก' : 'แก้ไขข้อมูลสวน'}</span>
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                  >
                    <LogOut size={18} /> ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🔴 ส่วนฟอร์มแก้ไข (ฝั่งขวา) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Trees size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">รายละเอียดข้อมูลผู้ใช้และสวน</h3>
                  <p className="text-sm font-medium text-gray-500">ข้อมูลนี้จะถูกนำไปใช้ในหน้า Dashboard ของคุณ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                  {isEditing ? (
                    <input type="text" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  ) : (
                    <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700">{userData.name || '-'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">ที่ตั้งสวน (Location)</label>
                  {isEditing ? (
                    <input type="text" value={userData.location} onChange={(e) => setUserData({...userData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  ) : (
                    <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700">{userData.location || '-'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">สายพันธุ์ทุเรียนหลัก</label>
                  {isEditing ? (
                    <input type="text" value={userData.variety} onChange={(e) => setUserData({...userData, variety: e.target.value})} className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                  ) : (
                    <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700">{userData.variety || '-'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">จำนวนต้นที่ปลูก</label>
                  {isEditing ? (
                    <div className="relative">
                      <input type="number" value={userData.treeCount} onChange={(e) => setUserData({...userData, treeCount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ต้น</span>
                    </div>
                  ) : (
                    <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700">{userData.treeCount || 0} ต้น</div>
                  )}
                </div>
              </div>
            </div>

            {/* ส่วนตั้งค่าอื่นๆ */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
               <div className="flex items-center justify-between p-7 group cursor-pointer hover:bg-gray-50/50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"><Globe size={22} /></div>
                    <p className="text-base font-black text-gray-900">ภาษาการใช้งาน (Language)</p>
                  </div>
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest">ภาษาไทย <ChevronRight size={16} className="inline ml-1" /></span>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProfilePage;