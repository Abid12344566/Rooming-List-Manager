const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create connection to SQLite database
const dbPath = path.join(__dirname, 'rooming_list.sqlite');
const db = new sqlite3.Database(dbPath);

async function createTestUser() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🔐 Creating test user...');
      
      // Test user credentials
      const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      // Insert the test user
      db.run(
        'INSERT OR REPLACE INTO users (username, email, password) VALUES (?, ?, ?)',
        [testUser.username, testUser.email, hashedPassword],
        function(err) {
          if (err) {
            console.error('❌ Error creating test user:', err);
            reject(err);
          } else {
            console.log('✅ Test user created successfully!');
            console.log('📧 Email:', testUser.email);
            console.log('🔑 Password:', testUser.password);
            console.log('👤 Username:', testUser.username);
            db.close();
            resolve();
          }
        }
      );
    } catch (error) {
      console.error('❌ Error hashing password:', error);
      reject(error);
    }
  });
}

// Run the creation
createTestUser()
  .then(() => {
    console.log('🎉 Test user ready for sign in!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create test user:', error);
    process.exit(1);
  }); 