import { ArrowRight, Mountain, Building, Palmtree, Globe, BookOpen } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

export default function AppleBentoGrid() {
  const trips = [
    {
      title: "Mountain Expeditions",
      tagline: "Conquer New Heights",
      description: "Experience breathtaking views from the world's most magnificent peaks",
      className: "md:col-span-2 md:row-span-2",
      textColor: "text-orange-50",
      category: "ADVENTURE",
      icon: <Mountain className="w-6 h-6" />,
      image: "https://media.istockphoto.com/id/1316972212/photo/base-camp-and-path-to-climb-to-the-top-of-mount-everest-relief-height-mountains-lhotse-nuptse.jpg?s=612x612&w=0&k=20&c=u3iB38tp3HWnsDqmtAF6zrh5q1UUN0ihGfweltBYNbc=",
      searchUrl: "https://www.google.com/search?q=mountain+hiking+expeditions",
      isLarge: true
    },
    {
      title: "Urban Discovery",
      tagline: "City Lights Await",
      description: "Immerse yourself in vibrant city culture",
      className: "md:col-span-1 md:row-span-1",
      textColor: "text-blue-500",
      category: "CITIES",
      icon: <Building className="w-6 h-6" />,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      searchUrl: "https://www.google.com/search?q=best+city+tours+worldwide"
    },
    {
      title: "Coastal Retreats",
      tagline: "Ocean Serenity",
      description: "Find peace along pristine shorelines",
      className: "md:col-span-1 md:row-span-1",
      textColor: "text-teal-500",
      category: "BEACHES",
      icon: <Palmtree className="w-6 h-6" />,
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
      searchUrl: "https://www.google.com/search?q=best+beach+resorts+destinations"
    },
    {
      title: "Cultural Journey",
      tagline: "Heritage & History",
      description: "Discover ancient traditions and local customs",
      className: "md:col-span-2 md:row-span-1",
      textColor: "text-purple-50",
      category: "CULTURE",
      icon: <BookOpen className="w-6 h-6" />,
      image: "https://images.pexels.com/photos/2070485/pexels-photo-2070485.jpeg?cs=srgb&dl=pexels-freestockpro-2070485.jpg&fm=jpg",
      searchUrl: "https://www.google.com/search?q=cultural+heritage+tours",
      isLarge: true
    },
    {
      title: "Global Expedition",
      tagline: "Around the World",
      description: "Multi-country adventures crafted for the bold",
      className: "md:col-span-2",
      textColor: "text-emerald-50",
      category: "WORLD TOUR",
      icon: <Globe className="w-6 h-6" />,
      image: "https://media.istockphoto.com/id/1971796553/photo/young-couple-is-standing-at-mountain-top-with-great-view.jpg?s=612x612&w=0&k=20&c=SRfYHbtg53JPuRiM9LP5bD5_BKB-V4z4ttLbZoaygjc=",
      searchUrl: "https://www.google.com/search?q=around+the+world+travel+packages",
      isLarge: true
    }
  ];

  const renderCard = (trip: {
    title: string;
    tagline: string;
    description: string;
    className: string;
    textColor: string;
    category: string;
    icon: JSX.Element;
    searchUrl: string;
    image?: string;
    isLarge?: boolean;
    bgColor?: string;
  }) => {
    if (trip.isLarge) {
      return (
        <a href={trip.searchUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
          <div className="relative h-full">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
              <img
                src={trip.image}
                alt={trip.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full p-6 flex flex-col justify-end">
              <div className="mb-4">
                <span className="px-3 py-1 text-xs font-semibold tracking-wider rounded-full bg-white/20 backdrop-blur-sm text-white">
                  {trip.category}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className={`text-2xl font-bold ${trip.textColor}`}>
                  {trip.title}
                </h3>
                <p className="text-lg font-medium text-white/90">
                  {trip.tagline}
                </p>
                <p className="text-sm text-white/80 max-w-md">
                  {trip.description}
                </p>
              </div>

              <div className="mt-6 flex items-center space-x-2 text-white group/button cursor-pointer">
                <span className="text-sm font-semibold">Explore destinations</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
              </div>
            </div>
          </div>
        </a>
      );
    }

    return (
      <a href={trip.searchUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
        <div className={`h-full p-6 ${trip.bgColor} backdrop-blur-sm`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex ${trip.textColor} rounded-lg p-2`}>
                {trip.icon}
              </span>
              <span className="px-3 py-1 text-xs font-semibold tracking-wider rounded-full bg-black/5 dark:bg-white/10">
                {trip.category}
              </span>
            </div>

            <div className="space-y-2 flex-grow">
              <h3 className={`text-xl font-bold ${trip.textColor}`}>
                {trip.title}
              </h3>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                {trip.tagline}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trip.description}
              </p>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-gray-800 dark:text-gray-200 group/button cursor-pointer">
              <span className="text-sm font-semibold">Explore destinations</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </div>
          </div>
        </div>
      </a>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 inline-block text-transparent bg-clip-text">
          Discover Your Next Adventure
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Curated experiences for the modern explorer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-auto">
        {trips.map((trip, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-3xl ${trip.className} transition-all duration-500 hover:shadow-lg`}
          >
            {renderCard(trip)}
          </div>
        ))}
      </div>
    </div>
  );
}
