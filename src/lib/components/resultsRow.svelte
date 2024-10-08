<script lang="ts">
  import {
    type checklistItem,
    levelItemMap,
    levelItemMapReverse,
  } from "$lib/datasource/checklist";
  import {
    appState,
    detailedCalculatedAvg,
    quickCalculatedAvg,
    rating,
    ratingLabels,
    type modes,
  } from "$lib/state.svelte";
  import { slide } from "svelte/transition";
  interface rowProps {
    idx?: number;
    item: checklistItem;
    level: modes;
    hideIndex?: boolean;
  }
  import MaterialSymbolsStarRateOutlineRounded from "virtual:icons/material-symbols/star-rate-outline-rounded";
  import MaterialSymbolsStarRateHalfRounded from "virtual:icons/material-symbols/star-rate-half-rounded";
  import MaterialSymbolsStarRateRounded from "virtual:icons/material-symbols/star-rate-rounded";
  let { idx, item, level, hideIndex }: rowProps = $props();

  const shouldShowLevel = (rowLevel: modes) => {
    const levels = ["quick", "detailed", "comprehensive"] as const;
    return levels.indexOf(rowLevel) < levels.indexOf(level);
  };

  const itemLevel = (item: checklistItem) => {
    return levelItemMapReverse[item.type] as modes;
  };

  const rowLevel = levelItemMapReverse[item.type];

  let currentRating =
    rowLevel === level
      ? appState.modes[rowLevel].progress[item.name]
      : undefined;
  // Use calculated fields for anything above "level"
  let shouldCalculate = false;
  switch (level) {
    case "comprehensive":
      if (rowLevel === "detailed" || rowLevel === "quick") {
        shouldCalculate = true;
      }
    case "detailed":
      if (rowLevel === "quick") {
        shouldCalculate = true;
      }
    default:
      break;
  }
  if (shouldCalculate && rowLevel === "detailed") {
    currentRating = detailedCalculatedAvg()[item.name]?.rating;
  } else if (shouldCalculate && rowLevel === "quick") {
    currentRating = quickCalculatedAvg()[item.name]?.rating;
  }

  let collapsed = $state(!shouldShowLevel(itemLevel(item)));
</script>

<div
  class:expanded={!collapsed}
  class:red={currentRating && Math.round(currentRating) === rating.no}
  class:orange={(currentRating && Math.round(currentRating) === rating.nobut) ||
    (currentRating && Math.round(currentRating) === rating.maybe)}
  class:yellow={currentRating && Math.round(currentRating) === rating.yesbut}
  class:green={currentRating && Math.round(currentRating) === rating.yes}
  class:hideIndex
>
  <button
    class="row text-left w-full bg-black bg-opacity-0 hover:bg-opacity-5 transition"
    onclick={() => {
      collapsed = !collapsed;
    }}
  >
    {#if !hideIndex}
      <div class="idx" title={idx ? `Standard ${idx}` : undefined}>
        {idx ? `${idx}.0` : ""}
      </div>
    {/if}
    <div class="name">{item.name}</div>
    <div class="rating">
      {#if !shouldCalculate}
        {currentRating !== undefined ? ratingLabels[currentRating] : ""}
      {:else if currentRating !== undefined}
        {@const roundedRating = Math.round((currentRating + 1) * 2) / 2}
        {@const isHalf = roundedRating % 1 > 0.1}
        <div class="flex gap-0 text-lg">
          {#each Array.from({ length: Math.floor(roundedRating) }) as _}
            <MaterialSymbolsStarRateRounded class="w-[1em] h-[1em] shrink-0" />
          {/each}
          {#if isHalf}
            <MaterialSymbolsStarRateHalfRounded
              class="w-[1em] h-[1em] shrink-0"
            />
          {/if}
          {#each Array.from({ length: 4 - Math.ceil(roundedRating) }) as _}
            <MaterialSymbolsStarRateOutlineRounded
              class="w-[1em] h-[1em] shrink-0"
            />
          {/each}
        </div>
      {/if}
    </div>
  </button>
  {#if !collapsed}
    <div transition:slide>
      {#if item.description}
        <div class="row !py-0">
          <div class="name text-xs italic" class:!col-start-2={!hideIndex}>
            {item.description}
          </div>
        </div>
      {/if}
      {#if item.type !== "indicator"}
        <div class="sub-rows">
          {#if item.type === "standard"}
            <h3 class="sub-title">Criteria</h3>
            {#each item.criteria as criterion}
              <svelte:self item={criterion} {level} hideIndex={true} />
            {/each}
          {:else if item.type === "criteria"}
            <h5 class="sub-title">Indicator</h5>
            {#each item.indicators as indicator}
              <svelte:self item={indicator} {level} hideIndex={true} />
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  .row {
    @apply grid grid-cols-12 gap-2 px-4 @md:px-8 py-4 border-t @md:border-t-0;
    .idx {
      @apply col-span-2 @md:col-span-1 font-mono text-xs @md:text-base;
    }
    .name {
      @apply col-span-12 order-2 @md:order-none @md:col-span-10 px-4 @md:px-0;
    }
    .rating {
      @apply col-span-3 col-start-10 @md:col-start-auto @md:col-span-1 text-xs @md:text-base justify-self-end;
    }
  }
  .expanded {
    @apply border-b border-base-200;
    @apply border-t;
    :global(& ~ .expanded) {
      @apply border-t-0;
    }
    &:first-child {
      @apply border-t-0;
    }
  }
  .sub-rows {
    @apply bg-base-100 bg-opacity-50 rounded-lg my-4 overflow-clip border-base-300 border;
    /* Custom padding to match the parent row */
    margin-left: calc(2rem + (100% - 4rem) * 0.08333);
    margin-right: 0.5rem;
    .sub-title {
      @apply font-semibold pl-4 pt-2 text-gray-500 dark:text-gray-400;
    }
  }

  .hideIndex {
    .row {
      @apply grid-cols-11;
    }
    .sub-rows {
      @apply ml-4;
    }
  }
  .red {
    .sub-rows {
      @apply border-red-200 dark:border-red-900;
      .sub-title {
        @apply text-red-700 dark:text-red-200;
      }
    }
  }
  .orange {
    .sub-rows {
      @apply border-orange-200 dark:border-orange-900;
      .sub-title {
        @apply text-orange-700 dark:text-orange-200;
      }
    }
  }
  .yellow {
    .sub-rows {
      @apply border-yellow-200 dark:border-yellow-900;
      .sub-title {
        @apply text-yellow-700 dark:text-yellow-200;
      }
    }
  }
  .green {
    .sub-rows {
      @apply border-green-200 dark:border-green-900;
      .sub-title {
        @apply text-green-700 dark:text-green-200;
      }
    }
  }
  :global(.sub-rows) .sub-rows {
    @apply bg-opacity-100 bg-base-100;
  }
</style>
