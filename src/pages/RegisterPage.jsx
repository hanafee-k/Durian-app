import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/register', formData);
      alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <UserPlus size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">สร้างบัญชีใหม่</h2>
          <p className="text-gray-500 font-medium mt-2">เริ่มต้นดูแลสวนทุเรียนของคุณกับเรา</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ชื่อ-นามสกุล" 
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="อีเมล" 
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="รหัสผ่าน" 
              required
              className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'ลงทะเบียน'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-emerald-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;