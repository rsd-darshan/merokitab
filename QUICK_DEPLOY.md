# Quick Deployment Guide - MeroKitab

## 🚀 Fastest Way: Deploy to Vercel (15 minutes)

### Step 1: Push Code to GitHub (5 min)

```bash
cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra

# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/merokitab.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

---

### Step 2: Create Database (5 min)

**Option A: Railway (Free PostgreSQL)**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Click **"Provision PostgreSQL"**
5. Click on the PostgreSQL service
6. Go to **"Variables"** tab
7. Copy the **`DATABASE_URL`** value (you'll need this!)

**Option B: Vercel Postgres**

1. Go to https://vercel.com/dashboard
2. Click **"Storage"** → **"Create Database"**
3. Select **"Postgres"**
4. Choose region and click **"Create"**
5. Copy the **Connection String**

---

### Step 3: Update Prisma for PostgreSQL (2 min)

**Before deploying, update your database schema:**

1. Open `prisma/schema.prisma`
2. Change line 6 from:
   ```prisma
   provider = "sqlite"
   ```
   To:
   ```prisma
   provider = "postgresql"
   ```

3. Save the file

---

### Step 4: Deploy to Vercel (3 min)

1. **Go to https://vercel.com**
   - Sign up/login with GitHub

2. **Click "Add New Project"**
   - Select your `merokitab` repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `bookmantra` (if your repo structure has this folder)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables:**
   Click **"Environment Variables"** and add these:

   ```
   DATABASE_URL=your_postgres_connection_string_from_step_2
   JWT_SECRET=generate_random_string_here_32_chars_minimum
   ADMIN_EMAIL=your_email@example.com
   ```

   **To generate JWT_SECRET:**
   - Visit: https://generate-secret.vercel.app/32
   - Or run: `openssl rand -base64 32`

5. **Click "Deploy"**
   - Wait 2-5 minutes for build to complete

---

### Step 5: Run Database Migrations (2 min)

After deployment completes:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Link your project:**
   ```bash
   cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
   vercel login
   vercel link
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Update DATABASE_URL in .env.local** with your PostgreSQL URL

5. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. **Seed database (optional):**
   ```bash
   npm run seed
   ```

---

### Step 6: Configure File Uploads (Important!)

**Vercel has read-only filesystem, so you need cloud storage:**

**Quick Option: Use Cloudinary (Free)**

1. **Sign up:** https://cloudinary.com/users/register/free
2. **Get credentials** from Dashboard
3. **Install Cloudinary:**
   ```bash
   npm install cloudinary
   ```

4. **Update upload API** - Replace `src/app/api/upload/route.ts` with Cloudinary version (see DEPLOYMENT.md)

5. **Add to Vercel Environment Variables:**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

### Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test:
   - ✅ Sign up
   - ✅ Login
   - ✅ List a book
   - ✅ Upload image
   - ✅ Make a purchase
   - ✅ Complete payment
   - ✅ Chat feature

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created
- [ ] Prisma schema updated to PostgreSQL
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Database migrations run
- [ ] Cloud storage configured (Cloudinary)
- [ ] QR code image uploaded
- [ ] All features tested

---

## 🎯 Your Live URL

After deployment, your app will be available at:
- **Production:** `https://your-project.vercel.app`
- **Custom Domain:** Add in Vercel Settings → Domains

---

## 📝 Important Notes

1. **Database:** Must use PostgreSQL in production (SQLite won't work on Vercel)
2. **File Uploads:** Must use cloud storage (local files won't persist)
3. **Environment Variables:** Keep them secret, never commit to git
4. **QR Code:** Upload to cloud storage or keep in `public/` folder

---

## 🆘 Troubleshooting

**Build fails?**
- Check Node.js version (needs 20.12+)
- Verify all dependencies in package.json

**Database connection error?**
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Ensure SSL is enabled

**Images not uploading?**
- Verify cloud storage credentials
- Check file size limits (max 5MB)

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.
