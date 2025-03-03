import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PredictionResult {
  predicted_destination: string;
  confidence_score: number;
  alternative_destinations: Array<{
    destination: string;
    confidence: number;
  }>;
}

interface TravelState {
  prediction: PredictionResult | null;
}

// Initialize from localStorage
const getInitialPrediction = (): PredictionResult | null => {
  const storedPrediction = localStorage.getItem('travelPrediction');
  if (storedPrediction) {
    try {
      return JSON.parse(storedPrediction);
    } catch (error) {
      console.error('Failed to parse stored prediction:', error);
      return null;
    }
  }
  return null;
};

const initialState: TravelState = {
  prediction: getInitialPrediction(),
};

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    setTravelPrediction: (state, action: PayloadAction<PredictionResult>) => {
      state.prediction = action.payload;
      // Save to localStorage on every state change
      localStorage.setItem('travelPrediction', JSON.stringify(action.payload));
    },
    clearTravelPrediction: (state) => {
      state.prediction = null;
      localStorage.removeItem('travelPrediction');
    },
  },
});

export const { setTravelPrediction, clearTravelPrediction } = travelSlice.actions;
export default travelSlice.reducer;
