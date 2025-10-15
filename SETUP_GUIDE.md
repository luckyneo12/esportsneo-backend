# 🚀 Setup Guide - Esports Tournament Backend

## Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create/update `.env` file:
```env
DATABASE_URL="mysql://username:password@host:port/database"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

### 3. Database Migration

**Option A: If you have shadow database permissions**
```bash
npx prisma migrate dev --name tournament_tower_team_system
```

**Option B: If shadow database is not available (production/shared hosting)**
```bash
npx prisma db push
```

This will update your database schema with:
- ✅ User roles (PLAYER, TOWER_OWNER, ORGANISER, ADMIN)
- ✅ Tournament fields (title, bannerUrl, logoUrl, description)
- ✅ Team fields (logoUrl, captainId)
- ✅ Tower timestamps
- ✅ All necessary relations

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 6. Start Production Server
```bash
npm start
```

## 📁 Project Structure

```
esports_backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app.js                 # Express app configuration
│   ├── index.js               # Server entry point
│   ├── lib/
│   │   ├── prisma.js          # Prisma client
│   │   └── upload.js          # File upload configuration
│   ├── middlewares/
│   │   └── auth.js            # JWT authentication
│   └── routes/
│       ├── auth.routes.js     # Authentication endpoints
│       ├── users.routes.js    # User profile endpoints
│       ├── towers.routes.js   # Tower management
│       ├── teams.routes.js    # Team management
│       ├── tournaments.routes.js  # Tournament management
│       ├── registrations.routes.js # Tournament registrations
│       ├── matches.routes.js  # Match management
│       ├── upload.routes.js   # File upload
│       └── index.js           # Routes aggregator
├── uploads/                   # Uploaded files (auto-created)
├── .env                       # Environment variables
├── package.json
├── API_DOCUMENTATION.md       # Complete API docs
└── SETUP_GUIDE.md            # This file
```

## 🔧 Configuration

### CORS Settings
Update `src/app.js` to add your frontend URL:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### File Upload Settings
Edit `src/lib/upload.js` to customize:
- Max file size (default: 5MB)
- Allowed file types
- Upload directory

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "mobile": "9876543210",
    "password": "test123"
  }'
```

### 2. Create a Tower
```bash
curl -X POST http://localhost:5000/towers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Elite Squad"}'
```

### 3. Create a Team
```bash
curl -X POST http://localhost:5000/towers/1/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Team Alpha"}'
```

### 4. Create a Tournament
```bash
curl -X POST http://localhost:5000/tournaments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "BGMI Championship",
    "game": "BGMI",
    "maxTeams": 16,
    "matchDateTime": "2024-12-31T18:00:00Z"
  }'
```

### 5. Register Team for Tournament
```bash
curl -X POST http://localhost:5000/tournaments/1/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"teamId": 1}'
```

## 📊 Database Schema Changes

### New Fields Added:

**User Model:**
- `role` - UserRole enum (PLAYER, TOWER_OWNER, ORGANISER, ADMIN)

**Tournament Model:**
- `title` - Renamed from `name`
- `bannerUrl` - Tournament banner image
- `logoUrl` - Tournament logo
- `description` - Text field for tournament details
- `createdAt`, `updatedAt` - Timestamps

**Team Model:**
- `logoUrl` - Team logo image
- `captainId` - Reference to User (team captain)
- `createdAt`, `updatedAt` - Timestamps

**Tower Model:**
- `createdAt`, `updatedAt` - Timestamps

## 🔐 Security Notes

1. **JWT Secret**: Use a strong, random secret in production
2. **Database Credentials**: Never commit `.env` file to git
3. **File Uploads**: Validate file types and sizes
4. **CORS**: Restrict origins in production
5. **Rate Limiting**: Consider adding rate limiting middleware

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in `.env`
- Check if MySQL server is running
- Ensure database exists
- Verify user permissions

### Migration Errors
If you get shadow database errors:
```bash
# Use db push instead
npx prisma db push

# Or add to .env
PRISMA_MIGRATE_SKIP_SHADOW_DB=true
```

### Port Already in Use
```bash
# Change port in .env or kill the process
PORT=5001
```

### Upload Directory Permissions
```bash
# Ensure uploads directory is writable
mkdir uploads
chmod 755 uploads
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Authentication](https://jwt.io/introduction)
- [Multer File Upload](https://github.com/expressjs/multer)

## 🎯 Next Steps

1. ✅ Complete database migration
2. ✅ Test all API endpoints
3. 🔄 Add validation middleware
4. 🔄 Implement rate limiting
5. 🔄 Add logging system
6. 🔄 Write unit tests
7. 🔄 Deploy to production

## 📞 Support

For issues or questions:
- Check API_DOCUMENTATION.md for endpoint details
- Review error logs in console
- Verify database schema with `npx prisma studio`

---

**Happy Coding! 🚀**
