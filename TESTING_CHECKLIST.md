# ✅ Testing Checklist

## 🔧 Pre-Testing Setup

- [ ] Database is running and accessible
- [ ] `.env` file configured with correct DATABASE_URL
- [ ] Run `npx prisma db push` successfully
- [ ] Run `npx prisma generate` successfully
- [ ] Server starts without errors (`npm run dev`)
- [ ] Uploads directory created automatically

---

## 🧪 Test Scenarios

### 1. Authentication & User Management

#### Register User
- [ ] Register with all fields (name, username, mobile, password, email, role)
- [ ] Register with minimum fields (username, mobile, password)
- [ ] Register with duplicate username → 409 error
- [ ] Register with duplicate mobile → 409 error
- [ ] Register with duplicate email → 409 error
- [ ] Verify token is returned
- [ ] Verify password is not in response

#### Login
- [ ] Login with correct credentials
- [ ] Login with wrong password → 401 error
- [ ] Login with non-existent mobile → 401 error
- [ ] Verify token is returned
- [ ] Verify user object includes role

#### Profile Management
- [ ] Get own profile with token
- [ ] Get own profile without token → 401 error
- [ ] Update profile (name, bio, avatarUrl)
- [ ] Get user by ID (public endpoint)
- [ ] Get user's teams
- [ ] Get user's towers

---

### 2. Tower Management

#### Create Tower
- [ ] Create tower with name
- [ ] Verify unique code is generated
- [ ] Verify creator is set as leader
- [ ] Verify creator is added as CO_LEADER member
- [ ] Create without auth → 401 error

#### Join Tower
- [ ] Join with valid code
- [ ] Join with invalid code → 404 error
- [ ] Join same tower twice → 409 error
- [ ] Verify status is `approved: false`

#### Tower Member Management
- [ ] Approve member (as owner)
- [ ] Approve member (as co-leader)
- [ ] Approve member (as regular member) → 403 error
- [ ] Remove member (as owner)
- [ ] Remove member (as co-leader)
- [ ] Promote to co-leader (as owner)

#### Tower Queries
- [ ] Get tower details by ID
- [ ] Get user's towers
- [ ] Verify tower includes leader, members, teams

---

### 3. Team Management

#### Create Team
- [ ] Create team in tower (as owner)
- [ ] Create team in tower (as co-leader)
- [ ] Create team with logo and captain
- [ ] Create team without logo (optional)
- [ ] Create team with duplicate name in same tower → 409 error
- [ ] Create team in different tower with same name → Success
- [ ] Create team (as regular member) → 403 error
- [ ] Create team without auth → 401 error

#### Team Member Management
- [ ] Add member to team (as owner)
- [ ] Add member to team (as co-leader)
- [ ] Add same member twice → 409 error
- [ ] Add member (as regular member) → 403 error

#### Team Queries
- [ ] Get tower's teams
- [ ] Get team details by ID
- [ ] Verify team includes tower, captain, members

---

### 4. Tournament Management

#### Create Tournament
- [ ] Create with all fields (title, game, description, bannerUrl, logoUrl, maxTeams, matchDateTime)
- [ ] Create with minimum fields (title, game, maxTeams, matchDateTime)
- [ ] Create without title → 400 error
- [ ] Create without game → 400 error
- [ ] Create without maxTeams → 400 error
- [ ] Create without matchDateTime → 400 error
- [ ] Verify creator is added as organizer
- [ ] Add additional organizers via organizerIds array

#### Tournament Queries
- [ ] Get all tournaments
- [ ] Get tournaments filtered by status (UPCOMING, LIVE, COMPLETED)
- [ ] Get tournament details by ID
- [ ] Verify tournament includes organizers and registrations

---

### 5. Tournament Registration (Critical Validations)

#### Registration Creation
- [ ] Register team (as tower owner)
- [ ] Register team (as co-leader)
- [ ] Register team (as regular member) → 403 error
- [ ] Register without auth → 401 error

#### Validation 1: Duplicate Team Check
- [ ] Register same team twice → 409 error
- [ ] Verify error message: "Team already registered"

#### Validation 2: MaxTeams Check
- [ ] Create tournament with maxTeams=2
- [ ] Register and approve 2 teams
- [ ] Try to register 3rd team → 400 error
- [ ] Verify error message: "Tournament has reached maximum teams limit"

#### Validation 3: Team Name Uniqueness
- [ ] Create two teams with same name in different towers
- [ ] Register first team → Success
- [ ] Register second team with same name → 409 error
- [ ] Verify error message: "A team with this name is already registered"

#### Validation 4: Authorization Check
- [ ] User not in tower tries to register team → 403 error
- [ ] Regular tower member tries to register → 403 error
- [ ] Only owner/co-leader can register → Success

#### Registration Approval
- [ ] Approve registration (as organizer)
- [ ] Approve registration (as non-organizer) → 403 error
- [ ] Reject registration (as organizer)
- [ ] Reject registration (as non-organizer) → 403 error
- [ ] Verify status changes from PENDING to APPROVED/REJECTED

#### Registration Queries
- [ ] Get tournament registrations
- [ ] Verify includes team details, tower, members

---

### 6. File Upload

#### Single File Upload
- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Upload GIF image
- [ ] Upload WEBP image
- [ ] Upload non-image file → 400 error
- [ ] Upload file > 5MB → 413 error
- [ ] Upload without auth → 401 error
- [ ] Verify file URL is returned
- [ ] Verify file is accessible via /uploads/filename

#### Multiple File Upload
- [ ] Upload 2 files
- [ ] Upload 5 files (max)
- [ ] Upload 6 files → 400 error
- [ ] Verify all file URLs are returned

#### File Usage
- [ ] Upload avatar and set in user profile
- [ ] Upload team logo and use in team creation
- [ ] Upload tournament banner and use in tournament
- [ ] Verify images are served correctly

---

### 7. Complete Flow Testing

#### Scenario 1: New User to Tournament Registration
1. [ ] Register user A (tower owner)
2. [ ] Create tower
3. [ ] Create team in tower
4. [ ] Register user B
5. [ ] User B joins tower with code
6. [ ] User A approves user B
7. [ ] User A adds user B to team
8. [ ] Register user C (organizer)
9. [ ] User C creates tournament
10. [ ] User A registers team for tournament
11. [ ] User C approves registration
12. [ ] Verify team is in tournament

#### Scenario 2: Multiple Teams Registration
1. [ ] Create tower with 3 teams
2. [ ] Create tournament with maxTeams=2
3. [ ] Register team 1 → PENDING
4. [ ] Register team 2 → PENDING
5. [ ] Register team 3 → PENDING
6. [ ] Approve team 1 → APPROVED
7. [ ] Approve team 2 → APPROVED
8. [ ] Try to approve team 3 → Should check if maxTeams exceeded

#### Scenario 3: Duplicate Team Name Handling
1. [ ] Create tower A with team "Alpha"
2. [ ] Create tower B with team "Alpha"
3. [ ] Create tournament
4. [ ] Register tower A's "Alpha" → Success
5. [ ] Register tower B's "Alpha" → 409 error

#### Scenario 4: Co-Leader Permissions
1. [ ] User A creates tower
2. [ ] User B joins tower
3. [ ] User A promotes user B to co-leader
4. [ ] User B creates team → Success
5. [ ] User B adds members → Success
6. [ ] User B registers team → Success

---

### 8. Error Handling

#### Authentication Errors
- [ ] Missing token → 401
- [ ] Invalid token → 401
- [ ] Expired token → 401

#### Authorization Errors
- [ ] Insufficient permissions → 403
- [ ] Not tower owner/co-leader → 403
- [ ] Not tournament organizer → 403

#### Validation Errors
- [ ] Missing required fields → 400
- [ ] Invalid data types → 400
- [ ] Constraint violations → 409

#### Not Found Errors
- [ ] Non-existent resource → 404
- [ ] Invalid IDs → 404

---

### 9. Edge Cases

#### Tower
- [ ] Tower with no teams
- [ ] Tower with pending members
- [ ] Tower code uniqueness

#### Team
- [ ] Team with no members
- [ ] Team with only captain
- [ ] Team name with special characters

#### Tournament
- [ ] Tournament with 0 registrations
- [ ] Tournament with all rejected registrations
- [ ] Tournament status changes (UPCOMING → LIVE → COMPLETED)

#### Registration
- [ ] Register team before tournament starts
- [ ] Register team after tournament starts
- [ ] Reject then re-register same team

---

### 10. Performance & Load Testing

- [ ] Create 100 users
- [ ] Create 50 towers
- [ ] Create 200 teams
- [ ] Create 20 tournaments
- [ ] Register 500 teams to tournaments
- [ ] Query performance for tournament with many registrations
- [ ] Upload 100 files

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development / Staging / Production

Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Critical Issues:
1. 
2. 

Minor Issues:
1. 
2. 

Notes:


```

---

## 🛠️ Testing Tools

### Recommended Tools
1. **Postman** - API testing with collections
2. **Thunder Client** - VS Code extension
3. **curl** - Command line testing
4. **Prisma Studio** - Database inspection (`npx prisma studio`)
5. **Jest** - Unit testing (future)
6. **Supertest** - Integration testing (future)

### Postman Collection
Create a collection with:
- Environment variables (baseUrl, token)
- Pre-request scripts (set token)
- Tests (assert status codes, response structure)
- Organized folders (Auth, Towers, Teams, Tournaments)

---

## 🐛 Common Issues & Solutions

### Issue: Token not working
**Solution**: Check if token is prefixed with "Bearer " in Authorization header

### Issue: 409 Duplicate error
**Solution**: Check unique constraints (username, mobile, email, team name)

### Issue: 403 Forbidden
**Solution**: Verify user has correct role and permissions

### Issue: File upload fails
**Solution**: Check Content-Type is multipart/form-data, field name is "file"

### Issue: Database connection error
**Solution**: Verify DATABASE_URL in .env, check if MySQL is running

---

## ✅ Sign-off Checklist

Before marking as complete:
- [ ] All critical paths tested
- [ ] All validations working correctly
- [ ] Error messages are clear and helpful
- [ ] Authorization checks are enforced
- [ ] File uploads working
- [ ] Database constraints enforced
- [ ] API documentation matches implementation
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance is acceptable

---

**Testing Complete! 🎉**

Signed by: ___________
Date: ___________
