import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.kJH-QQHD.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/DnqOWv8T.js","_app/immutable/chunks/B9Skohb7.js","_app/immutable/chunks/ShPM-3U1.js"];
export const stylesheets = ["_app/immutable/assets/0.CLSBHzcL.css"];
export const fonts = [];
