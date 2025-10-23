# MySQL Image Storage - Vercel Deployment Guide

## 📋 Overview

Images are now stored as **base64 data URLs** in MySQL database instead of Cloudinary. This approach works perfectly with Vercel serverless functions.

---

## 🎯 How It Works

### Image Upload Process
1. User uploads image via API
2. Image is converted to base64 string
3. Base64 string is stored in MySQL database (as TEXT or LONGTEXT)
4. API returns base64 data URL: `data:image/jpeg;base64,/9j/4AAQ...`

### Image Retrieval
1. Fetch data from MySQL database
2. Return base64 data URL directly
3. Frontend displays using `<img src="data:image/jpeg;base64,..." />`

---

## 🚀 Quick Deploy to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Setup Database (PlanetScale Recommended)
1. Go to [planetscale.com](https://planetscale.com)
2. Create new database
3. Copy connection string
4. Format: `mysql://user:pass@host/database`

### Step 3: Deploy
```bash
cd c:\Users\amaan\Downloads\esports_backend
npm install
vercel
```

### Step 4: Set Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

Add these **2 variables only**:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Any strong random text | `my-secret-key-123` |

### Step 5: Setup Database Schema
```bash
vercel env pull .env
npx prisma generate
npx prisma db push
```

---

## 💾 Database Schema for Images

Images ko store karne ke liye aapke database mein already fields hain:

```prisma
model User {
  avatarUrl     String?    // Base64 data URL
  // ...
}

model Tournament {
  bannerUrl     String?    // Base64 data URL
  logoUrl       String?    // Base64 data URL
  // ...
}

model Tower {
  logoUrl       String?    // Base64 data URL
  bannerUrl     String?    // Base64 data URL
  // ...
}

model Team {
  logoUrl       String     // Base64 data URL
  // ...
}
```

**Note:** Ensure these fields are `TEXT` or `LONGTEXT` type in MySQL to handle large base64 strings.

---

## 📤 API Usage

### Upload Single Image

**Request:**
```bash
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  file: <image file>
```

**Response:**
```json
{
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "originalName": "photo.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

### Upload Multiple Images

**Request:**
```bash
POST /api/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  files: [<image1>, <image2>, ...]
```

**Response:**
```json
{
  "files": [
    {
      "url": "data:image/jpeg;base64,/9j/4AAQ...",
      "originalName": "photo1.jpg",
      "size": 245678,
      "mimetype": "image/jpeg"
    },
    {
      "url": "data:image/png;base64,iVBORw0KGgo...",
      "originalName": "photo2.png",
      "size": 189234,
      "mimetype": "image/png"
    }
  ]
}
```

---

## 💻 Frontend Usage

### Display Image from Database

```javascript
// React/Next.js Example
function UserProfile({ user }) {
  return (
    <div>
      {/* Base64 data URL directly in src */}
      <img src={user.avatarUrl} alt="Avatar" />
    </div>
  );
}
```

### Upload Image

```javascript
// Upload image example
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://your-api.vercel.app/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  // data.url contains base64 data URL
  // Save this to database
  return data.url;
}
```

### Save to Database

```javascript
// After upload, save to database
async function updateUserAvatar(userId, imageDataUrl) {
  const response = await fetch('https://your-api.vercel.app/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      avatarUrl: imageDataUrl  // Base64 data URL
    })
  });
  
  return response.json();
}
```

---

## ⚡ Performance Considerations

### Advantages
- ✅ No external service dependency
- ✅ Works perfectly on Vercel serverless
- ✅ Simple implementation
- ✅ No additional costs
- ✅ Images always available with data

### Limitations
- ⚠️ Database size increases (base64 is ~33% larger than binary)
- ⚠️ Slower for very large images (>1MB)
- ⚠️ No automatic image optimization
- ⚠️ Larger API response sizes

### Recommendations
1. **Limit image size to 500KB** (already set to 5MB max)
2. **Compress images on frontend** before upload
3. **Use appropriate image formats** (JPEG for photos, PNG for graphics)
4. **Consider pagination** when fetching multiple records with images

---

## 🔧 Image Size Optimization

### Frontend Compression (Recommended)

```javascript
// Compress image before upload
async function compressImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.8); // 80% quality
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Usage
const compressedFile = await compressImage(originalFile);
await uploadImage(compressedFile);
```

---

## 🗄️ Database Configuration

### MySQL Field Types

Ensure your database fields can handle large base64 strings:

```sql
-- For small images (<64KB)
ALTER TABLE users MODIFY COLUMN avatarUrl TEXT;

-- For medium images (<16MB) - RECOMMENDED
ALTER TABLE users MODIFY COLUMN avatarUrl MEDIUMTEXT;

-- For large images (<4GB)
ALTER TABLE users MODIFY COLUMN avatarUrl LONGTEXT;
```

### PlanetScale Configuration

PlanetScale automatically handles TEXT fields. No special configuration needed.

---

## 🚀 Deployment Checklist

- [x] Cloudinary removed from dependencies
- [x] Upload routes updated to use base64
- [x] Environment variables simplified (only DATABASE_URL and JWT_SECRET)
- [x] Vercel configuration updated
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Test image upload
- [ ] Test image retrieval
- [ ] Update frontend to handle base64 URLs

---

## 🧪 Testing

### Test Image Upload

```bash
# Upload test image
curl -X POST https://your-api.vercel.app/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"
```

### Expected Response

```json
{
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "originalName": "test-image.jpg",
  "size": 123456,
  "mimetype": "image/jpeg"
}
```

---

## 📊 Storage Comparison

### Base64 in MySQL (Current)
- **Storage:** ~1.33x original size
- **Speed:** Fast (single query)
- **Cost:** Included in database
- **Complexity:** Simple
- **Vercel Compatible:** ✅ Yes

### Cloudinary (Alternative)
- **Storage:** 1x original size
- **Speed:** Very fast (CDN)
- **Cost:** Separate service
- **Complexity:** Moderate
- **Vercel Compatible:** ✅ Yes

### Local File Storage
- **Storage:** 1x original size
- **Speed:** Fast
- **Cost:** Free
- **Complexity:** Simple
- **Vercel Compatible:** ❌ No (ephemeral filesystem)

---

## 🔐 Security

### Current Implementation
- ✅ File type validation (only images)
- ✅ File size limit (5MB max)
- ✅ Authentication required
- ✅ Base64 encoding (safe for database)

### Additional Security (Optional)

```javascript
// Add virus scanning (if needed)
// Add image content validation
// Add rate limiting for uploads
```

---

## 💡 Tips

1. **Compress images on frontend** before upload to reduce database size
2. **Use lazy loading** for images in lists
3. **Cache images** in frontend to reduce API calls
4. **Consider CDN** if you need faster global delivery
5. **Monitor database size** and upgrade plan if needed

---

## 🆘 Troubleshooting

### Issue: "Request Entity Too Large"
**Solution:** Image is too big. Compress before upload or increase limit.

### Issue: "Database field too small"
**Solution:** Change field type to MEDIUMTEXT or LONGTEXT.

### Issue: "Slow API responses"
**Solution:** 
- Compress images on frontend
- Use pagination for lists
- Implement caching

### Issue: "Image not displaying"
**Solution:**
- Verify base64 data URL format: `data:image/jpeg;base64,...`
- Check if image data is complete in database
- Ensure frontend properly handles data URLs

---

## ✅ Summary

**What You Need:**
- MySQL Database (PlanetScale recommended)
- Vercel Account
- 2 Environment Variables (DATABASE_URL, JWT_SECRET)

**What You DON'T Need:**
- ❌ Cloudinary
- ❌ AWS S3
- ❌ File storage service
- ❌ Additional configuration

**Deployment Time:** ~5 minutes

**Cost:** $0 (free tier sufficient for testing)

---

## 🎉 Ready to Deploy!

```bash
# One command to deploy
vercel
```

Your backend with MySQL image storage is ready for Vercel! 🚀
