const { pool } = require('./config/database');
const path = require('path');

// Verify data in PostgreSQL database
async function verifyData() {
  try {
    console.log('🔍 Verifying data in PostgreSQL database...');

    // Check Bookings table
    const bookingsResult = await pool.query('SELECT COUNT(*) as count FROM bookings');
    console.log(`📊 Bookings count: ${bookingsResult.rows[0].count}`);

    // Check RoomingLists table
    const roomingListsResult = await pool.query('SELECT COUNT(*) as count FROM rooming_lists');
    console.log(`📊 Rooming Lists count: ${roomingListsResult.rows[0].count}`);

    // Check RoomingListBookings table
    const junctionResult = await pool.query('SELECT COUNT(*) as count FROM rooming_list_bookings');
    console.log(`📊 Rooming List Bookings count: ${junctionResult.rows[0].count}`);

    // Sample data from each table
    console.log('\n📋 Sample Bookings:');
    const sampleBookings = await pool.query('SELECT * FROM bookings LIMIT 3');
    console.table(sampleBookings.rows);

    console.log('\n📋 Sample Rooming Lists:');
    const sampleRoomingLists = await pool.query('SELECT * FROM rooming_lists LIMIT 3');
    console.table(sampleRoomingLists.rows);

    console.log('\n📋 Sample Junction Records:');
    const sampleJunction = await pool.query(`
      SELECT rlb.*, b.guest_name, r.rfp_name 
      FROM rooming_list_bookings rlb
      JOIN bookings b ON rlb.booking_id = b.booking_id
      JOIN rooming_lists r ON rlb.rooming_list_id = r.rooming_list_id
      LIMIT 3
    `);
    console.table(sampleJunction.rows);

    console.log('✅ Data verification completed successfully');

  } catch (err) {
    console.error('❌ Error verifying data:', err);
  } finally {
    await pool.end();
  }
}

verifyData(); 