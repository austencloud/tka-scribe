<script lang="ts">
	import HeroSection from './components/HeroSection.svelte';
	import WhatIsTKASection from './components/WhatIsTKASection.svelte';
	import FeaturesSection from './components/FeaturesSection.svelte';
	import NotationSection from './components/NotationSection.svelte';
	import LOOPsSection from './components/LOOPsSection.svelte';
	import PropsSection from './components/PropsSection.svelte';
	import EducatorsSection from './components/EducatorsSection.svelte';
	import LandingFooter from './components/LandingFooter.svelte';
</script>

<svelte:head>
	<title>The Kinetic Alphabet - Digital Sheet Music for Flow Arts</title>
	<meta
		name="description"
		content="Create, animate, and share prop manipulation sequences with the first universal notation system for flow arts."
	/>
</svelte:head>

<div class="landing-page">
	<HeroSection />
	<WhatIsTKASection />
	<FeaturesSection />
	<NotationSection />
	<LOOPsSection />
	<PropsSection />
	<EducatorsSection />
	<LandingFooter />
</div>

<style>
	.landing-page {
		--primary: #6366f1;
		--primary-light: #818cf8;
		--bg-dark: #0a0a0f;
		--bg-card: rgba(255, 255, 255, 0.03);
		--bg-card-hover: rgba(255, 255, 255, 0.06);
		--text: #ffffff;
		--text-muted: rgba(255, 255, 255, 0.6);
		--border: rgba(255, 255, 255, 0.1);
		--border-strong: rgba(255, 255, 255, 0.2);

		font-family: system-ui, -apple-system, sans-serif;
		background: var(--bg-dark);
		color: var(--text);
		line-height: 1.6;
		overflow-x: hidden;
	}
</style>
