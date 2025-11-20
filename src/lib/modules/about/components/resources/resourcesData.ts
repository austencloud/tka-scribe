// resourcesData.ts - Resources data separated from component
export interface Resource {
  id?: string;
  name: string;
  description: string;
  url: string;
  category: string;
  level: string;
  value: string;
  hasLandingPage?: boolean;
  landingPageUrl?: string;
  status: "active" | "historical" | "vendor";
  lastUpdated?: string;
  foundingYear?: number;
  specialties?: string[];
  companyLocation?: string;
  modalType?: "educational" | "vendor" | "archive";
}

export const resources: Resource[] = [
  // ACTIVE LEARNING RESOURCES
  {
    name: "Vulcan Tech Gospel (VTG)",
    description:
      "Foundational poi theory by Noel Yee that established core concepts for understanding technical spinning mechanics and transitions.",
    url: "https://noelyee.com/instruction/vulcan-tech-gospel/",
    category: "active-learning",
    level: "intermediate",
    value:
      "Systematic framework for analyzing poi movements through flowers, antispin, and transition theory.",
    status: "active",
    lastUpdated: "2023",
    hasLandingPage: true,
    landingPageUrl: "/links/vulcan-tech-gospel",
    modalType: "educational",
  },
  {
    name: "Charlie Cushing's 9 Square Theory",
    description:
      "Advanced framework for connecting unit circles in technical poi, developed by former helicopter pilot Charlie Cushing.",
    url: "https://www.spinmorepoi.com/advanced/",
    category: "active-learning",
    level: "advanced",
    value:
      "Builds on VTG concepts with geometric approach to understanding spatial relationships in poi spinning.",
    status: "active",
    lastUpdated: "2023",
    hasLandingPage: true,
    landingPageUrl: "/links/charlie-cushing-9-square-theory",
    modalType: "educational",
  },
  {
    name: "Flow Arts Institute",
    description:
      "Educational platform exploring flow state and movement theory across multiple flow arts disciplines.",
    url: "https://flowartsinstitute.com/",
    category: "active-learning",
    level: "all",
    value:
      "Research-based approach to understanding the science and practice of flow arts.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational",
  },
  {
    name: "Playpoi",
    description:
      "Extensive library of poi tutorials, courses, and community-contributed educational content.",
    url: "https://playpoi.com/",
    category: "active-learning",
    level: "all",
    value:
      "Comprehensive learning resource covering beginner to advanced poi techniques.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational",
  },
  {
    name: "The Kinetic Alphabet",
    description:
      "Notation system for documenting and sharing flow arts choreography with structured, repeatable sequences.",
    url: "/",
    category: "active-learning",
    level: "all",
    value:
      "Framework for breaking down complex movements into readable notation that can be learned and shared.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational",
  },

  // ACTIVE COMMUNITY PLATFORMS
  {
    name: "Reddit Flow Arts Community",
    description:
      "Discussion forum for sharing videos, asking questions, and connecting with practitioners across all flow arts disciplines.",
    url: "https://www.reddit.com/r/flowarts/",
    category: "active-community",
    level: "all",
    value:
      "Active community with daily posts covering technique, gear, events, and general flow arts discussion.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational",
  },
  {
    name: "Facebook Flow Arts Groups",
    description:
      "Collection of regional and discipline-specific groups for local scene connections and event coordination.",
    url: "https://www.facebook.com/",
    category: "active-community",
    level: "all",
    value:
      "Find local spinners, workshops, and gatherings through region-based community groups.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational",
  },
  {
    name: "Discord Communities",
    description:
      "Real-time chat servers for flow arts discussion, including general and discipline-specific channels.",
    url: "https://discord.com/",
    category: "active-community",
    level: "all",
    value:
      "Live conversation and quick feedback on technique, gear recommendations, and community events.",
    status: "active",
    lastUpdated: "2024",
    modalType: "educational",
  },

  // FLOW ARTS VENDORS & EQUIPMENT
  {
    name: "Flowtoys",
    description:
      "LED flow props including programmable poi, staffs, clubs, and hoops with app-based color control.",
    url: "https://flowtoys.com/",
    category: "vendors",
    level: "all",
    value:
      "Known for durable construction and customizable lighting patterns. Offers lifetime warranty on LED capsules.",
    status: "vendor",
    foundingYear: 2005,
    lastUpdated: "2024",
    specialties: [
      "LED Poi",
      "LED Staffs",
      "LED Clubs",
      "LED Hoops",
      "Capsule Handles",
    ],
    companyLocation: "USA",
    modalType: "vendor",
  },
  {
    name: "Lanternsmith",
    description:
      "Practice and fire poi designed by Charlie Cushing with focus on balanced weight distribution and chain mechanics.",
    url: "https://www.lanternsmith.com/",
    category: "vendors",
    level: "all",
    value:
      "Handcrafted poi with attention to technical spinning requirements. Custom options available.",
    status: "vendor",
    foundingYear: 2008,
    lastUpdated: "2024",
    specialties: ["Practice Poi", "Fire Poi", "Custom Poi", "Poi Chains"],
    companyLocation: "USA",
    modalType: "vendor",
  },
  {
    name: "Cathedral Firetoys",
    description:
      "Flow arts and fire performance supplier based in UK, carrying wide range of props and safety equipment.",
    url: "https://www.cathedralfiretoys.co.uk/",
    category: "vendors",
    level: "all",
    value:
      "Extensive catalog covering multiple disciplines. European shipping available.",
    status: "vendor",
    foundingYear: 2001,
    lastUpdated: "2024",
    specialties: ["Fire Props", "Practice Props", "Safety Gear", "Juggling"],
    companyLocation: "UK",
    modalType: "vendor",
  },
  {
    name: "Home of Poi",
    description:
      "Australian retailer carrying poi, staffs, and flow arts accessories with focus on community education.",
    url: "https://www.homeofpoi.com/",
    category: "vendors",
    level: "all",
    value:
      "Established supplier with tutorial resources and active community forum.",
    status: "vendor",
    foundingYear: 2000,
    lastUpdated: "2024",
    specialties: ["Poi", "Staffs", "Fire Safety", "Performance Gear"],
    companyLocation: "Australia",
    modalType: "vendor",
  },

  // HISTORICAL ARCHIVES
  {
    name: "The Poi Page (Archive)",
    description:
      "Malcolm's early poi instruction website, one of the first comprehensive online resources for learning poi.",
    url: "https://web.archive.org/web/20050404064746/http://www.poipage.com/",
    category: "historical-archives",
    level: "all",
    value:
      "Preserved via Internet Archive. Shows how poi instruction was taught in the early 2000s.",
    status: "historical",
    lastUpdated: "2005",
    modalType: "archive",
  },
  {
    name: "Original Glowsticking.com Archive",
    description:
      "Community site documenting glowsticking techniques and rave scene flow arts culture.",
    url: "https://web.archive.org/web/20041010000000*/glowsticking.com",
    category: "historical-archives",
    level: "all",
    value:
      "Historical record of LED flow arts development and rave culture from early 2000s.",
    status: "historical",
    lastUpdated: "2004",
    modalType: "archive",
  },
  {
    name: "Spinning.org Archive",
    description:
      "Early poi community forum with discussions and tutorials from the 2000s flow arts scene.",
    url: "https://web.archive.org/web/20050301000000*/spinning.org",
    category: "historical-archives",
    level: "all",
    value:
      "Snapshot of community knowledge-sharing before modern social media platforms.",
    status: "historical",
    lastUpdated: "2005",
    modalType: "archive",
  },
];

export const categories = [
  { value: "all", label: "All Resources" },
  { value: "active-learning", label: "Learning Resources" },
  { value: "active-community", label: "Community" },
  { value: "vendors", label: "Equipment & Vendors" },
  { value: "historical-archives", label: "Historical Archives" },
];

export const levels = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    "active-learning": "Active Learning Resources",
    "active-community": "Active Community Platforms",
    vendors: "Flow Arts Vendors & Equipment",
    "historical-archives": "Historical Archives",
  };
  return categoryMap[category] || category;
}

export function getLevelDisplayName(level: string): string {
  const levelMap: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate to Advanced",
    advanced: "Advanced",
    all: "All Levels",
  };
  return levelMap[level] || level;
}

export function getKeywordsForResource(resourceName: string): string {
  switch (resourceName) {
    case "vulcan-tech-gospel":
      return "Vulcan Tech Gospel, VTG, poi theory, Noel Yee, poi flowers, transition theory, technical poi, flow arts theory, EXTERNAL REFERENCE, NOT TKA";
    case "charlie-cushing-9-square-theory":
      return "9 square theory, Charlie Cushing, poi theory, unit circles, technical poi, helicopter pilot, LanternSmith, advanced poi, spatial relationships, EXTERNAL REFERENCE, NOT TKA";
    default:
      return "flow arts, theory, tutorial";
  }
}

export function getTableOfContentsForResource(
  resourceName: string
): Array<{ id: string; label: string }> {
  switch (resourceName) {
    case "vulcan-tech-gospel":
      return [
        { id: "overview", label: "Overview" },
        { id: "key-concepts", label: "Key Concepts" },
        { id: "getting-started", label: "Getting Started" },
        { id: "advanced-applications", label: "Advanced Applications" },
        { id: "community-impact", label: "Community Impact" },
        { id: "official-resources", label: "Official Resources" },
      ];
    case "charlie-cushing-9-square-theory":
      return [
        { id: "overview", label: "Overview" },
        { id: "creator-background", label: "Creator Background" },
        { id: "key-concepts", label: "Key Concepts" },
        { id: "getting-started", label: "Getting Started" },
        { id: "advanced-applications", label: "Advanced Applications" },
        { id: "community-resources", label: "Community Resources" },
      ];
    default:
      return [
        { id: "overview", label: "Overview" },
        { id: "getting-started", label: "Getting Started" },
        { id: "resources", label: "Additional Resources" },
      ];
  }
}
