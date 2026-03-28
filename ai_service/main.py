import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import io
import uvicorn
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# เปิด CORS ให้ React/Node.js ยิงเข้ามาหาได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ใช้ os.path.abspath เพื่อให้แน่ใจว่าระบบจะอ่านถูกโฟลเดอร์ ไม่ว่าจะรันไฟล์นี้จากที่ไหน
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "weights", "best_model_v3.h5")

try:
    print(f"⏳ Loading H5 model from: {MODEL_PATH}")
    # ใช้ compile=False เพื่อเลี่ยงปัญหา Version mismatch ของ TensorFlow
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("✅ H5 Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    # ถ้ายังไม่ได้อีก ให้ลองวิธีสุดท้ายนี้ (สำหรับ TF 2.16+)
    try:
        import tf_keras
        model = tf_keras.models.load_model(MODEL_PATH, compile=False)
        print("✅ H5 Model Loaded using tf_keras!")
    except:
        print("❌ All loading methods failed.")

# --- 2. รายชื่อ Class ---
class_names = ['Algal Leaf Spot', 'Healthy Leaf', 'Leaf Blight', 'Phomopsis Leaf Spot']

@app.get("/")
def read_root():
    return {"status": "AI Service is running (H5 Model Mode)"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # อ่านไฟล์รูปภาพ
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # --- 3. Pre-processing (ต้องตรงตามที่เทรนมา) ---
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0  # ทำ Rescaling 1./255
        img_array = np.expand_dims(img_array, axis=0)

        # --- 4. ทำนายผลด้วยไฟล์ .h5 ---
        predictions = model.predict(img_array)[0]
        
        # --- 5. ตรวจสอบความแม่นยำ ---
        sorted_indices = np.argsort(predictions)[::-1]
        top1_score = predictions[sorted_indices[0]]
        top2_score = predictions[sorted_indices[1]]
        label = class_names[sorted_indices[0]]

        # เช็คความ "ลังเล" (ถ้าอันดับ 1 กับ 2 คะแนนใกล้กันเกินไป)
        is_confused = (top1_score - top2_score) < 0.4
        
        # 🛡️ ถ้าคะแนนต่ำกว่า 92% หรือ AI ลังเล ให้แจ้งว่าไม่ชัดเจน
        if top1_score < 0.92 or is_confused: 
            return {
                "class": "ไม่ใช่ใบทุเรียน หรือภาพไม่ชัดเจน",
                "confidence": float(top1_score),
                "status": "low_confidence"
            }

        return {
            "class": label,
            "confidence": float(top1_score),
            "status": "success"
        }
    
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # รันที่พอร์ต 8000 เพื่อให้ Node.js ยิงเข้ามาหาถูกที่
    uvicorn.run(app, host="127.0.0.1", port=8000)