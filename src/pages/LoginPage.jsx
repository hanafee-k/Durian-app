import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; 
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      
      // ✅ บันทึกข้อมูลใหม่ทับของเดิมทันที
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // ✅ บังคับ Refresh หน้าจอเพื่อโหลด Token ใหม่ของคนนี้เท่านั้น
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <LogIn size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 font-medium mt-2">ยินดีต้อนรับสู่ DurianDx</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="email" placeholder="อีเมล" required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="password" placeholder="รหัสผ่าน" required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <p className="text-center mt-8 text-gray-500 font-bold">
          ยังไม่มีบัญชี? <Link to="/register" className="text-emerald-600">ลงทะเบียนฟรี</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;