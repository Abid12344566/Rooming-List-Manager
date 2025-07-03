const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Clear all data and insert from JSON files
router.post('/insert-sample-data', authenticateToken, async (req, res) => {
  try {
    console.log('🌱 Starting data insertion from JSON files...');
    
    // Clear existing data (in correct order due to foreign key constraints)
    await pool.query('DELETE FROM rooming_list_bookings');
    await pool.query('DELETE FROM rooming_lists');
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM events');
    
    // Reset SQLite auto-increment (no sequences in SQLite)
    await pool.query('DELETE FROM sqlite_sequence WHERE name IN ("bookings", "rooming_lists", "events")');

    // Read JSON files from the main directory (parent directory of backend)
    const mainDir = path.resolve(__dirname, '../..');
    
    console.log('📁 Reading JSON files from:', mainDir);
    
    const roomingListsPath = path.join(mainDir, 'rooming-lists.json');
    const bookingsPath = path.join(mainDir, 'bookings.json');
    const roomingListBookingsPath = path.join(mainDir, 'rooming-list-bookings.json');

    // Read and parse JSON files
    const roomingListsData = JSON.parse(await fs.readFile(roomingListsPath, 'utf8'));
    const bookingsData = JSON.parse(await fs.readFile(bookingsPath, 'utf8'));
    const roomingListBookingsData = JSON.parse(await fs.readFile(roomingListBookingsPath, 'utf8'));

    console.log('📊 Data loaded:', {
      roomingLists: roomingListsData.length,
      bookings: bookingsData.length,
      relationships: roomingListBookingsData.length
    });

    // Extract unique events from rooming lists data
    const eventsMap = new Map();
    roomingListsData.forEach(rl => {
      if (!eventsMap.has(rl.eventId)) {
        eventsMap.set(rl.eventId, {
          eventId: rl.eventId,
          eventName: rl.eventName
        });
      }
    });
    const eventsData = Array.from(eventsMap.values());

    console.log('🎯 Extracted events:', eventsData.length);

    // Insert events first
    for (const event of eventsData) {
      await pool.query(`
        INSERT INTO events ("eventId", "eventName") VALUES ($1, $2)
      `, [event.eventId, event.eventName]);
    }
    console.log('✅ Events inserted');

    // Insert bookings
    for (const booking of bookingsData) {
      await pool.query(`
        INSERT INTO bookings ("bookingId", "hotelId", "eventId", "guestName", "guestPhoneNumber", "checkInDate", "checkOutDate")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [booking.bookingId, booking.hotelId, booking.eventId, booking.guestName, booking.guestPhoneNumber, booking.checkInDate, booking.checkOutDate]);
    }
    console.log('✅ Bookings inserted');

    // Insert rooming lists (without eventName since it's not in the database schema)
    for (const roomingList of roomingListsData) {
      await pool.query(`
        INSERT INTO rooming_lists ("roomingListId", "eventId", "hotelId", "rfpName", "cutOffDate", status, "agreement_type")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [roomingList.roomingListId, roomingList.eventId, roomingList.hotelId, roomingList.rfpName, roomingList.cutOffDate, roomingList.status, roomingList.agreement_type]);
    }
    console.log('✅ Rooming lists inserted');

    // Insert rooming list bookings relationships
    for (const relation of roomingListBookingsData) {
      await pool.query(`
        INSERT INTO rooming_list_bookings ("roomingListId", "bookingId")
        VALUES ($1, $2)
      `, [relation.roomingListId, relation.bookingId]);
    }
    console.log('✅ Relationships inserted');
    
    res.json({ 
      message: 'Sample data inserted successfully from JSON files',
      summary: {
        events: eventsData.length,
        bookings: bookingsData.length,
        roomingLists: roomingListsData.length,
        relationships: roomingListBookingsData.length
      },
      files: {
        roomingLists: 'rooming-lists.json',
        bookings: 'bookings.json',
        relationships: 'rooming-list-bookings.json'
      }
    });
  } catch (error) {
    console.error('❌ Error inserting data from JSON files:', error);
    
    // Provide more specific error messages
    if (error.code === 'ENOENT') {
      return res.status(400).json({ 
        error: 'JSON file not found. Please ensure rooming-lists.json, bookings.json, and rooming-list-bookings.json exist in the main directory.',
        missingFile: error.path
      });
    }
    
    if (error instanceof SyntaxError) {
      return res.status(400).json({ 
        error: 'Invalid JSON format in one of the files. Please check the JSON syntax.',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error while inserting data from JSON files',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please check server logs'
    });
  }
});

// Clear all data
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    // Clear all data (in correct order due to foreign key constraints)
    await pool.query('DELETE FROM rooming_list_bookings');
    await pool.query('DELETE FROM rooming_lists');
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM events');
    
    // Reset SQLite auto-increment
    await pool.query('DELETE FROM sqlite_sequence WHERE name IN ("bookings", "rooming_lists", "events")');
    
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Internal server error while clearing data' });
  }
});

module.exports = router; 