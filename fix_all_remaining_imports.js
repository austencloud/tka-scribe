const fs = require('fs');
const path = require('path');

// Define the base directory
const baseDir = path.join(__dirname, 'src/web/landing/src/lib/constructor');

function fixAllImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    // Fix ToastManager imports in share/utils files
    if (filePath.includes('SequenceWorkbench/share/utils/')) {
      const newContent = content.replace(
        /from ['"]\.\.\/\.\.\/components\/shared\/ToastManager\.svelte['"]/g,
        "from '../../../components/shared/ToastManager.svelte.js'"
      );
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`  ✓ Fixed ToastManager import in: ${path.relative(baseDir, filePath)}`);
      }
    }
    
    // Fix any remaining lzstring imports
    const lzstringFixed = content.replace(
      /from ['"]\.\.\/\.\.\/utils\/lzstring\.js['"]/g,
      "from '../../../utils/lzstring.js'"
    );
    if (lzstringFixed !== content) {
      content = lzstringFixed;
      modified = true;
      console.log(`  ✓ Fixed lzstring import in: ${path.relative(baseDir, filePath)}`);
    }
    
    // Fix any remaining logging imports
    const loggingFixed = content.replace(
      /from ['"]\.\.\/\.\.\/core\/logging\.js['"]/g,
      "from '../../core/logging/index.js'"
    );
    if (loggingFixed !== content) {
      content = loggingFixed;
      modified = true;
      console.log(`  ✓ Fixed logging import in: ${path.relative(baseDir, filePath)}`);
    }
    
    // Fix any remaining HapticFeedbackService imports in SequenceWorkbench files
    if (filePath.includes('SequenceWorkbench/') && !filePath.includes('SequenceWorkbench/share/') && !filePath.includes('SequenceWorkbench/components/')) {
      const hapticFixed = content.replace(
        /from ['"]\.\.\/\.\.\/services\/HapticFeedbackService\.js['"]/g,
        "from '../services/HapticFeedbackService.js'"
      );
      if (hapticFixed !== content) {
        content = hapticFixed;
        modified = true;
        console.log(`  ✓ Fixed HapticFeedbackService import in: ${path.relative(baseDir, filePath)}`);
      }
    }
    
    // Fix any remaining sequenceMachine imports in SequenceWorkbench files
    if (filePath.includes('SequenceWorkbench/') && !filePath.includes('SequenceWorkbench/share/') && !filePath.includes('SequenceWorkbench/components/')) {
      const sequenceMachineFixed = content.replace(
        /from ['"]\.\.\/\.\.\/state\/machines\/sequenceMachine\.js['"]/g,
        "from '../state/machines/sequenceMachine.js'"
      );
      if (sequenceMachineFixed !== content) {
        content = sequenceMachineFixed;
        modified = true;
        console.log(`  ✓ Fixed sequenceMachine import in: ${path.relative(baseDir, filePath)}`);
      }
    }
    
    // Fix any remaining sequenceOverlay imports in SequenceWorkbench files
    if (filePath.includes('SequenceWorkbench/') && !filePath.includes('SequenceWorkbench/share/') && !filePath.includes('SequenceWorkbench/components/')) {
      const sequenceOverlayFixed = content.replace(
        /from ['"]\.\.\/\.\.\/\.\.\/state\/sequenceOverlay\/sequenceOverlayState\.js['"]/g,
        "from '../state/sequenceOverlay/sequenceOverlayState.js'"
      );
      if (sequenceOverlayFixed !== content) {
        content = sequenceOverlayFixed;
        modified = true;
        console.log(`  ✓ Fixed sequenceOverlay import in: ${path.relative(baseDir, filePath)}`);
      }
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
  console.log('Fixing all remaining import issues...\n');
  
  const allFiles = getAllFiles(baseDir);
  let fixedCount = 0;
  
  allFiles.forEach(filePath => {
    if (fixAllImports(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed imports in ${fixedCount} files`);
}

main();
