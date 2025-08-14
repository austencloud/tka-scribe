import type { RequestHandler } from "./$types";
import { PRIMARY_DOMAIN } from "$lib/config/domains";

const pages = [
  {
    url: "",
    priority: "1.0",
    description: "TKA - The Kinetic Constructor | Home",
  },
  {
    url: "about",
    priority: "0.9",
    description: "About TKA - Revolutionary Animation Tool",
  },
  {
    url: "features",
    priority: "0.8",
    description: "TKA Features - Advanced Animation Tools",
  },
  {
    url: "getting-started",
    priority: "0.8",
    description: "Getting Started with TKA - Tutorial",
  },
  {
    url: "browse",
    priority: "0.8",
    description: "Browse Animations - TKA Gallery",
  },
  {
    url: "constructor",
    priority: "0.7",
    description: "TKA Constructor - Animation Builder",
  },
  { url: "arrow-debug", priority: "0.3", description: "Arrow Debug Tool" },
  {
    url: "metadata-tester",
    priority: "0.3",
    description: "Metadata Testing Tool",
  },
  { url: "motion-tester", priority: "0.3", description: "Motion Testing Tool" },
  {
    url: "test-comparison",
    priority: "0.3",
    description: "Test Comparison Tool",
  },
];

export const GET: RequestHandler = async () => {
  const domain = PRIMARY_DOMAIN;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${domain}/${page.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.priority === "1.0" ? "weekly" : "monthly"}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
