#!/usr/bin/env node

/**
 * Switch Environment
 * 
 * Switches between development and production environment settings
 * by updating .env.local based on template files.
 * 
 * Usage:
 *   node scripts/switch-environment.js dev   - Switch to development
 *   node scripts/switch-environment.js prod  - Switch to production
 */

import { copyFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const mode = process.argv[2];

if (!mode || !['dev', 'prod', 'development', 'production'].includes(mode)) {
  console.error('❌ Invalid mode. Use: dev, prod, development, or production');
  process.exit(1);
}

const isDev = mode === 'dev' || mode === 'development';
const sourceFile = isDev ? '.env.development' : '.env.production';
const targetFile = '.env.local';

try {
  // Check if source file exists
  if (!existsSync(sourceFile)) {
    console.error(`❌ Source file not found: ${sourceFile}`);
    process.exit(1);
  }
  
  // Copy file
  copyFileSync(sourceFile, targetFile);
  
  // Get current branch
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  console.log(`\n✅ Environment switched to ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  console.log(`   📄 Copied: ${sourceFile} → ${targetFile}`);
  console.log(`   📍 Current branch: ${branch}\n`);
  
  if (isDev) {
    console.log('🔧 Development mode:');
    console.log('   • All modules visible');
    console.log('   • Debug tools enabled');
    console.log('   • Role override enabled\n');
  } else {
    console.log('📦 Production mode:');
    console.log('   • Only released modules visible');
    console.log('   • Debug tools disabled');
    console.log('   • Matches production deployment\n');
  }
  
  // Warning if branch and environment don't match
  const isProductionBranch = branch === 'main' || branch === 'release';
  if (isProductionBranch && isDev) {
    console.log('⚠️  WARNING: Production branch with development environment');
    console.log('   This is fine for testing, but be careful when committing.\n');
  } else if (!isProductionBranch && !isDev) {
    console.log('ℹ️  INFO: Development branch with production environment');
    console.log('   Good for testing what users will see.\n');
  }
  
  console.log('💡 Tip: Restart your dev server to apply changes\n');
  
} catch (error) {
  console.error('❌ Error switching environment:', error.message);
  process.exit(1);
}
