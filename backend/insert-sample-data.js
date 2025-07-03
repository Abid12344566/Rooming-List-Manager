const { pool } = require('./config/database');
const path = require('path');

async function insertSampleData() {
  try {
    console.log('🌱 Inserting sample data into PostgreSQL...');

    // Insert sample events
    await pool.query(`
      INSERT INTO events ("eventId", "eventName", description) VALUES 
        (1, 'Tech Conference 2024', 'Annual technology conference'),
        (2, 'Business Summit', 'Corporate business summit'),
        (3, 'Medical Convention', 'Healthcare professionals gathering')
      ON CONFLICT ("eventId") DO NOTHING
    `);

    // Insert sample bookings
    await pool.query(`
      INSERT INTO bookings ("bookingId", "hotelId", "eventId", "guestName", "guestPhoneNumber", "checkInDate", "checkOutDate") VALUES 
        (1, 101, 1, 'John Smith', '+1-555-0101', '2024-03-15', '2024-03-18'),
        (2, 101, 1, 'Jane Doe', '+1-555-0102', '2024-03-16', '2024-03-19'),
        (3, 102, 2, 'Bob Johnson', '+1-555-0103', '2024-04-10', '2024-04-12'),
        (4, 102, 2, 'Alice Brown', '+1-555-0104', '2024-04-11', '2024-04-13'),
        (5, 103, 3, 'Charlie Wilson', '+1-555-0105', '2024-05-20', '2024-05-23')
      ON CONFLICT ("bookingId") DO NOTHING
    `);

    // Insert sample rooming lists
    await pool.query(`
      INSERT INTO rooming_lists ("roomingListId", "eventId", "hotelId", "rfpName", "cutOffDate", status, "agreement_type") VALUES 
        (1, 1, 101, 'Tech Conference Hotel Block', '2024-02-15', 'Active', 'leisure'),
        (2, 2, 102, 'Business Summit Accommodation', '2024-03-10', 'Active', 'staff'),
        (3, 3, 103, 'Medical Convention Rooms', '2024-04-15', 'Closed', 'artist')
      ON CONFLICT ("roomingListId") DO NOTHING
    `);

    // Insert rooming list bookings relationships
    await pool.query(`
      INSERT INTO rooming_list_bookings ("roomingListId", "bookingId") VALUES 
        (1, 1),
        (1, 2),
        (2, 3),
        (2, 4),
        (3, 5)
      ON CONFLICT ("roomingListId", "bookingId") DO NOTHING
    `);

    console.log('✅ Sample data inserted successfully into PostgreSQL!');

  } catch (err) {
    console.error('❌ Error inserting sample data:', err);
    throw err;
  }
}

// Run the insertion
insertSampleData()
  .then(() => {
    console.log('🎉 All sample data has been inserted.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to insert sample data:', error);
    process.exit(1);
  }); 