import { PRIMARY_DOMAIN } from "../../config/domains";
import type { RequestHandler } from "./$types";

const pages = [
  // Main Application - Home/Dashboard
  {
    url: "",
    priority: "1.0",
    changefreq: "weekly",
  },
  // Authentication
  {
    url: "auth/login",
    priority: "0.6",
    changefreq: "monthly",
  },
  // User Profile
  {
    url: "profile",
    priority: "0.5",
    changefreq: "monthly",
  },
];

export const GET: RequestHandler = async () => {
  const domain = PRIMARY_DOMAIN;
  const now = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${domain}/${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
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
