import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImagePath = fs.existsSync('C:/Users/ushma/.gemini/antigravity/brain/6ccf885f-3a0d-497a-8b90-7965c82f71e5/.user_uploaded/media_1792480842924_3f2da48f.jpg')
  ? 'C:/Users/ushma/.gemini/antigravity/brain/6ccf885f-3a0d-497a-8b90-7965c82f71e5/.user_uploaded/media_1792480842924_3f2da48f.jpg'
  : './gameicon.jpeg';

async function generateAllIcons() {
  console.log('Processing app icon from uploaded image:', sourceImagePath);
  const image = sharp(sourceImagePath);

  // Copy source to gameicon.jpeg in root if different
  if (sourceImagePath !== './gameicon.jpeg') {
    fs.copyFileSync(sourceImagePath, './gameicon.jpeg');
  }

  // 1. Web & PWA Icons
  await image.clone().resize(192, 192).png().toFile('./public/pwa-192x192.png');
  await image.clone().resize(512, 512).png().toFile('./public/pwa-512x512.png');
  await image.clone().resize(180, 180).png().toFile('./public/apple-touch-icon.png');

  // Maskable icon with safe zone
  await image.clone()
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#f8fafc'
    })
    .png()
    .toFile('./public/pwa-maskable-512x512.png');

  // Play Store 512x512 PNG
  await image.clone().resize(512, 512).png().toFile('./public/play-console-icon.png');

  // 2. Android Launcher Icons (mipmap folders)
  const androidMipmaps = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const { dir, size, fgSize } of androidMipmaps) {
    const targetDir = path.resolve('./android/app/src/main/res', dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Standard square ic_launcher.png
    await image.clone().resize(size, size).png().toFile(path.join(targetDir, 'ic_launcher.png'));

    // Rounded ic_launcher_round.png
    await image.clone().resize(size, size).png().toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Adaptive foreground ic_launcher_foreground.png with 72% safe zone inside 108dp canvas
    const innerSize = Math.round(fgSize * 0.72);
    const innerBuffer = await image.clone().resize(innerSize, innerSize).png().toBuffer();
    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: '#f8fafc'
      }
    })
    .composite([
      {
        input: innerBuffer,
        top: Math.round((fgSize - innerSize) / 2),
        left: Math.round((fgSize - innerSize) / 2)
      }
    ])
    .png()
    .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));
  }

  // 3. Android Splash Screens (portrait and landscape)
  const splashConfigs = [
    // Base drawable
    { dir: 'drawable', width: 480, height: 480, scale: 0.8 },

    // Portrait splash drawables
    { dir: 'drawable-port-mdpi', width: 320, height: 480, scale: 0.45 },
    { dir: 'drawable-port-hdpi', width: 480, height: 800, scale: 0.45 },
    { dir: 'drawable-port-xhdpi', width: 720, height: 1280, scale: 0.45 },
    { dir: 'drawable-port-xxhdpi', width: 960, height: 1600, scale: 0.45 },
    { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920, scale: 0.45 },

    // Landscape splash drawables
    { dir: 'drawable-land-mdpi', width: 480, height: 320, scale: 0.45 },
    { dir: 'drawable-land-hdpi', width: 800, height: 480, scale: 0.45 },
    { dir: 'drawable-land-xhdpi', width: 1280, height: 720, scale: 0.45 },
    { dir: 'drawable-land-xxhdpi', width: 1600, height: 960, scale: 0.45 },
    { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280, scale: 0.45 },
  ];

  for (const { dir, width, height, scale } of splashConfigs) {
    const targetDir = path.resolve('./android/app/src/main/res', dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const logoSize = Math.round(Math.min(width, height) * scale);
    const logoBuffer = await image.clone().resize(logoSize, logoSize).png().toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: '#f8fafc'
      }
    })
    .composite([
      {
        input: logoBuffer,
        top: Math.round((height - logoSize) / 2),
        left: Math.round((width - logoSize) / 2)
      }
    ])
    .png()
    .toFile(path.join(targetDir, 'splash.png'));

    console.log(`Updated ${dir}/splash.png (${width}x${height}, logo: ${logoSize}px)`);
  }

  console.log('All Web and Android icons & splash screens updated successfully!');
}

generateAllIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
