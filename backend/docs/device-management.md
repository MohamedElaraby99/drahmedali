# Device Management System

## Overview
The device management system restricts user access to a maximum of 2 devices per account. This helps prevent account sharing and maintains platform security.

## Features

### Backend
- **Device Tracking Model**: Stores device fingerprints and information
- **Device Fingerprinting**: Generates unique identifiers based on browser, OS, IP, screen resolution, etc.
- **Authentication Middleware**: Checks device authorization on protected routes
- **Admin APIs**: Full CRUD operations for device management

### Frontend
- **Device Protection Component**: Automatically registers and checks devices
- **Admin Dashboard**: View and manage user devices
- **Real-time Device Verification**: Checks device authorization on app load

## How It Works

### 1. User Login Process
1. User logs in with credentials
2. System generates device fingerprint
3. If device is new:
   - Check if user has < 2 devices
   - If yes: Register device
   - If no: Block access
4. If device exists: Allow access

### 2. Device Fingerprinting
The system uses multiple factors to create a unique device fingerprint:
- User Agent
- Screen Resolution
- Timezone
- Platform (Mobile/Desktop/Tablet)
- Browser Information
- IP Address
- Language Settings
- WebGL Information

### 3. Admin Controls
Admins can:
- View all users and their devices
- See device statistics
- Reset user devices (removes all devices)
- Deactivate specific devices
- Monitor device usage patterns

## API Endpoints

### User Endpoints
- `POST /api/v1/device-management/register` - Register new device
- `POST /api/v1/device-management/check-authorization` - Check device authorization

### Admin Endpoints
- `GET /api/v1/device-management/users` - Get all users with device info
- `GET /api/v1/device-management/users/:userId/devices` - Get user devices
- `PUT /api/v1/device-management/users/:userId/reset` - Reset user devices
- `DELETE /api/v1/device-management/devices/:deviceId` - Remove specific device
- `GET /api/v1/device-management/stats` - Get device statistics

## Frontend Routes
- `/admin/device-management` - Admin device management dashboard

## Security Features
- Device fingerprints are hashed for security
- Admin-only access for device management
- Automatic device checking on protected routes
- Graceful fallback if device checking fails

## Configuration
- Maximum devices per user: 2 (configurable in controller)
- Device fingerprint includes multiple factors for accuracy
- Admins bypass device restrictions

## Error Handling
- `DEVICE_LIMIT_EXCEEDED`: User has reached maximum device limit
- `DEVICE_NOT_AUTHORIZED`: Device not registered or deactivated
- Graceful fallback for system errors

## Database Schema

### UserDevice Model
```javascript
{
  user: ObjectId,              // Reference to User
  deviceFingerprint: String,   // Unique device identifier
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    os: String,
    ip: String,
    screenResolution: String,
    timezone: String
  },
  deviceName: String,          // Human-readable device name
  isActive: Boolean,           // Device status
  firstLogin: Date,            // First registration
  lastActivity: Date,          // Last access
  loginCount: Number           // Number of logins
}
```

## Usage Examples

### Reset User Devices (Admin)
```javascript
// Reset all devices for a user
PUT /api/v1/device-management/users/USER_ID/reset
```

### Check Device Status
```javascript
// Check if current device is authorized
POST /api/v1/device-management/check-authorization
Body: { platform: "Desktop", screenResolution: "1920x1080", timezone: "Asia/Cairo" }
```

## Troubleshooting
1. **User can't access from new device**: Check if they have 2 devices already registered
2. **Device not recognized**: Device fingerprint may have changed (browser update, etc.)
3. **Admin can't see devices**: Verify admin role and API endpoints

## Future Enhancements
- Device naming by users
- Temporary device access
- Device location tracking
- Email notifications for new devices
