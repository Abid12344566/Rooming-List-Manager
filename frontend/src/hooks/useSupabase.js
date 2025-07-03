import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

// Custom hook for using Supabase in React components
export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('rooming_lists').select('count').limit(1);
        if (!error) {
          setIsConnected(true);
          console.log('✅ Supabase connection successful');
        }
      } catch (err) {
        console.error('❌ Supabase connection failed:', err);
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  return { supabase, isConnected };
};

// Hook for real-time rooming lists
export const useRoomingListsRealtime = () => {
  const [roomingLists, setRoomingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial data fetch
    const fetchRoomingLists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rooming_lists')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setRoomingLists(data || []);
        console.log('✅ Fetched rooming lists via Supabase:', data?.length || 0, 'records');
      } catch (err) {
        setError(err.message);
        console.error('❌ Error fetching rooming lists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomingLists();

    // Set up real-time subscription
    const subscription = supabase
      .channel('rooming_lists_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rooming_lists' 
        }, 
        (payload) => {
          console.log('🔄 Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setRoomingLists(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRoomingLists(prev => 
              prev.map(item => 
                item.roomingListId === payload.new.roomingListId ? payload.new : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRoomingLists(prev => 
              prev.filter(item => item.roomingListId !== payload.old.roomingListId)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { roomingLists, loading, error, refetch: () => window.location.reload() };
};

// Hook for fetching bookings with real-time updates
export const useBookingsForRoomingList = (roomingListId) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomingListId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rooming_list_bookings')
          .select(`
            *,
            bookings (
              "bookingId",
              "guestName", 
              "guestPhoneNumber",
              "checkInDate",
              "checkOutDate",
              "hotelId",
              "eventId"
            )
          `)
          .eq('roomingListId', roomingListId);

        if (error) throw error;
        
        setBookings(data || []);
        console.log('✅ Fetched bookings for rooming list:', roomingListId, data?.length || 0, 'records');
      } catch (err) {
        setError(err.message);
        console.error('❌ Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [roomingListId]);

  return { bookings, loading, error };
};

// Example usage in a component:
/*
import { useRoomingListsRealtime, useSupabase } from './hooks/useSupabase';

function MyComponent() {
  const { supabase, isConnected } = useSupabase();
  const { roomingLists, loading, error } = useRoomingListsRealtime();

  if (!isConnected) return <div>Connecting to Supabase...</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {roomingLists.map(list => (
        <div key={list.roomingListId}>{list.rfpName}</div>
      ))}
    </div>
  );
}
*/ 