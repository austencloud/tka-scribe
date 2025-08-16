import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: "Flow Arts Composer - TKA Sequence Writer | Movement Editor",
      description:
        "Compose advanced flow arts sequences with TKA's professional writing interface. Create complex poi, fans, staff choreography.",
      canonical: "https://thekineticalphabet.com/write",
      ogTitle: "Flow Arts Composer - Advanced Editor",
      ogDescription:
        "Professional composition tool for creating complex flow arts sequences and advanced movement patterns.",
      ogType: "website",
      ogUrl: "https://thekineticalphabet.com/write",
    },
  };
};
