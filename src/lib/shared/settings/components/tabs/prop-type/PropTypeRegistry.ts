/**
 * PropType Registry for Settings
 *
 * Re-exports the prop type domain registry for use in the settings UI.
 * The single source of truth is in the pictograph prop domain module.
 */

export {
  getAllPropTypes,
  getPropTypeDisplayInfo,
  findPropTypeByValue,
  PROP_TYPE_DISPLAY_REGISTRY,
  VARIANT_PROP_TYPES,
  hasVariations,
  getBasePropType,
  getAllVariations,
  getNextVariation,
  getVariationLabel,
  getVariationIndex,
  getTriquetraVariation,
  type PropTypeDisplayInfo,
} from "../../../../pictograph/prop/domain";
