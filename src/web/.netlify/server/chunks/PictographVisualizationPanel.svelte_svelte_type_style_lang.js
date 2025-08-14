import { G as GridMode, A as ArrowType, R as RotationDirection, O as Orientation, P as PropType, L as Location, M as MotionType } from "./enums.js";
function createGridData(data = {}) {
  return {
    grid_mode: data.grid_mode ?? GridMode.DIAMOND,
    center_x: data.center_x ?? 0,
    center_y: data.center_y ?? 0,
    radius: data.radius ?? 100,
    grid_points: data.grid_points ?? {}
  };
}
function createArrowData(data = {}) {
  return {
    id: data.id ?? crypto.randomUUID(),
    arrow_type: data.arrow_type ?? ArrowType.BLUE,
    color: data.color ?? "blue",
    turns: data.turns ?? 0,
    is_mirrored: data.is_mirrored ?? false,
    motion_type: data.motion_type ?? "static",
    start_orientation: data.start_orientation ?? "in",
    end_orientation: data.end_orientation ?? "in",
    rotation_direction: data.rotation_direction ?? "clockwise",
    location: data.location ?? null,
    position_x: data.position_x ?? 0,
    position_y: data.position_y ?? 0,
    rotation_angle: data.rotation_angle ?? 0,
    coordinates: data.coordinates ?? null,
    svg_center: data.svg_center ?? null,
    svg_mirrored: data.svg_mirrored ?? false,
    is_visible: data.is_visible ?? true,
    is_selected: data.is_selected ?? false
  };
}
function createPropData(data = {}) {
  return {
    id: data.id ?? crypto.randomUUID(),
    prop_type: data.prop_type ?? PropType.STAFF,
    color: data.color ?? "blue",
    orientation: data.orientation ?? Orientation.IN,
    rotation_direction: data.rotation_direction ?? RotationDirection.NO_ROTATION,
    location: data.location ?? null,
    position_x: data.position_x ?? 0,
    position_y: data.position_y ?? 0,
    rotation_angle: data.rotation_angle ?? 0,
    coordinates: data.coordinates ?? null,
    svg_center: data.svg_center ?? null,
    is_visible: data.is_visible ?? true,
    is_selected: data.is_selected ?? false
  };
}
function createPictographData(data = {}) {
  const arrows = {
    blue: createArrowData({ arrow_type: ArrowType.BLUE, color: "blue" }),
    red: createArrowData({ arrow_type: ArrowType.RED, color: "red" }),
    ...data.arrows
  };
  const props = {
    blue: createPropData({ color: "blue" }),
    red: createPropData({ color: "red" }),
    ...data.props
  };
  return {
    id: data.id ?? crypto.randomUUID(),
    grid_data: data.grid_data ?? createGridData(),
    arrows,
    props,
    motions: data.motions ?? {},
    letter: data.letter ?? null,
    start_position: data.start_position ?? null,
    end_position: data.end_position ?? null,
    beat: data.beat ?? 0,
    timing: data.timing ?? null,
    direction: data.direction ?? null,
    duration: data.duration ?? null,
    letter_type: data.letter_type ?? null,
    is_blank: data.is_blank ?? false,
    is_mirrored: data.is_mirrored ?? false,
    metadata: data.metadata ?? {}
  };
}
class ArrowPlacementDataService {
  allPlacements = {
    [GridMode.DIAMOND]: {},
    [GridMode.BOX]: {}
  };
  isDataLoaded = false;
  // File mapping for placement data
  placementFiles = {
    [GridMode.DIAMOND]: {
      pro: "/data/arrow_placement/diamond/default/default_diamond_pro_placements.json",
      anti: "/data/arrow_placement/diamond/default/default_diamond_anti_placements.json",
      float: "/data/arrow_placement/diamond/default/default_diamond_float_placements.json",
      dash: "/data/arrow_placement/diamond/default/default_diamond_dash_placements.json",
      static: "/data/arrow_placement/diamond/default/default_diamond_static_placements.json"
    },
    [GridMode.BOX]: {
      pro: "/data/arrow_placement/box/default/default_box_pro_placements.json",
      anti: "/data/arrow_placement/box/default/default_box_anti_placements.json",
      float: "/data/arrow_placement/box/default/default_box_float_placements.json",
      dash: "/data/arrow_placement/box/default/default_box_dash_placements.json",
      static: "/data/arrow_placement/box/default/default_box_static_placements.json"
    }
  };
  /**
   * Load all placement data from JSON files
   */
  async loadPlacementData() {
    if (this.isDataLoaded) {
      return;
    }
    console.log("Loading arrow placement data...");
    try {
      await this.loadGridPlacements(GridMode.DIAMOND);
      await this.loadGridPlacements(GridMode.BOX);
      this.isDataLoaded = true;
      console.log("✅ Arrow placement data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load arrow placement data:", error);
      throw new Error(
        `Placement data loading failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Load placements for a specific grid mode
   */
  async loadGridPlacements(gridMode) {
    const files = this.placementFiles[gridMode];
    this.allPlacements[gridMode] = {};
    for (const [motionType, filePath] of Object.entries(files)) {
      try {
        const placementData = await this.loadJsonFile(filePath);
        this.allPlacements[gridMode][motionType] = placementData;
        console.log(`Loaded ${motionType} placements for ${gridMode} grid`);
      } catch (error) {
        console.warn(
          `Could not load ${motionType} placements for ${gridMode}: ${error}`
        );
        this.allPlacements[gridMode][motionType] = {};
      }
    }
  }
  /**
   * Load JSON file with error handling
   */
  async loadJsonFile(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Failed to load placement data from ${path}:`, error);
      return {};
    }
  }
  /**
   * Get default adjustment using placement key and turns
   */
  async getDefaultAdjustment(motionType, placementKey, turns, gridMode = GridMode.DIAMOND) {
    await this.ensureDataLoaded();
    const gridPlacements = this.allPlacements[gridMode];
    if (!gridPlacements) {
      console.warn(`No placement data for grid mode: ${gridMode}`);
      return { x: 0, y: 0 };
    }
    const motionPlacements = gridPlacements[motionType];
    if (!motionPlacements) {
      console.warn(`No placement data for motion type: ${motionType}`);
      return { x: 0, y: 0 };
    }
    const placementData = motionPlacements[placementKey];
    if (!placementData) {
      console.warn(`No placement data for key: ${placementKey}`);
      return { x: 0, y: 0 };
    }
    const turnsStr = this.formatTurnsForLookup(turns);
    const adjustment = placementData[turnsStr];
    if (!adjustment) {
      console.warn(
        `No adjustment for turns: ${turnsStr} in placement: ${placementKey}`
      );
      return { x: 0, y: 0 };
    }
    const [x, y] = adjustment;
    console.log(
      `Found adjustment for ${motionType} ${placementKey} ${turnsStr}: [${x}, ${y}]`
    );
    return { x, y };
  }
  /**
   * Get available placement keys for a motion type
   */
  async getAvailablePlacementKeys(motionType, gridMode = GridMode.DIAMOND) {
    await this.ensureDataLoaded();
    const motionPlacements = this.allPlacements[gridMode]?.[motionType];
    if (!motionPlacements) {
      return [];
    }
    return Object.keys(motionPlacements);
  }
  /**
   * Check if data is loaded
   */
  isLoaded() {
    return this.isDataLoaded;
  }
  /**
   * Ensure data is loaded before operations
   */
  async ensureDataLoaded() {
    if (!this.isDataLoaded) {
      await this.loadPlacementData();
    }
  }
  /**
   * Format turns value for JSON lookup
   * Converts: 1.0 → "1", 0.5 → "0.5", etc.
   */
  formatTurnsForLookup(turns) {
    if (typeof turns === "string") {
      return turns;
    }
    if (turns === Math.floor(turns)) {
      return Math.floor(turns).toString();
    }
    return turns.toString();
  }
  /**
   * Debug method to log available keys
   */
  async debugAvailableKeys(motionType, gridMode = GridMode.DIAMOND) {
    const keys = await this.getAvailablePlacementKeys(motionType, gridMode);
    console.log(
      `Available placement keys for ${motionType} (${gridMode}):`,
      keys
    );
  }
  /**
   * Get raw placement data for debugging
   */
  async getPlacementData(motionType, placementKey, gridMode = GridMode.DIAMOND) {
    await this.ensureDataLoaded();
    const motionPlacements = this.allPlacements[gridMode]?.[motionType];
    return motionPlacements?.[placementKey] || {};
  }
}
class ArrowPlacementKeyService {
  // Letter condition mappings from desktop
  dashLetterConditions = {
    TYPE3: ["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"],
    TYPE5: ["Φ-", "Ψ-", "Λ-"]
  };
  /**
   * Generate placement key based on motion data and pictograph context
   */
  getRawMotionType(motionData) {
    if ("motion_type" in motionData)
      return motionData.motion_type;
    return motionData.motionType;
  }
  generatePlacementKey(motionData, pictographData, availableKeys) {
    const rawMotionType = this.getRawMotionType(motionData);
    const motionType = this.normalizeMotionType(rawMotionType);
    const letter = pictographData.letter;
    console.log(
      `Generating placement key for ${motionType}, letter: ${letter}`
    );
    const candidateKeys = this.generateCandidateKeys(
      motionData,
      pictographData
    );
    for (const key of candidateKeys) {
      if (availableKeys.includes(key)) {
        console.log(`Selected placement key: ${key}`);
        return key;
      }
    }
    const fallback = motionType;
    console.log(`No specific key found, using fallback: ${fallback}`);
    return fallback;
  }
  /**
   * Generate basic key for motion type (fallback)
   */
  generateBasicKey(motionType) {
    return motionType;
  }
  /**
   * Generate candidate keys in order of preference
   */
  generateCandidateKeys(motionData, pictographData) {
    const rawMotionType = this.getRawMotionType(motionData);
    const motionType = this.normalizeMotionType(rawMotionType);
    const letter = pictographData.letter;
    const candidates = [];
    if (letter) {
      const letterSuffix = this.getLetterSuffix(letter);
      candidates.push(`${motionType}_to_layer1_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_layer2_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_layer1_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_layer2_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_layer1_gamma${letterSuffix}`);
      candidates.push(`${motionType}_to_layer2_gamma${letterSuffix}`);
      candidates.push(`${motionType}_to_radial_layer3_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_radial_layer3_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_radial_layer3_gamma${letterSuffix}`);
      candidates.push(`${motionType}_to_nonradial_layer3_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_nonradial_layer3_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_nonradial_layer3_gamma${letterSuffix}`);
    }
    candidates.push(`${motionType}_to_layer1_alpha`);
    candidates.push(`${motionType}_to_layer2_alpha`);
    candidates.push(`${motionType}_to_layer1_beta`);
    candidates.push(`${motionType}_to_layer2_beta`);
    candidates.push(`${motionType}_to_layer1_gamma`);
    candidates.push(`${motionType}_to_layer2_gamma`);
    candidates.push(`${motionType}_to_radial_layer3_alpha`);
    candidates.push(`${motionType}_to_radial_layer3_beta`);
    candidates.push(`${motionType}_to_radial_layer3_gamma`);
    candidates.push(`${motionType}_to_nonradial_layer3_alpha`);
    candidates.push(`${motionType}_to_nonradial_layer3_beta`);
    candidates.push(`${motionType}_to_nonradial_layer3_gamma`);
    candidates.push(motionType);
    return candidates;
  }
  /**
   * Get letter suffix for placement key
   */
  getLetterSuffix(letter) {
    if (!letter) {
      return "";
    }
    const allDashLetters = [
      ...this.dashLetterConditions.TYPE3,
      ...this.dashLetterConditions.TYPE5
    ];
    if (allDashLetters.includes(letter)) {
      const baseString = letter.slice(0, -1);
      return `_${baseString}_dash`;
    }
    return `_${letter}`;
  }
  /**
   * Normalize motion type to standard format
   */
  normalizeMotionType(motionType) {
    if (typeof motionType === "string") {
      const normalized = motionType.toLowerCase();
      if (["pro", "anti", "float", "dash", "static"].includes(normalized)) {
        return normalized;
      }
    }
    console.warn(
      `Invalid motion type: ${String(motionType)}, defaulting to 'pro'`
    );
    return "pro";
  }
  /**
   * Debug method to show all candidate keys
   */
  debugCandidateKeys(motionData, pictographData) {
    const candidates = this.generateCandidateKeys(motionData, pictographData);
    console.log("Candidate placement keys:", candidates);
    return candidates;
  }
}
class AttributeKeyGenerator {
  /**
   * Modern implementation of attribute key generation for arrow positioning.
   *
   * Generates keys used for special placement and default placement lookups.
   * Works with modern ArrowData and PictographData objects.
   */
  getKeyFromArrow(arrowData, pictographData) {
    try {
      const motionData = pictographData.motions?.[arrowData.color];
      if (!motionData) {
        console.debug(
          `No motion data for ${arrowData.color}, using color as key`
        );
        return arrowData.color;
      }
      const motionType = motionData.motion_type || "";
      const letter = pictographData.letter || "";
      const startOri = motionData.start_ori || "";
      const color = arrowData.color;
      const leadState = void 0;
      const hasHybridMotions = this.hasHybridMotions(pictographData);
      const startsFromMixedOrientation = this.startsFromMixedOrientation(pictographData);
      const startsFromStandardOrientation = !startsFromMixedOrientation;
      return this.generateKey(
        motionType,
        letter,
        startOri,
        color,
        leadState,
        hasHybridMotions,
        startsFromMixedOrientation,
        startsFromStandardOrientation
      );
    } catch (error) {
      console.error(
        `Error generating attribute key for ${arrowData.color}:`,
        error
      );
      return arrowData.color;
    }
  }
  generateKey(motionType, letter, startOri, color, leadState, hasHybridMotions, startsFromMixedOrientation, _startsFromStandardOrientation) {
    try {
      const IN = "in";
      const OUT = "out";
      const CLOCK = "clock";
      const COUNTER = "counter";
      if (startsFromMixedOrientation) {
        if (["S", "T"].includes(letter)) {
          return leadState || color;
        } else if (hasHybridMotions) {
          if ([IN, OUT].includes(startOri)) {
            return `${motionType}_from_layer1`;
          } else if ([CLOCK, COUNTER].includes(startOri)) {
            return `${motionType}_from_layer2`;
          } else {
            return color;
          }
        } else if (this.isNonHybridLetter(letter)) {
          return color;
        } else {
          return motionType;
        }
      } else {
        return color;
      }
    } catch (error) {
      console.error("Error in key generation:", error);
      return color;
    }
  }
  hasHybridMotions(pictographData) {
    try {
      const blueMotion = pictographData.motions?.blue;
      const redMotion = pictographData.motions?.red;
      if (!blueMotion || !redMotion) {
        return false;
      }
      const blueType = blueMotion.motion_type || "";
      const redType = redMotion.motion_type || "";
      return blueType !== redType;
    } catch {
      return false;
    }
  }
  startsFromMixedOrientation(pictographData) {
    try {
      const IN = "in";
      const OUT = "out";
      const blueMotion = pictographData.motions?.blue;
      const redMotion = pictographData.motions?.red;
      if (!blueMotion || !redMotion) {
        return false;
      }
      const blueStart = blueMotion.start_ori || "";
      const redStart = redMotion.start_ori || "";
      const blueLayer1 = [IN, OUT].includes(blueStart);
      const redLayer1 = [IN, OUT].includes(redStart);
      return blueLayer1 !== redLayer1;
    } catch {
      return false;
    }
  }
  isNonHybridLetter(letter) {
    const nonHybridLetters = [
      "A",
      "B",
      "D",
      "E",
      "G",
      "H",
      "J",
      "K",
      "M",
      "N",
      "P",
      "Q",
      "S",
      "T"
    ];
    return nonHybridLetters.includes(letter);
  }
}
class PlacementKeyGenerator {
  service = new ArrowPlacementKeyService();
  generatePlacementKey(motionData, pictographData, defaultPlacements, _gridMode) {
    const availableKeys = Object.keys(defaultPlacements || {});
    if (availableKeys.length === 0) {
      const candidates2 = this.service.debugCandidateKeys(
        motionData,
        pictographData
      );
      return candidates2[0] ?? this.service.generateBasicKey(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        motionData.motion_type || "pro"
      );
    }
    const candidates = this.service.debugCandidateKeys(
      motionData,
      pictographData
    );
    for (const key of candidates) {
      if (availableKeys.includes(key)) return key;
    }
    return this.service.generateBasicKey(
      motionData.motion_type || "pro"
    );
  }
}
class SpecialPlacementOriKeyGenerator {
  generateOrientationKey(_motionData, pictographData) {
    try {
      const blueMotion = pictographData.motions?.blue;
      const redMotion = pictographData.motions?.red;
      if (blueMotion && redMotion) {
        const blueEndOri = blueMotion.end_ori || "in";
        const redEndOri = redMotion.end_ori || "in";
        const blueLayer = ["in", "out"].includes(blueEndOri) ? 1 : 2;
        const redLayer = ["in", "out"].includes(redEndOri) ? 1 : 2;
        if (blueLayer === 1 && redLayer === 1) return "from_layer1";
        if (blueLayer === 2 && redLayer === 2) return "from_layer2";
        if (blueLayer === 1 && redLayer === 2) return "from_layer3_blue1_red2";
        if (blueLayer === 2 && redLayer === 1) return "from_layer3_blue2_red1";
        return "from_layer1";
      }
    } catch {
    }
    return "from_layer1";
  }
}
class TurnsTupleKeyGenerator {
  generateTurnsTuple(pictographData) {
    try {
      const blueTurns = this.getTurns(pictographData.motions?.blue?.turns);
      const redTurns = this.getTurns(pictographData.motions?.red?.turns);
      return [blueTurns, redTurns];
    } catch {
      return [0, 0];
    }
  }
  getTurns(value) {
    if (typeof value === "number") return value;
    return 0;
  }
}
class ArrowAdjustmentLookup {
  /**
   * Focused service for arrow adjustment lookups.
   *
   * Handles the lookup phase of arrow positioning:
   * 1. Try special placement lookup (stored values)
   * 2. Fall back to default calculation
   * 3. Return proper Result types with error handling
   */
  specialPlacementService;
  defaultPlacementService;
  orientationKeyService;
  placementKeyService;
  turnsTupleService;
  attributeKeyService;
  constructor(specialPlacementService, defaultPlacementService, orientationKeyService, placementKeyService, turnsTupleService, attributeKeyService) {
    this.specialPlacementService = specialPlacementService;
    this.defaultPlacementService = defaultPlacementService;
    this.orientationKeyService = orientationKeyService;
    this.placementKeyService = placementKeyService;
    this.turnsTupleService = turnsTupleService;
    this.attributeKeyService = attributeKeyService;
  }
  async getBaseAdjustment(pictographData, motionData, letter, arrowColor) {
    if (!motionData || !letter) {
      throw new Error("Missing motion or letter data for adjustment lookup");
    }
    try {
      const [oriKey, turnsTuple, attrKey] = this.generateLookupKeys(
        pictographData,
        motionData
      );
      console.debug(
        `Generated keys - ori: ${oriKey}, turns: ${turnsTuple}, attr: ${attrKey}`
      );
      try {
        const specialAdjustment = await this.lookupSpecialPlacement(
          motionData,
          pictographData,
          arrowColor
        );
        return specialAdjustment;
      } catch {
        console.debug("No special placement found, falling back to default");
      }
      const defaultAdjustment = await this.calculateDefaultAdjustment(
        motionData,
        pictographData
      );
      console.debug(
        `Using default adjustment: (${defaultAdjustment.x.toFixed(1)}, ${defaultAdjustment.y.toFixed(1)})`
      );
      return defaultAdjustment;
    } catch (error) {
      console.error("Error in base adjustment lookup:", error);
      throw new Error(`Arrow adjustment lookup failed: ${error}`);
    }
  }
  generateLookupKeys(pictographData, motionData) {
    try {
      const oriKey = this.orientationKeyService.generateOrientationKey(
        motionData,
        pictographData
      );
      const turnsTuple = this.turnsTupleService.generateTurnsTuple(pictographData);
      const color = "blue";
      const tempArrow = {
        id: "temp",
        arrow_type: "BLUE",
        color,
        motion_type: motionData.motion_type || "",
        location: "center",
        start_orientation: motionData.start_ori || "",
        end_orientation: motionData.end_ori || "",
        rotation_direction: motionData.prop_rot_dir || "",
        turns: typeof motionData.turns === "number" ? motionData.turns : 0,
        is_mirrored: false,
        position_x: 0,
        position_y: 0,
        rotation_angle: 0,
        is_visible: true,
        is_selected: false
      };
      const attrKey = this.attributeKeyService.getKeyFromArrow(
        tempArrow,
        pictographData
      );
      return [oriKey, turnsTuple.join(","), attrKey];
    } catch (error) {
      console.error("Failed to generate lookup keys:", error);
      throw new Error(`Key generation failed: ${error}`);
    }
  }
  async lookupSpecialPlacement(motionData, pictographData, arrowColor) {
    try {
      const adjustment = await this.specialPlacementService.getSpecialAdjustment(
        motionData,
        pictographData,
        arrowColor
      );
      if (adjustment) {
        return adjustment;
      }
      throw new Error("No special placement found");
    } catch (error) {
      if (error instanceof Error && error.message === "No special placement found") {
        throw error;
      }
      console.error("Error in special placement lookup:", error);
      throw new Error(`Special placement lookup failed: ${error}`);
    }
  }
  async calculateDefaultAdjustment(motionData, pictographData, gridMode = "diamond") {
    try {
      const keys = await this.defaultPlacementService.getAvailablePlacementKeys(
        motionData.motion_type,
        pictographData.grid_mode
      );
      const defaultPlacements = Object.fromEntries(
        (keys || []).map((k) => [k, true])
      );
      const placementKey = this.placementKeyService.generatePlacementKey(
        motionData,
        pictographData,
        defaultPlacements,
        gridMode
      );
      const adjustmentPoint = await this.defaultPlacementService.getDefaultAdjustment(
        placementKey,
        motionData.turns || 0,
        motionData.motion_type,
        gridMode
      );
      return adjustmentPoint;
    } catch (error) {
      console.error("Error calculating default adjustment:", error);
      throw new Error(`Default adjustment calculation failed: ${error}`);
    }
  }
}
class DefaultPlacementService {
  placementDataService;
  constructor() {
    this.placementDataService = new ArrowPlacementDataService();
  }
  /**
   * Get default adjustment for arrow placement using placement key and turns.
   * This mirrors the Python get_default_adjustment() method.
   *
   * @param placementKey - The placement identifier
   * @param turns - Number of turns or turn identifier
   * @param motionType - Motion type (pro, anti, float, dash, static)
   * @param gridMode - Grid mode (diamond, box)
   * @returns Adjustment coordinates {x, y}
   */
  async getDefaultAdjustment(placementKey, turns, motionType, gridMode) {
    console.log(
      `DefaultPlacementService.getDefaultAdjustment() called with:`,
      `placement_key=${placementKey}, turns=${turns}, motion_type=${motionType}, grid_mode=${gridMode}`
    );
    try {
      await this._loadAllDefaultPlacements();
      const adjustment = await this.placementDataService.getDefaultAdjustment(
        motionType,
        placementKey,
        turns,
        gridMode
      );
      console.log(
        `Found default adjustment for ${placementKey} at ${turns} turns: [${adjustment.x}, ${adjustment.y}]`
      );
      return adjustment;
    } catch (error) {
      console.warn(
        `Failed to get default adjustment for ${placementKey} at ${turns} turns:`,
        error
      );
      return { x: 0, y: 0 };
    }
  }
  /**
   * Get available placement keys for a given motion type and grid mode.
   * This mirrors the Python get_available_placement_keys() method.
   *
   * @param motionType - Motion type (pro, anti, float, dash, static)
   * @param gridMode - Grid mode (diamond, box)
   * @returns Array of available placement key strings
   */
  async getAvailablePlacementKeys(motionType, gridMode) {
    await this._loadAllDefaultPlacements();
    return this.placementDataService.getAvailablePlacementKeys(
      motionType,
      gridMode
    );
  }
  /**
   * Check if placement data has been loaded.
   * This mirrors the Python is_loaded() method.
   *
   * @returns true if data is loaded, false otherwise
   */
  isLoaded() {
    return this.placementDataService.isLoaded();
  }
  /**
   * Load all default placement data from JSON files.
   * This mirrors the Python _load_all_default_placements() method.
   *
   * The Python version loads from:
   * - /data/arrow_placement/{grid_mode}/default/{motion_type}_placements.json
   *
   * Our TypeScript version uses the same file structure and loading pattern.
   */
  async _loadAllDefaultPlacements() {
    if (this.placementDataService.isLoaded()) {
      return;
    }
    console.log("DefaultPlacementService: Loading all default placements...");
    try {
      await this.placementDataService.loadPlacementData();
      console.log(
        "✅ DefaultPlacementService: All placement data loaded successfully"
      );
    } catch (error) {
      console.error(
        "❌ DefaultPlacementService: Failed to load placement data:",
        error
      );
      throw new Error(
        `Default placement loading failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get raw placement data for debugging purposes.
   * This mirrors the Python get_placement_data() method.
   *
   * @param motionType - Motion type (pro, anti, float, dash, static)
   * @param placementKey - The placement identifier
   * @param gridMode - Grid mode (diamond, box)
   * @returns Raw placement data mapping turns to [x, y] adjustments
   */
  async getPlacementData(motionType, placementKey, gridMode) {
    await this._loadAllDefaultPlacements();
    return this.placementDataService.getPlacementData(
      motionType,
      placementKey,
      gridMode
    );
  }
  /**
   * Debug method to log available placement keys.
   * This mirrors the Python debug_available_keys() method.
   *
   * @param motionType - Motion type to debug
   * @param gridMode - Grid mode to debug
   */
  async debugAvailableKeys(motionType, gridMode) {
    await this._loadAllDefaultPlacements();
    await this.placementDataService.debugAvailableKeys(motionType, gridMode);
  }
}
class SpecialPlacementService {
  // Structure: [gridMode][oriKey][letter] -> Record<string, unknown>
  specialPlacements = {};
  loadingCache = /* @__PURE__ */ new Set();
  constructor() {
    this.specialPlacements = { diamond: {}, box: {} };
  }
  /**
   * Get special adjustment for arrow based on special placement logic.
   *
   * @param motionData Motion data containing motion information
   * @param pictographData Pictograph data containing letter and context
   * @param arrowColor Color of the arrow ('red' or 'blue') - if not provided, will try to determine from motion
   * @returns Point with special adjustment or null if no special placement found
   */
  async getSpecialAdjustment(motionData, pictographData, arrowColor) {
    if (!motionData || !pictographData.letter) {
      return null;
    }
    const motion = motionData;
    const letter = pictographData.letter;
    const oriKey = this.generateOrientationKey(motion, pictographData);
    const gridMode = pictographData.grid_mode || "diamond";
    const turnsTuple = this.generateTurnsTuple(pictographData);
    await this.ensureLetterPlacementsLoaded(gridMode, oriKey, letter);
    const letterData = this.specialPlacements[gridMode]?.[oriKey]?.[letter];
    if (!letterData) {
      return null;
    }
    const turnData = letterData?.[turnsTuple];
    if (!turnData) {
      return null;
    }
    let colorKey = "";
    if (arrowColor) {
      colorKey = arrowColor;
    } else if (pictographData.motions?.blue && pictographData.motions.blue === motion) {
      colorKey = "blue";
    } else if (pictographData.motions?.red && pictographData.motions.red === motion) {
      colorKey = "red";
    } else {
      colorKey = "blue";
    }
    if (colorKey in turnData) {
      const adjustmentValues = turnData[colorKey];
      if (Array.isArray(adjustmentValues) && adjustmentValues.length === 2) {
        return { x: adjustmentValues[0], y: adjustmentValues[1] };
      }
    }
    const motionTypeKey = motionData.motion_type?.toLowerCase() || "";
    if (motionTypeKey in turnData) {
      const adjustmentValues = turnData[motionTypeKey];
      if (Array.isArray(adjustmentValues) && adjustmentValues.length === 2) {
        return { x: adjustmentValues[0], y: adjustmentValues[1] };
      }
    }
    return null;
  }
  /**
   * Load special placement data from JSON configuration files.
   */
  async ensureLetterPlacementsLoaded(gridMode, oriKey, letter) {
    try {
      if (!this.specialPlacements[gridMode]) {
        this.specialPlacements[gridMode] = {};
      }
      if (!this.specialPlacements[gridMode][oriKey]) {
        this.specialPlacements[gridMode][oriKey] = {};
      }
      if (this.specialPlacements[gridMode][oriKey][letter]) {
        return;
      }
      const cacheKey = `${gridMode}:${oriKey}:${letter}`;
      if (this.loadingCache.has(cacheKey)) {
        return;
      }
      this.loadingCache.add(cacheKey);
      const encodedLetter = encodeURIComponent(letter);
      const basePath = `/data/arrow_placement/${gridMode}/special/${oriKey}/${encodedLetter}_placements.json`;
      try {
        const response = await fetch(basePath);
        if (!response.ok) {
          console.debug(
            `No special placement file for ${gridMode}/${oriKey}/${letter}: ${response.status} ${response.statusText}`
          );
          this.specialPlacements[gridMode][oriKey][letter] = {};
          return;
        }
        const data = await response.json();
        this.specialPlacements[gridMode][oriKey][letter] = data;
        console.debug(
          `Loaded special placements for ${gridMode}/${oriKey}/${letter}`
        );
      } catch (error) {
        console.debug(
          `Failed to load special placements for ${gridMode}/${oriKey}/${letter} from ${basePath}:`,
          error
        );
        this.specialPlacements[gridMode][oriKey][letter] = {};
      }
    } catch (error) {
      console.error("Error ensuring special placement data:", error);
    }
  }
  /**
   * Generate orientation key matching the ori_key_generator logic.
   *
   * This determines which subfolder of special placements to use:
   * - from_layer1: Basic orientations
   * - from_layer2: Layer 2 orientations
   * - from_layer3_blue1_red2: Mixed orientations with blue on layer 1, red on layer 2
   * - from_layer3_blue2_red1: Mixed orientations with blue on layer 2, red on layer 1
   */
  generateOrientationKey(_motion, pictographData) {
    try {
      const blueMotion = pictographData.motions?.blue;
      const redMotion = pictographData.motions?.red;
      if (blueMotion && redMotion) {
        const blueEndOri = blueMotion.end_ori || "in";
        const redEndOri = redMotion.end_ori || "in";
        const blueLayer = ["in", "out"].includes(blueEndOri) ? 1 : 2;
        const redLayer = ["in", "out"].includes(redEndOri) ? 1 : 2;
        if (blueLayer === 1 && redLayer === 1) {
          return "from_layer1";
        }
        if (blueLayer === 2 && redLayer === 2) {
          return "from_layer2";
        }
        if (blueLayer === 1 && redLayer === 2) {
          return "from_layer3_blue1_red2";
        }
        if (blueLayer === 2 && redLayer === 1) {
          return "from_layer3_blue2_red1";
        }
        return "from_layer1";
      }
    } catch (error) {
      console.debug("Error generating orientation key:", error);
    }
    return "from_layer1";
  }
  /**
   * Generate turns tuple string matching the turns_tuple_generator logic.
   *
   * This creates a string representation of the turn values for lookup in JSON data.
   * Format: "(blue_turns, red_turns)" e.g., "(0, 1.5)", "(1, 0.5)"
   */
  generateTurnsTuple(pictographData) {
    try {
      const blueMotion = pictographData.motions?.blue;
      const redMotion = pictographData.motions?.red;
      if (blueMotion && redMotion) {
        const blueTurns = typeof blueMotion.turns === "number" ? blueMotion.turns : 0;
        const redTurns = typeof redMotion.turns === "number" ? redMotion.turns : 0;
        const blueStr = blueTurns === Math.floor(blueTurns) ? Math.floor(blueTurns).toString() : blueTurns.toString();
        const redStr = redTurns === Math.floor(redTurns) ? Math.floor(redTurns).toString() : redTurns.toString();
        return `(${blueStr}, ${redStr})`;
      }
      return "(0, 0)";
    } catch (error) {
      console.debug("Error generating turns tuple:", error);
      return "(0, 0)";
    }
  }
}
class DirectionalTupleCalculator {
  /**
   * Calculator for directional tuples used in arrow positioning.
   */
  calculateDirectionalTuple(_motion, _location) {
    return [0, 0];
  }
  generateDirectionalTuples(motion, baseX, baseY) {
    const mt = String(motion.motion_type).toLowerCase();
    const rot = String(motion.prop_rot_dir).toLowerCase();
    const NE = Location.NORTHEAST;
    const SE = Location.SOUTHEAST;
    const SW = Location.SOUTHWEST;
    const NW = Location.NORTHWEST;
    const N = Location.NORTH;
    const E = Location.EAST;
    const S = Location.SOUTH;
    const W = Location.WEST;
    const diagonalSet = /* @__PURE__ */ new Set([NE, SE, SW, NW]);
    const gridIsDiamond = diagonalSet.has(motion.start_loc) || diagonalSet.has(motion.end_loc);
    const isCW = rot === "clockwise" || rot === "cw";
    const isCCW = rot === "counter_clockwise" || rot === "ccw";
    const isNoRot = rot === "no_rot";
    const tuple = (a, b) => [a, b];
    const shiftDiamond = () => {
      if (mt === "float") {
        const order = [NE, SE, SW, NW];
        const idxStart = order.indexOf(motion.start_loc);
        const idxEnd = order.indexOf(motion.end_loc);
        const cwStep = (idxStart + 1) % 4 === idxEnd;
        if (cwStep) {
          return [
            tuple(baseX, baseY),
            tuple(-baseY, baseX),
            tuple(-baseX, -baseY),
            tuple(baseY, -baseX)
          ];
        } else {
          return [
            tuple(-baseY, -baseX),
            tuple(baseX, -baseY),
            tuple(baseY, baseX),
            tuple(-baseX, baseY)
          ];
        }
      }
      if (mt === "pro" && isCW)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX)
        ];
      if (mt === "pro" && isCCW)
        return [
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX),
          tuple(-baseX, baseY)
        ];
      if (mt === "anti" && isCW)
        return [
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX),
          tuple(-baseX, baseY)
        ];
      if (mt === "anti" && isCCW)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX)
        ];
      return [
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY)
      ];
    };
    const shiftBox = () => {
      if (mt === "float") {
        const order = [N, E, S, W];
        const idxStart = order.indexOf(motion.start_loc);
        const idxEnd = order.indexOf(motion.end_loc);
        const cwStep = (idxStart + 1) % 4 === idxEnd;
        if (cwStep) {
          return [
            tuple(baseX, baseY),
            tuple(-baseY, baseX),
            tuple(-baseX, -baseY),
            tuple(baseY, -baseX)
          ];
        } else {
          return [
            tuple(-baseY, -baseX),
            tuple(baseX, -baseY),
            tuple(baseY, baseX),
            tuple(-baseX, baseY)
          ];
        }
      }
      if (mt === "pro" && isCW)
        return [
          tuple(-baseX, baseY),
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX)
        ];
      if (mt === "pro" && isCCW)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX)
        ];
      if (mt === "anti" && isCW)
        return [
          tuple(-baseX, baseY),
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX)
        ];
      if (mt === "anti" && isCCW)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX)
        ];
      return [
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY)
      ];
    };
    const dashDiamond = () => {
      if (isCW)
        return [
          tuple(baseX, -baseY),
          tuple(baseY, baseX),
          tuple(-baseX, baseY),
          tuple(-baseY, -baseX)
        ];
      if (isCCW)
        return [
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX),
          tuple(baseX, baseY),
          tuple(-baseY, baseX)
        ];
      if (isNoRot)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX)
        ];
      return [
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY)
      ];
    };
    const dashBox = () => {
      if (isCW)
        return [
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX),
          tuple(baseX, baseY)
        ];
      if (isCCW)
        return [
          tuple(-baseX, baseY),
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX)
        ];
      if (isNoRot)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX)
        ];
      return [
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY),
        tuple(baseX, baseY)
      ];
    };
    const staticDiamond = () => {
      if (isCW)
        return [
          tuple(baseX, -baseY),
          tuple(baseY, baseX),
          tuple(-baseX, baseY),
          tuple(-baseY, -baseX)
        ];
      if (isCCW)
        return [
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX),
          tuple(baseX, baseY),
          tuple(-baseY, baseX)
        ];
      return [
        tuple(baseX, baseY),
        tuple(-baseX, -baseY),
        tuple(-baseY, baseX),
        tuple(baseY, -baseX)
      ];
    };
    const staticBox = () => {
      if (isCW)
        return [
          tuple(baseX, baseY),
          tuple(-baseY, baseX),
          tuple(-baseX, -baseY),
          tuple(baseY, -baseX)
        ];
      if (isCCW)
        return [
          tuple(-baseY, -baseX),
          tuple(baseX, -baseY),
          tuple(baseY, baseX),
          tuple(-baseX, baseY)
        ];
      return [
        tuple(baseX, baseY),
        tuple(-baseY, baseX),
        tuple(-baseX, -baseY),
        tuple(baseY, -baseX)
      ];
    };
    if (mt === "dash") return gridIsDiamond ? dashDiamond() : dashBox();
    if (mt === "static") return gridIsDiamond ? staticDiamond() : staticBox();
    return gridIsDiamond ? shiftDiamond() : shiftBox();
  }
}
class QuadrantIndexCalculator {
  /**
   * Calculator for quadrant indices used in directional tuple selection.
   */
  calculateQuadrantIndex(location) {
    const quadrantMap = {
      [Location.NORTHEAST]: 0,
      [Location.SOUTHEAST]: 1,
      [Location.SOUTHWEST]: 2,
      [Location.NORTHWEST]: 3,
      // Cardinal directions map to nearest quadrant
      [Location.NORTH]: 0,
      // Maps to NE quadrant
      [Location.EAST]: 1,
      // Maps to SE quadrant
      [Location.SOUTH]: 2,
      // Maps to SW quadrant
      [Location.WEST]: 3
      // Maps to NW quadrant
    };
    return quadrantMap[location] || 0;
  }
}
class DirectionalTupleProcessor {
  /**
   * Processor for applying directional tuple adjustments to arrow positioning.
   */
  constructor(directionalTupleService, quadrantIndexService) {
    this.directionalTupleService = directionalTupleService;
    this.quadrantIndexService = quadrantIndexService;
  }
  processDirectionalTuples(baseAdjustment, _motion, location) {
    try {
      const directionalTuples = this.directionalTupleService.generateDirectionalTuples(
        _motion,
        baseAdjustment.x,
        baseAdjustment.y
      );
      const quadrantIndex = this.quadrantIndexService.calculateQuadrantIndex(location);
      const selectedTuple = directionalTuples[quadrantIndex] || [0, 0];
      return { x: selectedTuple[0], y: selectedTuple[1] };
    } catch (error) {
      console.warn(
        "Directional tuple processing failed, using base adjustment:",
        error
      );
      return baseAdjustment;
    }
  }
}
class ArrowAdjustmentCalculator {
  /**
   * Clean coordinator service for arrow positioning with proper error handling.
   *
   * Delegates to focused services:
   * - ArrowAdjustmentLookup: Special/default placement lookups
   * - DirectionalTupleProcessor: Tuple generation and selection
   *
   * Provides comprehensive arrow positioning adjustment calculation.
   */
  lookupService;
  tupleProcessor;
  constructor(lookupService, tupleProcessor) {
    this.lookupService = lookupService || this.createDefaultLookupService();
    this.tupleProcessor = tupleProcessor || this.createDefaultTupleProcessor();
  }
  async calculateAdjustment(pictographData, motionData, letter, location, arrowColor) {
    try {
      return await this.calculateAdjustmentResult(
        pictographData,
        motionData,
        letter,
        location,
        arrowColor
      );
    } catch (error) {
      console.error(`Adjustment calculation failed: ${error}`);
      return { x: 0, y: 0 };
    }
  }
  async calculateAdjustmentResult(pictographData, motionData, letter, location, arrowColor) {
    try {
      const baseAdjustment = await this.lookupService.getBaseAdjustment(
        pictographData,
        motionData,
        letter,
        arrowColor
      );
      const finalAdjustment = this.tupleProcessor.processDirectionalTuples(
        baseAdjustment,
        motionData,
        location
      );
      return finalAdjustment;
    } catch (error) {
      console.error(
        `Adjustment calculation failed for letter ${letter}: ${error}`
      );
      throw new Error(`Arrow adjustment calculation failed: ${error}`);
    }
  }
  calculateAdjustmentSync(pictographData, motionData, letter, location, arrowColor) {
    try {
      const baseAdjustment = this.getBasicAdjustmentSync(motionData);
      const finalAdjustment = this.tupleProcessor.processDirectionalTuples(
        baseAdjustment,
        motionData,
        location
      );
      console.debug(
        `Sync adjustment for ${motionData.motion_type} ${motionData.turns} turns at ${location}: (${finalAdjustment.x}, ${finalAdjustment.y})`
      );
      return finalAdjustment;
    } catch (error) {
      console.warn(
        `Sync adjustment calculation failed for letter ${letter}: ${error}`
      );
      return { x: 0, y: 0 };
    }
  }
  getBasicAdjustmentSync(motionData) {
    const motionType = motionData.motion_type;
    const turns = typeof motionData.turns === "number" ? motionData.turns : 0;
    const turnsStr = turns === Math.floor(turns) ? turns.toString() : turns.toString();
    const placementData = {
      [MotionType.PRO]: {
        "0": [-10, -40],
        "0.5": [30, 105],
        "1": [30, 25],
        "1.5": [-35, 145],
        "2": [-10, -35],
        "2.5": [20, 100],
        "3": [30, 25]
      },
      [MotionType.ANTI]: {
        "0": [0, -40],
        "0.5": [-15, 110],
        "1": [0, -40],
        "1.5": [20, 155],
        "2": [0, -40],
        "2.5": [0, 100],
        "3": [0, -50]
      },
      [MotionType.STATIC]: {
        "0": [0, 0],
        "0.5": [0, -140],
        "1": [50, 50],
        "1.5": [0, 0],
        "2": [0, 0],
        "2.5": [0, 0],
        "3": [0, 0]
      },
      [MotionType.DASH]: {
        "0": [0, 0]
      },
      [MotionType.FLOAT]: {
        fl: [30, -30]
      }
    };
    const motionAdjustments = placementData[motionType];
    if (motionAdjustments && motionAdjustments[turnsStr]) {
      const [x, y] = motionAdjustments[turnsStr];
      return { x, y };
    }
    return { x: 0, y: 0 };
  }
  createDefaultLookupService() {
    return new ArrowAdjustmentLookup(
      new SpecialPlacementService(),
      new DefaultPlacementService(),
      new SpecialPlacementOriKeyGenerator(),
      new PlacementKeyGenerator(),
      new TurnsTupleKeyGenerator(),
      new AttributeKeyGenerator()
    );
  }
  createDefaultTupleProcessor() {
    return new DirectionalTupleProcessor(
      new DirectionalTupleCalculator(),
      new QuadrantIndexCalculator()
    );
  }
}
class DashLocationCalculator {
  /**
   * Dash location calculation service.
   *
   * Implements comprehensive dash location calculation logic including:
   * - Φ_DASH and Ψ_DASH special handling
   * - Λ (Lambda) zero turns special case
   * - Type 3 scenario detection and handling
   * - Grid mode specific calculations (Diamond/Box)
   * - Complex location mappings for different scenarios
   */
  // Predefined location mappings for dash calculations - comprehensive mapping
  PHI_DASH_PSI_DASH_LOCATION_MAP = {
    [`red,${Location.NORTH},${Location.SOUTH}`]: Location.EAST,
    [`red,${Location.EAST},${Location.WEST}`]: Location.NORTH,
    [`red,${Location.SOUTH},${Location.NORTH}`]: Location.EAST,
    [`red,${Location.WEST},${Location.EAST}`]: Location.NORTH,
    [`blue,${Location.NORTH},${Location.SOUTH}`]: Location.WEST,
    [`blue,${Location.EAST},${Location.WEST}`]: Location.SOUTH,
    [`blue,${Location.SOUTH},${Location.NORTH}`]: Location.WEST,
    [`blue,${Location.WEST},${Location.EAST}`]: Location.SOUTH,
    [`red,${Location.NORTHWEST},${Location.SOUTHEAST}`]: Location.NORTHEAST,
    [`red,${Location.NORTHEAST},${Location.SOUTHWEST}`]: Location.SOUTHEAST,
    [`red,${Location.SOUTHWEST},${Location.NORTHEAST}`]: Location.SOUTHEAST,
    [`red,${Location.SOUTHEAST},${Location.NORTHWEST}`]: Location.NORTHEAST,
    [`blue,${Location.NORTHWEST},${Location.SOUTHEAST}`]: Location.SOUTHWEST,
    [`blue,${Location.NORTHEAST},${Location.SOUTHWEST}`]: Location.NORTHWEST,
    [`blue,${Location.SOUTHWEST},${Location.NORTHEAST}`]: Location.NORTHWEST,
    [`blue,${Location.SOUTHEAST},${Location.NORTHWEST}`]: Location.SOUTHWEST
  };
  LAMBDA_ZERO_TURNS_LOCATION_MAP = {
    [`${Location.NORTH},${Location.SOUTH},${Location.WEST}`]: Location.EAST,
    [`${Location.EAST},${Location.WEST},${Location.SOUTH}`]: Location.NORTH,
    [`${Location.NORTH},${Location.SOUTH},${Location.EAST}`]: Location.WEST,
    [`${Location.WEST},${Location.EAST},${Location.SOUTH}`]: Location.NORTH,
    [`${Location.SOUTH},${Location.NORTH},${Location.WEST}`]: Location.EAST,
    [`${Location.EAST},${Location.WEST},${Location.NORTH}`]: Location.SOUTH,
    [`${Location.SOUTH},${Location.NORTH},${Location.EAST}`]: Location.WEST,
    [`${Location.WEST},${Location.EAST},${Location.NORTH}`]: Location.SOUTH,
    [`${Location.NORTHEAST},${Location.SOUTHWEST},${Location.NORTHWEST}`]: Location.SOUTHEAST,
    [`${Location.NORTHWEST},${Location.SOUTHEAST},${Location.NORTHEAST}`]: Location.SOUTHWEST,
    [`${Location.SOUTHWEST},${Location.NORTHEAST},${Location.SOUTHEAST}`]: Location.NORTHWEST,
    [`${Location.SOUTHEAST},${Location.NORTHWEST},${Location.SOUTHWEST}`]: Location.NORTHEAST,
    [`${Location.NORTHEAST},${Location.SOUTHWEST},${Location.SOUTHEAST}`]: Location.NORTHWEST,
    [`${Location.NORTHWEST},${Location.SOUTHEAST},${Location.SOUTHWEST}`]: Location.NORTHEAST,
    [`${Location.SOUTHWEST},${Location.NORTHEAST},${Location.NORTHWEST}`]: Location.SOUTHEAST,
    [`${Location.SOUTHEAST},${Location.NORTHWEST},${Location.NORTHEAST}`]: Location.SOUTHWEST
  };
  LAMBDA_DASH_ZERO_TURNS_LOCATION_MAP = {
    [`${Location.NORTH},${Location.SOUTH},${Location.WEST}`]: Location.EAST,
    [`${Location.EAST},${Location.WEST},${Location.SOUTH}`]: Location.NORTH,
    [`${Location.NORTH},${Location.SOUTH},${Location.EAST}`]: Location.WEST,
    [`${Location.WEST},${Location.EAST},${Location.SOUTH}`]: Location.NORTH,
    [`${Location.SOUTH},${Location.NORTH},${Location.WEST}`]: Location.EAST,
    [`${Location.EAST},${Location.WEST},${Location.NORTH}`]: Location.SOUTH,
    [`${Location.SOUTH},${Location.NORTH},${Location.EAST}`]: Location.WEST,
    [`${Location.WEST},${Location.EAST},${Location.NORTH}`]: Location.SOUTH,
    [`${Location.NORTHEAST},${Location.SOUTHWEST},${Location.NORTHWEST}`]: Location.SOUTHEAST,
    [`${Location.NORTHWEST},${Location.SOUTHEAST},${Location.NORTHEAST}`]: Location.SOUTHWEST,
    [`${Location.SOUTHWEST},${Location.NORTHEAST},${Location.SOUTHEAST}`]: Location.NORTHWEST,
    [`${Location.SOUTHEAST},${Location.NORTHWEST},${Location.SOUTHWEST}`]: Location.NORTHEAST,
    [`${Location.NORTHEAST},${Location.SOUTHWEST},${Location.SOUTHEAST}`]: Location.NORTHWEST,
    [`${Location.NORTHWEST},${Location.SOUTHEAST},${Location.SOUTHWEST}`]: Location.NORTHEAST,
    [`${Location.SOUTHWEST},${Location.NORTHEAST},${Location.NORTHWEST}`]: Location.SOUTHEAST,
    [`${Location.SOUTHEAST},${Location.NORTHWEST},${Location.NORTHEAST}`]: Location.SOUTHWEST
  };
  DEFAULT_ZERO_TURNS_DASH_LOCATION_MAP = {
    [`${Location.NORTH},${Location.SOUTH}`]: Location.EAST,
    [`${Location.EAST},${Location.WEST}`]: Location.SOUTH,
    [`${Location.SOUTH},${Location.NORTH}`]: Location.WEST,
    [`${Location.WEST},${Location.EAST}`]: Location.NORTH,
    [`${Location.NORTHEAST},${Location.SOUTHWEST}`]: Location.SOUTHEAST,
    [`${Location.NORTHWEST},${Location.SOUTHEAST}`]: Location.NORTHEAST,
    [`${Location.SOUTHWEST},${Location.NORTHEAST}`]: Location.NORTHWEST,
    [`${Location.SOUTHEAST},${Location.NORTHWEST}`]: Location.SOUTHWEST
  };
  NON_ZERO_TURNS_DASH_LOCATION_MAP = {
    clockwise: {
      [Location.NORTH]: Location.EAST,
      [Location.EAST]: Location.SOUTH,
      [Location.SOUTH]: Location.WEST,
      [Location.WEST]: Location.NORTH,
      [Location.NORTHEAST]: Location.SOUTHEAST,
      [Location.SOUTHEAST]: Location.SOUTHWEST,
      [Location.SOUTHWEST]: Location.NORTHWEST,
      [Location.NORTHWEST]: Location.NORTHEAST
    },
    counter_clockwise: {
      [Location.NORTH]: Location.WEST,
      [Location.EAST]: Location.NORTH,
      [Location.SOUTH]: Location.EAST,
      [Location.WEST]: Location.SOUTH,
      [Location.NORTHEAST]: Location.NORTHWEST,
      [Location.SOUTHEAST]: Location.NORTHEAST,
      [Location.SOUTHWEST]: Location.SOUTHEAST,
      [Location.NORTHWEST]: Location.SOUTHWEST
    }
  };
  DIAMOND_DASH_LOCATION_MAP = {
    [`${Location.NORTH},${Location.NORTHWEST}`]: Location.EAST,
    [`${Location.NORTH},${Location.NORTHEAST}`]: Location.WEST,
    [`${Location.NORTH},${Location.SOUTHEAST}`]: Location.WEST,
    [`${Location.NORTH},${Location.SOUTHWEST}`]: Location.EAST,
    [`${Location.EAST},${Location.NORTHWEST}`]: Location.SOUTH,
    [`${Location.EAST},${Location.NORTHEAST}`]: Location.SOUTH,
    [`${Location.EAST},${Location.SOUTHEAST}`]: Location.NORTH,
    [`${Location.EAST},${Location.SOUTHWEST}`]: Location.NORTH,
    [`${Location.SOUTH},${Location.NORTHWEST}`]: Location.EAST,
    [`${Location.SOUTH},${Location.NORTHEAST}`]: Location.WEST,
    [`${Location.SOUTH},${Location.SOUTHEAST}`]: Location.WEST,
    [`${Location.SOUTH},${Location.SOUTHWEST}`]: Location.EAST,
    [`${Location.WEST},${Location.NORTHWEST}`]: Location.SOUTH,
    [`${Location.WEST},${Location.NORTHEAST}`]: Location.SOUTH,
    [`${Location.WEST},${Location.SOUTHEAST}`]: Location.NORTH,
    [`${Location.WEST},${Location.SOUTHWEST}`]: Location.NORTH
  };
  BOX_DASH_LOCATION_MAP = {
    [`${Location.NORTHEAST},${Location.NORTH}`]: Location.SOUTHEAST,
    [`${Location.NORTHEAST},${Location.EAST}`]: Location.NORTHWEST,
    [`${Location.NORTHEAST},${Location.SOUTH}`]: Location.NORTHWEST,
    [`${Location.NORTHEAST},${Location.WEST}`]: Location.SOUTHEAST,
    [`${Location.SOUTHEAST},${Location.NORTH}`]: Location.SOUTHWEST,
    [`${Location.SOUTHEAST},${Location.EAST}`]: Location.SOUTHWEST,
    [`${Location.SOUTHEAST},${Location.SOUTH}`]: Location.NORTHEAST,
    [`${Location.SOUTHEAST},${Location.WEST}`]: Location.NORTHEAST,
    [`${Location.SOUTHWEST},${Location.NORTH}`]: Location.SOUTHEAST,
    [`${Location.SOUTHWEST},${Location.EAST}`]: Location.NORTHWEST,
    [`${Location.SOUTHWEST},${Location.SOUTH}`]: Location.NORTHWEST,
    [`${Location.SOUTHWEST},${Location.WEST}`]: Location.SOUTHEAST,
    [`${Location.NORTHWEST},${Location.NORTH}`]: Location.SOUTHWEST,
    [`${Location.NORTHWEST},${Location.EAST}`]: Location.SOUTHWEST,
    [`${Location.NORTHWEST},${Location.SOUTH}`]: Location.NORTHEAST,
    [`${Location.NORTHWEST},${Location.WEST}`]: Location.NORTHEAST
  };
  calculateDashLocationFromPictographData(pictographData, isBlueArrow) {
    const motion = isBlueArrow ? pictographData.motions?.blue : pictographData.motions?.red;
    const otherMotion = isBlueArrow ? pictographData.motions?.red : pictographData.motions?.blue;
    if (!motion || motion.motion_type?.toLowerCase() !== "dash") {
      return motion?.start_loc || Location.NORTH;
    }
    const letterInfo = this.getLetterInfo(pictographData);
    const gridInfo = this.getGridInfo(pictographData);
    const arrowColor = this.getArrowColor(isBlueArrow);
    return this.calculateDashLocation(
      motion,
      otherMotion,
      letterInfo.letterType,
      arrowColor,
      gridInfo.gridMode,
      gridInfo.shiftLocation,
      letterInfo.isPhiDash,
      letterInfo.isPsiDash,
      letterInfo.isLambda,
      letterInfo.isLambdaDash
    );
  }
  calculateDashLocation(motion, otherMotion, letterType, arrowColor, gridMode, shiftLocation, isPhiDash = false, isPsiDash = false, isLambda = false, isLambdaDash = false) {
    if (isPhiDash || isPsiDash) {
      return this.getPhiDashPsiDashLocation(motion, otherMotion, arrowColor);
    }
    if (isLambda && motion.turns === 0 && otherMotion) {
      return this.getLambdaZeroTurnsLocation(motion, otherMotion);
    }
    if (isLambdaDash && motion.turns === 0 && otherMotion) {
      return this.getLambdaDashZeroTurnsLocation(motion, otherMotion);
    }
    if (motion.turns === 0) {
      return this.defaultZeroTurnsDashLocation(
        motion,
        letterType,
        gridMode,
        shiftLocation
      );
    }
    return this.dashLocationNonZeroTurns(motion);
  }
  getLambdaDashZeroTurnsLocation(motion, otherMotion) {
    const key = `${motion.start_loc},${motion.end_loc},${otherMotion.end_loc}`;
    return this.LAMBDA_DASH_ZERO_TURNS_LOCATION_MAP[key] || motion.start_loc;
  }
  getPhiDashPsiDashLocation(motion, otherMotion, arrowColor) {
    if (!otherMotion || !arrowColor) {
      return this.defaultZeroTurnsDashLocation(motion);
    }
    if (motion.turns === 0 && otherMotion.turns === 0) {
      const key = `${arrowColor},${motion.start_loc},${motion.end_loc}`;
      return this.PHI_DASH_PSI_DASH_LOCATION_MAP[key] || motion.start_loc;
    }
    if (motion.turns === 0) {
      const oppositeLocation = this.dashLocationNonZeroTurns(otherMotion);
      return this.getOppositeLocation(oppositeLocation);
    }
    return this.dashLocationNonZeroTurns(motion);
  }
  getLambdaZeroTurnsLocation(motion, otherMotion) {
    const key = `${motion.start_loc},${motion.end_loc},${otherMotion.end_loc}`;
    return this.LAMBDA_ZERO_TURNS_LOCATION_MAP[key] || motion.start_loc;
  }
  defaultZeroTurnsDashLocation(motion, letterType, gridMode, shiftLocation) {
    if (letterType === "Type3" && gridMode && shiftLocation) {
      return this.calculateDashLocationBasedOnShift(
        motion,
        gridMode,
        shiftLocation
      );
    }
    const key = `${motion.start_loc},${motion.end_loc}`;
    return this.DEFAULT_ZERO_TURNS_DASH_LOCATION_MAP[key] || motion.start_loc;
  }
  dashLocationNonZeroTurns(motion) {
    const rotDir = motion.prop_rot_dir?.toLowerCase();
    if (rotDir === "no_rotation" || rotDir === "none") {
      return motion.start_loc;
    }
    const directionMap = this.NON_ZERO_TURNS_DASH_LOCATION_MAP[rotDir] || this.NON_ZERO_TURNS_DASH_LOCATION_MAP["clockwise"];
    return directionMap?.[motion.start_loc] || motion.start_loc;
  }
  calculateDashLocationBasedOnShift(motion, gridMode, shiftLocation) {
    const startLoc = motion.start_loc;
    if (gridMode === "diamond") {
      const key = `${startLoc},${shiftLocation}`;
      return this.DIAMOND_DASH_LOCATION_MAP[key] || startLoc;
    } else if (gridMode === "box") {
      const key = `${startLoc},${shiftLocation}`;
      return this.BOX_DASH_LOCATION_MAP[key] || startLoc;
    }
    return this.defaultZeroTurnsDashLocation(motion);
  }
  getOppositeLocation(location) {
    const oppositeMap = {
      [Location.NORTH]: Location.SOUTH,
      [Location.SOUTH]: Location.NORTH,
      [Location.EAST]: Location.WEST,
      [Location.WEST]: Location.EAST,
      [Location.NORTHEAST]: Location.SOUTHWEST,
      [Location.SOUTHWEST]: Location.NORTHEAST,
      [Location.SOUTHEAST]: Location.NORTHWEST,
      [Location.NORTHWEST]: Location.SOUTHEAST
    };
    return oppositeMap[location] || location;
  }
  // Simplified helper methods for extracting information from pictograph data
  getLetterInfo(pictographData) {
    const letter = pictographData.letter?.toUpperCase() || "";
    return {
      letterType: "TYPE1",
      // Simplified - would need proper letter analysis
      isPhiDash: letter.includes("Φ_DASH") || letter.includes("PHI_DASH"),
      isPsiDash: letter.includes("Ψ_DASH") || letter.includes("PSI_DASH"),
      isLambda: letter.includes("Λ") || letter === "LAMBDA",
      isLambdaDash: letter.includes("Λ_DASH") || letter.includes("LAMBDA_DASH")
    };
  }
  getGridInfo(pictographData) {
    const result = {
      gridMode: pictographData.grid_mode || "diamond"
    };
    return result;
  }
  getArrowColor(isBlueArrow) {
    return isBlueArrow ? "blue" : "red";
  }
}
class ArrowLocationCalculator {
  /**
   * Pure algorithmic service for calculating arrow locations.
   *
   * Implements location calculation algorithms without any UI dependencies.
   * Each motion type has its own calculation strategy.
   */
  dashLocationService;
  // Direction pairs mapping for shift arrows (PRO/ANTI/FLOAT)
  // Maps start/end location pairs to their calculated arrow location
  shiftDirectionPairs = {
    // Cardinal + Diagonal combinations
    [this.createLocationPairKey([Location.NORTH, Location.EAST])]: Location.NORTHEAST,
    [this.createLocationPairKey([Location.EAST, Location.SOUTH])]: Location.SOUTHEAST,
    [this.createLocationPairKey([Location.SOUTH, Location.WEST])]: Location.SOUTHWEST,
    [this.createLocationPairKey([Location.WEST, Location.NORTH])]: Location.NORTHWEST,
    // Diagonal + Cardinal combinations
    [this.createLocationPairKey([Location.NORTHEAST, Location.NORTHWEST])]: Location.NORTH,
    [this.createLocationPairKey([Location.NORTHEAST, Location.SOUTHEAST])]: Location.EAST,
    [this.createLocationPairKey([Location.SOUTHWEST, Location.SOUTHEAST])]: Location.SOUTH,
    [this.createLocationPairKey([Location.NORTHWEST, Location.SOUTHWEST])]: Location.WEST
  };
  constructor(dashLocationService) {
    this.dashLocationService = dashLocationService || new DashLocationCalculator();
  }
  calculateLocation(motion, pictographData) {
    const motionType = motion.motion_type?.toLowerCase();
    switch (motionType) {
      case "static":
        return this.calculateStaticLocation(motion);
      case "pro":
      case "anti":
      case "float":
        return this.calculateShiftLocation(motion);
      case "dash":
        return this.calculateDashLocation(motion, pictographData);
      default:
        console.warn(
          `Unknown motion type: ${motionType}, using start location`
        );
        return motion.start_loc || Location.NORTH;
    }
  }
  calculateStaticLocation(motion) {
    return motion.start_loc || Location.NORTH;
  }
  calculateShiftLocation(motion) {
    if (!motion.start_loc || !motion.end_loc) {
      console.warn(
        "Shift motion missing start_loc or end_loc, using start_loc"
      );
      return motion.start_loc || Location.NORTH;
    }
    const locationPairKey = this.createLocationPairKey([
      motion.start_loc,
      motion.end_loc
    ]);
    const calculatedLocation = this.shiftDirectionPairs[locationPairKey] || motion.start_loc;
    return calculatedLocation;
  }
  calculateDashLocation(motion, pictographData) {
    if (!pictographData) {
      console.warn(
        "No pictograph data provided for dash location calculation, using start location"
      );
      return motion.start_loc || Location.NORTH;
    }
    const isBlueArrow = this.isBlueArrowMotion(motion, pictographData);
    return this.dashLocationService.calculateDashLocationFromPictographData(
      pictographData,
      isBlueArrow
    );
  }
  getSupportedMotionTypes() {
    return ["static", "pro", "anti", "float", "dash"];
  }
  validateMotionData(motion) {
    if (!motion) {
      return false;
    }
    const motionType = motion.motion_type?.toLowerCase();
    if (!this.getSupportedMotionTypes().includes(motionType)) {
      return false;
    }
    if (["pro", "anti", "float"].includes(motionType || "")) {
      return motion.start_loc != null && motion.end_loc != null;
    }
    if (["static", "dash"].includes(motionType || "")) {
      return motion.start_loc != null;
    }
    return true;
  }
  extractBeatDataFromPictograph(pictograph) {
    if (!pictograph.arrows) {
      return null;
    }
    const blueMotion = pictograph.motions?.blue;
    const redMotion = pictograph.motions?.red;
    return {
      beatNumber: pictograph.metadata?.created_from_beat || 1,
      letter: pictograph.letter,
      pictographData: {
        motions: {
          blue: blueMotion,
          red: redMotion
        }
      }
    };
  }
  isBlueArrowMotion(motion, pictographData) {
    if (pictographData.motions?.blue === motion) {
      return true;
    }
    if (pictographData.motions?.red === motion) {
      return false;
    }
    console.warn("Could not determine arrow color for motion, assuming blue");
    return true;
  }
  /**
   * Create a normalized key for location pairs to enable bidirectional lookup.
   * This ensures that [A, B] and [B, A] produce the same key.
   */
  createLocationPairKey(locations) {
    const sortedLocations = [...locations].sort();
    return sortedLocations.join(",");
  }
}
class ArrowRotationCalculator {
  /**
   * Pure algorithmic service for calculating arrow rotation angles.
   *
   * Implements rotation calculation algorithms without any UI dependencies.
   * Each motion type has its own rotation strategy based on proven algorithms.
   */
  // Static arrow rotation angles (arrows point inward by default)
  staticRotationMap = {
    [Location.NORTH]: 180,
    [Location.NORTHEAST]: 225,
    [Location.EAST]: 270,
    [Location.SOUTHEAST]: 315,
    [Location.SOUTH]: 0,
    [Location.SOUTHWEST]: 45,
    [Location.WEST]: 90,
    [Location.NORTHWEST]: 135
  };
  // PRO rotation angles by rotation direction
  proClockwiseMap = {
    [Location.NORTH]: 315,
    [Location.EAST]: 45,
    [Location.SOUTH]: 135,
    [Location.WEST]: 225,
    [Location.NORTHEAST]: 0,
    [Location.SOUTHEAST]: 90,
    [Location.SOUTHWEST]: 180,
    [Location.NORTHWEST]: 270
  };
  proCounterClockwiseMap = {
    [Location.NORTH]: 315,
    [Location.EAST]: 225,
    [Location.SOUTH]: 135,
    [Location.WEST]: 45,
    [Location.NORTHEAST]: 90,
    [Location.SOUTHEAST]: 180,
    [Location.SOUTHWEST]: 270,
    [Location.NORTHWEST]: 0
  };
  // ANTI rotation angles by rotation direction
  antiClockwiseMap = {
    [Location.NORTH]: 315,
    [Location.EAST]: 225,
    [Location.SOUTH]: 135,
    [Location.WEST]: 45,
    [Location.NORTHEAST]: 90,
    [Location.SOUTHEAST]: 180,
    [Location.SOUTHWEST]: 270,
    [Location.NORTHWEST]: 0
  };
  antiCounterClockwiseMap = {
    [Location.NORTH]: 315,
    [Location.EAST]: 45,
    [Location.SOUTH]: 135,
    [Location.WEST]: 225,
    [Location.NORTHEAST]: 0,
    [Location.SOUTHEAST]: 90,
    [Location.SOUTHWEST]: 180,
    [Location.NORTHWEST]: 270
  };
  // DASH rotation angles by rotation direction
  dashClockwiseMap = {
    [Location.NORTH]: 270,
    [Location.EAST]: 0,
    [Location.SOUTH]: 90,
    [Location.WEST]: 180,
    [Location.NORTHEAST]: 315,
    [Location.SOUTHEAST]: 45,
    [Location.SOUTHWEST]: 135,
    [Location.NORTHWEST]: 225
  };
  dashCounterClockwiseMap = {
    [Location.NORTH]: 270,
    [Location.EAST]: 180,
    [Location.SOUTH]: 90,
    [Location.WEST]: 0,
    [Location.NORTHEAST]: 225,
    [Location.SOUTHEAST]: 135,
    [Location.SOUTHWEST]: 45,
    [Location.NORTHWEST]: 315
  };
  // DASH NO_ROTATION mapping (start_loc, end_loc) -> angle
  dashNoRotationMap = {
    [`${Location.NORTH},${Location.SOUTH}`]: 90,
    [`${Location.EAST},${Location.WEST}`]: 180,
    [`${Location.SOUTH},${Location.NORTH}`]: 270,
    [`${Location.WEST},${Location.EAST}`]: 0,
    [`${Location.SOUTHEAST},${Location.NORTHWEST}`]: 225,
    [`${Location.SOUTHWEST},${Location.NORTHEAST}`]: 315,
    [`${Location.NORTHWEST},${Location.SOUTHEAST}`]: 45,
    [`${Location.NORTHEAST},${Location.SOUTHWEST}`]: 135
  };
  calculateRotation(motion, location) {
    const motionType = motion.motion_type?.toLowerCase();
    switch (motionType) {
      case "static":
        return this.calculateStaticRotation(location);
      case "pro":
        return this.calculateProRotation(motion, location);
      case "anti":
        return this.calculateAntiRotation(motion, location);
      case "dash":
        return this.calculateDashRotation(motion, location);
      case "float":
        return this.calculateFloatRotation(motion, location);
      default:
        console.warn(`Unknown motion type: ${motionType}, returning 0.0`);
        return 0;
    }
  }
  calculateStaticRotation(location) {
    return this.staticRotationMap[location] || 0;
  }
  calculateProRotation(motion, location) {
    const rotDir = motion.prop_rot_dir?.toLowerCase();
    if (rotDir === "clockwise" || rotDir === "cw") {
      return this.proClockwiseMap[location] || 0;
    } else {
      return this.proCounterClockwiseMap[location] || 0;
    }
  }
  calculateAntiRotation(motion, location) {
    const rotDir = motion.prop_rot_dir?.toLowerCase();
    if (rotDir === "clockwise" || rotDir === "cw") {
      return this.antiClockwiseMap[location] || 0;
    } else {
      return this.antiCounterClockwiseMap[location] || 0;
    }
  }
  calculateDashRotation(motion, location) {
    const rotDir = motion.prop_rot_dir?.toLowerCase();
    if (rotDir === "no_rotation" || rotDir === "none") {
      const key = `${motion.start_loc},${motion.end_loc}`;
      return this.dashNoRotationMap[key] || 0;
    }
    if (rotDir === "clockwise" || rotDir === "cw") {
      return this.dashClockwiseMap[location] || 0;
    } else {
      return this.dashCounterClockwiseMap[location] || 0;
    }
  }
  calculateFloatRotation(motion, location) {
    return this.calculateProRotation(motion, location);
  }
  getSupportedMotionTypes() {
    return ["static", "pro", "anti", "dash", "float"];
  }
  validateMotionData(motion) {
    if (!motion) {
      return false;
    }
    const motionType = motion.motion_type?.toLowerCase();
    if (!this.getSupportedMotionTypes().includes(motionType)) {
      return false;
    }
    if (!motion.prop_rot_dir) {
      return false;
    }
    return true;
  }
}
class ArrowCoordinateSystemService {
  /**
   * Pure service for coordinate system management and initial position calculation.
   *
   * Manages the TKA coordinate systems without any UI dependencies.
   * Provides precise coordinate mappings for different arrow types.
   */
  // Scene dimensions: 950x950 scene with center at (475, 475)
  SCENE_SIZE = 950;
  CENTER_X = 475;
  CENTER_Y = 475;
  // Hand point coordinates (for STATIC/DASH arrows)
  // These are the inner grid positions where props are placed
  HAND_POINTS = {
    [Location.NORTH]: { x: 475, y: 331.9 },
    [Location.EAST]: { x: 618.1, y: 475 },
    [Location.SOUTH]: { x: 475, y: 618.1 },
    [Location.WEST]: { x: 331.9, y: 475 },
    // Diagonal hand points (calculated from radius)
    [Location.NORTHEAST]: { x: 618.1, y: 331.9 },
    [Location.SOUTHEAST]: { x: 618.1, y: 618.1 },
    [Location.SOUTHWEST]: { x: 331.9, y: 618.1 },
    [Location.NORTHWEST]: { x: 331.9, y: 331.9 }
  };
  // Layer2 point coordinates (for PRO/ANTI/FLOAT arrows)
  // Using DIAMOND layer2 points from circle_coords.json
  LAYER2_POINTS = {
    // Diamond layer2 points are diagonal positions
    [Location.NORTHEAST]: { x: 618.1, y: 331.9 },
    [Location.SOUTHEAST]: { x: 618.1, y: 618.1 },
    [Location.SOUTHWEST]: { x: 331.9, y: 618.1 },
    [Location.NORTHWEST]: { x: 331.9, y: 331.9 },
    // For cardinal directions, map to nearest diagonal
    [Location.NORTH]: { x: 618.1, y: 331.9 },
    // Maps to NE
    [Location.EAST]: { x: 618.1, y: 618.1 },
    // Maps to SE
    [Location.SOUTH]: { x: 331.9, y: 618.1 },
    // Maps to SW
    [Location.WEST]: { x: 331.9, y: 331.9 }
    // Maps to NW
  };
  getInitialPosition(motion, location) {
    const motionType = motion.motion_type?.toLowerCase();
    if (["pro", "anti", "float"].includes(motionType || "")) {
      return this.getLayer2Coords(location);
    } else if (["static", "dash"].includes(motionType || "")) {
      return this.getHandPointCoords(location);
    } else {
      console.warn(`Unknown motion type: ${motionType}, using center`);
      return this.getSceneCenter();
    }
  }
  getSceneCenter() {
    return { x: this.CENTER_X, y: this.CENTER_Y };
  }
  getLayer2Coords(location) {
    const coords = this.LAYER2_POINTS[location];
    if (!coords) {
      console.warn(
        `No layer2 coordinates for location: ${location}, using center`
      );
      return this.getSceneCenter();
    }
    return coords;
  }
  getHandPointCoords(location) {
    const coords = this.HAND_POINTS[location];
    if (!coords) {
      console.warn(
        `No hand point coordinates for location: ${location}, using center`
      );
      return this.getSceneCenter();
    }
    return coords;
  }
  getSceneDimensions() {
    return [this.SCENE_SIZE, this.SCENE_SIZE];
  }
  getCoordinateInfo(location) {
    const handPoint = this.HAND_POINTS[location];
    const layer2Point = this.LAYER2_POINTS[location];
    return {
      location,
      hand_point: {
        x: handPoint?.x || null,
        y: handPoint?.y || null
      },
      layer2_point: {
        x: layer2Point?.x || null,
        y: layer2Point?.y || null
      },
      scene_center: { x: this.CENTER_X, y: this.CENTER_Y },
      scene_size: this.SCENE_SIZE
    };
  }
  validateCoordinates(point) {
    return point && typeof point.x === "number" && typeof point.y === "number" && point.x >= 0 && point.x <= this.SCENE_SIZE && point.y >= 0 && point.y <= this.SCENE_SIZE;
  }
  getAllHandPoints() {
    return { ...this.HAND_POINTS };
  }
  getAllLayer2Points() {
    return { ...this.LAYER2_POINTS };
  }
  getSupportedLocations() {
    return [
      Location.NORTH,
      Location.EAST,
      Location.SOUTH,
      Location.WEST,
      Location.NORTHEAST,
      Location.SOUTHEAST,
      Location.SOUTHWEST,
      Location.NORTHWEST
    ];
  }
}
class ArrowPositioningOrchestrator {
  /**
   * Orchestrator that coordinates all positioning microservices.
   *
   * Uses:
   * - ArrowLocationCalculator: Sophisticated location calculation with special cases
   * - ArrowRotationCalculator: Comprehensive rotation calculation with all motion types
   * - ArrowAdjustmentCalculator: Complex adjustment calculation with special/default placement
   * - ArrowCoordinateSystemService: Precise TKA coordinate system management
   */
  locationCalculator;
  rotationCalculator;
  adjustmentCalculator;
  coordinateSystem;
  mirrorConditions = {
    anti: { cw: true, ccw: false },
    other: { cw: false, ccw: true }
  };
  constructor(locationCalculator, rotationCalculator, adjustmentCalculator, coordinateSystem) {
    this.locationCalculator = locationCalculator;
    this.rotationCalculator = rotationCalculator;
    this.adjustmentCalculator = adjustmentCalculator;
    this.coordinateSystem = coordinateSystem;
  }
  // Main async method for full positioning calculation
  async calculateArrowPositionAsync(arrowData, pictographData, motionData) {
    try {
      const motion = motionData || this.getMotionFromPictograph(arrowData, pictographData);
      if (!motion) {
        console.warn(
          `No motion data for ${arrowData.color}, returning center position`
        );
        const center = this.coordinateSystem.getSceneCenter();
        return [center.x, center.y, 0];
      }
      const letter = pictographData.letter || "";
      const location = this.locationCalculator.calculateLocation(
        motion,
        pictographData
      );
      console.debug(
        `Calculated location: ${location} for ${arrowData.color} ${motion.motion_type}`
      );
      let initialPosition = this.coordinateSystem.getInitialPosition(
        motion,
        location
      );
      initialPosition = this.ensureValidPosition(initialPosition);
      console.debug(
        `Initial position: (${initialPosition.x}, ${initialPosition.y})`
      );
      const rotation = this.rotationCalculator.calculateRotation(
        motion,
        location
      );
      console.debug(
        `Calculated rotation: ${rotation}° for ${motion.motion_type} ${motion.prop_rot_dir}`
      );
      const adjustment = await this.adjustmentCalculator.calculateAdjustment(
        pictographData,
        motion,
        letter,
        location,
        arrowData.color
      );
      console.debug(
        `Calculated adjustment: (${adjustment.x}, ${adjustment.y})`
      );
      const [adjustmentX, adjustmentY] = this.extractAdjustmentValues(adjustment);
      const finalX = initialPosition.x + adjustmentX;
      const finalY = initialPosition.y + adjustmentY;
      return [finalX, finalY, rotation];
    } catch (error) {
      console.error("Arrow positioning failed:", error);
      const center = this.coordinateSystem.getSceneCenter();
      return [center.x, center.y, 0];
    }
  }
  // Synchronous version implementing IArrowPositioningOrchestrator interface
  calculateArrowPosition(arrowData, pictographData, motionData) {
    try {
      const motion = motionData || this.getMotionFromPictograph(arrowData, pictographData);
      if (!motion) {
        console.warn(
          `No motion data for ${arrowData.color}, returning center position`
        );
        const center = this.coordinateSystem.getSceneCenter();
        return [center.x, center.y, 0];
      }
      const letter = pictographData.letter || "";
      const location = this.locationCalculator.calculateLocation(
        motion,
        pictographData
      );
      let initialPosition = this.coordinateSystem.getInitialPosition(
        motion,
        location
      );
      initialPosition = this.ensureValidPosition(initialPosition);
      const rotation = this.rotationCalculator.calculateRotation(
        motion,
        location
      );
      const adjustment = this.adjustmentCalculator.calculateAdjustmentSync(
        pictographData,
        motion,
        letter,
        location,
        arrowData.color
      );
      const [adjustmentX, adjustmentY] = this.extractAdjustmentValues(adjustment);
      const finalX = initialPosition.x + adjustmentX;
      const finalY = initialPosition.y + adjustmentY;
      return [finalX, finalY, rotation];
    } catch (error) {
      console.error("Synchronous arrow positioning failed:", error);
      const center = this.coordinateSystem.getSceneCenter();
      return [center.x, center.y, 0];
    }
  }
  calculateAllArrowPositions(pictographData) {
    let updatedPictograph = pictographData;
    try {
      if (!pictographData.arrows) {
        return updatedPictograph;
      }
      for (const [color, arrowData] of Object.entries(pictographData.arrows)) {
        const motionData = pictographData.motions?.[color];
        if (arrowData.is_visible && motionData) {
          const [x, y, rotation] = this.calculateArrowPositionSync(
            arrowData,
            pictographData,
            motionData
          );
          const shouldMirror = this.shouldMirrorArrow(
            arrowData,
            pictographData
          );
          updatedPictograph = this.updateArrowInPictograph(
            updatedPictograph,
            color,
            {
              position_x: x,
              position_y: y,
              rotation_angle: rotation,
              is_mirrored: shouldMirror
            }
          );
          console.log(
            `Updated ${color} arrow: position=(${x}, ${y}), rotation=${rotation}°, mirrored=${shouldMirror}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to calculate all arrow positions:", error);
    }
    return updatedPictograph;
  }
  shouldMirrorArrow(arrowData, pictographData) {
    try {
      let motion;
      if (pictographData?.motions) {
        motion = pictographData.motions[arrowData.color];
      }
      if (!motion) {
        return false;
      }
      const motionType = (motion.motion_type || "").toLowerCase();
      const propRotDir = (motion.prop_rot_dir || "").toLowerCase();
      if (motionType === "anti") {
        return this.mirrorConditions.anti[propRotDir] || false;
      }
      return this.mirrorConditions.other[propRotDir] || false;
    } catch (error) {
      console.warn("Mirror calculation failed, using default:", error);
      return false;
    }
  }
  applyMirrorTransform(arrowItem, shouldMirror) {
    try {
      if (shouldMirror) {
        const rect = arrowItem.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const scaleX = -1;
        const transform = `translate(${centerX}px, ${centerY}px) scale(${scaleX}, 1) translate(${-centerX}px, ${-centerY}px)`;
        arrowItem.style.transform = transform;
      } else {
        arrowItem.style.transform = "";
      }
    } catch (error) {
      console.warn("Failed to apply mirror transform:", error);
    }
  }
  // Private helper methods
  calculateArrowPositionSync(_arrowData, _pictographData, motionData) {
    const motion = motionData;
    const letter = _pictographData.letter || "";
    const location = this.locationCalculator.calculateLocation(
      motion,
      _pictographData
    );
    let initialPosition = this.coordinateSystem.getInitialPosition(
      motion,
      location
    );
    initialPosition = this.ensureValidPosition(initialPosition);
    const rotation = this.rotationCalculator.calculateRotation(
      motion,
      location
    );
    const adjustment = this.getBasicAdjustment(motion, letter);
    const [adjustmentX, adjustmentY] = this.extractAdjustmentValues(adjustment);
    const finalX = initialPosition.x + adjustmentX;
    const finalY = initialPosition.y + adjustmentY;
    return [finalX, finalY, rotation];
  }
  getMotionFromPictograph(arrowData, pictographData) {
    if (!pictographData?.motions) {
      return void 0;
    }
    return pictographData.motions[arrowData.color];
  }
  ensureValidPosition(initialPosition) {
    if (initialPosition && typeof initialPosition.x === "number" && typeof initialPosition.y === "number") {
      return initialPosition;
    }
    console.warn("Invalid initial position, using scene center");
    return this.coordinateSystem.getSceneCenter();
  }
  extractAdjustmentValues(adjustment) {
    if (typeof adjustment === "number") {
      return [adjustment, adjustment];
    }
    if (adjustment && typeof adjustment.x === "number" && typeof adjustment.y === "number") {
      return [adjustment.x, adjustment.y];
    }
    return [0, 0];
  }
  getBasicAdjustment(motion, _letter) {
    try {
      const location = this.locationCalculator.calculateLocation(motion, {
        letter: _letter
      });
      const baseAdjustment = this.getBaseAdjustmentValues(motion);
      const finalAdjustment = this.processDirectionalTuples(
        baseAdjustment,
        motion,
        location
      );
      console.debug(
        `Basic adjustment for ${motion.motion_type} ${motion.turns} turns at ${location}: (${finalAdjustment.x}, ${finalAdjustment.y})`
      );
      return finalAdjustment;
    } catch (error) {
      console.warn("Basic adjustment calculation failed:", error);
      return { x: 0, y: 0 };
    }
  }
  getBaseAdjustmentValues(motion) {
    const motionType = motion.motion_type;
    const turns = typeof motion.turns === "number" ? motion.turns : 0;
    const turnsStr = turns === Math.floor(turns) ? turns.toString() : turns.toString();
    const defaultAdjustments = {
      pro: {
        "0": [-10, -40],
        "0.5": [30, 105],
        "1": [30, 25],
        "1.5": [-35, 145],
        "2": [-10, -35],
        "2.5": [20, 100],
        "3": [30, 25]
      },
      anti: {
        "0": [0, -40],
        "0.5": [-15, 110],
        "1": [0, -40],
        "1.5": [20, 155],
        "2": [0, -40],
        "2.5": [0, 100],
        "3": [0, -50]
      },
      static: {
        "0": [0, 0]
      },
      dash: {
        "0": [0, 0]
      },
      float: {
        "0": [0, 0]
      }
    };
    const motionAdjustments = defaultAdjustments[motionType];
    if (motionAdjustments && motionAdjustments[turnsStr]) {
      const [x, y] = motionAdjustments[turnsStr];
      return { x, y };
    }
    return { x: 0, y: 0 };
  }
  processDirectionalTuples(baseAdjustment, motion, location) {
    try {
      const directionalTuples = this.generateDirectionalTuples(
        motion,
        baseAdjustment.x,
        baseAdjustment.y
      );
      const quadrantIndex = this.calculateQuadrantIndex(location);
      const selectedTuple = directionalTuples[quadrantIndex] || [0, 0];
      console.debug(
        `Directional tuples: ${JSON.stringify(directionalTuples)}, quadrant: ${quadrantIndex}, selected: [${selectedTuple[0]}, ${selectedTuple[1]}]`
      );
      return { x: selectedTuple[0], y: selectedTuple[1] };
    } catch (error) {
      console.warn(
        "Directional tuple processing failed, using base adjustment:",
        error
      );
      return baseAdjustment;
    }
  }
  generateDirectionalTuples(motion, baseX, baseY) {
    const motionType = motion.motion_type;
    const rotationDir = motion.prop_rot_dir;
    const rotationStr = rotationDir === RotationDirection.CLOCKWISE ? "clockwise" : rotationDir === RotationDirection.COUNTER_CLOCKWISE ? "counter_clockwise" : "clockwise";
    const shiftMappingDiamond = {
      [MotionType.PRO]: {
        clockwise: (x, y) => [
          [x, y],
          // NE (0)
          [-y, x],
          // SE (1)
          [-x, -y],
          // SW (2)
          [y, -x]
          // NW (3)
        ],
        counter_clockwise: (x, y) => [
          [-y, -x],
          // NE (0)
          [x, -y],
          // SE (1)
          [y, x],
          // SW (2)
          [-x, y]
          // NW (3)
        ]
      },
      [MotionType.ANTI]: {
        clockwise: (x, y) => [
          [-y, -x],
          // NE (0)
          [x, -y],
          // SE (1)
          [y, x],
          // SW (2)
          [-x, y]
          // NW (3)
        ],
        counter_clockwise: (x, y) => [
          [x, y],
          // NE (0)
          [-y, x],
          // SE (1)
          [-x, -y],
          // SW (2)
          [y, -x]
          // NW (3)
        ]
      }
    };
    if (motionType === MotionType.STATIC || motionType === MotionType.DASH || motionType === MotionType.FLOAT) {
      return [
        [baseX, baseY],
        [-baseX, -baseY],
        [-baseY, baseX],
        [baseY, -baseX]
      ];
    }
    const mapping = shiftMappingDiamond[motionType];
    if (mapping && mapping[rotationStr]) {
      const transformFunc = mapping[rotationStr];
      return transformFunc(baseX, baseY);
    }
    return [
      [baseX, baseY],
      [baseX, baseY],
      [baseX, baseY],
      [baseX, baseY]
    ];
  }
  calculateQuadrantIndex(location) {
    const quadrantMap = {
      [Location.NORTHEAST]: 0,
      [Location.SOUTHEAST]: 1,
      [Location.SOUTHWEST]: 2,
      [Location.NORTHWEST]: 3,
      // Cardinal directions map to nearest quadrant
      [Location.NORTH]: 0,
      // Maps to NE quadrant
      [Location.EAST]: 1,
      // Maps to SE quadrant
      [Location.SOUTH]: 2,
      // Maps to SW quadrant
      [Location.WEST]: 3
      // Maps to NW quadrant
    };
    return quadrantMap[location] || 0;
  }
  updateArrowInPictograph(pictographData, color, updates) {
    const updatedPictograph = { ...pictographData };
    if (updatedPictograph.arrows && updatedPictograph.arrows[color]) {
      updatedPictograph.arrows = {
        ...updatedPictograph.arrows,
        [color]: {
          ...updatedPictograph.arrows[color],
          ...updates
        }
      };
    }
    return updatedPictograph;
  }
}
class PositioningServiceFactory {
  /**
   * Factory for creating the complete positioning service ecosystem.
   *
   * Creates all services with proper dependency injection and ensures
   * they are wired together correctly for optimal positioning accuracy.
   */
  static instance;
  // Singleton services (shared across all arrows)
  dashLocationCalculator;
  coordinateSystemService;
  specialPlacementService;
  defaultPlacementService;
  directionalTupleProcessor;
  /**
   * Get the singleton instance of the positioning service factory.
   */
  static getInstance() {
    if (!PositioningServiceFactory.instance) {
      PositioningServiceFactory.instance = new PositioningServiceFactory();
    }
    return PositioningServiceFactory.instance;
  }
  createLocationCalculator() {
    if (!this.dashLocationCalculator) {
      this.dashLocationCalculator = this.createDashLocationCalculator();
    }
    return new ArrowLocationCalculator(this.dashLocationCalculator);
  }
  createRotationCalculator() {
    return new ArrowRotationCalculator();
  }
  createAdjustmentCalculator() {
    if (!this.specialPlacementService) {
      this.specialPlacementService = new SpecialPlacementService();
    }
    if (!this.defaultPlacementService) {
      this.defaultPlacementService = new DefaultPlacementService();
    }
    if (!this.directionalTupleProcessor) {
      this.directionalTupleProcessor = this.createDirectionalTupleProcessor();
    }
    const lookupService = new ArrowAdjustmentLookup(
      this.specialPlacementService,
      this.defaultPlacementService,
      new SpecialPlacementOriKeyGenerator(),
      new PlacementKeyGenerator(),
      new TurnsTupleKeyGenerator(),
      new AttributeKeyGenerator()
    );
    return new ArrowAdjustmentCalculator(
      lookupService,
      // Use cached placement services
      this.directionalTupleProcessor
    );
  }
  createCoordinateSystemService() {
    if (!this.coordinateSystemService) {
      this.coordinateSystemService = new ArrowCoordinateSystemService();
    }
    return this.coordinateSystemService;
  }
  createDashLocationCalculator() {
    if (!this.dashLocationCalculator) {
      this.dashLocationCalculator = new DashLocationCalculator();
    }
    return this.dashLocationCalculator;
  }
  createDirectionalTupleProcessor() {
    if (!this.directionalTupleProcessor) {
      const directionalTupleCalculator = new DirectionalTupleCalculator();
      const quadrantIndexCalculator = new QuadrantIndexCalculator();
      this.directionalTupleProcessor = new DirectionalTupleProcessor(
        directionalTupleCalculator,
        quadrantIndexCalculator
      );
    }
    return this.directionalTupleProcessor;
  }
  createPositioningOrchestrator() {
    const locationCalculator = this.createLocationCalculator();
    const rotationCalculator = this.createRotationCalculator();
    const adjustmentCalculator = this.createAdjustmentCalculator();
    const coordinateSystemService = this.createCoordinateSystemService();
    return new ArrowPositioningOrchestrator(
      locationCalculator,
      rotationCalculator,
      adjustmentCalculator,
      coordinateSystemService
    );
  }
  /**
   * Create a complete positioning pipeline for use in services.
   * Returns all the key services needed for positioning operations.
   */
  createPositioningPipeline() {
    return {
      locationCalculator: this.createLocationCalculator(),
      rotationCalculator: this.createRotationCalculator(),
      adjustmentCalculator: this.createAdjustmentCalculator(),
      coordinateSystemService: this.createCoordinateSystemService(),
      orchestrator: this.createPositioningOrchestrator()
    };
  }
  /**
   * Reset all singleton services (useful for testing).
   */
  resetServices() {
    this.dashLocationCalculator = void 0;
    this.coordinateSystemService = void 0;
    this.specialPlacementService = void 0;
    this.defaultPlacementService = void 0;
    this.directionalTupleProcessor = void 0;
  }
  /**
   * Pre-warm all services by creating them in advance.
   * Useful for ensuring consistent performance.
   */
  async preWarmServices() {
    console.log("Pre-warming positioning services...");
    this.createLocationCalculator();
    this.createRotationCalculator();
    this.createCoordinateSystemService();
    this.createDirectionalTupleProcessor();
    if (!this.defaultPlacementService) {
      this.defaultPlacementService = new DefaultPlacementService();
    }
    if (!this.defaultPlacementService.isLoaded()) {
      try {
        await this.defaultPlacementService.debugAvailableKeys(
          MotionType.PRO,
          GridMode.DIAMOND
        );
        console.log("✅ Positioning services pre-warmed successfully");
      } catch (error) {
        console.warn("⚠️ Some positioning services failed to pre-warm:", error);
      }
    }
  }
}
function getPositioningServiceFactory() {
  return PositioningServiceFactory.getInstance();
}
class ArrowPositioningService {
  orchestrator;
  constructor() {
    const factory = getPositioningServiceFactory();
    this.orchestrator = factory.createPositioningOrchestrator();
  }
  /**
   * Calculate arrow position using the sophisticated positioning pipeline
   */
  async calculatePosition(arrowData, motionData, pictographData) {
    console.log(
      `🎯 ArrowPositioningService.calculatePosition called for ${arrowData.color} arrow`
    );
    console.log(`Arrow data:`, {
      motion_type: arrowData.motion_type,
      start_orientation: arrowData.start_orientation,
      end_orientation: arrowData.end_orientation,
      turns: arrowData.turns,
      position_x: arrowData.position_x,
      position_y: arrowData.position_y
    });
    console.log(`Motion data:`, {
      motion_type: motionData.motion_type,
      start_loc: motionData.start_loc,
      end_loc: motionData.end_loc,
      turns: motionData.turns
    });
    try {
      console.log(`🔧 Calling orchestrator.calculateArrowPosition...`);
      const [x, y, rotation] = this.orchestrator.calculateArrowPosition(
        arrowData,
        pictographData,
        motionData
      );
      console.log(
        `✅ Orchestrator returned: (${x}, ${y}) rotation: ${rotation}°`
      );
      return { x, y, rotation };
    } catch (error) {
      console.error("Sophisticated positioning failed, using fallback:", error);
      return this.getFallbackPosition(motionData);
    }
  }
  /**
   * Synchronous position calculation (may not include full adjustments)
   */
  calculatePositionSync(arrowData, motionData, pictographData) {
    try {
      console.log(`🎯 Calculating sync position for ${arrowData.color} arrow`);
      console.log(
        `Motion: ${motionData.motion_type}, Start: ${motionData.start_loc}, End: ${motionData.end_loc}`
      );
      const [x, y, rotation] = this.orchestrator.calculateArrowPosition(
        arrowData,
        pictographData,
        motionData
      );
      console.log(
        `✅ Calculated sync position: (${x}, ${y}) rotation: ${rotation}°`
      );
      return { x, y, rotation };
    } catch (error) {
      console.error("Synchronous positioning failed, using fallback:", error);
      return this.getFallbackPosition(motionData);
    }
  }
  /**
   * Determine if arrow should be mirrored based on motion data
   */
  shouldMirror(arrowData, _motionData, pictographData) {
    try {
      return this.orchestrator.shouldMirrorArrow(arrowData, pictographData);
    } catch (error) {
      console.warn("Failed to determine mirror state, using default:", error);
      return false;
    }
  }
  /**
   * Legacy interface for backward compatibility
   */
  async calculatePosition_legacy(input) {
    const arrowData = {
      color: input.arrow_type,
      arrow_type: input.arrow_type === "blue" ? ArrowType.BLUE : ArrowType.RED,
      location: input.location,
      motion_type: input.motion_type
    };
    const motionData = {
      motion_type: input.motion_type,
      start_loc: input.location,
      start_ori: input.start_orientation || "in",
      end_ori: input.end_orientation || "in",
      prop_rot_dir: "cw",
      turns: input.turns
    };
    const pictographData = {
      letter: input.letter || "A",
      grid_mode: input.grid_mode,
      motions: {
        [input.arrow_type]: motionData
      }
    };
    const result = await this.calculatePosition(
      arrowData,
      motionData,
      pictographData
    );
    return { x: result.x, y: result.y };
  }
  /**
   * Fallback position calculation using basic coordinates
   */
  getFallbackPosition(motionData) {
    const coordinates = this.calculateLocationCoordinates(
      motionData.start_loc || "center"
    );
    console.log(
      `🔄 Using fallback position: (${coordinates.x}, ${coordinates.y})`
    );
    return {
      x: coordinates.x,
      y: coordinates.y,
      rotation: 0
    };
  }
  /**
   * Basic coordinate calculation as fallback
   */
  calculateLocationCoordinates(location) {
    const diamondCoordinates = {
      // Cardinal directions (hand_points)
      n: { x: 475, y: 331.9 },
      e: { x: 618.1, y: 475 },
      s: { x: 475, y: 618.1 },
      w: { x: 331.9, y: 475 },
      // Diagonal directions (layer2_points) - used for arrows
      ne: { x: 618.1, y: 331.9 },
      se: { x: 618.1, y: 618.1 },
      sw: { x: 331.9, y: 618.1 },
      nw: { x: 331.9, y: 331.9 },
      // Center point
      center: { x: 475, y: 475 }
    };
    const coords = diamondCoordinates[location.toLowerCase()];
    return coords || { x: 475, y: 475 };
  }
}
new ArrowPositioningService();
export {
  ArrowPlacementDataService as A,
  DashLocationCalculator as D,
  PositioningServiceFactory as P,
  createGridData as a,
  createArrowData as b,
  createPictographData as c,
  createPropData as d,
  ArrowPlacementKeyService as e,
  ArrowLocationCalculator as f,
  ArrowRotationCalculator as g,
  ArrowAdjustmentCalculator as h,
  ArrowCoordinateSystemService as i,
  DirectionalTupleProcessor as j,
  ArrowPositioningOrchestrator as k
};
