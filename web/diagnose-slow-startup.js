#!/usr/bin/env node

/**
 * TKA Web App - Comprehensive Startup Performance Diagnostics
 * 
 * This script identifies the EXACT cause of slow startup times by:
 * 1. Measuring each phase of startup
 * 2. Checking for common performance bottlenecks
 * 3. Providing specific fixes
 */

import fs from 'fs/promises';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

console.log('🔍 TKA Web App - Startup Performance Diagnostics\n');

// Check system resources
async function checkSystemResources() {
  console.log('💻 Checking system resources...');
  
  try {
    // Check available memory
    const { stdout: memInfo } = await execAsync('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value');
    const totalMem = parseInt(memInfo.match(/TotalVisibleMemorySize=(\d+)/)?.[1] || '0') / 1024 / 1024;
    const freeMem = parseInt(memInfo.match(/FreePhysicalMemory=(\d+)/)?.[1] || '0') / 1024 / 1024;
    
    console.log(`   RAM: ${freeMem.toFixed(1)}GB free / ${totalMem.toFixed(1)}GB total`);
    
    if (freeMem < 2) {
      console.log('   ⚠️  LOW MEMORY: Less than 2GB free RAM');
    }
    
    // Check CPU usage
    const { stdout: cpuInfo } = await execAsync('wmic cpu get loadpercentage /value');
    const cpuLoad = parseInt(cpuInfo.match(/LoadPercentage=(\d+)/)?.[1] || '0');
    console.log(`   CPU: ${cpuLoad}% usage`);
    
    if (cpuLoad > 80) {
      console.log('   ⚠️  HIGH CPU: Over 80% CPU usage');
    }
    
  } catch (error) {
    console.log('   ❌ Could not check system resources');
  }
  console.log('');
}

// Check for performance bottlenecks
async function checkPerformanceBottlenecks() {
  console.log('🐌 Checking for performance bottlenecks...');
  
  const issues = [];
  
  // Check node_modules size
  try {
    const { stdout } = await execAsync('powershell -Command "(Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB"');
    const sizeMB = parseFloat(stdout.trim());
    console.log(`   📦 node_modules size: ${sizeMB.toFixed(0)}MB`);
    
    if (sizeMB > 1000) {
      issues.push(`Large node_modules (${sizeMB.toFixed(0)}MB) - consider npm prune`);
    }
  } catch (error) {
    console.log('   ⚠️  Could not check node_modules size');
  }
  
  // Check for TypeScript compilation issues
  try {
    const tsconfigContent = await fs.readFile('tsconfig.json', 'utf-8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    if (!tsconfig.compilerOptions?.incremental) {
      issues.push('TypeScript incremental compilation disabled');
    }
    
    if (tsconfig.compilerOptions?.strict === false) {
      issues.push('TypeScript strict mode disabled (slower compilation)');
    }
  } catch (error) {
    issues.push('Could not read tsconfig.json');
  }
  
  // Check Vite config for performance issues
  try {
    const viteConfigContent = await fs.readFile('vite.config.ts', 'utf-8');
    
    if (!viteConfigContent.includes('optimizeDeps')) {
      issues.push('Missing Vite dependency optimization');
    }
    
    if (viteConfigContent.includes('minify: false')) {
      console.log('   ℹ️  Minification disabled (expected in dev)');
    }
    
    if (!viteConfigContent.includes('sourcemap')) {
      issues.push('Source maps configuration missing');
    }
  } catch (error) {
    issues.push('Could not read vite.config.ts');
  }
  
  // Check for antivirus interference
  try {
    const { stdout } = await execAsync('powershell -Command "Get-MpPreference | Select-Object -ExpandProperty ExclusionPath"');
    const exclusions = stdout.toLowerCase();
    const currentDir = process.cwd().toLowerCase();
    
    if (!exclusions.includes(currentDir) && !exclusions.includes('node_modules')) {
      issues.push('Project not excluded from Windows Defender - add to exclusions');
    }
  } catch (error) {
    console.log('   ⚠️  Could not check antivirus exclusions');
  }
  
  if (issues.length > 0) {
    console.log('   ❌ Performance issues found:');
    issues.forEach(issue => console.log(`      - ${issue}`));
  } else {
    console.log('   ✅ No obvious performance bottlenecks found');
  }
  
  console.log('');
  return issues;
}

// Measure actual startup phases
async function measureStartupPhases() {
  console.log('⏱️  Measuring startup phases...');
  
  const phases = {
    processStart: 0,
    viteInit: 0,
    serverReady: 0,
    total: 0
  };
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log('   🚀 Starting dev server...');
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    let output = '';
    let viteInitTime = 0;
    let serverReadyTime = 0;
    
    devProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // Detect Vite initialization
      if (chunk.includes('VITE') && !viteInitTime) {
        viteInitTime = Date.now();
        phases.viteInit = viteInitTime - startTime;
        console.log(`   📦 Vite initialized: ${phases.viteInit}ms`);
      }
      
      // Detect server ready
      if (chunk.includes('ready in') && !serverReadyTime) {
        serverReadyTime = Date.now();
        phases.serverReady = serverReadyTime - startTime;
        
        // Extract actual ready time from Vite output
        const readyMatch = chunk.match(/ready in (\d+) ms/);
        if (readyMatch) {
          const viteReadyTime = parseInt(readyMatch[1]);
          console.log(`   ⚡ Vite ready: ${viteReadyTime}ms (internal)`);
          console.log(`   🌐 Server accessible: ${phases.serverReady}ms (total)`);
        }
        
        phases.total = serverReadyTime - startTime;
        
        // Kill the process and resolve
        devProcess.kill();
        setTimeout(() => resolve(phases), 100);
      }
    });
    
    devProcess.stderr.on('data', (data) => {
      console.log(`   ❌ Error: ${data.toString()}`);
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('   ⏰ Timeout reached');
      devProcess.kill();
      phases.total = Date.now() - startTime;
      resolve(phases);
    }, 30000);
  });
}

// Generate performance recommendations
function generateRecommendations(phases, issues) {
  console.log('💡 Performance Recommendations:');
  
  if (phases.total > 5000) {
    console.log('   🚨 CRITICAL: Startup time over 5 seconds');
    
    if (issues.some(i => i.includes('node_modules'))) {
      console.log('   🔧 Run: npm prune && npm ci');
    }
    
    if (issues.some(i => i.includes('Defender'))) {
      console.log('   🔧 Add project to Windows Defender exclusions');
      console.log('      Settings > Update & Security > Windows Security > Virus & threat protection');
      console.log('      > Manage settings > Add or remove exclusions');
    }
    
    if (issues.some(i => i.includes('TypeScript'))) {
      console.log('   🔧 Enable TypeScript incremental compilation in tsconfig.json');
    }
  } else if (phases.total > 3000) {
    console.log('   ⚠️  Startup time acceptable but could be better');
  } else {
    console.log('   ✅ Startup time is good');
  }
  
  // Browser connection delay analysis
  if (phases.total < 3000) {
    console.log('   🔍 Server starts fast but browser connection is slow');
    console.log('   🔧 Check VS Code launch.json serverReadyAction pattern');
    console.log('   🔧 Clear browser cache and profiles');
    console.log('   🔧 Check network/firewall settings');
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('Starting comprehensive startup diagnostics...\n');
  
  await checkSystemResources();
  const issues = await checkPerformanceBottlenecks();
  const phases = await measureStartupPhases();
  
  console.log('\n📊 Results Summary:');
  console.log(`   Total startup time: ${phases.total}ms`);
  console.log(`   Issues found: ${issues.length}`);
  
  generateRecommendations(phases, issues);
  
  console.log('\n🎯 Diagnostics complete!');
}

// Run diagnostics
runDiagnostics().catch(console.error);
