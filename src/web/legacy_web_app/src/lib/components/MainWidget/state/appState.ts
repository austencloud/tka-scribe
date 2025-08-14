export type TabComponentType = any;
export type BackgroundType = "snowfall" | "nightSky";
export type TabId = "construct" | "generate" | "browse" | "learn" | "write";

export type Tab = {
  id: TabId;
  component: TabComponentType | null;
  icon: string;
  title: string;
  splitView: boolean;
};

export const tabs: ReadonlyArray<Tab> = [
  {
    id: "construct",
    component: null,
    icon: "⚒️",
    title: "Construct",
    splitView: true,
  },
  {
    id: "generate",
    component: null,
    icon: "🤖",
    title: "Generate",
    splitView: true,
  },
  {
    id: "browse",
    component: null,
    icon: "🔍",
    title: "Browse",
    splitView: false,
  },
  {
    id: "learn",
    component: null,
    icon: "🧠",
    title: "Learn",
    splitView: false,
  },
  {
    id: "write",
    component: null,
    icon: "✍️",
    title: "Write",
    splitView: true,
  },
] as const;
