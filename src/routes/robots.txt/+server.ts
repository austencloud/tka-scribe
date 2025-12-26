import { PRIMARY_DOMAIN } from "../../config/domains";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml

# Main application pages
Allow: /
Allow: /profile
Allow: /auth/login
Allow: /sequence/

# Block internal paths
Disallow: /api/
Disallow: /admin/
Disallow: /test/
Disallow: /demo/
Disallow: /_app/
Disallow: /.svelte-kit/

# Crawl delay for respectful crawling
Crawl-delay: 1`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
