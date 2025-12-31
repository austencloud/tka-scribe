<script lang="ts">
	import LandingAnimationDemo from './LandingAnimationDemo.svelte';
</script>

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
			Create, animate, and share prop manipulation sequences with the first universal notation
			system for flow arts.
		</p>

		<div class="hero-cta">
			<a href="/" class="btn btn-primary">
				Open TKA Scribe
				<span class="arrow">→</span>
			</a>
			<a href="#features" class="btn btn-secondary"> Learn More </a>
		</div>

		<div class="hero-visual">
			<LandingAnimationDemo />
		</div>
	</div>
</section>

<style>
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
		background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
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
		background: var(--primary, #6366f1);
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
		color: var(--primary-light, #818cf8);
		margin-bottom: 24px;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		margin-bottom: 8px;
		background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		color: var(--primary-light, #818cf8);
		margin-bottom: 16px;
		font-weight: 500;
	}

	.subtitle {
		font-size: 1.125rem;
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
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
		background: var(--primary, #6366f1);
		color: white;
	}

	.btn-primary:hover {
		background: var(--primary-light, #818cf8);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
	}

	.btn-secondary {
		background: var(--bg-card, rgba(255, 255, 255, 0.03));
		color: var(--text, #ffffff);
		border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
	}

	.btn-secondary:hover {
		background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
		border-color: var(--border-strong, rgba(255, 255, 255, 0.2));
	}

	.arrow {
		transition: transform 0.2s ease;
	}

	.btn:hover .arrow {
		transform: translateX(4px);
	}

	.hero-visual {
		margin-top: clamp(24px, 5vw, 48px);
	}

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
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}

		.btn:hover .arrow {
			transform: none;
		}
	}
</style>
