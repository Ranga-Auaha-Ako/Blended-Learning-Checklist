<script lang="ts">
  import {
    type checklistItem,
    levelItemMap,
    levelItemMapReverse,
  } from "$lib/datasource/checklist";
  import { appState, ratingLabels } from "$lib/state.svelte";
  import { slide } from "svelte/transition";
  interface rowProps {
    idx?: number;
    item: checklistItem;
    level: keyof typeof appState;
  }
  let { idx, item, level }: rowProps = $props();

  const shouldShowLevel = (rowLevel: keyof typeof appState) => {
    const levels = ["quick", "detailed", "comprehensive"] as const;
    return levels.indexOf(rowLevel) < levels.indexOf(level);
  };

  const itemLevel = (item: checklistItem) => {
    return levelItemMapReverse[item.type] as keyof typeof appState;
  };

  const rowLevel = levelItemMapReverse[item.type];

  const rating =
    rowLevel === level ? appState[rowLevel].progress[item.name] : null;

  let collapsed = $state(!shouldShowLevel(itemLevel(item)));
</script>

<div class:expanded={!collapsed}>
  <button
    class="row text-left w-full hover:bg-base-200 transition"
    onclick={() => {
      collapsed = !collapsed;
    }}
  >
    <div class="idx">{idx || ""}</div>
    <div class="name">{item.name}</div>
    <div class="rating">
      {rating ? ratingLabels[rating] : ""}
    </div>
  </button>
  {#if !collapsed}
    <div transition:slide>
      {#if item.description}
        <div class="row !py-0">
          <div class="name !col-start-2 text-xs italic">{item.description}</div>
        </div>
      {/if}
      {#if item.type === "standard"}
        {#each item.criteria as criterion}
          <svelte:self item={criterion} {level} />
        {/each}
      {:else if item.type === "criteria"}
        {#each item.indicators as indicator}
          <svelte:self item={indicator} {level} />
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  .row {
    @apply grid grid-cols-12 gap-2 px-8 py-4;
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
</style>
