from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import joblib
import numpy as np
import pickle
import traceback;

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update with your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripPreference(BaseModel):
    activities: List[str]
    budget: str
    destinationType: List[str]
    duration: str

class PredictionResponse(BaseModel):
    predicted_destination: str
    confidence_score: float
    alternative_destinations: List[dict]


@app.post("/api/predict")
async def predict_destination(preferences: TripPreference):
    try:
        with open('classifier.pkl', 'rb') as model_file:
            model = pickle.load(model_file)
        label_encoder = joblib.load('label_encoder.joblib')
        feature_columns = joblib.load('feature_columns.joblib')

        user_input = pd.DataFrame([0] * len(feature_columns), index=feature_columns).T

        for activity in preferences.activities:
            if activity in user_input.columns:
                user_input[activity] = 1
        for dtype in preferences.destinationType:
            if dtype in user_input.columns:
                user_input[dtype] = 1

        budget_col = f'budget_{preferences.budget}'
        if budget_col in user_input.columns:
            user_input[budget_col] = 1

        duration_col = f'duration_{preferences.duration}'
        if duration_col in user_input.columns:
            user_input[duration_col] = 1

        print("User Input Shape:", user_input.shape)
        print(user_input.head())

        pred_probs = model.predict_proba(user_input)
        top_3_indices = np.argsort(pred_probs[0])[-3:][::-1]

        predictions = []
        for idx, prob in zip(top_3_indices, pred_probs[0][top_3_indices]):
            destination = label_encoder.inverse_transform([idx])[0]
            predictions.append({
                "destination": destination,
                "confidence": float(prob)
            })

        return {
            "predicted_destination": predictions[0]["destination"],
            "confidence_score": predictions[0]["confidence"],
            "alternative_destinations": predictions[1:]
        }

    except Exception as e:
        print(traceback.format_exc())  # Print the full error traceback in the terminal
        raise HTTPException(status_code=500, detail=str(e))
