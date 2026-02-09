# Deployment Guide for MeroKitab

This guide will walk you through deploying MeroKitab to production. We'll use **Vercel** (recommended for Next.js) as the primary option, with alternatives provided.

## Prerequisites

- GitHub account (for code hosting)
- Vercel account (free tier available)
- Database hosting (we'll use Vercel Postgres or Railway)

---

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest and most optimized platform for Next.js applications.

### Step 1: Prepare Your Code

1. **Push your code to GitHub:**
   ```bash
   cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/merokitab.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

### Step 2: Set Up Database

**Option A: Vercel Postgres (Easiest)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project → **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Choose a name (e.g., `merokitab-db`)
5. Select a region closest to your users
6. Click **Create**
7. Copy the **Connection String** (you'll need this later)

**Option B: Railway (Alternative)**

1. Go to [Railway.app](https://railway.app)
2. Sign up/login
3. Click **New Project** → **Provision PostgreSQL**
4. Click on the PostgreSQL service → **Variables** tab
5. Copy the **DATABASE_URL** (you'll need this later)

### Step 3: Update Prisma Schema for PostgreSQL

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Step 4: Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up/login (use GitHub to connect)

2. **Click "Add New Project"**
   - Import your GitHub repository (`merokitab`)
   - Vercel will auto-detect Next.js

3. **Configure Project Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `bookmantra` (if your repo has the folder)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables:**
   Click **Environment Variables** and add:
   ```
   DATABASE_URL=your_postgres_connection_string_here
   JWT_SECRET=generate_a_long_random_string_here
   ADMIN_EMAIL=your_admin_email@example.com
   ```
   
   **Generate JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

5. **Deploy:**
   - Click **Deploy**
   - Wait for build to complete (2-5 minutes)

### Step 5: Run Database Migrations

After deployment, you need to run migrations:

1. **Option A: Using Vercel CLI (Recommended)**
   ```bash
   npm i -g vercel
   vercel login
   cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
   vercel link  # Link to your project
   vercel env pull .env.local  # Pull environment variables
   
   # Update DATABASE_URL in .env.local with your Postgres URL
   # Then run migrations:
   npx prisma migrate deploy
   ```

2. **Option B: Using Vercel Dashboard**
   - Go to your project → **Settings** → **Functions**
   - Or use Vercel's built-in database migration tool

3. **Seed the database (optional):**
   ```bash
   DATABASE_URL=your_postgres_url npm run seed
   ```

### Step 6: Configure File Uploads

Since Vercel has read-only filesystem, you need cloud storage for images:

**Option A: Use Vercel Blob Storage (Recommended)**

1. Install Vercel Blob:
   ```bash
   npm install @vercel/blob
   ```

2. Update upload API (`src/app/api/upload/route.ts`) to use Vercel Blob
   (See alternative deployment options below for cloud storage setup)

**Option B: Use Cloudinary (Free tier available)**

1. Sign up at [Cloudinary.com](https://cloudinary.com)
2. Get your API credentials
3. Update upload API to use Cloudinary SDK

**Option C: Keep local uploads (Development only)**
- For production, you MUST use cloud storage
- Local uploads won't persist on Vercel

### Step 7: Update QR Code

1. Upload your eSewa QR code to a cloud storage (Cloudinary, AWS S3, etc.)
2. Update the image URL in `src/app/orders/[id]/payment/page.tsx`
3. Or keep it in `public/esewa-qr.png` if using static hosting

### Step 8: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test signup/login
3. Test book listing
4. Test payment flow
5. Test admin dashboard

---

## Option 2: Deploy to Railway

Railway provides both hosting and database in one platform.

### Step 1: Push to GitHub
(Same as Vercel Step 1)

### Step 2: Deploy on Railway

1. Go to [Railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Railway will auto-detect Next.js

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **+ New**
2. Select **PostgreSQL**
3. Railway will automatically create a `DATABASE_URL` variable

### Step 4: Add Environment Variables

In Railway project → **Variables** tab, add:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled
JWT_SECRET=your_long_random_string
ADMIN_EMAIL=your_admin_email@example.com
```

### Step 5: Update Prisma Schema

Same as Vercel Step 3 - change to PostgreSQL

### Step 6: Run Migrations

Railway provides a CLI or you can use their web console:
```bash
railway run npx prisma migrate deploy
```

### Step 7: Deploy

Railway will automatically deploy on every git push.

---

## Option 3: Deploy to Render

### Step 1: Push to GitHub
(Same as above)

### Step 2: Create PostgreSQL Database

1. Go to [Render.com](https://render.com)
2. Click **New** → **PostgreSQL**
3. Choose name and region
4. Copy the **Internal Database URL**

### Step 3: Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** merokitab
   - **Environment:** Node
   - **Build Command:** `cd bookmantra && npm install && npx prisma generate && npm run build`
   - **Start Command:** `cd bookmantra && npm start`

### Step 4: Add Environment Variables

```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
ADMIN_EMAIL=your_email
```

### Step 5: Run Migrations

Add a one-time script or use Render's shell:
```bash
cd bookmantra && npx prisma migrate deploy
```

---

## Important Post-Deployment Steps

### 1. Update Database Schema

**CRITICAL:** Change from SQLite to PostgreSQL before deploying:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name migrate_to_postgres
npx prisma generate
```

### 2. File Upload Configuration

**For Production, you MUST use cloud storage:**

**Using Cloudinary (Recommended):**

1. Install:
   ```bash
   npm install cloudinary
   ```

2. Update `src/app/api/upload/route.ts`:
   ```typescript
   import { v2 as cloudinary } from 'cloudinary'
   
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   })
   
   // In POST handler:
   const result = await cloudinary.uploader.upload(buffer, {
     folder: 'merokitab/books',
   })
   return NextResponse.json({ success: true, imageUrl: result.secure_url })
   ```

3. Add to environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 3. Environment Variables Checklist

Make sure these are set in your hosting platform:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Long random string (32+ characters)
- ✅ `ADMIN_EMAIL` - Email that gets admin access
- ✅ `CLOUDINARY_CLOUD_NAME` - (if using Cloudinary)
- ✅ `CLOUDINARY_API_KEY` - (if using Cloudinary)
- ✅ `CLOUDINARY_API_SECRET` - (if using Cloudinary)

### 4. Custom Domain (Optional)

1. In Vercel/Railway/Render dashboard
2. Go to **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Database created (PostgreSQL)
- [ ] Prisma schema updated to PostgreSQL
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] File upload configured (cloud storage)
- [ ] QR code image uploaded
- [ ] Test signup/login
- [ ] Test book listing
- [ ] Test payment flow
- [ ] Test admin dashboard

---

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if database allows connections from your hosting IP
- Ensure SSL is enabled (most cloud databases require it)

### Build Failures

- Check Node.js version (should be 20.12+)
- Verify all dependencies are in `package.json`
- Check build logs in hosting dashboard

### Image Upload Not Working

- Verify cloud storage credentials
- Check file size limits
- Ensure CORS is configured correctly

### Migration Errors

- Make sure `DATABASE_URL` is set correctly
- Run `npx prisma generate` before migrations
- Check Prisma version compatibility

---

## Support

For issues:
1. Check hosting platform logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure database is accessible

---

## Cost Estimates

**Vercel:**
- Hosting: Free (Hobby plan)
- Postgres: $20/month (or use Railway's free tier)

**Railway:**
- $5/month starter plan (includes database)

**Render:**
- Free tier available (with limitations)
- Postgres: $7/month

**Cloudinary:**
- Free tier: 25GB storage, 25GB bandwidth/month

---

## Recommended Setup

**Best for Production:**
- **Hosting:** Vercel (free, optimized for Next.js)
- **Database:** Railway Postgres (free tier) or Vercel Postgres ($20/month)
- **File Storage:** Cloudinary (free tier sufficient for most use cases)

This combination gives you:
- ✅ Free hosting
- ✅ Reliable database
- ✅ Cloud file storage
- ✅ Easy scaling
- ✅ Great performance
