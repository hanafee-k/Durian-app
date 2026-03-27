const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ScanResult = require('../models/ScanResult');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

// ===========================
// 🔐 Middleware: ตรวจสอบสิทธิ์ Admin
// ===========================
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)" });
    }

    req.user = decoded;
    req.adminUser = user;
    next();
  });
};

// ===========================
// 📊 GET /api/admin/stats
// ยอดรวมผู้ใช้, สแกนทั้งหมด, แยกตามโรค, และ trend รายวัน 7 วัน
// ===========================
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScans = await ScanResult.countDocuments();

    // จำนวนการตรวจพบแยกตามชื่อโรค
    const diseaseBreakdown = await ScanResult.aggregate([
      { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const diseaseCounts = {};
    diseaseBreakdown.forEach(item => {
      diseaseCounts[item._id] = item.count;
    });

    // Trend รายวัน 7 วันล่าสุด
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyScans = await ScanResult.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // สถิติ severity
    const severityBreakdown = await ScanResult.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const severityCounts = {};
    severityBreakdown.forEach(item => {
      severityCounts[item._id] = item.count;
    });

    res.json({
      totalUsers,
      totalScans,
      diseaseCounts,
      severityCounts,
      dailyScans
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ===========================
// 📋 GET /api/admin/history
// ประวัติการสแกนทั้งหมด พร้อมข้อมูลผู้ใช้ (paginated)
// ===========================
router.get('/history', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await ScanResult.countDocuments();
    const history = await ScanResult.find()
      .populate('userId', 'name email avatar')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const formatted = history.map(scan => ({
      _id: scan._id,
      user: scan.userId
        ? { name: scan.userId.name, email: scan.userId.email, avatar: scan.userId.avatar }
        : { name: 'Unknown', email: '-', avatar: '' },
      diseaseName: scan.diseaseName,
      confidence: scan.confidence,
      severity: scan.severity,
      imagePath: scan.imagePath,
      date: scan.date
    }));

    res.json({
      data: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ===========================
// 👥 GET /api/admin/users
// รายชื่อผู้สมัครสมาชิกทั้งหมด + จำนวนสแกน
// ===========================
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithScanCount = await Promise.all(
      users.map(async (user) => {
        const scanCount = await ScanResult.countDocuments({ userId: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
          location: user.location,
          avatar: user.avatar,
          createdAt: user.createdAt,
          totalScans: scanCount
        };
      })
    );

    res.json(usersWithScanCount);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ===========================
// 🗑️ DELETE /api/admin/history/:id
// Admin ลบประวัติสแกนรายการใดก็ได้
// ===========================
const path = require('path');
const fs = require('fs');

router.delete('/history/:id', authenticateAdmin, async (req, res) => {
  try {
    const record = await ScanResult.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "ไม่พบข้อมูลประวัติ" });

    // ลบไฟล์รูปออกจาก disk ถ้ามี
    if (record.imagePath) {
      const filePath = path.join(__dirname, '..', 'uploads', record.imagePath.split('/').pop());
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await record.deleteOne();
    res.json({ message: "ลบประวัติสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ===========================
// 🔧 PUT /api/admin/users/:id/toggle-admin
// สลับสิทธิ์ admin ของผู้ใช้
// ===========================
router.put('/users/:id/toggle-admin', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

    // ป้องกันการยกเลิก admin ตัวเอง
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "ไม่สามารถเปลี่ยนสิทธิ์ตัวเองได้" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      message: user.isAdmin ? "ให้สิทธิ์ Admin สำเร็จ" : "ยกเลิกสิทธิ์ Admin สำเร็จ",
      isAdmin: user.isAdmin
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ===========================
// 🗑️ DELETE /api/admin/users/:id
// ลบผู้ใช้และประวัติสแกนทั้งหมดของเขา
// ===========================
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

    // ป้องกันการลบตัวเอง
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "ไม่สามารถลบบัญชีตัวเองได้" });
    }

    // ลบประวัติสแกนทั้งหมดที่เชื่อมกับผู้ใช้คนนี้
    await ScanResult.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.json({ message: "ลบผู้ใช้และข้อมูลทั้งหมดสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
module.exports.authenticateAdmin = authenticateAdmin;
