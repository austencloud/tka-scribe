// Test script for background system
console.log('Testing background system...');

// Check if the page loaded
if (typeof window !== 'undefined') {
    console.log('✅ Window object exists');

    // Check if canvas is rendered
    const canvas = document.querySelector('canvas');
    if (canvas) {
        console.log('✅ Canvas element found:', canvas);
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    } else {
        console.log('❌ No canvas element found');
    }

    // Check if background context is available
    if (window.__runesBackgroundContext) {
        console.log('✅ Background context found');
        console.log('Context state:', window.__runesBackgroundContext);
    } else {
        console.log('❌ No background context found');
    }

    // Check for errors in console
    console.log('Running background system test...');
}
