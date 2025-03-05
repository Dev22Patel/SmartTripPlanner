import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { useNavigate } from 'react-router-dom';

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();

  // Get itinerary from Redux store
  const itinerary = useSelector((state: RootState) => state.itinerary.itinerary);
  const loading = useSelector((state: RootState) => state.itinerary.loading);
  const error = useSelector((state: RootState) => state.itinerary.error);
  const destination = useSelector((state: RootState) => state.itinerary.destination);

  return (
    <div className="itinerary-page">
      <h1>Your Itinerary for {destination}</h1>

      {loading && <p>Loading itinerary...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && itinerary.length > 0 ? (
        itinerary.map((day) => (
          <div key={day.day} className="day-section">
            <h2>{day.title}</h2>
            <ul>
              {day.activities.map((activity, index) => (
                <li key={index} className="activity">
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>
                  {activity.imageUrl && <img src={activity.imageUrl} alt={activity.title} />}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No itinerary available. Please generate one.</p>
      )}

      <button onClick={() => navigate('/preferences')}>Back to Preferences</button>
    </div>
  );
};

export default ItineraryPage;
