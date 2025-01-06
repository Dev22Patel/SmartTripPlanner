import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import WorldMap from "@/components/ui/world-map";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
    logout();
  // Travel routes data
//   const travelRoutes = [
//     {
//       start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
//       end: { lat: 34.0522, lng: -118.2437 }    // Los Angeles
//     },
//     {
//       start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
//       end: { lat: -15.7975, lng: -47.8919 }    // Brazil (Brasília)
//     },
//     {
//       start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
//       end: { lat: 38.7223, lng: -9.1393 }      // Lisbon
//     },
//     {
//       start: { lat: 51.5074, lng: -0.1278 },   // London
//       end: { lat: 28.6139, lng: 77.209 }       // New Delhi
//     },
//     {
//       start: { lat: 28.6139, lng: 77.209 },    // New Delhi
//       end: { lat: 43.1332, lng: 131.9113 }     // Vladivostok
//     },
//     {
//       start: { lat: 28.6139, lng: 77.209 },    // New Delhi
//       end: { lat: -1.2921, lng: 36.8219 }      // Nairobi
//     }
//   ];

  const features = [
    {
      title: "Personalized Plans",
      description: "AI-tailored itineraries to match your travel style and preferences.",
    },
    {
      title: "All-in-One Platform",
      description: "Manage bookings, schedules, and updates seamlessly in one place.",
    },
    {
      title: "Save Money",
      description: "Discover exclusive deals and maximize your travel budget effortlessly.",
    },
  ];

  const words = [
    {
      text: "Explore",
      className: "text-blue-500 dark:text-white font-bold",
    },
    {
      text: "the",
      className: "text-blue-500 dark:text-white",
    },
    {
      text: "world",
      className: "text-blue-500 dark:text-white",
    },
    {
      text: "effortlessly",
      className: "text-blue-500 dark:text-white",
    },
    {
      text: "with SmartTripPlanner.",
      className: "text-black dark:text-blue-500",
    },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* WorldMap as background */}
      <div className="absolute inset-0 z-0">
        <WorldMap
          lineColor="#ffffff"
          theme={theme}
        //   dots={travelRoutes}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:bg-gradient-to-b dark:from-transparent dark:to-black opacity-100" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-start h-screen pt-28 bg-white/50 dark:bg-zinc-900/75 transition-colors">
        <p className="font-bold text-gray-800 dark:text-gray-200 sm:text-base mb-4 text-center">
          The road to freedom and Exploring starts from here
        </p>

        {/* Typewriter effect */}
        <TypewriterEffectSmooth words={words} />

        {/* Features section */}
        <div className="-mt-5 w-full max-w-3xl mx-2 px-2">
          <HoverEffect items={features} />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-7">
          <button className="w-40 h-10 rounded-xl bg-blue-500 dark:bg-blue-600 text-white dark:text-gray-100 text-sm font-medium transition-colors duration-150 hover:bg-blue-600 dark:hover:bg-blue-700">
            Join now
          </button>
          <Link to="/authentication">
            <button className="w-40 h-10 rounded-xl bg-white dark:bg-gray-800 text-blue-500 dark:text-white border border-blue-500 dark:border-blue-400 text-sm font-medium transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-gray-700">
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
