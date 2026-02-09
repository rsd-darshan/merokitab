# Step-by-Step Hosting Guide

I'll guide you through hosting MeroKitab. Follow these steps in order:

## What You Need

1. **GitHub Account** (free) - https://github.com/signup
2. **Vercel Account** (free) - https://vercel.com/signup
3. **Railway Account** (free PostgreSQL) - https://railway.app/signup
4. **Cloudinary Account** (free for images) - https://cloudinary.com/users/register/free

---

## Step 1: Prepare Your Code ✅

I've already prepared everything! Your code is ready.

**Check if git is ready:**
```bash
cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
git status
```

---

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `merokitab`
3. Make it **Public** (or Private - your choice)
4. **Don't** initialize with README
5. Click **"Create repository"**

### 2.2 Push Your Code

Run these commands (replace YOUR_USERNAME with your GitHub username):

```bash
cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra

# Commit all changes
git add .
git commit -m "Ready for deployment"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/merokitab.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Tell me when this is done!**

---

## Step 3: Create Database

### Option A: Railway (Recommended - Free)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Click **"Provision PostgreSQL"**
5. Wait for database to be created
6. Click on the PostgreSQL service
7. Go to **"Variables"** tab
8. Copy the **`DATABASE_URL`** value

**Send me the DATABASE_URL when you have it!**

### Option B: Vercel Postgres

1. Go to https://vercel.com/dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose region (closest to Nepal: Mumbai/bom1)
6. Click **"Create"**
7. Copy the **Connection String**

---

## Step 4: Update Database Schema

**I'll do this for you!** Just tell me when you have the DATABASE_URL.

I need to change Prisma from SQLite to PostgreSQL.

---

## Step 5: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click **"Add New Project"**
4. Import your `merokitab` repository
5. Configure:
   - **Framework:** Next.js (auto-detected)
   - **Root Directory:** `bookmantra` (if your repo has this folder, otherwise leave blank)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

6. **Add Environment Variables:**
   Click **"Environment Variables"** and add:

   ```
   DATABASE_URL=your_postgres_url_from_step_3
   JWT_SECRET=generate_this_below
   ADMIN_EMAIL=your_email@example.com
   ```

   **Generate JWT_SECRET:**
   - Visit: https://generate-secret.vercel.app/32
   - Copy the generated string
   - Paste it as JWT_SECRET value

7. Click **"Deploy"**
8. Wait 2-5 minutes

**Tell me when deployment starts!**

---

## Step 6: Run Database Migrations

After Vercel deployment completes:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link
cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
vercel login
vercel link

# Pull environment variables
vercel env pull .env.local

# Update DATABASE_URL in .env.local with your PostgreSQL URL
# Then run migrations:
npx prisma migrate deploy
npx prisma generate
```

**I'll help you with this step!**

---

## Step 7: Configure Image Uploads

**For production, you need cloud storage:**

### Setup Cloudinary (Free)

1. Sign up: https://cloudinary.com/users/register/free
2. Go to Dashboard
3. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

**Send me these and I'll update the upload API!**

Then add to Vercel Environment Variables:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Step 8: Test Your Live Site

Visit: `https://your-project.vercel.app`

Test:
- ✅ Sign up
- ✅ Login  
- ✅ List a book
- ✅ Upload image
- ✅ Make purchase
- ✅ Payment flow
- ✅ Chat

---

## What I Need From You

To help you deploy, please provide:

1. ✅ **GitHub username** (to set up remote)
2. ✅ **Admin email** (for admin access)
3. ✅ **DATABASE_URL** (after creating database)
4. ✅ **Cloudinary credentials** (for image uploads)
5. ✅ **Any questions** as you go through steps

---

## I'm Here to Help!

Tell me:
- Which step you're on
- What you need help with
- Any errors you encounter
- Your credentials (I'll help configure them)

Let's get MeroKitab live! 🚀
