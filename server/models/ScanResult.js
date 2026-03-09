const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // ✅ เพิ่มส่วนนี้เพื่อผูกกับ ID ผู้ใช้
  diseaseName: String,
  confidence: Number,
  severity: String,
  imagePath: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanResult', ScanResultSchema);