<script lang="ts">
  /**
   * UserSearchBar
   * Search input for filtering users
   */

  interface Props {
    value: string;
    onchange: (value: string) => void;
  }

  let { value, onchange }: Props = $props();
</script>

<div class="search-box">
  <i class="fas fa-search"></i>
  <input
    type="text"
    placeholder="Search users..."
    {value}
    oninput={(e) => onchange(e.currentTarget.value)}
  />
</div>

<style>
  .search-box {
    flex: 1;
    min-width: 200px;
    max-width: 400px;
    position: relative;
  }

  .search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }

  .search-box input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 14px;
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  @media (max-width: 768px) {
    .search-box {
      max-width: none;
    }
  }
</style>
