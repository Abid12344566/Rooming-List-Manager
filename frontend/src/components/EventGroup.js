import React from 'react';
import RoomingListCard from './RoomingListCard';

const EventGroup = ({ eventName, roomingLists }) => {
  const shouldShowScrollbar = roomingLists.length > 3;

  return (
    <div className="mb-8">
      {/* Event Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {eventName || 'Unknown Event'}
        </h2>
        <div className="text-sm text-gray-600">
          {roomingLists.length} rooming list{roomingLists.length !== 1 ? 's' : ''}
        </div>
        <div className="w-24 h-1 bg-primary-500 rounded-full mt-2"></div>
      </div>

      {/* Rooming Lists Container */}
      <div className="relative">
        <div 
          className={`flex gap-6 ${shouldShowScrollbar ? 'overflow-x-auto scrollbar-thin pb-4' : ''}`}
          style={{ 
            scrollSnapType: 'x mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'thin'
          }}
        >
          {roomingLists.map((roomingList) => (
            <div 
              key={roomingList.roomingListId} 
              className="flex-shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              <RoomingListCard roomingList={roomingList} />
            </div>
          ))}
        </div>

        {/* Scroll Indicators */}
        {shouldShowScrollbar && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-white via-white to-transparent w-8 h-full pointer-events-none"></div>
        )}
      </div>

      {/* Scroll Hint */}
      {shouldShowScrollbar && (
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Scroll to see more
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};

export default EventGroup; 