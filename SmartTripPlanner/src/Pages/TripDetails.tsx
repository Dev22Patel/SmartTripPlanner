import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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

interface Alert {
  dayNumber: number;
  placeTitle: string;
  reason: string;
  severity: "warning" | "critical";
}

interface CostEstimate {
  accommodation: number;
  activities: number;
  transportation: number;
  food: number;
  total: number;
}

export default function TripDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip as Trip;

  if (!trip) {
    navigate("/profile");
    return null;
  }

  const [editableTrip, setEditableTrip] = useState<Trip>(trip);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  // Static exchange rate (as of March 24, 2025, approx value; use an API for real-time rates)
  const USD_TO_INR = 83.5;

  // Fetch alerts and calculate cost estimate on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const mockAlerts: Alert[] = [
          {
            dayNumber: 2,
            placeTitle: "Grand Museum",
            reason: "Temporary closure due to renovation",
            severity: "warning"
          },
          {
            dayNumber: 3,
            placeTitle: "Mountain Trail",
            reason: "Closed due to landslide risk",
            severity: "critical"
          }
        ];
        setAlerts(mockAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
    calculateCostEstimate();
  }, [editableTrip]);

  // Simple cost estimation function (mock API)
  const calculateCostEstimate = () => {
    const days = editableTrip.days.length;
    const totalActivities = editableTrip.days.reduce((sum, day) => sum + day.activities.length, 0);

    // Base costs per day (in USD) - these could be fetched from an API in a real implementation
    const baseCosts = {
      accommodation: 100, // $100 per night
      food: 50,        // $50 per day
      transportation: 30, // $30 per day
      activity: 25     // $25 per activity
    };

    let estimate: CostEstimate = {
      accommodation: baseCosts.accommodation * days,
      food: baseCosts.food * days,
      transportation: baseCosts.transportation * days,
      activities: baseCosts.activity * totalActivities,
      total: 0
    };

    estimate.total = estimate.accommodation + estimate.food + estimate.transportation + estimate.activities;

    // Adjust based on destination (simple multiplier)
    const destinationMultiplier = {
      "Paris": 1.5,
      "New York": 1.4,
      "Tokyo": 1.3,
      "London": 1.5,
    }[editableTrip.destination] || 1.0;

    estimate.total = Math.round(estimate.total * destinationMultiplier);
    estimate.accommodation = Math.round(estimate.accommodation * destinationMultiplier);
    estimate.food = Math.round(estimate.food * destinationMultiplier);
    estimate.transportation = Math.round(estimate.transportation * destinationMultiplier);
    estimate.activities = Math.round(estimate.activities * destinationMultiplier);

    // Convert to INR if selected
    if (currency === "INR") {
      estimate = {
        accommodation: Math.round(estimate.accommodation * USD_TO_INR),
        activities: Math.round(estimate.activities * USD_TO_INR),
        transportation: Math.round(estimate.transportation * USD_TO_INR),
        food: Math.round(estimate.food * USD_TO_INR),
        total: Math.round(estimate.total * USD_TO_INR),
      };
    }

    setCostEstimate(estimate);
  };

  const handleInputChange = (dayIndex: number, field: string, value: string) => {
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setEditableTrip({ ...editableTrip, days: updatedDays });
    calculateCostEstimate();
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
    calculateCostEstimate();
  };

  const addActivity = (dayIndex: number) => {
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex].activities.push({
      title: "New Activity",
      description: "Add description here"
    });
    setEditableTrip({ ...editableTrip, days: updatedDays });
    calculateCostEstimate();
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex].activities.splice(activityIndex, 1);
    setEditableTrip({ ...editableTrip, days: updatedDays });
    calculateCostEstimate();
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://smarttripplanner.onrender.com/api/itineraries/${editableTrip._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editableTrip),
        }
      );

      if (!response.ok) throw new Error("Failed to save changes");
      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTrip = async () => {
    if (!window.confirm("Are you sure you want to delete this entire trip? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://smarttripplanner.onrender.com/api/itineraries/${editableTrip._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to delete trip");
      toast.success("Trip deleted successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };


  const [earthquakes, setEarthquakes] = useState<any[]>([]);
    useEffect(() => {
        fetchEarthquakes();
    }, [editableTrip]);
  const fetchEarthquakes = async () => {
    try {
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-03-01&endtime=2025-03-24`
      );

      if (!response.ok) throw new Error("Failed to fetch earthquake data");

      const data = await response.json();
    const filteredQuakes: { properties: { place: string } }[] = data.features.filter((quake: { properties: { place: string } }) =>
      quake.properties.place.includes(editableTrip.destination)
    );

      setEarthquakes(filteredQuakes);
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
    }
  };



  // Toggle currency and recalculate
  const toggleCurrency = () => {
    setCurrency(currency === "USD" ? "INR" : "USD");
    calculateCostEstimate();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto p-4 text-black dark:text-white">
      <div className="lg:w-2/3 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <input
              type="text"
              value={editableTrip.destination}
              onChange={(e) => {
                setEditableTrip({ ...editableTrip, destination: e.target.value });
                calculateCostEstimate();
              }}
              className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary px-2"
            />
          </h1>
          <div className="flex gap-2">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={deleteTrip}
              disabled={isDeleting}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Trip"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-500 mb-4">
            Created on: {new Date(editableTrip.createdAt).toDateString()}
          </p>

          <div className="flex overflow-x-auto mb-4 border-b">
            {editableTrip.days.map((day, index) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 font-medium whitespace-nowrap ${
                  activeTab === index
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Day {day.dayNumber}
                {alerts.some(alert => alert.dayNumber === day.dayNumber) && (
                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {editableTrip.days[activeTab] && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    Day {editableTrip.days[activeTab].dayNumber}
                  </h2>
                  <input
                    type="date"
                    value={editableTrip.days[activeTab].date}
                    onChange={(e) => handleInputChange(activeTab, "date", e.target.value)}
                    className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Day Description</label>
                  <textarea
                    value={editableTrip.days[activeTab].description}
                    onChange={(e) => handleInputChange(activeTab, "description", e.target.value)}
                    rows={3}
                    className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                  />
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Activities</h3>
                    <button
                      onClick={() => addActivity(activeTab)}
                      className="text-primary hover:text-primary-dark text-sm flex items-center"
                    >
                      <span className="mr-1">+</span> Add Activity
                    </button>
                  </div>

                  {editableTrip.days[activeTab].activities.map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700 relative"
                    >
                      <button
                        onClick={() => removeActivity(activeTab, activityIndex)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>

                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Activity Title</label>
                        <input
                          type="text"
                          value={activity.title}
                          onChange={(e) =>
                            handleActivityChange(activeTab, activityIndex, "title", e.target.value)
                          }
                          className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                        />
                      </div>

                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Activity Description</label>
                        <textarea
                          value={activity.description}
                          onChange={(e) =>
                            handleActivityChange(activeTab, activityIndex, "description", e.target.value)
                          }
                          rows={2}
                          className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                        />
                      </div>

                      {/* <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Image URL</label>
                        <input
                          type="text"
                          value={activity.imageUrl || ""}
                          onChange={(e) =>
                            handleActivityChange(activeTab, activityIndex, "imageUrl", e.target.value)
                          }
                          placeholder="Enter image URL (optional)"
                          className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                        />
                      </div> */}

                      {activity.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            className="h-40 w-full object-cover rounded-md"
                          />
                        </div>
                      )}

                      {alerts.some(
                        alert =>
                          alert.dayNumber === editableTrip.days[activeTab].dayNumber &&
                          alert.placeTitle === activity.title
                      ) && (
                        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-200 text-sm">
                          ⚠️ This activity may be affected by closures or restrictions
                        </div>
                      )}
                    </div>
                  ))}

                  {editableTrip.days[activeTab].activities.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No activities yet. Click "Add Activity" to get started.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold mb-4">Earthquake Alerts</h2>

  {earthquakes.length > 0 ? (
    <div className="space-y-4">
      {earthquakes.map((quake, index) => {
        const { place, mag, time } = quake.properties;
        return (
          <div key={index} className="p-3 rounded-md bg-red-100 dark:bg-red-900 border-l-4 border-red-500">
            <h3 className="font-medium">🌍 {place}</h3>
            <p>Magnitude: {mag}</p>
            <p>Date: {new Date(time).toDateString()}</p>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-gray-500">No recent earthquakes reported.</p>
  )}
</div>

        </div>
      </div>

      <div className="lg:w-1/3 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Alerts</h2>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    alert.severity === "critical"
                      ? "bg-red-100 dark:bg-red-900 border-l-4 border-red-500"
                      : "bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-2">
                      {alert.severity === "critical" ? "🚫" : "⚠️"}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Day {alert.dayNumber}: {alert.placeTitle}
                      </h3>
                      <p className="text-sm mt-1">{alert.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No alerts for this trip at the moment.
            </div>
          )}

        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cost Estimate</h2>
            <button
              onClick={toggleCurrency}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Switch to {currency === "USD" ? "INR" : "USD"}
            </button>
          </div>
          {costEstimate ? (
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Accommodation:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.accommodation}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Activities:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.activities}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transportation:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.transportation}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Food:</span>
                <span className="font-medium">{currency === "USD" ? "$" : "₹"}{costEstimate.food}</span>
              </li>
              <li className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Estimated Cost:</span>
                <span className="font-semibold">{currency === "USD" ? "$" : "₹"}{costEstimate.total}</span>
              </li>
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Calculating cost estimate...
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            *Note: This is a rough estimate based on average costs. Actual costs may vary.
            {currency === "INR" && " Exchange rate used: 1 USD = 83.5 INR (static)."}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Destination:</span>
              <span className="font-medium">{editableTrip.destination}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="font-medium">{editableTrip.days.length} days</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
              <span className="font-medium">
                {editableTrip.days[0]?.date ? new Date(editableTrip.days[0].date).toLocaleDateString() : "Not set"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">End Date:</span>
              <span className="font-medium">
                {editableTrip.days[editableTrip.days.length - 1]?.date
                  ? new Date(editableTrip.days[editableTrip.days.length - 1].date).toLocaleDateString()
                  : "Not set"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Activities:</span>
              <span className="font-medium">
                {editableTrip.days.reduce((total, day) => total + day.activities.length, 0)}
              </span>
            </li>
            </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trip Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Export Itinerary
            </button>
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
              Share Trip
            </button>
            <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
              Print Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
