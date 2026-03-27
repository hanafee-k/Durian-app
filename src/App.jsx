import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

// นำเข้า Pages
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import HistoryPage from './pages/HistoryPage';
import KnowledgePage from './pages/KnowledgePage';
import ProfilePage from './pages/ProfilePage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllHistory from './pages/admin/AllHistory';
import ManageUsers from './pages/admin/ManageUsers';

// ✅ ฟังก์ชันช่วยเช็คการล็อกอิน
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ✅ Guard เฉพาะ Admin — เช็ค token + isAdmin flag
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

// ✅ Layout wrapper ที่คอย reactive ต่อการเปลี่ยนแปลง token
const AppLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  // เช็คว่าอยู่ในหน้า admin หรือเปล่า
  const isAdminPage = location.pathname.startsWith('/admin');

  // อัปเดตสถานะ login เมื่อ route เปลี่ยน (ครอบคลุม login/logout)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  // ฟัง storage event สำหรับกรณี logout จากแท็บอื่น
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ซ่อน TopNav ในหน้า admin (admin มี Sidebar ของตัวเอง) */}
      {isLoggedIn && !isAdminPage && <TopNav />}

      <div className={isLoggedIn && !isAdminPage ? "pb-24 pt-0" : "pt-0"}>
        <Routes>
          {/* 🔒 หน้าที่ต้องล็อกอินก่อนเข้า */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/knowledge" element={<ProtectedRoute><KnowledgePage /></ProtectedRoute>} />

          {/* 🔓 หน้าที่เข้าได้โดยไม่ต้องล็อกอิน */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 🛡️ Admin — เฉพาะผู้ที่มี isAdmin: true */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/history" element={<ProtectedAdminRoute><AllHistory /></ProtectedAdminRoute>} />
          <Route path="/admin/users" element={<ProtectedAdminRoute><ManageUsers /></ProtectedAdminRoute>} />
        </Routes>
      </div>

      {/* ซ่อน BottomNav ในหน้า admin */}
      {isLoggedIn && !isAdminPage && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;