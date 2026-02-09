import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data (except users)
  await prisma.order.deleteMany()
  await prisma.book.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@merokitab.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@merokitab.local',
      phone: '9800000000',
      passwordHash: adminPassword,
      isAdmin: true,
    },
  })

  // Create regular user (for testing)
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      phone: '9811111111',
      passwordHash: userPassword,
      isAdmin: false,
    },
  })

  console.log('Seed data created successfully!')
  console.log('Admin: admin@merokitab.local / admin123')
  console.log('User: user@example.com / user123')
  console.log('No default books created (start with an empty marketplace).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
