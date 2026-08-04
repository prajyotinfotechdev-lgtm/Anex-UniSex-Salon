import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.mediaAsset.findMany({
    where: {
      folder: null
    }
  });

  console.log(`Found ${assets.length} assets with null folder.`);

  let updated = 0;
  for (const asset of assets) {
    if (asset.providerId) {
      // e.g. anex/organizations/<org_id>/inspiration/<filename>
      const parts = asset.providerId.split('/');
      // Usually it's [0]=anex, [1]=organizations, [2]=orgId, [3]=folder, [4]=filename
      if (parts.length >= 4) {
        const folder = parts[3]; // 'inspiration'
        await prisma.mediaAsset.update({
          where: { id: asset.id },
          data: { folder: folder }
        });
        updated++;
      }
    }
  }

  console.log(`Updated ${updated} assets to have correct folder.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
