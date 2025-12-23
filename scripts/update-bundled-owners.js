/**
 * Add owner data to bundled sequence-index.json
 */

import { readFileSync, writeFileSync } from "fs";

const AUSTEN_USER = {
  ownerId: "PBp3GSBO6igCKPwJyLZNmVEmamI3",
  ownerDisplayName: "Austen Cloud",
  ownerAvatarUrl:
    "https://lh3.googleusercontent.com/a/ACg8ocJ3KdjUMAOYNbg_fpHXouXfgTPntLXQVQVQwb_bsbViiAQujwYYJg=s96-c",
};

// Read the JSON file
const filePath = "./static/sequence-index.json";
const data = JSON.parse(readFileSync(filePath, "utf8"));

console.log(`\nUpdating ${data.totalSequences} sequences with owner data...\n`);

// Add owner fields to each sequence
let updated = 0;
for (const seq of data.sequences) {
  if (!seq.ownerId) {
    seq.ownerId = AUSTEN_USER.ownerId;
    seq.ownerDisplayName = AUSTEN_USER.ownerDisplayName;
    seq.ownerAvatarUrl = AUSTEN_USER.ownerAvatarUrl;
    updated++;
  }
}

// Write back
writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`✅ Updated ${updated} sequences with owner data.`);
console.log(`   File: ${filePath}\n`);
