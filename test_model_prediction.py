import joblib
import pandas as pd

MODEL_PATH = "models/best_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as err:
    print(f"Failed to load model from {MODEL_PATH}: {err}")
    raise

try:
    # Create sample user input with realistic values
    sample_data = {
        "age": [21],
        "gender": ["Male"],
        "academic_year": [2],
        "study_hours_per_day": [6],
        "exam_pressure": [7],
        "academic_performance": [75],
        "stress_level": [8],
        "anxiety_score": [6],
        "depression_score": [5],
        "sleep_hours": [5],
        "physical_activity": [2],
        "social_support": [4],
        "screen_time": [7],
        "internet_usage": [6],
        "financial_stress": [5],
        "family_expectation": [6],
        "mental_health_index": [40],
        "dropout_risk": [0.5],
        "risk_level": ["Medium"]
    }

    input_df = pd.DataFrame(sample_data)

    print("\nInput DataFrame:")
    print(input_df)

    prediction = model.predict(input_df)

    print("\nRaw prediction:", prediction)

    label_map = {
        0: "Low",
        1: "Medium",
        2: "High"
    }

    predicted_label = label_map.get(int(prediction[0]), "Unknown")

    print("Predicted Burnout Level:", predicted_label)

except Exception as err:
    print(f"Prediction failed: {err}")
    raise

