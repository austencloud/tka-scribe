/**
 * Admin Module
 * Complete admin UI library - components, types, and theme
 */

// Components
export {
	AdminTwoPanelLayout,
	AdminDetailPanel,
	AdminSearchBox,
	AdminFilterGroup,
	AdminListItem,
	AdminFormField,
	AdminStatCard,
	AdminEmptyState,
	AdminModal,
	AdminActionButton,
} from './components';

// Types
export type {
	BaseAdminProps,
	AdminSize,
	AdminVariant,
	ModalVariant,
	FilterOption,
	SelectOption,
	AdminFormFieldType,
} from './types';

// Theme
export { ADMIN_COLORS, ADMIN_SPACING, ADMIN_RADIUS, ADMIN_TYPOGRAPHY } from './styles';
