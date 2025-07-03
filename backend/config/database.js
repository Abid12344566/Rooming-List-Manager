const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rooming_list_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Database initialization with exact schema requirements
const initDatabase = async () => {
  try {
    // Create Bookings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        "bookingId" SERIAL PRIMARY KEY,
        "hotelId" INTEGER NOT NULL,
        "eventId" INTEGER NOT NULL,
        "guestName" VARCHAR(255) NOT NULL,
        "guestPhoneNumber" VARCHAR(20),
        "checkInDate" DATE NOT NULL,
        "checkOutDate" DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Rooming Lists Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooming_lists (
        "roomingListId" SERIAL PRIMARY KEY,
        "eventId" INTEGER NOT NULL,
        "hotelId" INTEGER NOT NULL,
        "rfpName" VARCHAR(255) NOT NULL,
        "cutOffDate" DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Closed', 'Cancelled')),
        "agreement_type" VARCHAR(50) NOT NULL CHECK ("agreement_type" IN ('leisure', 'staff', 'artist')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Rooming List Bookings Table (Junction table)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooming_list_bookings (
        id SERIAL PRIMARY KEY,
        "roomingListId" INTEGER NOT NULL REFERENCES rooming_lists("roomingListId") ON DELETE CASCADE,
        "bookingId" INTEGER NOT NULL REFERENCES bookings("bookingId") ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("roomingListId", "bookingId")
      );
    `);

    // Create Events Table (for reference)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        "eventId" SERIAL PRIMARY KEY,
        "eventName" VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Users Table (for authentication)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ PostgreSQL database tables created successfully');
    console.log('📋 Tables: bookings, rooming_lists, rooming_list_bookings, events, users');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

// Clear all data from tables
const clearAllData = async () => {
  try {
    await pool.query('DELETE FROM rooming_list_bookings');
    await pool.query('DELETE FROM rooming_lists');
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM events');
    
    // Reset sequences
    await pool.query('ALTER SEQUENCE bookings_bookingId_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE rooming_lists_roomingListId_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE rooming_list_bookings_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE events_eventId_seq RESTART WITH 1');
    
    console.log('🗑️ All data cleared from database');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase, clearAllData };