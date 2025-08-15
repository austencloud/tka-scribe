import type { PageServerLoad } from "./";

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: "Arrow Debug Tool - TKA Development | Flow Arts Vector Testing",
      description: "Development tool for debugging arrow vectors and movement paths in TKA flow arts sequences. Test and validate movement directions.",
      canonical: "https://thekineticalphabet.com/arrow-debug",
      ogTitle: "Arrow Debug Tool - TKA Development",
      ogDescription: "Debug and test arrow vectors for flow arts movement sequences with TKA's development tools.",
      ogType: "website",
      ogUrl: "https://thekineticalphabet.com/arrow-debug",
    },
  };
};
