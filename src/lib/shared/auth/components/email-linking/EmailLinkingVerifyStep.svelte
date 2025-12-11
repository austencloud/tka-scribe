<!--
  EmailLinkingVerifyStep Component

  Verification step showing pending email verification with polling indicator.
  Includes resend functionality with cooldown timer.
-->
<script lang="ts">
	interface Props {
		email: string;
		checkCount: number;
		maxChecks: number;
		resendCooldown: number;
		canResend: boolean;
		formError: string | null;
		onResend: () => void;
		onSkip: () => void;
	}

	let {
		email,
		checkCount,
		maxChecks,
		resendCooldown,
		canResend,
		formError,
		onResend,
		onSkip,
	}: Props = $props();

	const progressPercent = $derived(
		Math.min((checkCount / maxChecks) * 100, 100)
	);
</script>

<div class="verification-content">
	<div class="verification-animation">
		<div class="email-icon-container">
			<i class="fas fa-envelope"></i>
			<div class="pulse-ring"></div>
			<div class="pulse-ring delay"></div>
		</div>
	</div>

	<div class="verification-instructions">
		<p>Click the link in the email we sent to verify your address.</p>
		<p class="hint">Check your spam folder if you don't see it.</p>
	</div>

	<div class="verification-status">
		<div class="status-indicator">
			<i class="fas fa-spinner fa-spin"></i>
			<span>Waiting for verification...</span>
		</div>
		<div class="progress-bar">
			<div class="progress-fill" style:width="{progressPercent}%"></div>
		</div>
	</div>

	<div class="resend-section">
		<p>Didn't receive the email?</p>
		<button class="resend-btn" onclick={onResend} disabled={!canResend}>
			{#if resendCooldown > 0}
				<i class="fas fa-clock"></i>
				<span>Resend in {resendCooldown}s</span>
			{:else}
				<i class="fas fa-paper-plane"></i>
				<span>Resend Verification Email</span>
			{/if}
		</button>
	</div>

	{#if formError}
		<div class="form-error" role="alert">
			<i class="fas fa-exclamation-circle"></i>
			<span>{formError}</span>
		</div>
	{/if}

	<button class="skip-btn" onclick={onSkip}> I'll verify later </button>
</div>

<style>
	.verification-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		text-align: center;
		padding: 8px 0;
	}

	.verification-animation {
		position: relative;
	}

	.email-icon-container {
		position: relative;
		width: 88px;
		height: 88px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(59, 130, 246, 0.15);
		border-radius: 50%;
	}

	.email-icon-container i {
		font-size: 36px;
		color: #3b82f6;
	}

	.pulse-ring {
		position: absolute;
		inset: 0;
		border: 2px solid rgba(59, 130, 246, 0.4);
		border-radius: 50%;
		animation: pulse-ring 2s ease-out infinite;
	}

	.pulse-ring.delay {
		animation-delay: 1s;
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1.6);
			opacity: 0;
		}
	}

	.verification-instructions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.verification-instructions p {
		margin: 0;
		font-size: 15px;
		color: rgba(255, 255, 255, 0.8);
	}

	.verification-instructions .hint {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.5);
	}

	.verification-status {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}

	.status-indicator i {
		color: #3b82f6;
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.resend-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.resend-section p {
		margin: 0;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.5);
	}

	.resend-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.8);
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.resend-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.25);
	}

	.resend-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-error {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 10px;
		color: #fca5a5;
		font-size: 14px;
		line-height: 1.4;
	}

	.form-error i {
		color: #ef4444;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.skip-btn {
		padding: 10px 20px;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-size: 14px;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 0.2s ease;
	}

	.skip-btn:hover {
		color: rgba(255, 255, 255, 0.7);
	}

	/* Focus States */
	.resend-btn:focus-visible,
	.skip-btn:focus-visible {
		outline: 2px solid rgba(139, 92, 246, 0.8);
		outline-offset: 2px;
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.pulse-ring,
		.progress-fill {
			animation: none;
		}
	}
</style>
