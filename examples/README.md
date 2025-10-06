# Examples

This directory contains example implementations of the Adamus IAM Client in various scenarios.

## Available Examples

### 1. Node.js Example (`nodejs-example.ts`)

A standalone Node.js script demonstrating:
- Basic authentication
- User management
- Department management
- Position management
- Permission and role checking

**Run:**
```bash
ts-node examples/nodejs-example.ts
```

### 2. Express.js Example (`express-example.ts`)

A complete Express.js server with:
- Authentication middleware
- Permission-based route protection
- Role-based route protection
- RESTful API endpoints for users, departments, and positions

**Run:**
```bash
ts-node examples/express-example.ts
```

### 3. React Example (`react-example.tsx`)

A full React application showing:
- IAMProvider setup
- Login page
- Protected routes
- Permission-based UI rendering
- User management with hooks

**Setup:**
```bash
# This is a reference implementation
# Copy the code to your React project
```

## Prerequisites

Before running the examples, ensure you have:

1. An Adamus IAM service running
2. Valid credentials for authentication
3. Environment variables configured (see `.env.example`)

## Environment Setup

Create a `.env` file in the project root:

```env
IAM_BASE_URL=http://localhost:8000/api/v1
IAM_TIMEOUT=10000
IAM_VERIFY_SSL=true
```

## Running Examples

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run TypeScript Examples

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run Node.js example
ts-node examples/nodejs-example.ts

# Run Express.js example
ts-node examples/express-example.ts
```

## Customization

Feel free to modify these examples to fit your specific use case. They serve as starting points for integrating the IAM client into your applications.

## Additional Resources

- [Main README](../README.md) - Full API documentation
- [Installation Guide](../INSTALL.md) - Detailed installation instructions
- [TypeScript Types](../src/types.ts) - Type definitions

## Support

If you have questions about the examples or need help implementing the IAM client, please contact the Adamus development team.
