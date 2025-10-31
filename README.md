# Cat Shelter Dashboard

A comprehensive stats dashboard for a Cat Shelter Adoption Center built with Node.js, Express, TypeScript, React, and PostgreSQL.

## Features

- **Real-time Dashboard**: Live metrics updates without page refresh
- **Role-based Access**: Three user roles (Super Admin, Clinic Staff, Public)
- **Comprehensive Metrics**: 
  - Total adoptions (monthly/yearly with historical data)
  - Cat availability overview (kittens, seniors, booked cats)
  - Incoming cats tracking (staff/admin only)
  - Medical procedures tracking (staff/admin only)
  - Live fundraising progress
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Interactive Charts**: Historical adoption data visualization
- **Authentication**: JWT-based login system
- **API Documentation**: Auto-generated Swagger documentation

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- Socket.IO for real-time updates
- JWT authentication
- Swagger API documentation

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls
- React Router for navigation

### Infrastructure
- Docker & Docker Compose
- PostgreSQL database
- Real-time WebSocket connections

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd cat-shelter-dashboard
   npm install
   ```

2. **Start with Docker**
   ```bash
   # Start all services
   npm run docker:up
   
   # Or start individually
   docker-compose up -d postgres
   docker-compose up -d backend
   docker-compose up -d frontend
   ```

3. **Seed the database**
   ```bash
   # Run the seeding script
   npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7000
   - API Documentation: http://localhost:7000/api-docs

### Development Setup

1. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL
   docker-compose up -d postgres
   
   # Run migrations
   cd backend
   npm run db:migrate
   
   # Seed data
   npm run seed
   ```

## Test Accounts

- **Super Admin**: `admin` / `admin`
- **Clinic Staff**: `staff` / `staff`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Metrics
- `GET /api/metrics/dashboard` - Dashboard metrics
- `GET /api/metrics/adoption-history` - Adoption history data

### Cats
- `GET /api/cats` - List all cats
- `GET /api/cats/:id` - Get cat by ID
- `POST /api/cats` - Create cat (staff/admin)
- `PUT /api/cats/:id` - Update cat (staff/admin)
- `DELETE /api/cats/:id` - Delete cat (admin only)

### Adoptions
- `GET /api/adoptions` - List adoptions
- `GET /api/adoptions/:id` - Get adoption by ID
- `POST /api/adoptions` - Create adoption
- `PUT /api/adoptions/:id` - Update adoption (staff/admin)
- `DELETE /api/adoptions/:id` - Delete adoption (admin only)

### Donations
- `GET /api/donations` - List donations (staff/admin)
- `GET /api/donations/:id` - Get donation by ID (staff/admin)
- `POST /api/donations` - Create donation
- `GET /api/donations/campaigns` - Get fundraising campaigns

## Database Schema

The database includes the following main tables:
- `users` - User accounts and roles
- `cats` - Cat information and status
- `adoptions` - Adoption records
- `medical_procedures` - Medical procedure tracking
- `donations` - Donation records
- `fundraising_campaigns` - Fundraising campaign data

## Real-time Updates

The dashboard uses WebSocket connections to provide real-time updates:
- Metrics refresh automatically every 30 seconds
- New data is pushed to connected clients
- No manual refresh required

## Role Permissions

### Public
- View basic dashboard metrics
- View available cats
- View fundraising progress

### Clinic Staff
- All public permissions
- View incoming cats metrics
- View medical procedures data
- Manage cats and adoptions

### Super Admin
- All permissions
- Full system access
- User management
- Complete data management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
