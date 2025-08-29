#!/usr/bin/env node

/**
 * Rename Interfaces to Contracts
 *
 * Systematically renames the interfaces directory to contracts and updates all import paths.
 * This better reflects that these are behavioral contracts, not just service interfaces.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, "src");
const interfacesDir = path.join(__dirname, "src/lib/services/interfaces");
const contractsDir = path.join(__dirname, "src/lib/services/contracts");

async function renameInterfacesToContracts() {
  console.log("🔄 Renaming interfaces directory to contracts...\n");

  try {
    // Step 1: Copy interfaces directory to contracts
    if (fs.existsSync(interfacesDir)) {
      console.log("📁 Copying interfaces directory to contracts...");
      await copyDirectory(interfacesDir, contractsDir);
      console.log("✅ Directory copied successfully");
    }

    // Step 2: Update all import paths
    console.log("\n🔄 Updating import paths...");
    const filesToUpdate = await findFilesWithInterfaceImports(srcDir);

    let updatedCount = 0;
    for (const file of filesToUpdate) {
      const updated = await updateImportPaths(file);
      if (updated) {
        updatedCount++;
        console.log(`✅ Updated: ${path.relative(__dirname, file)}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Files updated: ${updatedCount}`);
    console.log(
      `- Contracts directory created: ${fs.existsSync(contractsDir)}`
    );

    if (fs.existsSync(contractsDir)) {
      console.log("\n🎉 Successfully renamed interfaces to contracts!");
      console.log(
        "\n⚠️  Manual step: Please delete the old interfaces directory when ready"
      );
    }
  } catch (error) {
    console.error("❌ Error during rename:", error);
    throw error;
  }
}

async function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function findFilesWithInterfaceImports(dir) {
  const files = [];

  async function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && !entry.name.includes("node_modules")) {
        await traverse(fullPath);
      } else if (
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".js") ||
        entry.name.endsWith(".svelte")
      ) {
        const content = fs.readFileSync(fullPath, "utf8");
        if (content.includes("services/interfaces")) {
          files.push(fullPath);
        }
      }
    }
  }

  await traverse(dir);
  return files;
}

async function updateImportPaths(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Replace all occurrences of services/interfaces with services/contracts
  const updatedContent = content.replace(
    /services\/contracts/g,
    "services/contracts"
  );

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    return true;
  }

  return false;
}

// Run the rename
renameInterfacesToContracts()
  .then(() => {
    console.log("\n✅ Rename completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error during rename:", error);
    process.exit(1);
  });
