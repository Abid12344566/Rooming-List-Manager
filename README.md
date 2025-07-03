# 🏨 Rooming List Manager

A full-stack web application for managing rooming lists and bookings, built with React.js frontend and Node.js backend using PostgreSQL database.

## 🏗️ Architecture

```
Frontend: React.js + Tailwind CSS
Backend: Node.js + Express.js  
Database: PostgreSQL
API: RESTful endpoints
```

## 📋 Database Schema

### Tables Structure:

**Bookings Table:**
- `bookingId` - Unique identifier for each booking
- `hotelId` - ID of the hotel where the booking is made
- `eventId` - ID of the event associated with the booking
- `guestName` - Name of the guest making the booking
- `guestPhoneNumber` - Phone number of the guest
- `checkInDate` - Check-in date for the booking
- `checkOutDate` - Check-out date for the booking

**Rooming Lists Table:**
- `roomingListId` - Unique identifier for each rooming list
- `eventId` - ID of the event related to the rooming list
- `hotelId` - ID of the hotel associated with the rooming list
- `rfpName` - Name of the Request for Proposal
- `cutOffDate` - The cut-off date for the rooming list
- `status` - Current status ("Active", "Closed", "Cancelled")
- `agreement_type` - Type of agreement ("leisure", "staff", "artist")

**Rooming List Bookings Table (Junction):**
- `roomingListId` - Foreign key referencing rooming lists
- `bookingId` - Foreign key referencing bookings

### Relationships:
- A Rooming List can have many Bookings (via the Rooming List Bookings Table)
- Each Booking belongs to a Rooming List and is tied to an event

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js** (v18+ recommended)
2. **PostgreSQL** (v12+ recommended)
3. **npm** or **yarn**

### 1. PostgreSQL Database Setup

#### Option A: Local PostgreSQL Installation

1. Install PostgreSQL:
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql
   
   # macOS (using Homebrew)
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. Start PostgreSQL service:
   ```bash
   # Windows
   net start postgresql
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. Create database and user:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE rooming_list_db;
   
   # Create user (optional)
   CREATE USER rooming_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE rooming_list_db TO rooming_user;
   
   # Exit
   \q
   ```

#### Option B: Using Docker

```bash
# Run PostgreSQL in Docker
docker run --name postgres-rooming \
  -e POSTGRES_DB=rooming_list_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Environment Configuration

Create environment files:

**Backend (`backend/.env`):**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rooming_list_db
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Security (optional)
JWT_SECRET=your-super-secret-jwt-key
```

**Frontend (`frontend/.env`):**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Installation & Startup

1. **Install dependencies:**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Start the backend server:**
   ```bash
   cd backend
   npm start
   # Server will run on http://localhost:3001
   ```

3. **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   # Frontend will run on http://localhost:3000
   ```

4. **Access the application:**
   - Open your browser to http://localhost:3000
   - The backend API will be available at http://localhost:3001

## 🎯 Key Features

### ✅ Insert Bookings and Rooming Lists
- **Location**: Click the "Insert Bookings and Rooming Lists" button in the filters section
- **Functionality**: 
  - Clears all existing data from the database
  - Reads data from JSON files (`rooming-lists.json`, `bookings.json`, `rooming-list-bookings.json`)
  - Inserts data into PostgreSQL tables with proper relationships
  - Automatically refreshes the UI with new data

### ✅ Dynamic Rooming List Cards
- **Data Source**: Fetched dynamically from PostgreSQL database
- **Display Information**:
  - RFP Name
  - Status (Active/Closed/Cancelled)
  - Cut-off Date
  - Agreement Type (leisure/staff/artist)
  - Event Name
  - Hotel ID
  - Booking Count

### ✅ View Bookings Feature
- **Location**: "View Bookings" button on each rooming list card
- **Functionality**:
  - Fetches all bookings associated with the selected rooming list
  - **Logs booking details to browser console** (as required)
  - Shows booking information in both console and modal
  - Displays guest names, phone numbers, check-in/out dates

## 🔗 API Endpoints

### Rooming Lists
- `GET /api/rooming-lists` - Get all rooming lists
- `GET /api/rooming-lists/:id` - Get specific rooming list
- `GET /api/rooming-lists/:id/bookings` - Get bookings for rooming list
- `POST /api/rooming-lists` - Create new rooming list
- `PUT /api/rooming-lists/:id` - Update rooming list
- `DELETE /api/rooming-lists/:id` - Delete rooming list

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Data Management
- `POST /api/data/insert` - Clear and insert data from JSON files
- `DELETE /api/data/clear` - Clear all data
- `GET /api/data/status` - Get data status

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## 🧪 Testing the Application

1. **Start both servers** (backend on :3001, frontend on :3000)

2. **Insert sample data**:
   - Click "Insert Bookings and Rooming Lists" button
   - Wait for success message
   - Verify rooming list cards appear

3. **Test View Bookings**:
   - Click "View Bookings" button on any rooming list card
   - Check browser console for detailed booking logs
   - Verify modal shows booking information

4. **Verify data persistence**:
   - Refresh the page
   - Data should remain (stored in PostgreSQL)

## 📊 Console Logging

When clicking "View Bookings", the following information is logged to the browser console:
- RFP Name
- Event Name
- Hotel ID
- Total booking count
- Cut-off Date
- Agreement Type
- Status
- Detailed booking information in table format
- Individual booking details

## 🔧 Development Scripts

**Backend:**
```bash
npm start        # Start production server
npm run dev      # Start with nodemon (auto-restart)
npm test         # Run tests
```

**Frontend:**
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## 🐳 Docker Support

The project includes Docker configuration:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## 🔒 Authentication

Authentication is currently **optional**. The application works without login, but authentication endpoints are available for future use:
- `POST /api/auth/login`
- `POST /api/auth/register`

## 📁 Project Structure

```
rooming-list-manager/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL configuration
│   │   └── routes/
│   │       ├── roomingLists.js      # Rooming list endpoints
│   │       ├── bookings.js          # Booking endpoints
│   │       ├── data.js              # Data management
│   │       └── events.js            # Event endpoints
│   ├── middleware/
│   └── server.js                # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── RoomingListCard.js # Individual cards
│   │   │   └── FiltersAndSearch.js # Insert button
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   └── context/
│   │       └── AppContext.js    # State management
├── rooming-lists.json           # Sample rooming lists data
├── bookings.json                # Sample bookings data
├── rooming-list-bookings.json   # Sample relationships data
└── README.md
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
psql -U postgres -l

# Test connection
psql -U postgres -d rooming_list_db -c "SELECT NOW();"
```

### Port Conflicts
- Backend default: 3001
- Frontend default: 3000
- PostgreSQL default: 5432

### Common Issues
1. **"ECONNREFUSED"** - PostgreSQL not running
2. **"Database does not exist"** - Create database first
3. **"permission denied"** - Check PostgreSQL user permissions
4. **JSON file not found** - Ensure JSON files are in project root

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

---

## 🎯 Assessment Requirements Fulfilled

✅ **PostgreSQL Database**: Set up with proper tables and relationships  
✅ **RESTful API**: Node.js Express endpoints following REST standards  
✅ **Insert Button**: Clears data and loads from JSON files  
✅ **Dynamic Cards**: Rooming lists fetched from database  
✅ **View Bookings**: Logs to console and shows in modal  
✅ **Proper Relationships**: Junction table linking rooming lists to bookings 