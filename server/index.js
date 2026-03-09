const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Models ---
const ScanResult = require('./models/ScanResult');
const User = require('./models/User');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

// --- 🛠️ AI Service URL ---
const AI_SERVICE_URL = "http://localhost:8000/predict";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// เชื่อมต่อ MongoDB
mongoose.connect("mongodb://localhost:27017/durian_app")
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error(err));

// --- 🛡️ Middleware: ตรวจสอบ Token ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
    req.user = user;
    next();
  });
};

// --- Storage Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const prefix = req.url.includes('avatar') ? 'avatar' : 'scan';
    cb(null, prefix + '_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ===========================
// 👤 โซน API: Auth (Register/Login)
// ===========================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "ลงทะเบียนสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "ไม่พบผู้ใช้งานนี้" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// 🚀 โซน API: สแกนโรค (Scan)
// ===========================

app.post('/api/scan', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const imagePath = req.file.path;
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    // 1. ส่งไป AI (FastAPI)
    const response = await axios.post(AI_SERVICE_URL, form, {
      headers: { ...form.getHeaders() }
    });

    const aiResult = response.data;

    // 🔴 แก้ไข: เอา fs.unlinkSync ออกเพื่อให้เก็บรูปไว้แม้ความมั่นใจจะต่ำ
    if (aiResult.status === 'low_confidence') {
      // ✅ เราจะไม่ลบไฟล์แล้ว (ลบบรรทัด fs.unlinkSync ออกไปเลย)
      
      return res.status(422).json({ 
        message: aiResult.class, 
        status: "low_confidence",
        filename: req.file.filename // ส่งชื่อไฟล์กลับไปให้หน้าบ้านเผื่อเอาไปโชว์
      });
    }

    // 2. จัดการข้อมูลก่อนลง Database (ส่วนที่เหลือคงเดิม)
    let finalDisease = aiResult.class;
    let finalConfidence = (aiResult.confidence * 100).toFixed(2);
    let finalSeverity = "normal";

    if (finalDisease === 'Leaf Blight') {
      finalSeverity = "danger";
    } else if (finalDisease === 'Algal Leaf Spot' || finalDisease === 'Phomopsis Leaf Spot') {
      finalSeverity = "warning";
    } else if (finalDisease === 'Healthy Leaf') {
      finalSeverity = "success";
    }

    // 3. บันทึกลง MongoDB
    const newScan = new ScanResult({
      userId: req.user.id,
      diseaseName: finalDisease,
      confidence: finalConfidence,
      severity: finalSeverity,
      imagePath: req.file.filename
    });

    await newScan.save();
    res.json({ message: "Success", data: newScan });

  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ message: "AI Service Error", error: error.message });
  }
});

// ===========================
// 📝 โซน API: บันทึกประวัติ (History) - สำหรับรับข้อมูลจากหน้า ScanPage
// ===========================
app.post('/api/history', authenticateToken, async (req, res) => {
  try {
    const { diseaseName, confidence, severity } = req.body;

    // สร้างข้อมูลใหม่โดยผูกกับ userId จาก Token
    const newRecord = new ScanResult({
      userId: req.user.id, // ✅ ดึงจาก Middleware authenticateToken
      diseaseName,
      confidence,
      severity,
      // imagePath: "default.png" // กรณีไม่ได้ส่งรูปมาบันทึกแยก
      date: new Date()
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord); // ✅ ตอบกลับสถานะ 201 เพื่อให้หน้าบ้านรู้ว่าบันทึกสำเร็จ
  } catch (err) {
    console.error("Database Save Error:", err.message);
    res.status(500).json({ message: "ไม่สามารถบันทึกข้อมูลลง Database ได้", error: err.message });
  }
});

// เพิ่ม API สำหรับดึงประวัติทั้งหมด (เพื่อให้หน้า Home/History ใช้งานได้)
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const history = await ScanResult.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ API สำหรับดึงรายละเอียดประวัติรายรายการ
app.get('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    // ต้องเช็คทั้ง ID และ userId เพื่อความปลอดภัย (สิทธิ์เข้าถึง)
    const record = await ScanResult.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!record) {
      return res.status(404).json({ message: "ไม่พบข้อมูลประวัติ" });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ===========================
// 👤 โซน API: User Profile
// ===========================

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/user/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    await User.findByIdAndUpdate(req.user.id, { avatar: req.file.filename });
    res.json({ message: "Upload success", filename: req.file.filename });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));