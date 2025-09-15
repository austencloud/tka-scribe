import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title:
        "Gallery - Flow Arts Sequence Library | TKA Movement Catalog",
      description:
        "Explore thousands of flow arts sequences in the TKA gallery. Browse poi, fans, staff movements by difficulty, style, and technique.",
      canonical: "https://thekineticalphabet.com/gallery",
      ogTitle: "Gallery - Flow Arts Sequence Library | TKA",
      ogDescription:
        "Comprehensive flow arts sequence gallery with poi, fans, staff movements. Filter by difficulty, style, and technique.",
      ogType: "website",
      ogUrl: "https://thekineticalphabet.com/gallery",
    },
  };
};
