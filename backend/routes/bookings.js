const express = require('express');
const { pool } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo, sortBy, sortOrder } = req.query;
    console.log('🔍 Fetching bookings with filters:', { search, status, dateFrom, dateTo, sortBy, sortOrder });
    
    let query = 'SELECT * FROM bookings';
    const conditions = [];
    const params = [];
    
    // Search functionality
    if (search) {
      conditions.push(`(
        LOWER("guestName") LIKE LOWER($${params.length + 1}) OR 
        LOWER("guestEmail") LIKE LOWER($${params.length + 1}) OR 
        LOWER("hotelName") LIKE LOWER($${params.length + 1})
      )`);
      params.push(`%${search}%`);
    }
    
    // Status filter
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    // Date range filter
    if (dateFrom) {
      conditions.push(`"checkInDate" >= $${params.length + 1}`);
      params.push(dateFrom);
    }
    
    if (dateTo) {
      conditions.push(`"checkOutDate" <= $${params.length + 1}`);
      params.push(dateTo);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Sorting
    if (sortBy === 'checkInDate') {
      query += ` ORDER BY "checkInDate" ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'guestName') {
      query += ` ORDER BY "guestName" ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ' ORDER BY "bookingId"';
    }
    
    const result = await pool.query(query, params);
    console.log('✅ Found', result.rows.length, 'bookings');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR fetching bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    });
  }
});

// Get a specific booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching booking ID:', id);
    
    const result = await pool.query('SELECT * FROM bookings WHERE "bookingId" = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Booking found for guest:', result.rows[0].guestName);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR fetching booking:', error);
    res.status(500).json({ 
      error: 'Failed to fetch booking',
      details: error.message 
    });
  }
});

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      hotelId, 
      guestName, 
      guestEmail, 
      guestPhone, 
      checkInDate, 
      checkOutDate, 
      roomType, 
      specialRequests, 
      hotelName, 
      status 
    } = req.body;
    
    console.log('🆕 Creating new booking for guest:', guestName);
    
    // Validate required fields
    if (!guestName || !guestEmail || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: guestName, guestEmail, checkInDate, checkOutDate' 
      });
    }
    
    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut <= checkIn) {
      return res.status(400).json({ 
        error: 'Check-out date must be after check-in date' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO bookings (
        "hotelId", "guestName", "guestEmail", "guestPhone", 
        "checkInDate", "checkOutDate", "roomType", "specialRequests", 
        "hotelName", status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      hotelId, 
      guestName, 
      guestEmail, 
      guestPhone, 
      checkInDate, 
      checkOutDate, 
      roomType, 
      specialRequests, 
      hotelName, 
      status || 'Confirmed'
    ]);
    
    console.log('✅ Booking created with ID:', result.rows[0].bookingId);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR creating booking:', error);
    res.status(500).json({ 
      error: 'Failed to create booking',
      details: error.message 
    });
  }
});

// Update a booking
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      hotelId, 
      guestName, 
      guestEmail, 
      guestPhone, 
      checkInDate, 
      checkOutDate, 
      roomType, 
      specialRequests, 
      hotelName, 
      status 
    } = req.body;
    
    console.log('🔄 Updating booking ID:', id, 'for guest:', guestName);
    
    // Validate dates if provided
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (checkOut <= checkIn) {
        return res.status(400).json({ 
          error: 'Check-out date must be after check-in date' 
        });
      }
    }
    
    const result = await pool.query(`
      UPDATE bookings 
      SET "hotelId" = $1, "guestName" = $2, "guestEmail" = $3, "guestPhone" = $4,
          "checkInDate" = $5, "checkOutDate" = $6, "roomType" = $7, 
          "specialRequests" = $8, "hotelName" = $9, status = $10
      WHERE "bookingId" = $11
      RETURNING *
    `, [
      hotelId, 
      guestName, 
      guestEmail, 
      guestPhone, 
      checkInDate, 
      checkOutDate, 
      roomType, 
      specialRequests, 
      hotelName, 
      status, 
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Booking updated successfully');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR updating booking:', error);
    res.status(500).json({ 
      error: 'Failed to update booking',
      details: error.message 
    });
  }
});

// Delete a booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting booking ID:', id);
    
    // First remove from rooming list associations
    await pool.query('DELETE FROM rooming_list_bookings WHERE "bookingId" = $1', [id]);
    
    // Then delete the booking
    const result = await pool.query('DELETE FROM bookings WHERE "bookingId" = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Booking deleted successfully');
    res.json({ message: 'Booking deleted successfully', deletedItem: result.rows[0] });
  } catch (error) {
    console.error('❌ ERROR deleting booking:', error);
    res.status(500).json({ 
      error: 'Failed to delete booking',
      details: error.message 
    });
  }
});

// Get rooming lists associated with a booking
router.get('/:id/rooming-lists', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching rooming lists for booking ID:', id);
    
    const result = await pool.query(`
      SELECT rl.*, e."eventName", rlb."bookingId"
      FROM rooming_lists rl
      JOIN events e ON rl."eventId" = e."eventId"
      JOIN rooming_list_bookings rlb ON rl."roomingListId" = rlb."roomingListId"
      WHERE rlb."bookingId" = $1
      ORDER BY rl."cutOffDate"
    `, [id]);
    
    console.log('✅ Found', result.rows.length, 'rooming lists for booking');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR fetching booking rooming lists:', error);
    res.status(500).json({ 
      error: 'Failed to fetch booking rooming lists',
      details: error.message 
    });
  }
});

// Link a booking to a rooming list
router.post('/:bookingId/rooming-lists/:roomingListId', authenticateToken, async (req, res) => {
  try {
    const { bookingId, roomingListId } = req.params;
    console.log('🔗 Linking booking', bookingId, 'to rooming list', roomingListId);
    
    // Check if booking exists
    const bookingCheck = await pool.query('SELECT * FROM bookings WHERE "bookingId" = $1', [bookingId]);
    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if rooming list exists
    const roomingListCheck = await pool.query('SELECT * FROM rooming_lists WHERE "roomingListId" = $1', [roomingListId]);
    if (roomingListCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }
    
    // Check if link already exists
    const linkCheck = await pool.query(
      'SELECT * FROM rooming_list_bookings WHERE "bookingId" = $1 AND "roomingListId" = $2', 
      [bookingId, roomingListId]
    );
    
    if (linkCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Booking already linked to this rooming list' });
    }
    
    // Create the link
    await pool.query(`
      INSERT INTO rooming_list_bookings ("roomingListId", "bookingId")
      VALUES ($1, $2)
    `, [roomingListId, bookingId]);
    
    console.log('✅ Booking linked to rooming list successfully');
    res.json({ message: 'Booking linked to rooming list successfully' });
  } catch (error) {
    console.error('❌ ERROR linking booking to rooming list:', error);
    res.status(500).json({ 
      error: 'Failed to link booking to rooming list',
      details: error.message 
    });
  }
});

// Unlink a booking from a rooming list
router.delete('/:bookingId/rooming-lists/:roomingListId', authenticateToken, async (req, res) => {
  try {
    const { bookingId, roomingListId } = req.params;
    console.log('🔗💥 Unlinking booking', bookingId, 'from rooming list', roomingListId);
    
    const result = await pool.query(
      'DELETE FROM rooming_list_bookings WHERE "bookingId" = $1 AND "roomingListId" = $2 RETURNING *', 
      [bookingId, roomingListId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found between booking and rooming list' });
    }
    
    console.log('✅ Booking unlinked from rooming list successfully');
    res.json({ message: 'Booking unlinked from rooming list successfully' });
  } catch (error) {
    console.error('❌ ERROR unlinking booking from rooming list:', error);
    res.status(500).json({ 
      error: 'Failed to unlink booking from rooming list',
      details: error.message 
    });
  }
});

module.exports = router; 