import os
import io
import uvicorn
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. โหลดโมเดล TFLite (ประหยัด RAM สุดๆ) ---
# มั่นใจว่าชื่อไฟล์ตรงกับที่พี่แปลงมา (model.tflite)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "model.tflite")

try:
    print(f"⏳ Loading TFLite model from: {MODEL_PATH}")
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    # ดึงรายละเอียด Input/Output
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("✅ TFLite Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# --- 2. รายชื่อ Class (เรียงตามโฟลเดอร์ที่พี่เทรน) ---
class_names = ['Algal Leaf Spot', 'Healthy Leaf', 'Leaf Blight', 'Phomopsis Leaf Spot']

@app.get("/")
def read_root():
    return {"status": "AI Service is running (TFLite + Confidence Check Mode)"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # อ่านไฟล์รูปภาพ
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # --- 3. Pre-processing ---
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # --- 4. สั่งให้ TFLite ทำนายผล (Inference) ---
        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        
        # ดึงผลลัพธ์ออกมา
        predictions = interpreter.get_tensor(output_details[0]['index'])[0]
        
        # --- 5. ตรรกะตรวจสอบความแม่นยำ (ที่พี่เขียนไว้) ---
        sorted_indices = np.argsort(predictions)[::-1]
        top1_score = predictions[sorted_indices[0]]
        top2_score = predictions[sorted_indices[1]]
        label = class_names[sorted_indices[0]]

        # เช็คความ "ลังเล" (ถ้าคะแนนอันดับ 1 กับ 2 ใกล้กันเกินไป)
        is_confused = (top1_score - top2_score) < 0.4
        
        # 🛡️ ด่านกักกัน: ถ้าคะแนนไม่ถึง 0.92 หรือ AI ลังเล
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
    # Render จะใช้ Port จาก Env ถ้าไม่มีจะใช้ 10000
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)