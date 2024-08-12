<script lang="ts" context="module">
  import { rating, ratingLabels, ratingList } from "$lib/state.svelte";
  export interface cardProps {
    title: string;
    body: string;
    active?: boolean;
    rating?: rating;
    rate?: (rating: rating) => void;
    binaryMode?: boolean;
  }
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import RatingButtons from "./ratingButtons.svelte";

  let {
    title,
    body,
    rate,
    active = true,
    rating: cardRating,
    binaryMode = false,
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
    <p class="text-xs basis-0 shrink overflow-y-auto">
      {body}
    </p>
    <div
      class="card-actions bg-white border-t border-t-gray-300 -mx-8 -mb-8 overflow-clip"
    >
      <RatingButtons
        {rate}
        currentRating={cardRating}
        fullWidth={true}
        disabled={!active}
        hintNumbers={true}
        {binaryMode}
      />
    </div>
  </div>
</div>

<style lang="postcss">
  .card-outer {
    @apply card overflow-clip border border-gray-300 bg-base-200 max-w-sm text-base-content max-h-screen transition max-w-xs;
    aspect-ratio: 2/2.75;
    &.card-active {
      @apply opacity-100;
    }
  }
  label:has(input:focus-visible) {
    @apply ring ring-gray-300;
  }
</style>
