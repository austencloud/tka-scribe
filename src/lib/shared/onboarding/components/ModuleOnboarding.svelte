<!--
  ModuleOnboarding.svelte - Reusable per-module onboarding carousel

  Usage:
  <ModuleOnboarding
    moduleId="discover"
    moduleName="Discover"
    moduleIcon="fa-compass"
    moduleColor="#a855f7"
    welcomeTitle="Welcome to Discover"
    welcomeSubtitle="Explore the TKA community"
    welcomeDescription="Browse sequences from flow artists worldwide..."
    tabs={discoverTabs}
    onTabSelected={(tabId) => handleTabSelected(tabId)}
    onSkip={() => handleSkip()}
  />
-->
<script lang="ts">
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { onMount } from "svelte";
  import type { EmblaCarouselType } from "embla-carousel";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import type { TabInfo } from "../domain/types";

  // Extracted components
  import OnboardingProgressBar from "./OnboardingProgressBar.svelte";
  import OnboardingSkipButton from "./OnboardingSkipButton.svelte";
  import OnboardingNavigation from "./OnboardingNavigation.svelte";
  import WelcomeSlide from "./slides/WelcomeSlide.svelte";
  import TabSlide from "./slides/TabSlide.svelte";
  import ChoiceSlide from "./slides/ChoiceSlide.svelte";

  interface Props {
    moduleId: string;
    moduleName: string;
    moduleIcon: string;
    moduleColor: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeDescription: string;
    tabs: TabInfo[];
    onTabSelected: (tabId: string) => void;
    onSkip?: () => void;
    onChoiceStepReached?: () => void;
  }

  const {
    moduleId,
    moduleName,
    moduleIcon,
    moduleColor,
    welcomeTitle,
    welcomeSubtitle,
    welcomeDescription,
    tabs,
    onTabSelected,
    onSkip,
    onChoiceStepReached,
  }: Props = $props();

  // Services
  let hapticService: IHapticFeedback | null = $state(null);

  // Focus management for choice step
  let focusedChoiceIndex = $state(0);

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          scrollPrev();
          break;
        case "ArrowRight":
          event.preventDefault();
          scrollNext();
          break;
        case "ArrowUp":
          if (isOnChoiceStep) {
            event.preventDefault();
            focusedChoiceIndex = Math.max(0, focusedChoiceIndex - 1);
          }
          break;
        case "ArrowDown":
          if (isOnChoiceStep) {
            event.preventDefault();
            focusedChoiceIndex = Math.min(
              tabs.length - 1,
              focusedChoiceIndex + 1
            );
          }
          break;
        case "Enter":
        case " ":
          const focusedTab = tabs[focusedChoiceIndex];
          if (isOnChoiceStep && focusedTab) {
            event.preventDefault();
            selectTab(focusedTab.id);
          }
          break;
        case "Home":
          event.preventDefault();
          goToStep(0);
          break;
        case "End":
          event.preventDefault();
          goToStep(steps.length - 1);
          break;
        default:
          // Number keys for quick selection
          const num = parseInt(event.key);
          const numTab = tabs[num - 1];
          if (isOnChoiceStep && num >= 1 && num <= tabs.length && numTab) {
            event.preventDefault();
            selectTab(numTab.id);
          }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Build steps array: welcome + tabs + choice
  const steps = $derived([
    {
      type: "welcome" as const,
      icon: moduleIcon,
      title: welcomeTitle,
      subtitle: welcomeSubtitle,
      description: welcomeDescription,
      color: moduleColor,
    },
    ...tabs.map((tab: TabInfo) => ({
      type: "tab" as const,
      id: tab.id,
      icon: tab.icon,
      title: tab.title,
      subtitle: tab.subtitle,
      description: tab.description,
      features: tab.features,
      color: tab.color,
      recommendation: tab.recommendation,
    })),
    {
      type: "choice" as const,
      icon: "fa-rocket",
      title: "Ready to Start!",
      subtitle: `Choose where to begin in ${moduleName}`,
      description: "You can switch between tabs anytime using the navigation.",
      color: moduleColor,
    },
  ]);

  // Embla carousel state
  let emblaApi: EmblaCarouselType | undefined = $state();
  let currentStep = $state(0);
  let canScrollPrev = $state(false);
  let canScrollNext = $state(false);

  function onEmblaInit(event: CustomEvent<EmblaCarouselType>) {
    emblaApi = event.detail;
    emblaApi.on("select", onSelect);
    onSelect();
  }

  function onSelect() {
    if (!emblaApi) return;
    currentStep = emblaApi.selectedScrollSnap();
    canScrollPrev = emblaApi.canScrollPrev();
    canScrollNext = emblaApi.canScrollNext();
  }

  function scrollPrev() {
    hapticService?.trigger("selection");
    emblaApi?.scrollPrev();
  }

  function scrollNext() {
    hapticService?.trigger("selection");
    emblaApi?.scrollNext();
  }

  function goToStep(index: number) {
    hapticService?.trigger("selection");
    emblaApi?.scrollTo(index);
  }

  function selectTab(tabId: string) {
    hapticService?.trigger("selection");
    onTabSelected(tabId);
  }

  function handleSkip() {
    hapticService?.trigger("selection");
    onSkip?.() ?? onTabSelected(tabs[0]?.id ?? "");
  }

  // Derived state
  const step = $derived(steps[currentStep]);
  const progress = $derived((currentStep / (steps.length - 1)) * 100);
  const isOnChoiceStep = $derived(step?.type === "choice");
  const isOnLastTabStep = $derived(currentStep === steps.length - 2);

  // Build step info for navigation dots
  const stepInfos = $derived(
    steps.map((s) => ({
      icon: s.icon,
      title: s.title,
      color: s.color,
    }))
  );

  // Notify parent when choice step is reached (for tab visibility)
  let hasNotifiedChoiceStep = $state(false);
  $effect(() => {
    if (isOnChoiceStep && !hasNotifiedChoiceStep) {
      hasNotifiedChoiceStep = true;
      onChoiceStepReached?.();
    }
  });
</script>

<div
  class="module-onboarding"
  role="region"
  aria-label="{moduleName} module onboarding"
>
  <!-- Screen reader announcement -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    Step {currentStep + 1} of {steps.length}: {step?.title}
  </div>

  <OnboardingProgressBar {currentStep} totalSteps={steps.length} {progress} />

  <OnboardingSkipButton onSkip={handleSkip} />

  <!-- Carousel -->
  <div class="carousel-layout">
    <div
      class="embla"
      use:emblaCarouselSvelte={{ options: { loop: false }, plugins: [] }}
      onemblaInit={onEmblaInit}
    >
      <div class="embla__container">
        {#each steps as stepItem}
          <div class="embla__slide">
            {#if stepItem.type === "welcome"}
              <WelcomeSlide
                icon={stepItem.icon}
                title={stepItem.title}
                subtitle={stepItem.subtitle}
                description={stepItem.description}
                color={stepItem.color}
              />
            {:else if stepItem.type === "tab"}
              <TabSlide
                icon={stepItem.icon}
                title={stepItem.title}
                subtitle={stepItem.subtitle}
                description={stepItem.description}
                features={stepItem.features}
                recommendation={stepItem.recommendation}
                color={stepItem.color}
              />
            {:else if stepItem.type === "choice"}
              <ChoiceSlide
                icon={stepItem.icon}
                title={stepItem.title}
                subtitle={stepItem.subtitle}
                description={stepItem.description}
                color={stepItem.color}
                {tabs}
                focusedIndex={focusedChoiceIndex}
                onTabSelect={selectTab}
                onFocusChange={(i) => (focusedChoiceIndex = i)}
              />
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <OnboardingNavigation
      {moduleId}
      steps={stepInfos}
      {currentStep}
      {canScrollPrev}
      {canScrollNext}
      {isOnChoiceStep}
      {isOnLastTabStep}
      onPrev={scrollPrev}
      onNext={scrollNext}
      onGoToStep={goToStep}
    />
  </div>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .module-onboarding {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .carousel-layout {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
  }

  .embla {
    flex: 1;
    overflow: hidden;
  }

  .embla__container {
    display: flex;
    height: 100%;
  }

  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
