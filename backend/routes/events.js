const express = require('express');
const { pool } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;
    console.log('🔍 Fetching events with filters:', { search, sortBy, sortOrder });
    
    let query = 'SELECT * FROM events';
    const params = [];
    
    // Search functionality
    if (search) {
      query += ' WHERE LOWER("eventName") LIKE LOWER($1) OR LOWER(description) LIKE LOWER($1)';
      params.push(`%${search}%`);
    }
    
    // Sorting
    if (sortBy === 'eventName') {
      query += ` ORDER BY "eventName" ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ' ORDER BY "eventId"';
    }
    
    const result = await pool.query(query, params);
    console.log('✅ Found', result.rows.length, 'events');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ ERROR fetching events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      details: error.message 
    });
  }
});

// Get a specific event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching event ID:', id);
    
    const result = await pool.query('SELECT * FROM events WHERE "eventId" = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log('✅ Event found:', result.rows[0].eventName);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR fetching event:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event',
      details: error.message 
    });
  }
});

// Create a new event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventName, description } = req.body;
    console.log('🆕 Creating new event:', { eventName, description });
    
    // Validate required fields
    if (!eventName) {
      return res.status(400).json({ 
        error: 'Missing required field: eventName' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO events ("eventName", description)
      VALUES ($1, $2)
      RETURNING *
    `, [eventName, description]);
    
    console.log('✅ Event created with ID:', result.rows[0].eventId);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      details: error.message 
    });
  }
});

// Update an event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, description } = req.body;
    console.log('🔄 Updating event ID:', id, 'with data:', { eventName, description });
    
    const result = await pool.query(`
      UPDATE events 
      SET "eventName" = $1, description = $2
      WHERE "eventId" = $3
      RETURNING *
    `, [eventName, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log('✅ Event updated successfully');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR updating event:', error);
    res.status(500).json({ 
      error: 'Failed to update event',
      details: error.message 
    });
  }
});

// Delete an event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting event ID:', id);
    
    // Check if event has associated rooming lists
    const roomingListsCheck = await pool.query('SELECT COUNT(*) as count FROM rooming_lists WHERE "eventId" = $1', [id]);
    
    if (parseInt(roomingListsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete event with associated rooming lists. Delete rooming lists first.' 
      });
    }
    
    const result = await pool.query('DELETE FROM events WHERE "eventId" = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    console.log('✅ Event deleted successfully');
    res.json({ message: 'Event deleted successfully', deletedItem: result.rows[0] });
  } catch (error) {
    console.error('❌ ERROR deleting event:', error);
    res.status(500).json({ 
      error: 'Failed to delete event',
      details: error.message 
    });
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