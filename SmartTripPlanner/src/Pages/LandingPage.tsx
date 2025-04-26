import { useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import RetroProjectBoard from '@/components/ui/smaple';
import RetroDiagram from '@/components/ui/TripDiagram';
import BentoGrid from '@/components/ui/BentoGrid';
import ColourfulText from '@/components/ui/colourful-text';
import { Spotlight } from '@/components/ui/spotlight-new';
import { Search } from 'lucide-react';
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
        if (response.data && response.data.predictions.length > 0) {
            setSuggestions([response.data.predictions[0]]); // Only store the first result
            console.log(response.data.predictions[0]);
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
            {/* Display suggestion  */}
            {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-1 rounded-lg shadow-lg">
                <li
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestions[0].description)}
                >
                {suggestions[0].description}
                </li>
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
        {/* Hero Section with First Search Bar */}
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
          <ElegantSearchBar />
        </motion.div>
  
        <hr className="border-gray-200 dark:border-gray-800" />
  
        {/* Predictions Section */}
        {prediction && (
          <motion.section
            className="mt-16 mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* ... existing prediction section code ... */}
          </motion.section>
        )}
  
        {/* BentoGrid Section */}
        <motion.section
          className="mt-16 mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <BentoGrid />
        </motion.section>
  
        {/* RetroProjectBoard Section */}
        <div className="mt-32">
          <RetroProjectBoard />
        </div>
  
        {/* Second Search Bar Section - Moved above footer */}
        {!prediction && (
          <motion.div
            className="my-32 py-16 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/30 shadow-md border border-gray-100 dark:border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200 text-center">
              Ready to Plan Your Next Adventure?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6 text-center">
              Start building your perfect itinerary now
            </p>
            <div className="max-w-lg mx-auto px-6">
              <ElegantSearchBar />
            </div>
          </motion.div>
        )}
  
        {/* Footer Section */}
        <div className="-mb-32">
          <h2 className="mt-20 -mb-20 text-center font-mono text-4xl font-bold text-gray-900 dark:text-white">
            How We Deliver
          </h2>
          <RetroDiagram />
        </div>
      </main>
    </div>
  );
}
