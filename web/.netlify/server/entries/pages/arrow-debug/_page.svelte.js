import { h as head, p as pop, a as push } from "../../../chunks/index.js";
import "../../../chunks/png-metadata-extractor.js";
import "../../../chunks/MathConstants.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>TKA Arrow Positioning Debug - Step-by-Step Analysis</title>`;
  });
  $$payload.out.push(`<div class="arrow-debug-container svelte-1jahjph"><header class="debug-header svelte-1jahjph"><h1 class="svelte-1jahjph">🎯 Arrow Positioning Debug</h1> <p class="svelte-1jahjph">Visual step-by-step analysis of arrow placement with coordinate system
      debugging</p></header> `);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="loading-container svelte-1jahjph"><div class="loading-box svelte-1jahjph"><div class="spinner svelte-1jahjph"></div> <h2 class="svelte-1jahjph">🔧 Initializing Debug System</h2> <p class="svelte-1jahjph">Setting up DI container and positioning services...</p></div></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
