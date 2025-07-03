const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.*,
        e."eventName"
      FROM bookings b
      LEFT JOIN events e ON b."eventId" = e."eventId"
      ORDER BY b."checkInDate"
    `;
    
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        b.*,
        e."eventName"
      FROM bookings b
      LEFT JOIN events e ON b."eventId" = e."eventId"
      WHERE b."bookingId" = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate } = req.body;
    
    // Validate required fields
    if (!hotelId || !eventId || !guestName || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: hotelId, eventId, guestName, checkInDate, checkOutDate' 
      });
    }
    
    const query = `
      INSERT INTO bookings ("hotelId", "eventId", "guestName", "guestPhoneNumber", "checkInDate", "checkOutDate")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate]);
    
    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update a booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate } = req.body;
    
    const query = `
      UPDATE bookings 
      SET "hotelId" = COALESCE($2, "hotelId"),
          "eventId" = COALESCE($3, "eventId"),
          "guestName" = COALESCE($4, "guestName"),
          "guestPhoneNumber" = COALESCE($5, "guestPhoneNumber"),
          "checkInDate" = COALESCE($6, "checkInDate"),
          "checkOutDate" = COALESCE($7, "checkOutDate")
      WHERE "bookingId" = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Booking updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM bookings WHERE "bookingId" = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Booking deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Get rooming lists associated with a booking
router.get('/:id/rooming-lists', async (req, res) => {
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
router.post('/:bookingId/rooming-lists/:roomingListId', async (req, res) => {
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
router.delete('/:bookingId/rooming-lists/:roomingListId', async (req, res) => {
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