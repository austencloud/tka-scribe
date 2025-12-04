/**
 * Code Search Utilities for Deep Analysis
 *
 * Provides file system search capabilities for the AI to explore the codebase.
 * Works with Node.js fs module on the server side.
 */

import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";

/**
 * File match result from search
 */
export interface FileMatch {
  path: string;
  relativePath: string;
  content?: string;
  lineMatches?: {
    lineNumber: number;
    content: string;
    context: string[];
  }[];
}

/**
 * Search options for file discovery
 */
export interface SearchOptions {
  /** Root directory to search from */
  rootDir: string;
  /** Max files to return */
  maxResults?: number;
  /** Max file size to read (bytes) */
  maxFileSize?: number;
  /** Include hidden files/directories */
  includeHidden?: boolean;
  /** File extensions to include */
  extensions?: string[];
  /** Directories to exclude */
  excludeDirs?: string[];
}

const DEFAULT_EXCLUDE_DIRS = [
  "node_modules",
  ".git",
  ".svelte-kit",
  "build",
  "dist",
  ".turbo",
  ".cache",
  "coverage",
  ".next",
  "__pycache__",
  ".vscode",
  "archive",
];

const DEFAULT_EXTENSIONS = [
  ".ts",
  ".svelte",
  ".js",
  ".json",
  ".css",
  ".md",
  ".html",
];

const DEFAULT_MAX_FILE_SIZE = 100 * 1024; // 100KB

/**
 * Find files by glob pattern
 */
export async function findFiles(
  pattern: string,
  options: SearchOptions
): Promise<string[]> {
  const {
    rootDir,
    maxResults = 100,
    includeHidden = false,
    excludeDirs = DEFAULT_EXCLUDE_DIRS,
  } = options;

  const ignorePatterns = excludeDirs.map((dir) => `**/${dir}/**`);

  const files = await glob(pattern, {
    cwd: rootDir,
    absolute: false,
    ignore: ignorePatterns,
    dot: includeHidden,
    nodir: true,
  });

  return files.slice(0, maxResults);
}

/**
 * Search for files containing specific text
 */
export async function grepFiles(
  searchText: string,
  options: SearchOptions & {
    caseSensitive?: boolean;
    contextLines?: number;
  }
): Promise<FileMatch[]> {
  const {
    rootDir,
    maxResults = 50,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    extensions = DEFAULT_EXTENSIONS,
    excludeDirs = DEFAULT_EXCLUDE_DIRS,
    caseSensitive = false,
    contextLines = 2,
  } = options;

  const matches: FileMatch[] = [];
  const pattern = extensions.map((ext) => `**/*${ext}`).join("|");
  const ignorePatterns = excludeDirs.map((dir) => `**/${dir}/**`);

  // Use glob to find all eligible files
  const files = await glob(pattern.split("|"), {
    cwd: rootDir,
    absolute: true,
    ignore: ignorePatterns,
    nodir: true,
  });

  const searchRegex = caseSensitive
    ? new RegExp(escapeRegex(searchText), "g")
    : new RegExp(escapeRegex(searchText), "gi");

  for (const filePath of files) {
    if (matches.length >= maxResults) break;

    try {
      const stats = await fs.stat(filePath);
      if (stats.size > maxFileSize) continue;

      const content = await fs.readFile(filePath, "utf-8");
      
      if (!searchRegex.test(content)) continue;

      // Reset regex
      searchRegex.lastIndex = 0;

      const lines = content.split("\n");
      const lineMatches: FileMatch["lineMatches"] = [];

      for (let i = 0; i < lines.length; i++) {
        if (searchRegex.test(lines[i] || "")) {
          const startContext = Math.max(0, i - contextLines);
          const endContext = Math.min(lines.length - 1, i + contextLines);
          
          lineMatches.push({
            lineNumber: i + 1,
            content: lines[i] || "",
            context: lines.slice(startContext, endContext + 1),
          });
        }
        // Reset regex for next line
        searchRegex.lastIndex = 0;
      }

      matches.push({
        path: filePath,
        relativePath: path.relative(rootDir, filePath),
        lineMatches,
      });
    } catch {
      // Skip files that can't be read
    }
  }

  return matches;
}

/**
 * Read a file's content
 */
export async function readFile(
  filePath: string,
  options: {
    maxSize?: number;
    startLine?: number;
    endLine?: number;
  } = {}
): Promise<{ content: string; truncated: boolean; totalLines: number }> {
  const { maxSize = DEFAULT_MAX_FILE_SIZE, startLine, endLine } = options;

  const stats = await fs.stat(filePath);
  const truncated = stats.size > maxSize;

  let content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const totalLines = lines.length;

  // Apply line range if specified
  if (startLine !== undefined || endLine !== undefined) {
    const start = (startLine ?? 1) - 1;
    const end = endLine ?? lines.length;
    content = lines.slice(start, end).join("\n");
  } else if (truncated) {
    // Truncate to max size
    content = content.slice(0, maxSize) + "\n\n[... content truncated ...]";
  }

  return { content, truncated, totalLines };
}

/**
 * List directory contents
 */
export async function listDirectory(
  dirPath: string,
  options: {
    recursive?: boolean;
    maxDepth?: number;
    excludeDirs?: string[];
  } = {}
): Promise<{ name: string; type: "file" | "directory"; size?: number }[]> {
  const { recursive = false, maxDepth = 3, excludeDirs = DEFAULT_EXCLUDE_DIRS } = options;

  const entries: { name: string; type: "file" | "directory"; size?: number }[] = [];

  async function scanDir(currentPath: string, depth: number) {
    if (depth > maxDepth) return;

    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);
        const relativePath = path.relative(dirPath, itemPath);

        // Skip excluded directories
        if (excludeDirs.some((ex) => item.name === ex)) continue;

        if (item.isDirectory()) {
          entries.push({ name: relativePath, type: "directory" });
          if (recursive) {
            await scanDir(itemPath, depth + 1);
          }
        } else {
          const stats = await fs.stat(itemPath);
          entries.push({
            name: relativePath,
            type: "file",
            size: stats.size,
          });
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  await scanDir(dirPath, 0);
  return entries;
}

/**
 * Get project structure summary
 */
export async function getProjectStructure(
  rootDir: string,
  options: {
    maxFiles?: number;
    excludeDirs?: string[];
  } = {}
): Promise<{
  directories: string[];
  filesByExtension: Record<string, number>;
  totalFiles: number;
  srcStructure?: string;
}> {
  const { maxFiles = 1000, excludeDirs = DEFAULT_EXCLUDE_DIRS } = options;

  const directories = new Set<string>();
  const filesByExtension: Record<string, number> = {};
  let totalFiles = 0;

  const files = await glob("**/*", {
    cwd: rootDir,
    absolute: false,
    ignore: excludeDirs.map((d) => `**/${d}/**`),
    nodir: true,
  });

  for (const file of files.slice(0, maxFiles)) {
    totalFiles++;
    
    // Track directory
    const dir = path.dirname(file);
    directories.add(dir);

    // Track extension
    const ext = path.extname(file) || "(no extension)";
    filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
  }

  // Get src directory structure if it exists
  let srcStructure: string | undefined;
  try {
    const srcPath = path.join(rootDir, "src");
    const srcStats = await fs.stat(srcPath);
    if (srcStats.isDirectory()) {
      srcStructure = await generateTreeStructure(srcPath, 3, excludeDirs);
    }
  } catch {
    // No src directory
  }

  return {
    directories: Array.from(directories).sort(),
    filesByExtension,
    totalFiles,
    srcStructure,
  };
}

/**
 * Generate a tree-like structure string
 */
async function generateTreeStructure(
  dirPath: string,
  maxDepth: number,
  excludeDirs: string[],
  prefix = ""
): Promise<string> {
  const lines: string[] = [];

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const filtered = items.filter((item) => !excludeDirs.includes(item.name));

    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      if (!item) continue;

      const isLast = i === filtered.length - 1;
      const marker = isLast ? "└── " : "├── ";
      const childPrefix = isLast ? "    " : "│   ";

      if (item.isDirectory()) {
        lines.push(`${prefix}${marker}${item.name}/`);
        if (maxDepth > 0) {
          const childTree = await generateTreeStructure(
            path.join(dirPath, item.name),
            maxDepth - 1,
            excludeDirs,
            prefix + childPrefix
          );
          lines.push(childTree);
        }
      } else {
        lines.push(`${prefix}${marker}${item.name}`);
      }
    }
  } catch {
    // Skip on error
  }

  return lines.filter(Boolean).join("\n");
}

/**
 * Find related files based on imports/references
 */
export async function findRelatedFiles(
  filePath: string,
  rootDir: string
): Promise<string[]> {
  const related: Set<string> = new Set();

  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Find import statements
    const importRegex = /(?:import|from|require)\s*[('"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!importPath) continue;

      // Skip node_modules imports
      if (!importPath.startsWith(".") && !importPath.startsWith("$lib")) continue;

      // Resolve the path
      let resolvedPath: string;
      if (importPath.startsWith("$lib")) {
        resolvedPath = path.join(rootDir, "src/lib", importPath.replace("$lib/", ""));
      } else {
        resolvedPath = path.resolve(path.dirname(filePath), importPath);
      }

      // Try different extensions
      const extensions = ["", ".ts", ".svelte", ".js", "/index.ts", "/index.js"];
      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        try {
          await fs.access(fullPath);
          related.add(path.relative(rootDir, fullPath));
          break;
        } catch {
          // Try next extension
        }
      }
    }
  } catch {
    // Skip on error
  }

  return Array.from(related);
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
