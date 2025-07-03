const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Determine database path - use data directory if it exists (Docker), otherwise use current directory
const dataDir = path.join(__dirname, '../data');
const dbDir = fs.existsSync(dataDir) ? dataDir : path.dirname(__dirname);
const dbPath = path.join(dbDir, 'rooming_list.sqlite');

console.log('📁 SQLite database path:', dbPath);

// Ensure database directory exists
const dbDirectory = path.dirname(dbPath);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
  console.log('📁 Created database directory:', dbDirectory);
}

// Create SQLite database
const db = new sqlite3.Database(dbPath);

// Database initialization for SQLite
const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          bookingId INTEGER PRIMARY KEY AUTOINCREMENT,
          hotelId INTEGER NOT NULL,
          eventId INTEGER NOT NULL,
          guestName TEXT NOT NULL,
          guestPhoneNumber TEXT,
          checkInDate DATE NOT NULL,
          checkOutDate DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS rooming_lists (
          roomingListId INTEGER PRIMARY KEY AUTOINCREMENT,
          eventId INTEGER NOT NULL,
          hotelId INTEGER NOT NULL,
          rfpName TEXT NOT NULL,
          cutOffDate DATE NOT NULL,
          status TEXT DEFAULT 'Active',
          agreement_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS rooming_list_bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          roomingListId INTEGER,
          bookingId INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (roomingListId) REFERENCES rooming_lists(roomingListId) ON DELETE CASCADE,
          FOREIGN KEY (bookingId) REFERENCES bookings(bookingId) ON DELETE CASCADE,
          UNIQUE(roomingListId, bookingId)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          eventId INTEGER PRIMARY KEY AUTOINCREMENT,
          eventName TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating SQLite tables:', err);
          reject(err);
        } else {
          console.log('SQLite database tables created successfully');
          resolve();
        }
      });
    });
  });
};

// SQLite query wrapper to match PostgreSQL interface
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    // Convert PostgreSQL parameter syntax ($1, $2) to SQLite syntax (?, ?)
    let convertedSql = sql;
    let convertedParams = [...params];
    
    // Handle parameter conversion from $1, $2, etc. to ?
    const paramMatches = sql.match(/\$\d+/g);
    if (paramMatches) {
      // Get unique parameter numbers and sort them
      const paramNumbers = [...new Set(paramMatches.map(m => parseInt(m.substring(1))))].sort((a, b) => a - b);
      
      // Replace parameters in order
      paramNumbers.forEach((paramNum, index) => {
        const regex = new RegExp(`\\$${paramNum}`, 'g');
        convertedSql = convertedSql.replace(regex, '?');
      });
      
      // Reorder parameters according to their original positions
      convertedParams = paramNumbers.map(num => params[num - 1]);
    }

    if (convertedSql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(convertedSql, convertedParams, (err, rows) => {
        if (err) {
          console.error('SQLite SELECT error:', err);
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    } else if (convertedSql.trim().toUpperCase().startsWith('INSERT') && convertedSql.includes('RETURNING')) {
      // Handle INSERT with RETURNING for SQLite
      const insertSql = convertedSql.replace(/RETURNING.*$/i, '');
      db.run(insertSql, convertedParams, function(err) {
        if (err) {
          console.error('SQLite INSERT error:', err);
          reject(err);
        } else {
          // Get the inserted row
          const tableName = convertedSql.match(/INSERT INTO (\w+)/i)[1];
          const selectSql = `SELECT * FROM ${tableName} WHERE rowid = ?`;
          db.get(selectSql, [this.lastID], (err, row) => {
            if (err) {
              console.error('SQLite SELECT after INSERT error:', err);
              reject(err);
            } else {
              resolve({ rows: [row] });
            }
          });
        }
      });
    } else {
      db.run(convertedSql, convertedParams, function(err) {
        if (err) {
          console.error('SQLite RUN error:', err);
          reject(err);
        } else {
          resolve({ rows: [], rowsAffected: this.changes, lastID: this.lastID });
        }
      });
    }
  });
};

const pool = { query };

module.exports = { pool, initDatabase, db }; 