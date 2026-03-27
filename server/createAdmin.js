const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'เกษตรกรทั่วไป' },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// ============================
// 🔧 ตั้งค่า Admin ตรงนี้
// ============================
const ADMIN = {
  name: 'Administrator',
  email: 'admin@durian.com',
  password: 'Admin@1234',
};

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/durian_app');
  console.log('✅ MongoDB Connected');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    // ถ้ามี account นี้อยู่แล้ว → แค่ set isAdmin: true
    await User.updateOne({ email: ADMIN.email }, { $set: { isAdmin: true } });
    console.log(`✅ อัปเดต "${ADMIN.email}" เป็น Admin สำเร็จ`);
  } else {
    // สร้างใหม่
    const hashed = await bcrypt.hash(ADMIN.password, 10);
    await User.create({ ...ADMIN, password: hashed, isAdmin: true });
    console.log(`✅ สร้าง Admin account สำเร็จ`);
  }

  console.log('─────────────────────────');
  console.log(`📧 Email    : ${ADMIN.email}`);
  console.log(`🔑 Password : ${ADMIN.password}`);
  console.log(`🌐 URL      : http://localhost:5173/login`);
  console.log('─────────────────────────');

  await mongoose.disconnect();
}

createAdmin().catch(console.error);
