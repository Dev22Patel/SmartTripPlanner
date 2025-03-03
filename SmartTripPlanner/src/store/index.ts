import { configureStore } from '@reduxjs/toolkit'
import predictionReducer from './PredictionSlice'

const store = configureStore({
  reducer: {
    travel: predictionReducer,  // Changed 'prediction' to 'travel' to match component usage
  },
})

export default store
