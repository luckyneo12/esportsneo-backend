# 🆕 New Features Implementation

## ✨ Overview

All additional requirements have been implemented successfully:

1. ✅ **Super Admin Role** - Complete system control
2. ✅ **Organizer Application System** - Apply and get approved
3. ✅ **Tower Limits** - Max teams per tower, unique tower names
4. ✅ **Room ID/Password Distribution** - Automatic notification to teams
5. ✅ **Notification System** - Real-time notifications for all events
6. ✅ **Enhanced User Profile** - Game ID, stats (kills, wins)
7. ✅ **Tournament Enhancements** - Map pool, rules, allowed towers

---

## 🔑 Roles & Permissions

### User Roles (Updated)
```
PLAYER → Default role for all users
ORGANISER → Can create tournaments (requires approval)
SUPER_ADMIN → Full system control
```

### Role Hierarchy

**PLAYER** (Default)
- Create profile
- Join/create towers (becomes tower owner)
- Join teams
- Apply for organizer role

**ORGANISER** (Approved by Super Admin)
- All PLAYER permissions
- Create tournaments
- Set room ID/password
- Approve/reject team registrations
- Update tournament status

**SUPER_ADMIN** (System Administrator)
- All permissions
- Approve/reject organizer applications
- View all organizers
- Block/unblock organizers
- Global system reports

---

## 📊 Database Schema Changes

### New Enums
```prisma
enum UserRole {
  PLAYER
  ORGANISER
  SUPER_ADMIN
}

enum OrganizerStatus {
  PENDING
  APPROVED
  REJECTED
}

enum NotificationType {
  TOURNAMENT_CREATED
  TEAM_REGISTERED
  REGISTRATION_APPROVED
  REGISTRATION_REJECTED
  ROOM_DETAILS
  TOWER_INVITE
  ORGANIZER_APPROVED
  ORGANIZER_REJECTED
}
```

### Updated Models

**User**
- Added: `gameId` (BGMI ID, FF ID etc.)
- Added: `kills` (total kills)
- Added: `wins` (total wins)
- Removed: `TOWER_OWNER` and `ADMIN` roles

**Tournament**
- Added: `mapPool` (Erangel, Miramar, Sanhok etc.)
- Added: `rules` (Tournament rules text)
- Added: `roomId` (Room ID for match)
- Added: `roomPassword` (Room password)
- Added: `allowedTowerIds` (JSON array of allowed tower IDs)

**Tower**
- Added: `name` unique constraint
- Added: `logoUrl` (Tower logo)
- Added: `coLeaderId` (Single co-leader)
- Added: `maxTeams` (Maximum teams allowed, default 10)

**Team**
- Changed: `name` now globally unique
- Changed: `logoUrl` now required (not optional)

### New Models

**OrganizerApplication**
```prisma
model OrganizerApplication {
  id          Int              @id @default(autoincrement())
  userId      Int              @unique
  reason      String?          @db.Text
  status      OrganizerStatus  @default(PENDING)
  reviewedBy  Int?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

**Notification**
```prisma
model Notification {
  id          Int              @id @default(autoincrement())
  userId      Int
  type        NotificationType
  title       String
  message     String           @db.Text
  data        String?          @db.Text // JSON data
  read        Boolean          @default(false)
  sentBy      Int?
  createdAt   DateTime         @default(now())
}
```

---

## 🚀 New API Endpoints

### Organizer Application

#### Apply for Organizer Role
```http
POST /organizer/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "I have experience organizing tournaments..."
}

Response: {
  "id": 1,
  "userId": 5,
  "reason": "...",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get My Application Status
```http
GET /organizer/my-application
Authorization: Bearer <token>

Response: {
  "id": 1,
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Super Admin - Organizer Management

#### Get All Organizer Applications
```http
GET /admin/organizer-applications?status=PENDING
Authorization: Bearer <super_admin_token>

Response: [
  {
    "id": 1,
    "userId": 5,
    "status": "PENDING",
    "user": {
      "id": 5,
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
]
```

#### Approve Organizer Application
```http
POST /admin/organizer-applications/1/approve
Authorization: Bearer <super_admin_token>

Response: {
  "id": 1,
  "status": "APPROVED",
  "reviewedBy": 1
}

// User role automatically changed to ORGANISER
// Notification sent to user
```

#### Reject Organizer Application
```http
POST /admin/organizer-applications/1/reject
Authorization: Bearer <super_admin_token>

Response: {
  "id": 1,
  "status": "REJECTED",
  "reviewedBy": 1
}

// Notification sent to user
```

#### Get All Organizers
```http
GET /admin/organizers
Authorization: Bearer <super_admin_token>

Response: [
  {
    "id": 5,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "organizedTournaments": 3
    }
  }
]
```

#### Block Organizer
```http
POST /admin/organizers/5/block
Authorization: Bearer <super_admin_token>

Response: {
  "message": "Organizer blocked successfully",
  "user": { ... }
}

// User role changed back to PLAYER
```

### Notifications

#### Get My Notifications
```http
GET /notifications?unreadOnly=true
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "type": "TOURNAMENT_CREATED",
    "title": "New Tournament: BGMI Championship",
    "message": "A new BGMI tournament has been created...",
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": 2,
      "name": "Organizer Name"
    }
  }
]
```

#### Mark Notification as Read
```http
POST /notifications/1/read
Authorization: Bearer <token>

Response: {
  "id": 1,
  "read": true
}
```

#### Mark All as Read
```http
POST /notifications/read-all
Authorization: Bearer <token>

Response: {
  "message": "All notifications marked as read",
  "count": 5
}
```

#### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>

Response: {
  "count": 3
}
```

#### Delete Notification
```http
DELETE /notifications/1
Authorization: Bearer <token>

Response: {
  "message": "Notification deleted"
}
```

### Tournament - Room Details

#### Set Room ID and Password
```http
PUT /tournaments/1/room-details
Authorization: Bearer <organizer_token>
Content-Type: application/json

{
  "roomId": "123456",
  "roomPassword": "pass123"
}

Response: {
  "id": 1,
  "roomId": "123456",
  "roomPassword": "pass123"
}

// Automatically sends notifications to all confirmed teams
// Notification includes room ID and password
```

#### Update Tournament Status
```http
PUT /tournaments/1/status
Authorization: Bearer <organizer_token>
Content-Type: application/json

{
  "status": "LIVE"
}

Response: {
  "id": 1,
  "status": "LIVE"
}

// Status: UPCOMING | LIVE | COMPLETED
```

### Enhanced Tournament Creation
```http
POST /tournaments
Authorization: Bearer <organizer_token>
Content-Type: application/json

{
  "title": "BGMI Championship 2024",
  "game": "BGMI",
  "mapPool": "Erangel, Miramar, Sanhok",
  "description": "Annual championship",
  "rules": "1. No cheating\n2. Follow game rules...",
  "bannerUrl": "/uploads/banner.jpg",
  "logoUrl": "/uploads/logo.jpg",
  "entryFee": 500,
  "maxTeams": 16,
  "matchDateTime": "2024-12-31T18:00:00Z",
  "allowedTowerIds": [1, 2, 3]  // Optional: restrict to specific towers
}

Response: { ... }

// Automatically notifies tower owners
// If allowedTowerIds specified, only those towers notified
```

### Enhanced Tower Creation
```http
POST /towers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Elite Squad",
  "logoUrl": "/uploads/tower-logo.jpg",
  "maxTeams": 15
}

Response: {
  "id": 1,
  "name": "Elite Squad",
  "logoUrl": "/uploads/tower-logo.jpg",
  "code": "ABC123",
  "maxTeams": 15
}

// Tower name must be unique globally
// maxTeams default is 10
```

### Enhanced Team Creation
```http
POST /towers/1/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Team Alpha",
  "logoUrl": "/uploads/team-logo.jpg",  // REQUIRED
  "captainId": 5
}

Response: { ... }

// Team name must be globally unique
// Logo is mandatory
// Tower maxTeams limit enforced
```

---

## 🔄 Complete Workflow

### 1. User Registration & Organizer Application
```
1. User registers → role = PLAYER
2. User applies for organizer role
   POST /organizer/apply
3. Super Admin reviews application
   GET /admin/organizer-applications
4. Super Admin approves
   POST /admin/organizer-applications/1/approve
5. User receives notification
6. User role changed to ORGANISER
```

### 2. Tournament Creation & Notification
```
1. Organizer creates tournament
   POST /tournaments
2. System notifies all tower owners
   (or only allowed towers if specified)
3. Tower owners receive notification
   GET /notifications
```

### 3. Team Registration & Approval
```
1. Tower owner registers team
   POST /tournaments/1/registrations
2. Organizer reviews registration
   GET /tournaments/1/registrations
3. Organizer approves
   POST /tournaments/1/registrations/1/approve
4. Tower owner + all team members receive notification
```

### 4. Room Details Distribution
```
1. Organizer sets room ID/password
   PUT /tournaments/1/room-details
2. System automatically notifies all confirmed teams
3. Each team member receives notification with:
   - Room ID
   - Password
   - Tournament details
```

### 5. Tournament Lifecycle
```
1. Create tournament → status: UPCOMING
2. Start tournament
   PUT /tournaments/1/status { "status": "LIVE" }
3. Complete tournament
   PUT /tournaments/1/status { "status": "COMPLETED" }
```

---

## 🔔 Notification Types

### TOURNAMENT_CREATED
- **Sent to**: Tower owners (all or allowed towers)
- **When**: Tournament is created
- **Message**: "New tournament created, register your teams"

### TEAM_REGISTERED
- **Sent to**: Tournament organizers
- **When**: Team registers for tournament
- **Message**: "New team registration pending approval"

### REGISTRATION_APPROVED
- **Sent to**: Tower owner + all team members
- **When**: Organizer approves registration
- **Message**: "Your team has been confirmed for tournament"

### REGISTRATION_REJECTED
- **Sent to**: Tower owner + all team members
- **When**: Organizer rejects registration
- **Message**: "Your team registration was rejected"

### ROOM_DETAILS
- **Sent to**: Tower owner + all team members of confirmed teams
- **When**: Organizer sets room ID/password
- **Message**: Includes room ID and password

### ORGANIZER_APPROVED
- **Sent to**: Applicant
- **When**: Super Admin approves organizer application
- **Message**: "Your organizer application has been approved"

### ORGANIZER_REJECTED
- **Sent to**: Applicant
- **When**: Super Admin rejects organizer application
- **Message**: "Your organizer application has been rejected"

---

## ✅ Validation Rules

### Tower Creation
- ✅ Tower name must be globally unique
- ✅ maxTeams must be positive number (default: 10)

### Team Creation
- ✅ Team name must be globally unique
- ✅ Logo URL is required (mandatory)
- ✅ Tower must not exceed maxTeams limit
- ✅ Only tower owner/co-leader can create teams

### Tournament Creation
- ✅ Only users with ORGANISER or SUPER_ADMIN role can create
- ✅ All required fields must be provided
- ✅ Notifications sent to appropriate tower owners

### Organizer Application
- ✅ User can only have one active application
- ✅ Cannot apply if already an organizer
- ✅ Can reapply after rejection

### Room Details
- ✅ Only tournament organizers can set room details
- ✅ Room ID is required
- ✅ Automatically notifies all confirmed teams

---

## 📊 Super Admin Dashboard Data

### Get System Statistics
```javascript
// Get all organizers
GET /admin/organizers

// Get pending applications
GET /admin/organizer-applications?status=PENDING

// Get all tournaments (add this endpoint if needed)
GET /tournaments

// Get all towers
GET /towers (implement if needed)
```

---

## 🔐 Permission Matrix

| Action | PLAYER | ORGANISER | SUPER_ADMIN |
|--------|--------|-----------|-------------|
| Create Tower | ✅ | ✅ | ✅ |
| Create Team | ✅ (if owner) | ✅ (if owner) | ✅ |
| Apply for Organizer | ✅ | ❌ | ❌ |
| Create Tournament | ❌ | ✅ | ✅ |
| Set Room Details | ❌ | ✅ (own tournament) | ✅ |
| Approve Team Registration | ❌ | ✅ (own tournament) | ✅ |
| Review Organizer Applications | ❌ | ❌ | ✅ |
| Block Organizers | ❌ | ❌ | ✅ |

---

## 🎯 Key Features Summary

1. ✅ **Organizer Approval System** - Players apply, Super Admin approves
2. ✅ **Tower Limits** - Max teams per tower, unique names
3. ✅ **Room Distribution** - Automatic notification with room details
4. ✅ **Notification System** - Real-time notifications for all events
5. ✅ **Enhanced Profiles** - Game ID, kills, wins stats
6. ✅ **Tournament Controls** - Map pool, rules, allowed towers
7. ✅ **Super Admin Panel** - Complete system oversight

---

## 🚀 Next Steps

1. **Run Database Migration**
   ```bash
   npx prisma db push
   ```

2. **Create Super Admin User**
   - Register a user
   - Manually update role in database to SUPER_ADMIN
   ```sql
   UPDATE User SET role = 'SUPER_ADMIN' WHERE id = 1;
   ```

3. **Test Complete Flow**
   - User applies for organizer
   - Super Admin approves
   - Organizer creates tournament
   - Tower owners receive notifications
   - Teams register
   - Organizer approves and sets room details
   - Teams receive room details

---

**All New Features Implemented! 🎉**
