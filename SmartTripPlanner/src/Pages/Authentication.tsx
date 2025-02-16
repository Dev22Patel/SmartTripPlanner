import { useState } from "react";
import SignupForm from "@/components/SignupForm";
import LoginForm from "@/components/LoginForm";

export default function Authentication() {
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  const toggleAuthMode = () => {
    setAuthMode((prevMode) => (prevMode === "signup" ? "login" : "signup"));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-8 px-4 bg-stone-200 dark:bg-black/50">
      {/* Bright Backlight Effect */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[800px] h-[500px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-30 blur-3xl rounded-full -z-10 dark:from-blue-700 dark:via-blue-600 dark:to-blue-700"></div>
        </div>


      {/* Main heading */}
      <div className="text-center mb-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {authMode === "signup" ? "Create Your Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {authMode === "signup"
            ? "Join SmartTripPlanner and start your journey today"
            : "Sign in to continue your journey with SmartTripPlanner"}
        </p>
      </div>

      <div className="w-full max-w-xl mx-auto relative z-10">
        {/* Mode selector tabs */}
        <div className="flex rounded-xl overflow-hidden mb-3">
          <button
            onClick={() => setAuthMode("signup")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              authMode === "signup"
                ? "bg-white/30 dark:bg-black text-blue-600 dark:text-blue-400"
                : "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthMode("login")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              authMode === "login"
                ? "bg-white/30 dark:bg-black text-blue-600 dark:text-blue-400"
                : "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form container */}
        <div className="shadow-lg rounded-2xl bg-white dark:bg-black backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 dark:shadow-lg dark:shadow-gray-800 mb-20">
          {authMode === "signup" ? (
            <>
              <SignupForm />
              <div className="px-8 pb-6 pt-3">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={toggleAuthMode}
                    className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
            <LoginForm />
            <div className="px-8 py-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={toggleAuthMode}
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                  >
                  Sign up
                </button>
              </p>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
