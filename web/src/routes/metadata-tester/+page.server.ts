import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: "Metadata Tester - TKA Development | PNG Data Validation",
      description:
        "Development tool for testing and validating PNG metadata extraction in TKA sequence files. Debug image data parsing.",
      canonical: "https://thekineticalphabet.com/metadata-tester",
      ogTitle: "Metadata Tester - TKA Development",
      ogDescription:
        "Test and validate PNG metadata extraction for TKA sequence files with our development interface.",
      ogType: "website",
      ogUrl: "https://thekineticalphabet.com/metadata-tester",
    },
  };
};
