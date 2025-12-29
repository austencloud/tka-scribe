/**
 * Gallery Writer
 *
 * Writes rendered images to static/gallery/ via the gallery-write API endpoint.
 */

import type { IGalleryWriter } from "../contracts/IGalleryWriter";

export class GalleryWriter implements IGalleryWriter {
  async writeToGallery(word: string, blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("image", blob, `${word}_ver1.webp`);
    formData.append("word", word);

    const response = await fetch("/api/gallery-write", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to write to gallery");
    }

    const data = await response.json();
    return data.path;
  }
}
