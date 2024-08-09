<script lang="ts">
  import {
    appState,
    quickCalculatedAvg,
    rating,
    ratingList,
  } from "$lib/state.svelte";
  import checklist, {
    type checklistItem,
    levelItemMapReverse,
  } from "$lib/datasource/checklist";
  import ResultsRow from "./resultsRow.svelte";

  interface resultsTableProps {
    level: keyof typeof appState;
  }

  let { level }: resultsTableProps = $props();

  let calcAvg = $derived.by(quickCalculatedAvg);

  const sortedStandards = $derived(
    checklist.standards
      .map((s, idx) => ({
        ...s,
        index: idx,
      }))
      .sort((a, b) => {
        // Sort by rating
        const aRating = calcAvg[a.name]?.rating;
        const bRating = calcAvg[b.name]?.rating;
        // Lower rating first
        return aRating - bRating;
      })
  );

  const splitByRating = $derived(
    ratingList.map((rating) => {
      return sortedStandards.filter((s) => calcAvg[s.name]?.rating === rating);
    })
  );
</script>

<div class="ratingTables">
  {#each splitByRating as items, i}
    {#if items.length > 0}
      {@const rating = ratingList[i]}
      <div class="resultsTable rating-{rating}">
        <div class="table-head">
          <div class="idx">#</div>
          <div class="name">Name</div>
          <div class="rating">Rating</div>
        </div>
        <div class="table-body">
          {#each items as standard (standard.index)}
            <ResultsRow idx={standard.index + 1} item={standard} {level} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>

<style lang="postcss">
  .ratingTables {
    @apply flex flex-col gap-4;
    .resultsTable {
      /*
        no = 0
        nobut = 1
        yesbut = 2
        yes = 3
       */
      &.rating-0 {
        @apply bg-red-50 border-red-200 border-2;
      }
      &.rating-1 {
        @apply bg-orange-50 border-orange-200 border-2;
      }
      &.rating-2 {
        @apply bg-yellow-50 border-yellow-200 border-2;
      }
      &.rating-3 {
        @apply bg-green-50 border-green-200 border-2;
      }
    }
  }
  .resultsTable {
    @apply bg-base-100 rounded-box overflow-clip shadow w-full h-full text-sm;
    > .table-head {
      @apply grid grid-cols-12 gap-2 px-8 py-4;
    }
    .table-head {
      @apply font-semibold opacity-80 border-b border-black border-opacity-5 text-xs;

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
