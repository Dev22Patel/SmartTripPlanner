"use client";
import { useState } from "react";
import trie from "./trie"; // Import Trie logic
import { Input } from "@/components/ui/input"; // Adjust based on your UI library
import { Button } from "@/components/ui/button"; // Adjust based on your UI library

const POPULAR_PLACES = ["Dubai", "Singapore", "Paris", "New York", "Tokyo", "London"];

const SearchInput = () => {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length > 0) {
      setSuggestions(trie.searchPrefix(value)); // Get matching places
    } else {
      setSuggestions(POPULAR_PLACES); // Show popular places when empty
    }
  };

  const handleSelect = (place: string) => {
    setDestination(place);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    setSuggestions(destination ? trie.searchPrefix(destination) : POPULAR_PLACES);
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200); // Delay to allow click selection
  };

  const handleSearch = () => {
    console.log("Planning trip to", destination);
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Where do you want to go?"
          value={destination}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-grow py-7 px-8 text-xl text-gray-900 dark:text-white rounded-full
                     focus:ring-2 focus:ring-violet-500 border-2 border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 shadow-lg"
        />

        {/* Search Button */}
        <Button
          className="sm:flex-shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600
                     hover:from-violet-600 hover:to-purple-700 px-10 py-7 text-lg font-medium text-white
                     transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-0 w-full mt-2 bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-5 text-lg text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchInput;
