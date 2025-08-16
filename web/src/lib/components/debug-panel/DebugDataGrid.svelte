<script lang="ts">
  interface DebugItem {
    label: string;
    value: string | number | boolean;
    type?: 'text' | 'number' | 'boolean' | 'angle' | 'coordinate' | 'percentage';
    className?: string;
  }

  interface Props {
    items: DebugItem[];
    columns?: number;
  }

  let { items, columns = 2 }: Props = $props();

  function formatValue(item: DebugItem): string {
    const { value, type } = item;
    
    if (value === undefined || value === null) return "N/A";
    
    switch (type) {
      case 'boolean':
        return value ? "✅ Yes" : "❌ No";
      case 'angle':
        return typeof value === 'number' ? `${value.toFixed(2)}°` : String(value);
      case 'coordinate':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      case 'percentage':
        return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : String(value);
      case 'number':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      default:
        return String(value);
    }
  }

  function getValueClass(item: DebugItem): string {
    const baseClass = 'value';
    if (item.className) return `${baseClass} ${item.className}`;
    
    switch (item.type) {
      case 'boolean':
        return `${baseClass} value-boolean`;
      case 'angle':
        return `${baseClass} value-angle`;
      case 'coordinate':
        return `${baseClass} value-coordinate`;
      case 'percentage':
        return `${baseClass} value-percentage`;
      case 'number':
        return `${baseClass} value-number`;
      default:
        return baseClass;
    }
  }
</script>

<div class="debug-grid" style="grid-template-columns: repeat({columns}, 1fr);">
  {#each items as item}
    <div class="debug-item">
      <span class="label">{item.label}:</span>
      <span class={getValueClass(item)}>{formatValue(item)}</span>
    </div>
  {/each}
</div>

<style>
  .debug-grid {
    display: grid;
    gap: 12px 20px;
    margin-bottom: 16px;
  }

  .debug-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .label {
    color: #c7d2fe;
    font-weight: 500;
    margin-right: 8px;
  }

  .value {
    font-family: "Courier New", monospace;
    font-weight: 600;
    text-align: right;
  }

  .value-boolean {
    color: #a78bfa;
  }

  .value-angle {
    color: #60a5fa;
  }

  .value-coordinate {
    color: #34d399;
  }

  .value-percentage {
    color: #fbbf24;
  }

  .value-number {
    color: #60a5fa;
  }

  /* Default text value */
  .value:not([class*="value-"]) {
    color: #e2e8f0;
  }
</style>
