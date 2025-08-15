import * as universal from '../entries/pages/about/_page.ts.js';
import * as server from '../entries/pages/about/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/about/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/about/+page.ts";
export { server };
export const server_id = "src/routes/about/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.BG1PMzU6.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/DcelhaDg.js","_app/immutable/chunks/WLdB2GZ3.js","_app/immutable/chunks/Dq_3VryF.js","_app/immutable/chunks/cd_gxopx.js","_app/immutable/chunks/C14XJK7X.js","_app/immutable/chunks/CloEs4rE.js","_app/immutable/chunks/DVdp_3Y0.js","_app/immutable/chunks/BWTKqpN7.js"];
export const stylesheets = ["_app/immutable/assets/AboutTab.BzlsHyU4.css"];
export const fonts = [];
