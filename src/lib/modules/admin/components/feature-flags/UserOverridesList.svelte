<script lang="ts">
	import { AdminSearchBox, AdminActionButton, AdminListItem, AdminEmptyState } from "$shared/admin";
	import { getRoleColor, getRoleIcon, type UserData } from './utils';

	interface Props {
		searchQuery: string;
		searchedUsers: UserData[];
		selectedUser: UserData | null;
		isSearching: boolean;
		onSearchChange: (value: string) => void;
		onSearch: () => void;
		onClearSearch: () => void;
		onSelectUser: (user: UserData) => void;
	}

	let {
		searchQuery,
		searchedUsers,
		selectedUser,
		isSearching,
		onSearchChange,
		onSearch,
		onClearSearch,
		onSelectUser,
	}: Props = $props();
</script>

<div class="list-section">
	<div class="list-controls">
		<AdminSearchBox
			value={searchQuery}
			placeholder="Search by name, email, or username..."
			oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
			onclear={onClearSearch}
		/>
		<AdminActionButton
			variant="primary"
			icon="fa-search"
			loading={isSearching}
			onclick={onSearch}
			fullWidth
		>
			Search Users
		</AdminActionButton>
	</div>

	<div class="user-list">
		{#if searchedUsers.length === 0 && !searchQuery.trim()}
			<AdminEmptyState
				icon="fa-search"
				title="Search for a user"
				message="Enter a name, email, or username to find users and manage their feature overrides"
			/>
		{:else if isSearching}
			<div class="loading-state">
				<i class="fas fa-spinner fa-spin"></i>
				<p>Searching users...</p>
			</div>
		{:else if searchedUsers.length === 0}
			<AdminEmptyState icon="fa-user-slash" title="No users found" message="Try a different search term" />
		{:else}
			{#each searchedUsers as user}
				<AdminListItem selected={selectedUser?.id === user.id} onClick={() => onSelectUser(user)}>
					{#snippet icon()}
						<div class="user-avatar">
							{#if user.photoURL}
								<img
									src={user.photoURL}
									alt={user.displayName}
									crossorigin="anonymous"
									referrerpolicy="no-referrer"
								/>
							{:else}
								<span class="initials">
									{user.displayName
										.split(' ')
										.map((n) => n[0])
										.join('')
										.toUpperCase()
										.slice(0, 2)}
								</span>
							{/if}
						</div>
					{/snippet}

					{#snippet children()}
						<div class="user-info">
							<h4>{user.displayName}</h4>
							<p class="user-email">{user.email}</p>
						</div>
					{/snippet}

					{#snippet meta()}
						<span
							class="role-badge"
							style="background: {getRoleColor(user.role)}20; color: {getRoleColor(user.role)}"
						>
							<i class="fas {getRoleIcon(user.role)}"></i>
							{user.role}
						</span>
					{/snippet}
				</AdminListItem>
			{/each}
		{/if}
	</div>
</div>

<style>
	.list-section {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.list-controls {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		min-width: 0;
		overflow: hidden;
	}

	.user-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		gap: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.loading-state i {
		font-size: 32px;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		flex-shrink: 0;
	}

	.user-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials {
		font-size: 14px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	.user-info h4 {
		margin: 0 0 4px 0;
		font-size: 14px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.user-email {
		margin: 0;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.role-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
		text-transform: capitalize;
	}
</style>
