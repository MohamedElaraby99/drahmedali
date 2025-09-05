# Video Access Code Feature

This feature allows administrators to control access to individual videos within lessons using special access codes. When a user tries to watch a video that requires an access code, they will be prompted to enter the code before the video can be played.

## How It Works

### 1. Video Configuration
Videos can be configured to require access codes by setting any of these properties:
- `requiresAccessCode: true` - Explicitly requires an access code
- `premium: true` - Marks the video as premium content
- `isLocked: true` - Marks the video as locked

### 2. User Experience Flow
1. User navigates to a course and opens a lesson
2. User clicks on a video that requires access
3. A modal appears requesting an access code
4. User enters the access code
5. System validates the code
6. If valid, the video plays; if invalid, an error is shown

### 3. Backend Validation
The backend performs comprehensive validation:
- Code exists and is not expired
- Code belongs to the correct course
- Video exists in the specified lesson
- User has permission to use the code
- Code hasn't been used before (one-time use)

## API Endpoints

### POST `/api/v1/courseAccess/redeem-video`
Redeems an access code specifically for video access.

**Request Body:**
```json
{
  "code": "ABC123XYZ9",
  "courseId": "course_id_here",
  "lessonId": "lesson_id_here",
  "unitId": "unit_id_here", // Optional, only for lessons within units
  "videoId": "video_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access": {
      "id": "access_record_id",
      "courseId": "course_id_here",
      "accessStartAt": "2024-01-15T10:00:00.000Z",
      "accessEndAt": "2024-02-15T10:00:00.000Z",
      "videoId": "video_id_here",
      "lessonId": "lesson_id_here"
    }
  },
  "message": "Video access unlocked successfully"
}
```

## Database Schema Updates

### Course Model - Video Schema
```javascript
videos: [
  {
    url: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    publishDate: { type: Date },
    requiresAccessCode: { type: Boolean, default: false }, // NEW
    premium: { type: Boolean, default: false },            // NEW
    isLocked: { type: Boolean, default: false }            // NEW
  }
]
```

## Frontend Components

### VideoAccessModal
A React component that handles video access code input:
- Validates code format (8-12 alphanumeric characters)
- Provides user-friendly error messages
- Shows loading states during validation
- Automatically opens video player on successful access

### OptimizedLessonContentModal Updates
- Added video access logic
- Integrated VideoAccessModal component
- Updated video click handlers to check access requirements

## Setup and Testing

### 1. Run the Setup Script
```bash
node backend/scripts/setup-video-access-codes.js
```

This script will:
- Find a course with videos
- Mark the first video as requiring access code
- Generate 5 test access codes
- Display the codes for testing

### 2. Manual Video Configuration
To manually configure a video to require access code:

```javascript
// In MongoDB or through admin interface
db.courses.updateOne(
  { "_id": ObjectId("course_id") },
  { 
    "$set": { 
      "directLessons.0.videos.0.requiresAccessCode": true,
      "directLessons.0.videos.0.premium": true
    }
  }
)
```

### 3. Generate Access Codes
Use the existing admin interface or API to generate access codes:

```bash
POST /api/v1/courseAccess/admin/codes
{
  "courseId": "course_id_here",
  "accessStartAt": "2024-01-15T10:00:00.000Z",
  "accessEndAt": "2024-02-15T10:00:00.000Z",
  "quantity": 10
}
```

## Error Handling

The system provides detailed error messages for various scenarios:

- **Invalid Code Format**: "تنسيق الكود غير صحيح. يجب أن يتكون الكود من 8-12 حرف وأرقام باللغة الإنجليزية فقط"
- **Expired Code**: "⏰ انتهت صلاحية هذا الكود. يرجى الحصول على كود جديد من المدرس"
- **Wrong Course**: "🚫 هذا الكود غير صالح لهذا الكورس. تأكد من أنك تستخدم الكود الصحيح للكورس المطلوب"
- **Already Used**: "🔒 تم استخدام هذا الكود من قبل. كل كود يمكن استخدامه مرة واحدة فقط"
- **Video Not Found**: "📹 الفيديو المرتبط بهذا الكود غير موجود. يرجى التواصل مع الدعم الفني"

## Security Features

1. **One-time Use**: Each access code can only be used once
2. **Time-based Expiration**: Codes have both access windows and absolute expiration dates
3. **Course Validation**: Codes are tied to specific courses
4. **Video Validation**: System verifies the video exists in the specified lesson
5. **User Authentication**: Only logged-in users can redeem codes
6. **Transaction Logging**: All code redemptions are logged for audit purposes

## Future Enhancements

1. **Bulk Video Access**: Allow codes to unlock multiple videos at once
2. **Video-specific Codes**: Create codes that only work for specific videos
3. **Usage Analytics**: Track which videos are accessed most frequently
4. **Time-limited Access**: Allow temporary access to videos (e.g., 24-hour access)
5. **Group Access**: Allow codes to be shared among multiple users
6. **Download Prevention**: Add additional security for premium content

## Troubleshooting

### Common Issues

1. **Modal Not Appearing**: Check that the video has `requiresAccessCode`, `premium`, or `isLocked` set to `true`
2. **Code Validation Failing**: Ensure the backend route is properly configured and the database is accessible
3. **Video Not Playing**: Verify that the course access is properly created after code redemption

### Debug Mode
To enable debug logging, check the browser console for detailed information about the video access flow.

## License
This feature is part of the main application and follows the same licensing terms.
