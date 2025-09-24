#!/usr/bin/env node

/**
 * Simple bundle analyzer script
 * Analyzes the built bundle and provides size information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('📊 Bundle Analysis Report\n');
  console.log('=' .repeat(50));

  const files = fs.readdirSync(distDir, { recursive: true });
  const jsFiles = [];
  const cssFiles = [];
  const assetFiles = [];
  let totalSize = 0;

  files.forEach(file => {
    const filePath = path.join(distDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const size = getFileSize(filePath);
      totalSize += size;
      
      const fileInfo = {
        name: file,
        size,
        formattedSize: formatSize(size)
      };

      if (file.endsWith('.js')) {
        jsFiles.push(fileInfo);
      } else if (file.endsWith('.css')) {
        cssFiles.push(fileInfo);
      } else {
        assetFiles.push(fileInfo);
      }
    }
  });

  // Sort by size (largest first)
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);
  assetFiles.sort((a, b) => b.size - a.size);

  console.log(`📦 Total Bundle Size: ${formatSize(totalSize)}\n`);

  if (jsFiles.length > 0) {
    console.log('🟨 JavaScript Files:');
    jsFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(30)} ${file.formattedSize}`);
    });
    console.log('');
  }

  if (cssFiles.length > 0) {
    console.log('🟦 CSS Files:');
    cssFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(30)} ${file.formattedSize}`);
    });
    console.log('');
  }

  if (assetFiles.length > 0) {
    console.log('🟩 Asset Files:');
    assetFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(30)} ${file.formattedSize}`);
    });
    console.log('');
  }

  // Performance recommendations
  console.log('💡 Performance Recommendations:');
  
  const largeJsFiles = jsFiles.filter(f => f.size > 500000); // > 500KB
  if (largeJsFiles.length > 0) {
    console.log('  ⚠️  Large JavaScript files detected:');
    largeJsFiles.forEach(file => {
      console.log(`     - ${file.name} (${file.formattedSize})`);
    });
    console.log('     Consider code splitting or lazy loading.');
  }

  const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  if (totalJsSize > 1000000) { // > 1MB
    console.log('  ⚠️  Total JavaScript size is large. Consider:');
    console.log('     - Tree shaking unused code');
    console.log('     - Lazy loading routes');
    console.log('     - Dynamic imports for heavy libraries');
  }

  if (totalJsSize < 500000) { // < 500KB
    console.log('  ✅ JavaScript bundle size is optimal!');
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Analysis complete!');
}

analyzeBundle();
