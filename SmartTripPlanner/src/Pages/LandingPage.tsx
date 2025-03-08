import { useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import RetroProjectBoard from '@/components/ui/smaple';
import RetroDiagram from '@/components/ui/TripDiagram';
import BentoGrid from '@/components/ui/BentoGrid';
import ColourfulText from '@/components/ui/colourful-text';
import { Spotlight } from '@/components/ui/spotlight-new';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Star, Calendar, MapPinned, PlaneLanding, Compass, Search, DollarSign, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// Define interfaces for your Redux state
interface PredictionResult {
  loading_destination_info: any;
  destination_info: any;
  predicted_destination: string;
  confidence_score: number;
  alternative_destinations: Array<{
    destination: string;
    confidence: number;
  }>;
}

interface TravelState {
  prediction: PredictionResult | null;
}

interface RootState {
  travel: TravelState;
}

// // Action types for Redux
const SET_PREDICTION = 'travel/SET_PREDICTION';


const ElegantSearchBar = () => {
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const navigate = useNavigate();

    // Fetch suggestions from the RapidAPI endpoint
    const fetchSuggestions = async (input: string) => {
      const options = {
        method: 'GET',
        url: 'https://place-autocomplete1.p.rapidapi.com/autocomplete/json',
        params: { input, radius: '500' },
        headers: {
          'x-rapidapi-key': import.meta.env.VITE_X_RAPIDAPI_KEY,
          'x-rapidapi-host': import.meta.env.VITE_RAPIDAPI_HOST
        }
      };

      try {
        const response = await axios.request(options);
        // Ensure response data has predictions before updating state
        if (response.data && response.data.predictions) {
          setSuggestions(response.data.predictions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    // Update input and fetch suggestions if input is longer than 2 characters
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setSearchValue(input);
      if (input.length > 2) {
        fetchSuggestions(input);
      } else {
        setSuggestions([]);
      }
    };

    // Set input value to the clicked suggestion and clear suggestions
    const handleSuggestionClick = (suggestion: string) => {
      setSearchValue(suggestion);
      setSuggestions([]);
    };

    // Navigate to the destination page with the search value as a query parameter
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchValue.trim()) {
        navigate(`/destination/${searchValue}`);
      }
    };

    return (
      <div className="relative max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              placeholder="Where would you like to go?"
              className="w-full pl-5 pr-12 py-4 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-800 dark:text-gray-200 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            {/* Display suggestions if available */}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-1 rounded-lg shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion.description)}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            className="mt-3 md:mt-0 md:ml-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
          >
            Build Itinerary
          </button>
        </form>
      </div>
    );
  };

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
//   const navigate = useNavigate();
  // Use typed selector to avoid TypeScript errors
  const prediction = useSelector((state: RootState) => state.travel.prediction);

  useEffect(() => {
    setIsClient(true);

    // Load prediction data from localStorage on component mount
    const savedPrediction = localStorage.getItem('travelPrediction');
    if (savedPrediction) {
      try {
        const parsedPrediction = JSON.parse(savedPrediction);
        dispatch({ type: SET_PREDICTION, payload: parsedPrediction });
      } catch (error) {
        console.error('Failed to parse saved prediction:', error);
      }
    }
  }, [dispatch]);

  // Save prediction to localStorage whenever it changes
  useEffect(() => {
    if (prediction) {
      localStorage.setItem('travelPrediction', JSON.stringify(prediction));
    }
  }, [prediction]);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-bl dark:from-zinc-900 dark:via-zinc-950 dark:to-black text-gray-900 dark:text-gray-100 overflow-hidden">
      <Spotlight />
      <main className="z-10 container mx-auto px-4 md:px-20 py-12 md:py-20 mb-20">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-16"
          {...fadeIn}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-zinc-700 dark:text-white/90 font-mono">
            Welcome to Your <ColourfulText text="Smart" /> Trip Planner!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-mono mb-12">
            Plan your perfect journey with our intelligent travel companion
          </p>

          {/* Elegant search positioned prominently after the headline */}
          <ElegantSearchBar />
        </motion.div>

        <hr className="border-gray-200 dark:border-gray-800" />

        {prediction ? (
  <motion.section
    className="mt-16 mb-24"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
  >
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        Top Picks For You
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-3 font-mono max-w-2xl mx-auto">
        Based on your preferences, we've curated these perfect destinations just for you.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main Recommendation */}
      <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-0">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="text-yellow-500" size={20} />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Top Recommendation
            </span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {prediction.predicted_destination}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-4">
            <div className="flex items-center">
              <div className="h-3 flex-grow rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${prediction.confidence_score * 100}%` }}
                ></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {(prediction.confidence_score * 100).toFixed(1)}% match
              </span>
            </div>

            {/* Display dynamic destination information if available */}
            {prediction.destination_info && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {prediction.destination_info.best_time && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-purple-500 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Best Time to Visit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.destination_info.best_time}</p>
                    </div>
                  </div>
                )}
                {prediction.destination_info.popular_spots && (
                  <div className="flex items-start space-x-3">
                    <MapPinned className="text-purple-500 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Popular Spots</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.destination_info.popular_spots}</p>
                    </div>
                  </div>
                )}
                {prediction.destination_info.avg_cost && (
                  <div className="flex items-start space-x-3">
                    <DollarSign className="text-purple-500 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Average Cost</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.destination_info.avg_cost}</p>
                    </div>
                  </div>
                )}
                {prediction.destination_info.language && (
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="text-purple-500 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Language</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.destination_info.language}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show loading state if we're fetching destination info */}
            {prediction.loading_destination_info && (
              <div className="flex justify-center py-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mt-4">
              This destination aligns perfectly with your preferences. Explore activities, accommodations, and create unforgettable memories.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <a href={`https://www.google.com/search?q=${encodeURIComponent(prediction.predicted_destination)}`}
            target='_blank'
            className='block w-full'
          >
            <button className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 group">
              <span>Explore {prediction.predicted_destination}</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
            </button>
          </a>
        </CardFooter>
      </Card>

      {/* Alternative Recommendations */}
      <div className="col-span-1 space-y-6">
        <h3 className="text-xl font-semibold mb-4 font-mono text-gray-800 dark:text-gray-200 flex items-center">
          <Compass className="mr-2 text-purple-500" size={20} />
          Alternative Destinations
        </h3>
        {prediction.alternative_destinations.slice(0, 3).map((alt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <PlaneLanding className="mr-2 text-blue-500 group-hover:text-purple-500 transition-colors" size={18} />
                  {alt.destination}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-3">
                  <div className="h-2 flex-grow rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${alt.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {(alt.confidence * 100).toFixed(1)}% match
                  </span>
                </div>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(alt.destination)}`}
                  target='_blank'
                  className='block w-full'
                >
                  <button className="w-full py-2 px-3 bg-transparent border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors text-sm font-medium">
                    View Details
                  </button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
) : (
  <motion.div
    className="text-center py-16 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/30 mb-16 shadow-md border border-gray-100 dark:border-gray-800"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Let's Find Your Dream Destination</h3>
    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6">
      Tell us where you'd like to go or what type of experience you're looking for.
    </p>
    <div className="max-w-lg mx-auto px-6">
      <ElegantSearchBar />
    </div>
  </motion.div>
)}

        <BentoGrid />

        <div className="mt-32">
          <RetroProjectBoard />
        </div>

        <div className="-mb-32">
          <h2 className="mt-20 -mb-20 text-center font-mono text-4xl font-bold text-gray-900 dark:text-white">How We Deliver</h2>
          <RetroDiagram />
        </div>
      </main>
    </div>
  );
}
