import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: "Sequence Cards - TKA Movement Notation | Flow Arts Diagrams",
      description:
        "Create and view visual word cards with TKA's movement notation system. Professional flow arts choreography documentation.",
      canonical: "https://thekineticalphabet.com/word-card",
      ogTitle: "Sequence Cards - Movement Notation",
      ogDescription:
        "Professional movement notation system for documenting and sharing flow arts choreography with visual word cards.",
      ogType: "website",
      ogUrl: "https://thekineticalphabet.com/word-card",
    },
  };
};
