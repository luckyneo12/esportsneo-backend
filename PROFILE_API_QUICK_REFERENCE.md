# 👤 Profile API - Quick Reference

## 📋 All Profile Endpoints

### 1. Get Complete Profile Overview
```bash
GET /profile/overview
Authorization: Bearer <token>

# Returns: Basic info + current tower + current team + roles
```

### 2. Get Performance Stats
```bash
GET /profile/stats
Authorization: Bearer <token>

# Returns: Matches, K/D ratio, MVP count, badges, level, XP
```

### 3. Get Tournament History
```bash
GET /profile/tournaments
Authorization: Bearer <token>

# Returns: Ongoing tournaments, completed, wins, achievements
```

### 4. Get Achievements & Badges
```bash
GET /profile/achievements
Authorization: Bearer <token>

# Returns: All badges earned, achievement progress, XP rewards
```

### 5. Update Profile
```bash
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Pro gamer",
  "avatarUrl": "/uploads/avatar.jpg",
  "gameId": "BGMI123456",
  "instagramUrl": "https://instagram.com/username",
  "youtubeUrl": "https://youtube.com/@username",
  "discordUrl": "username#1234",
  "customTagline": "Born to win!"
}
```

### 6. Update Notification Preferences
```bash
PUT /profile/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "notifyTournaments": true,
  "notifyTeams": false,
  "notifyTowers": true
}
```

### 7. Change Password
```bash
PUT /profile/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### 8. Get Public Profile
```bash
GET /profile/:username

# No auth required
# Returns: Public profile info, stats, badges, teams, towers
```

---

## 🎮 Profile Data Structure

### Overview Response
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
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
    "code": "ABC123"
  },
  "towerRole": "OWNER",
  "currentTeam": {
    "id": 1,
    "name": "Team Alpha",
    "logoUrl": "/uploads/team.jpg"
  },
  "teamRole": "CAPTAIN"
}
```

### Stats Response
```json
{
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
  "badges": [...]
}
```

---

## 🏆 Badges (10 Types)

| Badge | Type | Description |
|-------|------|-------------|
| 🏆 Tournament Debut | FIRST_TOURNAMENT | First tournament participation |
| 🥇 First Victory | FIRST_WIN | First match win |
| 🏰 Tower Master | TOWER_OWNER | Created a tower |
| 👑 Team Leader | TEAM_CAPTAIN | Team captain |
| ⭐ MVP Master | MVP_MASTER | 10+ MVP awards |
| 🏅 Champion | TOURNAMENT_WINNER | Tournament winner |
| 📋 Event Organizer | ORGANIZER | Approved organizer |
| 🎖️ Veteran Player | VETERAN | 50+ matches |
| 🎯 Sharpshooter | SHARPSHOOTER | 100+ kills |
| 🤝 Team Player | TEAM_PLAYER | 3+ teams |

---

## 🎯 Achievements (7 Types)

| Achievement | Type | XP Reward |
|-------------|------|-----------|
| Tournament Participant | TOURNAMENT_PARTICIPATION | 50 XP |
| Tournament Victor | TOURNAMENT_WIN | 200 XP |
| Team Founder | TEAM_CREATED | 30 XP |
| Tower Founder | TOWER_CREATED | 50 XP |
| MVP Award | MVP_EARNED | 25 XP |
| Kill Streak | KILLS_MILESTONE | 10 XP |
| Winning Streak | WINS_MILESTONE | 15 XP |

---

## 📊 Stats Calculations

### K/D Ratio
```
K/D = Kills / Deaths
If deaths = 0, K/D = Kills
```

### Win Rate
```
Win Rate = (Matches Won / Matches Played) * 100
```

### Level Up Formula
```
XP for Next Level = Current Level * 100
Example:
- Level 1 → Level 2: 100 XP
- Level 2 → Level 3: 200 XP
- Level 3 → Level 4: 300 XP
```

---

## 🔧 Testing Commands

### Get Profile Overview
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/profile/overview
```

### Get Stats
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/profile/stats
```

### Update Profile
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "gameId": "BGMI999999",
    "customTagline": "Never give up!"
  }' \
  http://localhost:5000/profile
```

### Change Password
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass",
    "newPassword": "newpass123"
  }' \
  http://localhost:5000/profile/password
```

### Get Public Profile
```bash
curl http://localhost:5000/profile/johndoe
```

---

## 🎨 Frontend Integration

### Profile Tabs Structure
```
1. Overview
   - Basic info
   - Social links
   - Current tower & team
   - Level & XP

2. Stats
   - Performance metrics
   - K/D ratio, win rate
   - Badges showcase

3. Tournaments
   - Ongoing tournaments
   - History
   - Wins & achievements

4. Achievements
   - Badges grid
   - Achievement progress
   - Locked achievements

5. Settings
   - Edit profile
   - Change password
   - Notifications
   - Apply for organizer
```

---

## ✅ Quick Checklist

### Profile Fields
- [x] Avatar, username, name, bio
- [x] Game ID (BGMI, FF etc.)
- [x] Social links (Instagram, YouTube, Discord)
- [x] Custom tagline
- [x] Mobile (hidden)
- [x] Email (optional)

### Game Info
- [x] Current tower & role
- [x] Current team & role
- [x] Team logo & name

### Stats
- [x] Matches played/won
- [x] K/D ratio
- [x] MVP count
- [x] Win rate
- [x] Performance points

### Gamification
- [x] Level & XP
- [x] Badges (10 types)
- [x] Achievements (7 types)
- [x] Auto-award logic

### Settings
- [x] Password change
- [x] Notification preferences
- [x] Profile update

---

**Complete Profile API Ready! 🚀**
