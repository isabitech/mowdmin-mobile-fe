import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'compressed-assets');

const targets = [
  { file: 'src/assets/readbible.jpg', maxWidth: 1600, quality: 72 },
  { file: 'src/assets/images/onboarding/one.jpg', maxWidth: 1440, quality: 72 },
  { file: 'src/assets/images/onboarding/two.jpg', maxWidth: 1440, quality: 72 },
  { file: 'src/assets/images/onboarding/three.jpg', maxWidth: 1440, quality: 72 },
  { file: 'src/assets/one.jpg', maxWidth: 1440, quality: 72 },
  { file: 'src/assets/images/complete-setup.png', maxWidth: 768, quality: 75 },
  { file: 'src/assets/images/events/baptism.jpg', maxWidth: 1280, quality: 72 },
  { file: 'src/assets/images/events/sympossium.jpg', maxWidth: 1280, quality: 72 },
  { file: 'src/assets/images/events/events-placeholder.png', maxWidth: 1024, quality: 75 },
  { file: 'src/assets/images/events/crusade.jpg', maxWidth: 1280, quality: 72 },
  { file: 'src/assets/images/events/conference.jpg', maxWidth: 1280, quality: 72 },
];

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function compressTarget(target) {
  const inputPath = path.join(repoRoot, target.file);
  const outputPath = path.join(outputRoot, target.file);
  const extension = path.extname(target.file).toLowerCase();

  await ensureDir(path.dirname(outputPath));

  const originalBuffer = await fs.readFile(inputPath);
  const image = sharp(originalBuffer, { failOn: 'none' });
  const metadata = await image.metadata();

  let pipeline = image.resize({
    width: target.maxWidth,
    withoutEnlargement: true,
    fit: 'inside',
  });

  if (extension === '.jpg' || extension === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: target.quality,
      mozjpeg: true,
      progressive: true,
    });
  } else if (extension === '.png') {
    pipeline = pipeline.png({
      quality: target.quality,
      compressionLevel: 9,
      palette: true,
      effort: 10,
    });
  } else {
    throw new Error(`Unsupported file type for ${target.file}`);
  }

  await pipeline.toFile(outputPath);

  const originalStats = await fs.stat(inputPath);
  const outputStats = await fs.stat(outputPath);

  return {
    file: target.file,
    outputFile: path.relative(repoRoot, outputPath),
    originalBytes: originalStats.size,
    compressedBytes: outputStats.size,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

async function main() {
  console.log(`Writing compressed copies to: ${path.relative(repoRoot, outputRoot)}`);

  const results = [];

  for (const target of targets) {
    try {
      const result = await compressTarget(target);
      results.push(result);
      console.log(
        `${result.file}\n` +
          `  original:   ${formatMb(result.originalBytes)} (${result.width}x${result.height})\n` +
          `  compressed: ${formatMb(result.compressedBytes)} -> ${result.outputFile}\n`
      );
    } catch (error) {
      console.error(`Failed to compress ${target.file}:`, error.message);
    }
  }

  const totalOriginal = results.reduce((sum, item) => sum + item.originalBytes, 0);
  const totalCompressed = results.reduce((sum, item) => sum + item.compressedBytes, 0);
  const savedBytes = totalOriginal - totalCompressed;

  console.log('Summary');
  console.log(`  Processed files: ${results.length}`);
  console.log(`  Original total:  ${formatMb(totalOriginal)}`);
  console.log(`  New total:       ${formatMb(totalCompressed)}`);
  console.log(`  Space saved:     ${formatMb(savedBytes)}`);

  await fs.writeFile(
    path.join(outputRoot, 'compression-report.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        outputRoot: path.relative(repoRoot, outputRoot),
        totalOriginalBytes: totalOriginal,
        totalCompressedBytes: totalCompressed,
        savedBytes,
        files: results,
      },
      null,
      2
    )
  );

  console.log('\nReport written to compressed-assets/compression-report.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
