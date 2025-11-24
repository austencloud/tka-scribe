<script lang="ts">
  import { createModalState } from "../state";
  import ResourceModal from "./resource-guide/ResourceModal.svelte";
  import VTGContent from "./resource-guide/VTGContent.svelte";
  import type { ResourceModalData } from "./resource-guide/types";
  // Import new sub-components
  import ResourceFilters from "./resources/ResourceFilters.svelte";
  import ResourceGrid from "./resources/ResourceGrid.svelte";
  import {
    getCategoryDisplayName,
    getLevelDisplayName,
    resources,
    type Resource,
  } from "./resources/resourcesData";

  // Computed stats for dashboard cards
  const stats = $derived({
    total: resources.length,
    learning: resources.filter((r) => r.category === "active-learning").length,
    community: resources.filter((r) => r.category === "active-community").length,
    vendors: resources.filter((r) => r.category === "vendors").length,
    archives: resources.filter((r) => r.category === "historical-archives").length,
  });

  // State
  let searchTerm = $state("");
  let selectedCategory = $state("all");
  let selectedLevel = $state("all");

  // Modal state
  const modalState = createModalState();

  // Computed filtered resources
  let filteredResources = $derived.by(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        searchTerm === "" ||
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.specialties &&
          resource.specialties.some((s) =>
            s.toLowerCase().includes(searchTerm.toLowerCase())
          ));
      const matchesCategory =
        selectedCategory === "all" || resource.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || resource.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  });

  // Modal handlers
  function handleOpenModal(resource: Resource) {
    if (resource.hasLandingPage && resource.landingPageUrl) {
      const resourceName = resource.landingPageUrl.split("/").pop();
      if (resourceName) {
        openResourceModal(resourceName, resource);
      }
    }
  }

  function openResourceModal(resourceName: string, resource: Resource) {
    modalState.openModal(resourceName);

    const modalData: ResourceModalData = getModalDataForResource(
      resourceName,
      resource
    );
    modalState.setModalData(modalData);
  }

  function getModalDataForResource(
    resourceName: string,
    resource: Resource
  ): ResourceModalData {
    return {
      title: resource.name,
      subtitle: resource.description,
      creator: getCreatorForResource(resourceName, resource),
      category: getCategoryDisplayName(resource.category),
      level: getLevelDisplayName(resource.level),
      description: resource.value,
      keywords: getKeywordsForResource(resourceName),
      url: resource.url,
      resourceName: resourceName,
      tableOfContents: getTableOfContentsForResource(resourceName),
      relatedResources: getRelatedResourcesForResource(resourceName),
      heroGradient: getHeroGradientForResource(resourceName, resource),
      creatorColor: getCreatorColorForResource(resourceName, resource),
    };
  }

  function getCreatorForResource(
    resourceName: string,
    resource: Resource
  ): string {
    if (resource.status === "vendor") {
      return `Founded ${resource.foundingYear} • ${resource.companyLocation}`;
    }
    if (resource.status === "historical") {
      return `Last Updated: ${resource.lastUpdated}`;
    }
    switch (resourceName) {
      case "vulcan-tech-gospel":
        return "Noel Yee";
      case "charlie-cushing-9-square-theory":
        return "Charlie Cushing";
      default:
        return "Community Resource";
    }
  }

  function getKeywordsForResource(resourceName: string): string {
    switch (resourceName) {
      case "vulcan-tech-gospel":
        return "Vulcan Tech Gospel, VTG, poi theory, Noel Yee, poi flowers, transition theory, technical poi, flow arts theory";
      case "charlie-cushing-9-square-theory":
        return "9 square theory, Charlie Cushing, poi theory, unit circles, technical poi, helicopter pilot, LanternSmith, advanced poi, spatial relationships";
      default:
        return "flow arts, poi, theory, tutorial";
    }
  }

  function getTableOfContentsForResource(
    resourceName: string
  ): Array<{ id: string; label: string }> {
    switch (resourceName) {
      case "vulcan-tech-gospel":
        return [
          { id: "overview", label: "Overview" },
          { id: "key-concepts", label: "Key Concepts" },
          { id: "getting-started", label: "Getting Started" },
          { id: "advanced-applications", label: "Advanced Applications" },
          { id: "community-impact", label: "Community Impact" },
          { id: "official-resources", label: "Official Resources" },
        ];
      case "charlie-cushing-9-square-theory":
        return [
          { id: "overview", label: "Overview" },
          { id: "creator-background", label: "Creator Background" },
          { id: "key-concepts", label: "Key Concepts" },
          { id: "getting-started", label: "Getting Started" },
          { id: "advanced-applications", label: "Advanced Applications" },
          { id: "official-resources", label: "Official Resources" },
        ];
      default:
        return [];
    }
  }

  function getRelatedResourcesForResource(resourceName: string): Array<{
    name: string;
    url: string;
    description: string;
    type: "internal" | "external";
  }> {
    switch (resourceName) {
      case "vulcan-tech-gospel":
        return [
          {
            name: "Charlie Cushing's 9 Square Theory",
            url: "/about#charlie-cushing-9-square-theory",
            description:
              "Advanced framework building upon VTG principles for connecting unit circles",
            type: "internal",
          },
          {
            name: "Noel Yee's Official VTG Resources",
            url: "https://noelyee.com/instruction/vulcan-tech-gospel/",
            description:
              "Original VTG documentation and tutorials by the creator",
            type: "external",
          },
        ];
      default:
        return [];
    }
  }

  function getHeroGradientForResource(
    resourceName: string,
    resource: Resource
  ): string {
    switch (resource.category) {
      case "vendors":
        return "linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)";
      case "historical-archives":
        return "linear-gradient(135deg, rgba(158, 158, 158, 0.05) 0%, rgba(117, 117, 117, 0.05) 100%)";
      default:
        return "linear-gradient(135deg, rgba(168, 28, 237, 0.05) 0%, rgba(74, 144, 226, 0.05) 100%)";
    }
  }

  function getCreatorColorForResource(
    resourceName: string,
    resource: Resource
  ): string {
    switch (resource.category) {
      case "vendors":
        return "#4caf50";
      case "historical-archives":
        return "#757575";
      default:
        return "var(--primary-color)";
    }
  }
</script>

<!-- Resources & Links Section -->
<section class="resources-links">
  <div class="resources-content">
    <!-- Dashboard Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h2><i class="fas fa-book-open"></i> Flow Arts Historian</h2>
        <p class="subtitle">
          Educational resources, community platforms, equipment vendors, and
          historical archives from the flow arts scene.
        </p>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" style="--accent-color: #3b82f6">
        <div class="stat-icon">
          <i class="fas fa-database"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.total}</span>
          <span class="stat-label">Total Resources</span>
        </div>
      </div>
      <div class="stat-card" style="--accent-color: #10b981">
        <div class="stat-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.learning}</span>
          <span class="stat-label">Learning</span>
        </div>
      </div>
      <div class="stat-card" style="--accent-color: #8b5cf6">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.community}</span>
          <span class="stat-label">Community</span>
        </div>
      </div>
      <div class="stat-card" style="--accent-color: #f59e0b">
        <div class="stat-icon">
          <i class="fas fa-store"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{stats.vendors}</span>
          <span class="stat-label">Vendors</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-wrapper">
      <ResourceFilters
        bind:searchTerm
        bind:selectedCategory
        bind:selectedLevel
        resultsCount={filteredResources.length}
      />
    </div>

    <ResourceGrid resources={filteredResources} onOpenModal={handleOpenModal} />
  </div>
</section>

<!-- Resource Modal -->
<ResourceModal
  isOpen={modalState.isOpen}
  modalData={modalState.modalData}
  onClose={() => modalState.closeModal()}
>
  {#if modalState.resourceName === "vulcan-tech-gospel"}
    <VTGContent />
  {:else if modalState.resourceName === "charlie-cushing-9-square-theory"}
    <div class="placeholder-content">
      <p>9 Square Theory content coming soon...</p>
    </div>
  {/if}
</ResourceModal>

<style>
  /* Resources Section */
  .resources-links {
    padding: 24px;
    position: relative;
  }

  .resources-content {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Dashboard Header - Admin Style */
  .dashboard-header {
    margin-bottom: 24px;
  }

  .dashboard-header h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dashboard-header h2 i {
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
  }

  .subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    max-width: 700px;
    line-height: 1.6;
    margin: 0;
  }

  /* Stats Grid - Admin Style */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--accent-color) 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-size: 20px;
    flex-shrink: 0;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 255, 255, 0.95);
  }

  .stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Filters Wrapper - Admin Style */
  .filters-wrapper {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .placeholder-content {
    padding: 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Mobile responsive */
  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .resources-links {
      padding: 16px;
    }

    .dashboard-header h2 {
      font-size: 20px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-card {
      padding: 16px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .stat-value {
      font-size: 22px;
    }

    .stat-label {
      font-size: 12px;
    }

    .filters-wrapper {
      padding: 16px;
      border-radius: 10px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .stat-card {
      padding: 12px;
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      margin: 0 auto;
    }

    .stat-value {
      font-size: 20px;
    }
  }
</style>
