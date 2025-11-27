<script lang="ts">
	/**
	 * AdminFormField
	 * Form input wrapper with label and validation
	 */

	import type { AdminFormFieldType, SelectOption } from '../types/admin-component-types';

	interface AdminFormFieldProps {
		label: string;
		type?: AdminFormFieldType;
		value: any;
		onChange: (value: any) => void;
		error?: string;
		helpText?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		options?: SelectOption[];
		class?: string;
	}

	let {
		label,
		type = 'text',
		value = $bindable(),
		onChange,
		error,
		helpText,
		required = false,
		disabled = false,
		placeholder,
		options = [],
		class: className = '',
	}: AdminFormFieldProps = $props();

	// Generate unique ID for accessibility
	const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`;

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

		if (type === 'toggle') {
			const checked = (target as HTMLInputElement).checked;
			value = checked;
			onChange(checked);
		} else if (type === 'number') {
			const num = Number(target.value);
			value = num;
			onChange(num);
		} else {
			value = target.value;
			onChange(target.value);
		}
	}
</script>

<div class="admin-form-field {className}" class:has-error={error}>
	<label class="field-label" for={fieldId}>
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>

	{#if type === 'text' || type === 'number'}
		<input
			id={fieldId}
			class="field-input"
			type={type}
			bind:value
			{placeholder}
			{required}
			{disabled}
			onchange={handleChange}
		/>
	{:else if type === 'textarea'}
		<textarea
			id={fieldId}
			class="field-textarea"
			bind:value
			{placeholder}
			{required}
			{disabled}
			onchange={handleChange}
			rows="3"
		></textarea>
	{:else if type === 'select'}
		<select id={fieldId} class="field-select" bind:value {disabled} onchange={handleChange}>
			{#each options as option}
				<option value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			{/each}
		</select>
	{:else if type === 'toggle'}
		<label class="field-toggle">
			<input
				type="checkbox"
				checked={value}
				{disabled}
				onchange={handleChange}
			/>
			<span class="toggle-slider"></span>
		</label>
	{/if}

	{#if helpText}
		<span class="field-help">{helpText}</span>
	{/if}

	{#if error}
		<span class="field-error">{error}</span>
	{/if}
</div>

<style>
	.admin-form-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.field-label {
		font-size: 14px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.85);
	}

	.required {
		color: #ef4444;
	}

	.field-input,
	.field-textarea,
	.field-select {
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: white;
		font-size: 14px;
		transition: all 0.2s ease;
	}

	.field-input:focus,
	.field-textarea:focus,
	.field-select:focus {
		outline: none;
		border-color: rgba(102, 126, 234, 0.5);
		background: rgba(255, 255, 255, 0.08);
	}

	.field-textarea {
		resize: vertical;
		min-height: 60px;
		font-family: inherit;
	}

	.field-select {
		cursor: pointer;
	}

	/* Toggle */
	.field-toggle {
		position: relative;
		display: inline-block;
		width: 48px;
		height: 24px;
		cursor: pointer;
	}

	.field-toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.2);
		transition: 0.3s;
		border-radius: 24px;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.3s;
		border-radius: 50%;
	}

	input:checked + .toggle-slider {
		background-color: #10b981;
	}

	input:checked + .toggle-slider:before {
		transform: translateX(24px);
	}

	/* Help and error text */
	.field-help {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.field-error {
		font-size: 12px;
		color: #fca5a5;
	}

	.has-error .field-input,
	.has-error .field-textarea,
	.has-error .field-select {
		border-color: #ef4444;
	}

	/* Disabled state */
	.field-input:disabled,
	.field-textarea:disabled,
	.field-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
