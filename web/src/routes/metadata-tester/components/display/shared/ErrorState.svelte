<!-- Error State Component -->
<script lang="ts">
  interface Props {
    error: string;
    title?: string;
  }

  let { error, title = "❌ Extraction Error" }: Props = $props();
</script>

<div class="error-state">
  <h3>{title}</h3>
  <p>{error}</p>
</div>

<style>
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
  }

  .error-state h3 {
    margin: 0 0 15px 0;
    color: #f87171;
    font-size: 1.25rem;
  }

  .error-state p {
    margin: 8px 0 0 0;
    color: #9ca3af;
  }
</style>
