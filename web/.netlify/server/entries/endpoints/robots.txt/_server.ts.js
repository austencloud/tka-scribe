import { P as PRIMARY_DOMAIN } from "../../../chunks/domains.js";
const GET = async () => {
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
      "Cache-Control": "public, max-age=86400"
    }
  });
};
export {
  GET
};
