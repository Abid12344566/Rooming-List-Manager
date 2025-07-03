const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rooming_list_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Database initialization
const initDatabase = async () => {
  try {
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooming_lists (
        "roomingListId" SERIAL PRIMARY KEY,
        "eventId" INTEGER NOT NULL,
        "hotelId" INTEGER NOT NULL,
        "rfpName" VARCHAR(255) NOT NULL,
        "cutOffDate" DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        "agreement_type" VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooming_list_bookings (
        id SERIAL PRIMARY KEY,
        "roomingListId" INTEGER REFERENCES rooming_lists("roomingListId") ON DELETE CASCADE,
        "bookingId" INTEGER REFERENCES bookings("bookingId") ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("roomingListId", "bookingId")
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        "eventId" SERIAL PRIMARY KEY,
        "eventName" VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase };