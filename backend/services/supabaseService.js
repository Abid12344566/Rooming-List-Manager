const { supabase } = require('../config/supabase');

// Example Supabase service functions
// You can use these alongside your existing PostgreSQL pool queries

class SupabaseService {
  
  // Get all rooming lists using Supabase client
  async getRoomingListsViaSupabase() {
    try {
      const { data, error } = await supabase
        .from('rooming_lists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('✅ Fetched rooming lists via Supabase:', data.length, 'records');
      return data;
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }

  // Get bookings for a specific rooming list
  async getBookingsForRoomingList(roomingListId) {
    try {
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
          ),
          rooming_lists (
            "rfpName",
            status,
            "agreement_type"
          )
        `)
        .eq('roomingListId', roomingListId);
      
      if (error) throw error;
      
      console.log('✅ Fetched bookings via Supabase for rooming list:', roomingListId);
      return data;
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }

  // Insert new rooming list using Supabase
  async createRoomingList(roomingListData) {
    try {
      const { data, error } = await supabase
        .from('rooming_lists')
        .insert([roomingListData])
        .select();
      
      if (error) throw error;
      
      console.log('✅ Created rooming list via Supabase:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }

  // Real-time subscription example
  subscribeToRoomingListChanges(callback) {
    const subscription = supabase
      .channel('rooming_lists_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rooming_lists' 
        }, 
        (payload) => {
          console.log('🔄 Real-time change detected:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  // File upload example (if you want to handle file uploads)
  async uploadFile(bucket, fileName, file) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (error) throw error;
      
      console.log('✅ File uploaded via Supabase:', fileName);
      return data;
    } catch (error) {
      console.error('❌ Supabase file upload error:', error);
      throw error;
    }
  }
}

module.exports = new SupabaseService(); 