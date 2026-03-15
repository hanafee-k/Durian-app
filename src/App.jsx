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

// ✅ ฟังก์ชันช่วยเช็คการล็อกอิน
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ✅ Layout wrapper ที่คอย reactive ต่อการเปลี่ยนแปลง token
const AppLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

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

      {/* ✅ TopNav แสดงเฉพาะเมื่อ login แล้วเท่านั้น */}
      {isLoggedIn && <TopNav />}

      <div className={isLoggedIn ? "pb-24 pt-0" : "pt-0"}>
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
        </Routes>
      </div>

      {/* ✅ BottomNav แสดงเฉพาะเมื่อ login แล้วเท่านั้น */}
      {isLoggedIn && <BottomNav />}
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