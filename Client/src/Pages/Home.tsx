import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Link } from "react-router-dom";

const Home = () => {

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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* WorldMap as background */}
      <div className="absolute inset-0 z-0">
        {/* <WorldMap
          lineColor="#ffffff"
          theme={theme}
        //   dots={travelRoutes}
        /> */}
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
