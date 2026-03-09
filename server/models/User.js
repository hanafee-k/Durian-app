const mongoose = require('mongoose');

// กำหนดโครงสร้างข้อมูลผู้ใช้งาน (User Schema)
const UserSchema = new mongoose.Schema({
  // ข้อมูลสำหรับการลงทะเบียนและเข้าสู่ระบบ
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // ป้องกันการใช้อีเมลซ้ำ
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // ข้อมูลโปรไฟล์ (อ้างอิงจากหน้า ProfilePage เดิมของคุณ)
  role: { 
    type: String, 
    default: "เกษตรกรทั่วไป" 
  },
  location: { 
    type: String, 
    default: "ไม่ระบุ" 
  },
  treeCount: { 
    type: Number, 
    default: 0 
  },
  variety: { 
    type: String, 
    default: "หมอนทอง" 
  },
  avatar: { 
    type: String, 
    default: "" // เก็บชื่อไฟล์รูปภาพโปรไฟล์
  },
  
  // ข้อมูลระบบ
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);