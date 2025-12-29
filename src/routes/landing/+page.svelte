<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade, scale } from "svelte/transition";
	import { cubicOut, backOut } from "svelte/easing";
	import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
	import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
	import type { IAnimationPlaybackController } from "$lib/features/compose/services/contracts/IAnimationPlaybackController";
	import type { ISequenceRepository } from "$lib/features/create/shared/services/contracts/ISequenceRepository";
	import type { IStartPositionDeriver } from "$lib/shared/pictograph/shared/services/contracts/IStartPositionDeriver";
	import { createAnimationPanelState } from "$lib/features/compose/state/animation-panel-state.svelte";
	import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
	import { TYPES } from "$lib/shared/inversify/types";
	import { animationSettings, TrackingMode } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";
	import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
	import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";

	// Transition key - changes trigger the crossfade animation
	let transitionKey = $state(0);

	// Curated sequences: 8 and 16-beat strict_rotated LOOPs
	// These showcase impressive bilateral choreography with smooth circular looping
	const SHOWCASE_SEQUENCES = [
		// 8-beat
		"BJEA", "DΨ", "JΦ", "EΔUZ", "ΩZ", "Ψ-H",
		// 16-beat
		"KIΦC", "IΦAJ",
	];

	// Props to randomize between - popular prop types
	const RANDOM_PROPS = [
		PropType.STAFF,
		PropType.BUUGENG,
		PropType.FAN,
		PropType.TRIAD,
		PropType.CLUB,
		PropType.MINIHOOP,
	];

	// Animation state
	const animationState = createAnimationPanelState();
	let playbackController: IAnimationPlaybackController | null = null;
	let sequenceService: ISequenceRepository | null = null;
	let startPositionDeriver: IStartPositionDeriver | null = null;
	let servicesReady = $state(false);
	let animationReady = $state(false);
	let animationError = $state(false);
	let isLoading = $state(false);

	// Current selection state
	let currentSequenceIndex = $state(0);
	let currentPropType = $state<PropType>(RANDOM_PROPS[0]);

	// Derived values
	let currentWord = $derived(SHOWCASE_SEQUENCES[currentSequenceIndex]);

	// Derived start position - uses service to derive from first beat if not stored
	// Must be defined before currentLetter/currentBeatData which depend on it
	let derivedStartPosition = $derived.by(() => {
		if (!animationState.sequenceData || !startPositionDeriver) return null;
		return startPositionDeriver.getOrDeriveStartPosition(animationState.sequenceData);
	});

	// Current beat data for AnimatorCanvas
	// Animation uses 1-indexed currentBeat: 1-2 = beat 1, 2-3 = beat 2
	// But beats array is 0-indexed: beats[0] = beat 1, beats[1] = beat 2
	// So we need beatIndex = Math.floor(currentBeat) - 1
	let currentLetter = $derived.by(() => {
		if (!animationState.sequenceData) return null;
		const currentBeat = animationState.currentBeat;

		// Start position: currentBeat < 1
		if (currentBeat < 1) {
			return derivedStartPosition?.letter || null;
		}

		if (animationState.sequenceData.beats?.length > 0) {
			const beatIndex = Math.floor(currentBeat) - 1; // Convert 1-indexed to 0-indexed
			const clampedIndex = Math.max(0, Math.min(beatIndex, animationState.sequenceData.beats.length - 1));
			return animationState.sequenceData.beats[clampedIndex]?.letter || null;
		}

		return null;
	});

	let currentBeatData = $derived.by(() => {
		if (!animationState.sequenceData) return null;
		const currentBeat = animationState.currentBeat;

		// Start position: currentBeat < 1
		if (currentBeat < 1) {
			return derivedStartPosition || null;
		}

		if (animationState.sequenceData.beats?.length > 0) {
			const beatIndex = Math.floor(currentBeat) - 1; // Convert 1-indexed to 0-indexed
			const clampedIndex = Math.max(0, Math.min(beatIndex, animationState.sequenceData.beats.length - 1));
			return animationState.sequenceData.beats[clampedIndex] || null;
		}

		return null;
	});

	let gridMode = $derived(animationState.sequenceData?.gridMode ?? null);

	// Current beat number for beat grid highlighting
	// Animation uses 1-indexed beats: currentBeat 1-2 = beat 1, currentBeat 2-3 = beat 2, etc.
	// Start position is currentBeat < 1, which floors to 0
	let currentBeatNumber = $derived(Math.floor(animationState.currentBeat));

	// Load and start animation on mount
	onMount(async () => {
		try {
			// Configure trail settings for demo - track both ends of bilateral props
			animationSettings.setTrackingMode(TrackingMode.BOTH_ENDS);

			await loadFeatureModule("animate");
			sequenceService = resolve<ISequenceRepository>(TYPES.ISequenceRepository);
			playbackController = resolve<IAnimationPlaybackController>(TYPES.IAnimationPlaybackController);
			startPositionDeriver = resolve<IStartPositionDeriver>(TYPES.IStartPositionDeriver);
			servicesReady = true;

			// Load initial sequence
			await loadSequence(SHOWCASE_SEQUENCES[0]);

		} catch (err) {
			console.error("Failed to load hero animation:", err);
			animationError = true;
		}
	});

	onDestroy(() => {
		playbackController?.dispose();
		animationState.dispose();
	});

	async function loadSequence(word: string, propType?: PropType) {
		if (!sequenceService || !playbackController) return;

		// Trigger transition animation
		transitionKey++;
		isLoading = true;
		animationReady = false;

		try {
			// Stop current playback
			if (animationState.isPlaying) {
				playbackController.togglePlayback();
			}
			animationState.reset();

			// Load sequence
			let sequence = await sequenceService.getSequence(word);
			if (!sequence) {
				throw new Error(`Failed to load sequence: ${word}`);
			}

			// Apply prop type override if specified
			if (propType) {
				sequence = { ...sequence, propType } as SequenceData;
			}

			// Initialize playback
			animationState.setShouldLoop(true);
			const success = playbackController.initialize(sequence, animationState);

			if (!success) {
				throw new Error("Failed to initialize playback");
			}

			animationReady = true;
			isLoading = false;

			// Skip start position - seek directly to beat 1 and start playing
			animationState.setCurrentBeat(1);
			playbackController?.togglePlayback();

		} catch (err) {
			console.error("Failed to load sequence:", err);
			animationError = true;
			isLoading = false;
		}
	}

	function handleRandomize() {
		// Pick a random sequence different from current
		let newSequenceIndex = currentSequenceIndex;
		while (newSequenceIndex === currentSequenceIndex && SHOWCASE_SEQUENCES.length > 1) {
			newSequenceIndex = Math.floor(Math.random() * SHOWCASE_SEQUENCES.length);
		}
		currentSequenceIndex = newSequenceIndex;

		// Pick a random prop type
		const newPropType = RANDOM_PROPS[Math.floor(Math.random() * RANDOM_PROPS.length)];
		currentPropType = newPropType;

		loadSequence(SHOWCASE_SEQUENCES[newSequenceIndex], newPropType);
	}

	// Feature cards data
	const features = [
		{
			icon: '✏️',
			title: 'Create',
			description: 'Build sequences three ways: Assemble for beginners, Construct for full control, or Generate with algorithmic LOOPs.',
			color: '#6366f1'
		},
		{
			icon: '🎬',
			title: 'Animate',
			description: 'Watch sequences come alive with real-time 2D visualization, motion trails, and video export.',
			color: '#ec4899'
		},
		{
			icon: '🔍',
			title: 'Discover',
			description: 'Browse thousands of community sequences, follow creators, and share your work.',
			color: '#14b8a6'
		},
		{
			icon: '📚',
			title: 'Learn',
			description: '28 structured concepts from grid basics to advanced LOOPs, with interactive quizzes.',
			color: '#f59e0b'
		},
		{
			icon: '🎯',
			title: 'Train',
			description: 'Practice with ML-powered scoring, daily challenges, and three training modes.',
			color: '#ef4444'
		},
		{
			icon: '📤',
			title: 'Share',
			description: 'Export to PNG, PDF, GIF, or video. Share links directly to Instagram.',
			color: '#8b5cf6'
		}
	];

	const props = [
		'Staff', 'Fan', 'Hoop', 'Buugeng', 'Triad', 'Club',
		'Sword', 'Double Star', 'Eight Rings', 'Guitar', 'Quiad'
	];

	const loopTypes = [
		{ name: 'Rotated', desc: '90° or 180° around grid' },
		{ name: 'Mirrored', desc: 'Vertical reflection' },
		{ name: 'Swapped', desc: 'Exchange hand roles' },
		{ name: 'Inverted', desc: 'Opposite motion types' },
		{ name: 'Combinations', desc: 'Stack transformations' }
	];
</script>

<svelte:head>
	<title>The Kinetic Alphabet - Digital Sheet Music for Flow Arts</title>
	<meta name="description" content="Create, animate, and share prop manipulation sequences with the first universal notation system for flow arts." />
</svelte:head>

<div class="landing-page">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-bg">
			<div class="grid-lines"></div>
			<div class="glow glow-1"></div>
			<div class="glow glow-2"></div>
		</div>

		<div class="hero-content">
			<div class="badge">Free & Open</div>
			<h1>The Kinetic Alphabet</h1>
			<p class="tagline">Digital Sheet Music for Flow Arts</p>
			<p class="subtitle">
				Create, animate, and share prop manipulation sequences with the first universal notation system for flow arts.
			</p>

			<div class="hero-cta">
				<a href="/" class="btn btn-primary">
					Open TKA Scribe
					<span class="arrow">→</span>
				</a>
				<a href="#features" class="btn btn-secondary">
					Learn More
				</a>
			</div>

			<!-- Real Animation Preview with Beat Grid -->
			<div class="hero-visual">
				{#key transitionKey}
					<div
						class="demo-transition-wrapper"
						in:scale={{ duration: 350, delay: 100, start: 0.95, opacity: 0, easing: backOut }}
						out:scale={{ duration: 200, start: 0.98, opacity: 0, easing: cubicOut }}
					>
						<div class="demo-layout">
							<!-- Word Label - spans full width above both panels -->
							<div class="word-label-row">
								<span class="word-text">{currentWord || "A"}</span>
							</div>

							<!-- Content Row: Animation + Beat Grid side by side -->
							<div class="demo-content-row">
								<!-- Animation Canvas -->
								<div class="animation-preview">
									{#if animationReady && !isLoading}
										<div class="canvas-wrapper">
											<AnimatorCanvas
												blueProp={animationState.bluePropState}
												redProp={animationState.redPropState}
												gridVisible={true}
												{gridMode}
												letter={currentLetter}
												beatData={currentBeatData}
												sequenceData={animationState.sequenceData}
												isPlaying={animationState.isPlaying}
												trailSettings={animationSettings.trail}
											/>
										</div>
									{:else if animationError}
										<div class="animation-fallback">
											<div class="fallback-icon">🌀</div>
											<span>Animation Preview</span>
										</div>
									{:else}
										<div class="animation-loading">
											<div class="spinner"></div>
											<span>{isLoading ? "Loading..." : "Initializing..."}</span>
										</div>
									{/if}
								</div>

								<!-- Beat Grid -->
								{#if animationState.sequenceData}
									<div class="beat-grid-panel">
										<BeatGrid
											beats={animationState.sequenceData.beats}
											startPosition={derivedStartPosition}
											selectedBeatNumber={currentBeatNumber}
										/>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/key}

				<!-- Randomize Button - outside transition so it stays visible -->
				<button
					class="randomize-btn"
					onclick={handleRandomize}
					disabled={!servicesReady || isLoading}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
					</svg>
					<span>Try Another</span>
				</button>
			</div>
		</div>
	</section>

	<!-- What is TKA Section -->
	<section class="what-is" id="what">
		<div class="container">
			<h2>What is TKA?</h2>
			<p class="lead">
				<strong>The Kinetic Alphabet is to flow arts what musical notation is to music.</strong>
			</p>

			<div class="comparison-grid">
				<div class="comparison-card">
					<div class="icon">🎵</div>
					<h3>Music Has Sheet Music</h3>
					<p>Musicians read, write, and share compositions through standard notation.</p>
				</div>
				<div class="comparison-card">
					<div class="icon">🌀</div>
					<h3>Flow Arts Has TKA</h3>
					<p>Flow artists document, share, and learn choreography through pictographs.</p>
				</div>
			</div>

			<div class="benefits">
				<div class="benefit">
					<span class="check">✓</span>
					<span>Document complex sequences precisely</span>
				</div>
				<div class="benefit">
					<span class="check">✓</span>
					<span>Share choreography with anyone, anywhere</span>
				</div>
				<div class="benefit">
					<span class="check">✓</span>
					<span>Learn from the global flow community</span>
				</div>
				<div class="benefit">
					<span class="check">✓</span>
					<span>Animate sequences to see them in motion</span>
				</div>
				<div class="benefit">
					<span class="check">✓</span>
					<span>Train with real-time scoring and feedback</span>
				</div>
			</div>

			<blockquote>
				No more trying to describe "that spinny thing where your hands cross and then... you know, the thing."
				<br />
				<strong>With TKA, every movement has a name, a symbol, and a visual representation.</strong>
			</blockquote>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features" id="features">
		<div class="container">
			<h2>Meet TKA Scribe</h2>
			<p class="section-intro">
				The free web app that brings The Kinetic Alphabet to life.
			</p>

			<div class="features-grid">
				{#each features as feature}
					<div class="feature-card" style="--accent: {feature.color}">
						<div class="feature-icon">{feature.icon}</div>
						<h3>{feature.title}</h3>
						<p>{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Notation System Section -->
	<section class="notation" id="notation">
		<div class="container">
			<h2>The Notation System</h2>
			<p class="section-intro">
				Every beat of movement becomes a <strong>pictograph</strong> — a visual diagram showing exactly where your hands are and how they move.
			</p>

			<div class="notation-grid">
				<div class="notation-card">
					<h3>What a Pictograph Captures</h3>
					<ul>
						<li>Hand positions on a grid (Diamond or Box mode)</li>
						<li>Motion type (Prospin, Antispin, Float, Dash, Static)</li>
						<li>Direction (Clockwise or Counter-clockwise)</li>
						<li>Number of turns (0.5, 1, 1.5, 2, etc.)</li>
						<li>Reversals and variations</li>
					</ul>
				</div>

				<div class="notation-card">
					<h3>Position Types</h3>
					<div class="position-types">
						<div class="position">
							<span class="greek">α</span>
							<span class="name">Alpha</span>
							<span class="desc">Hands across from each other</span>
						</div>
						<div class="position">
							<span class="greek">β</span>
							<span class="name">Beta</span>
							<span class="desc">Hands at same point</span>
						</div>
						<div class="position">
							<span class="greek">γ</span>
							<span class="name">Gamma</span>
							<span class="desc">Hands form right angle</span>
						</div>
					</div>
				</div>

				<div class="notation-card wide">
					<h3>The Letter System</h3>
					<p>Each fundamental motion has a letter. Combine letters into "words" — multi-beat patterns that become your choreographic vocabulary.</p>
					<div class="letter-types">
						<div class="letter-type">
							<span class="range">A–V</span>
							<span class="label">Type 1: Both hands shift together</span>
						</div>
						<div class="letter-type">
							<span class="range">W–Ω</span>
							<span class="label">Type 2: One shifts, one stays</span>
						</div>
						<div class="letter-type">
							<span class="range">Φ Ψ Λ</span>
							<span class="label">Type 3–6: Advanced combinations</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- LOOPs Section -->
	<section class="loops" id="loops">
		<div class="container">
			<h2>LOOPs: Algorithmic Composition</h2>
			<p class="section-intro">
				<strong>LOOPs (Linked Offset Operation Patterns)</strong> are transformations that generate circular sequences automatically.
			</p>

			<div class="loop-explanation">
				<div class="loop-flow">
					<div class="flow-step">
						<div class="step-num">1</div>
						<div class="step-text">Start with one beat</div>
					</div>
					<div class="flow-arrow">→</div>
					<div class="flow-step">
						<div class="step-num">2</div>
						<div class="step-text">Apply a LOOP</div>
					</div>
					<div class="flow-arrow">→</div>
					<div class="flow-step">
						<div class="step-num">3</div>
						<div class="step-text">Get a full circular sequence</div>
					</div>
				</div>
			</div>

			<div class="loop-types">
				<h3>13 LOOP Types</h3>
				<div class="loop-grid">
					{#each loopTypes as loop}
						<div class="loop-card">
							<span class="loop-name">{loop.name}</span>
							<span class="loop-desc">{loop.desc}</span>
						</div>
					{/each}
				</div>
			</div>

			<p class="loop-cta">
				This is where TKA becomes a <strong>generative tool</strong> — not just documenting what you already know, but discovering patterns you've never tried.
			</p>
		</div>
	</section>

	<!-- Props Section -->
	<section class="props-section" id="props">
		<div class="container">
			<h2>30+ Supported Props</h2>
			<p class="section-intro">
				TKA Scribe works with virtually every flow prop — both unilateral (one-handed) and bilateral (two-handed).
			</p>

			<div class="props-showcase">
				{#each props as prop}
					<div class="prop-tag">{prop}</div>
				{/each}
				<div class="prop-tag more">+ many more</div>
			</div>
		</div>
	</section>

	<!-- For Educators Section -->
	<section class="educators" id="educators">
		<div class="container">
			<h2>For Educators</h2>
			<p class="section-intro">
				TKA transforms how flow arts can be taught.
			</p>

			<div class="educator-grid">
				<div class="educator-card">
					<div class="edu-icon">📋</div>
					<h3>Curriculum Structure</h3>
					<p>Progress from Grid basics to advanced LOOPs with 28 concepts.</p>
				</div>
				<div class="educator-card">
					<div class="edu-icon">👁️</div>
					<h3>Visual Learning</h3>
					<p>See exactly what "antispin flower" means — no guessing.</p>
				</div>
				<div class="educator-card">
					<div class="edu-icon">📝</div>
					<h3>Assignments</h3>
					<p>Assign sequences, track completion, give feedback.</p>
				</div>
				<div class="educator-card">
					<div class="edu-icon">🌍</div>
					<h3>Remote Teaching</h3>
					<p>Share notated sequences with students anywhere in the world.</p>
				</div>
			</div>

			<blockquote class="educator-quote">
				Stop demonstrating the same move 50 times. Show them the pictograph.
			</blockquote>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="final-cta">
		<div class="container">
			<h2>Open & Free</h2>
			<p>
				<strong>TKA Scribe is free to use.</strong> No download required — it runs in your browser.
			</p>
			<p class="small">
				The underlying notation system is open. Create educational content, build tools, expand the community.
			</p>

			<a href="/" class="btn btn-primary btn-large">
				Open TKA Scribe
				<span class="arrow">→</span>
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="landing-footer">
		<div class="container">
			<div class="footer-content">
				<div class="footer-brand">
					<strong>The Kinetic Alphabet</strong>
					<span>Digital Sheet Music for Flow Arts</span>
				</div>
				<div class="footer-links">
					<a href="/">App</a>
					<a href="#features">Features</a>
					<a href="#notation">Notation</a>
					<a href="#loops">LOOPs</a>
				</div>
			</div>
			<div class="footer-note">
				<p>
					TKA draws inspiration from Vulcan Tech Gospel (VTG), Siteswap juggling notation, and music theory.
					It extends beyond VTG by supporting non-continuous patterns, static props, and complex multi-beat sequences.
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Reset & Base */
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

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	h1, h2, h3 {
		font-weight: 600;
		line-height: 1.2;
	}

	h2 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-bottom: 1rem;
		text-align: center;
	}

	.section-intro {
		text-align: center;
		font-size: 1.125rem;
		color: var(--text-muted);
		max-width: 700px;
		margin: 0 auto 3rem;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 28px;
		border-radius: 12px;
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--primary-light);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
	}

	.btn-secondary {
		background: var(--bg-card);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--bg-card-hover);
		border-color: var(--border-strong);
	}

	.btn-large {
		padding: 18px 36px;
		font-size: 1.125rem;
	}

	.arrow {
		transition: transform 0.2s ease;
	}

	.btn:hover .arrow {
		transform: translateX(4px);
	}

	/* Hero Section */
	.hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80px 24px;
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.grid-lines {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
		background-size: 60px 60px;
	}

	.glow {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		opacity: 0.4;
	}

	.glow-1 {
		width: 600px;
		height: 600px;
		background: var(--primary);
		top: -200px;
		right: -200px;
	}

	.glow-2 {
		width: 400px;
		height: 400px;
		background: #ec4899;
		bottom: -100px;
		left: -100px;
	}

	.hero-content {
		position: relative;
		text-align: center;
		max-width: 800px;
	}

	.badge {
		display: inline-block;
		padding: 6px 16px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 100px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--primary-light);
		margin-bottom: 24px;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		margin-bottom: 8px;
		background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		color: var(--primary-light);
		margin-bottom: 16px;
		font-weight: 500;
	}

	.subtitle {
		font-size: 1.125rem;
		color: var(--text-muted);
		max-width: 600px;
		margin: 0 auto 32px;
	}

	.hero-cta {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 48px;
	}

	/* Hero Visual / Real Animation */
	.hero-visual {
		margin-top: clamp(24px, 5vw, 48px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(16px, 3vw, 24px);
		width: 100%;
		container-type: inline-size;
		/* Container for absolute positioned transition children */
		position: relative;
		min-height: clamp(380px, 50cqw, 520px);
	}

	/* Wrapper for keyed transition - needs absolute positioning for crossfade */
	.demo-transition-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.demo-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(12px, 2cqw, 20px);
		width: 100%;
		max-width: 900px;
	}

	/* Word Label Row - spans full width, centered */
	.word-label-row {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.word-label-row .word-text {
		font-family: Georgia, serif;
		font-size: clamp(1.5rem, 5cqw, 2.5rem);
		font-weight: 600;
		color: var(--text, #ffffff);
		letter-spacing: 0.02em;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
	}

	/* Content Row - Animation + Beat Grid side by side */
	.demo-content-row {
		display: flex;
		align-items: stretch;
		justify-content: center;
		gap: clamp(16px, 3cqw, 32px);
		width: 100%;
	}

	.animation-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 0 0 auto;
	}

	.canvas-wrapper {
		width: clamp(300px, 38cqw, 400px);
		height: clamp(300px, 38cqw, 400px);
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.beat-grid-panel {
		flex: 0 0 auto;
		width: clamp(400px, 50cqw, 530px);
		height: clamp(300px, 38cqw, 400px);
		/* Transparent background so selection effects don't show black edges */
		background: transparent;
		border: 2px solid var(--border-strong);
		border-radius: 16px;
		/* Use visible overflow so scaled selection effects aren't clipped */
		overflow: visible;
		/* No padding - let BeatGrid fill the space */
		padding: 0;
	}

	.animation-loading,
	.animation-fallback {
		width: 280px;
		height: 280px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 16px;
		color: var(--text-muted);
	}

	.fallback-icon {
		font-size: 4rem;
		opacity: 0.5;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Randomize Button - positioned at bottom of hero-visual */
	.hero-visual > .randomize-btn {
		position: absolute;
		bottom: 0;
		z-index: 10;
	}

	.randomize-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 28px;
		background: linear-gradient(135deg, var(--primary) 0%, #818cf8 100%);
		border: none;
		border-radius: 100px;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
	}

	.randomize-btn:hover:not(:disabled) {
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
	}

	.randomize-btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.randomize-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.randomize-btn svg {
		width: 20px;
		height: 20px;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* What Is Section */
	.what-is {
		padding: 120px 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.05) 100%);
	}

	.lead {
		font-size: 1.5rem;
		text-align: center;
		max-width: 700px;
		margin: 0 auto 48px;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-bottom: 48px;
	}

	.comparison-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 32px;
		text-align: center;
	}

	.comparison-card .icon {
		font-size: 3rem;
		margin-bottom: 16px;
	}

	.comparison-card h3 {
		font-size: 1.25rem;
		margin-bottom: 8px;
	}

	.comparison-card p {
		color: var(--text-muted);
	}

	.benefits {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px 32px;
		margin-bottom: 48px;
	}

	.benefit {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.check {
		color: #22c55e;
		font-weight: bold;
	}

	blockquote {
		background: var(--bg-card);
		border-left: 4px solid var(--primary);
		padding: 24px 32px;
		border-radius: 0 12px 12px 0;
		font-style: italic;
		color: var(--text-muted);
		max-width: 700px;
		margin: 0 auto;
	}

	blockquote strong {
		color: var(--text);
		font-style: normal;
	}

	/* Features Section */
	.features {
		padding: 120px 24px;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.feature-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 32px;
		transition: all 0.3s ease;
	}

	.feature-card:hover {
		border-color: var(--accent);
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 16px;
	}

	.feature-card h3 {
		font-size: 1.25rem;
		margin-bottom: 8px;
		color: var(--accent);
	}

	.feature-card p {
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	/* Notation Section */
	.notation {
		padding: 120px 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(236, 72, 153, 0.05) 100%);
	}

	.notation-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.notation-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
	}

	.notation-card.wide {
		grid-column: 1 / -1;
	}

	.notation-card h3 {
		font-size: 1.125rem;
		margin-bottom: 16px;
		color: var(--primary-light);
	}

	.notation-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.notation-card li {
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		color: var(--text-muted);
	}

	.notation-card li:last-child {
		border-bottom: none;
	}

	.position-types {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.position {
		display: grid;
		grid-template-columns: 40px 80px 1fr;
		align-items: center;
		gap: 12px;
	}

	.greek {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--primary-light);
	}

	.name {
		font-weight: 500;
	}

	.desc {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.letter-types {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 16px;
	}

	.letter-type {
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(99, 102, 241, 0.1);
		padding: 12px 20px;
		border-radius: 8px;
	}

	.range {
		font-weight: 700;
		font-size: 1.125rem;
		color: var(--primary-light);
	}

	.label {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	/* LOOPs Section */
	.loops {
		padding: 120px 24px;
	}

	.loop-explanation {
		margin-bottom: 48px;
	}

	.loop-flow {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 16px;
	}

	.flow-step {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--bg-card);
		padding: 16px 24px;
		border-radius: 12px;
		border: 1px solid var(--border);
	}

	.step-num {
		width: 32px;
		height: 32px;
		background: var(--primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}

	.flow-arrow {
		font-size: 1.5rem;
		color: var(--text-muted);
	}

	.loop-types {
		text-align: center;
	}

	.loop-types h3 {
		margin-bottom: 24px;
	}

	.loop-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	.loop-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.loop-name {
		font-weight: 600;
		color: var(--primary-light);
	}

	.loop-desc {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.loop-cta {
		text-align: center;
		margin-top: 48px;
		font-size: 1.125rem;
		color: var(--text-muted);
	}

	/* Props Section */
	.props-section {
		padding: 120px 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.05) 100%);
	}

	.props-showcase {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	.prop-tag {
		background: var(--bg-card);
		border: 1px solid var(--border);
		padding: 10px 20px;
		border-radius: 100px;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.prop-tag:hover {
		border-color: var(--primary);
		background: rgba(99, 102, 241, 0.1);
	}

	.prop-tag.more {
		color: var(--text-muted);
		font-style: italic;
	}

	/* Educators Section */
	.educators {
		padding: 120px 24px;
	}

	.educator-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 24px;
		margin-bottom: 48px;
	}

	.educator-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		text-align: center;
	}

	.edu-icon {
		font-size: 2rem;
		margin-bottom: 12px;
	}

	.educator-card h3 {
		font-size: 1rem;
		margin-bottom: 8px;
	}

	.educator-card p {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.educator-quote {
		text-align: center;
		font-size: 1.25rem;
	}

	/* Final CTA */
	.final-cta {
		padding: 120px 24px;
		text-align: center;
		background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
	}

	.final-cta p {
		font-size: 1.25rem;
		margin-bottom: 16px;
	}

	.final-cta .small {
		font-size: 1rem;
		color: var(--text-muted);
		margin-bottom: 32px;
	}

	/* Footer */
	.landing-footer {
		padding: 48px 24px;
		border-top: 1px solid var(--border);
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 24px;
		margin-bottom: 24px;
	}

	.footer-brand {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.footer-brand span {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.footer-links {
		display: flex;
		gap: 24px;
	}

	.footer-links a {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s ease;
	}

	.footer-links a:hover {
		color: var(--text);
	}

	.footer-note {
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}

	.footer-note p {
		color: var(--text-muted);
		font-size: 0.875rem;
		max-width: 700px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero {
			padding: 60px 16px;
		}

		.hero-cta {
			flex-direction: column;
			align-items: center;
		}

		.btn {
			width: 100%;
			max-width: 300px;
			justify-content: center;
		}

		.demo-content-row {
			flex-wrap: wrap;
		}

		.beat-grid-panel {
			width: 100%;
			max-width: clamp(300px, 85vw, 440px);
			height: clamp(280px, 55vw, 380px);
		}

		.word-label-row .word-text {
			font-size: clamp(1.25rem, 6vw, 2rem);
		}

		.canvas-wrapper {
			width: clamp(280px, 70vw, 360px);
			height: clamp(280px, 70vw, 360px);
		}

		.animation-loading,
		.animation-fallback {
			width: clamp(240px, 65vw, 320px);
			height: clamp(240px, 65vw, 320px);
		}

		.randomize-btn {
			padding: 12px 24px;
			font-size: 0.9rem;
		}

		.flow-arrow {
			display: none;
		}

		.loop-flow {
			flex-direction: column;
		}

		.position {
			grid-template-columns: 40px 1fr;
		}

		.desc {
			grid-column: 1 / -1;
		}

		.footer-content {
			flex-direction: column;
			text-align: center;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.btn,
		.feature-card,
		.prop-tag,
		.randomize-btn {
			transition: none;
		}

		.spinner {
			animation: none;
		}

		.btn:hover .arrow {
			transform: none;
		}

		.randomize-btn:hover:not(:disabled),
		.randomize-btn:active:not(:disabled) {
			transform: none;
		}
	}
</style>
