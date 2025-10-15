# ⚡ Quick Start Guide

## 🚀 Setup (3 Steps)

```bash
# 1. Install dependencies
npm install

# 2. Update database schema
npx prisma db push

# 3. Start server
npm run dev
```

Server runs at: `http://localhost:5000`

---

## 🎯 Test Flow (Copy & Paste)

### 1️⃣ Register User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tower Owner",
    "username": "owner1",
    "mobile": "9876543210",
    "password": "pass123"
  }'
```
**Save the token from response!**

### 2️⃣ Create Tower
```bash
curl -X POST http://localhost:5000/towers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "Elite Squad"}'
```
**Note the tower ID and code!**

### 3️⃣ Create Team
```bash
curl -X POST http://localhost:5000/towers/1/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Team Alpha",
    "logoUrl": "/uploads/logo.jpg"
  }'
```
**Note the team ID!**

### 4️⃣ Create Tournament
```bash
curl -X POST http://localhost:5000/tournaments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "BGMI Championship 2024",
    "game": "BGMI",
    "description": "Annual championship",
    "maxTeams": 16,
    "matchDateTime": "2024-12-31T18:00:00Z"
  }'
```
**Note the tournament ID!**

### 5️⃣ Register Team for Tournament
```bash
curl -X POST http://localhost:5000/tournaments/1/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"teamId": 1}'
```

### 6️⃣ Approve Registration (as organizer)
```bash
curl -X POST http://localhost:5000/tournaments/1/registrations/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📤 Upload Image

```bash
curl -X POST http://localhost:5000/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image.jpg"
```

Returns: `{"url": "/uploads/file-123.jpg"}`

Use this URL for:
- User `avatarUrl`
- Team `logoUrl`
- Tournament `bannerUrl` or `logoUrl`

---

## 🔍 Quick Checks

### Get My Profile
```bash
curl http://localhost:5000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Tournament Details
```bash
curl http://localhost:5000/tournaments/1
```

### Get Tower Teams
```bash
curl http://localhost:5000/towers/1/teams \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Tournaments
```bash
curl http://localhost:5000/tournaments?status=UPCOMING
```

---

## 🎮 Common Scenarios

### Join Existing Tower
```bash
# Another user joins with tower code
curl -X POST http://localhost:5000/towers/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ANOTHER_USER_TOKEN" \
  -d '{"code": "ABC123"}'
```

### Approve Tower Member
```bash
curl -X POST http://localhost:5000/towers/1/members/2/approve \
  -H "Authorization: Bearer OWNER_TOKEN"
```

### Add Team Member
```bash
curl -X POST http://localhost:5000/teams/1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer OWNER_TOKEN" \
  -d '{"userId": 2}'
```

---

## 🛠️ Troubleshooting

### Database Connection Error
```bash
# Check .env file has correct DATABASE_URL
cat .env
```

### Token Invalid
```bash
# Login again to get fresh token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "pass123"
  }'
```

### View Database
```bash
npx prisma studio
```
Opens at: `http://localhost:5555`

---

## 📚 Full Documentation

- **API Endpoints**: See `API_DOCUMENTATION.md`
- **Setup Guide**: See `SETUP_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Validation Rules

### Tournament Registration
- ❌ Team already registered → 409 error
- ❌ MaxTeams exceeded → 400 error
- ❌ Duplicate team name → 409 error
- ❌ Not tower owner/co-leader → 403 error
- ✅ All checks pass → Registration created (PENDING)

### Team Creation
- ❌ Name exists in tower → 409 error
- ❌ Not tower owner/co-leader → 403 error
- ✅ Unique name → Team created

### Tower Join
- ❌ Invalid code → 404 error
- ❌ Already in tower → 409 error
- ✅ Valid code → Join request created (needs approval)

---

## 🎯 Quick Reference

| Action | Who Can Do It |
|--------|---------------|
| Create Tower | Any user |
| Join Tower | Any user (needs approval) |
| Create Team | Tower owner/co-leader |
| Add Team Member | Tower owner/co-leader |
| Create Tournament | Any user (becomes organizer) |
| Register Team | Tower owner/co-leader |
| Approve Registration | Tournament organizer |

---

**Happy Testing! 🚀**
