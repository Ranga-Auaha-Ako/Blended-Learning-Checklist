<script lang="ts">
  import { appState } from "$lib/state.svelte";
  import checklist, {
    type checklistItem,
    levelItemMapReverse,
  } from "$lib/datasource/checklist";
  import ResultsRow from "./resultsRow.svelte";

  interface resultsTableProps {
    level: keyof typeof appState;
  }

  let { level }: resultsTableProps = $props();
</script>

<div class="resultsTable">
  <div class="table-head">
    <div class="idx">#</div>
    <div class="name">Name</div>
    <div class="rating">Rating</div>
  </div>
  <div class="table-body">
    {#each checklist.standards as standard, i}
      <ResultsRow idx={i + 1} item={standard} {level} />
    {/each}
  </div>
</div>

<style lang="postcss">
  .resultsTable {
    @apply bg-base-100 rounded-box shadow w-full h-full text-sm;
    > .table-head {
      @apply grid grid-cols-12 gap-2 px-8 py-4;
    }
    .table-head {
      @apply font-semibold opacity-80 border-b border-base-200 text-xs;

      .idx {
        @apply col-span-1;
      }
      .name {
        @apply col-span-10;
      }
      .rating {
        @apply col-span-1;
      }
    }
  }
</style>
