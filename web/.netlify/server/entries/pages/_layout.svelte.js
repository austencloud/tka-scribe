import { s as setContext, h as head, p as pop, a as push } from "../../chunks/index.js";
function _layout($$payload, $$props) {
  push();
  let { children } = $$props;
  let container = null;
  setContext("di-container", () => {
    console.log("🔧 Layout: Context getter called, container:", false);
    return container;
  });
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>TKA - The Kinetic Constructor</title>`;
  });
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="loading-screen svelte-19exgsb"><div class="spinner svelte-19exgsb"></div> <p class="svelte-19exgsb">Initializing TKA...</p></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _layout as default
};
