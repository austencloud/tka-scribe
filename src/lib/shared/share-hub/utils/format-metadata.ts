/**
 * Format Metadata Utilities
 *
 * Provides metadata for each sharing format (icons, labels, descriptions, colors).
 */

import type { FormatMetadata, ShareFormat } from '../domain/models/ShareFormat';

export const FORMAT_METADATA: Record<ShareFormat, FormatMetadata> = {
  image: {
    id: 'image',
    label: 'Static Image',
    description: 'Export as PNG/JPG/WebP with custom options',
    icon: 'fa-image',
    gradient: {
      from: '#3b82f6',  // Blue
      to: '#2563eb',
    },
  },
  animation: {
    id: 'animation',
    label: 'Animation Video',
    description: 'Export animation as MP4 with precise timing',
    icon: 'fa-play-circle',
    gradient: {
      from: '#8b5cf6',  // Purple
      to: '#7c3aed',
    },
  },
  video: {
    id: 'video',
    label: 'Performance Video',
    description: 'Upload or share recorded performance videos',
    icon: 'fa-video',
    gradient: {
      from: '#f97316',  // Orange
      to: '#ea580c',
    },
  },
  composite: {
    id: 'composite',
    label: 'Composite View',
    description: 'Animation + grid with synchronized highlighting',
    icon: 'fa-columns',
    gradient: {
      from: '#10b981',  // Green
      to: '#059669',
    },
  },
};

export function getFormatMetadata(format: ShareFormat): FormatMetadata {
  return FORMAT_METADATA[format];
}

export function getAllFormats(): ShareFormat[] {
  return ['image', 'animation', 'video', 'composite'];
}
