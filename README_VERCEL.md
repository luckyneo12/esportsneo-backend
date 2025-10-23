# EsportsNeo Backend - Vercel Ready ✅

This backend is now **fully optimized for Vercel deployment** with serverless architecture.

## 🎯 What's New

### ✅ Vercel Compatible Features
- **Serverless Functions** - Optimized for Vercel's serverless platform
- **Cloudinary Integration** - Cloud-based file storage (replaces local uploads)
- **Zero Configuration** - Ready to deploy with `vercel` command
- **Auto-scaling** - Handles traffic spikes automatically
- **Global CDN** - Fast response times worldwide

### ❌ Removed Features
- **Socket.IO** - Not supported on Vercel serverless (use polling or webhooks instead)
- **Local File Storage** - Replaced with Cloudinary cloud storage
- **React/Next.js** - Removed unnecessary frontend dependencies

---

## 🚀 Quick Deploy

### One-Command Deploy
```bash
npm install -g vercel
cd esports_backend
vercel
```

That's it! Follow the prompts and your API will be live in minutes.

---

## 📦 Project Structure

```
esports_backend/
├── api/
│   └── index.js              # Vercel serverless entry point
├── src/
│   ├── app.js                # Express app configuration
│   ├── index.js              # Local development server
│   ├── lib/
│   │   └── upload.js         # Cloudinary upload handler
│   ├── middlewares/
│   │   └── auth.js           # JWT authentication
│   └── routes/               # API route handlers
├── prisma/
│   └── schema.prisma         # Database schema
├── vercel.json               # Vercel configuration
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── VERCEL_DEPLOYMENT.md      # Detailed deployment guide
```

---

## 🔧 Environment Variables

Create a `.env` file or set these in Vercel:

```env
DATABASE_URL="mysql://user:pass@host/database"
JWT_SECRET="your-super-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 📚 API Documentation

All endpoints remain the same. Just change the base URL:

**Local Development:**
```
http://localhost:3001/api/...
```

**Production (Vercel):**
```
https://your-project.vercel.app/api/...
```

### Example Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/tournaments` - List tournaments
- `POST /api/upload` - Upload image (now uses Cloudinary)
- `GET /api/leaderboard` - Get leaderboard

Full API documentation: See `API_DOCUMENTATION.md`

---

## 🖼️ File Uploads

### Before (Local Storage)
```javascript
// Uploaded to: /uploads/file-123456.jpg
// URL: http://localhost:3001/uploads/file-123456.jpg
```

### After (Cloudinary)
```javascript
// Uploaded to: Cloudinary cloud storage
// URL: https://res.cloudinary.com/your-cloud/image/upload/v123/file.jpg
```

**Benefits:**
- ✅ Automatic image optimization
- ✅ CDN delivery (faster loading)
- ✅ Transformations (resize, crop, etc.)
- ✅ No storage limits on Vercel

---

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npx prisma generate

# Setup database
npx prisma db push

# Start development server
npm run dev
```

Server runs on `http://localhost:3001`

---

## 🌐 Deployment Options

### Option 1: Vercel CLI (Fastest)
```bash
vercel
```

### Option 2: Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure environment variables
4. Deploy!

### Option 3: GitHub Integration
1. Push code to GitHub
2. Connect repository to Vercel
3. Auto-deploy on every push

---

## 🗄️ Database Setup

### Recommended: PlanetScale (Free Tier)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database
3. Copy connection string
4. Add to Vercel environment variables
5. Run migrations:
   ```bash
   npx prisma db push
   ```

### Alternative: Railway, AWS RDS, or any MySQL host

---

## 🔐 Security

- ✅ JWT authentication on protected routes
- ✅ CORS configured for cross-origin requests
- ✅ Environment variables for sensitive data
- ✅ Bcrypt password hashing
- ✅ Input validation on all endpoints

---

## 📊 Monitoring

### View Logs
```bash
vercel logs
```

### Dashboard
- Go to Vercel Dashboard → Your Project
- View real-time logs, analytics, and errors

---

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Check `DATABASE_URL` in environment variables
- Ensure database allows external connections
- Verify connection string format

**2. "Cloudinary upload failed"**
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure API key has upload permissions

**3. "Function timeout"**
- Optimize slow database queries
- Free tier: 10s limit
- Pro tier: 60s limit

**4. "Module not found"**
- Run `npm install` locally
- Commit `package-lock.json`
- Redeploy

---

## 📈 Performance

### Optimizations Applied
- ✅ Prisma connection pooling
- ✅ Cloudinary CDN for images
- ✅ Efficient database queries
- ✅ Minimal dependencies
- ✅ Serverless auto-scaling

### Expected Response Times
- Cold start: 1-3 seconds (first request)
- Warm requests: 100-300ms
- Database queries: 50-200ms

---

## 💰 Cost Estimate

### Free Tier (Perfect for Testing)
- **Vercel**: 100GB bandwidth/month
- **PlanetScale**: 5GB storage, 1B row reads
- **Cloudinary**: 25GB storage, 25GB bandwidth
- **Total**: $0/month

### Production (Recommended)
- **Vercel Pro**: $20/month
- **PlanetScale Scaler**: $29/month
- **Cloudinary Plus**: $89/month
- **Total**: ~$138/month

---

## 🔄 CI/CD Pipeline

### Automatic Deployment
1. Push code to `main` branch
2. Vercel automatically builds and deploys
3. Preview deployments for pull requests
4. Rollback with one click if needed

---

## 📝 Migration from Old Version

### If you have existing data:

1. **Export data** from old server
2. **Import to new database** (PlanetScale/Railway)
3. **Update frontend** to use new Vercel URL
4. **Migrate file URLs** from `/uploads/` to Cloudinary URLs

### File Migration Script
```javascript
// Upload existing files to Cloudinary
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});

// Upload file
cloudinary.uploader.upload('path/to/file.jpg', {
  folder: 'esportsneo/uploads'
}, (error, result) => {
  console.log(result.secure_url);
});
```

---

## 🎓 Learning Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Cloudinary Node.js Guide](https://cloudinary.com/documentation/node_integration)
- [Serverless Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## 🤝 Support

### Documentation Files
- `VERCEL_DEPLOYMENT.md` - Detailed English deployment guide
- `VERCEL_DEPLOYMENT_URDU.md` - Urdu/Hindi deployment guide
- `API_DOCUMENTATION.md` - Complete API reference
- `.env.example` - Environment variables template

### Need Help?
1. Check troubleshooting section above
2. Review Vercel logs for errors
3. Verify all environment variables
4. Ensure database migrations are applied

---

## ✨ Features

### Tournament Management
- Create and manage tournaments
- Team registration and approval
- Match scheduling and results
- Leaderboards and rankings

### User System
- JWT authentication
- Role-based access (Player, Organizer, Admin)
- Profile management with stats
- Badges and achievements

### Tower System
- Create and join towers (clans)
- Tower leaderboards
- Team management within towers
- Announcements and notifications

### File Uploads
- Image uploads via Cloudinary
- Automatic optimization
- CDN delivery
- Support for avatars, logos, banners

---

## 🎉 Success!

Your EsportsNeo backend is now production-ready on Vercel!

**Next Steps:**
1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Test all endpoints
5. ✅ Update frontend with new API URL
6. ✅ Monitor logs and analytics

**Happy deploying!** 🚀

---

## 📄 License

ISC

## 👨‍💻 Author

EsportsNeo Team
