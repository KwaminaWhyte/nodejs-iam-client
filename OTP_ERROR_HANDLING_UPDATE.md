# Node.js IAM Client - OTP Error Handling Update

## Overview
Updated the Node.js IAM client to match the improved error handling from the Laravel IAM client, ensuring consistent error messages across all client libraries.

## Changes Made

### 1. Enhanced `handleError` Method

**Location:** `src/IAMClient.ts` (lines 571-618)

#### New Features

1. **`preferDetailedMessage` Parameter**
   - Added optional boolean parameter to prioritize field-specific error messages
   - When `true`, extracts the first field error (e.g., phone or OTP validation errors)
   - Provides more user-friendly, actionable error messages

2. **Improved Error Extraction Logic**
   ```typescript
   // For OTP and auth errors, prefer the detailed field-specific error message
   if (preferDetailedMessage && errorData.errors) {
     const firstFieldErrors = Object.values(errorData.errors)[0];
     if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
       errorMessage = firstFieldErrors[0];
     }
   }
   ```

3. **Enhanced Error Object**
   - Attaches full error data for programmatic access
   - Includes HTTP status code
   ```typescript
   const err = new Error(errorMessage);
   (err as any).data = errorData;
   (err as any).statusCode = axiosError.response?.status;
   ```

### 2. Updated OTP Methods

All OTP-related methods now use `preferDetailedMessage: true` for better error feedback:

#### `sendOtp()`
```typescript
async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  try {
    const response = await this.client.post<SendOtpResponse>('/auth/send-otp', request);
    return response.data;
  } catch (error) {
    // Extract detailed error message for better user feedback
    throw this.handleError(error, 'Failed to send OTP', true);
  }
}
```

#### `loginWithPhone()`
```typescript
async loginWithPhone(credentials: PhoneLoginCredentials): Promise<LoginResponse> {
  try {
    // ... login logic
  } catch (error) {
    // Extract detailed error message for better user feedback
    throw this.handleError(error, 'Phone login failed', true);
  }
}
```

#### `verifyPhone()`
```typescript
async verifyPhone(phone: string): Promise<SendOtpResponse> {
  try {
    // ... verification logic
  } catch (error) {
    // Extract detailed error message for better user feedback
    throw this.handleError(error, 'Failed to send phone verification OTP', true);
  }
}
```

#### `confirmPhoneVerification()`
```typescript
async confirmPhoneVerification(phone: string, otp: string): Promise<PhoneVerificationResponse> {
  try {
    // ... confirmation logic
  } catch (error) {
    // Extract detailed error message for better user feedback
    throw this.handleError(error, 'Failed to confirm phone verification', true);
  }
}
```

## Error Message Examples

### Before
```typescript
// Generic error message
throw new Error('Failed to send OTP');
```

### After
```typescript
// Detailed, user-friendly error message from IAM server
throw new Error('This phone number is not registered. Please contact your administrator or use email login.');
```

## Benefits

### 1. **Consistency Across Clients**
- Node.js client now matches Laravel client behavior
- Same error messages across PHP and JavaScript implementations
- Unified user experience

### 2. **Better User Experience**
- Clear, actionable error messages
- Users know exactly what went wrong
- Guidance on how to resolve issues

### 3. **Programmatic Access**
- Error objects include full error data
- HTTP status codes attached
- Enables custom error handling in applications

### 4. **Backward Compatible**
- Existing error handling still works
- New parameter is optional
- No breaking changes

## Usage Examples

### Basic Error Handling
```typescript
import { IAMClient } from '@adamus/nodejs-iam-client';

const client = new IAMClient({
  baseUrl: 'http://127.0.0.1:8001/api/v1',
});

try {
  await client.sendOtp({
    phone: '+233999999999',
    purpose: 'login',
  });
} catch (error) {
  console.error(error.message);
  // Output: "This phone number is not registered. Please contact your administrator or use email login."
}
```

### Advanced Error Handling
```typescript
try {
  await client.loginWithPhone({
    phone: '+233248048753',
    otp: '000000',
  });
} catch (error: any) {
  console.error('Error:', error.message);
  console.error('Status Code:', error.statusCode);
  console.error('Full Error Data:', error.data);
  
  // Custom handling based on error type
  if (error.data?.errors?.phone) {
    // Handle phone number errors
    showPhoneError(error.data.errors.phone[0]);
  } else if (error.data?.errors?.otp) {
    // Handle OTP errors
    showOtpError(error.data.errors.otp[0]);
  }
}
```

### React Example
```tsx
import { useState } from 'react';
import { IAMClient } from '@adamus/nodejs-iam-client';

function LoginWithPhone() {
  const [error, setError] = useState<string | null>(null);
  
  const handleSendOtp = async (phone: string) => {
    try {
      setError(null);
      await client.sendOtp({ phone, purpose: 'login' });
      // Show success message
    } catch (err: any) {
      // Display the detailed error message
      setError(err.message);
    }
  };
  
  return (
    <div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {/* Form fields */}
    </div>
  );
}
```

### Express.js Example
```typescript
import express from 'express';
import { IAMClient } from '@adamus/nodejs-iam-client';

const app = express();
const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL!,
});

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const result = await iamClient.sendOtp({
      phone: req.body.phone,
      purpose: 'login',
    });
    
    res.json(result);
  } catch (error: any) {
    // Return detailed error message to client
    res.status(error.statusCode || 500).json({
      message: error.message,
      errors: error.data?.errors,
    });
  }
});
```

## Testing

### Test 1: Unregistered Phone Number
```typescript
const client = new IAMClient({ baseUrl: 'http://127.0.0.1:8001/api/v1' });

try {
  await client.sendOtp({
    phone: '+233999999999',
    purpose: 'login',
  });
} catch (error: any) {
  console.log(error.message);
  // Expected: "This phone number is not registered. Please contact your administrator or use email login."
}
```

### Test 2: Invalid OTP
```typescript
try {
  await client.loginWithPhone({
    phone: '+233248048753',
    otp: '000000',
  });
} catch (error: any) {
  console.log(error.message);
  // Expected: "Invalid or expired OTP. Please request a new code and try again."
}
```

### Test 3: Account Locked
```typescript
try {
  await client.loginWithPhone({
    phone: '+233248048753',
    otp: '123456',
  });
} catch (error: any) {
  console.log(error.message);
  // Expected: "Your account has been temporarily locked due to security reasons. Please contact your administrator."
}
```

## Migration Guide

### No Breaking Changes
The update is fully backward compatible. Existing code will continue to work without modifications.

### Optional Enhancement
To take advantage of the improved error messages, no code changes are required. The client automatically uses detailed messages for OTP-related operations.

### Custom Error Handling (Optional)
If you want to access the full error data:

```typescript
try {
  await client.sendOtp({ phone, purpose: 'login' });
} catch (error: any) {
  // Access detailed error information
  const errorMessage = error.message;
  const statusCode = error.statusCode;
  const errorData = error.data;
  
  // Custom handling based on your needs
}
```

## Comparison with Laravel Client

Both clients now provide identical error handling:

| Feature | Laravel Client | Node.js Client |
|---------|---------------|----------------|
| Detailed error extraction | ✅ | ✅ |
| Field-specific errors | ✅ | ✅ |
| Status code attachment | ✅ | ✅ |
| Full error data access | ✅ | ✅ |
| User-friendly messages | ✅ | ✅ |
| Backward compatible | ✅ | ✅ |

## Files Modified

- `/home/kwamina/Desktop/adamus/packages/adamus/nodejs-iam-client/src/IAMClient.ts`

## Recommendations

### Frontend Applications

1. **Display Error Messages Directly**
   ```tsx
   {error && <div className="error">{error}</div>}
   ```

2. **Provide Alternative Actions**
   ```tsx
   {error?.includes('not registered') && (
     <Link to="/login">Try email login instead</Link>
   )}
   ```

3. **Add Support Links**
   ```tsx
   {error?.includes('administrator') && (
     <a href="mailto:support@example.com">Contact Support</a>
   )}
   ```

### Backend Applications

1. **Log Detailed Errors**
   ```typescript
   catch (error: any) {
     logger.error('OTP send failed', {
       message: error.message,
       statusCode: error.statusCode,
       data: error.data,
     });
   }
   ```

2. **Return Structured Errors**
   ```typescript
   res.status(error.statusCode || 500).json({
     message: error.message,
     errors: error.data?.errors,
   });
   ```

## Conclusion

The Node.js IAM client has been updated to provide:
- ✅ Detailed, user-friendly error messages
- ✅ Consistency with Laravel client
- ✅ Better developer experience
- ✅ Enhanced error handling capabilities
- ✅ Full backward compatibility

These improvements ensure a consistent experience across all client libraries while maintaining ease of use and flexibility.
