<script lang="ts">
    export let numBeats: number;
    export let currentLayout: { rows: number; cols: number };
    export let validLayouts: { rows: number; cols: number }[];

    export let onSequenceLengthChange: (e: CustomEvent<number>) => void;
    export let onLayoutChange: (e: CustomEvent<{ rows: number; cols: number }>) => void;

    const handleLayoutChange = (e: Event) => {
        const layout = validLayouts[(e.target as HTMLSelectElement).selectedIndex];
        onLayoutChange(new CustomEvent('layoutChange', { detail: layout }));
    };

    const handleSequenceLengthChange = (delta: number) => {
        onSequenceLengthChange(new CustomEvent('sequenceLengthChange', { detail: delta }));
    };
</script>

<div class="controls">
    <!-- Sequence Length Controls -->
    <div class="sequence-length">
        <label for="sequence-length">Length:</label>
        <button
            class="control-button"
            on:click={() => handleSequenceLengthChange(-1)}
        >
            -
        </button>
        <span id="sequence-length" class="length-display">{numBeats}</span>
        <button
            class="control-button"
            on:click={() => handleSequenceLengthChange(1)}
        >
            +
        </button>
    </div>

    <!-- Layout Selector -->
    <div class="layout-selector">
        <label for="layout-dropdown">Select Layout:</label>
        <select
            id="layout-dropdown"
            class="dropdown"
            on:change={handleLayoutChange}
        >
            {#each validLayouts as { rows, cols }}
                <option selected={rows === currentLayout.rows && cols === currentLayout.cols}>
                    {rows} x {cols}
                </option>
            {/each}
        </select>
    </div>
</div>

<style>
    .controls {
        display: flex;
        flex-direction: column;
        gap: 15px; /* Increase gap for better spacing */
        align-items: center; /* Center the controls */
    }

    .sequence-length,
    .layout-selector {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .control-button {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
        border-radius: 6px;
        border: 1px solid #ccc;
        cursor: pointer;
        background-color: #fff;
        transition: background-color 0.2s ease-in-out;
    }

    .control-button:hover {
        background-color: #e0e0e0;
    }

    .length-display {
        width: 50px;
        text-align: center;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .dropdown {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
    }
</style>
