import React from 'react';
import { format } from 'date-fns';
import { XMarkIcon, CalendarIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';

const BookingsModal = () => {
  const { showBookingsModal, selectedRoomingList, bookings, isLoadingBookings, hideBookingsModal } = useApp();

  if (!showBookingsModal) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getRoomType = (roomType) => {
    return roomType || 'Standard Room';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bookings for {selectedRoomingList?.rfpName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedRoomingList?.eventName} • {bookings.length} bookings
            </p>
          </div>
          <button
            onClick={hideBookingsModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-lg font-medium text-gray-900">Loading Bookings...</div>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600">
                This rooming list doesn't have any bookings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.bookingId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Guest Information */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.guestName || 'Guest Name Not Available'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {booking.guestEmail || 'No email provided'}
                        </p>
                        {booking.guestPhone && (
                          <p className="text-sm text-gray-600">
                            {booking.guestPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">Check-in</h5>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.checkInDate)}
                        </p>
                        <h5 className="font-medium text-gray-900 text-sm mt-2">Check-out</h5>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <HomeIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">Room Type</h5>
                        <p className="text-sm text-gray-600">
                          {getRoomType(booking.roomType)}
                        </p>
                        <h5 className="font-medium text-gray-900 text-sm mt-2">Guests</h5>
                        <p className="text-sm text-gray-600">
                          {booking.numberOfGuests || 1} guest{(booking.numberOfGuests || 1) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">Special Requests</h5>
                        <p className="text-sm text-gray-600">
                          {booking.specialRequests || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Booking ID: {booking.bookingId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Total bookings: {bookings.length}
          </div>
          <button
            onClick={hideBookingsModal}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingsModal; 