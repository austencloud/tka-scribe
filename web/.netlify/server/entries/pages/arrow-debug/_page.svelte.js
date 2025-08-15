import { h as head, p as pop, a as push } from "../../../chunks/index2.js";
import "../../../chunks/png-metadata-extractor.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>TKA Arrow Positioning Debug - Step-by-Step Analysis</title>`;
  });
  $$payload.out.push(`<div class="arrow-debug-container svelte-q50zn9"><header class="debug-header svelte-q50zn9"><h1 class="svelte-q50zn9">🎯 Arrow Positioning Debug</h1> <p class="svelte-q50zn9">Visual step-by-step analysis of arrow placement with coordinate system debugging</p></header> `);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="loading-container svelte-q50zn9"><div class="loading-box svelte-q50zn9"><div class="spinner svelte-q50zn9"></div> <h2 class="svelte-q50zn9">🔧 Initializing Debug System</h2> <p class="svelte-q50zn9">Setting up DI container and positioning services...</p></div></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
