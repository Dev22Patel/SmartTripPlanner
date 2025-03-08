import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import predictionReducer from './PredictionSlice';
import itineraryReducer from './itinerarySlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['itinerary'], // Only persist itinerary data
};

// Combine reducers
const rootReducer = combineReducers({
  travel: predictionReducer,
  itinerary: itineraryReducer, // Persisting itinerary slice
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for async thunks
    }),
});

// Persistor for persisting state
export const persistor = persistStore(store);

// Type definitions for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
