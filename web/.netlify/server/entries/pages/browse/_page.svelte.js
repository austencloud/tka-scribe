import { h as head, p as pop, a as push, b as attr } from "../../../chunks/index2.js";
import { M as MainApplication } from "../../../chunks/MainApplication.js";
import { g as getCanonicalURL } from "../../../chunks/domains.js";
function _page($$payload, $$props) {
  push();
  const canonicalURL = getCanonicalURL("browse");
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Browse Animations - TKA Gallery | Kinetic Typography Examples</title>`;
    $$payload2.out.push(`<meta name="description" content="Explore hundreds of kinetic typography animations in the TKA gallery. Browse by difficulty, length, style, and more. Find inspiration for your projects."/> <meta property="og:title" content="Browse Animations - TKA Gallery"/> <meta property="og:description" content="Explore hundreds of kinetic typography animations. Browse by difficulty, length, style and find inspiration."/> <meta property="og:type" content="website"/> <meta property="og:url"${attr("content", canonicalURL)}/> <link rel="canonical"${attr("href", canonicalURL)}/> <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "TKA Animation Gallery",
    "description": "Collection of kinetic typography animations created with TKA",
    "isPartOf": {
      "@type": "WebSite",
      "name": "TKA - The Kinetic Constructor"
    }
  }
  <\/script>`);
  });
  MainApplication($$payload);
  pop();
}
export {
  _page as default
};
