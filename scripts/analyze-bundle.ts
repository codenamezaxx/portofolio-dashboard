import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const NEXT_DIR = path.join(process.cwd(), '.next');

function getDirectorySize(dirPath: string): number {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  return size;
}

function runAnalysis() {
  console.log('Building project to generate latest bundle information...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Build failed!', error);
    process.exit(1);
  }

  console.log('\n--- Bundle Size Analysis ---');
  if (!fs.existsSync(NEXT_DIR)) {
    console.error('.next directory not found. Please build the project first.');
    process.exit(1);
  }

  const staticDir = path.join(NEXT_DIR, 'static');
  const chunksDir = path.join(staticDir, 'chunks');

  const totalStaticSize = getDirectorySize(staticDir);
  const totalChunksSize = getDirectorySize(chunksDir);

  console.log(`Total .next/static size: ${(totalStaticSize / 1024).toFixed(2)} KB`);
  console.log(`Total chunks size: ${(totalChunksSize / 1024).toFixed(2)} KB`);

  // Analyze page bundles if present
  const serverDir = path.join(NEXT_DIR, 'server/app');
  if (fs.existsSync(serverDir)) {
    console.log('\nServer components/pages sizes:');
    const walkServer = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          walkServer(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.html')) {
          const relative = path.relative(serverDir, fullPath);
          console.log(`- ${relative}: ${(stats.size / 1024).toFixed(2)} KB`);
        }
      }
    };
    walkServer(serverDir);
  }

  console.log('\nCheck if bundle size is within budget (< 750KB total client JS):');
  const totalJSSize = totalChunksSize / 1024;
  if (totalJSSize < 750) {
    console.log(`✓ PASS: Bundle size ${totalJSSize.toFixed(2)} KB is under budget limit of 750 KB.`);
    process.exit(0);
  } else {
    console.warn(`⚠ WARNING: Bundle size ${totalJSSize.toFixed(2)} KB exceeds budget of 750 KB.`);
    process.exit(0);
  }
}

runAnalysis();