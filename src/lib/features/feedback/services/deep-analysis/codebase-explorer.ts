/**
 * Codebase Explorer
 *
 * Utility for exploring the codebase - searching files,
 * reading content, and building context for AI analysis.
 */

import * as fs from "fs/promises";
import * as path from "path";
import { glob } from "glob";

export interface FileSearchResult {
  path: string;
  relativePath: string;
  matches: LineMatch[];
}

export interface LineMatch {
  lineNumber: number;
  content: string;
  context: {
    before: string[];
    after: string[];
  };
}

export interface FileContent {
  path: string;
  relativePath: string;
  content: string;
  lineCount: number;
  language: string;
}

export interface DirectoryTree {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: DirectoryTree[];
}

/**
 * Codebase explorer for deep analysis
 */
export class CodebaseExplorer {
  constructor(
    private workspaceRoot: string,
    private excludePatterns: string[] = [
      "node_modules",
      ".svelte-kit",
      "build",
      "dist",
      ".git",
    ]
  ) {}

  /**
   * Search for files matching a pattern
   */
  async searchFiles(
    pattern: string,
    extensions: string[] = [".ts", ".svelte", ".js"]
  ): Promise<string[]> {
    const extPattern = extensions.length > 1
      ? `{${extensions.join(",")}}`
      : extensions[0] || "*";

    const globPattern = `**/*${extPattern}`;

    try {
      const files = await glob(globPattern, {
        cwd: this.workspaceRoot,
        ignore: this.excludePatterns.map(p => `**/${p}/**`),
        nodir: true,
      });

      // Filter by pattern in filename or path
      const lowerPattern = pattern.toLowerCase();
      return files.filter(f =>
        f.toLowerCase().includes(lowerPattern)
      );
    } catch (error) {
      console.error("File search error:", error);
      return [];
    }
  }

  /**
   * Search file contents for a pattern (grep-like)
   */
  async searchContent(
    pattern: string | RegExp,
    options: {
      extensions?: string[];
      maxResults?: number;
      contextLines?: number;
      caseSensitive?: boolean;
    } = {}
  ): Promise<FileSearchResult[]> {
    const {
      extensions = [".ts", ".svelte", ".js"],
      maxResults = 50,
      contextLines = 3,
      caseSensitive = false,
    } = options;

    const results: FileSearchResult[] = [];
    const regex = typeof pattern === "string"
      ? new RegExp(pattern, caseSensitive ? "g" : "gi")
      : pattern;

    // Get all relevant files
    const extPattern = extensions.length > 1
      ? `{${extensions.join(",")}}`
      : extensions[0] || "*";

    const files = await glob(`**/*${extPattern}`, {
      cwd: this.workspaceRoot,
      ignore: this.excludePatterns.map(p => `**/${p}/**`),
      nodir: true,
    });

    for (const file of files) {
      if (results.length >= maxResults) break;

      try {
        const fullPath = path.join(this.workspaceRoot, file);
        const content = await fs.readFile(fullPath, "utf-8");
        const lines = content.split("\n");
        const matches: LineMatch[] = [];

        for (let i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            matches.push({
              lineNumber: i + 1,
              content: lines[i],
              context: {
                before: lines.slice(Math.max(0, i - contextLines), i),
                after: lines.slice(i + 1, i + 1 + contextLines),
              },
            });
          }
          // Reset regex lastIndex for global flag
          regex.lastIndex = 0;
        }

        if (matches.length > 0) {
          results.push({
            path: fullPath,
            relativePath: file,
            matches,
          });
        }
      } catch {
        // Skip unreadable files
      }
    }

    return results;
  }

  /**
   * Read a file's content
   */
  async readFile(
    filePath: string,
    options: {
      startLine?: number;
      endLine?: number;
      maxLines?: number;
    } = {}
  ): Promise<FileContent | null> {
    const { startLine, endLine, maxLines = 500 } = options;

    try {
      const fullPath = filePath.startsWith(this.workspaceRoot)
        ? filePath
        : path.join(this.workspaceRoot, filePath);

      const content = await fs.readFile(fullPath, "utf-8");
      let lines = content.split("\n");

      // Apply line range if specified
      if (startLine !== undefined || endLine !== undefined) {
        const start = (startLine ?? 1) - 1;
        const end = endLine ?? lines.length;
        lines = lines.slice(start, end);
      }

      // Truncate if too long
      if (lines.length > maxLines) {
        lines = [
          ...lines.slice(0, maxLines),
          `\n... (${lines.length - maxLines} more lines truncated)`,
        ];
      }

      const relativePath = fullPath.startsWith(this.workspaceRoot)
        ? path.relative(this.workspaceRoot, fullPath)
        : filePath;

      return {
        path: fullPath,
        relativePath,
        content: lines.join("\n"),
        lineCount: lines.length,
        language: this.getLanguage(filePath),
      };
    } catch (error) {
      console.error(`Failed to read file: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Get a directory tree structure
   */
  async getDirectoryTree(
    dir: string = "src",
    depth: number = 3
  ): Promise<DirectoryTree | null> {
    const fullPath = path.join(this.workspaceRoot, dir);

    try {
      return await this.buildTree(fullPath, dir, depth);
    } catch {
      return null;
    }
  }

  private async buildTree(
    fullPath: string,
    relativePath: string,
    depth: number
  ): Promise<DirectoryTree> {
    const stat = await fs.stat(fullPath);
    const name = path.basename(fullPath);

    if (!stat.isDirectory()) {
      return { name, path: relativePath, type: "file" };
    }

    if (depth <= 0 || this.excludePatterns.some(p => name === p)) {
      return { name, path: relativePath, type: "directory" };
    }

    const entries = await fs.readdir(fullPath);
    const children: DirectoryTree[] = [];

    for (const entry of entries) {
      if (this.excludePatterns.some(p => entry === p)) continue;

      const childPath = path.join(fullPath, entry);
      const childRelative = path.join(relativePath, entry);

      try {
        const child = await this.buildTree(childPath, childRelative, depth - 1);
        children.push(child);
      } catch {
        // Skip inaccessible entries
      }
    }

    return {
      name,
      path: relativePath,
      type: "directory",
      children: children.sort((a, b) => {
        // Directories first, then alphabetical
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    };
  }

  /**
   * Find files related to a module/feature
   */
  async findRelatedFiles(
    moduleName: string,
    options: {
      includeImports?: boolean;
      maxDepth?: number;
    } = {}
  ): Promise<string[]> {
    const { includeImports = true, maxDepth = 2 } = options;
    const related = new Set<string>();
    const visited = new Set<string>();

    // Start with files containing the module name
    const directMatches = await this.searchFiles(moduleName);
    directMatches.forEach(f => related.add(f));

    // Follow imports if requested
    if (includeImports) {
      const queue = [...directMatches];
      let depth = 0;

      while (queue.length > 0 && depth < maxDepth) {
        const batch = queue.splice(0, queue.length);
        depth++;

        for (const file of batch) {
          if (visited.has(file)) continue;
          visited.add(file);

          const imports = await this.extractImports(file);
          for (const imp of imports) {
            if (!visited.has(imp) && !related.has(imp)) {
              related.add(imp);
              queue.push(imp);
            }
          }
        }
      }
    }

    return Array.from(related);
  }

  /**
   * Extract imports from a file
   */
  async extractImports(filePath: string): Promise<string[]> {
    const content = await this.readFile(filePath);
    if (!content) return [];

    const imports: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content.content)) !== null) {
      const importPath = match[1];

      // Skip external packages
      if (!importPath.startsWith(".") && !importPath.startsWith("$lib")) {
        continue;
      }

      // Resolve relative imports
      let resolvedPath: string;
      if (importPath.startsWith("$lib")) {
        resolvedPath = importPath.replace("$lib", "src/lib");
      } else {
        const dir = path.dirname(filePath);
        resolvedPath = path.join(dir, importPath);
      }

      // Try common extensions
      for (const ext of ["", ".ts", ".svelte", ".js", "/index.ts"]) {
        const fullPath = resolvedPath + ext;
        try {
          await fs.access(path.join(this.workspaceRoot, fullPath));
          imports.push(fullPath);
          break;
        } catch {
          // Try next extension
        }
      }
    }

    return imports;
  }

  /**
   * Get the programming language from file extension
   */
  private getLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languages: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".svelte": "svelte",
      ".css": "css",
      ".scss": "scss",
      ".json": "json",
      ".md": "markdown",
      ".html": "html",
    };
    return languages[ext] || "plaintext";
  }
}

/**
 * Create a codebase explorer for the current workspace
 */
export function createCodebaseExplorer(workspaceRoot: string): CodebaseExplorer {
  return new CodebaseExplorer(workspaceRoot);
}
