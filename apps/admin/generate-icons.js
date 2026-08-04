import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  const sourceImage = path.join(__dirname, 'public/anex-logo.png');
  
  const apps = ['admin', 'customer'];
  
  for (const app of apps) {
    const publicDir = path.join(__dirname, `../../apps/${app}/public`);
    console.log(`Generating icons for ${app}...`);

    try {
      // 192x192
      await sharp(sourceImage)
        .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(publicDir, 'icon-192x192.png'));
        
      // 512x512
      await sharp(sourceImage)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(publicDir, 'icon-512x512.png'));

      // Apple Touch Icon (180x180 with solid background is usually better, but transparent is okay if the logo looks good)
      await sharp(sourceImage)
        .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .toFile(path.join(publicDir, 'apple-touch-icon.png'));

      // Favicon 32x32
      await sharp(sourceImage)
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(publicDir, 'favicon.png'));
        
      console.log(`Successfully generated icons for ${app}`);
      
      // Update manifest.json
      const manifestPath = path.join(publicDir, 'manifest.json');
      let manifestStr = '{}';
      try {
        manifestStr = await fs.readFile(manifestPath, 'utf8');
      } catch (e) {
        console.log(`No manifest found in ${app}, creating a premium one...`);
      }
      
      const manifest = JSON.parse(manifestStr || '{}');
      manifest.name = "Anex Salon";
      manifest.short_name = "Anex";
      manifest.description = "Premium Salon Experience";
      manifest.start_url = "/";
      manifest.display = "standalone";
      manifest.background_color = "#000000";
      manifest.theme_color = "#000000";
      manifest.icons = [
        {
          src: "/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ];
      
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`Updated manifest.json for ${app}`);
      
    } catch (err) {
      console.error(`Error processing ${app}:`, err);
    }
  }
}

generateIcons();
