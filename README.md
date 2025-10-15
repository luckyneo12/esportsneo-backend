# 🏆 Esports Tournament Management System

A complete backend system for managing esports tournaments with towers (groups) and teams. Built with Node.js, Express, Prisma, and MySQL.

## ✨ Features

### 🎮 Core Functionality
- **User Management** - Registration, authentication, profiles with roles
- **Tower System** - Create groups with unique join codes, manage members and co-leaders
- **Team Management** - Create teams within towers, add members, assign captains
- **Tournament System** - Create tournaments with banners, logos, and descriptions
- **Registration Flow** - Register teams for tournaments with comprehensive validations
- **File Upload** - Upload avatars, team logos, and tournament banners

### 🔒 Security & Validation
- JWT-based authentication
- Role-based access control (PLAYER, TOWER_OWNER, ORGANISER, ADMIN)
- Comprehensive registration validations:
  - ✅ Duplicate team check
  - ✅ MaxTeams limit enforcement
  - ✅ Team name uniqueness in tournaments
  - ✅ Authorization checks (only tower owner/co-leader can register)

### 📊 Key Entities

**User** → **Tower** → **Team** → **Tournament Registration**

- Users can create/join towers
- Tower owners/co-leaders create teams
- Teams register for tournaments
- Organizers approve/reject registrations

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MySQL database
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Update database schema
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Start development server
npm run dev
```

Server runs at: `http://localhost:5000`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference with examples |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Detailed setup and deployment guide |
| [QUICK_START.md](./QUICK_START.md) | Quick testing guide with curl commands |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | System design and architecture diagrams |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Feature checklist and implementation details |
| [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) | Comprehensive testing scenarios |

---

## 🎯 API Endpoints Overview

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/me` - Get own profile
- `PUT /users/me` - Update profile
- `GET /users/:userId` - Get user by ID
- `GET /users/:userId/teams` - Get user's teams
- `GET /users/:userId/towers` - Get user's towers

### Towers
- `POST /towers` - Create tower
- `POST /towers/join` - Join tower with code
- `GET /towers/:towerId` - Get tower details
- `POST /towers/:towerId/members/:memberId/approve` - Approve member
- `DELETE /towers/:towerId/members/:memberId` - Remove member
- `POST /towers/:towerId/coleaders/:userId` - Promote to co-leader

### Teams
- `POST /towers/:towerId/teams` - Create team
- `POST /teams/:teamId/members` - Add team member
- `GET /towers/:towerId/teams` - Get tower's teams
- `GET /teams/:teamId` - Get team details

### Tournaments
- `POST /tournaments` - Create tournament
- `GET /tournaments` - List tournaments
- `GET /tournaments/:tournamentId` - Get tournament details

### Registrations
- `POST /tournaments/:tournamentId/registrations` - Register team
- `POST /tournaments/:tournamentId/registrations/:id/approve` - Approve
- `POST /tournaments/:tournamentId/registrations/:id/reject` - Reject
- `GET /tournaments/:tournamentId/registrations` - List registrations

### Upload
- `POST /upload` - Upload single file
- `POST /upload/multiple` - Upload multiple files

---

## 🔄 Complete Flow Example

### 1. User Registration
```bash
POST /auth/register
{
  "name": "John Doe",
  "username": "johndoe",
  "mobile": "9876543210",
  "password": "secure123"
}
```

### 2. Create Tower
```bash
POST /towers
Authorization: Bearer <token>
{
  "name": "Elite Squad"
}
# Returns: { id: 1, code: "ABC123", ... }
```

### 3. Create Team
```bash
POST /towers/1/teams
Authorization: Bearer <token>
{
  "name": "Team Alpha",
  "logoUrl": "/uploads/logo.jpg"
}
```

### 4. Create Tournament
```bash
POST /tournaments
Authorization: Bearer <token>
{
  "title": "BGMI Championship 2024",
  "game": "BGMI",
  "maxTeams": 16,
  "matchDateTime": "2024-12-31T18:00:00Z"
}
```

### 5. Register Team
```bash
POST /tournaments/1/registrations
Authorization: Bearer <token>
{
  "teamId": 1
}
# Validates: duplicate, maxTeams, unique name, authorization
```

### 6. Approve Registration
```bash
POST /tournaments/1/registrations/1/approve
Authorization: Bearer <organizer_token>
# Team is now in the tournament!
```

---

## 🗄️ Database Schema

### Key Models

**User**
- Roles: PLAYER, TOWER_OWNER, ORGANISER, ADMIN
- Profile: name, username, mobile, email, bio, avatar
- Stats: matchesPlayed, winRatio, performancePoints

**Tower**
- Unique join code
- Leader and co-leaders
- Contains teams

**Team**
- Unique name within tower
- Logo and captain
- Members list

**Tournament**
- Title, game, description
- Banner and logo
- Status: UPCOMING, LIVE, COMPLETED
- MaxTeams limit

**TournamentRegistration**
- Links team to tournament
- Status: PENDING, APPROVED, REJECTED
- Tracks creator and approver

---

## 🔐 Authorization Rules

| Action | Required Role/Permission |
|--------|-------------------------|
| Create Tower | Any authenticated user |
| Join Tower | Any authenticated user |
| Create Team | Tower owner or co-leader |
| Add Team Member | Tower owner or co-leader |
| Create Tournament | Any authenticated user (becomes organizer) |
| Register Team | Tower owner or co-leader of team's tower |
| Approve Registration | Tournament organizer |

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **CORS**: cors

---

## 📦 Project Structure

```
esports_backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── index.js
│   ├── lib/
│   │   ├── prisma.js
│   │   └── upload.js
│   ├── middlewares/
│   │   └── auth.js
│   └── routes/
│       ├── auth.routes.js
│       ├── users.routes.js
│       ├── towers.routes.js
│       ├── teams.routes.js
│       ├── tournaments.routes.js
│       ├── registrations.routes.js
│       ├── upload.routes.js
│       └── index.js
├── uploads/
├── .env
└── package.json
```

---

## 🧪 Testing

### Manual Testing
```bash
# See QUICK_START.md for curl commands
# See TESTING_CHECKLIST.md for comprehensive test scenarios
```

### Database Inspection
```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🌐 Environment Variables

```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

---

## 📝 Key Features Implementation

### ✅ Tournament Registration Validations

1. **Duplicate Team Check**
   - Prevents same team from registering twice
   - Returns 409 Conflict error

2. **MaxTeams Enforcement**
   - Counts approved registrations
   - Blocks registration if limit reached
   - Returns 400 Bad Request error

3. **Team Name Uniqueness**
   - Checks if team name already exists in tournament
   - Prevents confusion with duplicate names
   - Returns 409 Conflict error

4. **Authorization Check**
   - Only tower owner or co-leader can register teams
   - Returns 403 Forbidden error for unauthorized users

### ✅ File Upload System

- Supports: JPEG, JPG, PNG, GIF, WEBP
- Max size: 5MB per file
- Unique filename generation
- Served via `/uploads/` route
- Used for avatars, team logos, tournament banners

---

## 🚀 Deployment

### Production Setup

1. **Set Environment Variables**
   ```bash
   DATABASE_URL="production_database_url"
   JWT_SECRET="strong_random_secret"
   NODE_ENV="production"
   ```

2. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Start Server**
   ```bash
   npm start
   ```

### Recommended Hosting
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Database**: PlanetScale, AWS RDS, DigitalOcean Managed MySQL
- **File Storage**: AWS S3, Cloudinary, DigitalOcean Spaces

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

ISC License

---

## 👥 Support

For issues or questions:
- Check documentation files
- Review error logs
- Inspect database with Prisma Studio
- Test endpoints with Postman

---

## 🎉 Acknowledgments

Built with ❤️ for the esports community

---

## 📞 Contact

For support or inquiries, please open an issue in the repository.

---

**Happy Gaming! 🎮**
