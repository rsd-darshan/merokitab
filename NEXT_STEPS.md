# ✅ Step 1 Complete: Code Pushed to GitHub!

**Repository:** https://github.com/rsd-darshan/merokitab

---

## Step 2: Create PostgreSQL Database

### Option A: Railway (Free & Easy) ⭐ Recommended

1. Go to: https://railway.app
2. Click **"Login"** → Sign up with GitHub
3. Click **"New Project"**
4. Click **"Provision PostgreSQL"**
5. Wait 30 seconds for database to be created
6. Click on the **PostgreSQL** service
7. Go to **"Variables"** tab
8. Copy the **`DATABASE_URL`** (looks like: `postgresql://postgres:password@host:port/railway`)

**Send me the DATABASE_URL when you have it!**

### Option B: Vercel Postgres

1. Go to: https://vercel.com/dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"** → Select **"Postgres"**
4. Choose region: **Mumbai (bom1)** or closest to Nepal
5. Copy the **Connection String**

---

## Step 3: Deploy to Vercel

1. Go to: https://vercel.com
2. Click **"Login"** → Sign up with GitHub
3. Click **"Add New Project"**
4. Click **"Import"** next to `rsd-darshan/merokitab`
5. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** Leave blank (or `bookmantra` if needed)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

6. **Add Environment Variables** (Click "Environment Variables"):
   ```
   DATABASE_URL=your_postgres_url_from_step_2
   JWT_SECRET=generate_random_32_char_string
   ADMIN_EMAIL=your_email@example.com
   ```

   **Generate JWT_SECRET:**
   - Visit: https://generate-secret.vercel.app/32
   - Copy the generated string

7. Click **"Deploy"**
8. Wait 2-5 minutes

**Your site will be live at:** `https://merokitab-xxx.vercel.app`

---

## Step 4: Update Database Schema & Run Migrations

After Vercel deployment, I'll help you:
1. Update Prisma schema to use PostgreSQL
2. Run database migrations
3. Seed initial data

**Tell me when Vercel deployment is done!**

---

## Step 5: Setup Image Uploads (Cloudinary)

For production image uploads:

1. Sign up: https://cloudinary.com/users/register/free
2. Go to Dashboard
3. Copy:
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

## What I Need Next:

1. ✅ **GitHub Token** - Done!
2. ⏳ **DATABASE_URL** - Create database and send me the URL
3. ⏳ **Admin Email** - What email should have admin access?
4. ⏳ **Cloudinary Credentials** - After you sign up

---

## Current Status:

✅ Code pushed to GitHub  
✅ Repository created: https://github.com/rsd-darshan/merokitab  
⏳ Waiting for database setup  
⏳ Waiting for Vercel deployment  

**Tell me when you've created the database or if you need help!**
