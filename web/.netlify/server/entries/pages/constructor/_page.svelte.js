import { h as head, p as pop, a as push, e as escape_html, b as attr } from "../../../chunks/index.js";
import { M as MainApplication } from "../../../chunks/MainApplication.js";
import { h as html } from "../../../chunks/html.js";
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Flow Arts Constructor - Sequence Builder",
    description: "Visual sequence builder for creating custom flow arts choreography. Design poi, fans, staff movements with ease.",
    url: "https://thekineticalphabet.com/constructor",
    isPartOf: {
      "@type": "WebSite",
      name: "TKA - The Kinetic Constructor",
      url: "https://thekineticalphabet.com"
    },
    creator: {
      "@type": "SoftwareApplication",
      name: "TKA - The Kinetic Constructor"
    }
  };
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html(data.meta.title)}</title>`;
    $$payload2.out.push(`<meta name="description"${attr("content", data.meta.description)}/> <meta property="og:title"${attr("content", data.meta.ogTitle)}/> <meta property="og:description"${attr("content", data.meta.ogDescription)}/> <meta property="og:type"${attr("content", data.meta.ogType)}/> <meta property="og:url"${attr("content", data.meta.ogUrl)}/> <meta property="og:site_name" content="TKA - The Kinetic Constructor"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title"${attr("content", data.meta.ogTitle)}/> <meta name="twitter:description"${attr("content", data.meta.ogDescription)}/> <link rel="canonical"${attr("href", data.meta.canonical)}/> ${html(`<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`)}`);
  });
  MainApplication($$payload);
  pop();
}
export {
  _page as default
};
