import { h as head, p as pop, a as push } from "../../../chunks/index.js";
import { A as AboutTab } from "../../../chunks/AboutTab.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>TKA Features - Kinetic Typography Animation Tools | Advanced Sequence
    Editor</title>`;
    $$payload2.out.push(`<meta name="description" content="Discover TKA's powerful features for creating kinetic typography animations. Advanced sequence editor, motion controls, export options, and more."/> <meta property="og:title" content="TKA Features - Advanced Animation Tools"/> <meta property="og:description" content="Powerful kinetic typography animation features including sequence editor, motion controls, and professional export options."/> <meta property="og:type" content="website"/> <meta property="og:url" content="https://thekineticalphabet.com/features"/> <link rel="canonical" href="https://thekineticalphabet.com/features"/> <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TKA - The Kinetic Constructor",
      "featureList": [
        "Advanced Sequence Editor",
        "Motion Controls",
        "Professional Export Options",
        "Browser-based Animation",
        "Kinetic Typography Tools"
      ],
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web Browser"
    }
  <\/script>`);
  });
  AboutTab($$payload);
  pop();
}
export {
  _page as default
};
