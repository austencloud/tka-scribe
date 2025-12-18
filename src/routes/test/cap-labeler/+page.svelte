<!--
  CAP Type Labeling Tool
  Navigate to /test/cap-labeler to use

  Purpose: Manually label circular sequences with their correct CAP type
  to build ground truth data for improving detection algorithms.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    CAPType,
    CAP_TYPE_LABELS,
  } from "$lib/features/create/generate/circular/domain/models/circular-models";
  import { getFirestoreInstance } from "$lib/shared/auth/firebase";
  import { collection, doc, setDoc, getDocs, deleteDoc, type Firestore } from "firebase/firestore";

  // BeatGrid imports for real pictograph rendering
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import { GridLocation, GridPosition, GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { MotionColor, MotionType, Orientation, RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import type { Letter } from "$lib/shared/foundation/domain/models/Letter";

  // Firebase Firestore instance (lazy loaded)
  let firestore: Firestore | null = null;

  // Base CAP components that can be combined
  const BASE_COMPONENTS = [
    { id: "rotated", label: "Rotated", description: "Positions rotate 180° (or 90°)" },
    { id: "swapped", label: "Swapped", description: "Blue/Red hands swap roles" },
    { id: "mirrored", label: "Mirrored", description: "Positions mirror vertically (left↔right)" },
    { id: "flipped", label: "Flipped", description: "Positions mirror horizontally (top↔bottom)" },
    { id: "inverted", label: "Inverted", description: "Pro ↔ Anti motion types flip" },
    { id: "rewound", label: "Rewound", description: "Second half plays in reverse" },
  ] as const;

  type ComponentId = typeof BASE_COMPONENTS[number]["id"];

  // Map component combinations to CAPType
  function componentsToCAPType(components: Set<ComponentId>): string | null {
    if (components.size === 0) return null;

    const sorted = Array.from(components).sort().join("_");

    // Map combinations to CAPType enum values
    const mapping: Record<string, CAPType | string> = {
      "rotated": CAPType.STRICT_ROTATED,
      "mirrored": CAPType.STRICT_MIRRORED,
      "flipped": "strict_flipped",
      "swapped": CAPType.STRICT_SWAPPED,
      "inverted": CAPType.STRICT_INVERTED,
      "inverted_swapped": CAPType.SWAPPED_INVERTED,
      "inverted_rotated": CAPType.ROTATED_INVERTED,
      "mirrored_swapped": CAPType.MIRRORED_SWAPPED,
      "flipped_swapped": "flipped_swapped",
      "inverted_mirrored": CAPType.MIRRORED_INVERTED,
      "flipped_inverted": "flipped_inverted",
      "rotated_swapped": CAPType.ROTATED_SWAPPED,
      "mirrored_rotated": CAPType.MIRRORED_ROTATED,
      "flipped_rotated": "flipped_rotated",
      "inverted_mirrored_rotated": CAPType.MIRRORED_INVERTED_ROTATED,
      "inverted_mirrored_rotated_swapped": CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
      "rewound": "rewound",
      "inverted_rewound": "rewound_inverted",
      // Add more combinations as needed
    };

    return mapping[sorted] ?? `custom_${sorted}`;
  }

  interface SequenceEntry {
    word: string;
    isCircular: boolean;
    capType: string | null;
    thumbnails: string[];
    sequenceLength: number;
    gridMode: string;
    fullMetadata?: {
      sequence?: RawBeatData[];
    };
  }

  // Raw beat data from sequence-index.json
  interface RawBeatData {
    beat?: number;
    letter?: string;
    start_pos?: string;
    end_pos?: string;
    sequence_start_position?: string;
    blue_attributes?: RawMotionAttributes;
    red_attributes?: RawMotionAttributes;
  }

  interface RawMotionAttributes {
    motion_type?: string;
    start_loc?: string;
    end_loc?: string;
    start_ori?: string;
    end_ori?: string;
    prop_rot_dir?: string;
    turns?: number | string;
  }

  interface CAPDesignation {
    components: ComponentId[];
    capType: string | null;
  }

  interface LabeledSequence {
    word: string;
    designations: CAPDesignation[];  // Multiple valid designations
    isFreeform: boolean;  // Circular but no recognizable pattern
    labeledAt: string;
    notes: string;
  }

  // State
  let sequences = $state<SequenceEntry[]>([]);
  let labels = $state<Map<string, LabeledSequence>>(new Map());
  let currentIndex = $state(0);
  let loading = $state(true);
  let filterMode = $state<"all" | "unlabeled" | "labeled">("unlabeled");
  let notes = $state("");
  let showExport = $state(false);
  let selectedComponents = $state<Set<ComponentId>>(new Set());
  let isFreeform = $state(false);  // Circular but no recognizable pattern
  let pendingDesignations = $state<CAPDesignation[]>([]);  // Multiple designations being built
  let copiedToast = $state(false);
  let syncStatus = $state<"synced" | "syncing" | "error">("synced");

  // Parsed beat data for BeatGrid rendering
  let parsedBeats = $state<BeatData[]>([]);
  let parsedStartPosition = $state<StartPositionData | null>(null);
  let selectedBeatNumber = $state<number | null>(null);

  // Firebase collection reference
  const CAP_LABELS_COLLECTION = "cap-labels";

  // Derived CAP type from selected components
  const derivedCapType = $derived(
    isFreeform ? null : componentsToCAPType(selectedComponents)
  );

  // Human-readable label for current selection
  const selectionLabel = $derived.by(() => {
    if (isFreeform) return "Freeform";
    if (selectedComponents.size === 0) return "Select components...";
    const names = Array.from(selectedComponents).map(
      id => BASE_COMPONENTS.find(c => c.id === id)?.label ?? id
    );
    return names.join(" + ");
  });

  // Format a designation for display
  function formatDesignation(d: CAPDesignation): string {
    if (d.components.length === 0) return "Freeform";
    return d.components.map(c =>
      BASE_COMPONENTS.find(b => b.id === c)?.label ?? c
    ).join(" + ");
  }

  // Filter to only circular sequences
  const circularSequences = $derived(
    sequences.filter((s) => s.isCircular)
  );

  // Apply filter mode
  const filteredSequences = $derived.by(() => {
    if (filterMode === "all") return circularSequences;
    if (filterMode === "unlabeled") {
      return circularSequences.filter((s) => !labels.has(s.word));
    }
    return circularSequences.filter((s) => labels.has(s.word));
  });

  const currentSequence = $derived(filteredSequences[currentIndex] ?? null);
  const currentLabel = $derived(
    currentSequence ? labels.get(currentSequence.word) : null
  );

  // Convert thumbnail paths (legacy /Explore/ to /gallery/)
  function getThumbnailUrl(path: string | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith("/Explore/")) {
      return path.replace(/^\/Explore\//, "/gallery/");
    }
    if (path.startsWith("/gallery/")) {
      return path;
    }
    return `/gallery/${path}`;
  }

  const currentThumbnailUrl = $derived(
    getThumbnailUrl(currentSequence?.thumbnails?.[0])
  );

  // Stats
  const stats = $derived({
    total: circularSequences.length,
    labeled: labels.size,
    remaining: circularSequences.length - labels.size,
  });

  // ============================================================================
  // Beat Data Conversion Functions
  // ============================================================================

  function parseMotionType(value: string | undefined): MotionType {
    const str = String(value || "").toLowerCase();
    switch (str) {
      case "pro": return MotionType.PRO;
      case "anti": return MotionType.ANTI;
      case "float": return MotionType.FLOAT;
      case "dash": return MotionType.DASH;
      case "static": return MotionType.STATIC;
      default: return MotionType.STATIC;
    }
  }

  function parseLocation(value: string | undefined): GridLocation {
    const str = String(value || "").toUpperCase();
    const locationMap: Record<string, GridLocation> = {
      N: GridLocation.NORTH,
      NORTH: GridLocation.NORTH,
      E: GridLocation.EAST,
      EAST: GridLocation.EAST,
      S: GridLocation.SOUTH,
      SOUTH: GridLocation.SOUTH,
      W: GridLocation.WEST,
      WEST: GridLocation.WEST,
      NE: GridLocation.NORTHEAST,
      NORTHEAST: GridLocation.NORTHEAST,
      SE: GridLocation.SOUTHEAST,
      SOUTHEAST: GridLocation.SOUTHEAST,
      SW: GridLocation.SOUTHWEST,
      SOUTHWEST: GridLocation.SOUTHWEST,
      NW: GridLocation.NORTHWEST,
      NORTHWEST: GridLocation.NORTHWEST,
    };
    return locationMap[str] ?? GridLocation.NORTH;
  }

  function parseGridPosition(value: string | undefined): GridPosition | null {
    if (!value) return null;
    const str = String(value).toLowerCase();
    const enumKey = str.toUpperCase();
    const positionValue = GridPosition[enumKey as keyof typeof GridPosition];
    if (positionValue) return positionValue;
    for (const key in GridPosition) {
      if (GridPosition[key as keyof typeof GridPosition] === str) {
        return str as GridPosition;
      }
    }
    return null;
  }

  function parseOrientation(value: string | undefined): Orientation {
    const str = String(value || "").toLowerCase();
    switch (str) {
      case "in": return Orientation.IN;
      case "out": return Orientation.OUT;
      case "clock": case "clockwise": return Orientation.CLOCK;
      case "counter": case "counterclockwise": return Orientation.COUNTER;
      default: return Orientation.IN;
    }
  }

  function parseRotationDirection(value: string | undefined): RotationDirection {
    const str = String(value || "").toLowerCase();
    switch (str) {
      case "cw": case "clockwise": return RotationDirection.CLOCKWISE;
      case "ccw": case "counterclockwise": case "counter_clockwise": return RotationDirection.COUNTER_CLOCKWISE;
      case "no_rotation": case "norotation": return RotationDirection.NO_ROTATION;
      default: return RotationDirection.NO_ROTATION;
    }
  }

  function parseTurns(value: string | number | undefined): number | "fl" {
    if (value === "fl" || value === "float") return "fl";
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  function convertRawToBeats(
    sequenceName: string,
    rawSequence: RawBeatData[],
    gridMode: GridMode
  ): { beats: BeatData[]; startPosition: StartPositionData | null } {
    if (!rawSequence || rawSequence.length === 0) {
      return { beats: [], startPosition: null };
    }

    // Check if first element is start position (has sequence_start_position field)
    const firstElement = rawSequence[0];
    const hasStartPosition = firstElement && "sequence_start_position" in firstElement;

    // Parse start position if present
    let startPosition: StartPositionData | null = null;
    if (hasStartPosition && firstElement) {
      const blueAttrs = firstElement.blue_attributes;
      const redAttrs = firstElement.red_attributes;
      const gridPosition = parseGridPosition(firstElement.sequence_start_position);

      startPosition = {
        id: `start-${sequenceName}`,
        isStartPosition: true as const,
        letter: (firstElement.letter as Letter | null) ?? null,
        gridPosition,
        startPosition: gridPosition,
        endPosition: null,
        motions: {
          [MotionColor.BLUE]: blueAttrs
            ? createMotionData({
                color: MotionColor.BLUE,
                motionType: parseMotionType(blueAttrs.motion_type),
                startLocation: parseLocation(blueAttrs.start_loc),
                endLocation: parseLocation(blueAttrs.end_loc),
                startOrientation: parseOrientation(blueAttrs.start_ori),
                endOrientation: parseOrientation(blueAttrs.end_ori),
                rotationDirection: parseRotationDirection(blueAttrs.prop_rot_dir),
                turns: parseTurns(blueAttrs.turns),
                isVisible: true,
                propType: PropType.STAFF,
                arrowLocation: parseLocation(blueAttrs.start_loc) || GridLocation.NORTH,
                gridMode,
              })
            : undefined,
          [MotionColor.RED]: redAttrs
            ? createMotionData({
                color: MotionColor.RED,
                motionType: parseMotionType(redAttrs.motion_type),
                startLocation: parseLocation(redAttrs.start_loc),
                endLocation: parseLocation(redAttrs.end_loc),
                startOrientation: parseOrientation(redAttrs.start_ori),
                endOrientation: parseOrientation(redAttrs.end_ori),
                rotationDirection: parseRotationDirection(redAttrs.prop_rot_dir),
                turns: parseTurns(redAttrs.turns),
                isVisible: true,
                propType: PropType.STAFF,
                arrowLocation: parseLocation(redAttrs.start_loc) || GridLocation.SOUTH,
                gridMode,
              })
            : undefined,
        },
      };
    }

    // Parse beats (skip first if it's start position)
    const beatElements = hasStartPosition ? rawSequence.slice(1) : rawSequence;
    // Also skip any metadata elements (those without blue/red attributes)
    const actualBeats = beatElements.filter(el => el.blue_attributes || el.red_attributes);

    const beats: BeatData[] = actualBeats.map((step, index) => {
      const blueAttrs = step.blue_attributes;
      const redAttrs = step.red_attributes;

      return {
        id: `beat-${sequenceName}-${index + 1}`,
        letter: step.letter as Letter ?? null,
        startPosition: parseGridPosition(step.start_pos) || parseGridPosition(step.sequence_start_position),
        endPosition: parseGridPosition(step.end_pos),
        motions: {
          [MotionColor.BLUE]: blueAttrs
            ? createMotionData({
                color: MotionColor.BLUE,
                motionType: parseMotionType(blueAttrs.motion_type),
                startLocation: parseLocation(blueAttrs.start_loc),
                endLocation: parseLocation(blueAttrs.end_loc),
                startOrientation: parseOrientation(blueAttrs.start_ori),
                endOrientation: parseOrientation(blueAttrs.end_ori),
                rotationDirection: parseRotationDirection(blueAttrs.prop_rot_dir),
                turns: parseTurns(blueAttrs.turns),
                isVisible: true,
                propType: PropType.STAFF,
                arrowLocation: parseLocation(blueAttrs.start_loc) || GridLocation.NORTH,
                gridMode,
              })
            : undefined,
          [MotionColor.RED]: redAttrs
            ? createMotionData({
                color: MotionColor.RED,
                motionType: parseMotionType(redAttrs.motion_type),
                startLocation: parseLocation(redAttrs.start_loc),
                endLocation: parseLocation(redAttrs.end_loc),
                startOrientation: parseOrientation(redAttrs.start_ori),
                endOrientation: parseOrientation(redAttrs.end_ori),
                rotationDirection: parseRotationDirection(redAttrs.prop_rot_dir),
                turns: parseTurns(redAttrs.turns),
                isVisible: true,
                propType: PropType.STAFF,
                arrowLocation: parseLocation(redAttrs.start_loc) || GridLocation.SOUTH,
                gridMode,
              })
            : undefined,
        },
        beatNumber: Number(step.beat || index + 1),
        duration: 1.0,
        blueReversal: false,
        redReversal: false,
        isBlank: false,
      } as BeatData;
    });

    return { beats, startPosition };
  }

  // Update parsed beats when current sequence changes
  $effect(() => {
    if (currentSequence?.fullMetadata?.sequence) {
      const gridMode = currentSequence.gridMode === "box" ? GridMode.BOX : GridMode.DIAMOND;
      const { beats, startPosition } = convertRawToBeats(
        currentSequence.word,
        currentSequence.fullMetadata.sequence,
        gridMode
      );
      parsedBeats = beats;
      parsedStartPosition = startPosition;
      selectedBeatNumber = null;
    } else {
      parsedBeats = [];
      parsedStartPosition = null;
      selectedBeatNumber = null;
    }
  });

  function handleBeatClick(beatNumber: number) {
    selectedBeatNumber = selectedBeatNumber === beatNumber ? null : beatNumber;
  }


  onMount(async () => {
    // Initialize Firestore
    try {
      firestore = await getFirestoreInstance();
      console.log("Firestore initialized for CAP labeler");
    } catch (error) {
      console.error("Failed to initialize Firestore:", error);
    }

    // Load sequences
    try {
      const response = await fetch("/data/sequence-index.json");
      const data = await response.json();
      sequences = data.sequences || [];
    } catch (error) {
      console.error("Failed to load sequences:", error);
    }

    // Load saved labels from Firebase first, fall back to localStorage
    if (firestore) {
      try {
        const snapshot = await getDocs(collection(firestore, CAP_LABELS_COLLECTION));
        if (!snapshot.empty) {
          const firebaseLabels = new Map<string, LabeledSequence>();
          snapshot.forEach((docSnap) => {
            firebaseLabels.set(docSnap.id, docSnap.data() as LabeledSequence);
          });
          labels = firebaseLabels;
          console.log(`Loaded ${labels.size} labels from Firebase`);
        } else {
          // Fall back to localStorage
          const saved = localStorage.getItem("cap-labels");
          if (saved) {
            const parsed = JSON.parse(saved);
            labels = new Map(Object.entries(parsed));
            console.log(`Loaded ${labels.size} labels from localStorage`);
          }
        }
      } catch (error) {
        console.error("Failed to load from Firebase, using localStorage:", error);
        const saved = localStorage.getItem("cap-labels");
        if (saved) {
          const parsed = JSON.parse(saved);
          labels = new Map(Object.entries(parsed));
        }
      }
    } else {
      // No Firestore, use localStorage
      const saved = localStorage.getItem("cap-labels");
      if (saved) {
        const parsed = JSON.parse(saved);
        labels = new Map(Object.entries(parsed));
        console.log(`Loaded ${labels.size} labels from localStorage (no Firestore)`);
      }
    }

    loading = false;
  });

  async function saveLabels() {
    // Save to localStorage as backup
    const obj = Object.fromEntries(labels);
    localStorage.setItem("cap-labels", JSON.stringify(obj));
  }

  // Save a single label to Firebase
  async function saveLabelToFirebase(word: string, label: LabeledSequence) {
    if (!firestore) {
      console.warn("Firestore not initialized, skipping save");
      return;
    }
    syncStatus = "syncing";
    try {
      await setDoc(doc(firestore, CAP_LABELS_COLLECTION, word), {
        ...label,
        updatedAt: new Date().toISOString(),
      });
      syncStatus = "synced";
      console.log(`Saved label for "${word}" to Firebase`);
    } catch (error) {
      console.error("Failed to save to Firebase:", error);
      syncStatus = "error";
    }
  }

  // Delete a label from Firebase
  async function deleteLabelFromFirebase(word: string) {
    if (!firestore) {
      console.warn("Firestore not initialized, skipping delete");
      return;
    }
    syncStatus = "syncing";
    try {
      await deleteDoc(doc(firestore, CAP_LABELS_COLLECTION, word));
      syncStatus = "synced";
      console.log(`Deleted label for "${word}" from Firebase`);
    } catch (error) {
      console.error("Failed to delete from Firebase:", error);
      syncStatus = "error";
    }
  }

  // Sync all localStorage labels to Firebase
  async function syncLocalStorageToFirebase() {
    if (!firestore) {
      alert("Firestore not initialized yet. Please wait and try again.");
      return;
    }

    const saved = localStorage.getItem("cap-labels");
    if (!saved) {
      console.log("No localStorage labels to sync");
      alert("No labels in localStorage to sync");
      return;
    }

    const parsed = JSON.parse(saved);
    const entries = Object.entries(parsed);

    if (entries.length === 0) {
      console.log("No labels to sync");
      alert("No labels to sync");
      return;
    }

    syncStatus = "syncing";
    console.log(`Syncing ${entries.length} labels to Firebase...`);

    let successCount = 0;
    for (const [word, label] of entries) {
      try {
        await setDoc(doc(firestore, CAP_LABELS_COLLECTION, word), {
          ...(label as LabeledSequence),
          updatedAt: new Date().toISOString(),
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to sync "${word}":`, error);
      }
    }

    syncStatus = successCount === entries.length ? "synced" : "error";
    console.log(`Synced ${successCount}/${entries.length} labels to Firebase`);
    alert(`Synced ${successCount}/${entries.length} labels to Firebase`);
  }

  function toggleComponent(id: ComponentId) {
    if (isFreeform) {
      isFreeform = false;
    }
    const newSet = new Set(selectedComponents);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    selectedComponents = newSet;
  }

  function setFreeform() {
    isFreeform = true;
    selectedComponents = new Set();
  }

  function resetSelection() {
    selectedComponents = new Set();
    isFreeform = false;
    pendingDesignations = [];
    notes = "";
  }

  // Add current selection as a designation (for multiple designations)
  function addDesignation() {
    if (selectedComponents.size === 0) return;

    const designation: CAPDesignation = {
      components: Array.from(selectedComponents),
      capType: derivedCapType,
    };

    // Check if this exact combination already exists
    const exists = pendingDesignations.some(
      d => d.components.sort().join(",") === designation.components.sort().join(",")
    );

    if (!exists) {
      pendingDesignations = [...pendingDesignations, designation];
    }

    // Clear selection for next designation
    selectedComponents = new Set();
  }

  // Remove a pending designation
  function removeDesignation(index: number) {
    pendingDesignations = pendingDesignations.filter((_, i) => i !== index);
  }

  async function labelSequence() {
    if (!currentSequence) return;
    if (!isFreeform && pendingDesignations.length === 0 && selectedComponents.size === 0) return;

    // If there's a current selection, add it first
    if (selectedComponents.size > 0) {
      addDesignation();
    }

    const label: LabeledSequence = {
      word: currentSequence.word,
      designations: isFreeform ? [] : pendingDesignations,
      isFreeform,
      labeledAt: new Date().toISOString(),
      notes: notes,
    };

    labels.set(currentSequence.word, label);
    labels = new Map(labels); // Trigger reactivity
    saveLabels();

    // Save to Firebase
    await saveLabelToFirebase(currentSequence.word, label);

    // Reset and auto-advance
    resetSelection();
    if (currentIndex < filteredSequences.length - 1) {
      currentIndex++;
    }
  }

  // Copy sequence JSON to clipboard (includes current designations)
  async function copySequenceJson() {
    if (!currentSequence) return;

    // Find the full sequence data from the raw JSON
    const response = await fetch("/data/sequence-index.json");
    const data = await response.json();
    const fullSeq = data.sequences?.find((s: SequenceEntry) => s.word === currentSequence.word);

    if (fullSeq) {
      // Build current designations (pending + current selection if any)
      const allDesignations = [...pendingDesignations];
      if (selectedComponents.size > 0) {
        allDesignations.push({
          components: Array.from(selectedComponents),
          capType: derivedCapType,
        });
      }

      // Create export object with designations
      const exportData = {
        ...fullSeq,
        _myDesignations: isFreeform
          ? { isFreeform: true, designations: [] }
          : {
              isFreeform: false,
              designations: allDesignations.map(d => ({
                components: d.components,
                capType: d.capType,
                humanReadable: formatDesignation(d)
              }))
            },
        _notes: notes || undefined,
      };

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      copiedToast = true;
      setTimeout(() => copiedToast = false, 2000);
    }
  }

  function skipSequence() {
    resetSelection();
    if (currentIndex < filteredSequences.length - 1) {
      currentIndex++;
    }
  }

  function previousSequence() {
    resetSelection();
    if (currentIndex > 0) {
      currentIndex--;
    }
  }

  async function removeLabel() {
    if (!currentSequence) return;
    labels.delete(currentSequence.word);
    labels = new Map(labels);
    saveLabels();
    await deleteLabelFromFirebase(currentSequence.word);
  }

  function exportLabels() {
    const data = Object.fromEntries(labels);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cap-labels-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importLabels(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        labels = new Map(Object.entries(data));
        saveLabels();
      } catch (error) {
        console.error("Failed to import labels:", error);
      }
    };
    reader.readAsText(file);
  }
</script>

<div class="labeler-page">
  <header class="header">
    <h1>CAP Type Labeler</h1>
    <div class="stats">
      <span class="stat">{stats.labeled} labeled</span>
      <span class="stat">{stats.remaining} remaining</span>
      <span class="stat">{stats.total} total circular</span>
      <span class="sync-status" class:syncing={syncStatus === "syncing"} class:error={syncStatus === "error"}>
        {#if syncStatus === "syncing"}
          ⟳ Syncing...
        {:else if syncStatus === "error"}
          ⚠ Sync error
        {:else}
          ✓ Firebase
        {/if}
      </span>
    </div>
  </header>

  <div class="controls-bar">
    <div class="filter-chips">
      <button
        class="filter-chip"
        class:active={filterMode === "unlabeled"}
        onclick={() => filterMode = "unlabeled"}
      >
        Unlabeled
      </button>
      <button
        class="filter-chip"
        class:active={filterMode === "labeled"}
        onclick={() => filterMode = "labeled"}
      >
        Labeled
      </button>
      <button
        class="filter-chip"
        class:active={filterMode === "all"}
        onclick={() => filterMode = "all"}
      >
        All
      </button>
    </div>

    <div class="io-controls">
      <button class="btn-secondary" onclick={() => (showExport = !showExport)}>
        Import/Export
      </button>
    </div>
  </div>

  {#if showExport}
    <div class="export-panel">
      <button class="btn-primary" onclick={exportLabels}>
        Export Labels JSON
      </button>
      <label class="btn-secondary">
        Import Labels
        <input
          type="file"
          accept=".json"
          onchange={importLabels}
          style="display: none"
        />
      </label>
      <button class="btn-sync" onclick={syncLocalStorageToFirebase}>
        ↑ Sync localStorage → Firebase
      </button>
    </div>
  {/if}

  {#if loading}
    <div class="loading">Loading sequences...</div>
  {:else if !currentSequence}
    <div class="empty">
      {#if filterMode === "unlabeled"}
        🎉 All circular sequences have been labeled!
      {:else}
        No sequences match the current filter.
      {/if}
    </div>
  {:else}
    <div class="main-content">
      <!-- Sequence Preview -->
      <div class="sequence-preview">
        <div class="sequence-header">
          <div class="sequence-info">
            <h2>{currentSequence.word}</h2>
            <div class="meta">
              <span>Length: {currentSequence.sequenceLength}</span>
              <span>Grid: {currentSequence.gridMode}</span>
              <span>Current: {currentSequence.capType || "none"}</span>
            </div>
          </div>
          <button class="copy-json-btn" onclick={copySequenceJson}>
            {copiedToast ? "✓ Copied!" : "Copy JSON"}
          </button>
        </div>

        <!-- BeatGrid with real Pictographs -->
        {#if parsedBeats.length > 0}
          <div class="beat-grid-wrapper">
            <BeatGrid
              beats={parsedBeats}
              startPosition={parsedStartPosition}
              onBeatClick={handleBeatClick}
              {selectedBeatNumber}
            />
          </div>
        {:else if currentThumbnailUrl}
          <!-- Fallback to thumbnail if no beat data -->
          <img
            src={currentThumbnailUrl}
            alt={currentSequence.word}
            class="thumbnail"
          />
        {:else}
          <div class="no-thumbnail">No beat data available</div>
        {/if}

        {#if currentLabel}
          <div class="current-label">
            <strong>Labeled as:</strong>
            {#if currentLabel.isFreeform}
              <span class="freeform-tag">Freeform</span>
            {:else if currentLabel.designations?.length > 0}
              <div class="label-designations">
                {#each currentLabel.designations as d, i}
                  <span class="designation-tag">
                    {formatDesignation(d)}
                    <span class="designation-type">({d.capType})</span>
                  </span>
                  {#if i < currentLabel.designations.length - 1}
                    <span class="designation-or">OR</span>
                  {/if}
                {/each}
              </div>
            {:else}
              Freeform
            {/if}
            {#if currentLabel.notes}
              <div class="label-notes">Notes: {currentLabel.notes}</div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Labeling Controls -->
      <div class="labeling-section">
        <h3>Select CAP Components:</h3>

        <!-- Base component checkboxes -->
        <div class="component-grid">
          {#each BASE_COMPONENTS as component}
            <button
              class="component-btn"
              class:selected={selectedComponents.has(component.id)}
              onclick={() => toggleComponent(component.id)}
            >
              <span class="component-name">{component.label}</span>
              <span class="component-desc">{component.description}</span>
            </button>
          {/each}
        </div>

        <!-- Current selection display -->
        <div class="selection-display">
          <span class="selection-label">Current:</span>
          <span class="selection-value" class:empty={!isFreeform && selectedComponents.size === 0}>
            {selectionLabel}
          </span>
          {#if derivedCapType && !isFreeform}
            <span class="derived-type">→ {derivedCapType}</span>
          {/if}
          {#if selectedComponents.size > 0}
            <button class="add-another-btn" onclick={addDesignation}>
              + Add as designation
            </button>
          {/if}
        </div>

        <!-- Pending designations (multiple) -->
        {#if pendingDesignations.length > 0}
          <div class="pending-designations">
            <span class="pending-label">Designations:</span>
            {#each pendingDesignations as d, i}
              <div class="pending-tag">
                <span>{formatDesignation(d)}</span>
                <button class="remove-btn" onclick={() => removeDesignation(i)}>×</button>
              </div>
              {#if i < pendingDesignations.length - 1}
                <span class="or-divider">OR</span>
              {/if}
            {/each}
          </div>
        {/if}

        <!-- Action buttons -->
        <div class="action-buttons">
          <button
            class="freeform-btn"
            class:selected={isFreeform}
            onclick={setFreeform}
          >
            Freeform (no pattern)
          </button>

          <button
            class="save-btn"
            onclick={labelSequence}
            disabled={!isFreeform && pendingDesignations.length === 0 && selectedComponents.size === 0}
          >
            Save & Next
          </button>
        </div>

        <div class="notes-section">
          <label>
            Notes (optional):
            <input
              type="text"
              bind:value={notes}
              placeholder="Any observations about this sequence..."
            />
          </label>
        </div>

        <div class="navigation">
          <button
            class="btn-nav"
            onclick={previousSequence}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>
          <span class="position">
            {currentIndex + 1} / {filteredSequences.length}
          </span>
          <button class="btn-nav" onclick={skipSequence}>
            Skip →
          </button>
        </div>

        {#if currentLabel}
          <button class="btn-danger" onclick={removeLabel}>
            Remove Label
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .labeler-page {
    min-height: 100vh;
    background: #0f0f1a;
    color: #fff;
    padding: 20px;
    font-family: system-ui, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
  }

  .stats {
    display: flex;
    gap: 16px;
  }

  .stat {
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
  }

  .sync-status {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .sync-status.syncing {
    background: rgba(234, 179, 8, 0.2);
    color: #eab308;
    animation: pulse 1s infinite;
  }

  .sync-status.error {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .filter-chips {
    display: flex;
    gap: 8px;
  }

  .filter-chip {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
  }

  .filter-chip:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .filter-chip.active {
    background: rgba(99, 102, 241, 0.3);
    border-color: #6366f1;
    color: #fff;
  }

  .export-panel {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .btn-sync {
    padding: 10px 16px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 6px;
    color: #22c55e;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
  }

  .btn-sync:hover {
    background: rgba(34, 197, 94, 0.3);
  }

  .loading,
  .empty {
    text-align: center;
    padding: 60px;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
  }

  .main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .sequence-preview {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
  }

  .sequence-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .sequence-info h2 {
    margin: 0 0 12px;
    font-size: 28px;
  }

  .meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .copy-json-btn {
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .copy-json-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .beat-grid-wrapper {
    width: 100%;
    min-height: 300px;
    max-height: 500px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    padding: 16px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .thumbnail {
    width: 100%;
    max-width: 500px;
    border-radius: 8px;
    background: #1a1a2e;
  }

  .no-thumbnail {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.4);
  }

  .current-label {
    margin-top: 16px;
    padding: 12px;
    background: rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    font-size: 14px;
  }

  .label-notes {
    margin-top: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .label-type {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-family: monospace;
    margin-left: 8px;
  }

  .label-designations {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .designation-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(34, 197, 94, 0.2);
    border-radius: 4px;
    font-size: 13px;
  }

  .designation-type {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    font-family: monospace;
  }

  .designation-or, .or-divider {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 600;
  }

  .freeform-tag {
    padding: 4px 10px;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 4px;
    font-size: 13px;
  }

  .labeling-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
  }

  .labeling-section h3 {
    margin: 0 0 16px;
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 12px;
  }

  .component-btn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
  }

  .component-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .component-btn.selected {
    background: rgba(34, 197, 94, 0.25);
    border-color: #22c55e;
  }

  .component-name {
    font-size: 16px;
    font-weight: 600;
  }

  .component-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .selection-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .selection-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .selection-value {
    font-size: 15px;
    font-weight: 600;
    color: #22c55e;
  }

  .selection-value.empty {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 400;
  }

  .derived-type {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-family: monospace;
  }

  .add-another-btn {
    padding: 6px 12px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 4px;
    color: #22c55e;
    cursor: pointer;
    font-size: 12px;
    margin-left: auto;
    transition: all 0.15s;
  }

  .add-another-btn:hover {
    background: rgba(34, 197, 94, 0.3);
  }

  .pending-designations {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .pending-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-right: 4px;
  }

  .pending-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(34, 197, 94, 0.25);
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
  }

  .remove-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0 2px;
    font-size: 16px;
    line-height: 1;
  }

  .remove-btn:hover {
    color: #ef4444;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .freeform-btn {
    flex: 1;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
  }

  .freeform-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .freeform-btn.selected {
    background: rgba(239, 68, 68, 0.25);
    border-color: #ef4444;
    color: #fff;
  }

  .save-btn {
    flex: 2;
    padding: 14px 20px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .save-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .notes-section {
    margin-top: 20px;
  }

  .notes-section label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
  }

  .notes-section input {
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    font-size: 14px;
  }

  .navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }

  .position {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .btn-nav,
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    border: none;
  }

  .btn-nav {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .btn-nav:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #6366f1;
    color: #fff;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.3);
    color: #fff;
    margin-top: 16px;
    width: 100%;
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.5);
  }
</style>
