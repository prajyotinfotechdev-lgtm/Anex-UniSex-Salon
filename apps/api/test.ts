import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.organization.findMany().then(console.log).catch(console.error).finally(() => prisma.$disconnect());
