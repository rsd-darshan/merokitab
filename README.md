# MeroKitab - Used Book Marketplace

A simple, clean marketplace for buying and selling used books. Built with Next.js, Prisma, and SQLite.

## Features

- **Authentication**: Sign up, log in, and log out with email/password
- **List Books**: Sellers can list books with details (title, author, condition, description, price, image)
- **Buy Books**: Browse available books, search by title/author, and purchase books
- **Platform Fee**: Automatically calculates 10% platform fee on top of seller price
- **Payment Flow**: Manual payment via eSewa QR code
- **Order Management**: Track orders through payment verification and completion
- **Admin Dashboard**: Admin can verify payments and mark payouts as sent

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20.12+ (or use Node 20.19+ for latest Prisma)
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd merokitab
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and update:
- `JWT_SECRET`: Change to a long random string
- `ADMIN_EMAIL`: Email address that will have admin access (default: admin@merokitab.local)
- `DATABASE_URL`: SQLite database path (default: file:./dev.db)

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Seed the database (optional):
```bash
npm run seed
```

This creates:
- Admin user: `admin@merokitab.local` / `admin123`
- Test user: `user@example.com` / `user123`
- Sample books

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
merokitab/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed script
│   └── migrations/         # Database migrations
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── books/     # Book CRUD endpoints
│   │   │   ├── orders/    # Order management endpoints
│   │   │   └── admin/     # Admin endpoints
│   │   ├── admin/         # Admin dashboard page
│   │   ├── books/         # Book detail page
│   │   ├── login/         # Login page
│   │   ├── orders/        # Order payment page
│   │   ├── profile/       # User profile page
│   │   ├── sell/         # List book page
│   │   └── signup/        # Signup page
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   │   ├── db.ts         # Prisma client
│   │   └── auth.ts       # Authentication utilities
│   └── middleware.ts     # Route protection middleware
└── public/               # Static assets
```

## Configuration

### Changing the eSewa QR Code

1. Place your eSewa QR code image in the `public` folder (e.g., `public/esewa-qr.png`)
2. Edit `src/app/orders/[id]/payment/page.tsx`
3. Replace the placeholder QR code section with:
```tsx
<Image
  src="/esewa-qr.png"
  alt="eSewa QR Code"
  width={256}
  height={256}
  className="mx-auto"
/>
```

### Platform Commission Calculation

The platform fee is calculated as **10%** of the seller price:

```typescript
platformPrice = Math.ceil(sellerPrice * 1.1)
```

This is implemented in:
- `src/app/api/books/route.ts` (when creating a book)
- `src/app/sell/page.tsx` (displayed in the form)

To change the commission rate, update the multiplier (currently `1.1` for 10%) in both locations.

### Admin Email

The admin email is set via the `ADMIN_EMAIL` environment variable. Users with this email automatically get admin privileges when they sign up.

## Deployment

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

**⚡ Quick start: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a 15-minute deployment guide**

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `DATABASE_URL`: For production, use a hosted database or Vercel Postgres
   - `JWT_SECRET`: Generate a secure random string
   - `ADMIN_EMAIL`: Your admin email address
4. Deploy

**Note**: SQLite works for development but for production on Vercel, consider:
- Using Vercel Postgres (free tier available)
- Or using a hosted SQLite solution
- Or switching to PostgreSQL

To use PostgreSQL:
1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
2. Update your `DATABASE_URL` to a PostgreSQL connection string
3. Run migrations: `npm run prisma:migrate`

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

Make sure to:
1. Set environment variables
2. Run database migrations
3. Optionally seed the database

## Database Management

### View Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

### Create Migration

```bash
npm run prisma:migrate
```

### Reset Database (Development)

```bash
npx prisma migrate reset
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - List books (public, supports search query)
- `POST /api/books` - Create book (auth required)
- `GET /api/books/[id]` - Get book details (public)
- `DELETE /api/books/[id]` - Delete book (auth required, owner only)

### Orders
- `GET /api/orders?type=buy|sell` - Get user orders (auth required)
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders/[id]` - Get order details (auth required)
- `PATCH /api/orders/[id]` - Update order status (auth required)

### Admin
- `GET /api/admin/orders` - Get pending orders (admin only)

## Security Features

- Password hashing with bcrypt
- JWT tokens stored in httpOnly cookies
- Route protection via middleware
- Users can only edit/delete their own books
- Users cannot buy their own books
- Admin-only routes protected

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
