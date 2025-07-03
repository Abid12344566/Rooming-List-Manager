const express = require('express');
const { pool } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all rooming lists with their bookings and events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, sortBy, sortOrder } = req.query;
    
    console.log('🔍 Starting rooming list fetch with filters:', { status, search, sortBy, sortOrder });
    
    // Step 1: Get rooming lists with events
    let roomingListQuery = `
      SELECT 
        rl.*,
        e."eventName"
      FROM rooming_lists rl
      LEFT JOIN events e ON rl."eventId" = e."eventId"
    `;

    const conditions = [];
    const params = [];

    // Filter by status
    if (status && status !== 'all') {
      conditions.push(`rl.status = $${params.length + 1}`);
      params.push(status);
    }

    // Search functionality
    if (search) {
      conditions.push(`(
        LOWER(e."eventName") LIKE LOWER($${params.length + 1}) OR 
        LOWER(rl."rfpName") LIKE LOWER($${params.length + 1}) OR 
        LOWER(rl."agreement_type") LIKE LOWER($${params.length + 1})
      )`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      roomingListQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Sorting
    if (sortBy === 'cutOffDate') {
      roomingListQuery += ` ORDER BY rl."cutOffDate" ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      roomingListQuery += ` ORDER BY rl."roomingListId"`;
    }

    const roomingListsResult = await pool.query(roomingListQuery, params);
    const roomingLists = roomingListsResult.rows;

    if (roomingLists.length === 0) {
      return res.json([]);
    }

    // Step 2: Get bookings for all rooming lists
    const roomingListIds = roomingLists.map(rl => rl.roomingListId);
    const placeholders = roomingListIds.map((_, index) => `$${index + 1}`).join(',');
    
    const bookingsQuery = `
        SELECT 
          b.*,
          rlb."roomingListId"
        FROM bookings b
        JOIN rooming_list_bookings rlb ON b."bookingId" = rlb."bookingId"
        WHERE rlb."roomingListId" IN (${placeholders})
        ORDER BY b."checkInDate"
    `;

    const bookingsResult = await pool.query(bookingsQuery, roomingListIds);
    
    // Step 3: Group bookings by rooming list
    const bookingsByRoomingList = {};
    bookingsResult.rows.forEach(booking => {
      const roomingListId = booking.roomingListId;
      if (!bookingsByRoomingList[roomingListId]) {
        bookingsByRoomingList[roomingListId] = [];
      }
      bookingsByRoomingList[roomingListId].push(booking);
    });

    // Step 4: Combine rooming lists with their bookings
    const result = roomingLists.map(roomingList => ({
      ...roomingList,
      bookings: bookingsByRoomingList[roomingList.roomingListId] || []
    }));

    console.log('✅ SUCCESS: Returning', result.length, 'rooming lists with bookings');
    res.json(result);
  } catch (error) {
    console.error('❌ ERROR in rooming lists route:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get a specific rooming list by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching rooming list ID:', id);
    
    // Get rooming list with event info
    const roomingListQuery = `
      SELECT 
        rl.*,
        e."eventName"
      FROM rooming_lists rl
      LEFT JOIN events e ON rl."eventId" = e."eventId"
      WHERE rl."roomingListId" = $1
    `;

    const roomingListResult = await pool.query(roomingListQuery, [id]);
    
    if (roomingListResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }

    const roomingList = roomingListResult.rows[0];

    // Get bookings for this rooming list
    const bookingsQuery = `
      SELECT 
        b.*,
        rlb."roomingListId"
      FROM bookings b
      JOIN rooming_list_bookings rlb ON b."bookingId" = rlb."bookingId"
      WHERE rlb."roomingListId" = $1
      ORDER BY b."checkInDate"
    `;

    const bookingsResult = await pool.query(bookingsQuery, [id]);

    const result = {
      ...roomingList,
      bookings: bookingsResult.rows
    };

    console.log('✅ Individual rooming list found with', bookingsResult.rows.length, 'bookings');
    res.json(result);
  } catch (error) {
    console.error('❌ ERROR fetching individual rooming list:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Create a new rooming list
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, hotelId, rfpName, cutOffDate, status, agreement_type, bookingIds } = req.body;
    console.log('🆕 Creating new rooming list:', { eventId, hotelId, rfpName, cutOffDate, status, agreement_type });

    // Validate required fields
    if (!eventId || !rfpName || !cutOffDate || !agreement_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: eventId, rfpName, cutOffDate, agreement_type' 
      });
    }

    // Insert rooming list
    const roomingListResult = await pool.query(`
      INSERT INTO rooming_lists ("eventId", "hotelId", "rfpName", "cutOffDate", status, "agreement_type")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [eventId, hotelId, rfpName, cutOffDate, status || 'Active', agreement_type]);

    const roomingList = roomingListResult.rows[0];
    console.log('✅ Rooming list created with ID:', roomingList.roomingListId);

    // Link bookings if provided
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      console.log('🔗 Linking', bookingIds.length, 'bookings to rooming list');
      for (const bookingId of bookingIds) {
        await pool.query(`
          INSERT INTO rooming_list_bookings ("roomingListId", "bookingId")
          VALUES ($1, $2)
        `, [roomingList.roomingListId, bookingId]);
      }
    }

    res.status(201).json(roomingList);
  } catch (error) {
    console.error('❌ ERROR creating rooming list:', error);
    res.status(500).json({ 
      error: 'Failed to create rooming list',
      details: error.message 
    });
  }
});

// Update a rooming list
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId, hotelId, rfpName, cutOffDate, status, agreement_type } = req.body;
    console.log('🔄 Updating rooming list ID:', id, 'with data:', { eventId, hotelId, rfpName, cutOffDate, status, agreement_type });

    const result = await pool.query(`
      UPDATE rooming_lists 
      SET "eventId" = $1, "hotelId" = $2, "rfpName" = $3, "cutOffDate" = $4, status = $5, "agreement_type" = $6
      WHERE "roomingListId" = $7
      RETURNING *
    `, [eventId, hotelId, rfpName, cutOffDate, status, agreement_type, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }

    console.log('✅ Rooming list updated successfully');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR updating rooming list:', error);
    res.status(500).json({ 
      error: 'Failed to update rooming list',
      details: error.message 
    });
  }
});

// Delete a rooming list
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting rooming list ID:', id);

    // First delete related bookings
    await pool.query('DELETE FROM rooming_list_bookings WHERE "roomingListId" = $1', [id]);

    // Then delete the rooming list
    const result = await pool.query('DELETE FROM rooming_lists WHERE "roomingListId" = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }

    console.log('✅ Rooming list deleted successfully');
    res.json({ message: 'Rooming list deleted successfully', deletedItem: result.rows[0] });
  } catch (error) {
    console.error('❌ ERROR deleting rooming list:', error);
    res.status(500).json({ 
      error: 'Failed to delete rooming list',
      details: error.message 
    });
  }
});

// Get bookings for a specific rooming list (separate endpoint)
router.get('/:id/bookings', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching bookings for rooming list ID:', id);
    
    const query = `
      SELECT 
        b.*,
        rlb."roomingListId"
      FROM bookings b
      JOIN rooming_list_bookings rlb ON b."bookingId" = rlb."bookingId"
      WHERE rlb."roomingListId" = $1
      ORDER BY b."checkInDate"
    `;

    const result = await pool.query(query, [id]);
    console.log('✅ Found', result.rows.length, 'bookings for rooming list');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR fetching individual bookings:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router; 