const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*,
        COUNT(DISTINCT rl."roomingListId") as "roomingListCount",
        COUNT(DISTINCT b."bookingId") as "bookingCount"
      FROM events e
      LEFT JOIN rooming_lists rl ON e."eventId" = rl."eventId"
      LEFT JOIN bookings b ON e."eventId" = b."eventId"
      GROUP BY e."eventId"
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM events WHERE "eventId" = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { eventName, description } = req.body;
    
    // Validate required fields
    if (!eventName) {
      return res.status(400).json({ 
        error: 'Missing required field: eventName' 
      });
    }
    
    const query = `
      INSERT INTO events ("eventName", description)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [eventName, description]);
    
    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, description } = req.body;
    
    const query = `
      UPDATE events 
      SET "eventName" = COALESCE($2, "eventName"),
          description = COALESCE($3, description)
      WHERE "eventId" = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, eventName, description]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Event updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM events WHERE "eventId" = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      status: 'success',
      message: 'Event deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get rooming lists for a specific event
router.get('/:id/rooming-lists', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching rooming lists for event ID:', id);
    
    const result = await pool.query(`
      SELECT rl.*, e."eventName"
      FROM rooming_lists rl
      JOIN events e ON rl."eventId" = e."eventId"
      WHERE rl."eventId" = $1
      ORDER BY rl."cutOffDate"
    `, [id]);
    
    console.log('✅ Found', result.rows.length, 'rooming lists for event');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR fetching event rooming lists:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event rooming lists',
      details: error.message 
    });
  }
});

module.exports = router; 