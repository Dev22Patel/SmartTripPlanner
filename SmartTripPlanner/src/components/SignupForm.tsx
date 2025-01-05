import React, { useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
export default function SignupFormDemo() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
      if (isAuthenticated) {
        navigate('/landing-page');
      }
    }, [isAuthenticated, navigate]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("Form submitted");
    };

    const handleGoogleLoginSuccess = async (credentialResponse: any) => {
      try {
        const token = credentialResponse.credential;
        if (token) {
          await login(token);
          // The navigation will happen automatically due to the useEffect above
        }
      } catch (error) {
        console.error("Error processing Google login:", error);
      }
    };

  return (
    <div className="px-8 pt-6">
      <div className="text-center mb-6">
        <h2 className="font-bold text-2xl text-neutral-800 dark:text-neutral-200">
          Welcome to SmartTripPlanner
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mx-auto dark:text-neutral-300 mt-2">
          Create your account and start planning your next adventure
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input id="firstname" placeholder="John" type="text" className="h-10" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" placeholder="Doe" type="text" className="h-10" />
          </LabelInputContainer>
        </div>

        <LabelInputContainer>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" placeholder="you@example.com" type="email" className="h-10" />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="password">Password</Label>
          <Input id="password" placeholder="••••••••" type="password" className="h-10" />
        </LabelInputContainer>

        <button
          className="relative w-full h-10 dark:bg-gray-800 text-black dark:text-white rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group/btn"
          type="submit"
        >
          Create Account
          <BottomGradient />
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};
