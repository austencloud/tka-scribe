<!--
LetterTypeCard.svelte - Card for selecting letter types (freeform mode)
Shows current letter type selection and opens modal for detailed selection when clicked
-->
<script lang="ts">
  import { LetterType } from "$shared";
  import LetterTypeModal from "../modals/LetterTypeModal.svelte";
  import BaseCard from "./BaseCard.svelte";

  let {
    currentLetterTypes,
    onLetterTypesChange,
    // 🎨 ENHANCED: Cool neutral gradient with subtle shine
    color = "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
    shadowColor = "220deg 30% 70%", // Soft neutral glow
    gridColumnSpan = 2,
    cardIndex = 0
  } = $props<{
    currentLetterTypes: Set<LetterType>;
    onLetterTypesChange: (letterTypes: Set<LetterType>) => void;
    color?: string;
    shadowColor?: string;
    gridColumnSpan?: number;
    cardIndex?: number;
  }>();

  let showModal = $state(false);

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function handleLetterTypesSelect(letterTypes: Set<LetterType>) {
    onLetterTypesChange(letterTypes);
    closeModal();
  }

  // Format letter types display
  const letterTypesDisplay = $derived.by(() => {
    const count = currentLetterTypes.size;
    if (count === 6) return "All Types";
    if (count === 1) {
      const type = Array.from(currentLetterTypes)[0] as string;
      return `Type ${type.replace('TYPE', '')}`;
    }
    return `${count} Types`;
  });

  const letterTypesDescription = $derived.by(() => {
    const count = currentLetterTypes.size;
    if (count === 6) return "All letter types enabled";
    if (count === 1) return "Single type selected";
    return `${count} types selected`;
  });
</script>

<BaseCard
  title="Letter Types"
  currentValue={letterTypesDisplay}
  {color}
  {shadowColor}
  {gridColumnSpan}
  {cardIndex}
  onClick={openModal}
/>

{#if showModal}
  <LetterTypeModal
    {currentLetterTypes}
    onLetterTypesSelect={handleLetterTypesSelect}
    onClose={closeModal}
  />
{/if}
