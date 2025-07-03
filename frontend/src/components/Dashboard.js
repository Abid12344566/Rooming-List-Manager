import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import FiltersAndSearch from './FiltersAndSearch';
import EventGroup from './EventGroup';

const Dashboard = () => {
  const { 
    isAuthenticated, 
    filteredRoomingLists, 
    isLoadingRoomingLists, 
    fetchRoomingLists 
  } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoomingLists();
    }
  }, [isAuthenticated, fetchRoomingLists]);

  // Group rooming lists by event
  const groupedRoomingLists = React.useMemo(() => {
    const groups = {};
    
    filteredRoomingLists.forEach(roomingList => {
      const eventName = roomingList.eventName || 'Unknown Event';
      if (!groups[eventName]) {
        groups[eventName] = [];
      }
      groups[eventName].push(roomingList);
    });

    return groups;
  }, [filteredRoomingLists]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the rooming list management system.
          </p>
          <div className="text-sm text-gray-500">
            Use the sign in or sign up buttons in the header to get started.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <FiltersAndSearch />

        {/* Loading State */}
        {isLoadingRoomingLists && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-lg font-medium text-gray-900 mb-2">Loading Rooming Lists</div>
              <div className="text-gray-600">Please wait while we fetch your data...</div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingRoomingLists && Object.keys(groupedRoomingLists).length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Rooming Lists Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by inserting sample data or creating your first rooming list. 
              Use the "Insert Bookings and Rooming Lists" button above to load example data.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <strong>Tip:</strong> Sample data includes rooming lists for events like Austin City Limits and Ultra Musical Festival with different agreement types and statuses.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooming Lists grouped by Event */}
        {!isLoadingRoomingLists && Object.keys(groupedRoomingLists).length > 0 && (
          <div className="space-y-12">
            {Object.entries(groupedRoomingLists)
              .sort(([eventA], [eventB]) => eventA.localeCompare(eventB))
              .map(([eventName, roomingLists]) => (
                <EventGroup
                  key={eventName}
                  eventName={eventName}
                  roomingLists={roomingLists}
                />
              ))}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoadingRoomingLists && Object.keys(groupedRoomingLists).length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {Object.keys(groupedRoomingLists).length}
                </div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {filteredRoomingLists.length}
                </div>
                <div className="text-sm text-gray-600">Rooming Lists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {filteredRoomingLists.reduce((total, rl) => total + (rl.bookings?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 