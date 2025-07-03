const request = require('supertest');
const app = require('../server');

describe('Rooming Lists Endpoints', () => {
  let authToken;
  let testUser = {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'testpassword123'
  };

  beforeAll(async () => {
    // Register and login to get auth token
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /api/rooming-lists', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/rooming-lists')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('token');
    });

    it('should return rooming lists for authenticated user', async () => {
      const response = await request(app)
        .get('/api/rooming-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter rooming lists by status', async () => {
      const response = await request(app)
        .get('/api/rooming-lists?status=Active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search rooming lists', async () => {
      const response = await request(app)
        .get('/api/rooming-lists?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should sort rooming lists by cutOffDate', async () => {
      const response = await request(app)
        .get('/api/rooming-lists?sortBy=cutOffDate&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/rooming-lists', () => {
    it('should create a new rooming list with valid data', async () => {
      const newRoomingList = {
        eventId: 1,
        hotelId: 101,
        rfpName: 'Test RFP',
        cutOffDate: '2024-06-01',
        status: 'Active',
        agreement_type: 'staff'
      };

      const response = await request(app)
        .post('/api/rooming-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRoomingList)
        .expect(201);

      expect(response.body).toHaveProperty('roomingListId');
      expect(response.body.rfpName).toBe(newRoomingList.rfpName);
      expect(response.body.agreement_type).toBe(newRoomingList.agreement_type);
    });

    it('should require authentication for creating rooming list', async () => {
      const newRoomingList = {
        eventId: 1,
        hotelId: 101,
        rfpName: 'Test RFP 2',
        cutOffDate: '2024-06-01',
        status: 'Active',
        agreement_type: 'staff'
      };

      const response = await request(app)
        .post('/api/rooming-lists')
        .send(newRoomingList)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/rooming-lists/:id/bookings', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/rooming-lists/1/bookings')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return bookings for authenticated user', async () => {
      const response = await request(app)
        .get('/api/rooming-lists/1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 