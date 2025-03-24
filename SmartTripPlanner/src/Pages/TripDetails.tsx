import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

interface Trip {
  _id: string;
  destination: string;
  createdAt: string;
  days: {
    dayNumber: number;
    date: string;
    description: string;
    activities: {
      title: string;
      description: string;
      imageUrl?: string;
    }[];
  }[];
}

export default function TripDetails() {
  const location = useLocation(); // Access the location object
  const navigate = useNavigate();
  const trip = location.state?.trip as Trip; // Retrieve the trip object from state

  if (!trip) {
    // If no trip is passed, navigate back to the Profile page
    navigate("/profile");
    return null;
  }

  const [editableTrip, setEditableTrip] = useState<Trip>(trip); // Editable trip state
  const [isSaving, setIsSaving] = useState(false); // Saving state

  const handleInputChange = (dayIndex: number, field: string, value: string) => {
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const handleActivityChange = (
    dayIndex: number,
    activityIndex: number,
    field: string,
    value: string
  ) => {
    const updatedDays = [...editableTrip.days];
    const updatedActivities = [...updatedDays[dayIndex].activities];
    updatedActivities[activityIndex] = {
      ...updatedActivities[activityIndex],
      [field]: value,
    };
    updatedDays[dayIndex].activities = updatedActivities;
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://smarttripplanner.onrender.com/api/itineraries/${editableTrip._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editableTrip),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-black dark:text-white m-10">
      <h1 className="text-3xl font-bold">
        <input
          type="text"
          value={editableTrip.destination}
          onChange={(e) =>
            setEditableTrip({ ...editableTrip, destination: e.target.value })
          }
          className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary"
        />
      </h1>
      <p className="text-gray-500">
        Created on: {new Date(editableTrip.createdAt).toDateString()}
      </p>
      <div className="space-y-6">
        {editableTrip.days.map((day, dayIndex) => (
          <div key={day.dayNumber} className="border p-4 rounded-md">
            <h2 className="text-xl font-semibold">
              Day {day.dayNumber}
            </h2>
            <input
              type="text"
              value={day.date}
              onChange={(e) =>
                handleInputChange(dayIndex, "date", e.target.value)
              }
              className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary w-full"
            />
            <textarea
              value={day.description}
              onChange={(e) =>
                handleInputChange(dayIndex, "description", e.target.value)
              }
              className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary w-full mt-2"
            />
            <div className="space-y-4 mt-4">
              {day.activities.map((activity, activityIndex) => (
                <div key={activityIndex} className="border p-2 rounded-md">
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) =>
                      handleActivityChange(
                        dayIndex,
                        activityIndex,
                        "title",
                        e.target.value
                      )
                    }
                    className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary w-full"
                  />
                  <textarea
                    value={activity.description}
                    onChange={(e) =>
                      handleActivityChange(
                        dayIndex,
                        activityIndex,
                        "description",
                        e.target.value
                      )
                    }
                    className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary w-full mt-2"
                  />
                  {activity.imageUrl && (
                    <img
                      src={activity.imageUrl}
                      alt={activity.title}
                      className="h-32 w-full object-cover rounded-md mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={saveChanges}
        disabled={isSaving}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}