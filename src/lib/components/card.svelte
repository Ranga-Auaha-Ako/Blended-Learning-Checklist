<script lang="ts" context="module">
  import { rating, ratingLabels, ratingList } from "$lib/state.svelte";
  import StarIcon from "virtual:icons/material-symbols/star-rate-outline-rounded";
  import StarIconFilled from "virtual:icons/material-symbols/star-rate-rounded";
  export interface cardProps {
    title: string;
    body: string;
    active?: boolean;
    rating?: rating;
    rate?: (rating: rating) => void;
  }
</script>

<script lang="ts">
  import { fade, fly } from "svelte/transition";

  let {
    title,
    body,
    rate,
    active = true,
    rating: cardRating,
  }: cardProps = $props();
</script>

<div
  class="card-outer"
  class:card-active={active}
  class:pointer-events-none={!active}
  out:fly={{ duration: 300, x: 50 }}
  in:fly={{ duration: active ? 300 : 0, x: -50 }}
>
  <div class="card-body">
    <h2 class="card-title text-base">
      {title}
    </h2>
    <p class="text-sm basis-0 shrink overflow-y-auto">
      {body}
    </p>
    <div
      class="card-actions bg-white border-t border-t-gray-300 grid grid-flow-col gap-0 -mx-8 -mb-8 overflow-clip"
    >
      {#each ratingList as rateitem}
        <!-- Pointer down event to speed up selection system -->
        <label
          class="rating-button"
          class:rating-active={rateitem === cardRating}
          onpointerdown={() => rate && rate(rateitem)}
        >
          <input
            class="absolute opacity-0 focus-visible:opacity-100 translate-y-1 scale-125"
            type="radio"
            value={rateitem}
            bind:group={cardRating}
            onkeypress={(e) => {
              if (e.key === "Enter" && rate) {
                rate(rateitem);
              }
            }}
          />
          <div class="w-5 h-5">
            {#if rateitem === cardRating}
              <StarIconFilled />
            {:else}
              <StarIcon />
            {/if}
          </div>
          <span class="text-xs">
            {ratingLabels[rateitem]}
          </span>
        </label>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  .card-outer {
    @apply card overflow-clip border border-gray-300 bg-base-200 max-w-sm text-base-content max-h-screen transition max-w-xs;
    aspect-ratio: 2/3.1;
    &.card-active {
      @apply opacity-100;
    }
  }
  .rating-button {
    @apply flex flex-col items-center hover:bg-gray-100 p-2 transition hover:scale-105 active:scale-100;
    &:first-child {
      @apply pl-0;
    }
    &:last-child {
      @apply pr-0;
    }
    &.rating-active {
      @apply bg-gray-100;
    }
  }
  label:has(input:focus-visible) {
    @apply ring ring-gray-300;
  }
</style>
