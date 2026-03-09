import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

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
    return <Navigate to="/login" replace />; // ถ้าไม่มี Token ให้ดีดไป Login
  }
  return children;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        
        {/* ✅ โชว์ TopNav เฉพาะตอนที่มี Token เท่านั้น */}
        {token && <TopNav />}

        <div className={token ? "pb-24 pt-0" : "pt-0"}>
          <Routes>
            {/* 🔒 หน้าที่ต้องล็อกอินก่อนเข้า */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* 🔓 หน้าที่เข้าได้เลยไม่ต้องล็อกอิน */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
          </Routes>
        </div>

        {/* ✅ โชว์ BottomNav เฉพาะตอนที่มี Token เท่านั้น */}
        {token && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;