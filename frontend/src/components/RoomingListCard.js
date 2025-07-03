import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Small PDF Icon Component
const PDFIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
);

const RoomingListCard = ({ roomingList }) => {
  const { fetchBookings } = useApp();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'closed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getDateRange = () => {
    const bookingCount = roomingList.bookingCount || 0;
    if (bookingCount > 0) {
      return `${bookingCount} booking${bookingCount !== 1 ? 's' : ''}`;
    }
    return 'No bookings';
  };

  const handleViewBookings = async () => {
    try {
      console.log('🔍 View Bookings clicked for rooming list:', roomingList.rfpName);
      console.log('🏨 Rooming List ID:', roomingList.roomingListId);
      
      // Fetch bookings for this rooming list
      const bookings = await fetchBookings(roomingList.roomingListId, null);
      
      // Log bookings to console as required by the assessment
      console.log('📋 === BOOKINGS FOR ROOMING LIST ===');
      console.log('🏷️ RFP Name:', roomingList.rfpName);
      console.log('🎯 Event:', roomingList.eventName);
      console.log('🏨 Hotel ID:', roomingList.hotelId);
      console.log('📊 Total bookings:', bookings.length);
      console.log('📅 Cut-off Date:', roomingList.cutOffDate);
      console.log('📝 Agreement Type:', roomingList.agreement_type);
      console.log('🏷️ Status:', roomingList.status);
      
      if (bookings.length > 0) {
        console.log('📋 Booking Details:');
        console.table(bookings);
        
        // Additional detailed logging
        bookings.forEach((booking, index) => {
          console.log(`🏨 Booking ${index + 1}:`, {
            bookingId: booking.bookingId,
            guestName: booking.guestName,
            checkIn: booking.checkInDate,
            checkOut: booking.checkOutDate,
            phone: booking.guestPhoneNumber
          });
        });
      } else {
        console.log('❌ No bookings found for this rooming list');
      }
      console.log('='.repeat(40));
      
      // Also show in modal for better UX
      await fetchBookings(roomingList.roomingListId, roomingList);
      
      // Success notification
      toast.success(`Found ${bookings.length} booking${bookings.length !== 1 ? 's' : ''} - check console for details`);
      
    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error);
      toast.error('Failed to fetch bookings');
    }
  };

  const handleViewAgreement = () => {
    // Show message about PDF functionality
    toast('PDF Agreement viewing feature coming soon!', {
      icon: '📄',
      duration: 3000,
    });
    console.log('📄 View Agreement clicked for:', roomingList.rfpName);
  };

  // Get booking count from API response
  const bookingCount = roomingList.bookingCount || roomingList.bookings?.length || 0;

  return (
    <div className="card p-6 min-w-[320px] max-w-[380px] animate-fade-in">
      {/* Header with cut-off date */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <span className={clsx('status-badge', getStatusColor(roomingList.status))}>
            {roomingList.status || 'Unknown'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Cut-off Date</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(roomingList.cutOffDate)}
          </div>
        </div>
      </div>

      {/* RFP Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {roomingList.rfpName}
      </h3>

      {/* Agreement Type */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">Agreement: </span>
        <span className="font-bold text-gray-900 capitalize">
          {roomingList.agreement_type}
        </span>
      </div>

      {/* Date Range / Booking Count */}
      <div className="flex items-center mb-6 text-sm text-gray-600">
        <CalendarIcon className="w-4 h-4 mr-2" />
        <span>{getDateRange()}</span>
      </div>

      {/* Action Buttons - Horizontal Layout */}
      <div className="flex items-center gap-3">
        {/* View Bookings Button */}
        <button
          onClick={handleViewBookings}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          View Bookings ({bookingCount})
        </button>
        
        {/* View Agreement PDF Icon Button */}
        <button
          onClick={handleViewAgreement}
          className="w-12 h-12 border-2 border-blue-600 hover:border-blue-700 hover:bg-blue-50 bg-white rounded-lg transition-colors duration-200 flex items-center justify-center group"
          title="Show Agreement as PDF"
        >
          <PDFIcon className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Additional Info */}
      {roomingList.eventName && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Event: <span className="font-medium text-gray-700">{roomingList.eventName}</span>
          </div>
          {roomingList.hotelId && (
            <div className="text-sm text-gray-500 mt-1">
              Hotel ID: <span className="font-medium text-gray-700">{roomingList.hotelId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomingListCard; 