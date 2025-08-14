import type { RequestHandler } from "./$types";
import { PRIMARY_DOMAIN } from "$lib/config/domains";

export const GET: RequestHandler = async () => {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml

# Block development/testing pages from indexing
Disallow: /arrow-debug
Disallow: /metadata-tester  
Disallow: /motion-tester
Disallow: /test-comparison

# Allow important pages
Allow: /
Allow: /about
Allow: /features
Allow: /getting-started
Allow: /browse
Allow: /constructor`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
