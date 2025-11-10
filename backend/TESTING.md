# Backend Testing Guide

## Overview

This document describes the unit test suite for the Cat Shelter Dashboard backend API.

## Test Coverage Summary

### ✅ Completed Test Suites

1. **Authentication Controller** (`authController.test.ts`)
   - Login with valid/invalid credentials
   - Registration with validation
   - JWT token generation
   - Password hashing

2. **Authentication Middleware** (`auth.test.ts`)
   - `authenticate` middleware (required auth)
   - `optionalAuthenticate` middleware (optional auth)
   - `authorize` middleware (role-based access)
   - Hierarchical permissions (super_admin > clinic_staff > public)

3. **Stats Controller** (`statsController.test.ts`)
   - Total adoptions with date filtering
   - Cats status with breakdown
   - Incoming cats (staff/admin only)
   - Neutered/spayed cats (staff/admin only)
   - Campaign information

4. **Donations Controller** (`donationsController.test.ts`)
   - Create donation
   - Get donations
   - Get donation by ID
   - Campaign updates on donation
   - Socket.IO event emission

5. **Cats Controller** (`catsController.test.ts`)
   - Get all cats (public)
   - Get cat by ID
   - Create cat (staff/admin)
   - Update cat (staff/admin)
   - Delete cat (super_admin)

6. **Adoptions Controller** (`adoptionsController.test.ts`)
   - Get all adoptions with user data
   - Get adoption by ID
   - Create adoption
   - Update adoption (staff/admin)
   - Delete adoption (super_admin)
   - Paired adoptions handling

7. **Error Handler** (`errorHandler.test.ts`)
   - Error status codes
   - Error messages
   - Stack traces (dev vs production)
   - Error formatting

## Running Tests

### Prerequisites

Install dependencies:
```bash
cd backend
npm install
```

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- authController.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

## Test Structure

### Test Helpers (`utils/test-helpers.ts`)

Provides:
- Mock request/response/next functions
- Test user fixtures (super_admin, clinic_staff, public)
- Test data fixtures (cats, adoptions, donations, campaigns)
- JWT token generation utilities
- Authenticated request builders

### Test Setup (`setup.ts`)

- Configures test environment
- Sets up test database URL
- Configures JWT secret for testing
- Optional console mocking

## Mocking Strategy

### Database (Drizzle ORM)

All database operations are mocked to:
- Keep tests fast (no actual DB connection)
- Make tests isolated
- Allow testing error scenarios easily

Example:
```typescript
(mockDb.select as jest.Mock).mockReturnValue({
  from: jest.fn().mockResolvedValue(mockData),
});
```

### Socket.IO

Socket.IO is mocked using global `io` object:
```typescript
const mockIo = { emit: jest.fn() };
(global as any).io = mockIo;
```

### JWT & Bcrypt

JWT and bcrypt are mocked to:
- Test authentication logic without actual hashing
- Control token generation for testing
- Speed up tests

## Test Patterns

### Testing Success Cases
```typescript
it('should successfully create resource', async () => {
  // Setup mocks
  // Call function
  // Assert response
  expect(mockResponse.json).toHaveBeenCalledWith(expectedData);
});
```

### Testing Error Cases
```typescript
it('should return 404 when resource not found', async () => {
  // Setup mocks to return empty
  // Call function
  // Assert error handler called
  expect(mockNext).toHaveBeenCalledWith(
    expect.objectContaining({ statusCode: 404 })
  );
});
```

### Testing Authorization
```typescript
it('should return 403 for unauthorized access', async () => {
  mockRequest.user = { id: 3, username: 'public', role: 'public' };
  // Call function
  expect(mockNext).toHaveBeenCalledWith(
    expect.objectContaining({ statusCode: 403 })
  );
});
```

## Coverage Goals

- **Target**: 80%+ code coverage
- **Focus Areas**:
  - All controller functions
  - All middleware functions
  - Error handling paths
  - Authorization logic
  - Data validation

## Future Test Additions

Potential areas for expansion:
- Integration tests with real database
- End-to-end API tests with Supertest
- Performance tests
- Load tests
- Socket.IO connection tests

## Notes

- Tests use mocked dependencies for speed and isolation
- No actual database connection required
- Tests can run in parallel
- All tests are independent (no shared state)

