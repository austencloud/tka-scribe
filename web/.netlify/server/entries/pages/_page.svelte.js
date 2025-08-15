import "clsx";
import { p as pop, a as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "../../chunks/state.svelte.js";
import { M as MainApplication } from "../../chunks/MainApplication.js";
function _page($$payload, $$props) {
  push();
  MainApplication($$payload);
  pop();
}
export {
  _page as default
};
