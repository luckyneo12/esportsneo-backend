# Vercel Deployment Guide for EsportsNeo Backend

This guide will help you deploy the EsportsNeo backend API to Vercel.

## 🚀 What Changed for Vercel Compatibility

### Removed Features
- ❌ **Socket.IO** - Removed (not supported on Vercel serverless functions)
- ❌ **Local File Storage** - Removed (serverless functions have ephemeral filesystem)

### Added Features
- ✅ **Cloudinary Integration** - For image/file uploads
- ✅ **Serverless Function Structure** - Optimized for Vercel
- ✅ **Vercel Configuration** - `vercel.json` for deployment settings

---

## 📋 Prerequisites

Before deploying, you need:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **MySQL Database** - Use one of these:
   - [PlanetScale](https://planetscale.com) (Recommended, free tier available)
   - [Railway](https://railway.app)
   - [AWS RDS](https://aws.amazon.com/rds/)
   - Any MySQL hosting service
3. **Cloudinary Account** - Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)

---

## 🔧 Step 1: Setup Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. After login, go to Dashboard
3. Note down these credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 🗄️ Step 2: Setup Database

### Option A: PlanetScale (Recommended)

1. Go to [planetscale.com](https://planetscale.com) and create account
2. Create a new database (e.g., `esportsneo-db`)
3. Get the connection string from the database dashboard
4. Format: `mysql://username:password@host/database?sslaccept=strict`

### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Create a new MySQL database
3. Copy the connection string from the database settings

---

## 🚀 Step 3: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to project directory**
   ```bash
   cd c:\Users\amaan\Downloads\esports_backend
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Deploy to Vercel**
   ```bash
   vercel
   ```

6. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `esportsneo-backend`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub/GitLab/Bitbucket)
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: Leave empty
4. Click "Deploy"

---

## 🔐 Step 4: Configure Environment Variables

After deployment, add these environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `DATABASE_URL` | Your MySQL connection string | `mysql://user:pass@host/db` |
| `JWT_SECRET` | A strong random string | `my-super-secret-jwt-key-123` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `dxxxxxx` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | `abcdefghijklmnop` |

4. Click **Save**
5. **Redeploy** the project for changes to take effect

---

## 🗃️ Step 5: Run Database Migrations

After deploying, you need to set up the database schema:

### Option A: Using Vercel CLI

1. **Pull environment variables**
   ```bash
   vercel env pull .env
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Push database schema**
   ```bash
   npx prisma db push
   ```

### Option B: Manual Setup

1. Copy your `DATABASE_URL` from Vercel environment variables
2. Create a `.env` file locally:
   ```
   DATABASE_URL="your-database-url-here"
   ```
3. Run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## ✅ Step 6: Test Your Deployment

1. **Get your deployment URL** from Vercel (e.g., `https://esportsneo-backend.vercel.app`)

2. **Test the API**:
   ```bash
   curl https://your-deployment-url.vercel.app/api/health
   ```

3. **Test user registration**:
   ```bash
   curl -X POST https://your-deployment-url.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "mobile": "1234567890",
       "password": "password123"
     }'
   ```

---

## 📝 Important Notes

### File Uploads
- All file uploads now go to **Cloudinary** instead of local storage
- Images are automatically optimized and served via CDN
- Old `/uploads/` URLs won't work - update your frontend to use Cloudinary URLs

### API Endpoints
- All endpoints remain the same
- Base URL changes from `http://localhost:3001` to your Vercel URL
- Example: `https://esportsneo-backend.vercel.app/api/auth/login`

### Database Connection
- Make sure your database allows connections from Vercel's IP ranges
- PlanetScale and Railway automatically handle this
- For other providers, you may need to whitelist Vercel IPs

### Cold Starts
- First request after inactivity may be slow (cold start)
- Subsequent requests will be fast
- This is normal for serverless functions

---

## 🔄 Updating Your Deployment

### Automatic Deployment (Git Integration)
If you connected via Git:
1. Push changes to your repository
2. Vercel automatically deploys the new version

### Manual Deployment (CLI)
```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Solution**: 
- Check if `DATABASE_URL` is correctly set in Vercel environment variables
- Ensure database allows external connections
- Verify connection string format

### Issue: "Cloudinary upload failed"
**Solution**:
- Verify Cloudinary credentials in environment variables
- Check if API key has upload permissions
- Ensure file size is under 5MB

### Issue: "Function timeout"
**Solution**:
- Vercel free tier has 10s timeout for serverless functions
- Optimize slow database queries
- Consider upgrading to Pro plan for 60s timeout

### Issue: "Module not found"
**Solution**:
- Run `npm install` locally
- Commit `package-lock.json` to Git
- Redeploy

---

## 📊 Monitoring

1. **View Logs**: 
   - Go to Vercel Dashboard → Your Project → Logs
   - Or use CLI: `vercel logs`

2. **Analytics**:
   - Vercel Dashboard shows request analytics
   - Monitor function execution time and errors

---

## 💰 Pricing

### Vercel
- **Free Tier**: 100GB bandwidth, unlimited deployments
- **Pro**: $20/month for more resources

### Cloudinary
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Plus**: $89/month for more resources

### Database (PlanetScale)
- **Free Tier**: 5GB storage, 1 billion row reads/month
- **Scaler**: $29/month for production use

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [PlanetScale Documentation](https://planetscale.com/docs)

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Vercel logs for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations are applied

---

## ✨ Success!

Your EsportsNeo backend is now running on Vercel! 🎉

**Next Steps:**
1. Update your frontend to use the new Vercel API URL
2. Test all API endpoints
3. Monitor logs for any errors
4. Set up custom domain (optional)

Happy deploying! 🚀
