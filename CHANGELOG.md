# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-11-23

## [1.2.2] - 2025-11-07

### Fixed

- Unwrap nested data in `getUsers()` response to return array of users directly

## [1.1.0] - 2025-10-30

### Added

- **Feature Parity with Laravel IAM Client**: Added missing methods to match Laravel client v1.1.0
- `verifySession()`: Verify session with IAM using session cookie for cross-service authentication
- `searchDepartments()`: Search departments by name/description (unprotected endpoint)
- `searchPositions()`: Search positions by title/description (unprotected endpoint)

### Documentation

- Added API documentation for new methods
- Updated README with usage examples for new endpoints
- Updated changelog with detailed version history

## [1.0.5] - 2025-10-08

### Changed

- **BREAKING**: Phone number format changed to local Ghana format (10 digits starting with 0, e.g., "0248048753")
- **BREAKING**: OTP length changed from 6 digits to 4 digits
- Updated JSDoc comments with phone format examples
- Updated README with phone/OTP authentication examples

### Documentation

- Added comprehensive JSDoc comments for phone/OTP methods
- Added phone/OTP authentication section to README
- Documented phone format: 10-digit number starting with 0
- Documented OTP format: 4-digit code

## [1.0.4] - 2025-10-07

- Add phone number login and OTP verification

## [1.0.0] - 2025-10-06

### Added

- Initial release of Adamus IAM Client for Node.js/TypeScript
- Core IAMClient class with full authentication support
- JWT token management with automatic token handling
- User management (CRUD operations)
- Department management (CRUD operations)
- Position management (CRUD operations)
- Permission and role checking
- React integration with IAMProvider context
- React hooks: useIAM, usePermission, useRole, useUsers, useUser, useDepartments, usePositions
- ProtectedRoute component for route protection
- TypeScript support with full type definitions
- Comprehensive documentation and examples
- Support for Express.js, Next.js, and other Node.js frameworks
