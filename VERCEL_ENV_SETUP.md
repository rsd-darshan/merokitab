# Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel project settings:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_HTrPaXGRJ5l8@ep-falling-queen-aivr61lo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. JWT_SECRET
Generate a random 32-character string:
- Visit: https://generate-secret.vercel.app/32
- Copy the generated string
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 3. ADMIN_EMAIL
```
poudeldarshan44@gmail.com
```

### 4. NEXT_PUBLIC_APP_NAME (Optional)
```
MeroKitab
```

---

## How to Add in Vercel:

1. Go to your project: https://vercel.com/dashboard
2. Click on your `merokitab` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://neondb_owner:npg_HTrPaXGRJ5l8@ep-falling-queen-aivr61lo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Environment:** Production, Preview, Development (select all)
   - Click **Save**

   Repeat for:
   - `JWT_SECRET` (generate random string)
   - `ADMIN_EMAIL` = `poudeldarshan44@gmail.com`
   - `NEXT_PUBLIC_APP_NAME` = `MeroKitab` (optional)

5. After adding all variables, **redeploy** your project:
   - Go to **Deployments** tab
   - Click the **3 dots** on latest deployment
   - Click **Redeploy**

---

## After Deployment:

Once deployment succeeds, you need to run database migrations:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login and link to your project
cd /Users/darshanpoudel/Desktop/Bookmantra/bookmantra
vercel login
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

Or use Vercel's built-in Postgres migrations (if using Vercel Postgres).

---

## Next Steps:

1. ✅ Fix TypeScript errors - DONE
2. ✅ Update to PostgreSQL - DONE  
3. ⏳ Add environment variables in Vercel
4. ⏳ Redeploy
5. ⏳ Run database migrations
6. ⏳ Test the live site
