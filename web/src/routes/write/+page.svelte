<!-- SEO-Optimized WRITE Page with Enhanced Meta Data -->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  let { data } = $props<{
    data: PageData;
  }>();

  // Simple redirect without DI container to avoid SSR issues
  onMount(() => {
    if (browser) {
      // Direct redirect to main app with word_card tab
      const params = new URLSearchParams();
      params.set("tab", "word_card");
      window.location.href = `/?${params.toString()}`;
    }
  });

  // Structured data for enhanced SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Flow Arts Composer - Advanced Editor",
    description:
      "Professional composition tool for creating complex flow arts sequences and advanced movement patterns.",
    url: "https://thekineticalphabet.com/write",
    isPartOf: {
      "@type": "WebSite",
      name: "TKA - The Kinetic Constructor",
      url: "https://thekineticalphabet.com",
    },
    creator: {
      "@type": "SoftwareApplication",
      name: "TKA - The Kinetic Constructor",
    },
  };
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta property="og:title" content={data.meta.ogTitle} />
  <meta property="og:description" content={data.meta.ogDescription} />
  <meta property="og:type" content={data.meta.ogType} />
  <meta property="og:url" content={data.meta.ogUrl} />
  <meta property="og:site_name" content="TKA - The Kinetic Constructor" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.ogTitle} />
  <meta name="twitter:description" content={data.meta.ogDescription} />
  <link rel="canonical" href={data.meta.canonical} />

  <!-- Enhanced Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<!-- SEO content for crawlers, users will be redirected -->
<div class="seo-content">
  <h1>Flow Arts Composer - Advanced Editor</h1>
  <p>Professional composition tool for creating complex flow arts sequences and advanced movement patterns.</p>
  <p>Redirecting to the main application...</p>
</div>
