// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, Eye, EyeOff, Leaf, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = res.data.user.isAdmin ? '/admin' : '/';
    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cr) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { token: cr.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = res.data.user.isAdmin ? '/admin' : '/';
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงชื่อเข้าใช้ด้วย Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center px-4 py-12 font-['IBM_Plex_Sans_Thai']">

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#1a5c3a] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#1a5c3a]/20">
            <Leaf size={22} strokeWidth={2.5} className="text-white" />
          </div>
          <h1 className="font-['Prompt'] font-black text-2xl text-gray-900 leading-none">DurianDx</h1>
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">Intelligent Diagnosis</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 px-8 py-9">

          <h2 className="font-['Prompt'] font-bold text-[19px] text-gray-800 mb-1">ยินดีต้อนรับ 👋</h2>
          <p className="text-[13px] text-gray-400 font-medium mb-7">เข้าสู่ระบบเพื่อจัดการสวนทุเรียนของคุณ</p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 px-3.5 py-3 rounded-xl text-[13px] font-semibold mb-5">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">อีเมล</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-800 placeholder-gray-300 font-medium outline-none transition-all focus:bg-white focus:border-[#1a5c3a] focus:ring-2 focus:ring-[#1a5c3a]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-800 placeholder-gray-300 font-medium outline-none transition-all focus:bg-white focus:border-[#1a5c3a] focus:ring-2 focus:ring-[#1a5c3a]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3.5 bg-[#1a5c3a] hover:bg-[#155231] text-white rounded-xl font-['Prompt'] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md shadow-[#1a5c3a]/25 transition-all duration-200 hover:-translate-y-px active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">หรือเข้าสู่ระบบด้วย</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google */}
          <div className="flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('การเชื่อมต่อกับ Google ล้มเหลว')}
              shape="pill"
              theme="outline"
              size="large"
              width="300"
              text="continue_with"
            />
          </div>

          {/* Register link */}
          <p className="text-center text-[13px] text-gray-400 font-medium">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-[#1a5c3a] font-bold font-['Prompt'] hover:underline">
              ลงทะเบียนฟรี
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-6">
          DurianDx v1.0.0 · Powered by AI
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Prompt:wght@400;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
};

export default LoginPage;