'use client';
import { useState } from 'react';

export default function SearchBar({ placeholder = "Search products..." }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${query}`); // Replace with real search logic
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="border rounded px-3 py-2 w-full"
      />
    </form>
  );
}
