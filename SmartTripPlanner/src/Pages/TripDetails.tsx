import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
      category?: string;
      cost?: string;
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

interface DestinationCosts {
  accommodation: number;
  food: number;
  transportation: number;
  activity: number;
  multiplier: number;
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
  const [destinationCosts, setDestinationCosts] = useState<DestinationCosts | null>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(true);

  // Static exchange rate (as of March 24, 2025, approx value; use an API for real-time rates)
  const USD_TO_INR = 83.5;

  // Fetch destination costs, alerts, and calculate cost estimate on mount
  useEffect(() => {
    fetchDestinationCosts();
    fetchAlerts();
  }, [editableTrip.destination]);

  // Recalculate costs when destination costs are loaded or trip is edited
  useEffect(() => {
    if (destinationCosts) {
      calculateCostEstimate();
    }
  }, [destinationCosts, editableTrip, currency]);

  // Fetch destination costs from the database
  const fetchDestinationCosts = async () => {
    setIsLoadingCosts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/destination-costs/${encodeURIComponent(editableTrip.destination)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        setDestinationCosts(response.data);
      } else {
        // Fallback to default costs if destination not found in database
        console.warn(`No costs found for ${editableTrip.destination}, using default values`);
        setDestinationCosts({
          accommodation: 100,
          food: 50,
          transportation: 30,
          activity: 25,
          multiplier: 1.0
        });
      }
    } catch (error) {
      console.error("Error fetching destination costs:", error);
      // Fallback to default costs on error
      setDestinationCosts({
        accommodation: 100,
        food: 50,
        transportation: 30,
        activity: 25,
        multiplier: 1.0
      });
      toast.error("Failed to fetch destination costs. Using default values.");
    } finally {
      setIsLoadingCosts(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/alerts/${encodeURIComponent(editableTrip.destination)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        setAlerts(response.data);
      } else {
        // Fallback to mock alerts if none found in database
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
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Fallback to empty alerts on error
      setAlerts([]);
    }
  };

  // Calculate cost estimate based on destination costs from the database
  const calculateCostEstimate = () => {
    if (!destinationCosts) return;

    const days = editableTrip.days.length;

    // Count activities by category to apply specific pricing
    const activityCategories = {
      attraction: 0,
      food: 0,
      entertainment: 0,
      transport: 0
    };

    // Calculate activity counts by category
    editableTrip.days.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.category) {
          // @ts-ignore - Dynamic property access
          if (activityCategories[activity.category] !== undefined) {
            // @ts-ignore - Dynamic property access
            activityCategories[activity.category]++;
          } else {
            // Default to 'attraction' if category not recognized
            activityCategories.attraction++;
          }
        } else {
          // Default to 'attraction' if no category
          activityCategories.attraction++;
        }
      });
    });

    // Calculate total activities
    const totalActivities = editableTrip.days.reduce((sum, day) => sum + day.activities.length, 0);

    // Initialize estimate with costs from database
    let estimate: CostEstimate = {
      accommodation: destinationCosts.accommodation * days,
      food: destinationCosts.food * days,
      transportation: destinationCosts.transportation * days,
      activities: destinationCosts.activity * totalActivities,
      total: 0
    };

    // Apply any activity-specific pricing from DB
    // This would be expanded with actual logic based on your database schema

    // Calculate total
    estimate.total = estimate.accommodation + estimate.food + estimate.transportation + estimate.activities;

    // Apply destination multiplier from database
    const multiplier = destinationCosts.multiplier || 1.0;
    estimate.total = Math.round(estimate.total * multiplier);
    estimate.accommodation = Math.round(estimate.accommodation * multiplier);
    estimate.food = Math.round(estimate.food * multiplier);
    estimate.transportation = Math.round(estimate.transportation * multiplier);
    estimate.activities = Math.round(estimate.activities * multiplier);

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

  const addActivity = (dayIndex: number) => {
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex].activities.push({
      title: "New Activity",
      description: "Add description here",
      category: "attraction"
    });
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    const updatedDays = [...editableTrip.days];
    updatedDays[dayIndex].activities.splice(activityIndex, 1);
    setEditableTrip({ ...editableTrip, days: updatedDays });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/itineraries/${editableTrip._id}`,
        editableTrip,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Failed to save changes");
      toast.success("Changes saved successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTrip = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/itineraries/${editableTrip._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Failed to delete trip");
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
              }}
              className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary px-2"
            />
          </h1>
          <div className="flex gap-2">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-primary dark:bg- text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <div className="grid grid-cols-1 gap-4 pt-1">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete Trip
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your data, including saved trips, will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600"
                      onClick={deleteTrip}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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

                      <div className="flex gap-4 mb-2">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select
                            value={activity.category || "attraction"}
                            onChange={(e) =>
                              handleActivityChange(activeTab, activityIndex, "category", e.target.value)
                            }
                            className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                          >
                            <option value="attraction">Attraction</option>
                            <option value="food">Food</option>
                            <option value="transport">Transportation</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="accommodation">Accommodation</option>
                          </select>
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Cost Category</label>
                          <select
                            value={activity.cost || "$"}
                            onChange={(e) =>
                              handleActivityChange(activeTab, activityIndex, "cost", e.target.value)
                            }
                            className="bg-transparent border rounded border-gray-300 focus:outline-none focus:border-primary w-full p-2"
                          >
                            <option value="$">$ (Budget)</option>
                            <option value="$$">$$ (Mid-Range)</option>
                            <option value="$$$">$$$ (Luxury)</option>
                          </select>
                        </div>
                      </div>

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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
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

        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cost Estimate</h2>
            <button
              onClick={toggleCurrency}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Switch to {currency === "USD" ? "INR" : "USD"}
            </button>
          </div>
          {isLoadingCosts ? (
            <div className="text-center py-6 text-gray-500">
              Loading cost data...
            </div>
          ) : costEstimate ? (
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
            *Note: This is an estimate based on current rates for {editableTrip.destination}.
            Actual costs may vary based on seasonality and specific choices.
            {currency === "INR" && " Exchange rate used: 1 USD = 83.5 INR."}
          </p>
        </div> */}

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
