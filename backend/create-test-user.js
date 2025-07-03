const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
const path = require('path');

async function createTestUser() {
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
    await pool.query(`
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET 
        username = EXCLUDED.username,
        password = EXCLUDED.password
    `, [testUser.username, testUser.email, hashedPassword]);

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('👤 Username:', testUser.username);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
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