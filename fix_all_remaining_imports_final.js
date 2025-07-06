const fs = require('fs');
const path = require('path');

// Define the base directory
const baseDir = path.join(__dirname, 'src/web/landing/src/lib/constructor');

function fixAllImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    // Fix any remaining image-export-settings.svelte imports
    const imageExportFixed = content.replace(
      /from ['"]\.\.\/state\/image-export-settings\.svelte['"]/g,
      "from '../state/image-export-settings.js'"
    );
    if (imageExportFixed !== content) {
      content = imageExportFixed;
      modified = true;
      console.log(`  ✓ Fixed image-export-settings import in: ${path.relative(baseDir, filePath)}`);
    }
    
    // Fix any remaining downloadUtils imports with wrong path
    const downloadUtilsFixed = content.replace(
      /from ['"]\.\.\/components\/Pictograph\/export\/downloadUtils\.js['"]/g,
      "from '../../../components/Pictograph/export/downloadUtils.js'"
    );
    if (downloadUtilsFixed !== content) {
      content = downloadUtilsFixed;
      modified = true;
      console.log(`  ✓ Fixed downloadUtils import in: ${path.relative(baseDir, filePath)}`);
    }
    
    // Fix any remaining fileSystemUtils imports with wrong path
    const fileSystemUtilsFixed = content.replace(
      /from ['"]\.\.\/utils\/fileSystemUtils\.js['"]/g,
      "from './fileSystemUtils.js'"
    );
    if (fileSystemUtilsFixed !== content) {
      content = fileSystemUtilsFixed;
      modified = true;
      console.log(`  ✓ Fixed fileSystemUtils import in: ${path.relative(baseDir, filePath)}`);
    }
    
    // Fix any remaining ToastManager imports
    const toastManagerFixed = content.replace(
      /from ['"]\.\.\/\.\.\/components\/shared\/ToastManager\.svelte['"]/g,
      "from '../../../components/shared/ToastManager.svelte.js'"
    );
    if (toastManagerFixed !== content) {
      content = toastManagerFixed;
      modified = true;
      console.log(`  ✓ Fixed ToastManager import in: ${path.relative(baseDir, filePath)}`);
    }
    
    // Fix any remaining SequenceImageExporter imports
    const sequenceImageExporterFixed = content.replace(
      /from ['"]\.\.\/\.\.\/components\/Pictograph\/export\/SequenceImageExporter\.js['"]/g,
      "from '../../../components/Pictograph/export/SequenceImageExporter.js'"
    );
    if (sequenceImageExporterFixed !== content) {
      content = sequenceImageExporterFixed;
      modified = true;
      console.log(`  ✓ Fixed SequenceImageExporter import in: ${path.relative(baseDir, filePath)}`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

function getAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.svelte')) {
        fileList.push(filePath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error.message}`);
  }
  
  return fileList;
}

function main() {
  console.log('🔧 Fixing ALL remaining import issues...\n');
  
  const allFiles = getAllFiles(baseDir);
  let fixedCount = 0;
  
  allFiles.forEach(filePath => {
    if (fixAllImports(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed imports in ${fixedCount} files`);
  
  // Also check if all required files exist
  console.log('\n📁 Checking required files exist...');
  
  const requiredFiles = [
    'src/web/landing/src/lib/constructor/components/Pictograph/export/downloadUtils.js',
    'src/web/landing/src/lib/constructor/SequenceWorkbench/share/utils/fileSystemUtils.js',
    'src/web/landing/src/lib/constructor/SequenceWorkbench/share/state/image-export-settings.js',
    'src/web/landing/src/lib/constructor/components/shared/ToastManager.svelte.js'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ MISSING: ${file}`);
    }
  });
}

main();
