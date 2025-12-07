import type { FeatureId, UserFeatureOverrides, FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
import { ROLE_DISPLAY } from "$lib/shared/auth/domain/models/UserRole";
import { ABOUT_TABS, ADMIN_TABS, ANIMATE_TABS, COLLECT_TABS, COMMUNITY_TABS, CREATE_TABS, DISCOVER_TABS, EDIT_TABS, LEARN_TABS, MODULE_DEFINITIONS } from "../../../../shared/navigation/state/navigation-state.svelte";

export interface UserData {
	id: string;
	email: string;
	displayName: string;
	username: string;
	photoURL: string | null;
	role: UserRole;
	featureOverrides?: UserFeatureOverrides;
}

const ALL_TABS = [
	...CREATE_TABS,
	...LEARN_TABS,
	...DISCOVER_TABS,
	...COMMUNITY_TABS,
	...COLLECT_TABS,
	...ANIMATE_TABS,
	...EDIT_TABS,
	...ABOUT_TABS,
	...ADMIN_TABS,
];

export function getRoleColor(role: UserRole): string {
	return ROLE_DISPLAY[role].color;
}

export function getRoleIcon(role: UserRole): string {
	return ROLE_DISPLAY[role].icon;
}

export interface HierarchicalFlags {
	modules: FeatureFlagConfig[];
	tabsByModule: Map<string, FeatureFlagConfig[]>;
	capabilities: FeatureFlagConfig[];
}

export function buildHierarchicalFlags(
	featureFlags: FeatureFlagConfig[],
	categoryFilter: 'all' | 'module' | 'tab' | 'capability',
	searchQuery: string
): HierarchicalFlags {
	const modules: FeatureFlagConfig[] = [];
	const tabsByModule: Map<string, FeatureFlagConfig[]> = new Map();
	const capabilities: FeatureFlagConfig[] = [];

	for (const flag of featureFlags) {
		if (flag.category === 'module') {
			modules.push(flag);
			const moduleId = flag.id.split(':')[1] ?? '';
			tabsByModule.set(moduleId, []);
		} else if (flag.category === 'capability') {
			capabilities.push(flag);
		}
	}

	for (const flag of featureFlags) {
		if (flag.category === 'tab') {
			const parts = flag.id.split(':');
			const moduleId = parts[1] ?? '';
			const tabs = tabsByModule.get(moduleId);
			if (tabs) {
				tabs.push(flag);
			}
		}
	}

	let filteredModules = modules;
	let filteredCapabilities = capabilities;

	if (categoryFilter === 'module') {
		filteredCapabilities = [];
	} else if (categoryFilter === 'tab') {
		filteredModules = modules.filter((m) => {
			const moduleId = m.id.split(':')[1] ?? '';
			const tabs = tabsByModule.get(moduleId) || [];
			return tabs.length > 0;
		});
	} else if (categoryFilter === 'capability') {
		filteredModules = [];
	}

	if (searchQuery.trim()) {
		const q = searchQuery.toLowerCase();

		filteredModules = filteredModules.filter((module) => {
			const moduleMatches =
				module.name.toLowerCase().includes(q) ||
				module.description.toLowerCase().includes(q) ||
				module.id.toLowerCase().includes(q);

			const moduleId = module.id.split(':')[1] ?? '';
			const tabs = tabsByModule.get(moduleId) || [];
			const anyTabMatches = tabs.some(
				(tab) =>
					tab.name.toLowerCase().includes(q) ||
					tab.description.toLowerCase().includes(q) ||
					tab.id.toLowerCase().includes(q)
			);

			return moduleMatches || anyTabMatches;
		});

		filteredCapabilities = filteredCapabilities.filter(
			(flag) =>
				flag.name.toLowerCase().includes(q) ||
				flag.description.toLowerCase().includes(q) ||
				flag.id.toLowerCase().includes(q)
		);

		const filteredTabsByModule = new Map<string, FeatureFlagConfig[]>();
		for (const [moduleId, tabs] of tabsByModule.entries()) {
			const filtered = tabs.filter(
				(tab) =>
					tab.name.toLowerCase().includes(q) ||
					tab.description.toLowerCase().includes(q) ||
					tab.id.toLowerCase().includes(q)
			);
			filteredTabsByModule.set(moduleId, filtered);
		}
		return {
			modules: filteredModules,
			tabsByModule: filteredTabsByModule,
			capabilities: filteredCapabilities,
		};
	}

	return {
		modules: filteredModules,
		tabsByModule,
		capabilities: filteredCapabilities,
	};
}

export function computeStats(featureFlags: FeatureFlagConfig[]) {
	const total = featureFlags.length;
	const enabled = featureFlags.filter((f) => f.enabled).length;
	const disabled = total - enabled;

	const byRole = {
		user: featureFlags.filter((f) => f.minimumRole === 'user').length,
		premium: featureFlags.filter((f) => f.minimumRole === 'premium').length,
		tester: featureFlags.filter((f) => f.minimumRole === 'tester').length,
		admin: featureFlags.filter((f) => f.minimumRole === 'admin').length,
	};

	const byCategory = {
		module: featureFlags.filter((f) => f.category === 'module').length,
		tab: featureFlags.filter((f) => f.category === 'tab').length,
		capability: featureFlags.filter((f) => f.category === 'capability').length,
	};

	return { total, enabled, disabled, byRole, byCategory };
}

export function getFeatureIconAndColor(featureId: FeatureId): { icon: string; color: string } {
	const parts = featureId.split(':');
	const type = parts[0];

	if (type === 'module') {
		const moduleId = parts[1] ?? '';
		const module = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
		if (module) {
			const iconMatch = module.icon.match(/class="([^"]+)"/);
			const iconClasses = iconMatch?.[1] ?? 'fas fa-cubes';
			const iconClass = iconClasses.split(' ').pop() ?? 'fa-cubes';

			const colorMatch = module.icon.match(/color:\s*([^;"]+)/);
			const color = colorMatch?.[1]?.trim() ?? '#8b5cf6';

			return { icon: iconClass, color };
		}
	} else if (type === 'tab') {
		const tabId = parts[2] ?? '';
		const tab = ALL_TABS.find((t) => t.id === tabId);
		if (tab) {
			const iconMatch = tab.icon.match(/class="([^"]+)"/);
			const iconClasses = iconMatch?.[1] ?? 'fas fa-window-restore';
			const iconClass = iconClasses.split(' ').pop() ?? 'fa-window-restore';

			return { icon: iconClass, color: tab.color ?? '#6b7280' };
		}
	}

	return {
		icon: type === 'capability' ? 'fa-magic' : 'fa-flag',
		color: type === 'capability' ? '#f59e0b' : '#6b7280',
	};
}

/**
 * Role hierarchy for comparison (higher index = more permissions)
 */
const ROLE_HIERARCHY: UserRole[] = ['user', 'tester', 'premium', 'admin'];

/**
 * Get the effective minimum role for a tab considering its parent module.
 * The effective role is the stricter (higher) of the tab role and module role.
 */
export function getEffectiveRole(tabRole: UserRole, moduleRole: UserRole): UserRole {
	const tabIndex = ROLE_HIERARCHY.indexOf(tabRole);
	const moduleIndex = ROLE_HIERARCHY.indexOf(moduleRole);
	return tabIndex >= moduleIndex ? tabRole : moduleRole;
}

/**
 * Check if a role is stricter than another
 */
export function isRoleStricter(role: UserRole, comparedTo: UserRole): boolean {
	return ROLE_HIERARCHY.indexOf(role) > ROLE_HIERARCHY.indexOf(comparedTo);
}
