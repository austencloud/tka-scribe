/**
 * Analytics Dashboard Utilities
 * Shared utility functions for analytics components
 */

export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function getChangeClass(change: number): string {
  return change >= 0 ? "positive" : "negative";
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function getBarWidth(value: number, total: number): string {
  return `${Math.min((value / total) * 100, 100)}%`;
}

export function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    session_start: "fa-sign-in-alt",
    module_view: "fa-eye",
    sequence_create: "fa-plus-circle",
    sequence_save: "fa-save",
    sequence_delete: "fa-trash",
    sequence_play: "fa-play-circle",
    sequence_export: "fa-download",
    setting_change: "fa-cog",
  };
  return icons[eventType] ?? "fa-circle";
}

export function formatModuleLabel(moduleTab: string): string {
  const labels: Record<string, string> = {
    "create:constructor": "Construct",
    "create:assembler": "Assemble",
    "create:generator": "Generate",
    "learn:concepts": "Concepts",
    "learn:play": "Play",
    "explore:gallery": "Gallery",
    "explore:collections": "Collections",
    "community:leaderboards": "Leaderboards",
    "community:creators": "Creators",
    "community:support": "Support",
    "animate:single": "Single Mode",
    "animate:tunnel": "Tunnel Mode",
    "animate:mirror": "Mirror Mode",
    "animate:grid": "Grid Mode",
    "admin:analytics": "Analytics",
    "admin:challenges": "Challenges",
    "admin:users": "Users",
    "admin:flags": "Flags",
    "admin:tools": "Tools",
    create: "Create",
    explore: "Explore",
    learn: "Learn",
    library: "Library",
    animate: "Animate",
    community: "Community",
    admin: "Admin",
  };
  return labels[moduleTab] ?? moduleTab;
}
