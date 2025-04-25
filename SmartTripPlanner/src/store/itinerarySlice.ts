import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define interfaces for type safety
interface Activity {
  category: string;
  cost: string;
  location: string;
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  time?: string;
  saveLoading: boolean;
  saveError: string | null;
}

interface ItineraryDay {
  description: string;
  id: string;
  day: number;
  title: string;
  date: string;
  activities: Activity[];
}

interface ItineraryPreferences {
  days: number;
  interests: string;
  budget: string;
  tripType: string;
  transportation: string;
  pace: string;
  accommodation: string;
}

interface ItineraryState {
    destination: string;
    preferences: ItineraryPreferences;
    itinerary: ItineraryDay[];
    loading: boolean;
    error: string | null;
    saveLoading: boolean;   // Add this property
    saveError: string | null;  // Add this property
}

// Initial state
const initialState: ItineraryState = {
  destination: '',
  preferences: {
    days: 1,
    interests: '',
    budget: 'medium',
    tripType: 'solo',
    transportation: 'public',
    pace: 'moderate',
    accommodation: 'hotel',
  },
  itinerary: [],
  loading: false,
  error: null,
  saveLoading: false,
  saveError: null,
};

// Async thunk for fetching itinerary
export const fetchItinerary = createAsyncThunk(
  'itinerary/fetchItinerary',
  async (
    { destination, preferences }: { destination: string; preferences: ItineraryPreferences },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('https://smarttripplanner.onrender.com/api/generate-itinerary', {
        destination,
        preferences,
      });

      return response.data.itinerary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to generate itinerary');
    }
  }
);


export const saveItineraryToDb = createAsyncThunk(
    'itinerary/saveItineraryToDb',
    async ({ destination, days }: { destination: string; days: any[] }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          return rejectWithValue('No authentication token found');
        }

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Changed to match what your middleware expects
          }
        };

        const response = await axios.post(
          `http://localhost:5000/api/save-itinerary`,
          {
            destination,
            days
          }, // No need to send userId as we'll get it from the token
          config
        );

        return response.data;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save itinerary');
      }
    }
);


// Create the slice
const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    setDestination: (state, action: PayloadAction<string>) => {
      state.destination = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<ItineraryPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetItinerary: () => initialState,

    addDay: (state, action: PayloadAction<ItineraryDay>) => {
      state.itinerary.push(action.payload);
    },
    updateDay: (state, action: PayloadAction<ItineraryDay>) => {
      state.itinerary = state.itinerary.map(day => (day.id === action.payload.id ? action.payload : day));
    },
    removeDay: (state, action: PayloadAction<string>) => {
      state.itinerary = state.itinerary.filter(day => day.id !== action.payload);
    },

    addActivity: (state, action: PayloadAction<{ dayId: string; activity: Activity }>) => {
      const day = state.itinerary.find(day => day.id === action.payload.dayId);
      if (day) {
        day.activities.push(action.payload.activity);
      }
    },
    updateActivity: (state, action: PayloadAction<{ dayId: string; activity: Activity }>) => {
      const day = state.itinerary.find(day => day.id === action.payload.dayId);
      if (day) {
        day.activities = day.activities.map(activity =>
          activity.id === action.payload.activity.id ? action.payload.activity : activity
        );
      }
    },
    removeActivity: (state, action: PayloadAction<{ dayId: string; activityId: string }>) => {
      const day = state.itinerary.find(day => day.id === action.payload.dayId);
      if (day) {
        day.activities = day.activities.filter(activity => activity.id !== action.payload.activityId);
      }
    },
  },
 extraReducers: (builder) => {
  builder
    // Existing fetchItinerary cases
    .addCase(fetchItinerary.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchItinerary.fulfilled, (state, action) => {
      state.loading = false;
      state.itinerary = action.payload;
      state.error = null;
    })
    .addCase(fetchItinerary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.itinerary = [];
    })
    // Add saveItineraryToDb cases
    .addCase(saveItineraryToDb.pending, (state) => {
      state.saveLoading = true;
      state.saveError = null;
    })
    .addCase(saveItineraryToDb.fulfilled, (state) => {
      state.saveLoading = false;
      state.saveError = null;
    })
    .addCase(saveItineraryToDb.rejected, (state, action) => {
      state.saveLoading = false;
      state.saveError = action.payload as string;
    });
},
});

// Export actions
export const {
  setDestination,
  updatePreferences,
  resetItinerary,
  addDay,
  updateDay,
  removeDay,
  addActivity,
  updateActivity,
  removeActivity,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
