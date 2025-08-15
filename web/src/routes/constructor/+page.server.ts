import type { PageServerLoad } from "./";

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: "Flow Arts Constructor - TKA Sequence Builder | Movement Creator",
      description: "Create custom flow arts sequences with TKA's intuitive constructor. Build poi, fans, staff choreography with our visual editor.",
      canonical: "https://thekineticalphabet.com/constructor",
      ogTitle: "Flow Arts Constructor - Sequence Builder",
      ogDescription: "Visual sequence builder for creating custom flow arts choreography. Design poi, fans, staff movements with ease.",
      ogType: "website",
      ogUrl: "https://thekineticalphabet.com/constructor",
    },
  };
};
