#!/usr/bin/env node

/**
 * Release to Production
 * 
 * Interactive workflow for releasing features to production.
 * 
 * This script:
 * 1. Checks current branch
 * 2. Shows what features are currently enabled/disabled in production
 * 3. Prompts to enable/disable modules
 * 4. Updates netlify.toml
 * 5. Creates a commit
 * 6. Optionally creates a PR or pushes to main
 * 
 * Usage:
 *   node scripts/release-to-production.js
 *   
 * Or use VSCode task: "🚀 Release to Production"
 * Or type /release in AI assistant (Claude, Copilot, Cursor)
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function releaseToProduction() {
  console.log('\n🚀 Release to Production Workflow\n');
  
  // Check current branch
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  console.log(`📍 Current branch: ${branch}\n`);
  
  if (branch === 'main' || branch === 'release') {
    console.log('⚠️  WARNING: You\'re already on a production branch!');
    const proceed = await question('   Continue anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('\n❌ Cancelled\n');
      rl.close();
      return;
    }
  }
  
  // Read current netlify.toml
  const netlifyConfig = readFileSync('netlify.toml', 'utf8');
  
  // Parse current production settings
  const productionSection = netlifyConfig.match(/\[context\.production\.environment\]([\s\S]*?)(?=\[|$)/);
  if (!productionSection) {
    console.error('❌ Could not find production context in netlify.toml');
    rl.close();
    process.exit(1);
  }
  
  const modules = {
    CREATE: netlifyConfig.includes('PUBLIC_ENABLE_CREATE_MODULE = "true"'),
    DISCOVER: netlifyConfig.includes('PUBLIC_ENABLE_DISCOVER_MODULE = "true"'),
    FEEDBACK: netlifyConfig.includes('PUBLIC_ENABLE_FEEDBACK_MODULE = "true"'),
    LEARN: netlifyConfig.includes('PUBLIC_ENABLE_LEARN_MODULE = "true"'),
    LIBRARY: netlifyConfig.includes('PUBLIC_ENABLE_LIBRARY_MODULE = "true"'),
    COMPOSE: netlifyConfig.includes('PUBLIC_ENABLE_COMPOSE_MODULE = "true"'),
    TRAIN: netlifyConfig.includes('PUBLIC_ENABLE_TRAIN_MODULE = "true"'),
    ML_TRAINING: netlifyConfig.includes('PUBLIC_ENABLE_ML_TRAINING_MODULE = "true"')
  };
  
  console.log('📦 Current Production Status:\n');
  for (const [name, enabled] of Object.entries(modules)) {
    const status = enabled ? '✅ Released' : '❌ Not Released';
    const moduleName = name.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
    console.log(`   ${status} - ${moduleName}`);
  }
  
  console.log('\n');
  const changeModules = await question('Do you want to change module visibility? (y/n): ');
  
  if (changeModules.toLowerCase() === 'y') {
    console.log('\n📝 Update Module Visibility:\n');
    
    const updates = {};
    for (const [name] of Object.entries(modules)) {
      const moduleName = name.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
      const answer = await question(`   Enable ${moduleName}? (y/n/skip): `);
      
      if (answer.toLowerCase() === 'y') {
        updates[name] = true;
      } else if (answer.toLowerCase() === 'n') {
        updates[name] = false;
      }
    }
    
    // Update netlify.toml
    let updatedConfig = netlifyConfig;
    for (const [name, enabled] of Object.entries(updates)) {
      const varName = `PUBLIC_ENABLE_${name}_MODULE`;
      const currentValue = enabled ? '"false"' : '"true"';
      const newValue = enabled ? '"true"' : '"false"';
      
      // Update in production context
      const regex = new RegExp(`(\\[context\\.production\\.environment\\][\\s\\S]*?${varName}\\s*=\\s*)"(?:true|false)"`, 'g');
      updatedConfig = updatedConfig.replace(regex, `$1${newValue}`);
    }
    
    // Show diff
    console.log('\n📄 Changes to be made:\n');
    for (const [name, enabled] of Object.entries(updates)) {
      const moduleName = name.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
      const change = enabled ? '❌ → ✅' : '✅ → ❌';
      console.log(`   ${change} ${moduleName}`);
    }
    
    const confirm = await question('\nApply these changes? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      writeFileSync('netlify.toml', updatedConfig);
      console.log('\n✅ Updated netlify.toml\n');
      
      // Git workflow
      console.log('📝 Creating git commit...\n');
      
      const commitMessage = await question('Enter commit message (or press Enter for default): ');
      const message = commitMessage.trim() || 'chore: Update production module visibility';
      
      try {
        execSync('git add netlify.toml', { stdio: 'inherit' });
        execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
        console.log('\n✅ Committed changes\n');
        
        const pushAction = await question('What next? (1) Push to current branch, (2) Create PR, (3) Nothing: ');
        
        if (pushAction === '1') {
          execSync(`git push origin ${branch}`, { stdio: 'inherit' });
          console.log('\n✅ Pushed to origin\n');
        } else if (pushAction === '2') {
          const prTitle = `Release: ${message}`;
          console.log(`\n📝 Create a PR: ${branch} → main`);
          console.log(`   Title: ${prTitle}`);
          console.log(`   Open GitHub to create the PR manually, or use gh CLI:\n`);
          console.log(`   gh pr create --title "${prTitle}" --body "Updates production module visibility" --base main\n`);
        }
        
        console.log('🎉 Release preparation complete!\n');
        console.log('Next steps:');
        console.log('  1. Merge PR to main (if created)');
        console.log('  2. Netlify will auto-deploy to production');
        console.log('  3. Verify changes at https://tka.studio\n');
        
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('\n❌ Changes cancelled\n');
    }
  } else {
    console.log('\n✅ No changes made\n');
  }
  
  rl.close();
}

releaseToProduction().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
