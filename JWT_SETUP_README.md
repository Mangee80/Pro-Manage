# JWT Authentication Setup Guide

## Overview
This project now includes JWT (JSON Web Token) authentication for enhanced security and user session management.

## Features Implemented

### Server-Side
- ✅ JWT token generation (access + refresh tokens)
- ✅ Token verification middleware
- ✅ Protected API routes
- ✅ Automatic token refresh
- ✅ Secure logout with token invalidation
- ✅ User ownership verification for cards

### Client-Side
- ✅ Secure token storage
- ✅ Automatic token refresh
- ✅ Protected API requests
- ✅ Secure logout
- ✅ Error handling for authentication failures

## Environment Variables

Create a `.env` file in the server directory with:

```env
# MongoDB Connection
MONGODB_URL=your_mongodb_connection_string_here

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Server Port
PORT=9000
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout (requires auth)
- `GET /api/auth/profile` - Get user profile (requires auth)

### Protected Card Routes
All card routes now require JWT authentication:
- `GET /api/card/analytics` - Get user analytics
- `GET /api/card/getcards` - Get user cards
- `POST /api/card/createcards` - Create new card
- `PUT /api/card/updatetag/:id` - Update card tag
- `PUT /api/card/editcards/:id` - Edit card
- `PUT /api/card/updateChecklistItem/:cardId` - Update checklist
- `DELETE /api/card/deleteCard/:id` - Delete card

## How It Works

### 1. User Registration/Login
- User submits credentials
- Server validates and generates JWT tokens
- Access token (15 min) + Refresh token (7 days)
- Tokens stored securely in client

### 2. API Requests
- Client automatically includes JWT in Authorization header
- Server verifies token and extracts user info
- If token expired, client automatically refreshes
- Failed refresh redirects to login

### 3. Security Features
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh
- Secure logout with server-side token invalidation
- User ownership verification for all card operations

## Client Usage

### Import auth utilities
```javascript
import { apiRequest, logout, isAuthenticated } from '../utils/authUtils';
```

### Make authenticated API calls
```javascript
// Instead of fetch, use apiRequest
const response = await apiRequest('/api/card/analytics');
```

### Check authentication status
```javascript
if (isAuthenticated()) {
  // User is logged in
}
```

### Logout user
```javascript
await logout();
```

## Security Considerations

### For Production
1. **Change JWT secrets** - Use strong, unique secrets
2. **Use HTTPS** - Always in production
3. **Consider httpOnly cookies** - More secure than localStorage
4. **Implement rate limiting** - Prevent brute force attacks
5. **Add CORS restrictions** - Limit allowed origins
6. **Token expiration** - Consider shorter access token times

### Current Implementation
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on expiration
- Secure logout with token invalidation

## Testing

1. Start the server: `npm start` (in server directory)
2. Start the client: `npm start` (in client directory)
3. Register a new user
4. Login with credentials
5. Check browser dev tools for stored tokens
6. Test protected routes
7. Test logout functionality

## Troubleshooting

### Common Issues
1. **"Access token required"** - User not logged in
2. **"Invalid or expired token"** - Token expired, refresh needed
3. **"Token verification failed"** - Malformed token

### Debug Steps
1. Check browser localStorage for tokens
2. Verify token expiration in JWT payload
3. Check server logs for authentication errors
4. Ensure environment variables are set correctly

## Migration Notes

- Old `userID` localStorage still supported for backward compatibility
- All existing functionality preserved
- Enhanced security with JWT authentication
- Better error handling and user experience


