import React, { useState } from 'react';
import { Search, Camera } from 'lucide-react'; // Optional icons

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Pass the value up to the parent component
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full p-3 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search for orders or products..."
        value={query}
        onChange={handleInputChange}
      />
      {/* Integrating the visual search option */}
      <button className="absolute inset-y-0 right-0 flex items-center pr-3">
        <Camera className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer" />
      </button>
    </div>
  );
};