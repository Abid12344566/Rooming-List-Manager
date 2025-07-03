const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create connection to SQLite database
const dbPath = path.join(__dirname, 'rooming_list.sqlite');
const db = new sqlite3.Database(dbPath);

async function insertSampleData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🌱 Inserting sample data...');

      // Insert sample events
      db.run(`INSERT OR IGNORE INTO events (eventId, eventName, description) VALUES 
        (1, 'Tech Conference 2024', 'Annual technology conference'),
        (2, 'Business Summit', 'Corporate business summit'),
        (3, 'Medical Convention', 'Healthcare professionals gathering')`);

      // Insert sample bookings
      db.run(`INSERT OR IGNORE INTO bookings (bookingId, hotelId, eventId, guestName, guestPhoneNumber, checkInDate, checkOutDate) VALUES 
        (1, 101, 1, 'John Smith', '+1-555-0101', '2024-03-15', '2024-03-18'),
        (2, 101, 1, 'Jane Doe', '+1-555-0102', '2024-03-16', '2024-03-19'),
        (3, 102, 2, 'Bob Johnson', '+1-555-0103', '2024-04-10', '2024-04-12'),
        (4, 102, 2, 'Alice Brown', '+1-555-0104', '2024-04-11', '2024-04-13'),
        (5, 103, 3, 'Charlie Wilson', '+1-555-0105', '2024-05-20', '2024-05-23')`);

      // Insert sample rooming lists
      db.run(`INSERT OR IGNORE INTO rooming_lists (roomingListId, eventId, hotelId, rfpName, cutOffDate, status, agreement_type) VALUES 
        (1, 1, 101, 'Tech Conference Hotel Block', '2024-02-15', 'Active', 'Group Contract'),
        (2, 2, 102, 'Business Summit Accommodation', '2024-03-10', 'Active', 'Individual Booking'),
        (3, 3, 103, 'Medical Convention Rooms', '2024-04-15', 'Closed', 'Group Contract')`);

      // Insert rooming list bookings relationships
      db.run(`INSERT OR IGNORE INTO rooming_list_bookings (roomingListId, bookingId) VALUES 
        (1, 1),
        (1, 2),
        (2, 3),
        (2, 4),
        (3, 5)`, (err) => {
        if (err) {
          console.error('❌ Error inserting sample data:', err);
          reject(err);
        } else {
          console.log('✅ Sample data inserted successfully!');
          resolve();
        }
      });
    });
  });
}

// Run the insertion
insertSampleData()
  .then(() => {
    console.log('🎉 All sample data has been inserted.');
    db.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to insert sample data:', error);
    db.close();
    process.exit(1);
  }); 