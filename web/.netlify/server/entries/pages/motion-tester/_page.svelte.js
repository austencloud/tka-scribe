import { h as head, p as pop, a as push } from "../../../chunks/index.js";
import { M as MainApplication } from "../../../chunks/MainApplication.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Motion Tester - TKA Development Tool | Flow Arts Animation Testing</title>`;
    $$payload2.out.push(`<meta name="description" content="Development tool for testing motion parameters and animation sequences in TKA. Debug flow arts movements and kinetic patterns."/> <meta property="og:title" content="Motion Tester - TKA Development Tool"/> <meta property="og:description" content="Test and debug motion parameters for flow arts animations with TKA's motion testing interface."/> <meta property="og:type" content="website"/> <link rel="canonical" href="https://thekineticalphabet.com/motion-tester"/>`);
  });
  MainApplication($$payload);
  pop();
}
export {
  _page as default
};
