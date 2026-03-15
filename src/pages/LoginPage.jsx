import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, Eye, EyeOff, Leaf, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4 py-12 font-['IBM_Plex_Sans_Thai']">

      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[18px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tight font-['Prompt']">
              Durian<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Dx</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] mt-0.5 uppercase font-sans">
              Intelligent Diagnosis
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/40 border border-slate-100">

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 font-['Prompt'] tracking-tight">
              ยินดีต้อนรับกลับ 👋
            </h2>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              เข้าสู่ระบบเพื่อจัดการสวนทุเรียนของคุณ
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-['Prompt']">
                อีเมล
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-300 font-medium text-[15px] outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 hover:border-slate-300 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 font-['Prompt']">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-300 font-medium text-[15px] outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 hover:border-slate-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[.98] text-white py-4 rounded-2xl font-bold font-['Prompt'] text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">หรือ</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Register link */}
          <p className="text-center text-slate-400 text-sm font-medium">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-emerald-600 font-bold font-['Prompt'] hover:text-emerald-700 transition-colors">
              ลงทะเบียนฟรี
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-300 mt-6 font-bold uppercase tracking-widest">
          DurianDx v1.0.0 · Powered by AI
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Prompt:wght@400;500;600;700;800;900&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default LoginPage;