/**
 * Analytics Dashboard Types
 * Shared type definitions for analytics components
 */

export interface MetricCardData {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface ContentStat {
  label: string;
  value: number;
  icon: string;
}

export interface TopSequence {
  name: string;
  word: string;
  views: number;
  creator: string;
}

export interface EngagementStat {
  label: string;
  value: number;
  total: number;
  icon: string;
  color: string;
}

export type TimeRangeOption = "7d" | "30d" | "90d";
