# 🏨 Rooming List Management System

A comprehensive full-stack application for managing hotel booking rooming lists with real-time data visualization, built with React, Node.js, and SQLite. This enterprise-grade solution provides intuitive management of rooming lists grouped by events with advanced filtering, search capabilities, and detailed booking management.

## 📸 Preview

The application follows a modern card-based design pattern with event grouping, matching the provided design specifications:

- **Event-grouped rooming lists** with horizontal scrollable cards
- **Clean, professional UI** with Tailwind CSS styling
- **Detailed booking modals** with comprehensive guest information
- **Real-time filtering and search** capabilities
- **Responsive design** for all device types

## ✨ Key Features

### 🎯 Core Functionality
- **📋 Rooming List Management**: Complete CRUD operations for rooming lists
- **🎪 Event-Based Organization**: Automatic grouping by events (Rolling Loud, Ultra Miami, etc.)
- **🏨 Booking Management**: Detailed booking tracking with guest information
- **🔍 Advanced Search & Filtering**: Real-time search with status-based filtering
- **📊 Data Visualization**: Beautiful modal displays for booking details
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🔐 Authentication & Security
- **JWT-based Authentication**: Secure token-based user sessions
- **Protected Routes**: Middleware-based route protection
- **Password Security**: bcrypt hashing for user credentials
- **Rate Limiting**: Development-friendly with production protection

### 🚀 Developer Experience
- **Hot Reload Development**: Instant code changes in development
- **Docker Support**: Complete containerized setup
- **JSON Data Loading**: Load data from external JSON files
- **Comprehensive Logging**: Detailed console logging for debugging
- **Health Checks**: Container and API health monitoring

## 🏗️ Architecture Overview

### Design Philosophy

Our architecture follows **separation of concerns** with a clear three-tier approach:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Application   │    │      Data       │
│      Layer      │◄──►│      Layer      │◄──►│      Layer      │
│                 │    │                 │    │                 │
│  React Frontend │    │ Node.js Backend │    │  SQLite Database│
│  - Components   │    │ - RESTful API   │    │  - Relational   │
│  - State Mgmt   │    │ - Business Logic│    │  - ACID Compliant│
│  - UI/UX        │    │ - Authentication│    │  - File-based   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Architectural Decisions

#### 1. **SQLite Over PostgreSQL**
- **Why**: Simplified deployment, no external database dependencies
- **Benefits**: Single-file database, ACID compliance, excellent for development
- **Trade-offs**: Suitable for moderate concurrent users, perfect for this use case

#### 2. **React Context + useReducer**
- **Why**: Predictable state management without Redux complexity
- **Benefits**: Built-in React patterns, excellent DevTools support
- **Implementation**: Centralized state with action-based mutations

#### 3. **JSON-File Data Loading**
- **Why**: External data source flexibility and easy data management
- **Benefits**: Version-controlled data, easy updates, staging environments
- **Implementation**: Runtime JSON parsing with comprehensive error handling

#### 4. **Component-Based Architecture**
```
App
├── Header (Authentication UI)
├── Dashboard (Main Container)
│   ├── FiltersAndSearch (Controls)
│   └── EventGroup (Event Grouping)
│       └── RoomingListCard (Individual Cards)
├── BookingsModal (Detailed View)
└── AuthModal (Login/Register)
```

### Database Schema

Our relational schema ensures data integrity with proper foreign key relationships:

```sql
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│    users    │    │     events      │    │   bookings  │
│─────────────│    │─────────────────│    │─────────────│
│ id (PK)     │    │ eventId (PK)    │    │ bookingId   │
│ username    │    │ eventName       │    │ hotelId     │
│ email       │    │ description     │    │ eventId (FK)│
│ password    │    │ created_at      │    │ guestName   │
│ created_at  │    └─────────────────┘    │ guestPhone  │
└─────────────┘                           │ checkIn     │
                                          │ checkOut    │
                                          │ created_at  │
                   ┌─────────────────┐    └─────────────┘
                   │ rooming_lists   │
                   │─────────────────│    ┌─────────────────────┐
                   │ roomingListId   │    │ rooming_list_bookings│
                   │ eventId (FK)    │◄──►│─────────────────────│
                   │ hotelId         │    │ id (PK)             │
                   │ rfpName         │    │ roomingListId (FK)  │
                   │ cutOffDate      │    │ bookingId (FK)      │
                   │ status          │    │ created_at          │
                   │ agreement_type  │    └─────────────────────┘
                   │ created_at      │
                   └─────────────────┘
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (with npm)
- **Git** for version control
- **Docker** (optional, for containerized setup)

### Option 1: Local Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd rooming-list-management-app

# 2. Install all dependencies
npm run install:all

# 3. Start development servers (runs both frontend and backend)
npm run dev
```

**Access your application:**
- 🌐 Frontend: http://localhost:3000
- ⚡ Backend API: http://localhost:3001
- 📖 API Health: http://localhost:3001/health

### Option 2: Docker Setup (Recommended)

```bash
# 1. Clone and navigate
git clone <repository-url>
cd rooming-list-management-app

# 2. Start with Docker Compose
npm run docker:up
# OR
docker-compose up --build

# 3. Stop when done
npm run docker:down
```

### First Steps After Setup

1. **Open** http://localhost:3000
2. **Register** a new account or **Login** with test credentials:
   - Username: `testuser`
   - Password: `password123`
3. **Load Sample Data** using the "Insert Bookings and Rooming Lists" button
4. **Explore** the rooming lists grouped by events
5. **Click "View Bookings"** to see detailed booking information in the modal

## 📋 Detailed Setup Instructions

### Manual Setup (Alternative)

**Backend Setup:**
```bash
cd backend
npm install
npm run dev  # Starts on port 3001
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm start    # Starts on port 3000
```

### Environment Configuration

**Backend Environment (Optional):**
Create `backend/.env`:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment (Optional):**
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 🐳 Docker Configuration

### Development Mode
Our Docker setup provides a complete development environment with hot-reload:

```yaml
# Simplified docker-compose structure
services:
  backend:
    - Hot-reload enabled
    - JSON files mounted from host
    - SQLite database persisted
    - Health checks configured
  
  frontend:
    - React dev server with hot-reload
    - Source code mounted for live changes
    - Optimized for development workflow
```

### Production Mode
```bash
# Build production images
docker-compose -f docker-compose.yml up --build --target production

# Features:
# - Nginx-served React build
# - Optimized Node.js backend
# - Security hardened containers
```

## 📊 Data Management

### JSON File Structure

The application loads data from three JSON files in the root directory:

**`rooming-lists.json`**: Core rooming list data
```json
[
  {
    "roomingListId": 1,
    "eventId": 1,
    "eventName": "Rolling Loud",
    "hotelId": 101,
    "rfpName": "ACL-2025",
    "cutOffDate": "2025-09-30",
    "status": "completed",
    "agreement_type": "leisure"
  }
]
```

**`bookings.json`**: Individual booking records
```json
[
  {
    "bookingId": 1,
    "hotelId": 101,
    "eventId": 1,
    "guestName": "John Doe",
    "guestPhoneNumber": "1234567890",
    "checkInDate": "2025-09-01",
    "checkOutDate": "2025-09-05"
  }
]
```

**`rooming-list-bookings.json`**: Relationship mapping
```json
[
  {
    "roomingListId": 1,
    "bookingId": 1
  }
]
```

### Data Loading Process

1. **Clear existing data** (maintains referential integrity)
2. **Extract unique events** from rooming lists
3. **Insert in dependency order**: Events → Bookings → Rooming Lists → Relationships
4. **Comprehensive error handling** with specific error messages

## 🔌 API Documentation

### Authentication Endpoints
```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
```

### Rooming Lists API
```bash
GET    /api/rooming-lists              # Get all rooming lists (with filtering)
GET    /api/rooming-lists/:id          # Get specific rooming list
GET    /api/rooming-lists/:id/bookings # Get bookings for rooming list
POST   /api/rooming-lists              # Create new rooming list
PUT    /api/rooming-lists/:id          # Update rooming list
DELETE /api/rooming-lists/:id          # Delete rooming list
```

### Events API
```bash
GET    /api/events                     # Get all events
GET    /api/events/:id                 # Get specific event
GET    /api/events/:id/rooming-lists   # Get rooming lists for event
POST   /api/events                     # Create new event
PUT    /api/events/:id                 # Update event
DELETE /api/events/:id                 # Delete event
```

### Bookings API
```bash
GET    /api/bookings                   # Get all bookings
GET    /api/bookings/:id               # Get specific booking
POST   /api/bookings                   # Create new booking
PUT    /api/bookings/:id               # Update booking
DELETE /api/bookings/:id               # Delete booking
```

### Data Management API
```bash
POST   /api/data/insert-sample-data    # Load data from JSON files
DELETE /api/data/clear-all             # Clear all data
```

### Query Parameters
```bash
# Filtering and Search
GET /api/rooming-lists?status=completed&search=ACL&sortBy=cutOffDate&sortOrder=desc
```

## 🎨 Frontend Architecture

### Component Hierarchy
```
📁 src/
├── 📄 App.js                    # Main application container
├── 📁 components/
│   ├── 📄 Header.js             # Navigation and auth buttons
│   ├── 📄 Dashboard.js          # Main dashboard container
│   ├── 📄 AuthModal.js          # Login/register modal
│   ├── 📄 BookingsModal.js      # Detailed booking display
│   ├── 📄 EventGroup.js         # Event grouping container
│   ├── 📄 RoomingListCard.js    # Individual rooming list card
│   └── 📄 FiltersAndSearch.js   # Search and filter controls
├── 📁 context/
│   └── 📄 AppContext.js         # Global state management
└── 📁 services/
    └── 📄 api.js                # API communication layer
```

### State Management Strategy

**Global State (React Context):**
- User authentication status
- Rooming lists data and filtering
- UI state (modals, loading states)
- Error handling and notifications

**Local Component State:**
- Form inputs and validation
- UI interactions (hover, focus)
- Temporary display states

### Key Design Patterns

1. **Container/Presentational Components**: Clear separation of logic and UI
2. **Custom Hooks**: Reusable stateful logic (`useCallback` for performance)
3. **Error Boundaries**: Graceful error handling and user feedback
4. **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🔧 Development Workflow

### Available Scripts

**Root Level Commands:**
```bash
npm run dev              # Start both frontend and backend
npm run install:all      # Install all dependencies
npm run docker:up        # Start with Docker
npm run docker:down      # Stop Docker containers
```

**Backend Commands:**
```bash
npm run dev              # Development with nodemon
npm start                # Production mode
npm test                 # Run Jest tests
```

**Frontend Commands:**
```bash
npm start                # Development server
npm run build            # Production build
npm test                 # Run React tests
```

### Code Quality Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (if configured)
- **Jest**: Unit testing framework
- **Supertest**: API testing

### Debugging

**Backend Debugging:**
- Comprehensive console logging with emojis for easy identification
- Health check endpoint: `GET /health`
- Database query logging in development mode

**Frontend Debugging:**
- React DevTools compatible
- Console logging for API calls and state changes
- Error boundaries for graceful error handling

## 🔐 Security Implementation

### Authentication Flow
```
1. User registers/logs in
2. Server validates credentials
3. JWT token issued with expiration
4. Token stored in localStorage
5. Token sent with each API request
6. Middleware validates token on protected routes
```

### Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Configurable secret and expiration
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries only
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: Production-ready abuse protection

## 🧪 Testing Strategy

### Backend Testing
```bash
cd backend
npm test                 # Run all tests
npm test -- --coverage  # With coverage report
```

**Test Coverage:**
- Authentication endpoints
- CRUD operations
- Data validation
- Error handling scenarios

### Frontend Testing
```bash
cd frontend
npm test                 # Run React tests
```

**Testing Approach:**
- Component rendering tests
- User interaction testing
- API integration tests
- State management testing

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secret
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure production database path
- [ ] Set up HTTPS certificates
- [ ] Configure reverse proxy (if needed)

### Docker Production Build
```bash
# Build production images
docker-compose build --target production

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Performance Optimizations
- **Frontend**: Code splitting, lazy loading, asset optimization
- **Backend**: Connection pooling, query optimization, caching headers
- **Database**: Proper indexing, query optimization

## 📈 Monitoring and Maintenance

### Health Checks
- **Backend**: `GET /health` endpoint with system status
- **Database**: Connection and table validation
- **Docker**: Built-in health check containers

### Logging Strategy
- **Development**: Detailed console logging with context
- **Production**: Structured logging with levels
- **Error Tracking**: Comprehensive error capture and reporting

## 🤝 Contributing

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting

### Reporting Issues
When reporting bugs, please include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Console logs or error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Pattern**: Based on provided rooming list management specifications
- **Technology Stack**: Built with modern, production-ready technologies
- **Architecture**: Follows industry best practices for maintainability and scalability

---

**Built with ❤️ as a comprehensive full-stack solution for rooming list management.**

For questions, issues, or feature requests, please refer to the issue tracker or contact the development team. 