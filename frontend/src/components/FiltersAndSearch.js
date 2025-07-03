import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useDebounce } from 'use-debounce';
import { useApp } from '../context/AppContext';

const FiltersAndSearch = () => {
  const { 
    filters, 
    setSearch, 
    setStatusFilter, 
    setSort,
    insertSampleData,
    isLoading
  } = useApp();

  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    active: filters.status === 'all' || filters.status === 'Active',
    closed: filters.status === 'all' || filters.status === 'Completed',
    canceled: filters.status === 'all' || filters.status === 'Cancelled'
  });
  
  const filterRef = useRef(null);

  // Update search when debounced value changes
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveFilters = () => {
    const { active, closed, canceled } = tempFilters;
    
    // Determine the filter value based on selections
    if (active && closed && canceled) {
      setStatusFilter('all');
    } else if (active && !closed && !canceled) {
      setStatusFilter('Active');
    } else if (!active && closed && !canceled) {
      setStatusFilter('Completed');
    } else if (!active && !closed && canceled) {
      setStatusFilter('Cancelled');
    } else {
      // Multiple selections - we'll use 'all' for now
      setStatusFilter('all');
    }
    
    setShowFilters(false);
  };

  const handleSortToggle = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setSort(filters.sortBy, newOrder);
  };

  const getActiveFilterCount = () => {
    const { active, closed, canceled } = tempFilters;
    return [active, closed, canceled].filter(Boolean).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Top Section - Search, Filters, and Sort */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Sort Control */}
          <div className="relative">
            <button
              onClick={handleSortToggle}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
              title="Sort by Cut-off Date"
            >
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0V6a2 2 0 002 2h6a2 2 0 002-2V4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
              </svg>
              <span className="text-gray-700 font-medium text-sm">
                {filters.sortOrder === 'asc' ? '↑ Date' : '↓ Date'}
              </span>
            </button>
          </div>

          {/* Filters Button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filters</span>
              {getActiveFilterCount() < 3 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">RFP STATUS</div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.active}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, active: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Active</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.closed}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, closed: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Closed</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.canceled}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, canceled: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Canceled</span>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleSaveFilters}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Insert Data Button */}
      <div className="px-4 pb-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={insertSampleData}
            disabled={isLoading}
            className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inserting Data...
              </>
            ) : (
              'Insert Bookings and Rooming Lists'
            )}
          </button>

          <div className="text-sm text-gray-600 flex items-center">
            This will clear existing data and load from JSON files
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.status !== 'all') && (
        <div className="px-4 pb-4">
          <div className="text-sm text-gray-600 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filters.status}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersAndSearch; 