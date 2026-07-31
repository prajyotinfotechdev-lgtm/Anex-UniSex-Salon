import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: {
      username: "admin",
    },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.adminUser.create({
    data: {
      username: "admin",
      passwordHash,
      fullName: "Administrator",
      role: "OWNER",
      isActive: true,
    },
  });

  console.log("✅ Admin user created successfully.");
  console.log("Username: admin");
  console.log("Password: Admin@123");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });