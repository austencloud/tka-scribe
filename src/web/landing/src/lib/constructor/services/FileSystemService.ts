/**
 * File System Service
 *
 * This service provides methods for interacting with the file system,
 * including saving files, creating directories, and managing permissions.
 */

import { browser } from '$app/environment';
import { logger } from '$lib/core/logging';
import {
	isFileSystemAccessSupported,
	isMobileDevice,
	getDefaultPicturesPath,
	createExportFileName,
	createVersionedFileName,
	createCategoryFolderName,
	createWordFolderName,
	parseVersionNumber,
	getNextVersionNumber,
	saveDirHandleToLocalStorage,
	getDirHandleFromLocalStorage,
	type FileSystemDirectoryHandleWithPermissions,
	type WindowWithDirectoryPicker
} from '$lib/utils/fileSystemUtils';

/**
 * Options for saving a file
 */
export interface SaveFileOptions {
	fileName?: string;
	fileType?: string;
	directory?: FileSystemDirectoryHandle;
	rememberDirectory?: boolean;
	useCategories?: boolean;
	category?: string;
	wordName?: string;
	useVersioning?: boolean;
}

/**
 * Result of a file save operation
 */
export interface SaveFileResult {
	success: boolean;
	filePath?: string;
	error?: Error;
	directoryHandle?: FileSystemDirectoryHandle;
}

/**
 * File System Service class
 */
class FileSystemService {
	private lastDirectoryHandle: FileSystemDirectoryHandle | null = null;

	/**
	 * Initialize the service
	 */
	constructor() {
		this.loadSavedDirectoryHandle();
	}

	/**
	 * Load the saved directory handle from localStorage
	 */
	private async loadSavedDirectoryHandle(): Promise<void> {
		if (!browser || !isFileSystemAccessSupported()) return;

		try {
			// Check if the user has disabled remembering the directory
			const imageExportSettingsStr = localStorage.getItem('image-export-settings');
			if (imageExportSettingsStr) {
				try {
					const imageExportSettings = JSON.parse(imageExportSettingsStr);

					// Log detailed information about the rememberLastSaveDirectory setting
					logger.info(
						`Remember last save directory setting details: value=${imageExportSettings.rememberLastSaveDirectory}, type=${typeof imageExportSettings.rememberLastSaveDirectory}, strictFalse=${imageExportSettings.rememberLastSaveDirectory === false}, strictTrue=${imageExportSettings.rememberLastSaveDirectory === true}`
					);

					// If rememberLastSaveDirectory is explicitly set to false, don't load the saved handle
					if (imageExportSettings.rememberLastSaveDirectory === false) {
						logger.info(
							'User has disabled remembering last save directory, not loading saved handle'
						);
						// Clear the lastDirectoryHandle
						this.lastDirectoryHandle = null;

						// Also remove from localStorage to ensure it's completely cleared
						try {
							localStorage.removeItem('exportDirectoryHandle');
							logger.info('Removed directory handle from localStorage during initialization');
						} catch (error) {
							logger.error(
								`Failed to remove directory handle from localStorage: ${error instanceof Error ? error.message : String(error)}`
							);
						}
						return;
					}
				} catch (parseError) {
					logger.error(
						`Failed to parse image export settings: ${parseError instanceof Error ? parseError.message : String(parseError)}`
					);
				}
			}

			const savedMetadata = getDirHandleFromLocalStorage();
			if (!savedMetadata) return;

			logger.info(`Found saved directory handle metadata: ${savedMetadata.name}`);
			// Note: We can't actually restore the handle here, as we need user interaction
			// The actual handle will be restored when needed during a save operation
		} catch (error) {
			logger.error(
				`Failed to load saved directory handle: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * Check if the File System Access API is supported
	 */
	public isSupported(): boolean {
		return isFileSystemAccessSupported() && !isMobileDevice();
	}

	/**
	 * Save a file using the File System Access API
	 *
	 * This method integrates with the existing download functionality in the app.
	 * It will use the File System Access API when available, and fall back to the
	 * browser's default download behavior when not.
	 *
	 * @param dataUrl The data URL to save
	 * @param options Options for saving the file
	 * @returns Promise resolving to the result of the save operation
	 */
	public async saveFile(dataUrl: string, options: SaveFileOptions = {}): Promise<SaveFileResult> {
		if (!browser) {
			return { success: false, error: new Error('Not in browser environment') };
		}

		// Log the save operation
		logger.info(
			`FileSystemService: Saving file - fileName: ${options.fileName}, useCategories: ${options.useCategories}, category: ${options.category}, rememberDirectory: ${options.rememberDirectory}`
		);

		// Log the current state of rememberDirectory
		logger.info(`Remember directory setting: ${options.rememberDirectory}`);

		// If rememberDirectory is explicitly false, clear the lastDirectoryHandle
		if (options.rememberDirectory === false) {
			logger.info('Clearing lastDirectoryHandle because rememberDirectory is false');
			this.lastDirectoryHandle = null;
		}

		// If File System Access API is not supported, use the fallback method
		if (!this.isSupported()) {
			logger.info('FileSystemService: Using fallback save method (browser download)');
			return this.fallbackSaveFile(dataUrl, options);
		}

		try {
			// Determine the file name and type
			const fileType = options.fileType || 'image/png';
			const extension = fileType.split('/')[1] || 'png';
			const fileName =
				options.fileName || createExportFileName('Sequence', options.category || '', extension);

			// Get the directory handle
			let directoryHandle = options.directory || null;

			// If no directory is provided, try to use the last directory or prompt for a new one
			if (!directoryHandle) {
				if (options.rememberDirectory && this.lastDirectoryHandle) {
					try {
						// Verify we still have permission
						await (
							this.lastDirectoryHandle as FileSystemDirectoryHandleWithPermissions
						).requestPermission({
							mode: 'readwrite'
						});
						directoryHandle = this.lastDirectoryHandle;
						logger.info(`Using saved directory handle: ${directoryHandle.name}`);
					} catch (error) {
						logger.warn(
							`Permission denied for saved directory, prompting for new directory: ${error instanceof Error ? error.message : String(error)}`
						);
						directoryHandle = await this.promptForDirectory();
					}
				} else {
					directoryHandle = await this.promptForDirectory();
				}
			}

			if (!directoryHandle) {
				return { success: false, error: new Error('No directory selected') };
			}

			// Handle the rememberDirectory option
			if (options.rememberDirectory === true) {
				// Remember this directory if explicitly requested
				logger.info(`Saving directory handle: ${directoryHandle.name}`);
				this.lastDirectoryHandle = directoryHandle;
				saveDirHandleToLocalStorage(directoryHandle);
			} else if (options.rememberDirectory === false) {
				// If explicitly set to false, clear the saved directory
				logger.info('Clearing saved directory handle due to rememberDirectory=false');
				this.lastDirectoryHandle = null;

				// Remove from localStorage
				if (browser) {
					try {
						localStorage.removeItem('exportDirectoryHandle');
						logger.info('Removed directory handle from localStorage');
					} catch (error) {
						logger.error(
							`Failed to remove directory handle from localStorage: ${error instanceof Error ? error.message : String(error)}`
						);
					}
				}
			}

			// Determine the target directory based on options
			let targetDirHandle = directoryHandle;
			let displayPath = '';

			// If word-specific folders are requested
			if (options.wordName) {
				try {
					// Navigate to or create the word-specific folder
					const result = await this.navigateToWordFolder(directoryHandle, options.wordName);
					targetDirHandle = result.dirHandle;
					displayPath = result.displayPath;
					logger.info(`Using word-specific folder for "${options.wordName}": ${displayPath}`);
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					logger.error(`Failed to use word-specific folder for "${options.wordName}"`, {
						error: { message: errorMessage }
					});
					// Fall back to category-based organization if that fails
					targetDirHandle = directoryHandle;
				}
			}
			// Fall back to category-based organization if word-specific is not requested
			else if (options.useCategories && options.category) {
				const categoryFolder = createCategoryFolderName(options.category);

				// Create the main app directory
				let appDirHandle: FileSystemDirectoryHandle;
				try {
					appDirHandle = await directoryHandle.getDirectoryHandle('The Kinetic Alphabet', {
						create: true
					});

					// Create the category directory
					try {
						targetDirHandle = await appDirHandle.getDirectoryHandle(categoryFolder, {
							create: true
						});
						displayPath = `The Kinetic Alphabet/${categoryFolder}`;
						logger.info(`Using category folder: ${displayPath}`);
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						logger.error('Failed to create category directory', {
							error: { message: errorMessage }
						});
						targetDirHandle = appDirHandle;
						displayPath = 'The Kinetic Alphabet';
					}
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					logger.error('Failed to create app directory', {
						error: { message: errorMessage }
					});
					targetDirHandle = directoryHandle;
					displayPath = directoryHandle.name;
				}
			}

			// Determine the final filename with versioning if requested
			let finalFileName = fileName;

			if (options.useVersioning && options.wordName) {
				try {
					// Get the exact word name from options
					const exactWordName = options.wordName;

					// Create a file-system friendly version of the word for the filename
					// This preserves the original case and format as much as possible
					const fileSystemFriendlyWord = createWordFolderName(exactWordName);

					// Log the word being used for versioning
					logger.info(
						`Using word for versioning: "${fileSystemFriendlyWord}" (original: "${exactWordName}")`
					);

					// Get the next version number
					const nextVersion = await this.getNextVersionNumber(
						targetDirHandle,
						fileSystemFriendlyWord
					);

					// Create a versioned filename
					finalFileName = createVersionedFileName(fileSystemFriendlyWord, nextVersion);

					logger.info(`Created versioned filename: ${finalFileName} (v${nextVersion})`);
				} catch (error) {
					logger.error('Failed to create versioned filename', {
						error: { message: error instanceof Error ? error.message : String(error) }
					});
					// Fall back to the original filename
					finalFileName = fileName;
				}
			}

			// Create the file
			try {
				const fileHandle = await targetDirHandle.getFileHandle(finalFileName, { create: true });
				const writable = await fileHandle.createWritable();

				// Convert data URL to blob
				const blob = await this.dataUrlToBlob(dataUrl);

				// Write the blob to the file
				await writable.write(blob);
				await writable.close();

				// Construct the file path for display
				const basePath = directoryHandle.name;
				const filePath = displayPath
					? `${basePath}/${displayPath}/${finalFileName}`
					: `${basePath}/${finalFileName}`;

				logger.info(`File saved successfully - path: ${filePath}, size: ${blob.size} bytes`);

				return {
					success: true,
					filePath,
					directoryHandle
				};
			} catch (error) {
				logger.error(
					`Failed to write file to disk: ${error instanceof Error ? error.message : String(error)}, fileName: ${finalFileName}`
				);
				throw error; // Re-throw to be caught by the outer try/catch
			}
		} catch (error) {
			logger.error(
				`Failed to save file: ${error instanceof Error ? error.message : String(error)}`
			);

			// Check if the user cancelled the operation
			if (error instanceof Error && error.name === 'AbortError') {
				return { success: false, error: new Error('Operation cancelled by user') };
			}

			return {
				success: false,
				error: error instanceof Error ? error : new Error(String(error))
			};
		}
	}

	/**
	 * Scan a directory for files matching a prefix
	 *
	 * @param directoryHandle The directory handle to scan
	 * @param prefix The prefix to match
	 * @returns Promise resolving to an array of matching filenames
	 */
	public async scanDirectoryForFiles(
		directoryHandle: FileSystemDirectoryHandle,
		prefix: string
	): Promise<string[]> {
		try {
			const matchingFiles: string[] = [];

			// Use a simple approach that should work across browsers
			// Get all files in the directory and filter by prefix
			try {
				// This is a workaround since TypeScript doesn't recognize the FileSystemDirectoryHandle as iterable
				// @ts-ignore - FileSystemDirectoryHandle is iterable in modern browsers
				for await (const [name, entry] of directoryHandle) {
					if (entry.kind === 'file' && name.startsWith(prefix)) {
						matchingFiles.push(name);
					}
				}
			} catch (iterationError) {
				// If the above fails, log a warning but don't throw an error
				logger.warn(`Could not iterate directory: ${iterationError}`);

				// Just return an empty array since we can't scan the directory
				// This will result in version 1 being used for new files
			}

			logger.info(`Found ${matchingFiles.length} files matching prefix "${prefix}"`);
			return matchingFiles;
		} catch (error) {
			// Log the error but don't throw it
			const errorObj = error instanceof Error ? error : new Error(String(error));
			logger.error(`Failed to scan directory for files with prefix "${prefix}"`, {
				error: errorObj
			});
			return [];
		}
	}

	/**
	 * Navigate to or create a word-specific folder
	 *
	 * This method creates a folder based on the exact sequence word displayed in the UI,
	 * preserving the original format as much as possible while ensuring it's file-system friendly.
	 *
	 * @param baseDirectoryHandle The base directory handle
	 * @param wordName The exact word name to use for the folder (as displayed in the UI)
	 * @returns Promise resolving to the word-specific directory handle and the path for display
	 */
	public async navigateToWordFolder(
		baseDirectoryHandle: FileSystemDirectoryHandle,
		wordName: string
	): Promise<{ dirHandle: FileSystemDirectoryHandle; displayPath: string }> {
		try {
			// Validate the word name
			if (!wordName || wordName.trim() === '') {
				logger.warn('Empty word name provided, using "Untitled" folder');
				wordName = 'Untitled';
			}

			// Log the original word name for debugging
			logger.info(`Creating folder for sequence word: "${wordName}"`);

			// Create the main app directory first
			let appDirHandle: FileSystemDirectoryHandle;
			try {
				appDirHandle = await baseDirectoryHandle.getDirectoryHandle('The Kinetic Alphabet', {
					create: true
				});
				logger.info('Using or created "The Kinetic Alphabet" directory');
			} catch (error) {
				const errorObj = error instanceof Error ? error : new Error(String(error));
				logger.error('Failed to create app directory', { error: errorObj });
				// Fall back to the base directory
				return {
					dirHandle: baseDirectoryHandle,
					displayPath: baseDirectoryHandle.name
				};
			}

			// Create the word-specific folder using the enhanced createWordFolderName function
			// This preserves the original case and format while ensuring it's file-system friendly
			const wordFolder = createWordFolderName(wordName);

			// Log the sanitized folder name
			logger.info(`Using sanitized folder name: "${wordFolder}" (original: "${wordName}")`);

			try {
				const wordDirHandle = await appDirHandle.getDirectoryHandle(wordFolder, { create: true });
				logger.info(`Successfully created/accessed word-specific folder: "${wordFolder}"`);
				return {
					dirHandle: wordDirHandle,
					displayPath: `The Kinetic Alphabet/${wordFolder}`
				};
			} catch (error) {
				const errorObj = error instanceof Error ? error : new Error(String(error));
				logger.error(`Failed to create word folder "${wordFolder}"`, { error: errorObj });
				// Fall back to the app directory
				return {
					dirHandle: appDirHandle,
					displayPath: 'The Kinetic Alphabet'
				};
			}
		} catch (error) {
			const errorObj = error instanceof Error ? error : new Error(String(error));
			logger.error('Failed to navigate to word folder', { error: errorObj });
			// Fall back to the base directory
			return {
				dirHandle: baseDirectoryHandle,
				displayPath: baseDirectoryHandle.name
			};
		}
	}

	/**
	 * Get the next version number for a file
	 *
	 * @param directoryHandle The directory handle to scan
	 * @param prefix The prefix to match
	 * @returns Promise resolving to the next version number
	 */
	public async getNextVersionNumber(
		directoryHandle: FileSystemDirectoryHandle,
		prefix: string
	): Promise<number> {
		try {
			// Scan the directory for matching files
			const files = await this.scanDirectoryForFiles(directoryHandle, prefix);

			// Use the utility function to determine the next version
			const nextVersion = getNextVersionNumber(files, prefix);
			logger.info(`Determined next version number: ${nextVersion} for prefix "${prefix}"`);

			return nextVersion;
		} catch (error) {
			const errorObj = error instanceof Error ? error : new Error(String(error));
			logger.error('Failed to determine next version number', { error: errorObj });
			// Default to version 1 if anything goes wrong
			return 1;
		}
	}

	/**
	 * Prompt the user to select a directory
	 *
	 * @returns Promise resolving to the selected directory handle or null if cancelled
	 */
	private async promptForDirectory(): Promise<FileSystemDirectoryHandle | null> {
		try {
			return await (window as unknown as WindowWithDirectoryPicker).showDirectoryPicker({
				id: 'pictographExports',
				startIn: 'pictures',
				mode: 'readwrite'
			});
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				logger.info('User cancelled directory selection');
				return null;
			}

			const errorObj = error instanceof Error ? error : new Error(String(error));
			logger.error('Failed to open directory picker', { error: errorObj });
			throw error;
		}
	}

	/**
	 * Convert a data URL to a Blob
	 *
	 * @param dataUrl The data URL to convert
	 * @returns Promise resolving to the Blob
	 */
	private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
		// Parse the data URL
		const [header, base64Data] = dataUrl.split(',');
		const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

		// Convert base64 to binary
		const binaryString = atob(base64Data);
		const length = binaryString.length;
		const bytes = new Uint8Array(length);

		for (let i = 0; i < length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return new Blob([bytes], { type: mimeType });
	}

	/**
	 * Fallback method for saving files when File System Access API is not supported
	 *
	 * This method uses the existing download functionality in the app.
	 *
	 * @param dataUrl The data URL to save
	 * @param options Options for saving the file
	 * @returns Promise resolving to the result of the save operation
	 */
	private async fallbackSaveFile(
		dataUrl: string,
		options: SaveFileOptions = {}
	): Promise<SaveFileResult> {
		try {
			// Import the downloadImage function dynamically to avoid circular dependencies
			const { downloadImage } = await import('$lib/components/Pictograph/export/downloadUtils');

			// Set the file name
			const fileType = options.fileType || 'image/png';
			const extension = fileType.split('/')[1] || 'png';

			// Generate a proper filename
			let fileName = options.fileName;

			if (!fileName) {
				// Generate a sequence name from the category or use a default
				const sequenceName = options.category || 'Sequence';

				// Generate a timestamp for uniqueness
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

				// Create a safe filename
				const safeSequenceName = sequenceName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
				fileName = `kinetic-sequence-${safeSequenceName}-${timestamp}.${extension}`;
			}

			// Use the existing download functionality
			const success = await downloadImage({
				dataUrl,
				filename: fileName
			});

			if (success) {
				logger.info('FileSystemService: Download initiated successfully', { data: { fileName } });
				return {
					success: true,
					filePath: fileName
				};
			} else {
				throw new Error('Download function returned false');
			}
		} catch (error) {
			const errorObj = error instanceof Error ? error : new Error(String(error));
			logger.error('Failed to save file using fallback method', { error: errorObj });

			// Try alternative download approach
			try {
				logger.info('FileSystemService: Trying alternative download approach');

				// Set the file name
				const fileType = options.fileType || 'image/png';
				const extension = fileType.split('/')[1] || 'png';
				const fileName =
					options.fileName || createExportFileName('Sequence', options.category || '', extension);

				// Create a download link
				const link = document.createElement('a');
				link.href = dataUrl;
				link.download = fileName;

				// Append to the document, click, and remove
				document.body.appendChild(link);
				link.click();

				// Clean up after a delay
				setTimeout(() => {
					if (document.body.contains(link)) {
						document.body.removeChild(link);
					}
				}, 500);

				return {
					success: true,
					filePath: fileName
				};
			} catch (fallbackError) {
				const errorObj =
					fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
				logger.error('Failed to save file using alternative method', { error: errorObj });
				return {
					success: false,
					error: error instanceof Error ? error : new Error(String(error))
				};
			}
		}
	}
}

// Export a singleton instance
export const fileSystemService = new FileSystemService();
