<script lang="ts">
	const footerLinks = [
		{ href: '/', label: 'App' },
		{ href: '#features', label: 'Features' },
		{ href: '#notation', label: 'Notation' },
		{ href: '#loops', label: 'LOOPs' }
	];
</script>

<section class="final-cta">
	<div class="container">
		<h2>Open & Free</h2>
		<p><strong>TKA Scribe is free to use.</strong> No download required — it runs in your browser.</p>
		<p class="small">
			The underlying notation system is open. Create educational content, build tools, expand the
			community.
		</p>

		<a href="/" class="btn btn-primary btn-large">
			Open TKA Scribe
			<span class="arrow">→</span>
		</a>
	</div>
</section>

<footer class="landing-footer">
	<div class="container">
		<div class="footer-content">
			<div class="footer-brand">
				<strong>The Kinetic Alphabet</strong>
				<span>Digital Sheet Music for Flow Arts</span>
			</div>
			<div class="footer-links">
				{#each footerLinks as link}
					<a href={link.href}>{link.label}</a>
				{/each}
			</div>
		</div>
		<div class="footer-note">
			<p>
				TKA draws inspiration from Vulcan Tech Gospel (VTG), Siteswap juggling notation, and music
				theory. It extends beyond VTG by supporting non-continuous patterns, static props, and
				complex multi-beat sequences.
			</p>
		</div>
	</div>
</footer>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	h2 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-bottom: 1rem;
		text-align: center;
		font-weight: 600;
		line-height: 1.2;
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
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		margin-bottom: 32px;
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

	/* Footer */
	.landing-footer {
		padding: 48px 24px;
		border-top: 1px solid var(--border, rgba(255, 255, 255, 0.1));
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
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		font-size: 0.875rem;
	}

	.footer-links {
		display: flex;
		gap: 24px;
	}

	.footer-links a {
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s ease;
	}

	.footer-links a:hover {
		color: var(--text, #ffffff);
	}

	.footer-note {
		padding-top: 24px;
		border-top: 1px solid var(--border, rgba(255, 255, 255, 0.1));
	}

	.footer-note p {
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		font-size: 0.875rem;
		max-width: 700px;
	}

	@media (max-width: 768px) {
		.footer-content {
			flex-direction: column;
			text-align: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}

		.btn:hover .arrow {
			transform: none;
		}

		.footer-links a {
			transition: none;
		}
	}
</style>
