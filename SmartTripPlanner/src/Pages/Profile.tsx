import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pencil } from "lucide-react";

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
  
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again.");
  
      // Ensure FormData is correctly structured
      const formData = new FormData();
      formData.append("profilePicture", file); // Make sure the key matches the backend
  
      console.log("Sending FormData:", formData.get("profilePicture"));
  
      const response = await fetch("https://smarttripplanner.onrender.com/api/user/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // DO NOT add Content-Type manually, let FormData set it
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorResponse = await response.json().catch(() => null);
        console.error("API Error Response:", errorResponse);
        throw new Error(errorResponse?.message || "Failed to upload profile picture.");
      }
  
      const data = await response.json();
      console.log("Upload Success:", data);
  
      setUser((prevUser) =>
        prevUser ? { ...prevUser, image: data.picture } : null
      );
      setPreviewImage(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };
  

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-black dark:text-white m-10">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div className="relative flex flex-col items-center">
          <Avatar className="h-[250px] w-[250px] border-2 border-black dark:border-white/20">
            <AvatarImage
              src={previewImage || user?.image || "https://via.placeholder.com/150"}
              alt="Profile picture"
            />
            <AvatarFallback>
              {user?.firstname?.charAt(0)}
              {user?.lastname?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="absolute bottom-1 right-12 md:right-8">
          <label className="cursor-pointer">
              <input
                id="profilePictureUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={changeProfilePicture}
              />
              <Button
                variant="outline"
                size="icon"
                className="rounded-md h-10 w-10 border-black dark:border-white/20"
                onClick={() =>
                  document.getElementById("profilePictureUpload")?.click()
                }
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Change Profile Picture</span>
              </Button>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-lg">
                First Name
              </Label>
              <Input
                id="firstName"
                className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
                value={user?.firstname || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-lg">
                Last Name
              </Label>
              <Input
                id="lastName"
                className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
                value={user?.lastname || ""}
                disabled
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
              value={user?.email || ""}
              disabled
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
                    This action cannot be undone.
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
      <div className="space-y-4 pt-6">
        <h2 className="text-2xl font-bold mt-6">SAVED TRIPS</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {itineraries.length > 0 ? (
            itineraries.map((trip) => (
              <Card
                key={trip._id}
                className="h-60 bg-transparent border-black dark:border-white/20 rounded-md"
              >
                <CardHeader>
                  <CardTitle>{trip.destination}</CardTitle>
                  <CardDescription>{trip.days.length} Days</CardDescription>
                </CardHeader>
                <CardContent>
                  {trip.days[0]?.activities[0]?.imageUrl ? (
                    <img
                      src={trip.days[0].activities[0].imageUrl}
                      alt="Trip"
                      className="h-32 w-full object-cover rounded-md"
                    />
                  ) : (
                    <p>No Image Available</p>
                  )}
                </CardContent>
                <CardFooter>
                  <p>Created on: {new Date(trip.createdAt).toDateString()}</p>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>No saved trips yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}