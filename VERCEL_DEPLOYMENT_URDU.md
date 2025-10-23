# Vercel Deployment Guide (اردو/हिंदी)

## 🚀 Kya Changes Hue Hain

### Jo Remove Kiya Gaya
- ❌ **Socket.IO** - Hata diya (Vercel support nahi karta)
- ❌ **Local File Storage** - Hata diya (serverless mein kaam nahi karta)

### Jo Add Kiya Gaya
- ✅ **Cloudinary** - Images upload karne ke liye
- ✅ **Serverless Structure** - Vercel ke liye optimize
- ✅ **Vercel Config** - Deployment settings

---

## 📋 Kya Chahiye (Prerequisites)

1. **Vercel Account** - [vercel.com](https://vercel.com) pe signup karein
2. **MySQL Database** - Koi bhi ek:
   - [PlanetScale](https://planetscale.com) (Recommended, free hai)
   - [Railway](https://railway.app)
   - Koi bhi MySQL hosting
3. **Cloudinary Account** - [cloudinary.com](https://cloudinary.com) pe signup karein (free hai)

---

## 🔧 Step 1: Cloudinary Setup

1. [cloudinary.com](https://cloudinary.com) pe jao aur account banao
2. Login karo aur Dashboard pe jao
3. Ye teen cheezein note kar lo:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 🗄️ Step 2: Database Setup

### PlanetScale (Recommended)

1. [planetscale.com](https://planetscale.com) pe jao
2. Naya database banao (naam: `esportsneo-db`)
3. Connection string copy karo
4. Format: `mysql://username:password@host/database`

---

## 🚀 Step 3: Vercel Pe Deploy Karo

### Method 1: Vercel CLI Se

1. **Vercel CLI install karo**
   ```bash
   npm install -g vercel
   ```

2. **Login karo**
   ```bash
   vercel login
   ```

3. **Project folder mein jao**
   ```bash
   cd c:\Users\amaan\Downloads\esports_backend
   ```

4. **Dependencies install karo**
   ```bash
   npm install
   ```

5. **Deploy karo**
   ```bash
   vercel
   ```

6. **Sawalon ke jawab do:**
   - Set up and deploy? **Y** (Yes)
   - Which scope? Apna account select karo
   - Link to existing project? **N** (No)
   - Project name? `esportsneo-backend`
   - Code directory? `./`
   - Override settings? **N** (No)

### Method 2: Vercel Dashboard Se

1. [vercel.com/new](https://vercel.com/new) pe jao
2. Apna Git repo import karo (GitHub/GitLab)
3. Settings:
   - **Framework**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
4. **Deploy** pe click karo

---

## 🔐 Step 4: Environment Variables Set Karo

Deployment ke baad, ye variables add karo:

1. Vercel Dashboard mein apne project pe jao
2. **Settings** → **Environment Variables** pe click karo
3. Ye sab add karo:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Database connection string | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Koi strong random text | `my-secret-key-123` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dxxxxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefghijklmnop` |

4. **Save** karo
5. Project ko **Redeploy** karo

---

## 🗃️ Step 5: Database Setup Karo

### Local Machine Se

1. **Environment variables download karo**
   ```bash
   vercel env pull .env
   ```

2. **Prisma setup karo**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## ✅ Step 6: Test Karo

1. **Apna Vercel URL copy karo** (e.g., `https://esportsneo-backend.vercel.app`)

2. **API test karo**:
   ```bash
   curl https://your-url.vercel.app/api/health
   ```

3. **Registration test karo**:
   ```bash
   curl -X POST https://your-url.vercel.app/api/auth/register \
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
- Ab sab files **Cloudinary** pe upload hongi
- Purane `/uploads/` URLs kaam nahi karenge
- Frontend mein Cloudinary URLs use karo

### API Endpoints
- Sab endpoints same rahenge
- Bas URL change hoga: `https://your-vercel-url.vercel.app`
- Example: `https://esportsneo-backend.vercel.app/api/auth/login`

### Database
- Database ko Vercel se connect hone do (whitelist karo agar zarurat ho)
- PlanetScale aur Railway automatically handle karte hain

---

## 🔄 Update Kaise Kare

### Git Se (Automatic)
1. Code change karo
2. Git pe push karo
3. Vercel automatically deploy kar dega

### CLI Se (Manual)
```bash
vercel --prod
```

---

## 🐛 Common Problems

### Problem: "Database connection failed"
**Solution**: 
- `DATABASE_URL` check karo Vercel mein
- Database external connections allow karta hai ya nahi check karo

### Problem: "Cloudinary upload failed"
**Solution**:
- Cloudinary credentials check karo
- File size 5MB se kam hai ya nahi check karo

### Problem: "Function timeout"
**Solution**:
- Free tier mein 10 second ka limit hai
- Database queries optimize karo
- Ya Pro plan le lo (60 second limit)

---

## 💰 Pricing (Kitna Paisa Lagega)

### Vercel
- **Free**: 100GB bandwidth, unlimited deployments
- **Pro**: $20/month

### Cloudinary
- **Free**: 25GB storage, 25GB bandwidth/month
- **Plus**: $89/month

### Database (PlanetScale)
- **Free**: 5GB storage
- **Scaler**: $29/month

---

## ✨ Ho Gaya!

Aapka backend ab Vercel pe live hai! 🎉

**Aage Kya Karna Hai:**
1. Frontend mein naya Vercel URL use karo
2. Sab endpoints test karo
3. Logs check karte raho
4. Custom domain set karo (optional)

All the best! 🚀
