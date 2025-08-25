/**
 * SvelteKit Client Hooks
 * 
 * This file handles client-side initialization, including
 * the InversifyJS container setup.
 */

import "reflect-metadata";
import { initializeInversifyContainer } from "$lib/services/inversify/bootstrap";

/**
 * Initialize the application on the client side
 */
async function initializeClient() {
  try {
    console.log("🚀 Initializing TKA client application...");
    
    // Initialize the InversifyJS container
    await initializeInversifyContainer();
    
    console.log("✅ TKA client application initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize TKA client application:", error);
    throw error;
  }
}

// Initialize when the module loads
initializeClient().catch((error) => {
  console.error("❌ Critical error during client initialization:", error);
});

// Export for potential use in other parts of the application
export { initializeClient };
