import axios from 'axios';

// บังคับใช้ localhost ตรงๆ เลยครับพี่ เพื่อเช็คว่าระบบยังปกติไหม
const API_URL = "http://localhost:5000";

const api = axios.create({
  // ยิงไปที่ backend ในเครื่องเรา
  baseURL: `${API_URL}/api`
});

// ส่ง API_URL ออกไปให้หน้า History ใช้ดึงรูป
export { API_URL };

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
