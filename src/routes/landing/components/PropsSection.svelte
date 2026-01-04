<script lang="ts">
	import { PROPS_LIST } from '../landing-content';
</script>

<section class="props-section" id="props">
	<div class="container">
		<h2>30+ Supported Props</h2>
		<p class="section-intro">
			TKA Scribe works with virtually every flow prop — both unilateral (one-handed) and bilateral
			(two-handed).
		</p>

		<div class="props-showcase">
			{#each PROPS_LIST as prop}
				<div class="prop-tag">{prop}</div>
			{/each}
			<div class="prop-tag more">+ many more</div>
		</div>
	</div>
</section>

<style>
	.props-section {
		padding: 120px 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.05) 100%);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	h2 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-bottom: 1rem;
		text-align: center;
		font-weight: 600;
		line-height: 1.2;
	}

	.section-intro {
		text-align: center;
		font-size: 1.125rem;
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		max-width: 700px;
		margin: 0 auto 3rem;
	}

	/* Props showcase */
	.props-showcase {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	.prop-tag {
		background: var(--bg-card, rgba(255, 255, 255, 0.03));
		border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
		padding: 10px 20px;
		border-radius: 100px;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.prop-tag:hover {
		border-color: var(--primary, #6366f1);
		background: rgba(99, 102, 241, 0.1);
	}

	.prop-tag.more {
		color: var(--text-muted, rgba(255, 255, 255, 0.6));
		font-style: italic;
	}

	@media (prefers-reduced-motion: reduce) {
		.prop-tag {
			transition: none;
		}
	}
</style>
