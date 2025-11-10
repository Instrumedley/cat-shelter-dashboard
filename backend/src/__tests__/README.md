# Backend Unit Tests

This directory contains unit tests for the Cat Shelter Dashboard backend API.

## Test Structure

```
__tests__/
├── setup.ts                    # Test configuration and setup
├── utils/
│   └── test-helpers.ts        # Test utilities and fixtures
├── controllers/
│   ├── authController.test.ts
│   ├── statsController.test.ts
│   ├── donationsController.test.ts
│   ├── catsController.test.ts
│   └── adoptionsController.test.ts
└── middleware/
    ├── auth.test.ts
    └── errorHandler.test.ts
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- authController.test.ts
```

## Test Coverage

The tests cover:

- **Authentication & Authorization**
  - Login/Registration
  - JWT token generation
  - Role-based access control
  - Optional authentication middleware

- **Stats/Dashboard Endpoints**
  - Total adoptions with date filtering
  - Cats status with breakdown
  - Incoming cats (staff/admin only)
  - Neutered/spayed cats (staff/admin only)
  - Campaign information

- **Donations**
  - Create donation
  - Get donations
  - Campaign updates
  - Socket.IO event emission

- **Cats Management**
  - CRUD operations
  - Public vs staff/admin access

- **Adoptions**
  - CRUD operations
  - User data joins
  - Paired adoptions

- **Error Handling**
  - Error middleware
  - Status codes
  - Error messages

## Test Database

Tests use mocked database queries to keep them fast and isolated. No actual database connection is required for unit tests.

## Notes

- All tests use Jest mocking for database operations
- Socket.IO is mocked for donation tests
- Test fixtures are provided in `test-helpers.ts`
- Tests are designed to be independent and can run in any order

