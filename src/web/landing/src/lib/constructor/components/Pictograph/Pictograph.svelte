<!-- Placeholder Pictograph component -->
<script lang="ts">
  export let pictographData = {};
  export let size = 100;
</script>

<div class="pictograph-placeholder" style="width: {size}px; height: {size}px;">
  <div class="placeholder-content">
    Pictograph
  </div>
</div>

<style>
  .pictograph-placeholder {
    border: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  .placeholder-content {
    color: #666;
    font-size: 12px;
    text-align: center;
  }
</style>
