const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test registration
    const registerData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    };
    
    console.log('Testing registration...');
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', registerData);
    console.log('Registration successful!', registerResponse.data);
    
    // Test login
    console.log('Testing login...');
    const loginData = {
      username: 'newuser',
      password: 'password123'
    };
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', loginData);
    console.log('Login successful!', loginResponse.data);
    
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testAuth(); 