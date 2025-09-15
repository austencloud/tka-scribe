import type { SequenceData } from "../../../../../shared";

export interface GalleryNavigationItem {
  id: string;
  label: string;
  value: string | number;
  count: number;
  isActive: boolean;
  sequences: SequenceData[];
}

export interface GalleryNavigationConfig {
  id: string;
  title: string;
  type: "date" | "length" | "letter" | "level" | "author" | "favorites";
  items: GalleryNavigationItem[];
  isExpanded: boolean;
  totalCount: number;
}

