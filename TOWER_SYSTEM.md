# 🏰 Complete Tower System

## ✨ Overview

Comprehensive tower management system with:
- **Tower Overview** - Name, logo, banner, stats, badges
- **Members Management** - Roles, performance tracking, leaderboard
- **Teams Section** - Team status, tournament registrations
- **Tournaments** - Ongoing, pending, past tournaments
- **Announcements** - Tower-specific communication
- **Settings** - Complete tower management
- **Gamification** - Levels, XP, badges

---

## 📊 Tower Features

### 1. Tower Overview
- Tower name (unique)
- Tower logo & banner
- Tower code (invite code)
- Tower owner (name + avatar)
- Co-leader (optional, single person)
- Description
- Created date
- Level & XP
- Stats (tournaments participated, won, total points)
- Badges earned

### 2. Members Section
- **Members List** with:
  - Avatar, username, role
  - Performance stats (K/D, win rate, MVP count)
  - Join date
  - Level & XP
- **Roles**:
  - Owner (tower creator)
  - Co-Leader (single, assigned by owner)
  - Elite Member (promoted by owner/co-leader)
  - Member (regular)
- **Performance Tags**: Points, MVP, K/D ratio

### 3. Teams (Inside Tower)
- Team name (unique per tower)
- Team logo (mandatory)
- Team members with captain mark
- Slot availability (4 members per team)
- Current status:
  - **FREE** - Not registered in any tournament
  - **REGISTERED** - Active in tournament
- Current tournaments list

### 4. Tournaments Section
- **Ongoing Tournaments**: Active registrations
- **Pending Confirmation**: Awaiting organizer approval
- **Past Tournaments**: Tournament history
- **Slot Confirmation Status**: Booked/Not Confirmed
- **Room ID & Password**: Visible after confirmation

### 5. Notifications (Tower Specific)
- Tournament room ID & password
- Slot confirmation updates
- Team joins/leaves
- Co-leader assign/change
- Member promotions

### 6. Tower Settings (Owner/Co-Leader)
- Edit tower name/logo/banner
- Manage members (promote/demote/remove)
- Create/edit teams
- Assign/remove co-leader
- Delete tower (owner only)
- Set max teams/members limits

### 7. Extra Features
- **Tower Leaderboard**: Members ranked by performance
- **Announcement Board**: Tower-specific announcements
- **Tower Badges**: Achievement badges
- **Tower Level System**: XP based on tournaments

---

## 🗄️ Database Schema

### Enhanced Tower Model
```prisma
model Tower {
  id          Int      @id
  name        String   @unique
  logoUrl     String?
  bannerUrl   String?
  description String?
  code        String   @unique
  leaderId    Int
  coLeaderId  Int?
  maxTeams    Int      @default(10)
  maxMembers  Int      @default(50)
  
  // Gamification
  level       Int      @default(1)
  xp          Int      @default(0)
  
  // Stats
  tournamentsParticipated Int @default(0)
  tournamentsWon          Int @default(0)
  totalPoints             Int @default(0)
  
  // Relations
  leader      User
  members     TowerMember[]
  teams       Team[]
  announcements TowerAnnouncement[]
  badges      TowerBadge[]
}
```

### Tower Member with Roles
```prisma
enum TowerRole {
  CO_LEADER
  ELITE_MEMBER
  MEMBER
}

model TowerMember {
  id        Int
  towerId   Int
  userId    Int
  role      TowerRole @default(MEMBER)
  approved  Boolean   @default(false)
  joinedAt  DateTime  @default(now())
}
```

### Tower Badges
```prisma
enum TowerBadgeType {
  FIRST_TOURNAMENT
  TOURNAMENT_WINNER
  VETERAN_TOWER
  ELITE_SQUAD
  CHAMPION_TOWER
}

model TowerBadge {
  id        Int
  towerId   Int
  type      TowerBadgeType
  name      String
  iconUrl   String?
  earnedAt  DateTime
}
```

### Tower Announcements
```prisma
model TowerAnnouncement {
  id          Int
  towerId     Int
  title       String
  message     String
  createdBy   Int
  createdAt   DateTime
}
```

---

## 🚀 API Endpoints

### Get Complete Tower Overview
```http
GET /towers/:towerId/overview

Response: {
  "id": 1,
  "name": "Elite Squad",
  "logoUrl": "/uploads/tower-logo.jpg",
  "bannerUrl": "/uploads/tower-banner.jpg",
  "description": "Pro BGMI squad",
  "code": "ABC123",
  "leaderId": 1,
  "coLeaderId": 2,
  "maxTeams": 10,
  "maxMembers": 50,
  "level": 5,
  "xp": 2500,
  "tournamentsParticipated": 15,
  "tournamentsWon": 3,
  "totalPoints": 5000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "leader": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "avatarUrl": "/uploads/avatar.jpg",
    "level": 10,
    "xp": 5000
  },
  "coLeader": {
    "id": 2,
    "name": "Jane Smith",
    "username": "janesmith",
    "avatarUrl": "/uploads/avatar2.jpg",
    "level": 8,
    "xp": 3500
  },
  "members": [...],
  "teams": [...],
  "badges": [...],
  "stats": {
    "totalMembers": 25,
    "totalTeams": 5,
    "tournamentsParticipated": 15,
    "tournamentsWon": 3,
    "totalPoints": 5000
  }
}
```

### Get Tower Members with Performance
```http
GET /towers/:towerId/members

Response: {
  "towerId": 1,
  "towerName": "Elite Squad",
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "avatarUrl": "/uploads/avatar.jpg",
      "role": "OWNER",
      "level": 10,
      "xp": 5000,
      "matchesPlayed": 100,
      "matchesWon": 60,
      "kills": 500,
      "deaths": 250,
      "mvpCount": 15,
      "performancePoints": 2500,
      "kdRatio": 2.0,
      "winRate": 60.0,
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "username": "janesmith",
      "role": "CO_LEADER",
      "level": 8,
      "kdRatio": 1.8,
      "winRate": 55.0,
      ...
    },
    {
      "id": 3,
      "name": "Bob Wilson",
      "role": "ELITE_MEMBER",
      ...
    },
    {
      "id": 4,
      "name": "Alice Brown",
      "role": "MEMBER",
      ...
    }
  ],
  "totalMembers": 25
}
```

### Get Tower Teams with Status
```http
GET /towers/:towerId/teams-status

Response: [
  {
    "id": 1,
    "name": "Team Alpha",
    "logoUrl": "/uploads/team-logo.jpg",
    "captain": {
      "id": 5,
      "name": "Captain Name",
      "username": "captain",
      "avatarUrl": "/uploads/avatar.jpg"
    },
    "members": [...],
    "memberCount": 4,
    "slotsAvailable": 0,
    "status": "REGISTERED",
    "currentTournaments": [
      {
        "id": 1,
        "title": "BGMI Championship",
        "status": "APPROVED",
        "tournamentStatus": "LIVE"
      }
    ]
  },
  {
    "id": 2,
    "name": "Team Beta",
    "status": "FREE",
    "memberCount": 3,
    "slotsAvailable": 1,
    "currentTournaments": []
  }
]
```

### Get Tower Tournaments
```http
GET /towers/:towerId/tournaments

Response: {
  "ongoing": [
    {
      "id": 1,
      "tournament": {
        "id": 1,
        "title": "BGMI Championship",
        "game": "BGMI",
        "status": "LIVE",
        "matchDateTime": "2024-12-31T18:00:00.000Z",
        "roomId": "123456",
        "roomPassword": "pass123"
      },
      "team": {
        "id": 1,
        "name": "Team Alpha",
        "logoUrl": "/uploads/team-logo.jpg"
      },
      "status": "APPROVED"
    }
  ],
  "pending": [
    {
      "id": 2,
      "tournament": {
        "id": 2,
        "title": "Winter Cup",
        "status": "UPCOMING"
      },
      "team": {
        "id": 2,
        "name": "Team Beta"
      },
      "status": "PENDING"
    }
  ],
  "past": [...],
  "stats": {
    "totalParticipated": 15,
    "totalApproved": 12,
    "totalPending": 1
  }
}
```

### Get Tower Leaderboard
```http
GET /towers/:towerId/leaderboard

Response: {
  "towerId": 1,
  "towerName": "Elite Squad",
  "leaderboard": [
    {
      "rank": 1,
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "avatarUrl": "/uploads/avatar.jpg",
      "performancePoints": 2500,
      "matchesPlayed": 100,
      "matchesWon": 60,
      "kills": 500,
      "deaths": 250,
      "mvpCount": 15,
      "kdRatio": 2.0,
      "winRate": 60.0
    },
    {
      "rank": 2,
      "id": 3,
      "name": "Bob Wilson",
      "performancePoints": 2200,
      ...
    }
  ]
}
```

### Get Tower Announcements
```http
GET /towers/:towerId/announcements

Response: [
  {
    "id": 1,
    "towerId": 1,
    "title": "Tournament Registration Open",
    "message": "BGMI Championship registration is now open. Register your teams!",
    "createdBy": 1,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Create Tower Announcement
```http
POST /towers/:towerId/announcements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Important Update",
  "message": "All teams must register by tomorrow."
}

Response: {
  "id": 2,
  "towerId": 1,
  "title": "Important Update",
  "message": "All teams must register by tomorrow.",
  "createdBy": 1,
  "createdAt": "2024-01-16T12:00:00.000Z"
}
```

### Update Tower Settings
```http
PUT /towers/:towerId/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Elite Squad Updated",
  "logoUrl": "/uploads/new-logo.jpg",
  "bannerUrl": "/uploads/new-banner.jpg",
  "description": "Updated description",
  "maxTeams": 15,
  "maxMembers": 60
}

Response: {
  "id": 1,
  "name": "Elite Squad Updated",
  ...
}
```

### Promote Member to Elite
```http
POST /towers/:towerId/members/:memberId/promote
Authorization: Bearer <token>

Response: {
  "id": 5,
  "towerId": 1,
  "userId": 10,
  "role": "ELITE_MEMBER",
  "approved": true
}
```

### Demote Elite Member
```http
POST /towers/:towerId/members/:memberId/demote
Authorization: Bearer <token>

Response: {
  "id": 5,
  "role": "MEMBER"
}
```

### Assign Co-Leader
```http
POST /towers/:towerId/assign-coleader/:userId
Authorization: Bearer <token>

Response: {
  "id": 1,
  "coLeaderId": 2,
  ...
}
```

### Remove Co-Leader
```http
DELETE /towers/:towerId/coleader
Authorization: Bearer <token>

Response: {
  "id": 1,
  "coLeaderId": null,
  ...
}
```

### Delete Tower
```http
DELETE /towers/:towerId
Authorization: Bearer <token>

Response: {
  "message": "Tower deleted successfully"
}
```

---

## 🎮 Tower Roles & Permissions

### Owner (Tower Creator)
- ✅ All permissions
- ✅ Assign/remove co-leader
- ✅ Delete tower
- ✅ Manage all settings
- ✅ Promote/demote members
- ✅ Create/delete teams
- ✅ Post announcements

### Co-Leader (Assigned by Owner)
- ✅ Manage members (approve/remove)
- ✅ Promote/demote members
- ✅ Create/manage teams
- ✅ Post announcements
- ✅ Update tower settings
- ❌ Cannot assign/remove co-leader
- ❌ Cannot delete tower

### Elite Member (Promoted)
- ✅ View all tower data
- ✅ Join teams
- ✅ View announcements
- ❌ Cannot manage members
- ❌ Cannot create teams

### Member (Regular)
- ✅ View tower data
- ✅ Join teams
- ✅ View announcements
- ❌ No management permissions

---

## 🏆 Tower Gamification

### Tower Level System
- **Level 1**: 0-1000 XP
- **Level 2**: 1000-2000 XP
- **Level 3**: 2000-3000 XP
- Formula: `Next Level = Current Level * 1000 XP`

### XP Rewards
- **Tournament Participation**: 100 XP
- **Tournament Win**: 500 XP
- **Team Registration**: 50 XP
- **New Member Join**: 10 XP

### Tower Badges (5 Types)
1. **First Tournament** - Participated in first tournament
2. **Tournament Winner** - Won a tournament
3. **Veteran Tower** - 20+ tournaments participated
4. **Elite Squad** - 50+ members
5. **Champion Tower** - 5+ tournament wins

---

## 📱 Tower Sections (Frontend Structure)

### Overview Tab
- Tower banner & logo
- Tower name, code, description
- Owner & co-leader info
- Level & XP progress
- Stats (members, teams, tournaments)
- Badges showcase

### Members Tab
- Members list with avatars
- Role badges (Owner, Co-Leader, Elite, Member)
- Performance stats (K/D, win rate, MVP)
- Join date
- Management buttons (promote/demote/remove)

### Teams Tab
- Teams grid with logos
- Team status (Free/Registered)
- Member count & slots available
- Current tournaments
- Create team button

### Tournaments Tab
- Ongoing tournaments
- Pending confirmations
- Past tournaments
- Room ID/Password (for confirmed)
- Stats summary

### Leaderboard Tab
- Ranked members list
- Performance points
- K/D ratio, win rate
- MVP count
- Rank badges

### Announcements Tab
- Announcement feed
- Create announcement button (owner/co-leader)
- Timestamp & author

### Settings Tab (Owner/Co-Leader)
- Edit tower info
- Manage members
- Assign co-leader
- Delete tower

---

## ✅ Features Checklist

### Tower Overview ✅
- [x] Tower name (unique)
- [x] Tower logo & banner
- [x] Tower code (invite)
- [x] Owner & co-leader info
- [x] Description
- [x] Created date
- [x] Level & XP
- [x] Stats & badges

### Members Section ✅
- [x] Members list with avatars
- [x] Roles (Owner, Co-Leader, Elite, Member)
- [x] Performance stats
- [x] Join date
- [x] K/D ratio, win rate
- [x] Promote/demote functionality

### Teams Section ✅
- [x] Team list with logos
- [x] Team status (Free/Registered)
- [x] Slot availability
- [x] Current tournaments
- [x] Member count

### Tournaments Section ✅
- [x] Ongoing tournaments
- [x] Pending confirmations
- [x] Past tournaments
- [x] Room ID/Password
- [x] Stats summary

### Tower Management ✅
- [x] Edit tower settings
- [x] Assign/remove co-leader
- [x] Promote/demote members
- [x] Delete tower
- [x] Max teams/members limits

### Extra Features ✅
- [x] Tower leaderboard
- [x] Announcement board
- [x] Tower badges
- [x] Tower level system

---

## 🚀 Setup Instructions

### 1. Update Database
```bash
npx prisma db push --accept-data-loss
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Test Endpoints
```bash
# Get tower overview
curl http://localhost:3001/towers/1/overview

# Get tower members
curl http://localhost:3001/towers/1/members

# Get tower leaderboard
curl http://localhost:3001/towers/1/leaderboard
```

---

**Complete Tower System Implemented! 🏰**
