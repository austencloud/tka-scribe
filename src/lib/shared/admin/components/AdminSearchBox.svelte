<script lang="ts">
	/**
	 * AdminSearchBox
	 * Reusable search input with icon and clear button
	 */

	interface AdminSearchBoxProps {
		value: string;
		placeholder?: string;
		icon?: string;
		disabled?: boolean;
		class?: string;
		oninput?: (e: Event) => void;
		onclear?: () => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		icon = 'fa-search',
		disabled = false,
		class: className = '',
		oninput,
		onclear,
	}: AdminSearchBoxProps = $props();

	function handleClear() {
		value = '';
		onclear?.();
	}
</script>

<div class="admin-search-box {className}">
	<i class="fas {icon} search-icon"></i>
	<input
		type="text"
		bind:value
		{placeholder}
		{disabled}
		{oninput}
		class="search-input"
	/>
	{#if value}
		<button class="clear-btn" onclick={handleClear} aria-label="Clear search">
			<i class="fas fa-times"></i>
		</button>
	{/if}
</div>

<style>
	.admin-search-box {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 10px 12px;
		transition: all 0.2s;
	}

	.admin-search-box:focus-within {
		border-color: rgba(102, 126, 234, 0.5);
		background: rgba(255, 255, 255, 0.08);
	}

	.search-icon {
		color: rgba(255, 255, 255, 0.4);
		font-size: 14px;
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: white;
		font-size: 14px;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.clear-btn {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: color 0.2s;
	}

	.clear-btn:hover {
		color: rgba(255, 255, 255, 0.8);
	}
</style>
