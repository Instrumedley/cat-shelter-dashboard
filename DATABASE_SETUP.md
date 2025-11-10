# Database Setup and Seeding Guide

## Database Configuration

The PostgreSQL database is configured to run on **port 5434** (external) to avoid conflicts with other databases on port 5432.

### Connection Details
- **Host**: `localhost`
- **Port**: `5434` (external), `5432` (internal Docker)
- **Database**: `cat_shelter`
- **Username**: `postgres`
- **Password**: `postgres`

## Step 1: Start the Database

### Using Docker Compose (Recommended)

```bash
# Start only the PostgreSQL container
docker-compose up -d postgres

# Or start all services
docker-compose up -d
```

### Verify Database is Running

```bash
# Check if container is running
docker ps | grep cat_shelter_db

# Check logs
docker logs cat_shelter_db
```

## Step 2: Run Database Migrations

Before seeding, you need to create the database schema:

```bash
cd backend

# Generate migrations from schema
npm run db:generate

# Run migrations
npm run db:migrate
```

## Step 3: Seed the Database

Run the seeding script to populate the database with test data:

```bash
# From the project root
npm run seed

# Or from the backend directory
cd backend
npm run seed
```

### What Gets Seeded

The seeding script creates:
- **2 admin users**: `admin/admin` (super_admin) and `staff/staff` (clinic_staff)
- **20 adopter users**: For testing adoptions
- **1000+ cats**: Spread across 2 years with various statuses
- **300+ adoptions**: Historical adoption records
- **500+ medical procedures**: Neutering, spaying, vaccinations, etc.
- **200+ donations**: Donation records
- **2 fundraising campaigns**: Active campaigns with progress

### Expected Output

```
🌱 Starting database seeding...
Creating users...
Creating adopter users...
Creating cats...
Creating adoptions...
Creating medical procedures...
Creating donations...
Creating fundraising campaigns...
✅ Database seeding completed successfully!
📊 Created:
   - 22 users (admin/admin, staff/staff, 20 adopters)
   - 1000 cats
   - 300 adoptions
   - 500 medical procedures
   - 200 donations
   - 2 fundraising campaigns
🎉 Seeding process completed!
```

## Step 4: Connect to Database with pgAdmin

### Option A: Using pgAdmin Desktop Application

1. **Open pgAdmin** (install from https://www.pgadmin.org/ if needed)

2. **Add New Server**:
   - Right-click on "Servers" in the left panel
   - Select "Create" → "Server..."

3. **General Tab**:
   - **Name**: `Cat Shelter Database` (or any name you prefer)

4. **Connection Tab**:
   - **Host name/address**: `localhost`
   - **Port**: `5434`
   - **Maintenance database**: `cat_shelter`
   - **Username**: `postgres`
   - **Password**: `postgres`
   - ✅ Check "Save password" (optional)

5. **Click "Save"**

6. **Navigate the Database**:
   - Expand `Servers` → `Cat Shelter Database` → `Databases` → `cat_shelter` → `Schemas` → `public` → `Tables`
   - You should see all tables: `users`, `cats`, `adoptions`, `medical_procedures`, `donations`, `fundraising_campaigns`

### Option B: Using pgAdmin Web Interface

If you're using pgAdmin in a web browser:

1. Access pgAdmin web interface (usually `http://localhost:5050` or your configured URL)

2. Follow the same steps as Option A, using:
   - **Host**: `host.docker.internal` (if pgAdmin is in Docker) or `localhost`
   - **Port**: `5434`

### Option C: Direct Connection String

You can also use any PostgreSQL client with this connection string:

```
postgresql://postgres:postgres@localhost:5434/cat_shelter
```

## Step 5: Verify Data in pgAdmin

### Quick Queries to Test

1. **Check Users**:
   ```sql
   SELECT id, name, username, email, role FROM users LIMIT 10;
   ```

2. **Check Cats**:
   ```sql
   SELECT id, name, age, gender, status, age_group FROM cats LIMIT 10;
   ```

3. **Check Adoptions**:
   ```sql
   SELECT a.id, c.name as cat_name, u.name as adopter_name, a.status, a.adoption_date 
   FROM adoptions a
   JOIN cats c ON a.cat_id = c.id
   JOIN users u ON a.user_id = u.id
   LIMIT 10;
   ```

4. **Check Metrics**:
   ```sql
   -- Total adoptions this month
   SELECT COUNT(*) as adoptions_this_month
   FROM adoptions
   WHERE status = 'completed'
   AND adoption_date >= date_trunc('month', CURRENT_DATE);
   ```

## Troubleshooting

### Database Connection Issues

If you can't connect:

1. **Check if container is running**:
   ```bash
   docker ps | grep cat_shelter_db
   ```

2. **Check port mapping**:
   ```bash
   docker port cat_shelter_db
   # Should show: 5432/tcp -> 0.0.0.0:5434
   ```

3. **Check logs for errors**:
   ```bash
   docker logs cat_shelter_db
   ```

4. **Restart the container**:
   ```bash
   docker-compose restart postgres
   ```

### Seeding Issues

If seeding fails:

1. **Ensure database is running**:
   ```bash
   docker-compose up -d postgres
   ```

2. **Check database connection**:
   ```bash
   cd backend
   npm run db:migrate
   ```

3. **Clear and reseed** (⚠️ This will delete all data):
   ```bash
   # Stop containers
   docker-compose down
   
   # Remove volume (deletes all data)
   docker volume rm bambuser_postgres_data
   
   # Start fresh
   docker-compose up -d postgres
   npm run db:migrate
   npm run seed
   ```

## Environment Variables

If you need to customize the connection, set these environment variables:

```bash
# In backend/.env or docker-compose.yml
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/cat_shelter
```

## Useful Commands

```bash
# View database logs
docker logs -f cat_shelter_db

# Access PostgreSQL CLI directly
docker exec -it cat_shelter_db psql -U postgres -d cat_shelter

# Stop database
docker-compose stop postgres

# Remove database (⚠️ deletes all data)
docker-compose down -v
```

## Next Steps

After seeding, you can:
1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Access the dashboard at `http://localhost:3001`
4. View API docs at `http://localhost:7000/api-docs`
