// import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// interface AlternativeDestination {
//   destination: string
//   confidence: number
// }

// export interface PredictionResult {
//   predicted_destination: string
//   confidence_score: number
//   alternative_destinations: AlternativeDestination[]
// }

// interface PredictionState {
//   prediction: PredictionResult | null
// }

// const initialState: PredictionState = {
//   prediction: null,
// }

// const predictionSlice = createSlice({
//   name: 'prediction',
//   initialState,
//   reducers: {
//     setPrediction: (state, action: PayloadAction<PredictionResult>) => {
//       state.prediction = action.payload
//     },
//     clearPrediction: (state) => {
//       state.prediction = null
//     },
//   },
// })

// export const { setPrediction, clearPrediction } = predictionSlice.actions
// export default predictionSlice.reducer
