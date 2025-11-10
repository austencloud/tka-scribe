import { PRIMARY_DOMAIN } from "../../config/domains";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml

# Main application pages - high priority for indexing
Allow: /
Allow: /profile

# Authentication
Allow: /auth/login

# Development/Testing pages - lower priority
Allow: /animation-test
Allow: /benchmark
Allow: /gallery-test
Allow: /icon-preview
Allow: /pictograph-test

# Block API endpoints and internal paths
Disallow: /api/
Disallow: /_app/
Disallow: /static/
Disallow: /.svelte-kit/
Disallow: /node_modules/
Disallow: /clear-cache

# Crawl delay for respectful crawling
Crawl-delay: 1

# Cache instruction
Cache-control: max-age=86400`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
