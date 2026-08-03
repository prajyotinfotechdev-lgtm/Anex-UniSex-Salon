import { prisma } from './src/database/prisma.client';

async function checkDb() {
  const totalPosts = await prisma.inspirationPost.count();
  const publishedPosts = await prisma.inspirationPost.count({ where: { status: 'PUBLISHED' } });
  const totalAssets = await prisma.mediaAsset.count();
  
  const samplePost = await prisma.inspirationPost.findFirst({
    where: { status: 'PUBLISHED' },
    include: {
      heroMedia: { select: { id: true, url: true, secureUrl: true } }
    }
  });

  console.log('=== DATABASE STATE ===');
  console.log('Total inspiration posts:', totalPosts);
  console.log('Published posts:', publishedPosts);
  console.log('Total media assets:', totalAssets);
  console.log('Sample published post:', JSON.stringify(samplePost, null, 2));
  
  await prisma.$disconnect();
}

checkDb().catch(console.error);
