<!-- src/lib/components/OptionPicker/components/messages/LoadingMessage.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import LoadingSpinner from '../../../MainWidget/loading/LoadingSpinner.svelte';
  </script>
  
  <div class="message-container loading" transition:fade={{ duration: 200 }}>
	<LoadingSpinner />
	<p>Loading options...</p>
  </div>
  
  <style>
	.message-container {
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	  width: 100%;
	  height: 100%;
	  padding: 2rem;
	  text-align: center;
	  color: #6b7280;
	  box-sizing: border-box;
	  font-size: 1.1rem;
	  position: absolute;
	  top: 0;
	  left: 0;
	  background-color: transparent;
	  border-radius: 8px;
	}
	
	.message-container.loading p {
	  margin-top: 1rem;
	}
  </style>