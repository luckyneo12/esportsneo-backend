# 🏆 Complete Leaderboard System

## ✨ Overview

Multi-level leaderboard system with:
- **Player Leaderboard** - Global player rankings
- **Tower Leaderboard** - Tower rankings by points
- **Team Leaderboard** - Team rankings by combined performance
- **Tournament Winners** - Historical winners showcase
- **Detailed Player Stats** - Complete player profile with rank

---

## 📊 Leaderboard Types

### 1. Player Leaderboard (Global)
**Shows:**
- Rank (position)
- Player name, username, avatar
- Game ID
- Role (PLAYER/ORGANISER/SUPER_ADMIN)
- Level & XP
- Performance points
- Matches played/won
- K/D ratio
- Win rate %
- Kills, deaths, wins
- MVP count
- Current tower
- Current team
- Tournaments played
- Ongoing tournaments
- Top 3 badges

### 2. Tower Leaderboard (Global)
**Shows:**
- Rank (position)
- Tower name, logo, banner
- Tower code
- Level & XP
- Total points
- Tournaments participated
- Tournaments won
- Total members
- Total teams
- Tower leader info
- Top 3 badges

### 3. Team Leaderboard (Global)
**Shows:**
- Rank (position)
- Team name, logo
- Tower info
- Captain info
- Member count
- Total performance points (combined)
- Total kills (combined)
- Total deaths (combined)
- Team K/D ratio
- Total MVPs (combined)
- Tournaments played
- Ongoing tournaments
- All team members with stats

### 4. Tournament Winners
**Shows:**
- Tournament title
- Game
- Match date
- Top 3 winning teams:
  - Position (1st, 2nd, 3rd)
  - Team name, logo
  - Tower info
  - Captain info
  - All team members

### 5. Player Detail (Full Stats)
**Shows:**
- Global rank
- Complete player profile
- All stats (K/D, win rate, MVP, etc.)
- Current tower with stats
- All teams (captain + member)
- Tournament history:
  - Total tournaments
  - Ongoing tournaments
  - Completed tournaments
- All badges earned
- All achievements (completed & in-progress)
- Social links

---

## 🚀 API Endpoints

### 1. Get Player Leaderboard
```http
GET /leaderboard/players?limit=50&offset=0

Response: {
  "leaderboard": [
    {
      "rank": 1,
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "avatarUrl": "/uploads/avatar.jpg",
      "gameId": "BGMI123456",
      "role": "PLAYER",
      "level": 10,
      "xp": 5000,
      "performancePoints": 2500,
      "matchesPlayed": 100,
      "matchesWon": 60,
      "kills": 500,
      "deaths": 250,
      "wins": 60,
      "mvpCount": 15,
      "kdRatio": 2.0,
      "winRate": 60.0,
      "currentTower": {
        "id": 1,
        "name": "Elite Squad",
        "logoUrl": "/uploads/tower.jpg"
      },
      "currentTeam": {
        "id": 1,
        "name": "Team Alpha",
        "logoUrl": "/uploads/team.jpg"
      },
      "tournamentsPlayed": 10,
      "ongoingTournaments": 2,
      "badges": [
        {
          "type": "FIRST_TOURNAMENT",
          "name": "Tournament Debut",
          "iconUrl": "/badges/first-tournament.png"
        }
      ]
    },
    {
      "rank": 2,
      "id": 2,
      "name": "Jane Smith",
      ...
    }
  ],
  "pagination": {
    "total": 1000,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### 2. Get Tower Leaderboard
```http
GET /leaderboard/towers?limit=50&offset=0

Response: {
  "leaderboard": [
    {
      "rank": 1,
      "id": 1,
      "name": "Elite Squad",
      "logoUrl": "/uploads/tower-logo.jpg",
      "bannerUrl": "/uploads/tower-banner.jpg",
      "code": "ABC123",
      "level": 5,
      "xp": 2500,
      "totalPoints": 10000,
      "tournamentsParticipated": 15,
      "tournamentsWon": 3,
      "totalMembers": 25,
      "totalTeams": 5,
      "leader": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe",
        "avatarUrl": "/uploads/avatar.jpg"
      },
      "badges": [
        {
          "type": "TOURNAMENT_WINNER",
          "name": "Champion Tower",
          "iconUrl": "/badges/champion.png"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### 3. Get Team Leaderboard
```http
GET /leaderboard/teams?limit=50&offset=0

Response: {
  "leaderboard": [
    {
      "rank": 1,
      "id": 1,
      "name": "Team Alpha",
      "logoUrl": "/uploads/team-logo.jpg",
      "tower": {
        "id": 1,
        "name": "Elite Squad",
        "logoUrl": "/uploads/tower.jpg"
      },
      "captain": {
        "id": 5,
        "name": "Captain Name",
        "username": "captain",
        "avatarUrl": "/uploads/avatar.jpg",
        "performancePoints": 1500
      },
      "memberCount": 4,
      "totalPoints": 5000,
      "totalKills": 800,
      "totalDeaths": 400,
      "teamKD": 2.0,
      "totalMVPs": 20,
      "tournamentsPlayed": 8,
      "ongoingTournaments": 1,
      "members": [
        {
          "id": 5,
          "name": "Captain Name",
          "username": "captain",
          "avatarUrl": "/uploads/avatar.jpg",
          "performancePoints": 1500
        },
        {
          "id": 6,
          "name": "Player 2",
          "performancePoints": 1200
        }
      ]
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### 4. Get Tournament Winners
```http
GET /leaderboard/tournament-winners?limit=20

Response: [
  {
    "tournamentId": 1,
    "tournamentTitle": "BGMI Championship 2024",
    "game": "BGMI",
    "matchDateTime": "2024-12-31T18:00:00.000Z",
    "winners": [
      {
        "position": 1,
        "team": {
          "id": 1,
          "name": "Team Alpha",
          "logoUrl": "/uploads/team-logo.jpg",
          "tower": {
            "id": 1,
            "name": "Elite Squad",
            "logoUrl": "/uploads/tower.jpg"
          },
          "captain": {
            "id": 5,
            "name": "Captain Name",
            "username": "captain",
            "avatarUrl": "/uploads/avatar.jpg"
          },
          "members": [
            {
              "id": 5,
              "name": "Captain Name",
              "username": "captain",
              "avatarUrl": "/uploads/avatar.jpg"
            },
            {
              "id": 6,
              "name": "Player 2",
              "username": "player2",
              "avatarUrl": "/uploads/avatar2.jpg"
            }
          ]
        }
      },
      {
        "position": 2,
        "team": {
          "id": 2,
          "name": "Team Beta",
          ...
        }
      },
      {
        "position": 3,
        "team": {
          "id": 3,
          "name": "Team Gamma",
          ...
        }
      }
    ]
  }
]
```

### 5. Get Player Detail with Full Stats
```http
GET /leaderboard/players/:userId/details

Response: {
  "rank": 1,
  "player": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "avatarUrl": "/uploads/avatar.jpg",
    "gameId": "BGMI123456",
    "bio": "Pro BGMI player",
    "role": "PLAYER",
    "level": 10,
    "xp": 5000,
    "performancePoints": 2500,
    "matchesPlayed": 100,
    "matchesWon": 60,
    "kills": 500,
    "deaths": 250,
    "wins": 60,
    "mvpCount": 15,
    "kdRatio": 2.0,
    "winRate": 60.0,
    "instagramUrl": "https://instagram.com/johndoe",
    "youtubeUrl": "https://youtube.com/@johndoe",
    "discordUrl": "johndoe#1234",
    "customTagline": "Born to win!"
  },
  "currentTower": {
    "id": 1,
    "name": "Elite Squad",
    "logoUrl": "/uploads/tower.jpg",
    "code": "ABC123",
    "_count": {
      "members": 24,
      "teams": 5
    }
  },
  "teams": [
    {
      "id": 1,
      "name": "Team Alpha",
      "logoUrl": "/uploads/team-logo.jpg",
      "tower": {
        "id": 1,
        "name": "Elite Squad"
      },
      "captain": {
        "id": 1,
        "name": "John Doe"
      },
      "members": [...]
    }
  ],
  "tournaments": {
    "total": 10,
    "ongoing": [
      {
        "id": 1,
        "tournament": {
          "id": 1,
          "title": "BGMI Championship",
          "game": "BGMI",
          "status": "LIVE",
          "matchDateTime": "2024-12-31T18:00:00.000Z"
        },
        "team": {
          "id": 1,
          "name": "Team Alpha",
          "logoUrl": "/uploads/team-logo.jpg"
        },
        "status": "APPROVED"
      }
    ],
    "completed": [...]
  },
  "badges": [
    {
      "type": "FIRST_TOURNAMENT",
      "name": "Tournament Debut",
      "description": "Participated in your first tournament",
      "iconUrl": "/badges/first-tournament.png",
      "earnedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "achievements": [
    {
      "type": "TOURNAMENT_PARTICIPATION",
      "name": "Tournament Participant",
      "description": "Participate in a tournament",
      "iconUrl": "/achievements/tournament.png",
      "progress": 10,
      "completed": true,
      "completedAt": "2024-01-15T10:00:00.000Z",
      "xpReward": 50
    }
  ]
}
```

---

## 📱 Frontend Display Structure

### Player Leaderboard Page
```
┌─────────────────────────────────────────┐
│  🏆 Player Leaderboard                  │
├─────────────────────────────────────────┤
│  Rank | Avatar | Name | Tower | Team    │
│   1   |   👤   | John | Elite | Alpha   │
│       |        | K/D: 2.0 | WR: 60%     │
│       |        | Points: 2500 | MVP: 15  │
│       |        | Tournaments: 10         │
│       |        | 🏆🥇⭐ (badges)          │
├─────────────────────────────────────────┤
│   2   |   👤   | Jane | Pro   | Beta    │
│       |        | K/D: 1.8 | WR: 55%     │
│       |        | Points: 2200 | MVP: 12  │
└─────────────────────────────────────────┘
```

### Tower Leaderboard Page
```
┌─────────────────────────────────────────┐
│  🏰 Tower Leaderboard                   │
├─────────────────────────────────────────┤
│  Rank | Logo | Name | Leader | Stats    │
│   1   |  🏰  | Elite| John   | 25 👥    │
│       |      | Squad|        | 5 Teams  │
│       |      | Points: 10000 | Lvl: 5   │
│       |      | Tournaments: 15 | Won: 3  │
│       |      | 🏆🥇⭐ (badges)          │
└─────────────────────────────────────────┘
```

### Team Leaderboard Page
```
┌─────────────────────────────────────────┐
│  👥 Team Leaderboard                    │
├─────────────────────────────────────────┤
│  Rank | Logo | Name | Tower | Captain  │
│   1   |  ⚔️  | Alpha| Elite | Captain  │
│       |      | Members: 4 | Points: 5K │
│       |      | Team K/D: 2.0 | MVPs: 20│
│       |      | Tournaments: 8          │
│       |      | [Member1][Member2]...   │
└─────────────────────────────────────────┘
```

### Tournament Winners Page
```
┌─────────────────────────────────────────┐
│  🏅 Tournament Winners                  │
├─────────────────────────────────────────┤
│  BGMI Championship 2024                 │
│  📅 Dec 31, 2024                        │
│                                         │
│  🥇 1st Place: Team Alpha (Elite Squad) │
│     Captain: John Doe                   │
│     Members: [👤][👤][👤][👤]          │
│                                         │
│  🥈 2nd Place: Team Beta (Pro Squad)    │
│  🥉 3rd Place: Team Gamma (Elite Squad) │
├─────────────────────────────────────────┤
│  Winter Cup 2024                        │
│  ...                                    │
└─────────────────────────────────────────┘
```

### Player Detail Page
```
┌─────────────────────────────────────────┐
│  👤 John Doe (@johndoe)                 │
│  🏆 Global Rank: #1                     │
├─────────────────────────────────────────┤
│  📊 Stats                               │
│  Performance Points: 2500               │
│  Level: 10 | XP: 5000                   │
│  K/D: 2.0 | Win Rate: 60%              │
│  Matches: 100 | Wins: 60 | MVP: 15     │
├─────────────────────────────────────────┤
│  🏰 Current Tower: Elite Squad          │
│  👥 Current Team: Team Alpha (Captain)  │
├─────────────────────────────────────────┤
│  🎮 Tournaments                         │
│  Total: 10 | Ongoing: 2 | Won: 3       │
│  [Tournament 1] [Tournament 2]...       │
├─────────────────────────────────────────┤
│  🏆 Badges (5)                          │
│  [🏆][🥇][⭐][🎯][👑]                  │
├─────────────────────────────────────────┤
│  🎯 Achievements (7/10 completed)       │
│  ✅ Tournament Participant (+50 XP)    │
│  ✅ First Win (+25 XP)                 │
│  🔒 MVP Master (8/10 progress)         │
└─────────────────────────────────────────┘
```

---

## 🎯 Ranking Criteria

### Player Ranking
**Primary:** Performance Points  
**Secondary:** Level, XP, K/D ratio

### Tower Ranking
**Primary:** Total Points  
**Secondary:** Tournaments Won, Level

### Team Ranking
**Primary:** Combined Performance Points  
**Secondary:** Team K/D, Total MVPs

---

## ✅ Features Checklist

### Player Leaderboard ✅
- [x] Global ranking
- [x] Performance points
- [x] K/D ratio & win rate
- [x] Current tower & team
- [x] Tournaments played
- [x] Badges showcase
- [x] Pagination support

### Tower Leaderboard ✅
- [x] Global ranking
- [x] Total points
- [x] Tournaments participated/won
- [x] Member & team count
- [x] Leader info
- [x] Badges showcase
- [x] Pagination support

### Team Leaderboard ✅
- [x] Global ranking
- [x] Combined performance points
- [x] Team K/D ratio
- [x] Total MVPs
- [x] Tournaments played
- [x] All members list
- [x] Pagination support

### Tournament Winners ✅
- [x] Historical winners
- [x] Top 3 positions
- [x] Team details
- [x] Member details
- [x] Tournament info

### Player Detail ✅
- [x] Global rank
- [x] Complete stats
- [x] Current tower & teams
- [x] Tournament history
- [x] All badges
- [x] All achievements
- [x] Social links

---

## 🚀 Testing

```bash
# Get player leaderboard
curl http://localhost:3001/leaderboard/players

# Get tower leaderboard
curl http://localhost:3001/leaderboard/towers

# Get team leaderboard
curl http://localhost:3001/leaderboard/teams

# Get tournament winners
curl http://localhost:3001/leaderboard/tournament-winners

# Get player detail
curl http://localhost:3001/leaderboard/players/1/details
```

---

**Complete Multi-Level Leaderboard System Ready! 🏆**
