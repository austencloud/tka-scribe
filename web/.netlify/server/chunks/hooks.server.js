import { s as shouldRedirectToPrimary, a as getRedirectURL } from "./domains.js";
const handle = async ({ event, resolve }) => {
  if (shouldRedirectToPrimary(event.url.origin)) {
    const redirectURL = getRedirectURL(event.url.href);
    return new Response(null, {
      status: 301,
      // Permanent redirect for SEO
      headers: {
        Location: redirectURL
      }
    });
  }
  if (event.url.pathname === "/api/console-forward") {
    if (event.request.method === "POST") {
      try {
        const body = await event.request.text();
        const data = JSON.parse(body);
        const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        const logLine = `[${timestamp}] BROWSER ${data.level}: ${data.message}`;
        process.stdout.write(logLine + "\n");
        return new Response("OK", { status: 200 });
      } catch {
        return new Response("Error", { status: 500 });
      }
    }
  }
  return resolve(event);
};
export {
  handle
};
