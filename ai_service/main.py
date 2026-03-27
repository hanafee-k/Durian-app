import os
os.environ["TF_USE_LEGACY_KERAS"] = "1" 

import io
import uvicorn
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File
# ✅ เช็คบรรทัดนี้: ต้องสะกด Middleware (มีตัว e) ให้ครบ
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

# ✅ บรรทัดนี้ต้องเขียนให้ตรงกับที่ Import มา
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. โหลดโมเดล MobileNetV3 ---
# ตรวจสอบว่าไฟล์อยู่ใน ai_service/weights/best_model_v3.h5
MODEL_PATH = "weights/best_model_v3.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# --- 3. รายชื่อ Class (เรียงตามโฟลเดอร์ที่เทรน) ---
class_names = ['Algal Leaf Spot', 'Healthy Leaf', 'Leaf Blight', 'Phomopsis Leaf Spot']

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # อ่านไฟล์รูปภาพ
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # --- 4. Pre-processing ---
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0  
        img_array = np.expand_dims(img_array, axis=0)
        
        # --- 5. ทำนายผล ---
        predictions = model.predict(img_array)[0] # ดึงผลออกมาเป็น List
        score = np.max(predictions) 
        class_idx = np.argmax(predictions)
        label = class_names[class_idx]

        # 🔍 เพิ่มส่วนตรวจสอบความ "ลังเล" (Confidence Gap)
        # เรียงลำดับคะแนนจากมากไปน้อย
        sorted_indices = np.argsort(predictions)[::-1]
        top1_score = predictions[sorted_indices[0]]
        top2_score = predictions[sorted_indices[1]]
        
        # 🛡️ ด่านกักกัน Senior Level:
        # ถ้าคะแนนอันดับ 1 กับ 2 ใกล้กันเกินไป (น้อยกว่า 0.4) 
        # หรือคะแนนรวมไม่ถึง 0.9 สำหรับรูปที่ AI ไม่เคยเห็น
        is_confused = (top1_score - top2_score) < 0.4
        
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
    port = int(os.environ.get("PORT", 8000)) # ดึง Port จาก Render
    uvicorn.run(app, host="0.0.0.0", port=port)