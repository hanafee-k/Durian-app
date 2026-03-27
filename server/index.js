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

// --- Routers ---
const adminRouter = require('./routes/admin');

dotenv.config();
const app = express();

// --- ⚙️ Configuration ---
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "durian_dx_secure_key_2026";
// ดึง URL จาก Environment Variable เพื่อความยืดหยุ่น
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "https://durian-ai-service.onrender.com/predict";

app.use(cors());
app.use(express.json());
// เปิดโฟลเดอร์ uploads ให้เข้าถึงจากภายนอกได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี (กัน Error ตอนรันครั้งแรก)
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// --- 🗄️ Database Connection ---
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log('✅ MongoDB Connected to Atlas!'))
  .catch(err => console.error('❌ Connection Error:', err));

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

// --- 📁 Storage Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const prefix = req.url.includes('avatar') ? 'avatar' : 'scan';
    cb(null, `${prefix}_${Date.now()}${path.extname(file.originalname)}`);
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

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' }); // เพิ่มเป็น 7 วันจะได้ไม่หลุดบ่อย
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================
// 🚀 โซน API: สแกนโรค (Scan)
// ===========================

app.post('/api/scan', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพ" });

    const imagePath = req.file.path;
    const form = new FormData();
    // ส่งไฟล์ไปหา FastAPI (Python) โดยใช้ชื่อฟิลด์ 'file' ให้ตรงกับที่ AI รอรับ
    form.append('file', fs.createReadStream(imagePath));

    console.log(`⏳ Sending to AI: ${AI_SERVICE_URL}`);

    // 1. ส่งไป AI (FastAPI บน Render)
    const response = await axios.post(AI_SERVICE_URL, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000 // รอได้สูงสุด 30 วินาที กัน AI หลับ
    });

    const aiResult = response.data;

    // กรณีความมั่นใจต่ำ (ไม่ใช่ใบทุเรียน)
    if (aiResult.status === 'low_confidence') {
      return res.status(422).json({
        message: aiResult.class,
        status: "low_confidence",
        filename: req.file.filename
      });
    }

    // 2. แปลงผลลัพธ์จาก AI เป็นความรุนแรง
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
      imagePath: req.file.filename,
      date: new Date()
    });

    await newScan.save();
    res.json({ message: "วิเคราะห์สำเร็จ", data: newScan });

  } catch (error) {
    console.error("❌ AI Error:", error.message);
    res.status(500).json({
      message: "ระบบวิเคราะห์ขัดข้อง กรุณาลองใหม่ในภายหลัง",
      error: error.message
    });
  }
});

// ===========================
// 📝 โซน API: ประวัติ (History)
// ===========================

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const history = await ScanResult.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    const record = await ScanResult.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ message: "ไม่พบข้อมูล" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    const record = await ScanResult.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) return res.status(404).json({ message: "ไม่พบข้อมูล" });

    // ลบรูปภาพออกจากระบบ
    const filePath = path.join(__dirname, 'uploads', record.imagePath);
    if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }

    await record.deleteOne();
    res.json({ message: "ลบประวัติสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    if (!req.file) return res.status(400).json({ message: "ไม่มีไฟล์อัปโหลด" });
    await User.findByIdAndUpdate(req.user.id, { avatar: req.file.filename });
    res.json({ message: "อัปโหลดรูปโปรไฟล์สำเร็จ", filename: req.file.filename });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 🛡️ Admin API ---
app.use('/api/admin', adminRouter);

app.listen(PORT, () => console.log(`🚀 Backend Server running on port ${PORT}`));