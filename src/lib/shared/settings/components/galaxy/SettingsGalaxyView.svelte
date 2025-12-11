<script lang="ts">
  import SettingsCategoryCard from "./SettingsCategoryCard.svelte";
  import type { AppSettings } from "../../domain/AppSettings";
  import {
    getPropTypeDisplayInfo,
    findPropTypeByValue,
  } from "../tabs/prop-type/PropTypeRegistry";
  import { getBackgroundConfig } from "../tabs/background/background-config";
  import { BackgroundType } from "../../../background/shared/domain/enums/background-enums";
  import { authStore } from "../../../auth/stores/authStore.svelte";

  /**
   * Get user-friendly display name for a prop type value
   */
  function formatPropTypeName(propTypeValue: string | undefined): string {
    if (!propTypeValue) return "Staff";
    const propType = findPropTypeByValue(propTypeValue);
    if (propType) {
      return getPropTypeDisplayInfo(propType).label;
    }
    // Fallback: capitalize first letter if not found in registry
    return propTypeValue.charAt(0).toUpperCase() + propTypeValue.slice(1);
  }

  /**
   * Get user-friendly display name for a background type value
   */
  function formatBackgroundName(backgroundType: string | undefined): string {
    if (!backgroundType) return "Night Sky";
    const config = getBackgroundConfig(backgroundType as BackgroundType);
    if (config) {
      return config.name;
    }
    // Fallback: convert camelCase to Title Case
    return backgroundType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  interface CategoryConfig {
    id: string;
    title: string;
    icon: string;
    color: string;
    gradient: string;
    getStatusText: (settings: AppSettings) => string;
  }

  interface Props {
    settings: AppSettings;
    onCategorySelect: (categoryId: string) => void;
  }

  let { settings, onCategorySelect }: Props = $props();

  // Category configurations with colors, gradients, and FontAwesome icons
  const categories: CategoryConfig[] = [
    {
      id: "Profile",
      title: "Profile",
      icon: '<i class="fas fa-user"></i>',
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      getStatusText: () =>
        authStore.isAuthenticated ? "Signed in" : "Sign in",
    },
    {
      id: "PropType",
      title: "Prop Type",
      icon: '<i class="fas fa-tags"></i>',
      color: "#ec4899",
      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
      getStatusText: (s) => {
        if (s.catDogMode) {
          const blue = formatPropTypeName(s.bluePropType || s.propType);
          const red = formatPropTypeName(s.redPropType || s.propType);
          return `${blue} / ${red}`;
        }
        return formatPropTypeName(s.propType);
      },
    },
    {
      id: "Background",
      title: "Background",
      icon: '<i class="fas fa-image"></i>',
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      getStatusText: (s) => formatBackgroundName(s.backgroundType),
    },
    {
      id: "Visibility",
      title: "Visibility",
      icon: '<i class="fas fa-eye"></i>',
      color: "#22c55e",
      gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      getStatusText: () => {
        // TODO: Count visible elements from visibility settings
        return "5 shown";
      },
    },
    {
      id: "Keyboard",
      title: "Keyboard",
      icon: '<i class="fas fa-keyboard"></i>',
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      getStatusText: (s) => {
        const singleKey = s.singleKeyShortcuts ?? true;
        return singleKey ? "All shortcuts" : "Modifier only";
      },
    },
    {
      id: "Accessibility",
      title: "Miscellaneous",
      icon: '<i class="fas fa-sliders-h"></i>',
      color: "#f97316",
      gradient: "linear-gradient(135deg, #f97316, #ea580c)",
      getStatusText: (s) => {
        const haptic = s.hapticFeedback ?? true;
        return `Haptic ${haptic ? "ON" : "OFF"}`;
      },
    },
  ];
</script>

<div class="settings-galaxy">
  <div class="galaxy-header">
    <h1 class="galaxy-title">Settings</h1>
    <p class="galaxy-subtitle">Customize your experience</p>
  </div>

  <div class="galaxy-grid">
    {#each categories as category, index}
      <SettingsCategoryCard
        id={category.id}
        title={category.title}
        icon={category.icon}
        color={category.color}
        gradient={category.gradient}
        statusText={category.getStatusText(settings)}
        {index}
        onclick={() => onCategorySelect(category.id)}
        avatarUrl={category.id === "Profile" && authStore.isAuthenticated
          ? authStore.user?.photoURL
          : undefined}
      />
    {/each}
  </div>
</div>

<style>
  .settings-galaxy {
    --panel-spacing: clamp(12px, 4cqi, 20px);

    width: 100%;
    height: 100%;
    padding: var(--panel-spacing);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    container-type: size;
    container-name: galaxy;
  }

  /* Header */
  .galaxy-header {
    text-align: center;
    margin-bottom: var(--panel-spacing);
    flex-shrink: 0;
  }

  .galaxy-title {
    font-size: clamp(1.125rem, 5cqi, 1.5rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
  }

  .galaxy-subtitle {
    font-size: clamp(0.6875rem, 3cqi, 0.8125rem);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Grid - cards at natural height, centered in available space */
  .galaxy-grid {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--panel-spacing);
    width: 100%;
    flex: 1;
    min-height: 0;
  }
</style>
