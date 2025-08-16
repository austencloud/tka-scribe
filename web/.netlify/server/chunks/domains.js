const PRIMARY_DOMAIN = "https://thekineticalphabet.com";
const SECONDARY_DOMAINS = [
  "https://kineticalphabet.com",
  "https://www.thekineticalphabet.com",
  "https://www.kineticalphabet.com"
];
function shouldRedirectToPrimary(currentOrigin) {
  return SECONDARY_DOMAINS.some(
    (domain) => currentOrigin === new URL(domain).origin
  );
}
function getRedirectURL(currentURL) {
  const url = new URL(currentURL);
  return `${PRIMARY_DOMAIN}${url.pathname}${url.search}${url.hash}`;
}
export {
  PRIMARY_DOMAIN as P,
  getRedirectURL as g,
  shouldRedirectToPrimary as s
};
