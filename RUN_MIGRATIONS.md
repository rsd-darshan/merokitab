# 🚀 Run Database Migrations - URGENT!

Your database tables don't exist yet. Run migrations now:

---

## Quick Fix (Choose One):

### Option 1: Run Migrations Locally (Easiest)

1. **Set your production DATABASE_URL:**
   ```bash
   cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
   
   # Create/update .env.local with production database
   echo 'DATABASE_URL="postgresql://neondb_owner:npg_HTrPaXGRJ5l8@ep-falling-queen-aivr61lo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"' > .env.local
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Seed admin user (optional):**
   ```bash
   npm run seed
   ```

**Done!** Your database is now ready. Try signing up again.

---

### Option 2: Run via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login and link:**
   ```bash
   cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
   vercel login
   vercel link
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

---

### Option 3: Use Neon Console (Web UI)

1. Go to: https://console.neon.tech
2. Select your database
3. Go to **SQL Editor**
4. Run this SQL (or use Prisma migrations):

   ```sql
   -- This will be created by Prisma migrations
   -- Better to use: npx prisma migrate deploy
   ```

**Actually, just use Option 1 - it's the fastest!**

---

## After Running Migrations:

✅ Your database will have these tables:
- `User`
- `Book`
- `Order`
- `ChatThread`
- `ChatMessage`

✅ You can now:
- Sign up new users
- List books
- Make purchases
- Use chat

---

## Verify It Worked:

1. Try signing up again
2. If it works, you're all set! 🎉

---

## Need Help?

If migrations fail, check:
- ✅ DATABASE_URL is correct
- ✅ Database is accessible (not paused)
- ✅ You have write permissions
