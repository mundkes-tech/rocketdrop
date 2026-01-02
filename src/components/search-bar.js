'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function SearchBar({ placeholder = 'Search products...' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Debounce input (wait for user to stop typing)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions with SWR when user types
  const { data, error } = useSWR(
    debouncedQuery.length > 1 ? `/api/products?search=${debouncedQuery}&limit=5` : null,
    fetcher
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (name) => {
    router.push(`/products?search=${encodeURIComponent(name)}`);
    setQuery(name);
    setShowSuggestions(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={inputRef}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-gray-100 rounded-full shadow-sm overflow-hidden"
      >
        <Search className="absolute left-4 h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="pl-12 pr-4 py-2 w-full bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        />
      </form>

      {/* Suggestion Dropdown */}
      {showSuggestions && debouncedQuery.length > 1 && (
        <div className="absolute left-0 right-0 bg-white shadow-lg rounded-lg mt-2 z-50 max-h-64 overflow-y-auto border border-gray-100">
          {error && (
            <p className="p-3 text-sm text-red-500">Failed to load suggestions</p>
          )}

          {!data?.products?.length && !error ? (
            <p className="p-3 text-sm text-gray-500">No matches found</p>
          ) : (
            data?.products?.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.name)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition"
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
