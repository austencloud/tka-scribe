const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/lib/services/implementations/generation/MovementGeneratorService.ts',
  'src/lib/services/implementations/movement/CSVMovementGeneratorService.ts',
  'src/lib/state/movement-generation.svelte.ts'
];

// Replacements to make
const replacements = [
  { from: 'positionSystem: "alpha"', to: 'positionSystem: PositionSystem.ALPHA' },
  { from: 'positionSystem: "beta"', to: 'positionSystem: PositionSystem.BETA' },
  { from: 'positionSystem: "gamma"', to: 'positionSystem: PositionSystem.GAMMA' },
  { from: 'positionSystem as "alpha" | "beta" | "gamma"', to: 'positionSystem as PositionSystem' },
  { from: 'this.determinePositionSystem(movement.startPosition)', to: 'this.determinePositionSystem(movement.startPosition) as PositionSystem' }
];

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(replacement => {
      content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Position system fixes completed');
