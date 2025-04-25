import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, MapPin, CalendarDays, Clock, ExternalLink, PlusCircle, Save, X } from "lucide-react";

interface User {
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
}

interface Activity {
  title: string;
  time?: string;
  description?: string;
  location?: string;
  cost?: string;
  category?: string;
  imageUrl?: string;
}

interface Day {
  dayNumber: number;
  date: string;
  description?: string;
  activities: Activity[];
}

interface Itinerary {
  _id: string;
  destination: string;
  days: Day[];
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found, please login again.");

        const response = await fetch(
          "https://smarttripplanner.onrender.com/api/user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        setUser(data.user);
        setEditedUser(data.user); // Initialize edit form with current data
        setItineraries(data.itineraries);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again.");

      // Updated to use the correct API endpoint
      const response = await fetch(
        "https://smarttripplanner.onrender.com/api/user",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete account.");

      alert("Account deleted successfully.");
      localStorage.removeItem("token");
      window.location.href = "/authentication";
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const changeProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type. Please upload an image.");
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError("File is too large. Please upload an image smaller than 2MB.");
        return;
      }

      // Create a preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again.");

      // Set loading state
      setUploadLoading(true);
      setError("");

      // Create FormData - no need to set Content-Type header when sending FormData
      const formData = new FormData();
      formData.append("profilePicture", file); // Make sure the key matches what your backend expects

      const response = await fetch("http://localhost:5000/api/user/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type header here, browser will set it correctly with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Upload error:", errorData);
        throw new Error(errorData?.message || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update user info with new image URL
      setUser((prevUser) =>
        prevUser ? { ...prevUser, image: data.picture } : null
      );
      setEditedUser((prevUser) =>
        prevUser ? { ...prevUser, image: data.picture } : null
      );

      // Revoke the object URL to free memory
      URL.revokeObjectURL(previewUrl);
      setPreviewImage(null);

      // Show success message
      alert("Profile picture updated successfully");
    } catch (err) {
      setError(`Error uploading image: ${(err as Error).message}`);
      console.error("Profile upload error:", err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedUser) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again.");

      const response = await fetch(
        "http://localhost:5000/api/user",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: editedUser.firstname,
            lastname: editedUser.lastname,
            email: editedUser.email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Update failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      setError(`Failed to update profile: ${(err as Error).message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCoverImage = (trip: Itinerary) => {
    for (const day of trip.days) {
      for (const activity of day.activities) {
        if (activity.imageUrl) {
          return activity.imageUrl;
        }
      }
    }
    return null;
  };

  const getTotalActivities = (trip: Itinerary) => {
    return trip.days.reduce((count, day) => {
      return count + day.activities.length;
    }, 0);
  };

  const getTopCategories = (trip: Itinerary, limit = 2) => {
    const categories: Record<string, number> = {};

    trip.days.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.category) {
          categories[activity.category] = (categories[activity.category] || 0) + 1;
        }
      });
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category]) => category);
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return (
    <div className="text-center text-red-500 p-4 mt-8">
      <p className="text-lg font-semibold">Error</p>
      <p>{error}</p>
      <Button
        className="mt-4"
        variant="outline"
        onClick={() => setError("")}
      >
        Dismiss
      </Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-black dark:text-white m-10">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="relative flex flex-col items-center">
          <Avatar className="h-[250px] w-[250px] border-2 border-black dark:border-white/20">
            {uploadLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <AvatarImage
                  src={previewImage || user?.image || "https://via.placeholder.com/150"}
                  alt="Profile picture"
                />
                <AvatarFallback>
                  {user?.firstname?.charAt(0)}
                  {user?.lastname?.charAt(0)}
                </AvatarFallback>
              </>
            )}
          </Avatar>

          <div className="absolute bottom-1 right-12 md:right-8">
            <label className="cursor-pointer">
              <input
                id="profilePictureUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={changeProfilePicture}
                disabled={uploadLoading}
              />
              <Button
                variant="outline"
                size="icon"
                className="rounded-md h-10 w-10 border-black dark:border-white/20"
                onClick={() =>
                  document.getElementById("profilePictureUpload")?.click()
                }
                disabled={uploadLoading}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Change Profile Picture</span>
              </Button>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            {!isEditing ? (
              <Button
                variant="outline"
                className="border-black dark:border-white/20"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-black dark:border-white/20"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleUpdateProfile}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-lg">
                First Name
              </Label>
              <Input
                id="firstName"
                className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
                value={isEditing ? editedUser?.firstname || "" : user?.firstname || ""}
                onChange={(e) => setEditedUser(prev => prev ? {...prev, firstname: e.target.value} : null)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-lg">
                Last Name
              </Label>
              <Input
                id="lastName"
                className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
                value={isEditing ? editedUser?.lastname || "" : user?.lastname || ""}
                onChange={(e) => setEditedUser(prev => prev ? {...prev, lastname: e.target.value} : null)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
              value={isEditing ? editedUser?.email || "" : user?.email || ""}
              onChange={(e) => setEditedUser(prev => prev ? {...prev, email: e.target.value} : null)}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-black dark:border-white/20 h-12 text-red-500 hover:text-red-400 hover:border-red-400 hover:bg-red-50"
                >
                  Delete Account
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
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Saved Trips Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">SAVED TRIPS</h2>
          <Button
            variant="outline"
            onClick={() => navigate('/create-trip')}
            className="text-sm flex items-center gap-1 border-black dark:border-white/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Trip
          </Button>
        </div>

        {itineraries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((trip) => {
              const coverImage = getCoverImage(trip);
              const totalActivities = getTotalActivities(trip);
              const topCategories = getTopCategories(trip);

              return (
                <Card
                  key={trip._id}
                  className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white dark:bg-gray-900"
                  onClick={() => navigate(`/trip/${trip._id}`, {state: {trip}})}
                >
                  <div className="relative">
                    <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={trip.destination}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                          <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white truncate">{trip.destination}</h3>
                        <div className="flex items-center text-white/90 text-sm mt-1">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          <span>{trip.days.length} {trip.days.length === 1 ? 'Day' : 'Days'}</span>
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{totalActivities} {totalActivities === 1 ? 'Activity' : 'Activities'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4 pb-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {topCategories.map(category => (
                        <Badge key={category} variant="secondary" className="font-normal text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <CalendarDays className="w-3 h-3 mr-1 inline" />
                      Created {formatDate(trip.createdAt)}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-3 px-4">
                    <div className="w-full flex justify-end">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline">
                        View Trip
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No trips saved yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start planning your next adventure!</p>
            <Button
              onClick={() => navigate('/landing-page')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Plan Your First Trip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
