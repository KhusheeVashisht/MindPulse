from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import joblib
import os
import logging
import pandas as pd
from sqlalchemy.orm import Session
from models import User, StudentProfile, BurnoutPrediction, create_tables, get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model variable
model = None
scaler = None
MODEL_FEATURE_COLUMNS = []
MODEL_CATEGORICAL_COLUMNS = []
STORED_ONLY_DEFAULTS = {
    "internet_usage": 0.0,
}


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def derive_mental_health_index(data: dict) -> float:
    wellbeing_score = (
        float(data["sleep_hours"]) * 6
        + float(data["physical_activity"]) * 4
        + float(data["social_support"]) * 5
        + (10 - float(data["stress_level"])) * 4
        + (10 - float(data["anxiety_score"])) * 4
        + (10 - float(data["depression_score"])) * 4
    )
    return float(clamp(round(wellbeing_score / 2), 1, 100))


def derive_dropout_risk(data: dict) -> float:
    weighted_score = (
        float(data["stress_level"]) * 0.18
        + float(data["anxiety_score"]) * 0.16
        + float(data["depression_score"]) * 0.16
        + float(data["exam_pressure"]) * 0.10
        + float(data["financial_stress"]) * 0.10
        + float(data["family_expectation"]) * 0.08
        + (10 - float(data["social_support"])) * 0.10
        + max(float(data["screen_time"]) - 6, 0) * 0.03
        + max(7 - float(data["sleep_hours"]), 0) * 0.09
    )
    return float(clamp(round(weighted_score / 10, 2), 0, 1))

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the model and scaler at startup and clean up at shutdown.
    """
    global model, scaler
    try:
        model_path = os.path.join(os.path.dirname(__file__), "..", "model", "burnout_model.pkl")
        scaler_path = os.path.join(os.path.dirname(__file__), "..", "model", "scaler.pkl")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found at {scaler_path}")
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        logger.info(f"✓ Model loaded successfully from {model_path}")
        logger.info(f"✓ Scaler loaded successfully from {scaler_path}")
        logger.info(f"  Model type: {type(model)}")
    except Exception as e:
        logger.error(f"✗ Failed to load model or scaler: {str(e)}")
        raise RuntimeError(f"Could not load model or scaler: {str(e)}")

    # Determine the required input layout from the fitted preprocessor
    global MODEL_FEATURE_COLUMNS, MODEL_CATEGORICAL_COLUMNS
    try:
        if hasattr(scaler, 'transformers_'):
            cols = []
            cat_cols = []
            for name, transformer, columns in scaler.transformers_:
                if name == 'num':
                    cols.extend(columns)
                elif name == 'cat':
                    cat_cols.extend(columns)
                    cols.extend(columns)
            MODEL_FEATURE_COLUMNS = list(cols)
            MODEL_CATEGORICAL_COLUMNS = list(cat_cols)
            logger.info('Detected model feature columns: %s', MODEL_FEATURE_COLUMNS)
            logger.info('Detected model categorical columns: %s', MODEL_CATEGORICAL_COLUMNS)
    except Exception as e:
        logger.warning('Could not inspect scaler columns: %s', e)

    # Initialize database
    create_tables()
    logger.info("✓ Database tables created")

    yield
    
    # Cleanup (if needed)
    logger.info("Shutting down API...")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="MindPulse Burnout Prediction API",
    version="1.0",
    description="API for predicting student burnout levels using a trained ML model.",
    lifespan=lifespan
)

@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint to verify API is running.
    """
    return {
        "message": "MindPulse API is running successfully",
        "version": "1.0",
        "status": "healthy"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    """
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model or scaler not loaded")
    
    return {
        "status": "healthy",
        "model_loaded": True,
        "scaler_loaded": True,
        "model_type": str(type(model))
    }

@app.get("/history", tags=["History"])
async def get_prediction_history(db: Session = Depends(get_db)):
    """
    Get the history of all predictions made.
    """
    try:
        predictions = db.query(BurnoutPrediction).order_by(BurnoutPrediction.timestamp.desc()).all()
        
        history = []
        for pred in predictions:
            history.append({
                "id": pred.id,
                "timestamp": pred.timestamp.isoformat(),
                "user_id": pred.user_id,
                "study_hours_per_day": pred.study_hours_per_day,
                "exam_pressure": pred.exam_pressure,
                "academic_performance": pred.academic_performance,
                "stress_level": pred.stress_level,
                "anxiety_score": pred.anxiety_score,
                "depression_score": pred.depression_score,
                "sleep_hours": pred.sleep_hours,
                "physical_activity": pred.physical_activity,
                "social_support": pred.social_support,
                "screen_time": pred.screen_time,
                "financial_stress": pred.financial_stress,
                "family_expectation": pred.family_expectation,
                "prediction": pred.prediction
            })
        
        return {"predictions": history}
    except Exception as exc:
        logger.error(f"History retrieval error: {exc}")
        raise HTTPException(status_code=500, detail="Failed to retrieve prediction history")

EXPECTED_FEATURES = [
    "age", "gender", "academic_year", "study_hours_per_day", "exam_pressure",
    "academic_performance", "stress_level", "anxiety_score", "depression_score",
    "sleep_hours", "physical_activity", "social_support", "screen_time",
    "financial_stress", "family_expectation"
]

class StudentBurnoutInput(BaseModel):
    user_id: int = Field(..., ge=1, description="User ID to associate prediction with")
    age: int = Field(..., ge=16, le=35)
    gender: str = Field(..., strip_whitespace=True)
    academic_year: int = Field(..., ge=1, le=6)
    study_hours_per_day: float = Field(..., ge=0, le=16)
    exam_pressure: float = Field(..., ge=0, le=10)
    academic_performance: float = Field(..., ge=0, le=100)
    stress_level: float = Field(..., ge=0, le=10)
    anxiety_score: float = Field(..., ge=0, le=10)
    depression_score: float = Field(..., ge=0, le=10)
    sleep_hours: float = Field(..., ge=2, le=14)
    physical_activity: float = Field(..., ge=0, le=10)
    social_support: float = Field(..., ge=0, le=10)
    screen_time: float = Field(..., ge=0, le=16)
    financial_stress: float = Field(..., ge=0, le=10)
    family_expectation: float = Field(..., ge=0, le=10)

@app.post("/predict", tags=["Prediction"])
async def predict(input_data: StudentBurnoutInput, db: Session = Depends(get_db)):
    """
    Predict student burnout level from input features.
    """
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model or scaler not loaded")

    try:
        data = input_data.dict()
        logger.info(f"[PREDICT] Step 1: Received request data with keys: {list(data.keys())}")
        
        # Check for user_id
        if 'user_id' not in data:
            raise HTTPException(status_code=422, detail="user_id is required")
        
        user_id = data['user_id']
        logger.info(f"[PREDICT] Step 2: Extracted user_id = {user_id}")
        
        # Ensure required fields are present
        missing = [f for f in EXPECTED_FEATURES if f not in data]
        if missing:
            raise HTTPException(status_code=422, detail=f"Missing feature(s): {missing}")

        logger.info(f"[PREDICT] Step 3: All expected features present. Total fields: {len(data)}")

        # Keep column order and drop any extra columns
        feature_columns = MODEL_FEATURE_COLUMNS if MODEL_FEATURE_COLUMNS else EXPECTED_FEATURES
        logger.info(f"[PREDICT] Step 4: Using feature columns: {feature_columns}")
        
        missing_in_model = [c for c in feature_columns if c not in data]
        if missing_in_model:
            raise HTTPException(status_code=422, detail=f"Missing model feature(s): {missing_in_model}")

        # Create DataFrame with correct column names
        logger.info(f"[PREDICT] Step 5: Creating DataFrame from input data")
        input_df = pd.DataFrame([data])
        logger.info(f"[PREDICT] Step 5a: Initial DataFrame shape: {input_df.shape}, columns: {list(input_df.columns)}")

        # Reorder columns to match model
        logger.info(f"[PREDICT] Step 6: Reordering columns to match model feature order")
        input_df = input_df[feature_columns]
        logger.info(f"[PREDICT] Step 6a: Final DataFrame shape: {input_df.shape}, columns: {list(input_df.columns)}")
        logger.info(f"[PREDICT] Step 6b: DataFrame dtypes:\n{input_df.dtypes}")

        # Run full pipeline prediction
        logger.info(f"[PREDICT] Step 7: Running model.predict() on input DataFrame")
        try:
            prediction = model.predict(input_df)
            logger.info(f"[PREDICT] Step 7a: Prediction result: {prediction}, type: {type(prediction)}")
        except Exception as e:
            logger.error(f"[PREDICT] FAILED at model.predict(): {str(e)}", exc_info=True)
            raise

        if len(prediction) == 0:
            raise HTTPException(status_code=500, detail="Model returned no prediction")

        label_map = {0: "Low", 1: "Medium", 2: "High"}
        pred_value = int(prediction[0])
        pred_label = label_map.get(pred_value, "Unknown")
        logger.info(f"[PREDICT] Step 8: Mapped prediction {pred_value} to label: {pred_label}")

        # Verify user exists
        logger.info(f"[PREDICT] Step 9: Querying database for user_id = {user_id}")
        try:
            user = db.query(User).filter(User.id == user_id).first()
            logger.info(f"[PREDICT] Step 9a: User query result: {user}")
        except Exception as e:
            logger.error(f"[PREDICT] FAILED at user query: {str(e)}", exc_info=True)
            raise
        
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        # Create burnout prediction
        logger.info(f"[PREDICT] Step 10: Creating BurnoutPrediction object")
        try:
            burnout_pred = BurnoutPrediction(
                user_id=user_id,
                study_hours_per_day=data['study_hours_per_day'],
                exam_pressure=data['exam_pressure'],
                academic_performance=data['academic_performance'],
                stress_level=data['stress_level'],
                anxiety_score=data['anxiety_score'],
                depression_score=data['depression_score'],
                sleep_hours=data['sleep_hours'],
                physical_activity=data['physical_activity'],
                social_support=data['social_support'],
                screen_time=data['screen_time'],
                internet_usage=STORED_ONLY_DEFAULTS["internet_usage"],
                financial_stress=data['financial_stress'],
                family_expectation=data['family_expectation'],
                mental_health_index=derive_mental_health_index(data),
                dropout_risk=derive_dropout_risk(data),
                risk_level=pred_label,
                prediction=pred_label
            )
            logger.info(f"[PREDICT] Step 10a: BurnoutPrediction object created successfully")
        except Exception as e:
            logger.error(f"[PREDICT] FAILED at BurnoutPrediction creation: {str(e)}", exc_info=True)
            raise
        
        logger.info(f"[PREDICT] Step 11: Adding prediction to database session")
        db.add(burnout_pred)
        
        logger.info(f"[PREDICT] Step 12: Committing database transaction")
        try:
            db.commit()
            logger.info(f"[PREDICT] Step 12a: Database commit successful")
        except Exception as e:
            logger.error(f"[PREDICT] FAILED at db.commit(): {str(e)}", exc_info=True)
            db.rollback()
            raise
        
        logger.info(f"[PREDICT] Step 13: Refreshing prediction object from database")
        db.refresh(burnout_pred)
        logger.info(f"[PREDICT] Step 13a: Refresh successful, prediction ID: {burnout_pred.id}")

        logger.info(f"✓ Prediction saved to database (ID: {burnout_pred.id}, User: {user_id})")

        return {"burnout_prediction": pred_label}

    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        logger.error(f"[PREDICT] FATAL ERROR: {str(exc)}")
        logger.error(f"[PREDICT] Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

