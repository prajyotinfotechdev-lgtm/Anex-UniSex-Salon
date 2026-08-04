import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.inspirationPost.findMany({
    take: 5,
    include: {
      heroMedia: true
    }
  });
  console.log(JSON.stringify(posts.map(p => ({
    id: p.id,
    title: p.title,
    heroMediaId: p.heroMediaId,
    heroMedia: p.heroMedia
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
