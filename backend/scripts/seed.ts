import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
config({ path: '.env' });
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arslan.com' },
    update: {},
    create: {
      email: 'admin@arslan.com',
      phone: '+923001234567',
      phoneVerified: true,
      passwordHash,
      fullName: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  let role = await prisma.adminRole.findFirst({ where: { name: 'Super Admin' } });
  if (!role) {
    role = await prisma.adminRole.create({
      data: {
        name: 'Super Admin',
        permissions: {
          manage_users: true,
          manage_workers: true,
          manage_bookings: true,
          manage_services: true,
          manage_disputes: true,
          manage_banners: true,
          send_notifications: true,
          view_reports: true,
          manage_roles: true,
          view_analytics: true,
        },
      },
    });
  }

  await prisma.adminUser.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      roleId: role.id,
    },
  });
  console.log('AdminUser role assigned');

  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      phone: '+923009876543',
      phoneVerified: true,
      passwordHash: await bcrypt.hash('user123', 10),
      fullName: 'Test Customer',
      role: 'CUSTOMER',
    },
  });
  console.log('Test customer created:', customer.email);

  const workerUser = await prisma.user.upsert({
    where: { email: 'worker@test.com' },
    update: {},
    create: {
      email: 'worker@test.com',
      phone: '+923009998877',
      phoneVerified: true,
      passwordHash: await bcrypt.hash('user123', 10),
      fullName: 'Test Worker',
      role: 'WORKER',
    },
  });

  await prisma.workerProfile.upsert({
    where: { userId: workerUser.id },
    update: {},
    create: {
      userId: workerUser.id,
      verificationStatus: 'PENDING',
      experienceYears: 5,
      description: 'Experienced professional',
    },
  });
  console.log('Test worker created:', workerUser.email);

  console.log('\n--- Test Credentials ---');
  console.log('Admin:  admin@arslan.com / admin123');
  console.log('Customer: customer@test.com / user123');
  console.log('Worker: worker@test.com / user123');

  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
