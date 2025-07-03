const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create connection to SQLite database
const dbPath = path.join(__dirname, 'rooming_list.sqlite');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

async function verifyData() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Verifying database contents...\n');

    // Check events
    db.all('SELECT * FROM events', [], (err, rows) => {
      if (err) {
        console.error('Error querying events:', err);
      } else {
        console.log('📅 Events:', rows.length, 'records');
        rows.forEach(row => console.log('  -', row));
      }
      console.log();
    });

    // Check rooming lists
    db.all('SELECT * FROM rooming_lists', [], (err, rows) => {
      if (err) {
        console.error('Error querying rooming_lists:', err);
      } else {
        console.log('🏨 Rooming Lists:', rows.length, 'records');
        rows.forEach(row => console.log('  -', row));
      }
      console.log();
    });

    // Check bookings
    db.all('SELECT * FROM bookings', [], (err, rows) => {
      if (err) {
        console.error('Error querying bookings:', err);
      } else {
        console.log('📝 Bookings:', rows.length, 'records');
        rows.forEach(row => console.log('  -', row));
      }
      console.log();
    });

    // Check rooming list bookings
    db.all('SELECT * FROM rooming_list_bookings', [], (err, rows) => {
      if (err) {
        console.error('Error querying rooming_list_bookings:', err);
      } else {
        console.log('🔗 Rooming List Bookings:', rows.length, 'records');
        rows.forEach(row => console.log('  -', row));
      }
      console.log();
    });

    // Check users
    db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) {
        console.error('Error querying users:', err);
      } else {
        console.log('👤 Users:', rows.length, 'records');
        rows.forEach(row => {
          const { password, ...userWithoutPassword } = row;
          console.log('  -', userWithoutPassword);
        });
      }
      console.log();

      // Test the exact query used by the application
      console.log('🧪 Testing application query...');
      db.all(`
        SELECT 
          rl.*,
          e."eventName"
        FROM rooming_lists rl
        LEFT JOIN events e ON rl."eventId" = e."eventId"
        ORDER BY rl."roomingListId"
      `, [], (err, rows) => {
        if (err) {
          console.error('Error with application query:', err);
        } else {
          console.log('Application query result:', rows.length, 'records');
          rows.forEach(row => console.log('  -', row));
        }
        
        db.close();
        resolve();
      });
    });
  });
}

// Run verification
verifyData()
  .then(() => {
    console.log('✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }); 