
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil } from "lucide-react";

// Define a type for the user object
interface User {
  firstname: string;
  lastname: string;
  email: string;
  picture?: string; // Optional field
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null); // Set proper type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token);
        if (!token) throw new Error("No token found, please login again.");

        const response = await fetch("https://smarttripplanner.onrender.com/api/user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data.");

        const data: User = await response.json(); // Ensure data is of type User
        setUser(data);
      } catch (err) {
        setError((err as Error).message); // Explicitly cast err as Error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please login again.");

      const response = await fetch("https://smarttripplanner.onrender.com/api/user", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete account.");

      // Handle successful account deletion (e.g., redirect to login page)
      alert("Account deleted successfully.");
      localStorage.removeItem("token");
      window.location.href = "/authentication";
    } catch (err) {
      setError((err as Error).message); // Explicitly cast err as Error
    }
  }

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-black dark:text-white m-10">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Profile Picture Section */}
        <div className="relative flex flex-col items-center">
          <Avatar className="h-[250px] w-[250px] border-2 border-black dark:border-white/20">
            <AvatarImage src={user?.picture || "https://github.com/shadcn.png"} alt="Profile picture" />
            <AvatarFallback>{user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}</AvatarFallback>
          </Avatar>

          {/* Edit Profile Picture Button */}
          <div className="absolute bottom-1 right-12 md:right-8">
            <Button variant="outline" size="icon" className="rounded-md h-10 w-10 border-black dark:border-white/20">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Change Profile Picture</span>
            </Button>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-lg">First Name</Label>
              <Input id="firstName" className="bg-transparent border-black dark:border-white/20 rounded-md h-12" value={user?.firstname || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-lg">Last Name</Label>
              <Input id="lastName" className="bg-transparent border-black dark:border-white/20 rounded-md h-12" value={user?.lastname || ""} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">Email</Label>
            <Input id="email" type="email" className="bg-transparent border-black dark:border-white/20 rounded-md h-12" value={user?.email || ""} disabled />
          </div>

          {/* Delete Account Button */}
          <div className="grid grid-cols-1 gap-4 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-black dark:border-white/20 h-12 text-red-500 hover:text-red-400 hover:border-red-400 hover:bg-red-50">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600" onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
