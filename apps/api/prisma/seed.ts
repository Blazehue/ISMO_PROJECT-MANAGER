/**
 * Demo data: test data only, no real personal information.
 * Login: demo@ismo.test / Demo@1234
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const day = (offset: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
};

const projects = [
  {
    name: 'Organoid Imaging Pipeline',
    description: 'Automate capture and analysis of live-cell imaging runs.',
    status: 'IN_PROGRESS',
    startDate: day(-30),
    endDate: day(45),
    tasks: [
      { name: 'Define imaging metadata format', priority: 'HIGH', status: 'COMPLETED', dueDate: day(-20) },
      { name: 'Build upload service for microscope exports', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: day(3) },
      { name: 'Thumbnail generation worker', priority: 'MEDIUM', status: 'PENDING', dueDate: day(10) },
      { name: 'Dashboard for run status', priority: 'LOW', status: 'PENDING', dueDate: day(25) },
    ],
  },
  {
    name: 'Bioreactor Firmware v2',
    description: 'Flow-rate control improvements and telemetry for the microfluidic bioreactor.',
    status: 'NOT_STARTED',
    startDate: day(7),
    endDate: day(90),
    tasks: [
      { name: 'Collect requirements from lab team', priority: 'MEDIUM', status: 'PENDING', dueDate: day(14) },
      { name: 'Prototype PID tuning', priority: 'HIGH', status: 'PENDING', dueDate: day(30) },
    ],
  },
  {
    name: 'Customer Order Portal',
    description: 'Track custom chip design orders from quote to delivery.',
    status: 'COMPLETED',
    startDate: day(-120),
    endDate: day(-10),
    tasks: [
      { name: 'Quote request form', priority: 'MEDIUM', status: 'COMPLETED', dueDate: day(-90) },
      { name: 'Order status emails', priority: 'LOW', status: 'COMPLETED', dueDate: day(-40) },
      { name: 'Admin order board', priority: 'HIGH', status: 'COMPLETED', dueDate: day(-15) },
    ],
  },
  {
    name: '3D Bioprinter Calibration',
    description: null,
    status: 'IN_PROGRESS',
    startDate: day(-10),
    endDate: null,
    tasks: [
      { name: 'Nozzle offset calibration routine', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: day(1) },
      { name: 'Document calibration steps', priority: 'LOW', status: 'PENDING', dueDate: null },
    ],
  },
] as const;

async function main() {
  const email = 'demo@ismo.test';
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: { name: 'Demo User', email, passwordHash: await bcrypt.hash('Demo@1234', 12) },
  });

  for (const { tasks, ...project } of projects) {
    await prisma.project.create({
      data: { ...project, userId: user.id, tasks: { create: tasks.map((task) => ({ ...task })) } },
    });
  }

  console.log(`Seeded ${projects.length} projects for ${email} (password: Demo@1234)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
