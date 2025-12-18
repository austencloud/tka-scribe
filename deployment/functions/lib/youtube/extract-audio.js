"use strict";
/**
 * YouTube Audio Extraction Cloud Function
 *
 * Extracts audio from YouTube videos using youtube-dl-exec (yt-dlp wrapper).
 * Uploads the result to Cloud Storage and returns a signed URL.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAudio = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const storage_1 = require("firebase-admin/storage");
const app_1 = require("firebase-admin/app");
const youtube_dl_exec_1 = __importDefault(require("youtube-dl-exec"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
// Initialize Firebase Admin if not already initialized
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
// Quality to bitrate mapping
const QUALITY_BITRATE = {
    low: 64,
    medium: 128,
    high: 192,
};
const COOKIES_FILE_PATH = "youtube-cookies.txt";
/**
 * Download cookies file from Cloud Storage to temp directory
 * Returns the local path to the cookies file, or null if not found
 */
async function downloadCookiesFile() {
    const bucket = (0, storage_1.getStorage)().bucket();
    const cookiesFile = bucket.file(COOKIES_FILE_PATH);
    try {
        const [exists] = await cookiesFile.exists();
        if (!exists) {
            console.warn("YouTube cookies file not found in Cloud Storage");
            return null;
        }
        const tempCookiesPath = path.join(os.tmpdir(), `cookies-${Date.now()}.txt`);
        await cookiesFile.download({ destination: tempCookiesPath });
        console.log("Downloaded cookies file from Cloud Storage");
        return tempCookiesPath;
    }
    catch (error) {
        console.error("Failed to download cookies file:", error);
        return null;
    }
}
exports.extractAudio = functions.onRequest({
    timeoutSeconds: 540, // 9 minutes max
    memory: "1GiB",
    region: "us-central1",
    cors: true,
}, async (req, res) => {
    // Only allow POST
    if (req.method !== "POST") {
        res.status(405).json({ success: false, error: "Method not allowed" });
        return;
    }
    const { videoId, userId = "anonymous", quality = "medium" } = req.body;
    if (!videoId) {
        res.status(400).json({ success: false, error: "Missing videoId" });
        return;
    }
    // Validate videoId format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        res.status(400).json({ success: false, error: "Invalid videoId format" });
        return;
    }
    const bitrate = QUALITY_BITRATE[quality] || QUALITY_BITRATE.medium;
    const bucket = (0, storage_1.getStorage)().bucket();
    const cacheKey = `youtube-audio/${videoId}-${quality}.mp3`;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let cookiesPath = null;
    let tempDir = null;
    try {
        // Download cookies file from Cloud Storage
        cookiesPath = await downloadCookiesFile();
        // Check if already cached in Cloud Storage
        const [exists] = await bucket.file(cacheKey).exists();
        if (exists) {
            console.log(`Cache hit for ${videoId}`);
            // Get metadata from the cached file
            const [metadata] = await bucket.file(cacheKey).getMetadata();
            const customMetadata = metadata.metadata || {};
            // Generate signed URL (valid for 1 hour)
            const [signedUrl] = await bucket.file(cacheKey).getSignedUrl({
                action: "read",
                expires: Date.now() + 60 * 60 * 1000, // 1 hour
            });
            res.json({
                success: true,
                audioUrl: signedUrl,
                metadata: {
                    title: customMetadata.title || "Unknown",
                    duration: parseInt(customMetadata.duration || "0", 10),
                    thumbnail: customMetadata.thumbnail || "",
                },
            });
            return;
        }
        console.log(`Extracting audio for ${videoId} at ${quality} quality`);
        // Create temp directory
        tempDir = path.join(os.tmpdir(), `yt-${videoId}-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });
        const outputPath = path.join(tempDir, "audio.mp3");
        // First, get video metadata
        console.log("Fetching video metadata...");
        const metadataOptions = {
            dumpSingleJson: true,
            skipDownload: true,
            noWarnings: true,
            preferFreeFormats: true,
        };
        // Add cookies if available
        if (cookiesPath) {
            metadataOptions.cookies = cookiesPath;
            console.log("Using cookies for authentication");
        }
        const videoMetadata = await (0, youtube_dl_exec_1.default)(youtubeUrl, metadataOptions);
        // Check for age restriction
        if (videoMetadata.age_limit && videoMetadata.age_limit > 0) {
            cleanup(tempDir, cookiesPath);
            res.status(403).json({
                success: false,
                error: "Video is age-restricted",
            });
            return;
        }
        // Extract audio
        console.log("Extracting audio...");
        const extractOptions = {
            extractAudio: true,
            audioFormat: "mp3",
            audioQuality: bitrate,
            output: outputPath,
            noPlaylist: true,
            noWarnings: true,
        };
        // Add cookies if available
        if (cookiesPath) {
            extractOptions.cookies = cookiesPath;
        }
        await (0, youtube_dl_exec_1.default)(youtubeUrl, extractOptions);
        // Verify output file exists
        if (!fs.existsSync(outputPath)) {
            throw new Error("Audio extraction failed - output file not created");
        }
        const fileStats = fs.statSync(outputPath);
        console.log(`Audio file size: ${fileStats.size} bytes`);
        // Upload to Cloud Storage
        const uploadOptions = {
            destination: cacheKey,
            metadata: {
                contentType: "audio/mpeg",
                metadata: {
                    title: videoMetadata.title || "Unknown",
                    duration: String(videoMetadata.duration || 0),
                    thumbnail: videoMetadata.thumbnail || "",
                    channelName: videoMetadata.channel || videoMetadata.uploader || "Unknown",
                    extractedAt: new Date().toISOString(),
                    quality,
                    userId,
                },
            },
        };
        await bucket.upload(outputPath, uploadOptions);
        console.log(`Uploaded to Cloud Storage: ${cacheKey}`);
        // Generate signed URL
        const [signedUrl] = await bucket.file(cacheKey).getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        // Cleanup temp files
        cleanup(tempDir, cookiesPath);
        res.json({
            success: true,
            audioUrl: signedUrl,
            metadata: {
                title: videoMetadata.title || "Unknown",
                duration: videoMetadata.duration || 0,
                thumbnail: videoMetadata.thumbnail || "",
            },
        });
    }
    catch (error) {
        // Cleanup on error
        if (tempDir)
            cleanup(tempDir, cookiesPath);
        console.error("Extraction error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        // Parse common yt-dlp errors
        if (message.includes("Video unavailable")) {
            res.status(404).json({ success: false, error: "Video not found or unavailable" });
            return;
        }
        if (message.includes("Private video")) {
            res.status(403).json({ success: false, error: "This is a private video" });
            return;
        }
        if (message.includes("copyright")) {
            res.status(403).json({ success: false, error: "Video blocked due to copyright" });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Failed to extract audio. Please try again.",
        });
    }
});
function cleanup(dir, cookiesPath = null) {
    try {
        // Clean up temp directory
        if (dir && fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        // Clean up cookies file
        if (cookiesPath && fs.existsSync(cookiesPath)) {
            fs.rmSync(cookiesPath, { force: true });
        }
    }
    catch (err) {
        console.warn("Cleanup failed:", err);
    }
}
//# sourceMappingURL=extract-audio.js.map