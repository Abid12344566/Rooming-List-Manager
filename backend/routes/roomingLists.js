const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// GET /api/rooming-lists - Get all rooming lists with details
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        rl."roomingListId",
        rl."eventId",
        rl."hotelId",
        rl."rfpName",
        rl."cutOffDate",
        rl.status,
        rl."agreement_type",
        rl.created_at,
        e."eventName",
        COUNT(rlb."bookingId") as "bookingCount"
      FROM rooming_lists rl
      LEFT JOIN events e ON rl."eventId" = e."eventId"
      LEFT JOIN rooming_list_bookings rlb ON rl."roomingListId" = rlb."roomingListId"
      GROUP BY rl."roomingListId", e."eventName"
      ORDER BY rl.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching rooming lists:', error);
    res.status(500).json({ error: 'Failed to fetch rooming lists' });
  }
});

// GET /api/rooming-lists/:id - Get specific rooming list
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        rl.*,
        e."eventName"
      FROM rooming_lists rl
      LEFT JOIN events e ON rl."eventId" = e."eventId"
      WHERE rl."roomingListId" = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching rooming list:', error);
    res.status(500).json({ error: 'Failed to fetch rooming list' });
  }
});

// GET /api/rooming-lists/:id/bookings - Get all bookings for a specific rooming list
router.get('/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        b."bookingId",
        b."hotelId",
        b."eventId",
        b."guestName",
        b."guestPhoneNumber",
        b."checkInDate",
        b."checkOutDate",
        b.created_at,
        e."eventName"
      FROM rooming_list_bookings rlb
      JOIN bookings b ON rlb."bookingId" = b."bookingId"
      LEFT JOIN events e ON b."eventId" = e."eventId"
      WHERE rlb."roomingListId" = $1
      ORDER BY b."checkInDate"
    `;
    
    const result = await pool.query(query, [id]);
    
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length,
      roomingListId: parseInt(id)
    });
  } catch (error) {
    console.error('❌ Error fetching bookings for rooming list:', error);
    res.status(500).json({ error: 'Failed to fetch bookings for rooming list' });
  }
});

// POST /api/rooming-lists - Create new rooming list
router.post('/', async (req, res) => {
  try {
    const { eventId, hotelId, rfpName, cutOffDate, status = 'Active', agreement_type } = req.body;
    
    // Validate required fields
    if (!eventId || !hotelId || !rfpName || !cutOffDate || !agreement_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: eventId, hotelId, rfpName, cutOffDate, agreement_type' 
      });
    }
    
    // Validate agreement_type
    if (!['leisure', 'staff', 'artist'].includes(agreement_type)) {
      return res.status(400).json({ 
        error: 'agreement_type must be one of: leisure, staff, artist' 
      });
    }
    
    // Validate status
    if (!['Active', 'Closed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'status must be one of: Active, Closed, Cancelled' 
      });
    }
    
    const query = `
      INSERT INTO rooming_lists ("eventId", "hotelId", "rfpName", "cutOffDate", status, "agreement_type")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [eventId, hotelId, rfpName, cutOffDate, status, agreement_type]);
    
    res.status(201).json({
      status: 'success',
      message: 'Rooming list created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error creating rooming list:', error);
    res.status(500).json({ error: 'Failed to create rooming list' });
  }
});

// PUT /api/rooming-lists/:id - Update rooming list
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId, hotelId, rfpName, cutOffDate, status, agreement_type } = req.body;
    
    // Validate agreement_type if provided
    if (agreement_type && !['leisure', 'staff', 'artist'].includes(agreement_type)) {
      return res.status(400).json({ 
        error: 'agreement_type must be one of: leisure, staff, artist' 
      });
    }
    
    // Validate status if provided
    if (status && !['Active', 'Closed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'status must be one of: Active, Closed, Cancelled' 
      });
    }
    
    const query = `
      UPDATE rooming_lists 
      SET "eventId" = COALESCE($2, "eventId"),
          "hotelId" = COALESCE($3, "hotelId"),
          "rfpName" = COALESCE($4, "rfpName"),
          "cutOffDate" = COALESCE($5, "cutOffDate"),
          status = COALESCE($6, status),
          "agreement_type" = COALESCE($7, "agreement_type")
      WHERE "roomingListId" = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, eventId, hotelId, rfpName, cutOffDate, status, agreement_type]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Rooming list updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating rooming list:', error);
    res.status(500).json({ error: 'Failed to update rooming list' });
  }
});

// DELETE /api/rooming-lists/:id - Delete rooming list
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM rooming_lists WHERE "roomingListId" = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rooming list not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Rooming list deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error deleting rooming list:', error);
    res.status(500).json({ error: 'Failed to delete rooming list' });
  }
});

module.exports = router; 