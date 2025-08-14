class PngMetadataExtractor {
  /**
   * Extract complete JSON metadata from a PNG file
   * @param filePath - Path to the PNG file (relative to static directory)
   * @returns Promise<any> - The complete sequence metadata as JSON array
   */
  static async extractMetadata(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch PNG file: ${response.status} ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const metadataJson = this.findTextChunk(uint8Array, "metadata");
      if (!metadataJson) {
        throw new Error("No unified JSON metadata found in PNG file");
      }
      const parsed = JSON.parse(metadataJson);
      return parsed.sequence || parsed;
    } catch (error) {
      console.error("Error extracting PNG metadata:", error);
      throw error;
    }
  }
  /**
   * Find the unified JSON metadata tEXt chunk in PNG data
   *
   * We only look for the "metadata" keyword which contains the complete
   * JSON structure with all sequence information. This is our single
   * source of truth for all metadata fields.
   *
   * @param data - PNG file data as Uint8Array
   * @param keyword - Should always be "metadata" for TKA sequences
   * @returns string | null - The JSON metadata string or null if not found
   */
  static findTextChunk(data, keyword) {
    let offset = 8;
    while (offset < data.length) {
      const length = data[offset] << 24 | data[offset + 1] << 16 | data[offset + 2] << 8 | data[offset + 3];
      offset += 4;
      const type = String.fromCharCode(
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3]
      );
      offset += 4;
      if (type === "tEXt") {
        const chunkData = data.slice(offset, offset + length);
        const text = new TextDecoder("latin1").decode(chunkData);
        const nullIndex = text.indexOf("\0");
        if (nullIndex !== -1) {
          const chunkKeyword = text.substring(0, nullIndex);
          if (chunkKeyword === keyword) {
            return text.substring(nullIndex + 1);
          }
        }
      }
      offset += length + 4;
    }
    return null;
  }
  /**
   * Extract metadata for a specific sequence by name
   * @param sequenceName - Name of the sequence (e.g., "DKIIEJII")
   * @returns Promise<any> - The extracted metadata JSON
   */
  static async extractSequenceMetadata(sequenceName) {
    const filePath = `/dictionary/${sequenceName}/${sequenceName}_ver1.png`;
    return this.extractMetadata(filePath);
  }
  /**
   * Debug method to display complete unified metadata for a sequence
   *
   * This shows the entire JSON metadata structure including:
   * - Author, level, start position (from first entry)
   * - All beat data with motion types and attributes
   * - Any other fields in the unified metadata
   *
   * @param sequenceName - Name of the sequence to analyze
   */
  static async debugSequenceMetadata(sequenceName) {
    try {
      console.log(
        `🔍 [UNIFIED METADATA] Extracting complete metadata for ${sequenceName}...`
      );
      const metadata = await this.extractSequenceMetadata(sequenceName);
      console.log(
        `📋 [UNIFIED METADATA] Complete JSON structure for ${sequenceName}:`
      );
      console.log(JSON.stringify(metadata, null, 2));
      const firstEntry = metadata[0] || {};
      const startPositionEntries = metadata.filter(
        (step) => step.sequence_start_position
      );
      console.log(
        `👤 [UNIFIED METADATA] Author: ${firstEntry.author || "MISSING"}`
      );
      console.log(
        `📍 [UNIFIED METADATA] Start Position: ${startPositionEntries[0]?.sequence_start_position || "MISSING"}`
      );
      console.log(
        `📊 [UNIFIED METADATA] Level: ${firstEntry.level || "MISSING"}`
      );
      console.log(`🎯 [UNIFIED METADATA] Motion types for ${sequenceName}:`);
      const realBeats = metadata.slice(1).filter((step) => step.letter && !step.sequence_start_position);
      realBeats.forEach((step, index) => {
        const blueMotion = step.blue_attributes?.motion_type || "unknown";
        const redMotion = step.red_attributes?.motion_type || "unknown";
        console.log(
          `  Beat ${index + 1} (${step.letter}): blue=${blueMotion}, red=${redMotion}`
        );
      });
    } catch (error) {
      console.error(
        `❌ [UNIFIED METADATA] Failed to extract metadata for ${sequenceName}:`,
        error
      );
    }
  }
}
if (typeof window !== "undefined") {
  window.extractPngMetadata = PngMetadataExtractor.debugSequenceMetadata;
}
export {
  PngMetadataExtractor as P
};
