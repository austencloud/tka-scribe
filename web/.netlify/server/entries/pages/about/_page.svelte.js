import { h as head, p as pop, a as push, e as escape_html, b as attr } from "../../../chunks/index2.js";
import { A as AboutTab } from "../../../chunks/AboutTab.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TKA - The Kinetic Constructor",
    "description": "Revolutionary browser-based tool for creating kinetic typography animations",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html(data.meta.title)}</title>`;
    $$payload2.out.push(`<meta name="description"${attr("content", data.meta.description)}/> <meta property="og:title"${attr("content", data.meta.ogTitle)}/> <meta property="og:description"${attr("content", data.meta.ogDescription)}/> <meta property="og:type"${attr("content", data.meta.ogType)}/> <meta property="og:url"${attr("content", data.meta.ogUrl)}/> <link rel="canonical"${attr("href", data.meta.canonical)}/> ${html(`<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`)}`);
  });
  AboutTab($$payload);
  pop();
}
export {
  _page as default
};
