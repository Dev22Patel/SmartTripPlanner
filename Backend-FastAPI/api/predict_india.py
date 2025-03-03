from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import joblib
import numpy as np
import pickle
import traceback
import json

router = APIRouter()

class TripPreference(BaseModel):
    activities: List[str]
    budget: str
    destinationType: List[str]
    duration: str

class PredictionResponse(BaseModel):
    predicted_destination: str
    confidence_score: float
    alternative_destinations: List[dict]
    destination_info: Dict[str, Any]

@router.post("/")
async def predict_destination(preferences: TripPreference):
    with open('models/indian_places_classifier.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    label_encoder = joblib.load('models/label_encoder_india.joblib')
    scaler = joblib.load('models/scaler.joblib')
    feature_columns = joblib.load('models/feature_columns_india.joblib')

    # Load destination info database (JSON or any other format)
    try:
        with open('data/destination_info.json', 'r') as f:
            destination_database = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        destination_database = {}

    try:
        # Create a dataframe with zeros for all feature columns
        user_input = pd.DataFrame([0] * len(feature_columns), index=feature_columns).T

        # Set values based on user preferences
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

        # Make prediction
        pred_probs = model.predict_proba(user_input)
        top_3_indices = np.argsort(pred_probs[0])[-3:][::-1]

        predictions = []
        for idx, prob in zip(top_3_indices, pred_probs[0][top_3_indices]):
            destination = label_encoder.inverse_transform([idx])[0]
            predictions.append({
                "destination": destination,
                "confidence": float(prob)
            })

        # Get destination info from database if available
        main_destination = predictions[0]["destination"]
        destination_info = destination_database.get(main_destination, {})

        # If no info available for this destination, provide fallback info
        if not destination_info and main_destination:
            destination_info = {
                "best_time": get_default_best_time(preferences.destinationType),
                "popular_spots": f"Top attractions in {main_destination}",
                "avg_cost": get_default_cost(preferences.budget),
                "language": get_default_language(main_destination)
            }

        return {
            "predicted_destination": main_destination,
            "confidence_score": predictions[0]["confidence"],
            "alternative_destinations": predictions[1:],
            "destination_info": destination_info
        }

    except Exception as e:
        print(traceback.format_exc())  # Print the full error traceback
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions for fallback destination info
def get_default_best_time(destination_types):
    if "Beach" in destination_types:
        return "November to March"
    elif "Mountain" in destination_types:
        return "March to June, September to November"
    elif "Heritage" in destination_types:
        return "October to March"
    else:
        return "October to March (peak season)"

def get_default_cost(budget):
    budget_map = {
        "Low": "₹1,500 - ₹3,000 per day",
        "Medium": "₹3,000 - ₹7,000 per day",
        "High": "₹7,000+ per day"
    }
    return budget_map.get(budget, "Varies by season")

def get_default_language(destination):
    # This is a simplified mapping of regions to primary languages
    north_india = ["Delhi", "Agra", "Jaipur", "Shimla", "Manali"]
    south_india = ["Bangalore", "Chennai", "Hyderabad", "Kochi"]
    west_india = ["Mumbai", "Goa", "Pune"]
    east_india = ["Kolkata", "Darjeeling", "Gangtok"]

    if any(city in destination for city in north_india):
        return "Hindi, English"
    elif any(city in destination for city in south_india):
        return "Tamil, Telugu, Kannada, Malayalam, English"
    elif any(city in destination for city in west_india):
        return "Marathi, Konkani, Hindi, English"
    elif any(city in destination for city in east_india):
        return "Bengali, Nepali, Hindi, English"
    else:
        return "Hindi, English, Local languages"
