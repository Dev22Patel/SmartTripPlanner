import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/index';
import { fetchItinerary, setDestination, updatePreferences } from '@/store/itinerarySlice';
import debounce from 'lodash/debounce'; // Install lodash if not already

type Activity = {
  title: string;
  description?: string;
  imageUrl?: string;
};

const UserPreferencePage: React.FC = () => {
  console.log('Rendering UserPreferencePage');
  const { place } = useParams<{ place: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const preferences = useSelector((state: RootState) => state.itinerary.preferences);
  const itinerary = useSelector((state: RootState) => state.itinerary.itinerary);
  const loading = useSelector((state: RootState) => state.itinerary.loading);
  const error = useSelector((state: RootState) => state.itinerary.error);

  const [showItinerary, setShowItinerary] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [showDestinationModal, setShowDestinationModal] = useState(!place);
  const [tempDestination, setTempDestination] = useState('');
  const [localInterests, setLocalInterests] = useState(preferences.interests || ''); // Local buffer for interests

  const destination = place || 'Unknown Destination';

  useEffect(() => {
    if (!place) {
      setShowDestinationModal(true);
    } else {
      dispatch(setDestination(destination));
      setShowDestinationModal(false);
    }
  }, [place, destination, dispatch]);

  // Debounced Redux dispatch for preferences
  const debouncedUpdatePreferences = useCallback(
    debounce((name: string, value: string) => {
      dispatch(updatePreferences({ [name]: value }));
    }, 300),
    [dispatch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'interests') {
      setLocalInterests(value); // Update local state immediately
      debouncedUpdatePreferences(name, value); // Debounced Redux update
    } else {
      dispatch(updatePreferences({ [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchItinerary({ destination, preferences }));
    navigate(`/itinerary-builder?destination=${encodeURIComponent(destination)}`);
  };

  const handleBackToPreferences = () => {
    setShowItinerary(false);
  };

  const handleDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempDestination.trim()) {
      dispatch(setDestination(tempDestination.trim()));
      setShowDestinationModal(false);
      navigate(`/destination/${encodeURIComponent(tempDestination.trim())}`);
    }
  };

  // Destination Modal Component
  const DestinationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Enter Your Destination
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please provide a city name to start planning your trip.
        </p>
        <form onSubmit={handleDestinationSubmit} className="space-y-4">
          <input
            key="destination-input" // Ensure unique key
            type="text"
            value={tempDestination}
            onChange={(e) => setTempDestination(e.target.value)}
            placeholder="Enter city name (e.g., Paris)"
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );

  // Preference Form Component
  const PreferenceForm = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white light:bg-gray-100 dark:bg-zinc-900 rounded-xl shadow-lg p-8 transition-all duration-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-black light:text-gray-900 dark:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Customize Your Trip
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">Who Are You Traveling With?</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'solo', label: 'Solo', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { value: 'couple', label: 'Couple', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                { value: 'family', label: 'Family', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { value: 'friends', label: 'Friends', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    preferences.tripType === type.value
                      ? 'border-blue-500 bg-blue-50 light:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 light:border-gray-300 dark:border-gray-700 hover:bg-gray-50 light:hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="tripType"
                    value={type.value}
                    checked={preferences.tripType === type.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={type.icon} />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trip Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">Duration (Days)</label>
            <div className="flex items-center">
              <input
                type="range"
                name="days"
                value={preferences.days}
                onChange={handleInputChange}
                min="1"
                max="14"
                className="w-full h-2 bg-gray-200 light:bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-4 text-lg font-semibold w-8 text-center text-gray-800 light:text-gray-900 dark:text-white">{preferences.days}</span>
            </div>
          </div>

          {/* Budget Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">Budget Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'budget', label: 'Budget', icon: '💰' },
                { value: 'medium', label: 'Medium', icon: '💰💰' },
                { value: 'luxury', label: 'Luxury', icon: '💰💰💰' },
              ].map((budget) => (
                <label
                  key={budget.value}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    preferences.budget === budget.value
                      ? 'border-blue-500 bg-blue-50 light:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 light:border-gray-300 dark:border-gray-700 hover:bg-gray-50 light:hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={budget.value}
                    checked={preferences.budget === budget.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{budget.icon}</span>
                  <span className="text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">{budget.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">Pace</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'relaxed', label: 'Relaxed', icon: '🐢' },
                { value: 'moderate', label: 'Moderate', icon: '🚶' },
                { value: 'active', label: 'Active', icon: '🏃' },
              ].map((pace) => (
                <label
                  key={pace.value}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    preferences.pace === pace.value
                      ? 'border-blue-500 bg-blue-50 light:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 light:border-gray-300 dark:border-gray-700 hover:bg-gray-50 light:hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="pace"
                    value={pace.value}
                    checked={preferences.pace === pace.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{pace.icon}</span>
                  <span className="text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">{pace.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transportation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">Transportation Preference</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'public', label: 'Public Transit', icon: 'M8 7h8m0 0v8m0-8l-8 8m.5-8.5l.315-4.355A1 1 0 0111.808 2h.383a1 1 0 01.994.89L13.5 7M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { value: 'rental', label: 'Rental Car', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
                { value: 'walking', label: 'Walking', icon: 'M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z' },
                { value: 'tour', label: 'Guided Tours', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
              ].map((transport) => (
                <label
                  key={transport.value}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    preferences.transportation === transport.value
                      ? 'border-blue-500 bg-blue-50 light:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 light:border-gray-300 dark:border-gray-700 hover:bg-gray-50 light:hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="transportation"
                    value={transport.value}
                    checked={preferences.transportation === transport.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={transport.icon} />
                  </svg>
                  <span className="text-xs font-medium text-center text-gray-700 light:text-gray-900 dark:text-gray-300">{transport.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">Accommodation Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'hotel', label: 'Hotel', icon: '🏨' },
                { value: 'hostel', label: 'Hostel', icon: '🛏️' },
                { value: 'apartment', label: 'Apartment', icon: '🏢' },
                { value: 'resort', label: 'Resort', icon: '🌴' },
              ].map((accom) => (
                <label
                  key={accom.value}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    preferences.accommodation === accom.value
                      ? 'border-blue-500 bg-blue-50 light:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 light:border-gray-300 dark:border-gray-700 hover:bg-gray-50 light:hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="accommodation"
                    value={accom.value}
                    checked={preferences.accommodation === accom.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{accom.icon}</span>
                  <span className="text-xs font-medium text-gray-700 light:text-gray-900 dark:text-gray-300">{accom.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Your Interests and Preferences</label>
            <textarea
              name="interests"
              value={localInterests} // Use local state
              onChange={handleInputChange}
              placeholder="Describe the activities and places you're interested in... e.g., local cuisine, museums, hiking, shopping, cultural sites"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 transition-colors duration-200"
            />
          </div>

          {/* Generate button */}
          <button
            type="submit"
            className={`w-full py-4 px-6 flex justify-center items-center rounded-lg text-white font-medium
              ${loading ? 'bg-gray-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
              transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Your Perfect Itinerary...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
                Generate My Itinerary
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Itinerary Component with Images
  const ItineraryView = () => (

    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden transition-all duration-200">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={handleBackToPreferences}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Preferences
          </button>
          <h2 className="text-xl font-bold">
            {preferences.tripType.charAt(0).toUpperCase() + preferences.tripType.slice(1)} Trip • {preferences.days} {preferences.days === 1 ? 'Day' : 'Days'}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title="Print Itinerary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button
              onClick={() => {
                const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                  JSON.stringify(itinerary, null, 2)
                )}`;
                const link = document.createElement('a');
                link.href = jsonString;
                link.download = `${destination.toLowerCase().replace(/\s+/g, '-')}-itinerary.json`;
                link.click();
              }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title="Download Itinerary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex p-2 border-b border-gray-200 dark:border-gray-700">
            {itinerary.map((day, index) => (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors duration-200 mx-1
                  ${activeDay === index
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {day.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{itinerary[activeDay].title}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveDay(activeDay > 0 ? activeDay - 1 : itinerary.length - 1)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                disabled={itinerary.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveDay((activeDay + 1) % itinerary.length)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                disabled={itinerary.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {itinerary[activeDay].activities.map((activity: Activity, actIndex: number) => (
              <div key={actIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {activity.imageUrl && (
                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                      <img
                        src={activity.imageUrl}
                        alt={typeof activity.title === 'string' ? activity.title : undefined}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/400/300"; // Fallback placeholder
                          e.currentTarget.alt = "Image unavailable";
                        }}
                      />
                    </div>
                  )}
                  <div className={`p-4 ${activity.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                    <h3 className="font-bold text-lg mb-2">{activity.title}</h3>
                    <p className="text-gray-800 dark:text-gray-200">{activity.description || activity.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  console.log('Loading state:', loading);
  
  return (
    <div className="min-h-screen transition-colors duration-200 dark:bg-zinc-950 dark:text-white py-10 px-4 mb-20">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Plan Your Journey to {destination}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {showItinerary ? `Your personalized ${preferences.days}-day itinerary for ${destination}` : 'Customize your perfect trip with our AI-powered itinerary planner.'}
        </p>
      </div>

      {showDestinationModal && <DestinationModal />}

      {loading ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-200">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 mb-6">
                <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Creating Your Dream Itinerary</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Our AI is crafting a personalized {preferences.days}-day {preferences.tripType} trip to {destination} based on your preferences...
              </p>
            </div>
          </div>
        </div>
      ) : showItinerary ? (
        <ItineraryView />
      ) : (
        <PreferenceForm />
      )}
    </div>
  );
};

export default UserPreferencePage;
