"use strict";
/**
 * Firebase Cloud Functions Entry Point
 *
 * Exports all Cloud Functions for the TKA Scribe application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeExtractAudio = void 0;
// YouTube audio extraction
var extract_audio_1 = require("./youtube/extract-audio");
Object.defineProperty(exports, "youtubeExtractAudio", {
  enumerable: true,
  get: function () {
    return extract_audio_1.extractAudio;
  },
});
//# sourceMappingURL=index.js.map
