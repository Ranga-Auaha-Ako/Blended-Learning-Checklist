<script lang="ts">
  import {
    appState,
    quickCalculatedAvg,
    rating,
    ratingList,
    type modes,
  } from "$lib/state.svelte";
  import checklist, {
    type checklistItem,
    levelItemMapReverse,
  } from "$lib/datasource/checklist";
  import ResultsRow from "./resultsRow.svelte";

  interface resultsTableProps {
    level: modes;
  }

  let { level }: resultsTableProps = $props();

  let calcAvg = $derived.by(
    quickCalculatedAvg.bind(undefined, level === "quick")
  );

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
    [...ratingList, rating.maybe].map((rating) => {
      return sortedStandards.filter(
        (s) => Math.round(calcAvg[s.name]?.rating) === rating
      );
    })
  );
</script>

<div class="ratingTables">
  {#each splitByRating as items, i}
    {#if items.length > 0}
      {@const rating = ratingList[i]}
      <h2 class="tableTitle">
        {#if rating === 0}Not met
        {:else if rating === 1}Not met but...
        {:else if rating === 2}Met but...
        {:else if rating === 3}Met
        {:else}Maybe
        {/if}
        ({items.length})
      </h2>
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
    @apply flex flex-col gap-4 @container;
    .resultsTable {
      /*
        no = 0
        nobut = 1
        yesbut = 2
        yes = 3
       */
      &.rating-0 {
        @apply bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 border-2;
      }
      &.rating-1 {
        @apply bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 border-2;
      }
      &.rating-2 {
        @apply bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 border-2;
      }
      &.rating-3 {
        @apply bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 border-2;
      }
    }
  }
  .tableTitle {
    @apply text-lg font-semibold mt-3;
  }
  .resultsTable {
    @apply bg-base-100 rounded-box overflow-clip shadow w-full h-full text-sm;
    > .table-head {
      @apply grid grid-cols-12 gap-2 px-4 @md:px-8 py-4;
    }
    .table-head {
      @apply font-semibold opacity-80 border-b border-black border-opacity-5 text-xs;

      .idx {
        @apply col-span-2 @md:col-span-1;
      }
      .name {
        @apply hidden @md:block col-span-10;
      }
      .rating {
        @apply col-span-3 col-start-10 @md:col-start-auto @md:col-span-1 justify-self-end;
      }
    }
  }
</style>
