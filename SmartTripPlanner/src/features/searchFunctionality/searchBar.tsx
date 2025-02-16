import { useState } from "react";
import SearchInput from "./searchInput";

const SearchBar = () => {
  const [selectedPlace, setSelectedPlace] = useState("");

  return (
    <div className="w-96 mx-auto mt-10">
      <SearchInput onSelect={setSelectedPlace} />
      {selectedPlace && (
        <p className="mt-4 text-gray-600">Selected: <strong>{selectedPlace}</strong></p>
      )}
    </div>
  );
};

export default SearchBar;
