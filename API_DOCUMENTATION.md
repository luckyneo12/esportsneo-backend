# 🏆 Esports Tournament Management API Documentation

## Overview
Complete API for managing esports tournaments with towers (groups) and teams.

---

## 🔐 Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "mobile": "9876543210",
  "password": "securepass123",
  "email": "john@example.com",
  "role": "PLAYER" // PLAYER | TOWER_OWNER | ORGANISER | ADMIN
}

Response: { "token": "jwt_token", "user": {...} }
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "mobile": "9876543210",
  "password": "securepass123"
}

Response: { "token": "jwt_token", "user": {...} }
```

---

## 👤 User Profile

### Get Own Profile
```http
GET /users/me
Authorization: Bearer <token>

Response: {
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "bio": "Pro gamer",
  "avatarUrl": "/uploads/avatar-123.jpg",
  "role": "PLAYER",
  "matchesPlayed": 50,
  "winRatio": 0.75,
  "performancePoints": 1500,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Updated bio",
  "avatarUrl": "/uploads/avatar-456.jpg"
}
```

### Get User by ID
```http
GET /users/:userId
```

### Get User's Teams
```http
GET /users/:userId/teams
Authorization: Bearer <token>
```

### Get User's Towers
```http
GET /users/:userId/towers
Authorization: Bearer <token>
```

---

## 🏰 Tower Management

### Create Tower
```http
POST /towers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Elite Gamers"
}

Response: {
  "id": 1,
  "name": "Elite Gamers",
  "code": "ABC123", // Unique join code
  "leaderId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Join Tower
```http
POST /towers/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "ABC123"
}

Response: {
  "id": 1,
  "towerId": 1,
  "userId": 2,
  "role": "MEMBER",
  "approved": false // Needs approval from tower owner/co-leader
}
```

### Get Tower Details
```http
GET /towers/:towerId

Response: {
  "id": 1,
  "name": "Elite Gamers",
  "code": "ABC123",
  "leader": {...},
  "members": [...],
  "teams": [...]
}
```

### Approve Tower Member
```http
POST /towers/:towerId/members/:memberId/approve
Authorization: Bearer <token>
// Only tower owner or co-leader can approve
```

### Remove Tower Member
```http
DELETE /towers/:towerId/members/:memberId
Authorization: Bearer <token>
// Only tower owner or co-leader
```

### Promote to Co-Leader
```http
POST /towers/:towerId/coleaders/:userId
Authorization: Bearer <token>
// Only tower owner or co-leader
```

---

## 👥 Team Management

### Create Team in Tower
```http
POST /towers/:towerId/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Team Alpha",
  "logoUrl": "/uploads/logo-123.jpg", // Optional
  "captainId": 5 // Optional
}

Response: {
  "id": 1,
  "name": "Team Alpha",
  "logoUrl": "/uploads/logo-123.jpg",
  "towerId": 1,
  "captainId": 5,
  "tower": {...},
  "captain": {...},
  "members": []
}
```

### Add Team Member
```http
POST /teams/:teamId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 3
}
```

### Get Tower's Teams
```http
GET /towers/:towerId/teams
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "name": "Team Alpha",
    "logoUrl": "/uploads/logo-123.jpg",
    "tower": {...},
    "captain": {...},
    "members": [...],
    "_count": { "members": 5 }
  }
]
```

### Get Team Details
```http
GET /teams/:teamId

Response: {
  "id": 1,
  "name": "Team Alpha",
  "logoUrl": "/uploads/logo-123.jpg",
  "tower": {...},
  "captain": {...},
  "members": [...]
}
```

---

## 🏆 Tournament Management

### Create Tournament
```http
POST /tournaments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "BGMI Championship 2024",
  "game": "BGMI",
  "description": "Annual championship tournament",
  "bannerUrl": "/uploads/banner-123.jpg",
  "logoUrl": "/uploads/logo-456.jpg",
  "entryFee": 500,
  "maxTeams": 16,
  "matchDateTime": "2024-12-31T18:00:00.000Z",
  "organizerIds": [2, 3] // Optional, creator is auto-added
}

Response: {
  "id": 1,
  "title": "BGMI Championship 2024",
  "game": "BGMI",
  "description": "Annual championship tournament",
  "bannerUrl": "/uploads/banner-123.jpg",
  "logoUrl": "/uploads/logo-456.jpg",
  "entryFee": 500,
  "maxTeams": 16,
  "matchDateTime": "2024-12-31T18:00:00.000Z",
  "status": "UPCOMING", // UPCOMING | LIVE | COMPLETED
  "organizers": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get All Tournaments
```http
GET /tournaments?status=UPCOMING

Response: [
  {
    "id": 1,
    "title": "BGMI Championship 2024",
    "game": "BGMI",
    "status": "UPCOMING",
    "maxTeams": 16,
    "organizers": [...],
    "_count": { "registrations": 8 }
  }
]
```

### Get Tournament Details
```http
GET /tournaments/:tournamentId

Response: {
  "id": 1,
  "title": "BGMI Championship 2024",
  "game": "BGMI",
  "description": "...",
  "bannerUrl": "/uploads/banner-123.jpg",
  "logoUrl": "/uploads/logo-456.jpg",
  "maxTeams": 16,
  "organizers": [...],
  "registrations": [
    {
      "id": 1,
      "status": "PENDING",
      "team": {
        "id": 1,
        "name": "Team Alpha",
        "tower": {...},
        "captain": {...},
        "members": [...]
      },
      "createdBy": {...}
    }
  ]
}
```

---

## 📝 Tournament Registration

### Register Team for Tournament
```http
POST /tournaments/:tournamentId/registrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "teamId": 1
}

// Validations:
// ✅ Only tower owner or co-leader can register
// ✅ Team not already registered
// ✅ Tournament maxTeams not exceeded
// ✅ Team name unique in tournament

Response: {
  "id": 1,
  "tournamentId": 1,
  "teamId": 1,
  "status": "PENDING",
  "createdByUserId": 1,
  "team": {...},
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Approve Registration
```http
POST /tournaments/:tournamentId/registrations/:registrationId/approve
Authorization: Bearer <token>
// Only tournament organizer can approve

Response: {
  "id": 1,
  "status": "APPROVED",
  "approvedByUserId": 2
}
```

### Reject Registration
```http
POST /tournaments/:tournamentId/registrations/:registrationId/reject
Authorization: Bearer <token>
// Only tournament organizer can reject

Response: {
  "id": 1,
  "status": "REJECTED",
  "approvedByUserId": 2
}
```

### Get Tournament Registrations
```http
GET /tournaments/:tournamentId/registrations

Response: [
  {
    "id": 1,
    "status": "PENDING",
    "team": {
      "id": 1,
      "name": "Team Alpha",
      "tower": {...},
      "members": [...]
    }
  }
]
```

---

## 📤 File Upload

### Upload Single File
```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  file: <image_file>

Response: {
  "url": "/uploads/file-1234567890.jpg",
  "filename": "file-1234567890.jpg",
  "originalName": "my-image.jpg",
  "size": 123456,
  "mimetype": "image/jpeg"
}
```

### Upload Multiple Files
```http
POST /upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  files: <image_file_1>
  files: <image_file_2>

Response: {
  "files": [
    {
      "url": "/uploads/file-1234567890.jpg",
      "filename": "file-1234567890.jpg",
      ...
    }
  ]
}
```

**Supported formats:** JPEG, JPG, PNG, GIF, WEBP  
**Max file size:** 5MB per file  
**Max files:** 5 files at once

---

## 🔄 Complete Flow Example

### 1. User Registration & Tower Creation
```javascript
// 1. Register user
POST /auth/register
{ "name": "Tower Owner", "username": "owner1", "mobile": "9876543210", "password": "pass123" }
→ Get token

// 2. Create tower
POST /towers (with token)
{ "name": "Elite Squad" }
→ Get tower with code "ABC123"
```

### 2. Team Creation
```javascript
// 3. Create team in tower
POST /towers/1/teams (with token)
{ "name": "Team Alpha", "logoUrl": "/uploads/logo.jpg" }
→ Team created

// 4. Add members to team
POST /teams/1/members (with token)
{ "userId": 2 }
```

### 3. Tournament Registration
```javascript
// 5. Admin creates tournament
POST /tournaments (with admin token)
{
  "title": "BGMI Championship",
  "game": "BGMI",
  "maxTeams": 16,
  "matchDateTime": "2024-12-31T18:00:00Z"
}

// 6. Tower owner registers team
POST /tournaments/1/registrations (with owner token)
{ "teamId": 1 }
→ Registration created with status PENDING

// 7. Admin approves registration
POST /tournaments/1/registrations/1/approve (with admin token)
→ Registration status changed to APPROVED
```

---

## ⚠️ Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate entry, unique constraint violation)
- `500` - Internal Server Error

---

## 🔑 Authorization Rules

### Tower Operations
- **Create Tower**: Any authenticated user
- **Join Tower**: Any authenticated user
- **Approve/Remove Members**: Tower owner or co-leader
- **Create Teams**: Tower owner or co-leader
- **Add Team Members**: Tower owner or co-leader

### Tournament Operations
- **Create Tournament**: Any authenticated user (becomes organizer)
- **Register Team**: Tower owner or co-leader of the team's tower
- **Approve/Reject Registration**: Tournament organizer

### Validations
- **Team Registration**: 
  - Team not already registered
  - Tournament maxTeams not exceeded
  - Team name unique in tournament
  - User is tower owner or co-leader

---

## 📊 Database Schema

### User Roles
- `PLAYER` - Default role for all users
- `TOWER_OWNER` - Can create and manage towers
- `ORGANISER` - Can create and manage tournaments
- `ADMIN` - Full system access

### Tournament Status
- `UPCOMING` - Tournament not started
- `LIVE` - Tournament in progress
- `COMPLETED` - Tournament finished

### Registration Status
- `PENDING` - Awaiting organizer approval
- `APPROVED` - Team confirmed for tournament
- `REJECTED` - Registration denied

---

## 🚀 Getting Started

1. **Run Prisma Migration**
```bash
npx prisma migrate dev --name tournament_system
```

2. **Start Server**
```bash
npm run dev
```

3. **Test Endpoints**
Use Postman, Thunder Client, or curl to test the API endpoints.

---

## 📝 Notes

- All authenticated endpoints require `Authorization: Bearer <token>` header
- Uploaded files are served from `/uploads/` directory
- Tower join codes are auto-generated (6 characters, uppercase)
- Team names must be unique within a tower
- Tournament registration validates team uniqueness by name
