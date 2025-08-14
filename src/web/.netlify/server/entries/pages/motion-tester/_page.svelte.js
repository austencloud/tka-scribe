import { d as attr_class, b as attr, f as stringify, p as pop, a as push, e as escape_html, i as attr_style, j as spread_attributes, c as ensure_array_like, k as spread_props, m as maybe_selected, h as head } from "../../../chunks/index.js";
import "clsx";
import { M as MotionType, O as Orientation, R as RotationDirection, L as Location, G as GridMode } from "../../../chunks/enums.js";
import { c as createPictographData, a as createGridData } from "../../../chunks/PictographVisualizationPanel.svelte_svelte_type_style_lang.js";
const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = PI / 2;
const locationAngles = {
  e: 0,
  s: HALF_PI,
  w: PI,
  n: -HALF_PI
};
function normalizeAnglePositive(angle) {
  let norm = angle % TWO_PI;
  return norm < 0 ? norm + TWO_PI : norm;
}
function normalizeAngleSigned(angle) {
  let norm = normalizeAnglePositive(angle);
  return norm > PI ? norm - TWO_PI : norm;
}
function mapPositionToAngle(loc) {
  const l = loc?.toLowerCase();
  return locationAngles[l] ?? 0;
}
function mapOrientationToAngle(ori, centerPathAngle) {
  if (!ori) return centerPathAngle + PI;
  const l = ori.toLowerCase();
  if (locationAngles.hasOwnProperty(l)) {
    return locationAngles[l];
  }
  if (l === "in") {
    return normalizeAnglePositive(centerPathAngle + PI);
  }
  if (l === "out") {
    return normalizeAnglePositive(centerPathAngle);
  }
  return normalizeAnglePositive(centerPathAngle + PI);
}
function lerpAngle(a, b, t) {
  const d = normalizeAngleSigned(b - a);
  return normalizeAnglePositive(a + d * t);
}
function calculateProIsolationStaffAngle(centerPathAngle, _propRotDir) {
  return normalizeAnglePositive(centerPathAngle + PI);
}
function calculateProTargetAngle(startCenterAngle, targetCenterAngle, startStaffAngle, turns, propRotDir) {
  console.log(
    "🔧 [PRO DEBUG] ===== CALCULATING PRO TARGET ANGLE WITH TURNS ====="
  );
  console.log("🔧 [PRO DEBUG] Input parameters:");
  console.log(
    "🔧 [PRO DEBUG]   startCenterAngle:",
    startCenterAngle,
    "radians",
    (startCenterAngle * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [PRO DEBUG]   targetCenterAngle:",
    targetCenterAngle,
    "radians",
    (targetCenterAngle * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [PRO DEBUG]   startStaffAngle:",
    startStaffAngle,
    "radians",
    (startStaffAngle * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log("🔧 [PRO DEBUG]   turns:", turns);
  console.log("🔧 [PRO DEBUG]   propRotDir:", propRotDir);
  let delta = normalizeAngleSigned(targetCenterAngle - startCenterAngle);
  const base = delta;
  const turn = PI * turns;
  const dir = propRotDir?.toLowerCase() === "ccw" ? -1 : 1;
  const result = normalizeAnglePositive(startStaffAngle + base + turn * dir);
  console.log("🔧 [PRO DEBUG] Calculation steps:");
  console.log(
    "🔧 [PRO DEBUG]   delta (target - start):",
    delta,
    "radians",
    (delta * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [PRO DEBUG]   base (delta):",
    base,
    "radians",
    (base * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [PRO DEBUG]   turn (PI * turns):",
    turn,
    "radians",
    (turn * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log("🔧 [PRO DEBUG]   dir (rotation direction):", dir);
  console.log(
    "🔧 [PRO DEBUG]   raw result (start + base + turn * dir):",
    startStaffAngle + base + turn * dir
  );
  console.log(
    "🔧 [PRO DEBUG]   normalized result:",
    result,
    "radians",
    (result * 180 / PI).toFixed(1),
    "degrees"
  );
  return result;
}
function calculateAntispinTargetAngle(startCenterAngle, targetCenterAngle, startStaffAngle, turns, propRotDir) {
  console.log("🔧 [ANTI DEBUG] ===== CALCULATING ANTI-SPIN TARGET ANGLE =====");
  console.log("🔧 [ANTI DEBUG] Input parameters:");
  console.log(
    "🔧 [ANTI DEBUG]   startCenterAngle:",
    startCenterAngle,
    "radians",
    (startCenterAngle * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [ANTI DEBUG]   targetCenterAngle:",
    targetCenterAngle,
    "radians",
    (targetCenterAngle * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [ANTI DEBUG]   startStaffAngle:",
    startStaffAngle,
    "radians",
    (startStaffAngle * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log("🔧 [ANTI DEBUG]   turns:", turns);
  console.log("🔧 [ANTI DEBUG]   propRotDir:", propRotDir);
  let delta = normalizeAngleSigned(targetCenterAngle - startCenterAngle);
  const base = -delta;
  const turn = PI * turns;
  const dir = propRotDir?.toLowerCase() === "ccw" ? -1 : 1;
  const result = normalizeAnglePositive(startStaffAngle + base + turn * dir);
  console.log("🔧 [ANTI DEBUG] Calculation steps:");
  console.log(
    "🔧 [ANTI DEBUG]   delta (target - start):",
    delta,
    "radians",
    (delta * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [ANTI DEBUG]   base (-delta):",
    base,
    "radians",
    (base * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log(
    "🔧 [ANTI DEBUG]   turn (PI * turns):",
    turn,
    "radians",
    (turn * 180 / PI).toFixed(1),
    "degrees"
  );
  console.log("🔧 [ANTI DEBUG]   dir (rotation direction):", dir);
  console.log(
    "🔧 [ANTI DEBUG]   raw result (start + base + turn * dir):",
    startStaffAngle + base + turn * dir
  );
  console.log(
    "🔧 [ANTI DEBUG]   normalized result:",
    result,
    "radians",
    (result * 180 / PI).toFixed(1),
    "degrees"
  );
  return result;
}
function calculateDashTargetAngle(startStaffAngle, endOri, targetCenterAngle) {
  if (endOri?.toLowerCase() === "in") {
    return normalizeAnglePositive(targetCenterAngle + PI);
  } else if (endOri?.toLowerCase() === "out") {
    return targetCenterAngle;
  }
  return startStaffAngle;
}
function calculateStepEndpoints(stepDefinition, propType) {
  const attributes = propType === "blue" ? stepDefinition.blue_attributes : stepDefinition.red_attributes;
  if (!attributes) return null;
  const {
    start_loc,
    end_loc,
    start_ori,
    end_ori,
    motion_type,
    prop_rot_dir,
    turns = 0
  } = attributes;
  const startCenterAngle = mapPositionToAngle(start_loc);
  const startStaffAngle = mapOrientationToAngle(
    start_ori || "in",
    startCenterAngle
  );
  const targetCenterAngle = mapPositionToAngle(end_loc);
  let calculatedTargetStaffAngle;
  switch (motion_type) {
    case "pro":
      if (turns > 0) {
        calculatedTargetStaffAngle = calculateProTargetAngle(
          startCenterAngle,
          targetCenterAngle,
          startStaffAngle,
          turns,
          prop_rot_dir || "cw"
        );
      } else {
        calculatedTargetStaffAngle = calculateProIsolationStaffAngle(
          targetCenterAngle
        );
      }
      break;
    case "anti":
      calculatedTargetStaffAngle = calculateAntispinTargetAngle(
        startCenterAngle,
        targetCenterAngle,
        startStaffAngle,
        turns || 0,
        prop_rot_dir || "cw"
      );
      break;
    case "static":
      const endOriAngleStatic = mapOrientationToAngle(
        end_ori || "in",
        targetCenterAngle
      );
      const angleDiffStatic = normalizeAngleSigned(
        endOriAngleStatic - startStaffAngle
      );
      calculatedTargetStaffAngle = Math.abs(angleDiffStatic) > 0.1 ? endOriAngleStatic : startStaffAngle;
      break;
    case "dash":
      calculatedTargetStaffAngle = calculateDashTargetAngle(
        startStaffAngle,
        end_ori || "in",
        targetCenterAngle
      );
      break;
    default:
      console.warn(`Unknown motion type '${motion_type}'. Treating as static.`);
      calculatedTargetStaffAngle = startStaffAngle;
      break;
  }
  if (motion_type !== "pro") {
    const endOriAngleOverride = mapOrientationToAngle(
      end_ori || "in",
      targetCenterAngle
    );
    const explicitEndOri = ["n", "e", "s", "w", "in", "out"].includes(
      (end_ori || "").toLowerCase()
    );
    if (explicitEndOri) {
      calculatedTargetStaffAngle = endOriAngleOverride;
    }
  }
  return {
    startCenterAngle,
    startStaffAngle,
    targetCenterAngle,
    targetStaffAngle: calculatedTargetStaffAngle
  };
}
const GRID_VIEWBOX_SIZE = 950;
const GRID_CENTER = GRID_VIEWBOX_SIZE / 2;
const GRID_HALFWAY_POINT_OFFSET = 151.5;
class SequenceAnimationEngine {
  parsedSteps = [];
  totalBeats = 0;
  metadata = { word: "", author: "", totalBeats: 0 };
  // Prop states
  bluePropState = {
    centerPathAngle: 0,
    staffRotationAngle: 0,
    x: 0,
    y: 0
  };
  redPropState = {
    centerPathAngle: 0,
    staffRotationAngle: 0,
    x: 0,
    y: 0
  };
  /**
   * Initialize with sequence data in standalone format
   */
  initialize(sequenceData) {
    try {
      console.log(
        "StandalonePortedEngine: Initializing with data:",
        sequenceData
      );
      if (!Array.isArray(sequenceData) || sequenceData.length < 3) {
        throw new Error("Invalid sequence data format");
      }
      const meta = sequenceData[0] || {};
      this.metadata = {
        word: meta.word || "",
        author: meta.author || "",
        totalBeats: sequenceData.length - 2
        // Subtract metadata and start position
      };
      this.parsedSteps = sequenceData;
      this.totalBeats = this.metadata.totalBeats;
      console.log(
        "StandalonePortedEngine: Parsed steps:",
        this.parsedSteps.length
      );
      console.log("StandalonePortedEngine: Total beats:", this.totalBeats);
      this.initializePropStates();
      return true;
    } catch (error) {
      console.error("StandalonePortedEngine: Failed to initialize:", error);
      return false;
    }
  }
  /**
   * Reset to initial state
   */
  reset() {
    this.initializePropStates();
  }
  /**
   * Calculate state for given beat using exact standalone logic
   */
  calculateState(currentBeat) {
    if (this.parsedSteps.length === 0 || this.totalBeats === 0) {
      console.warn("StandalonePortedEngine: No sequence data available");
      return;
    }
    const clampedBeat = Math.max(0, Math.min(currentBeat, this.totalBeats));
    const currentAnimationStepIndex = Math.floor(
      clampedBeat === this.totalBeats ? this.totalBeats - 1 : clampedBeat
    );
    const currentStepArrayIndex = currentAnimationStepIndex + 2;
    const t = clampedBeat === this.totalBeats ? 1 : clampedBeat - currentAnimationStepIndex;
    const stepDefinition = this.parsedSteps[currentStepArrayIndex];
    if (!stepDefinition) {
      console.error(
        `StandalonePortedEngine: No step definition for array index ${currentStepArrayIndex} (beat: ${clampedBeat})`
      );
      return;
    }
    const blueEndpoints = calculateStepEndpoints(stepDefinition, "blue");
    const redEndpoints = calculateStepEndpoints(stepDefinition, "red");
    if (blueEndpoints && redEndpoints) {
      console.log(
        "🔧 [MOTION DEBUG] ===== CALCULATING STATE FOR BEAT",
        currentBeat,
        "====="
      );
      console.log(
        "🔧 [MOTION DEBUG] Step definition:",
        JSON.stringify(stepDefinition, null, 2)
      );
      console.log("🔧 [MOTION DEBUG] Blue endpoints:", blueEndpoints);
      console.log("🔧 [MOTION DEBUG] Red endpoints:", redEndpoints);
      console.log("🔧 [MOTION DEBUG] Interpolation factor t:", t);
      this.bluePropState.centerPathAngle = lerpAngle(
        blueEndpoints.startCenterAngle,
        blueEndpoints.targetCenterAngle,
        t
      );
      this.bluePropState.staffRotationAngle = lerpAngle(
        blueEndpoints.startStaffAngle,
        blueEndpoints.targetStaffAngle,
        t
      );
      this.redPropState.centerPathAngle = lerpAngle(
        redEndpoints.startCenterAngle,
        redEndpoints.targetCenterAngle,
        t
      );
      this.redPropState.staffRotationAngle = lerpAngle(
        redEndpoints.startStaffAngle,
        redEndpoints.targetStaffAngle,
        t
      );
      console.log("🔧 [MOTION DEBUG] After interpolation:");
      console.log("🔧 [MOTION DEBUG] Blue state:", { ...this.bluePropState });
      console.log("🔧 [MOTION DEBUG] Red state:", { ...this.redPropState });
      console.log(
        "🔧 [MOTION DEBUG] Pro motion override removed - using calculated endpoints"
      );
      this.updateCoordinatesFromAngle(this.bluePropState);
      this.updateCoordinatesFromAngle(this.redPropState);
      console.log("🔧 [MOTION DEBUG] Final state after coordinate update:");
      console.log("🔧 [MOTION DEBUG] Blue final:", { ...this.bluePropState });
      console.log("🔧 [MOTION DEBUG] Red final:", { ...this.redPropState });
    } else {
      console.error(
        "StandalonePortedEngine: Could not calculate endpoints for step"
      );
    }
  }
  /**
   * Initialize prop states to start position using exact standalone logic
   */
  initializePropStates() {
    console.log(
      "🔧 [MOTION DEBUG] StandalonePortedEngine: Initializing prop states"
    );
    console.log(
      "🔧 [MOTION DEBUG] Parsed steps length:",
      this.parsedSteps.length
    );
    if (!this.parsedSteps || this.parsedSteps.length < 2) {
      console.warn(
        "🔧 [MOTION DEBUG] No parsed steps available, using fallback initialization"
      );
      this.bluePropState = {
        centerPathAngle: 0,
        staffRotationAngle: Math.PI,
        // 'in' orientation
        x: 0,
        y: 0
      };
      this.redPropState = {
        centerPathAngle: Math.PI,
        // Opposite side
        staffRotationAngle: 0,
        // 'in' orientation
        x: 0,
        y: 0
      };
    } else {
      const startStateStep = this.parsedSteps[1];
      console.log(
        "🔧 [MOTION DEBUG] Start state step:",
        JSON.stringify(startStateStep, null, 2)
      );
      const blueStartEndpoints = calculateStepEndpoints(startStateStep, "blue");
      const redStartEndpoints = calculateStepEndpoints(startStateStep, "red");
      console.log(
        "🔧 [MOTION DEBUG] Blue start endpoints:",
        blueStartEndpoints
      );
      console.log("🔧 [MOTION DEBUG] Red start endpoints:", redStartEndpoints);
      if (blueStartEndpoints) {
        this.bluePropState.centerPathAngle = blueStartEndpoints.startCenterAngle;
        this.bluePropState.staffRotationAngle = blueStartEndpoints.startStaffAngle;
      } else {
        console.warn("🔧 [MOTION DEBUG] No blue endpoints, using fallback");
        this.bluePropState.centerPathAngle = 0;
        this.bluePropState.staffRotationAngle = this.bluePropState.centerPathAngle + Math.PI;
      }
      if (redStartEndpoints) {
        this.redPropState.centerPathAngle = redStartEndpoints.startCenterAngle;
        this.redPropState.staffRotationAngle = redStartEndpoints.startStaffAngle;
      } else {
        console.warn("🔧 [MOTION DEBUG] No red endpoints, using fallback");
        this.redPropState.centerPathAngle = Math.PI;
        this.redPropState.staffRotationAngle = this.redPropState.centerPathAngle + Math.PI;
      }
    }
    this.updateCoordinatesFromAngle(this.bluePropState);
    this.updateCoordinatesFromAngle(this.redPropState);
    console.log("🔧 [MOTION DEBUG] Initial State Set:", {
      blue: { ...this.bluePropState },
      red: { ...this.redPropState }
    });
  }
  /**
   * Update x,y coordinates from center path angle
   * FIXED: Use exact same logic as standalone animator with grid center offset
   */
  updateCoordinatesFromAngle(propState) {
    const radius = GRID_HALFWAY_POINT_OFFSET;
    const centerX = GRID_CENTER;
    const centerY = GRID_CENTER;
    propState.x = centerX + Math.cos(propState.centerPathAngle) * radius;
    propState.y = centerY + Math.sin(propState.centerPathAngle) * radius;
  }
  // Public getters
  getBluePropState() {
    return { ...this.bluePropState };
  }
  getRedPropState() {
    return { ...this.redPropState };
  }
  getTotalBeats() {
    return this.totalBeats;
  }
  getMetadata() {
    return { ...this.metadata };
  }
}
function Arrow($$payload, $$props) {
  push();
  let {
    arrowData,
    motionData,
    preCalculatedPosition,
    preCalculatedMirroring,
    showArrow = true,
    onLoaded,
    onError
  } = $$props;
  let loaded = false;
  $$payload.out.push(`<g${attr_class(`arrow-group ${stringify(arrowData?.color)}-arrow`, "svelte-14ldlv9", { "loaded": loaded })}${attr("data-arrow-color", arrowData?.color)}${attr("data-motion-type", motionData?.motion_type)}${attr("data-location", arrowData?.location)}>`);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<circle r="8"${attr("fill", arrowData?.color === "blue" ? "#2E3192" : "#ED1C24")} opacity="0.3"></circle><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1s" repeatCount="indefinite"></animate>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></g>`);
  pop();
}
function Grid($$payload, $$props) {
  push();
  let { gridMode = "diamond", debug = false } = $$props;
  let isLoaded = false;
  let hasError = false;
  const gridImagePath = () => {
    return `/images/grid/${gridMode}_grid.svg`;
  };
  $$payload.out.push(`<g${attr_class("grid svelte-1shzcqm", void 0, { "grid-loaded": isLoaded, "grid-error": hasError })}${attr("data-grid-mode", gridMode)}>`);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<image${attr("href", gridImagePath())} x="0" y="0" width="950" height="950" preserveAspectRatio="none"></image>`);
  }
  $$payload.out.push(`<!--]-->`);
  if (debug) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<g class="debug-overlay svelte-1shzcqm"><rect x="10" y="10" width="200" height="60" fill="rgba(0, 0, 0, 0.8)" rx="4"></rect><text x="20" y="30" font-size="12" fill="white" font-family="monospace">Grid: ${escape_html(gridMode)}</text><text x="20" y="45" font-size="10" fill="white" font-family="monospace">Loaded: ${escape_html("NO")}</text><text x="20" y="60" font-size="10" fill="white" font-family="monospace">Error: ${escape_html("NO")}</text></g>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></g>`);
  pop();
}
function Prop($$payload, $$props) {
  push();
  let {
    propData,
    motionData,
    gridMode = "diamond",
    allProps = [],
    onLoaded,
    onError
  } = $$props;
  let loaded = false;
  $$payload.out.push(`<g${attr_class(`prop-group ${stringify(propData?.color)}-prop`, "svelte-1jkmid6", { "loaded": loaded })}${attr("data-prop-color", propData?.color)}${attr("data-prop-type", propData?.prop_type)}${attr("data-location", propData?.location)}>`);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<rect x="-12" y="-12" width="24" height="24"${attr("fill", propData?.color === "blue" ? "#2E3192" : "#ED1C24")} opacity="0.3" rx="2"></rect><animate attributeName="opacity" values="0.3;0.8;0.3" dur="1s" repeatCount="indefinite"></animate>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></g>`);
  pop();
}
function TKAGlyph($$payload, $$props) {
  push();
  let {
    letter
  } = $$props;
  let isLetterLoaded = false;
  const hasLetter = () => {
    return letter != null && letter.trim() !== "";
  };
  if (hasLetter() && isLetterLoaded) ;
  else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function Pictograph($$payload, $$props) {
  push();
  let {
    pictographData = null,
    beatData = null,
    onClick,
    debug = false,
    beatNumber = null,
    isStartPosition = false,
    width = void 0,
    height = void 0
  } = $$props;
  const isResponsive = () => width === void 0 && height === void 0;
  let isLoaded = false;
  let isLoading = false;
  let errorMessage = null;
  let loadedComponents = /* @__PURE__ */ new Set();
  let arrowPositions = {};
  let arrowMirroring = {};
  let showArrows = false;
  const effectivePictographData = () => {
    if (pictographData) return pictographData;
    if (beatData?.pictograph_data) return beatData.pictograph_data;
    return null;
  };
  const hasValidData = () => {
    return effectivePictographData() != null;
  };
  const displayLetter = () => {
    const data = effectivePictographData();
    if (data?.letter) return data.letter;
    if (beatData && !beatData.is_blank) return beatData.beat_number.toString();
    return null;
  };
  const arrowsToRender = () => {
    const data = effectivePictographData();
    if (!data?.arrows) return [];
    return Object.entries(data.arrows).filter(([_, arrowData]) => arrowData != null).map(([color, arrowData]) => ({ color, arrowData }));
  };
  const propsToRender = () => {
    const data = effectivePictographData();
    if (!data?.props) return [];
    return Object.entries(data.props).filter(([_, propData]) => propData != null).map(([color, propData]) => ({ color, propData }));
  };
  let requiredComponents = () => {
    let components = ["grid"];
    const data = effectivePictographData();
    if (data?.arrows?.blue) components.push("blue-arrow");
    if (data?.arrows?.red) components.push("red-arrow");
    if (data?.props?.blue) components.push("blue-prop");
    if (data?.props?.red) components.push("red-prop");
    return components;
  };
  function handleComponentLoaded(componentName) {
    loadedComponents.add(componentName);
    if (debug) {
      console.log(`Component loaded: ${componentName}`, {
        loaded: loadedComponents.size,
        required: requiredComponents().length
      });
    }
  }
  function handleComponentError(componentName, error) {
    errorMessage = `${componentName}: ${error}`;
    if (debug) {
      console.error(`Component error: ${componentName}`, error);
    }
    handleComponentLoaded(componentName);
  }
  const viewBox = () => `0 0 950 950`;
  const computedBeatNumber = () => {
    return beatNumber ?? beatData?.beat_number ?? null;
  };
  $$payload.out.push(`<div${attr_class("modern-pictograph svelte-7npypd", void 0, {
    "loading": isLoading,
    "loaded": isLoaded,
    "has-error": errorMessage,
    "clickable": onClick,
    "debug-mode": debug,
    "responsive": isResponsive()
  })}${attr_style("", {
    width: isResponsive() ? "100%" : `${width}px`,
    height: isResponsive() ? "100%" : `${height}px`
  })}><svg${spread_attributes(
    {
      width: isResponsive() ? "100%" : width || 144,
      height: isResponsive() ? "100%" : height || 144,
      viewBox: viewBox(),
      xmlns: "http://www.w3.org/2000/svg",
      role: onClick ? "button" : "img",
      ...onClick ? { tabindex: 0 } : {},
      "aria-label": isStartPosition ? "Start Position" : `Beat ${computedBeatNumber() || ""} Pictograph`
    },
    "svelte-7npypd",
    void 0,
    void 0,
    3
  )}><rect width="950" height="950" fill="white" class="svelte-7npypd"></rect>`);
  if (hasValidData()) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(propsToRender());
    const each_array_1 = ensure_array_like(arrowsToRender());
    Grid($$payload, {
      gridMode: effectivePictographData()?.grid_data?.grid_mode || "diamond",
      debug
    });
    $$payload.out.push(`<!----><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let { color, propData } = each_array[$$index];
      const motionData = effectivePictographData()?.motions?.[color];
      Prop($$payload, spread_props([
        { propData },
        motionData && { motionData },
        {
          gridMode: effectivePictographData()?.grid_data?.grid_mode || "diamond",
          allProps: Object.values(effectivePictographData()?.props || {}),
          onLoaded: () => handleComponentLoaded(`${color}-prop`),
          onError: (error) => handleComponentError(`${color}-prop`, error)
        }
      ]));
    }
    $$payload.out.push(`<!--]--><!--[-->`);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let { color, arrowData } = each_array_1[$$index_1];
      const motionData = effectivePictographData()?.motions?.[color];
      Arrow($$payload, spread_props([
        { arrowData },
        motionData && { motionData },
        {
          preCalculatedPosition: arrowPositions[color],
          preCalculatedMirroring: arrowMirroring[color],
          showArrow: showArrows,
          onLoaded: () => handleComponentLoaded(`${color}-arrow`),
          onError: (error) => handleComponentError(`${color}-arrow`, error)
        }
      ]));
    }
    $$payload.out.push(`<!--]-->`);
    if (displayLetter()) {
      $$payload.out.push("<!--[-->");
      TKAGlyph($$payload, { letter: displayLetter() });
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
    if (computedBeatNumber() && !isStartPosition) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<text x="475" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#4b5563" class="svelte-7npypd">${escape_html(computedBeatNumber())}</text>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
    if (isStartPosition) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<text x="475" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#059669" class="svelte-7npypd">START</text>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<g class="empty-state svelte-7npypd"><circle cx="475" cy="475" r="100" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2" class="svelte-7npypd"></circle><text x="475" y="475" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" class="svelte-7npypd">${escape_html(computedBeatNumber() || "Empty")}</text></g>`);
  }
  $$payload.out.push(`<!--]--></svg></div>`);
  pop();
}
class MotionParameterService {
  // Helper function to determine motion type based on start/end locations
  getMotionType(startLoc, endLoc) {
    if (startLoc === endLoc) {
      return "static";
    }
    const opposites = [
      ["n", "s"],
      ["s", "n"],
      ["e", "w"],
      ["w", "e"]
    ];
    for (const [start, end] of opposites) {
      if (startLoc === start && endLoc === end) {
        return "dash";
      }
    }
    return "pro";
  }
  // Helper function to get available motion types for a start/end pair
  getAvailableMotionTypes(startLoc, endLoc) {
    const motionType = this.getMotionType(startLoc, endLoc);
    if (motionType === "static") {
      return ["static"];
    } else if (motionType === "dash") {
      return ["dash"];
    } else {
      return ["pro", "anti", "float"];
    }
  }
  // Helper function to calculate rotation direction based on motion type and locations
  calculateRotationDirection(motionType, startLoc, endLoc) {
    const locationOrder = ["n", "e", "s", "w"];
    const startIndex = locationOrder.indexOf(startLoc);
    const endIndex = locationOrder.indexOf(endLoc);
    if (startIndex === -1 || endIndex === -1) {
      return "cw";
    }
    let clockwiseDistance = (endIndex - startIndex + 4) % 4;
    let counterClockwiseDistance = (startIndex - endIndex + 4) % 4;
    if (motionType === "static") {
      return "no_rot";
    }
    if (motionType === "dash") {
      return "no_rot";
    }
    if (clockwiseDistance <= counterClockwiseDistance) {
      return motionType === "pro" ? "cw" : "ccw";
    } else {
      return motionType === "pro" ? "ccw" : "cw";
    }
  }
  // Helper function to map string values to enum values
  mapMotionTypeToEnum(motionType) {
    switch (motionType.toLowerCase()) {
      case "pro":
        return MotionType.PRO;
      case "anti":
        return MotionType.ANTI;
      case "static":
        return MotionType.STATIC;
      case "dash":
        return MotionType.DASH;
      case "fl":
      case "float":
        return MotionType.FLOAT;
      default:
        return MotionType.PRO;
    }
  }
  mapOrientationToEnum(orientation) {
    switch (orientation.toLowerCase()) {
      case "in":
        return Orientation.IN;
      case "out":
        return Orientation.OUT;
      case "clock":
        return Orientation.CLOCK;
      case "counter":
        return Orientation.COUNTER;
      case "n":
        return Orientation.IN;
      // Map cardinal directions to in/out for now
      case "e":
        return Orientation.IN;
      case "s":
        return Orientation.IN;
      case "w":
        return Orientation.IN;
      default:
        return Orientation.IN;
    }
  }
  mapRotationDirectionToEnum(rotDir) {
    switch (rotDir.toLowerCase()) {
      case "cw":
      case "clockwise":
        return RotationDirection.CLOCKWISE;
      case "ccw":
      case "counter_clockwise":
      case "counterclockwise":
        return RotationDirection.COUNTER_CLOCKWISE;
      default:
        return RotationDirection.CLOCKWISE;
    }
  }
  mapLocationToEnum(location) {
    switch (location.toLowerCase()) {
      case "n":
        return Location.NORTH;
      case "e":
        return Location.EAST;
      case "s":
        return Location.SOUTH;
      case "w":
        return Location.WEST;
      case "ne":
        return Location.NORTHEAST;
      case "se":
        return Location.SOUTHEAST;
      case "sw":
        return Location.SOUTHWEST;
      case "nw":
        return Location.NORTHWEST;
      default:
        return Location.NORTH;
    }
  }
  // Helper function to convert MotionTestParams to PropAttributes
  convertMotionTestParamsToPropAttributes(params) {
    return {
      start_loc: params.startLoc,
      end_loc: params.endLoc,
      motion_type: params.motionType,
      turns: params.turns,
      prop_rot_dir: params.propRotDir,
      start_ori: params.startOri,
      end_ori: params.endOri
    };
  }
  // Create default motion parameters
  createDefaultParams() {
    return {
      startLoc: "n",
      endLoc: "e",
      motionType: "pro",
      turns: 0,
      propRotDir: "cw",
      startOri: "in",
      endOri: "in"
    };
  }
  // Update motion type when locations change
  updateMotionTypeForLocations(params) {
    this.getMotionType(params.startLoc, params.endLoc);
    const availableTypes = this.getAvailableMotionTypes(
      params.startLoc,
      params.endLoc
    );
    if (!availableTypes.includes(params.motionType)) {
      return {
        ...params,
        motionType: availableTypes[0]
      };
    }
    return params;
  }
}
class AnimationControlService {
  animationEngine;
  animationFrameId = null;
  currentProgress = 0;
  isInitialized = false;
  propVisibility = { blue: true, red: true };
  constructor() {
    this.animationEngine = new SequenceAnimationEngine();
  }
  // Initialize the animation engine with motion data
  async initializeEngine(blueParams, redParams) {
    try {
      const sequence = this.createDualPropTestSequence(blueParams, redParams);
      this.isInitialized = this.animationEngine.initialize(sequence);
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize animation engine:", error);
      this.isInitialized = false;
      return false;
    }
  }
  // Create a test sequence with dual prop motion in standalone array format
  createDualPropTestSequence(blueParams, redParams) {
    return [
      // Index 0: Metadata
      {
        word: "TEST",
        author: "Motion Tester",
        totalBeats: 1
      },
      // Index 1: Start position
      {
        beat: 0,
        letter: "START",
        letter_type: "start",
        blue_attributes: this.convertToAttributes(blueParams),
        red_attributes: this.convertToAttributes(redParams)
      },
      // Index 2: Motion step
      {
        beat: 1,
        letter: "TEST",
        letter_type: "motion",
        blue_attributes: this.convertToAttributes(blueParams),
        red_attributes: this.convertToAttributes(redParams)
      }
    ];
  }
  convertToAttributes(params) {
    return {
      start_loc: params.startLoc,
      end_loc: params.endLoc,
      start_ori: params.startOri,
      end_ori: params.endOri,
      motion_type: params.motionType,
      prop_rot_dir: params.propRotDir,
      turns: params.turns
    };
  }
  // Get current prop states
  getCurrentPropStates() {
    return {
      blue: this.animationEngine.getBluePropState(),
      red: this.animationEngine.getRedPropState()
    };
  }
  // Set animation progress (0-1)
  setProgress(progress) {
    this.currentProgress = Math.max(0, Math.min(1, progress));
    const currentBeat = this.currentProgress * this.getTotalBeats();
    this.animationEngine.calculateState(currentBeat);
  }
  // Get current animation progress
  getProgress() {
    return this.currentProgress;
  }
  // Start animation playback
  startAnimation() {
    if (this.animationFrameId) {
      this.stopAnimation();
    }
    const animate = () => {
      const currentProgress = this.getProgress();
      if (currentProgress < 1) {
        this.setProgress(currentProgress + 8e-3);
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
      }
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }
  // Stop animation playback
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  // Reset animation to beginning
  resetAnimation() {
    this.stopAnimation();
    this.setProgress(0);
  }
  // Check if animation is playing
  isPlaying() {
    return this.animationFrameId !== null;
  }
  // Get current beat based on progress
  getCurrentBeat() {
    return this.getProgress();
  }
  // Set prop visibility
  setPropVisibility(prop, visible) {
    this.propVisibility[prop] = visible;
  }
  // Get prop visibility
  getPropVisibility(prop) {
    return this.propVisibility[prop];
  }
  // Check if engine is initialized
  isEngineInitialized() {
    return this.isInitialized;
  }
  // Get total beats
  getTotalBeats() {
    return 1;
  }
  // Cleanup resources
  dispose() {
    this.stopAnimation();
  }
}
function createMotionTesterState() {
  const motionService = new MotionParameterService();
  const animationService = new AnimationControlService();
  let blueMotionParams = motionService.createDefaultParams();
  let redMotionParams = {
    ...motionService.createDefaultParams(),
    startLoc: "e",
    endLoc: "w",
    motionType: "dash"
  };
  let propVisibility = { blue: true, red: true };
  let animationState = { isPlaying: false, progress: 0, currentBeat: 0 };
  let isEngineInitialized = false;
  let gridType = "diamond";
  return {
    // Reactive state getters
    get blueMotionParams() {
      return blueMotionParams;
    },
    get redMotionParams() {
      return redMotionParams;
    },
    get animationState() {
      return animationState;
    },
    get propVisibility() {
      return propVisibility;
    },
    get currentPropStates() {
      return animationService.getCurrentPropStates();
    },
    get isEngineInitialized() {
      return isEngineInitialized;
    },
    get gridType() {
      return gridType;
    },
    // Blue prop methods
    setBlueStartLocation: (location) => {
      blueMotionParams.startLoc = location;
      blueMotionParams = motionService.updateMotionTypeForLocations(blueMotionParams);
    },
    setBlueEndLocation: (location) => {
      blueMotionParams.endLoc = location;
      blueMotionParams = motionService.updateMotionTypeForLocations(blueMotionParams);
    },
    updateBlueMotionParam: (param, value) => {
      blueMotionParams[param] = value;
    },
    // Red prop methods
    setRedStartLocation: (location) => {
      redMotionParams.startLoc = location;
      redMotionParams = motionService.updateMotionTypeForLocations(redMotionParams);
    },
    setRedEndLocation: (location) => {
      redMotionParams.endLoc = location;
      redMotionParams = motionService.updateMotionTypeForLocations(redMotionParams);
    },
    updateRedMotionParam: (param, value) => {
      redMotionParams[param] = value;
    },
    // Animation control methods
    setProgress: (progress) => {
      animationService.setProgress(progress);
    },
    startAnimation: () => {
      animationService.startAnimation();
    },
    stopAnimation: () => {
      animationService.stopAnimation();
    },
    resetAnimation: () => {
      animationService.resetAnimation();
    },
    // Grid control methods
    setGridType: (newGridType) => {
      gridType = newGridType;
    }
  };
}
function LocationSelector($$payload, $$props) {
  push();
  let {
    propLabel,
    propColor,
    startLocation,
    endLocation
  } = $$props;
  const motionService = new MotionParameterService();
  const locations = ["n", "e", "s", "w"];
  let motionType = motionService.getMotionType(startLocation, endLocation);
  const each_array = ensure_array_like(locations);
  const each_array_1 = ensure_array_like(locations);
  $$payload.out.push(`<div class="location-selector svelte-y1wtg7"><div class="prop-row svelte-y1wtg7"><div class="prop-label svelte-y1wtg7"${attr_style(`color: ${stringify(propColor)}`)}>${escape_html(propLabel)}</div> <div class="location-selectors svelte-y1wtg7"><select class="svelte-y1wtg7">`);
  $$payload.select_value = startLocation;
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let loc = each_array[$$index];
    $$payload.out.push(`<option${attr("value", loc)}${maybe_selected($$payload, loc)} class="svelte-y1wtg7">${escape_html(loc.toUpperCase())}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select> <span class="arrow svelte-y1wtg7">→</span> <select class="svelte-y1wtg7">`);
  $$payload.select_value = endLocation;
  $$payload.out.push(`<!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let loc = each_array_1[$$index_1];
    $$payload.out.push(`<option${attr("value", loc)}${maybe_selected($$payload, loc)} class="svelte-y1wtg7">${escape_html(loc.toUpperCase())}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <div class="motion-type-display svelte-y1wtg7">${escape_html(motionType.toUpperCase())}</div></div></div>`);
  pop();
}
function getMotionDescription(startLoc, endLoc, motionType, turns) {
  const direction = startLoc === endLoc ? "STATIC" : `${startLoc.toUpperCase()}→${endLoc.toUpperCase()}`;
  const rotation = getRotationDirection(startLoc, endLoc, motionType, turns);
  return `${direction} ${motionType.toUpperCase()} ${turns}T ${rotation}`;
}
function getRotationDirection(startLoc, endLoc, motionType, turns) {
  if (startLoc === endLoc) return "NO_ROT";
  if (motionType === "dash") return "NO_ROT";
  if (turns === 0) return "NO_ROT";
  const clockwisePairs = [
    ["n", "e"],
    ["e", "s"],
    ["s", "w"],
    ["w", "n"]
  ];
  const isClockwise = clockwisePairs.some(
    ([start, end]) => start === startLoc && end === endLoc
  );
  if (motionType === "pro") {
    return isClockwise ? "CW" : "CCW";
  } else {
    return isClockwise ? "CCW" : "CW";
  }
}
const MOTION_TYPES = ["pro", "anti", "float", "dash"];
const ORIENTATIONS = ["in", "out", "clock", "counter"];
function OrientationSelector($$payload, $$props) {
  push();
  let { orientation, propColor, label, onOrientationChange } = $$props;
  const each_array = ensure_array_like(ORIENTATIONS);
  $$payload.out.push(`<div class="orientation-selector svelte-1utrpa6"><div class="prop-row svelte-1utrpa6"><div class="prop-label svelte-1utrpa6"${attr_style(`color: ${stringify(propColor)}`)}>${escape_html(label)}</div> <select class="svelte-1utrpa6">`);
  $$payload.select_value = orientation;
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let ori = each_array[$$index];
    $$payload.out.push(`<option${attr("value", ori)}${maybe_selected($$payload, ori)} class="svelte-1utrpa6">${escape_html(ori.charAt(0).toUpperCase() + ori.slice(1))}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div></div>`);
  pop();
}
function TurnsControl($$payload, $$props) {
  push();
  let { turns, propColor } = $$props;
  $$payload.out.push(`<div class="turns-control svelte-pxe0kj"><div class="prop-row svelte-pxe0kj"><div class="prop-label svelte-pxe0kj"${attr_style(`color: ${stringify(propColor)}`)}>Turns</div> <div class="turns-selector svelte-pxe0kj"><button type="button"${attr("disabled", turns <= 1, true)} class="turn-btn svelte-pxe0kj">-</button> <span class="turn-value svelte-pxe0kj">${escape_html(turns)}</span> <button type="button"${attr("disabled", turns >= 3, true)} class="turn-btn svelte-pxe0kj">+</button></div></div></div>`);
  pop();
}
function MotionTypeSelector($$payload, $$props) {
  push();
  let { motionType, propColor } = $$props;
  const each_array = ensure_array_like(MOTION_TYPES);
  $$payload.out.push(`<div class="motion-type-selector svelte-1c8wlx9"><div class="prop-row svelte-1c8wlx9"><div class="prop-label svelte-1c8wlx9"${attr_style(`color: ${stringify(propColor)}`)}>Motion</div> <select class="svelte-1c8wlx9">`);
  $$payload.select_value = motionType;
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let type = each_array[$$index];
    $$payload.out.push(`<option${attr("value", type)}${maybe_selected($$payload, type)} class="svelte-1c8wlx9">${escape_html(type.charAt(0).toUpperCase() + type.slice(1))}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div></div>`);
  pop();
}
function PropPanel($$payload, $$props) {
  let {
    propName,
    propColor,
    startLocation,
    endLocation,
    startOrientation,
    endOrientation,
    turns,
    motionType,
    onStartLocationChange,
    onEndLocationChange,
    onStartOrientationChange,
    onEndOrientationChange,
    onTurnsChange,
    onMotionTypeChange
  } = $$props;
  $$payload.out.push(`<div class="prop-panel svelte-1kqc4hk"><div class="prop-header svelte-1kqc4hk"${attr_style(`color: ${stringify(propColor)}`)}>${escape_html(propName)} Prop</div> <div class="prop-controls svelte-1kqc4hk">`);
  LocationSelector($$payload, {
    propColor,
    propLabel: "Loc",
    startLocation,
    endLocation
  });
  $$payload.out.push(`<!----> `);
  OrientationSelector($$payload, {
    orientation: startOrientation,
    propColor,
    label: "Start",
    onOrientationChange: onStartOrientationChange
  });
  $$payload.out.push(`<!----> `);
  OrientationSelector($$payload, {
    orientation: endOrientation,
    propColor,
    label: "End",
    onOrientationChange: onEndOrientationChange
  });
  $$payload.out.push(`<!----> `);
  TurnsControl($$payload, { turns, propColor });
  $$payload.out.push(`<!----> `);
  MotionTypeSelector($$payload, { motionType, propColor });
  $$payload.out.push(`<!----></div></div>`);
}
function MotionParameterPanel($$payload, $$props) {
  push();
  let { state } = $$props;
  $$payload.out.push(`<div class="motion-params-panel svelte-1y2brdv"><h2 class="svelte-1y2brdv">🎯 Motion Designer</h2> <div class="panels-container svelte-1y2brdv"><div class="prop-section svelte-1y2brdv"><div class="motion-summary blue-summary svelte-1y2brdv">${escape_html(getMotionDescription(state.blueMotionParams.startLoc, state.blueMotionParams.endLoc, state.blueMotionParams.motionType, state.blueMotionParams.turns))}</div> `);
  PropPanel($$payload, {
    propName: "Blue",
    propColor: "#60a5fa",
    startLocation: state.blueMotionParams.startLoc,
    endLocation: state.blueMotionParams.endLoc,
    startOrientation: state.blueMotionParams.startOri,
    endOrientation: state.blueMotionParams.endOri,
    turns: state.blueMotionParams.turns,
    motionType: state.blueMotionParams.motionType,
    onStartLocationChange: (location) => state.updateBlueMotionParam("startLoc", location),
    onEndLocationChange: (location) => state.updateBlueMotionParam("endLoc", location),
    onStartOrientationChange: (orientation) => state.updateBlueMotionParam("startOri", orientation),
    onEndOrientationChange: (orientation) => state.updateBlueMotionParam("endOri", orientation),
    onTurnsChange: (turns) => state.updateBlueMotionParam("turns", turns),
    onMotionTypeChange: (motionType) => state.updateBlueMotionParam("motionType", motionType)
  });
  $$payload.out.push(`<!----></div> <div class="prop-section svelte-1y2brdv"><div class="motion-summary red-summary svelte-1y2brdv">${escape_html(getMotionDescription(state.redMotionParams.startLoc, state.redMotionParams.endLoc, state.redMotionParams.motionType, state.redMotionParams.turns))}</div> `);
  PropPanel($$payload, {
    propName: "Red",
    propColor: "#f87171",
    startLocation: state.redMotionParams.startLoc,
    endLocation: state.redMotionParams.endLoc,
    startOrientation: state.redMotionParams.startOri,
    endOrientation: state.redMotionParams.endOri,
    turns: state.redMotionParams.turns,
    motionType: state.redMotionParams.motionType,
    onStartLocationChange: (location) => state.updateRedMotionParam("startLoc", location),
    onEndLocationChange: (location) => state.updateRedMotionParam("endLoc", location),
    onStartOrientationChange: (orientation) => state.updateRedMotionParam("startOri", orientation),
    onEndOrientationChange: (orientation) => state.updateRedMotionParam("endOri", orientation),
    onTurnsChange: (turns) => state.updateRedMotionParam("turns", turns),
    onMotionTypeChange: (motionType) => state.updateRedMotionParam("motionType", motionType)
  });
  $$payload.out.push(`<!----></div></div> <div class="quick-tests-section svelte-1y2brdv"><h3 class="svelte-1y2brdv">⚡ Quick Tests</h3> <div class="quick-tests svelte-1y2brdv"><button class="quick-test-btn svelte-1y2brdv">N→E PRO</button> <button class="quick-test-btn svelte-1y2brdv">E→W DASH</button> <button class="quick-test-btn svelte-1y2brdv">S→W ANTI</button> <button class="quick-test-btn svelte-1y2brdv">N→S FLOAT</button></div></div></div>`);
  pop();
}
function PictographVisualizationPanel($$payload, $$props) {
  push();
  let { state } = $$props;
  let pictographData = createPictographData({
    id: "motion-tester-pictograph",
    grid_data: createGridData({
      grid_mode: state.gridType === "diamond" ? GridMode.DIAMOND : GridMode.BOX
    }),
    arrows: {},
    props: {},
    motions: {},
    letter: "A",
    beat: 1,
    is_blank: false,
    is_mirrored: false,
    metadata: {}
  });
  $$payload.out.push(`<div class="pictograph-visualization-panel svelte-11ei270"><h2 class="svelte-11ei270">🎬 Motion Visualization</h2> <div class="animation-controls svelte-11ei270"><div class="playback-controls svelte-11ei270"><button class="control-btn play-btn svelte-11ei270"${attr("disabled", !state.isEngineInitialized, true)}>${escape_html(state.animationState.isPlaying ? "⏸️" : "▶️")}</button> <button class="control-btn reset-btn svelte-11ei270"${attr("disabled", !state.isEngineInitialized, true)}>⏹️</button></div> <div class="progress-control svelte-11ei270"><label for="progress-slider" class="svelte-11ei270">Progress:</label> <div class="slider-container svelte-11ei270"><input id="progress-slider" type="range" min="0" max="1" step="0.01"${attr("value", state.animationState.progress)}${attr("disabled", !state.isEngineInitialized, true)} class="svelte-11ei270"/> <span class="progress-value svelte-11ei270">${escape_html(Math.round(state.animationState.progress * 100))}%</span></div></div></div> <div class="grid-options svelte-11ei270"><h3 class="svelte-11ei270">🔲 Grid Options</h3> <div class="grid-toggle svelte-11ei270"><button${attr_class(`grid-btn ${stringify(state.gridType === "diamond" ? "active" : "")}`, "svelte-11ei270")}>◆ Diamond</button> <button${attr_class(`grid-btn ${stringify(state.gridType === "box" ? "active" : "")}`, "svelte-11ei270")}>⬜ Box</button></div></div> <div class="pictograph-container svelte-11ei270">`);
  Pictograph($$payload, { pictographData, width: 400, height: 400, debug: false });
  $$payload.out.push(`<!----></div> <div class="prop-states svelte-11ei270"><h3 class="svelte-11ei270">Real-Time Prop States</h3> <div class="prop-states-grid svelte-11ei270"><div class="prop-state blue-state svelte-11ei270"><h4 class="svelte-11ei270">🔵 Blue Prop</h4> <div class="state-values svelte-11ei270"><div class="state-item svelte-11ei270"><span>Center:</span> <span>${escape_html(((state.currentPropStates.blue?.centerPathAngle ?? 0) * 180 / Math.PI).toFixed(1))}°</span></div> <div class="state-item svelte-11ei270"><span>Staff:</span> <span>${escape_html(((state.currentPropStates.blue?.staffRotationAngle ?? 0) * 180 / Math.PI).toFixed(1))}°</span></div></div></div> <div class="prop-state red-state svelte-11ei270"><h4 class="svelte-11ei270">🔴 Red Prop</h4> <div class="state-values svelte-11ei270"><div class="state-item svelte-11ei270"><span>Center:</span> <span>${escape_html(((state.currentPropStates.red?.centerPathAngle ?? 0) * 180 / Math.PI).toFixed(1))}°</span></div> <div class="state-item svelte-11ei270"><span>Staff:</span> <span>${escape_html(((state.currentPropStates.red?.staffRotationAngle ?? 0) * 180 / Math.PI).toFixed(1))}°</span></div></div></div></div></div> <div class="motion-summary svelte-11ei270"><h3 class="svelte-11ei270">📝 Motion Summary</h3> <div class="summary-grid svelte-11ei270"><div class="summary-item svelte-11ei270"><span class="prop-label svelte-11ei270">🔵 Blue:</span> <span class="motion-desc svelte-11ei270">${escape_html(state.blueMotionParams.startLoc.toUpperCase())}→${escape_html(state.blueMotionParams.endLoc.toUpperCase())} ${escape_html(state.blueMotionParams.motionType.toUpperCase())} ${escape_html(state.blueMotionParams.turns)}T</span></div> <div class="summary-item svelte-11ei270"><span class="prop-label svelte-11ei270">🔴 Red:</span> <span class="motion-desc svelte-11ei270">${escape_html(state.redMotionParams.startLoc.toUpperCase())}→${escape_html(state.redMotionParams.endLoc.toUpperCase())} ${escape_html(state.redMotionParams.motionType.toUpperCase())} ${escape_html(state.redMotionParams.turns)}T</span></div></div></div></div>`);
  pop();
}
function _page($$payload, $$props) {
  push();
  const state = createMotionTesterState();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>TKA Motion Tester - Individual Motion Testing</title>`;
  });
  $$payload.out.push(`<div class="motion-tester-container svelte-4nngdp"><header class="tester-header svelte-4nngdp"><h1 class="svelte-4nngdp">TKA Motion Tester</h1> <p class="svelte-4nngdp">Test individual motion sequences with visual feedback and debugging</p></header> <main class="tester-main svelte-4nngdp"><div class="panel motion-params svelte-4nngdp">`);
  MotionParameterPanel($$payload, { state });
  $$payload.out.push(`<!----></div> <div class="panel visualization-panel svelte-4nngdp">`);
  PictographVisualizationPanel($$payload, { state });
  $$payload.out.push(`<!----></div></main></div>`);
  pop();
}
export {
  _page as default
};
