# 🏗️ System Architecture

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ name, username (unique), mobile (unique)                         │
│ email (unique), password, bio, avatarUrl                         │
│ role: PLAYER | TOWER_OWNER | ORGANISER | ADMIN                  │
│ matchesPlayed, winRatio, performancePoints                       │
│ createdAt, updatedAt                                             │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ organizes          │ leads              │ member of
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   TOURNAMENT     │  │      TOWER       │  │   TOWER_MEMBER   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │  │ id (PK)          │
│ title            │  │ name             │  │ towerId (FK)     │
│ game             │  │ code (unique)    │  │ userId (FK)      │
│ description      │  │ leaderId (FK)    │  │ role: CO_LEADER  │
│ bannerUrl        │  │ createdAt        │  │       | MEMBER   │
│ logoUrl          │  │ updatedAt        │  │ approved         │
│ entryFee         │  └──────────────────┘  └──────────────────┘
│ maxTeams         │           │
│ matchDateTime    │           │ has teams
│ status: UPCOMING │           │
│   | LIVE         │           ▼
│   | COMPLETED    │  ┌──────────────────┐
│ createdAt        │  │      TEAM        │
│ updatedAt        │  ├──────────────────┤
└──────────────────┘  │ id (PK)          │
         │            │ name             │
         │            │ logoUrl          │
         │            │ towerId (FK)     │
         │            │ captainId (FK)   │
         │            │ createdAt        │
         │            │ updatedAt        │
         │            │ UNIQUE(towerId,  │
         │            │        name)     │
         │            └──────────────────┘
         │                     │
         │                     │ has members
         │                     │
         │                     ▼
         │            ┌──────────────────┐
         │            │   TEAM_MEMBER    │
         │            ├──────────────────┤
         │            │ id (PK)          │
         │            │ teamId (FK)      │
         │            │ userId (FK)      │
         │            │ UNIQUE(teamId,   │
         │            │        userId)   │
         │            └──────────────────┘
         │
         │ has registrations
         │
         ▼
┌──────────────────────────────────────┐
│   TOURNAMENT_REGISTRATION            │
├──────────────────────────────────────┤
│ id (PK)                              │
│ tournamentId (FK)                    │
│ teamId (FK)                          │
│ status: PENDING | APPROVED | REJECTED│
│ createdByUserId (FK)                 │
│ approvedByUserId (FK)                │
│ createdAt, updatedAt                 │
│ UNIQUE(tournamentId, teamId)         │
└──────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### 1. User Registration & Authentication Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ POST /auth/register
     │ {username, mobile, password, role}
     ▼
┌─────────────────┐
│  Auth Routes    │
│  - Hash password│
│  - Create user  │
│  - Generate JWT │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   Database      │
│   User created  │
│   with role     │
└────┬────────────┘
     │
     ▼
┌──────────┐
│  Client  │
│  Receives│
│  Token   │
└──────────┘
```

### 2. Tower Creation Flow
```
┌──────────┐
│  Client  │ (Tower Owner)
└────┬─────┘
     │ POST /towers {name}
     │ Authorization: Bearer token
     ▼
┌─────────────────────────┐
│  Tower Routes           │
│  - Verify auth          │
│  - Generate unique code │
│  - Create tower         │
│  - Add owner as member  │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Database Transaction   │
│  1. Create Tower        │
│  2. Create TowerMember  │
│     (role: CO_LEADER)   │
└────┬────────────────────┘
     │
     ▼
┌──────────┐
│  Client  │
│  Tower + │
│  Code    │
└──────────┘
```

### 3. Team Creation Flow
```
┌──────────┐
│  Client  │ (Owner/Co-Leader)
└────┬─────┘
     │ POST /towers/:id/teams
     │ {name, logoUrl, captainId}
     ▼
┌─────────────────────────┐
│  Team Routes            │
│  - Verify auth          │
│  - Check owner/co-lead  │
│  - Validate unique name │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Database               │
│  Create Team            │
│  UNIQUE(towerId, name)  │
└────┬────────────────────┘
     │
     ▼
┌──────────┐
│  Client  │
│  Team    │
│  Created │
└──────────┘
```

### 4. Tournament Registration Flow (with Validations)
```
┌──────────┐
│  Client  │ (Tower Owner/Co-Leader)
└────┬─────┘
     │ POST /tournaments/:id/registrations
     │ {teamId}
     ▼
┌─────────────────────────────────────┐
│  Registration Routes                │
│  ┌───────────────────────────────┐  │
│  │ 1. Verify user is owner/co-   │  │
│  │    leader of team's tower     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 2. Check team not already     │  │
│  │    registered                 │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 3. Check maxTeams not         │  │
│  │    exceeded                   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 4. Check team name unique     │  │
│  │    in tournament              │  │
│  └───────────────────────────────┘  │
└────┬────────────────────────────────┘
     │ All validations passed ✓
     ▼
┌─────────────────────────┐
│  Database               │
│  Create Registration    │
│  status: PENDING        │
└────┬────────────────────┘
     │
     ▼
┌──────────┐
│  Client  │
│  Reg ID  │
│  PENDING │
└──────────┘
     │
     │ Organizer approves
     ▼
┌─────────────────────────┐
│  Update Registration    │
│  status: APPROVED       │
└────┬────────────────────┘
     │
     ▼
┌──────────┐
│  Team    │
│  In      │
│Tournament│
└──────────┘
```

---

## 🔐 Authorization Matrix

| Action | Player | Tower Owner | Organiser | Admin |
|--------|--------|-------------|-----------|-------|
| Register User | ✅ | ✅ | ✅ | ✅ |
| Create Tower | ✅ | ✅ | ✅ | ✅ |
| Join Tower | ✅ | ✅ | ✅ | ✅ |
| Approve Tower Member | ❌ | ✅ (own tower) | ❌ | ✅ |
| Create Team | ❌ | ✅ (own tower) | ❌ | ✅ |
| Add Team Member | ❌ | ✅ (own tower) | ❌ | ✅ |
| Create Tournament | ✅ | ✅ | ✅ | ✅ |
| Register Team | ❌ | ✅ (own team) | ❌ | ✅ |
| Approve Registration | ❌ | ❌ | ✅ (own tournament) | ✅ |
| Upload Files | ✅ | ✅ | ✅ | ✅ |

---

## 🗂️ File Structure

```
esports_backend/
│
├── prisma/
│   └── schema.prisma          # Database schema definition
│
├── src/
│   ├── app.js                 # Express app setup, CORS, static files
│   ├── index.js               # Server entry point
│   │
│   ├── lib/
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── upload.js          # Multer configuration
│   │
│   ├── middlewares/
│   │   └── auth.js            # JWT verification middleware
│   │
│   └── routes/
│       ├── index.js           # Route aggregator
│       ├── auth.routes.js     # Register, Login
│       ├── users.routes.js    # Profile management
│       ├── towers.routes.js   # Tower CRUD, members
│       ├── teams.routes.js    # Team CRUD, members
│       ├── tournaments.routes.js  # Tournament CRUD
│       ├── registrations.routes.js # Registration + validations
│       ├── matches.routes.js  # Match management
│       └── upload.routes.js   # File upload
│
├── uploads/                   # Uploaded files directory
│
├── .env                       # Environment variables
├── package.json               # Dependencies
│
├── API_DOCUMENTATION.md       # Complete API reference
├── SETUP_GUIDE.md            # Installation & deployment
├── IMPLEMENTATION_SUMMARY.md  # Feature checklist
├── QUICK_START.md            # Quick testing guide
└── SYSTEM_ARCHITECTURE.md    # This file
```

---

## 🌐 API Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Frontend)                     │
│              React / Next.js / Mobile App                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ JSON
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Express.js Server                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Middleware Layer                     │  │
│  │  - CORS                                           │  │
│  │  - Body Parser (JSON, URL-encoded)                │  │
│  │  - Static Files (/uploads)                        │  │
│  │  - Auth Middleware (JWT verification)             │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Routes Layer                         │  │
│  │  - Auth Routes (register, login)                  │  │
│  │  - User Routes (profile, teams, towers)           │  │
│  │  - Tower Routes (CRUD, members)                   │  │
│  │  - Team Routes (CRUD, members)                    │  │
│  │  - Tournament Routes (CRUD, details)              │  │
│  │  - Registration Routes (register, approve)        │  │
│  │  - Upload Routes (single, multiple)               │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Business Logic Layer                   │  │
│  │  - Authorization checks                           │  │
│  │  - Validation logic                               │  │
│  │  - Data transformation                            │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Prisma ORM
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Prisma Client                          │
│  - Type-safe database queries                            │
│  - Automatic migrations                                  │
│  - Relation handling                                     │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MySQL Database                         │
│  - Users, Towers, Teams, Tournaments                     │
│  - Registrations, Matches, Proofs                        │
│  - Constraints, Indexes, Relations                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow

### Example: Register Team for Tournament

```
1. Client Request
   ↓
   POST /tournaments/1/registrations
   Headers: { Authorization: "Bearer eyJ..." }
   Body: { teamId: 5 }

2. Express Middleware
   ↓
   - Parse JSON body
   - Verify JWT token
   - Extract userId from token

3. Route Handler (registrations.routes.js)
   ↓
   - Parse tournamentId from URL
   - Parse teamId from body

4. Authorization Check
   ↓
   - Fetch team with tower relation
   - Call assertLeaderOrCoLeader(userId, towerId)
   - If false → 403 Forbidden

5. Validation Layer
   ↓
   - Fetch tournament with registrations
   - Check: Team already registered? → 409 Conflict
   - Check: MaxTeams exceeded? → 400 Bad Request
   - Check: Team name duplicate? → 409 Conflict

6. Database Operation (Prisma)
   ↓
   - Create TournamentRegistration
   - Include team, tower, members relations
   - Transaction ensures atomicity

7. Response
   ↓
   {
     "id": 1,
     "tournamentId": 1,
     "teamId": 5,
     "status": "PENDING",
     "team": { ... },
     "createdAt": "2024-01-01T00:00:00.000Z"
   }

8. Client receives response
   ↓
   Display success message
   Update UI with registration status
```

---

## 📦 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **CORS**: cors package

### Development
- **Process Manager**: nodemon
- **Environment**: dotenv (.env)
- **API Testing**: Postman / Thunder Client / curl

---

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Never stored in plain text
   - Never returned in responses

2. **JWT Authentication**
   - Signed tokens
   - Expiration time
   - Bearer token scheme

3. **Authorization**
   - Role-based access control
   - Resource ownership checks
   - Permission validation

4. **File Upload Security**
   - File type validation
   - Size limits (5MB)
   - Unique filename generation
   - Restricted upload directory

5. **Database Security**
   - Unique constraints
   - Foreign key constraints
   - SQL injection prevention (Prisma)

6. **CORS**
   - Whitelist allowed origins
   - Credential support
   - Method restrictions

---

## 📈 Scalability Considerations

### Current Architecture
- Single server instance
- Direct database connection
- Local file storage

### Future Enhancements
1. **Load Balancing**: Multiple server instances
2. **Caching**: Redis for sessions, frequently accessed data
3. **CDN**: Cloud storage for uploaded files (AWS S3, Cloudinary)
4. **Database**: Read replicas, connection pooling
5. **Queue System**: Background jobs (Bull, RabbitMQ)
6. **Monitoring**: Logging, error tracking (Winston, Sentry)
7. **Rate Limiting**: Prevent abuse
8. **WebSockets**: Real-time updates (Socket.io already included)

---

## 🎯 Key Design Decisions

1. **Tower as Group Concept**
   - Allows team organization
   - Unique join codes for easy onboarding
   - Co-leader system for delegation

2. **Team Name Uniqueness**
   - Unique within tower (database constraint)
   - Unique within tournament (validation logic)
   - Prevents confusion

3. **Registration Approval Flow**
   - PENDING → APPROVED/REJECTED
   - Organizer control
   - MaxTeams enforcement on approval

4. **Role-Based System**
   - Flexible permission model
   - Easy to extend
   - Clear authorization rules

5. **File Upload Strategy**
   - Local storage for simplicity
   - Easy migration to cloud
   - URL-based references

---

**System Architecture Complete! 🏗️**
