const express = require('express');
const { pool, clearAllData } = require('../config/database');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET /api/data/status - Check data status
router.get('/status', async (req, res) => {
  try {
    const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');
    const roomingListsCount = await pool.query('SELECT COUNT(*) FROM rooming_lists');
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    const roomingListBookingsCount = await pool.query('SELECT COUNT(*) FROM rooming_list_bookings');

    res.json({
      status: 'success',
      data: {
        bookings: parseInt(bookingsCount.rows[0].count),
        roomingLists: parseInt(roomingListsCount.rows[0].count),
        events: parseInt(eventsCount.rows[0].count),
        roomingListBookings: parseInt(roomingListBookingsCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('❌ Error getting data status:', error);
    res.status(500).json({ error: 'Failed to get data status' });
  }
});

// POST /api/data/insert - Clear and insert data from JSON files
router.post('/insert', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Step 1: Clear all existing data
    console.log('🗑️ Clearing all existing data...');
    await clearAllData();
    
    // Step 2: Read JSON files
    const roomingListsPath = path.join(__dirname, '../../rooming-lists.json');
    const bookingsPath = path.join(__dirname, '../../bookings.json');
    const roomingListBookingsPath = path.join(__dirname, '../../rooming-list-bookings.json');
    
    if (!fs.existsSync(roomingListsPath)) {
      throw new Error('rooming-lists.json file not found');
    }
    if (!fs.existsSync(bookingsPath)) {
      throw new Error('bookings.json file not found');
    }
    if (!fs.existsSync(roomingListBookingsPath)) {
      throw new Error('rooming-list-bookings.json file not found');
    }
    
    const roomingListsData = JSON.parse(fs.readFileSync(roomingListsPath, 'utf8'));
    const bookingsData = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
    const roomingListBookingsData = JSON.parse(fs.readFileSync(roomingListBookingsPath, 'utf8'));
    
    console.log('📁 JSON files loaded successfully');
    console.log(`📋 Rooming Lists: ${roomingListsData.length} records`);
    console.log(`🏨 Bookings: ${bookingsData.length} records`);
    console.log(`🔗 Rooming List Bookings: ${roomingListBookingsData.length} records`);
    
    // Step 3: Insert Events (extract unique events from bookings)
    const uniqueEvents = [...new Set(bookingsData.map(booking => booking.eventId))];
    for (const eventId of uniqueEvents) {
      await client.query(
        `INSERT INTO events ("eventId", "eventName") VALUES ($1, $2) ON CONFLICT ("eventId") DO NOTHING`,
        [eventId, `Event ${eventId}`]
      );
    }
    console.log(`✅ Inserted ${uniqueEvents.length} events`);
    
    // Step 4: Insert Bookings
    for (const booking of bookingsData) {
      await client.query(
        `INSERT INTO bookings ("bookingId", "hotelId", "eventId", "guestName", "guestPhoneNumber", "checkInDate", "checkOutDate") 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          booking.bookingId,
          booking.hotelId,
          booking.eventId,
          booking.guestName,
          booking.guestPhoneNumber,
          booking.checkInDate,
          booking.checkOutDate
        ]
      );
    }
    console.log(`✅ Inserted ${bookingsData.length} bookings`);
    
    // Step 5: Insert Rooming Lists
    for (const roomingList of roomingListsData) {
      await client.query(
        `INSERT INTO rooming_lists ("roomingListId", "eventId", "hotelId", "rfpName", "cutOffDate", "status", "agreement_type") 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          roomingList.roomingListId,
          roomingList.eventId,
          roomingList.hotelId,
          roomingList.rfpName,
          roomingList.cutOffDate,
          roomingList.status || 'Active',
          roomingList.agreement_type
        ]
      );
    }
    console.log(`✅ Inserted ${roomingListsData.length} rooming lists`);
    
    // Step 6: Insert Rooming List Bookings (relationships)
    for (const relation of roomingListBookingsData) {
      await client.query(
        `INSERT INTO rooming_list_bookings ("roomingListId", "bookingId") VALUES ($1, $2)`,
        [relation.roomingListId, relation.bookingId]
      );
    }
    console.log(`✅ Inserted ${roomingListBookingsData.length} rooming list bookings relationships`);
    
    await client.query('COMMIT');
    
    res.json({
      status: 'success',
      message: 'Data inserted successfully from JSON files',
      data: {
        events: uniqueEvents.length,
        bookings: bookingsData.length,
        roomingLists: roomingListsData.length,
        roomingListBookings: roomingListBookingsData.length
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting data:', error);
    res.status(500).json({ 
      error: 'Failed to insert data from JSON files',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// DELETE /api/data/clear - Clear all data
router.delete('/clear', async (req, res) => {
  try {
    await clearAllData();
    res.json({
      status: 'success',
      message: 'All data cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

module.exports = router; 