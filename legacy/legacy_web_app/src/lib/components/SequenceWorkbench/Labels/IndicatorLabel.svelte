<script>
  export let text = 'Indicator Label';
  export let width = 100; // Default width in pixels
  const minFontSize = 18; // Minimum font size in pixels

  $: fontSize = `${Math.max(width / 80, minFontSize)}px`; // Adjust the multiplier as needed
</script>

<div class="indicator-label" style="font-size: {fontSize};">
  {text}
</div>

<style>
  .indicator-label {
    text-align: center;
    font-weight: bold;
    
  }
</style>