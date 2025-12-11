<!--
  EmailLinkingFormStep Component

  Form step for entering email and password to link to account.
  Handles input validation and submission.
-->
<script lang="ts">
	interface Props {
		email: string;
		password: string;
		showPassword: boolean;
		formError: string | null;
		isSubmitting: boolean;
		onEmailChange: (value: string) => void;
		onPasswordChange: (value: string) => void;
		onTogglePassword: () => void;
		onSubmit: () => void;
		onCancel: () => void;
	}

	let {
		email,
		password,
		showPassword,
		formError,
		isSubmitting,
		onEmailChange,
		onPasswordChange,
		onTogglePassword,
		onSubmit,
		onCancel,
	}: Props = $props();

	function handleSubmit(e: Event) {
		e.preventDefault();
		onSubmit();
	}
</script>

<form class="email-form" onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="email-link-email">Email Address</label>
		<div class="input-wrapper">
			<i class="fas fa-envelope input-icon"></i>
			<input
				id="email-link-email"
				type="email"
				value={email}
				oninput={(e) => onEmailChange(e.currentTarget.value)}
				placeholder="you@example.com"
				required
				disabled={isSubmitting}
				autocomplete="email"
				class:has-value={email.length > 0}
			/>
		</div>
	</div>

	<div class="form-group">
		<label for="email-link-password">Password</label>
		<div class="input-wrapper">
			<i class="fas fa-lock input-icon"></i>
			<input
				id="email-link-password"
				type={showPassword ? "text" : "password"}
				value={password}
				oninput={(e) => onPasswordChange(e.currentTarget.value)}
				placeholder="At least 8 characters"
				required
				minlength="8"
				disabled={isSubmitting}
				autocomplete="new-password"
				class:has-value={password.length > 0}
			/>
			<button
				type="button"
				class="toggle-password"
				onclick={onTogglePassword}
				aria-label={showPassword ? "Hide password" : "Show password"}
				disabled={isSubmitting}
				tabindex={-1}
			>
				<i class="fas {showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
			</button>
		</div>
		<span class="field-hint">
			<i class="fas fa-eye"></i> Use the eye icon to verify your password
		</span>
	</div>

	{#if formError}
		<div class="form-error" role="alert">
			<i class="fas fa-exclamation-circle"></i>
			<span>{formError}</span>
		</div>
	{/if}

	<div class="form-actions">
		<button
			type="button"
			class="cancel-btn"
			onclick={onCancel}
			disabled={isSubmitting}
		>
			Cancel
		</button>
		<button
			type="submit"
			class="submit-btn"
			disabled={isSubmitting}
			aria-busy={isSubmitting}
		>
			{#if isSubmitting}
				<i class="fas fa-spinner fa-spin"></i>
				<span>Linking...</span>
			{:else}
				<i class="fas fa-link"></i>
				<span>Link Email</span>
			{/if}
		</button>
	</div>
</form>

<style>
	.email-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-size: 13px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 14px;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.4);
		transition: color 0.2s ease;
		pointer-events: none;
	}

	.input-wrapper:focus-within .input-icon {
		color: #8b5cf6;
	}

	.form-group input {
		width: 100%;
		padding: 14px 14px 14px 44px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		color: rgba(255, 255, 255, 0.95);
		font-size: 15px;
		transition: all 0.2s ease;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.35);
	}

	.form-group input:focus {
		outline: none;
		border-color: #8b5cf6;
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
	}

	.form-group input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-password {
		position: absolute;
		right: 10px;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.toggle-password:hover:not(:disabled) {
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
	}

	.toggle-password:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.field-hint {
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 4px;
		color: rgba(255, 255, 255, 0.5);
	}

	.field-hint i {
		opacity: 0.7;
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

	.form-actions {
		display: flex;
		gap: 12px;
		margin-top: 8px;
	}

	.cancel-btn {
		flex: 1;
		padding: 14px 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
	}

	.cancel-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-btn {
		flex: 1.5;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 20px;
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	/* Responsive */
	@media (max-width: 480px) {
		.form-actions {
			flex-direction: column;
		}

		.cancel-btn,
		.submit-btn {
			flex: none;
			width: 100%;
		}
	}

	/* Focus States */
	.cancel-btn:focus-visible,
	.submit-btn:focus-visible,
	.toggle-password:focus-visible {
		outline: 2px solid rgba(139, 92, 246, 0.8);
		outline-offset: 2px;
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.submit-btn:hover:not(:disabled) {
			transform: none;
		}
	}
</style>
