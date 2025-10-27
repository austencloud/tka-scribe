// src/routes/current_sequence.json/+server.ts
import { json } from '@sveltejs/kit';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { platform } from 'os';
import path from 'path';

// Determine the appropriate data directory based on the platform
function getDataDirectory() {
  const homeDir = platform() === 'win32' 
    ? process.env.USERPROFILE || '' 
    : process.env.HOME || '';
  
  const appDataDir = path.join(
    homeDir, 
    platform() === 'darwin' 
      ? 'Library/Application Support/YourAppName' 
      : platform() === 'win32'
        ? 'AppData/Roaming/YourAppName'
        : '.local/share/YourAppName'
  );

  return appDataDir;
}

export async function POST({ request }) {
  try {
    // Ensure the data directory exists
    const dataDir = getDataDirectory();
    await mkdir(dataDir, { recursive: true });

    // Path to the current sequence JSON file
    const filePath = path.join(dataDir, 'current_sequence.json');

    // Parse the incoming JSON data
    const sequenceData = await request.json();

    // Write the JSON file
    await writeFile(filePath, JSON.stringify(sequenceData, null, 2), 'utf8');

    return json({ success: true, path: filePath });
  } catch (error) {
    console.error('Error saving sequence:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const dataDir = getDataDirectory();
    const filePath = path.join(dataDir, 'current_sequence.json');

    try {
      const sequenceData = await readFile(filePath, 'utf8');
      return json(JSON.parse(sequenceData));
    } catch (readError) {
      // If file doesn't exist, return default sequence
      return json([{
        word: '',
        author: '',
        level: 0,
        prop_type: '',
        grid_mode: 'diamond',
        is_circular: false,
        can_be_CAP: false,
        is_strict_rotated_CAP: false,
        is_strict_mirrored_CAP: false,
        is_strict_swapped_CAP: false,
        is_mirrored_swapped_CAP: false,
        is_rotated_swapped_CAP: false
      }]);
    }
  } catch (error) {
    console.error('Error reading sequence:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}