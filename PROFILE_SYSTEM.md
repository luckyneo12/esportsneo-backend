# 👤 Complete Profile System

## ✨ Overview

Comprehensive user profile system with:
- **Basic Info** - Avatar, username, bio, social links
- **Game & Team Info** - Current tower, team, roles
- **Tournament History** - Participated, ongoing, wins
- **Performance Stats** - K/D ratio, MVP count, matches
- **Gamification** - Levels, XP, badges, achievements
- **Settings** - Password, notifications, preferences

---

## 📊 Profile Sections

### 1. Overview (Basic + Team Info)
- Profile photo, username, name, bio
- Game ID (BGMI, FF etc.)
- Social links (Instagram, YouTube, Discord)
- Custom tagline
- Current tower & role (Owner/Co-Leader/Member)
- Current team & role (Captain/Player)
- Level & XP

### 2. Stats (Performance)
- Matches played
- Matches won
- K/D Ratio (kills/deaths)
- Win rate percentage
- MVP count
- Total kills
- Total wins
- Performance points

### 3. Tournaments (History)
- Ongoing tournaments
- Completed tournaments
- Tournament wins
- Achievements unlocked

### 4. Achievements & Badges
- Earned badges with icons
- Achievement progress
- Total XP earned
- Completion status

### 5. Settings
- Change password
- Notification preferences
- Profile visibility
- Apply for organizer role

---

## 🗄️ Database Schema

### Updated User Model
```prisma
model User {
  // Basic Info
  name          String?
  username      String     @unique
  mobile        String     @unique
  email         String?    @unique
  bio           String?
  avatarUrl     String?
  gameId        String?    // BGMI ID, FF ID
  
  // Social Links
  instagramUrl  String?
  youtubeUrl    String?
  discordUrl    String?
  customTagline String?
  
  // Stats
  matchesPlayed Int        @default(0)
  matchesWon    Int        @default(0)
  kills         Int        @default(0)
  deaths        Int        @default(0)
  wins          Int        @default(0)
  mvpCount      Int        @default(0)
  performancePoints Int    @default(0)
  
  // Gamification
  level         Int        @default(1)
  xp            Int        @default(0)
  
  // Notification Preferences
  notifyTournaments Boolean @default(true)
  notifyTeams       Boolean @default(true)
  notifyTowers      Boolean @default(true)
  
  // Relations
  badges        UserBadge[]
  achievements  UserAchievement[]
}
```

### Badge System
```prisma
enum BadgeType {
  FIRST_TOURNAMENT    // Participated in first tournament
  FIRST_WIN          // Won first match
  TOWER_OWNER        // Created a tower
  TEAM_CAPTAIN       // Captain of a team
  MVP_MASTER         // Earned MVP 10 times
  TOURNAMENT_WINNER  // Won a tournament
  ORGANIZER          // Became organizer
  VETERAN            // Played 50+ matches
  SHARPSHOOTER       // 100+ kills
  TEAM_PLAYER        // Member of 3+ teams
}

model Badge {
  id          Int        @id
  type        BadgeType  @unique
  name        String
  description String
  iconUrl     String?
}

model UserBadge {
  userId      Int
  badgeId     Int
  earnedAt    DateTime   @default(now())
}
```

### Achievement System
```prisma
enum AchievementType {
  TOURNAMENT_PARTICIPATION
  TOURNAMENT_WIN
  TEAM_CREATED
  TOWER_CREATED
  MVP_EARNED
  KILLS_MILESTONE
  WINS_MILESTONE
}

model Achievement {
  id          Int
  type        AchievementType
  name        String
  description String
  iconUrl     String?
  xpReward    Int        @default(0)
}

model UserAchievement {
  userId        Int
  achievementId Int
  progress      Int        @default(0)
  completed     Boolean    @default(false)
  completedAt   DateTime?
}
```

---

## 🚀 API Endpoints

### Get Complete Profile Overview
```http
GET /profile/overview
Authorization: Bearer <token>

Response: {
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "bio": "Pro BGMI player",
  "avatarUrl": "/uploads/avatar.jpg",
  "gameId": "BGMI123456",
  "instagramUrl": "https://instagram.com/johndoe",
  "youtubeUrl": "https://youtube.com/@johndoe",
  "discordUrl": "johndoe#1234",
  "customTagline": "Born to win!",
  "role": "PLAYER",
  "level": 5,
  "xp": 250,
  "currentTower": {
    "id": 1,
    "name": "Elite Squad",
    "logoUrl": "/uploads/tower.jpg",
    "code": "ABC123",
    "maxTeams": 10,
    "_count": {
      "teams": 5,
      "members": 15
    }
  },
  "towerRole": "OWNER",
  "currentTeam": {
    "id": 1,
    "name": "Team Alpha",
    "logoUrl": "/uploads/team.jpg",
    "tower": {
      "id": 1,
      "name": "Elite Squad"
    }
  },
  "teamRole": "CAPTAIN"
}
```

### Get Performance Stats
```http
GET /profile/stats
Authorization: Bearer <token>

Response: {
  "id": 1,
  "username": "johndoe",
  "avatarUrl": "/uploads/avatar.jpg",
  "matchesPlayed": 45,
  "matchesWon": 23,
  "kills": 156,
  "deaths": 78,
  "wins": 23,
  "mvpCount": 8,
  "performancePoints": 1250,
  "level": 5,
  "xp": 250,
  "kdRatio": 2.0,
  "winRate": 51.1,
  "badges": [
    {
      "id": 1,
      "earnedAt": "2024-01-15T10:00:00.000Z",
      "badge": {
        "id": 1,
        "type": "FIRST_TOURNAMENT",
        "name": "Tournament Debut",
        "description": "Participated in your first tournament",
        "iconUrl": "/badges/first-tournament.png"
      }
    }
  ]
}
```

### Get Tournament History
```http
GET /profile/tournaments
Authorization: Bearer <token>

Response: {
  "ongoing": [
    {
      "id": 1,
      "tournament": {
        "id": 1,
        "title": "BGMI Championship",
        "game": "BGMI",
        "logoUrl": "/uploads/tournament.jpg",
        "status": "LIVE",
        "matchDateTime": "2024-12-31T18:00:00.000Z"
      },
      "team": {
        "id": 1,
        "name": "Team Alpha",
        "logoUrl": "/uploads/team.jpg"
      },
      "status": "APPROVED"
    }
  ],
  "completed": [
    {
      "id": 2,
      "tournament": {
        "id": 2,
        "title": "Winter Cup",
        "game": "BGMI",
        "status": "COMPLETED"
      },
      "team": {
        "id": 1,
        "name": "Team Alpha"
      }
    }
  ],
  "totalParticipated": 10,
  "totalWins": 3,
  "achievements": {
    "firstTournament": true,
    "veteran": true,
    "champion": false
  }
}
```

### Get Achievements & Badges
```http
GET /profile/achievements
Authorization: Bearer <token>

Response: {
  "badges": [
    {
      "id": 1,
      "earnedAt": "2024-01-15T10:00:00.000Z",
      "badge": {
        "type": "FIRST_TOURNAMENT",
        "name": "Tournament Debut",
        "description": "Participated in your first tournament",
        "iconUrl": "/badges/first-tournament.png"
      }
    },
    {
      "id": 2,
      "earnedAt": "2024-01-20T14:30:00.000Z",
      "badge": {
        "type": "TOWER_OWNER",
        "name": "Tower Master",
        "description": "Created and own a tower",
        "iconUrl": "/badges/tower-owner.png"
      }
    }
  ],
  "achievements": [
    {
      "id": 1,
      "progress": 1,
      "completed": true,
      "completedAt": "2024-01-15T10:00:00.000Z",
      "achievement": {
        "type": "TOURNAMENT_PARTICIPATION",
        "name": "Tournament Participant",
        "description": "Participate in a tournament",
        "xpReward": 50
      }
    }
  ],
  "totalBadges": 2,
  "totalAchievements": 1
}
```

### Update Profile
```http
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "Updated bio",
  "avatarUrl": "/uploads/new-avatar.jpg",
  "gameId": "BGMI999999",
  "instagramUrl": "https://instagram.com/johndoe",
  "youtubeUrl": "https://youtube.com/@johndoe",
  "discordUrl": "johndoe#1234",
  "customTagline": "Never give up!"
}

Response: {
  "id": 1,
  "name": "John Doe Updated",
  "username": "johndoe",
  ...
}
```

### Update Notification Preferences
```http
PUT /profile/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "notifyTournaments": true,
  "notifyTeams": false,
  "notifyTowers": true
}

Response: {
  "id": 1,
  "notifyTournaments": true,
  "notifyTeams": false,
  "notifyTowers": true
}
```

### Change Password
```http
PUT /profile/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}

Response: {
  "message": "Password changed successfully"
}
```

### Get Public Profile (by username)
```http
GET /profile/johndoe

Response: {
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Pro BGMI player",
  "avatarUrl": "/uploads/avatar.jpg",
  "gameId": "BGMI123456",
  "instagramUrl": "https://instagram.com/johndoe",
  "youtubeUrl": "https://youtube.com/@johndoe",
  "customTagline": "Born to win!",
  "role": "PLAYER",
  "level": 5,
  "xp": 250,
  "matchesPlayed": 45,
  "matchesWon": 23,
  "kills": 156,
  "deaths": 78,
  "wins": 23,
  "mvpCount": 8,
  "kdRatio": 2.0,
  "winRate": 51.1,
  "badges": [...],
  "teamMemberships": [...],
  "ledTowers": [...]
}
```

---

## 🎮 Gamification System

### Level & XP System
- **Level 1**: 0-100 XP
- **Level 2**: 100-200 XP
- **Level 3**: 200-300 XP
- Formula: `Next Level = Current Level * 100 XP`

### XP Rewards
- **Tournament Participation**: 50 XP
- **Tournament Win**: 200 XP
- **Team Created**: 30 XP
- **Tower Created**: 50 XP
- **MVP Earned**: 25 XP
- **Kill Milestone**: 10 XP
- **Win Milestone**: 15 XP

### Badge Types
1. **First Tournament** - Participate in first tournament
2. **First Win** - Win first match
3. **Tower Owner** - Create a tower
4. **Team Captain** - Become team captain
5. **MVP Master** - Earn MVP 10 times
6. **Tournament Winner** - Win a tournament
7. **Organizer** - Become approved organizer
8. **Veteran** - Play 50+ matches
9. **Sharpshooter** - Achieve 100+ kills
10. **Team Player** - Join 3+ teams

### Achievement Types
1. **Tournament Participation** - Join tournaments
2. **Tournament Win** - Win tournaments
3. **Team Created** - Create teams
4. **Tower Created** - Create towers
5. **MVP Earned** - Earn MVP awards
6. **Kills Milestone** - Reach kill milestones
7. **Wins Milestone** - Reach win milestones

---

## 🔧 Helper Functions

### Award Badge
```javascript
const { awardBadge } = require('./routes/profile.routes');

// Award badge to user
await awardBadge(userId, 'FIRST_TOURNAMENT');
```

### Update Achievement
```javascript
const { updateAchievement } = require('./routes/profile.routes');

// Update achievement progress
await updateAchievement(userId, 'KILLS_MILESTONE', 10);
```

### Add XP
```javascript
const { addXP } = require('./routes/profile.routes');

// Add XP and auto level-up
const result = await addXP(userId, 50);
// Returns: { newLevel, newXP, leveledUp: true/false }
```

---

## 📱 Profile Tabs/Sections

### Frontend Structure
```
Profile Page
├── Overview Tab
│   ├── Basic Info (avatar, name, username, bio)
│   ├── Social Links (Instagram, YouTube, Discord)
│   ├── Game Info (Game ID, tagline)
│   ├── Current Tower (name, role, stats)
│   └── Current Team (name, role, logo)
│
├── Stats Tab
│   ├── Performance Metrics
│   │   ├── Matches Played
│   │   ├── Matches Won
│   │   ├── K/D Ratio
│   │   ├── Win Rate
│   │   └── MVP Count
│   ├── Level & XP Progress Bar
│   └── Recent Badges (top 5)
│
├── Tournaments Tab
│   ├── Ongoing Tournaments
│   ├── Tournament History
│   ├── Tournament Wins
│   └── Achievements Unlocked
│
├── Achievements Tab
│   ├── Earned Badges (grid view)
│   ├── Achievement Progress
│   ├── Locked Achievements
│   └── Total XP Earned
│
└── Settings Tab
    ├── Edit Profile
    ├── Change Password
    ├── Notification Preferences
    ├── Apply for Organizer
    └── Logout
```

---

## 🎯 Auto-Award Logic

### When to Award Badges

**Tower Owner Badge**
```javascript
// In towers.routes.js - after tower creation
const { awardBadge } = require('./profile.routes');
await awardBadge(req.userId, 'TOWER_OWNER');
```

**Team Captain Badge**
```javascript
// In teams.routes.js - when assigned as captain
await awardBadge(captainId, 'TEAM_CAPTAIN');
```

**First Tournament Badge**
```javascript
// In registrations.routes.js - first tournament registration
const registrationCount = await prisma.tournamentRegistration.count({
  where: { createdByUserId: req.userId }
});
if (registrationCount === 1) {
  await awardBadge(req.userId, 'FIRST_TOURNAMENT');
}
```

**Organizer Badge**
```javascript
// In organizer.routes.js - when approved
await awardBadge(application.userId, 'ORGANIZER');
```

---

## 🚀 Setup Instructions

### 1. Update Database
```bash
npx prisma db push
```

### 2. Seed Badges & Achievements
```bash
node src/lib/seedBadgesAchievements.js
```

### 3. Test Endpoints
```bash
# Get profile overview
curl -H "Authorization: Bearer <token>" http://localhost:5000/profile/overview

# Get stats
curl -H "Authorization: Bearer <token>" http://localhost:5000/profile/stats

# Update profile
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated bio"}' \
  http://localhost:5000/profile
```

---

## ✅ Features Checklist

### Basic Info ✅
- [x] Profile photo (avatarUrl)
- [x] Username (unique)
- [x] Name (optional)
- [x] Bio
- [x] Mobile (hidden, for login)
- [x] Email (optional)

### Game & Team Info ✅
- [x] Current tower with role
- [x] Current team with role
- [x] Team name & logo
- [x] Game ID

### Tournament Info ✅
- [x] Participated tournaments list
- [x] Ongoing tournaments
- [x] Tournament wins
- [x] Achievements

### Performance Stats ✅
- [x] Matches played
- [x] Matches won
- [x] K/D Ratio
- [x] MVP count
- [x] Total points earned
- [x] Win rate percentage

### Social/External ✅
- [x] Instagram link
- [x] YouTube link
- [x] Discord link
- [x] Custom tagline

### Settings ✅
- [x] Password change
- [x] Notification preferences
- [x] Apply for organizer
- [x] Profile update

### Gamification ✅
- [x] Badges (10 types)
- [x] Levels & XP system
- [x] Achievements (7 types)
- [x] Auto-award logic

---

**Complete Profile System Implemented! 🎉**
