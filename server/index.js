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
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

// --- 🛠️ AI Service URL ---
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/predict";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// เชื่อมต่อ MongoDB
const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/durian_app";

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
// 🌐 โซน API: Google Login
// ===========================
const { OAuth2Client } = require('google-auth-library');
// ใช้ Client ID เดียวกับ Frontend
const client = new OAuth2Client("418766321306-hdpin90v6np6erajjcu9l7prfv1h9gji.apps.googleusercontent.com");

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    // ตรวจสอบความถูกต้องของ Token ด้วยไลบรารีของ Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "418766321306-hdpin90v6np6erajjcu9l7prfv1h9gji.apps.googleusercontent.com" // ตรวจสอบว่าตรงกับของ Frontend
    });

    // ดึงข้อมูลโปรไฟล์จาก Payload
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือยัง
    let user = await User.findOne({ email });

    if (!user) {
      // กรณียังไม่มีบัญชี สร้างใหม่แบบอัตโนมัติ ไม่ต้องสุ่มรหัสผ่านเพราะเราตั้ง required: false ไว้แล้ว
      user = new User({
        name: name,
        email: email,
        avatar: picture // เอา URL รูปของกูเกิลมาใช้เป็นโปรไฟล์เริ่มต้นได้ (ถ้าต้องการเก็บรูปลงเซิร์ฟเวอร์ด้วยต้องจัดการเพิ่มทีหลัง)
      });
      await user.save();
    }

    // สร้างระบบ JWT Token ของเราเองเพื่อใช้ Login ต่อในแอป
    const appToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin || false
      }
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "การตรวจสอบสิทธิ์ Google ล้มเหลว" });
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

// ✅ API สำหรับลบประวัติสแกน (เจ้าของเท่านั้น)
app.delete('/api/history/:id', authenticateToken, async (req, res) => {
  try {
    const record = await ScanResult.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!record) {
      return res.status(404).json({ message: "ไม่พบข้อมูลประวัติหรือไม่มีสิทธิ์ลบ" });
    }

    // ลบไฟล์รูปออกจาก disk ถ้ามี
    if (record.imagePath) {
      const filePath = path.join(__dirname, 'uploads', record.imagePath.split('/').pop());
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

// ===========================
// 🛡️ โซน API: Admin — แยกออกเป็น routes/admin.js
// ===========================
app.use('/api/admin', adminRouter);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
