import { h as head, p as pop, a as push } from "../../../chunks/index2.js";
import { A as AboutTab } from "../../../chunks/AboutTab.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Getting Started with TKA - Kinetic Typography Tutorial | Animation Guide</title>`;
    $$payload2.out.push(`<meta name="description" content="Learn how to create your first kinetic typography animation with TKA. Step-by-step tutorial and guide for beginners."/> <meta property="og:title" content="Getting Started with TKA - Animation Tutorial"/> <meta property="og:description" content="Step-by-step guide to create your first kinetic typography animation with TKA's intuitive tools."/> <meta property="og:type" content="article"/> <meta property="og:url" content="https://thekineticalphabet.com/getting-started"/> <link rel="canonical" href="https://thekineticalphabet.com/getting-started"/> <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create Kinetic Typography with TKA",
    "description": "Learn to create kinetic typography animations using TKA's browser-based tools",
    "image": "https://your-domain.com/images/tutorial-preview.jpg",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Open TKA Constructor",
        "text": "Navigate to the Constructor tab to begin creating your animation"
      },
      {
        "@type": "HowToStep", 
        "name": "Design Your Sequence",
        "text": "Use the sequence editor to create your kinetic typography animation"
      },
      {
        "@type": "HowToStep",
        "name": "Preview and Export",
        "text": "Preview your animation and export in your preferred format"
      }
    ]
  }
  <\/script>`);
  });
  AboutTab($$payload);
  pop();
}
export {
  _page as default
};
