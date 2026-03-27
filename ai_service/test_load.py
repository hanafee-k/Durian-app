import os
import tensorflow as tf

MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "best_model_v3.h5")
print(f"Loading {MODEL_PATH}")
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
