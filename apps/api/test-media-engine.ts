import { PrismaClient } from '@prisma/client';
import { mediaContentEngine } from './src/modules/media/engine/media.engine';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Starting Media Content Engine Verification ---');
  
  // Create a dummy 1x1 pixel PNG buffer
  const dummyImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  
  // Need a valid organization and user
  const org = await prisma.organization.findFirst();
  const user = await prisma.user.findFirst();
  
  if (!org || !user) {
    console.error('No organization or user found in DB');
    return;
  }
  
  try {
    console.log('\n[Phase 1 & 2] End-to-End Upload Verification & Database Verification');
    const inspirationResult = await mediaContentEngine.processUpload(
      dummyImageBuffer,
      org.id,
      user.id,
      'INSPIRATION',
      JSON.stringify({
        title: 'Test Inspiration Post',
        description: 'Test description from engine verification',
        category: 'Haircut',
        status: 'PUBLISHED'
      }),
      'test-inspiration.png',
      'image/png',
      dummyImageBuffer.length
    );
    console.log('✅ Inspiration Upload Success:', inspirationResult.mediaAsset.id);
    
    // Verify DB records
    const asset = await prisma.mediaAsset.findUnique({ where: { id: inspirationResult.mediaAsset.id } });
    const post = await prisma.inspirationPost.findUnique({ where: { id: inspirationResult.domainRecordId } });
    if (asset && post && asset.usageCount === 1 && post.heroMediaId === asset.id) {
      console.log('✅ Database Verification Passed: No orphan records, relationships correct.');
    } else {
      console.error('❌ Database Verification Failed');
      console.error(asset, post);
    }

    console.log('\n[Phase 6] Rollback Verification');
    try {
      await mediaContentEngine.processUpload(
        dummyImageBuffer,
        org.id,
        user.id,
        'INSPIRATION',
        JSON.stringify({
          // Missing title will cause validation to fail BEFORE cloudinary upload
          description: 'No title provided',
        }),
        'test-fail.png',
        'image/png',
        dummyImageBuffer.length
      );
      console.error('❌ Rollback Verification Failed: Expected ValidationError');
    } catch (e: any) {
      if (e.name === 'ValidationError') {
        console.log('✅ Rollback Verification Passed: Caught expected ValidationError');
      } else {
        console.error('❌ Rollback Verification Failed: Unexpected error', e);
      }
    }
    
    console.log('\n[Phase 10] Future Context Test (Homepage Banner)');
    const bannerResult = await mediaContentEngine.processUpload(
      dummyImageBuffer,
      org.id,
      user.id,
      'HOMEPAGE_BANNER',
      JSON.stringify({
        title: 'Summer Sale Banner',
      }),
      'banner.png',
      'image/png',
      dummyImageBuffer.length
    );
    console.log('✅ Future Context Test Passed:', bannerResult.domainRecordId);
    
    console.log('\n--- Verification Complete ---');
  } catch (error) {
    console.error('Test Execution Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
