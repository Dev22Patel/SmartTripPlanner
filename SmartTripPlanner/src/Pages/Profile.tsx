import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Pencil } from "lucide-react";

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-black dark:text-white m-10">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Profile Picture Section */}
        <div className="relative flex flex-col items-center">
          <Avatar className="h-[250px] w-[250px] border-2 border-black dark:border-white/20">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="Profile picture"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          {/* Edit Profile Picture Button */}
          <div className="absolute bottom-1 right-12 md:right-8">
            <Button
              variant="outline"
              size="icon"
              className="rounded-md h-10 w-10 border-black dark:border-white/20"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Change Profile Picture</span>
            </Button>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-lg">
                First Name
              </Label>
              <Input
                id="firstName"
                className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-lg">
                Last Name
              </Label>
              <Input
                id="lastName"
                className="bg-transparent border-black dark:border-white/20 rounded-md h-12"
                placeholder="Last Name"
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
              placeholder="Email"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            {/* <Button
              variant="outline"
              className="border-black dark:border-white/20 h-12"
            >
              Reset Password
            </Button> */}
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
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Saved Trips Section */}
      <div className="space-y-4 pt-6">
        <h2 className="text-2xl font-bold">SAVED TRIPS</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="h-60 bg-transparent border-black dark:border-white/20 rounded-md">
            {/* Trip card content would go here */}
            <CardHeader>
              <CardTitle>Destination</CardTitle>
              <CardDescription>Days</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Image, Itinerary, etc.</p>
            </CardContent>
            <CardFooter>
              <p>No. of People, Etx.</p>
            </CardFooter>
          </Card>
          <Card className="h-60 bg-transparent border-black dark:border-white/20 rounded-md">
            {/* Trip card content would go here */}
            <CardHeader>
              <CardTitle>Destination</CardTitle>
              <CardDescription>Days</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Image, Itinerary, etc.</p>
            </CardContent>
            <CardFooter>
              <p>No. of People, Etx.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
