# Installation Guide

This guide will help you install and configure the Adamus IAM Client in your Node.js or React.js project.

## Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- An Adamus IAM service URL

## Installation

### Using npm

```bash
npm install @adamus/iam-client
```

### Using yarn

```bash
yarn add @adamus/iam-client
```

## Configuration

### 1. Environment Variables

Create a `.env` file in your project root:

#### For React Applications

```env
REACT_APP_IAM_BASE_URL=http://your-iam-service.com/api/v1
REACT_APP_IAM_TIMEOUT=10000
REACT_APP_IAM_VERIFY_SSL=true
```

#### For Node.js Backend Applications

```env
IAM_BASE_URL=http://your-iam-service.com/api/v1
IAM_TIMEOUT=10000
IAM_VERIFY_SSL=true
```

### 2. TypeScript Configuration (Optional)

If you're using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react" // For React projects
  }
}
```

## Quick Setup

### Node.js/Backend Setup

```typescript
import { IAMClient } from '@adamus/iam-client';

const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL!,
  timeout: 10000,
  verifySSL: true,
});

// Use the client
async function authenticate() {
  const response = await iamClient.login({
    email: 'user@example.com',
    password: 'password',
  });
  console.log('Logged in:', response.user);
}
```

### React Setup

#### Step 1: Wrap your app with IAMProvider

```tsx
// index.tsx or App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { IAMProvider } from '@adamus/iam-client';
import App from './App';

const iamConfig = {
  baseUrl: process.env.REACT_APP_IAM_BASE_URL!,
  timeout: 10000,
  verifySSL: true,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IAMProvider config={iamConfig}>
      <App />
    </IAMProvider>
  </React.StrictMode>
);
```

#### Step 2: Use the IAM hook in your components

```tsx
import { useIAM } from '@adamus/iam-client';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useIAM();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Verification

To verify the installation is working:

### Node.js

```typescript
import { IAMClient } from '@adamus/iam-client';

const client = new IAMClient({
  baseUrl: 'http://your-iam-service.com/api/v1',
});

console.log('IAM Client initialized successfully');
```

### React

```tsx
import { useIAM } from '@adamus/iam-client';

function TestComponent() {
  const { client } = useIAM();
  console.log('IAM Client available:', !!client);
  return <div>IAM Client Ready</div>;
}
```

## Troubleshooting

### Common Issues

#### 1. Module not found error

**Problem:** `Cannot find module '@adamus/iam-client'`

**Solution:** Ensure the package is installed:
```bash
npm install @adamus/iam-client
# or
yarn add @adamus/iam-client
```

#### 2. TypeScript errors

**Problem:** TypeScript cannot find type definitions

**Solution:** The package includes TypeScript definitions. Ensure your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

#### 3. React context error

**Problem:** `useIAM must be used within an IAMProvider`

**Solution:** Ensure your component is wrapped with `IAMProvider`:
```tsx
<IAMProvider config={iamConfig}>
  <YourComponent />
</IAMProvider>
```

#### 4. CORS errors

**Problem:** Network requests are blocked by CORS

**Solution:** Configure CORS on your IAM service to allow requests from your application's domain.

#### 5. SSL certificate errors

**Problem:** SSL certificate verification fails

**Solution:** For development only, you can disable SSL verification:
```typescript
const config = {
  baseUrl: 'https://your-iam-service.com/api/v1',
  verifySSL: false, // Only for development!
};
```

## Next Steps

- Read the [README.md](README.md) for full API documentation
- Check out the [examples](examples/) directory for complete examples
- Review the [CHANGELOG.md](CHANGELOG.md) for version history

## Support

If you encounter any issues during installation, please contact the Adamus development team or check the project repository for known issues.
