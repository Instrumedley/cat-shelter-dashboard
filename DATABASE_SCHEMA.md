# Database Schema Documentation

## Overview
The Cat Shelter Dashboard uses PostgreSQL with a well-structured schema designed to support all the required metrics and functionality.

## Tables

### 1. Users Table
**Purpose**: Store user accounts and role-based access control

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | varchar(100) | User's full name (NOT NULL) |
| username | varchar(50) | Unique username (NOT NULL) |
| password | varchar(255) | Hashed password (NOT NULL) |
| email | varchar(255) | User's email address (NOT NULL) |
| phone | varchar(20) | User's phone number (NOT NULL) |
| role | enum | User role: super_admin, clinic_staff, public (default: public) |
| created_at | timestamp | Account creation date |
| updated_at | timestamp | Last update date |

**Relationships**: One-to-many with adoptions (optional - staff/admin users may not have adoptions)

### 2. Cats Table
**Purpose**: Store information about all cats in the shelter

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | varchar(100) | Cat's name |
| age | integer | Age in years |
| age_group | enum | kitten, adult, senior |
| gender | enum | male, female |
| breed | varchar(100) | Cat breed |
| color | varchar(50) | Cat color |
| status | enum | available, booked, adopted, deceased |
| description | text | Cat description |
| image_url | varchar(500) | Profile image URL |
| entry_date | timestamp | When cat entered shelter |
| entry_type | enum | rescue, surrender, stray |
| is_neutered_or_spayed | boolean | Combined neutering/spaying status (default: false) |
| is_booked | boolean | Booked for visitation (default: false) |
| is_adopted | boolean | Adoption status (default: false) |
| medical_notes | text | Medical information |
| created_at | timestamp | Record creation date |
| updated_at | timestamp | Last update date |

**Relationships**: One-to-many with adoptions, one-to-many with medical_procedures

### 3. Adoptions Table
**Purpose**: Track adoption records and status

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| cat_id | integer | Foreign key to cats table |
| user_id | integer | Foreign key to users table (adopter) |
| adopted_with | integer | Foreign key to cats table (for paired adoptions) |
| status | enum | pending, approved, completed, cancelled |
| adoption_date | timestamp | When adoption was completed |
| notes | text | Additional notes |
| created_at | timestamp | Record creation date |
| updated_at | timestamp | Last update date |

**Relationships**: Many-to-one with cats, many-to-one with users, many-to-one with cats (adopted_with)

### 4. Medical Procedures Table
**Purpose**: Track medical procedures performed on cats

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| cat_id | integer | Foreign key to cats table |
| procedure_type | enum | neutered, spayed, vaccinated, dewormed |
| procedure_date | timestamp | When procedure was performed |
| veterinarian | varchar(100) | Veterinarian name |
| notes | text | Procedure notes |
| cost | decimal(10,2) | Procedure cost |
| created_at | timestamp | Record creation date |

**Relationships**: Many-to-one with cats

### 5. Donations Table
**Purpose**: Track donations received

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| donor_name | varchar(100) | Donor name (nullable) |
| donor_email | varchar(255) | Donor email (nullable) |
| amount | decimal(10,2) | Donation amount |
| currency | varchar(3) | Currency code (default: SEK) |
| is_anonymous | boolean | Anonymous donation flag |
| notes | text | Donation notes |
| created_at | timestamp | Donation date |

### 6. Fundraising Campaigns Table
**Purpose**: Track fundraising campaigns and progress

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| title | varchar(200) | Campaign title |
| description | text | Campaign description |
| target_amount | decimal(10,2) | Target amount |
| current_amount | decimal(10,2) | Current raised amount |
| currency | varchar(3) | Currency code (default: SEK) |
| is_active | boolean | Campaign active status |
| start_date | timestamp | Campaign start date |
| end_date | timestamp | Campaign end date (nullable) |
| created_at | timestamp | Campaign creation date |
| updated_at | timestamp | Last update date |

## Enums

### User Role Enum
- `super_admin`: Full system access
- `clinic_staff`: Staff-level access (includes public permissions)
- `public`: Basic public access

### Cat Status Enum
- `available`: Ready for adoption
- `booked`: In adoption process
- `adopted`: Successfully adopted
- `deceased`: No longer available

### Cat Age Group Enum
- `kitten`: 0-1 years
- `adult`: 1-7 years
- `senior`: 7+ years

### Cat Gender Enum
- `male`: Male cat
- `female`: Female cat

### Adoption Status Enum
- `pending`: Awaiting approval
- `approved`: Approved but not completed
- `completed`: Successfully completed
- `cancelled`: Cancelled adoption

### Entry Type Enum
- `rescue`: Rescued from the street
- `surrender`: Surrendered by owner
- `stray`: Found stray

### Medical Procedure Enum
- `neutered`: Neutering procedure
- `spayed`: Spaying procedure
- `vaccinated`: Vaccination
- `dewormed`: Deworming treatment

## Key Relationships

1. **Users → Adoptions**: One user can have multiple adoptions (optional - staff/admin users typically don't adopt)
2. **Cats → Adoptions**: One cat can have multiple adoption attempts
3. **Cats → Medical Procedures**: One cat can have multiple medical procedures
4. **Cats → Cats (adopted_with)**: Cats can be adopted together (paired adoptions)
5. **Hierarchical Role System**: 
   - Super Admin inherits all permissions
   - Clinic Staff inherits Public permissions
   - Public has basic read-only access

## Indexes and Performance

- Primary keys on all tables
- Unique index on username
- Foreign key indexes on cat_id, user_id
- Composite indexes on frequently queried columns (status, dates)
- Partial indexes for active records

## Data Integrity

- Foreign key constraints ensure referential integrity
- Check constraints on numeric values
- Not null constraints on required fields
- Default values for optional fields
- Enum constraints for controlled vocabularies

## Scalability Considerations

- Efficient indexing strategy
- Normalized design to reduce redundancy
- Partitioning potential for large tables (adoptions, medical_procedures)
- Archive strategy for historical data
- Soft deletes where appropriate

This schema supports all the required dashboard metrics while maintaining data integrity and performance.
