import https from 'https';
import http from 'http';

const sites = [
  'https://customerapplication.netlify.app',
  'https://anexadmin.netlify.app'
];

const imageUrls = [
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f',
  'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  'https://i.pravatar.cc/300',
  'http://images.unsplash.com/photo-1622286342621-4bd786c2447c',
  'https://via.placeholder.com/150',
  '/logo.png',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
];

const widths = [640, 828, 1080, 1920, 3840]; // Note: Next.js default widths: 16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840

async function testUrl(site, imgUrl, width) {
  const nextImageUrl = `${site}/_next/image?url=${encodeURIComponent(imgUrl)}&w=${width}&q=75`;
  return new Promise((resolve) => {
    https.get(nextImageUrl, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        if (body.length < 1000) body += chunk.toString();
      });
      res.on('end', () => {
        resolve({
          site,
          imgUrl,
          width,
          nextImageUrl,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          server: res.headers['server'],
          body: res.statusCode !== 200 ? body : '[BINARY IMAGE DATA]'
        });
      });
    }).on('error', (err) => {
      resolve({ site, imgUrl, width, nextImageUrl, status: 'ERROR', body: err.message });
    });
  });
}

async function run() {
  console.log("Starting Next.js image endpoint diagnostics on Netlify live apps...\n");
  const results = [];
  for (const site of sites) {
    for (const imgUrl of imageUrls) {
      for (const width of [256, 828, 1200]) {
        const res = await testUrl(site, imgUrl, width);
        results.push(res);
        if (res.status !== 200) {
          console.log(`❌ FAIL [HTTP ${res.status}]`);
          console.log(`   Site: ${res.site}`);
          console.log(`   Img: ${res.imgUrl}`);
          console.log(`   Width: ${res.width}`);
          console.log(`   Endpoint: ${res.nextImageUrl}`);
          console.log(`   Body: ${res.body}`);
          console.log("--------------------------------------------------");
        } else {
          console.log(`✅ PASS [HTTP 200] ${res.site} - w=${res.width} - ${res.imgUrl.substring(0, 45)}...`);
        }
      }
    }
  }
}

run();
